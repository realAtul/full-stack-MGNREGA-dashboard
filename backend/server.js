import express from "express";
import axios from "axios";
import cors from "cors";
import cron from "node-cron";
import fs from "fs";
import { JSONFilePreset } from "lowdb/node";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "579b464db66ec23bdd000001e1ce8dd239b94236662d303835fbee2b";
const RESOURCE_ID = "ee03643a-ee4c-48c2-ac30-9f2ff26ab722";
const STATE = "UTTAR PRADESH";

if (!fs.existsSync("db.json")) {
    fs.writeFileSync("db.json", JSON.stringify({ records: [], lastSync: null }, null, 2));
}
const db = await JSONFilePreset("db.json", { records: [], lastSync: null });

async function fetchFromRemote(state, finYear = null, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`📡 Fetching from API (attempt ${attempt}/${retries})...`);
            const params = {
                "api-key": API_KEY,
                format: "json",
                "filters[state_name]": state,
                limit: 1000,
            };
            if (finYear) params["filters[fin_year]"] = finYear;

            const res = await axios.get(
                `https://api.data.gov.in/resource/${RESOURCE_ID}`,
                { params, timeout: 20000 }
            );

            console.log(`✅ Fetched ${res.data.records?.length || 0} records`);
            return res.data.records || [];
        } catch (err) {
            console.error(`❌ Attempt ${attempt} failed:`, err.message);
            if (attempt === retries) {
                console.error("All retry attempts exhausted");
                return [];
            }

            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
    }
    return [];
}

async function syncStateData(state, finYear = null) {
    try {
        console.log(`\n🔄 Starting sync for ${state}${finYear ? ` (${finYear})` : " (all years)"}...`);
        const records = await fetchFromRemote(state, finYear);

        if (records.length === 0) {
            console.log("⚠️ No records fetched from remote API");
            return { success: false, count: 0, cached: db.data.records.length };
        }


        const existing = db.data.records || [];
        const filtered = existing.filter(r =>
            !(r.state_name === state && (!finYear || r.fin_year === finYear))
        );


        const combined = [...filtered, ...records];


        const uniqueMap = new Map();
        combined.forEach(r => {
            const key = `${r.district_code}-${r.fin_year}`;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, r);
            }
        });

        db.data.records = Array.from(uniqueMap.values());
        db.data.lastSync = new Date().toISOString();

        await db.write();
        console.log(`✅ Sync completed! Total records in DB: ${db.data.records.length}`);
        console.log(`📊 New records added: ${records.length}`);

        return { success: true, count: records.length, total: db.data.records.length };
    } catch (err) {
        console.error("❌ Sync failed:", err.message);
        return { success: false, error: err.message, cached: db.data.records.length };
    }
}

function calculateDistrictStats(records) {
    const stats = {
        totalDistricts: 0,
        avgBudget: 0,
        avgWage: 0,
        avgWorkers: 0,
        topDistricts: [],
    };

    if (!records || records.length === 0) return stats;


    const districtMap = new Map();
    records.forEach(r => {
        if (!districtMap.has(r.district_code) ||
            districtMap.get(r.district_code).fin_year < r.fin_year) {
            districtMap.set(r.district_code, r);
        }
    });

    const latestRecords = Array.from(districtMap.values());
    stats.totalDistricts = latestRecords.length;


    const totalBudget = latestRecords.reduce((sum, r) => sum + (Number(r.Approved_Labour_Budget) || 0), 0);
    const totalWage = latestRecords.reduce((sum, r) => sum + (Number(r.Average_Wage_rate_per_day_per_person) || 0), 0);
    const totalWorkers = latestRecords.reduce((sum, r) => sum + (Number(r.Total_Individuals_Worked) || 0), 0);

    stats.avgBudget = totalBudget / stats.totalDistricts;
    stats.avgWage = totalWage / stats.totalDistricts;
    stats.avgWorkers = totalWorkers / stats.totalDistricts;


    stats.topDistricts = latestRecords
        .sort((a, b) => (Number(b.Approved_Labour_Budget) || 0) - (Number(a.Approved_Labour_Budget) || 0))
        .slice(0, 5)
        .map(r => ({
            name: r.district_name,
            name_hi: r.district_name_hi,
            code: r.district_code,
            budget: Number(r.Approved_Labour_Budget) || 0,
        }));

    return stats;
}

(async () => {
    console.log("\n🚀 ========================================");
    console.log("🚀 MGNREGA Server Starting...");
    console.log("🚀 ========================================\n");

    if (db.data.records.length > 0) {
        console.log(`📦 Found ${db.data.records.length} cached records`);
        console.log(`🕐 Last sync: ${db.data.lastSync || "Never"}`);
    } else {
        console.log("📦 No cached data found. Fetching from API...");
        try {
            await syncStateData(STATE);
        } catch (err) {
            console.error("❌ Initial sync failed:", err.message);
        }
    }
})();

cron.schedule("0 */6 * * *", async () => {
    console.log("\n⏰ ========================================");
    console.log("⏰ Scheduled sync started");
    console.log("⏰ ========================================\n");
    try {
        await syncStateData(STATE);
    } catch (err) {
        console.error("❌ Scheduled sync error:", err.message);
    }
});


app.get("/api/districts/:state", async (req, res) => {
    try {
        const state = decodeURIComponent(req.params.state);
        const finYear = req.query.fin_year;

        let records = db.data.records.filter(r => r.state_name === state);

        if (finYear) {
            records = records.filter(r => r.fin_year === finYear);
        }


        if (records.length === 0) {
            console.log("📡 No cached data, attempting remote fetch...");
            const remoteRecords = await fetchFromRemote(state, finYear, 2);
            if (remoteRecords.length > 0) {
                db.data.records.push(...remoteRecords);
                await db.write();
                records = remoteRecords;
            }
        }

        if (records.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No data found for this state",
                state: state,
                cached: db.data.records.length > 0
            });
        }

        res.json({
            success: true,
            count: records.length,
            data: records,
            lastSync: db.data.lastSync
        });
    } catch (err) {
        console.error("Error in /api/districts/:state:", err.message);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
});

app.get("/api/district/:state/:districtCode", async (req, res) => {
    try {
        const { state, districtCode } = req.params;
        const decodedState = decodeURIComponent(state);

        let records = db.data.records.filter(r =>
            r.state_name === decodedState &&
            r.district_code === districtCode
        );


        records.sort((a, b) => a.fin_year.localeCompare(b.fin_year));

        if (records.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No data found for this district",
                district_code: districtCode
            });
        }

        res.json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (err) {
        console.error("Error in /api/district/:state/:districtCode:", err.message);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
});

app.get("/api/stats/:state", async (req, res) => {
    try {
        const state = decodeURIComponent(req.params.state);
        const finYear = req.query.fin_year;

        let records = db.data.records.filter(r => r.state_name === state);

        if (finYear) {
            records = records.filter(r => r.fin_year === finYear);
        }

        const stats = calculateDistrictStats(records);

        res.json({
            success: true,
            state: state,
            finYear: finYear || "all",
            stats: stats,
            lastSync: db.data.lastSync
        });
    } catch (err) {
        console.error("Error in /api/stats/:state:", err.message);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
});

app.post("/api/sync", async (req, res) => {
    try {
        const { state, fin_year } = req.body;
        if (!state) {
            return res.status(400).json({
                success: false,
                message: "state is required"
            });
        }

        const result = await syncStateData(state, fin_year);
        res.json({
            success: result.success,
            message: result.success ? "Sync completed successfully" : "Sync failed",
            ...result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Sync failed",
            error: err.message
        });
    }
});

app.get("/api/health", (req, res) => {
    const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: {
            totalRecords: db.data.records.length,
            lastSync: db.data.lastSync,
            uniqueDistricts: new Set(db.data.records.map(r => r.district_code)).size,
            years: [...new Set(db.data.records.map(r => r.fin_year))].sort(),
        },
        server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
        }
    };
    res.json(health);
});

app.get("/api/years/:state", (req, res) => {
    try {
        const state = decodeURIComponent(req.params.state);
        const records = db.data.records.filter(r => r.state_name === state);
        const years = [...new Set(records.map(r => r.fin_year))].sort();

        res.json({
            success: true,
            state: state,
            years: years
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("\n🎉 ========================================");
    console.log(`🎉 Server running on http://localhost:${PORT}`);
    console.log(`📊 Total records: ${db.data.records.length}`);
    console.log(`🏛️  Unique districts: ${new Set(db.data.records.map(r => r.district_code)).size}`);
    console.log(`📅 Years available: ${[...new Set(db.data.records.map(r => r.fin_year))].sort().join(", ")}`);
    console.log("🎉 ========================================\n");
});