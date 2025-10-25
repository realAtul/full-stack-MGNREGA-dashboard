import React, { useMemo } from "react";
import { speak } from "../utils/speak";
import { formatNumber, formatLargeNumber } from "../utils/formatNumber";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { strings } from "../i18n";

export default function SummaryCard({ data = null, pastData = [], lang = "hi", stateStats = null }) {
    const t = strings[lang];


    const historicalData = useMemo(() => {
        if (!pastData || pastData.length === 0) return [];


        const uniqueMap = new Map();
        pastData.forEach(item => {
            if (!uniqueMap.has(item.fin_year)) {
                uniqueMap.set(item.fin_year, item);
            }
        });

        return Array.from(uniqueMap.values()).sort((a, b) =>
            a.fin_year.localeCompare(b.fin_year)
        );
    }, [pastData]);


    const chartData = useMemo(() => {
        return historicalData.map(item => ({
            year: item.fin_year.split('-')[0],
            budget: Math.round(Number(item.Approved_Labour_Budget || 0) / 10000000 * 10) / 10, // in crores
            wage: Math.round(Number(item.Average_Wage_rate_per_day_per_person || 0)),
            workers: Math.round(Number(item.Total_Individuals_Worked || 0) / 1000), // in thousands
        }));
    }, [historicalData]);


    const comparison = useMemo(() => {
        if (!data || !stateStats) return null;

        const districtBudget = Number(data.Approved_Labour_Budget || 0);
        const districtWage = Number(data.Average_Wage_rate_per_day_per_person || 0);
        const districtWorkers = Number(data.Total_Individuals_Worked || 0);

        return {
            budget: {
                value: districtBudget,
                avg: stateStats.avgBudget,
                percent: ((districtBudget - stateStats.avgBudget) / stateStats.avgBudget * 100).toFixed(1),
                isAbove: districtBudget > stateStats.avgBudget,
            },
            wage: {
                value: districtWage,
                avg: stateStats.avgWage,
                percent: ((districtWage - stateStats.avgWage) / stateStats.avgWage * 100).toFixed(1),
                isAbove: districtWage > stateStats.avgWage,
            },
            workers: {
                value: districtWorkers,
                avg: stateStats.avgWorkers,
                percent: ((districtWorkers - stateStats.avgWorkers) / stateStats.avgWorkers * 100).toFixed(1),
                isAbove: districtWorkers > stateStats.avgWorkers,
            },
        };
    }, [data, stateStats]);

    if (!data) {
        return (
            <div className="summary-empty">
                <div className="summary-empty-icon">📊</div>
                <h3>{t.pleaseSelect}</h3>
                <p>{t.instructionText}</p>
            </div>
        );
    }

    const districtName = lang === "hi" ? (data.district_name_hi || data.district_name) : data.district_name;
    const finYear = data.fin_year || "";
    const labourBudget = Number(data.Approved_Labour_Budget || 0);
    const avgWage = Number(data.Average_Wage_rate_per_day_per_person || 0);
    const totalWorkers = Number(data.Total_Individuals_Worked || 0);

    return (
        <div className="summary-card">

            <div className="summary-head">
                <div className="district-info">
                    <div className="district-name">{districtName}</div>
                    <div className="year-text">
                        {t.financialYear}: {finYear}
                    </div>
                </div>
                <button
                    className="speak-button"
                    onClick={() => speak(data, lang)}
                    title={t.speak}
                    aria-label={t.speak}
                >
                    🔊
                </button>
            </div>


            <div className="summary-stats">
                <div className="stat">
                    <div className="stat-label">{t.approvedBudget}</div>
                    <div className="stat-value">{formatLargeNumber(labourBudget, lang)}</div>
                    {comparison && (
                        <div className="stat-comparison">
                            <span className={`comparison-badge ${comparison.budget.isAbove ? 'above' : 'below'}`}>
                                {comparison.budget.isAbove ? '↑' : '↓'} {Math.abs(comparison.budget.percent)}%
                            </span>
                            <span>{comparison.budget.isAbove ? t.aboveAverage : t.belowAverage}</span>
                        </div>
                    )}
                </div>

                <div className="stat">
                    <div className="stat-label">{t.avgWage}</div>
                    <div className="stat-value">₹{formatNumber(avgWage, lang)}</div>
                    {comparison && (
                        <div className="stat-comparison">
                            <span className={`comparison-badge ${comparison.wage.isAbove ? 'above' : 'below'}`}>
                                {comparison.wage.isAbove ? '↑' : '↓'} {Math.abs(comparison.wage.percent)}%
                            </span>
                            <span>{comparison.wage.isAbove ? t.aboveAverage : t.belowAverage}</span>
                        </div>
                    )}
                </div>

                <div className="stat">
                    <div className="stat-label">{t.totalWorked}</div>
                    <div className="stat-value">{formatNumber(totalWorkers, lang)}</div>
                    {comparison && (
                        <div className="stat-comparison">
                            <span className={`comparison-badge ${comparison.workers.isAbove ? 'above' : 'below'}`}>
                                {comparison.workers.isAbove ? '↑' : '↓'} {Math.abs(comparison.workers.percent)}%
                            </span>
                            <span>{comparison.workers.isAbove ? t.aboveAverage : t.belowAverage}</span>
                        </div>
                    )}
                </div>
            </div>


            {chartData.length > 1 && (
                <>

                    <div className="chart-wrapper">
                        <div className="chart-container">
                            <div className="chart-title">{t.budgetTrend}</div>
                            <div className="chart-area">
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="year"
                                            stroke="#64748b"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            style={{ fontSize: '12px' }}
                                            label={{
                                                value: lang === 'hi' ? 'करोड़ में' : 'in Crores',
                                                angle: -90,
                                                position: 'insideLeft',
                                                style: { fontSize: '12px', fill: '#64748b' }
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '2px solid #14b8a6',
                                                borderRadius: '12px',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                padding: '12px'
                                            }}
                                            formatter={(value) => [`₹${value} ${t.inCrores}`, t.approvedBudget]}
                                            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                        />
                                        <Bar
                                            dataKey="budget"
                                            fill="url(#budgetGradient)"
                                            radius={[8, 8, 0, 0]}
                                            maxBarSize={60}
                                        />
                                        <defs>
                                            <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#0ea5a4" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>


                    <div className="chart-wrapper">
                        <div className="chart-container">
                            <div className="chart-title">{t.performance}</div>
                            <div className="chart-area">
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="year"
                                            stroke="#64748b"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            stroke="#f59e0b"
                                            style={{ fontSize: '12px' }}
                                            label={{
                                                value: lang === 'hi' ? 'मज़दूरी (₹)' : 'Wage (₹)',
                                                angle: -90,
                                                position: 'insideLeft',
                                                style: { fontSize: '12px', fill: '#f59e0b' }
                                            }}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            stroke="#6366f1"
                                            style={{ fontSize: '12px' }}
                                            label={{
                                                value: lang === 'hi' ? 'श्रमिक (हजार)' : 'Workers (K)',
                                                angle: 90,
                                                position: 'insideRight',
                                                style: { fontSize: '12px', fill: '#6366f1' }
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '2px solid #6366f1',
                                                borderRadius: '12px',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                padding: '12px'
                                            }}
                                            labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                                        />
                                        <Legend
                                            wrapperStyle={{ paddingTop: '10px' }}
                                            iconType="circle"
                                        />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="wage"
                                            stroke="#f59e0b"
                                            strokeWidth={3}
                                            dot={{ fill: '#f59e0b', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 7 }}
                                            name={lang === 'hi' ? 'दैनिक मज़दूरी' : 'Daily Wage'}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="workers"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            dot={{ fill: '#6366f1', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 7 }}
                                            name={lang === 'hi' ? 'कुल श्रमिक (हजार)' : 'Total Workers (K)'}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}


            {comparison && stateStats && (
                <div className="comparison-section">
                    <div className="comparison-title">
                        🏆 {t.comparisonTitle}
                    </div>
                    <div className="comparison-grid">
                        <div className="comparison-item">
                            <div className="comparison-item-label">{t.stateAverage}</div>
                            <div className="comparison-item-value">
                                {formatLargeNumber(stateStats.avgBudget, lang)}
                            </div>
                        </div>
                        <div className="comparison-item">
                            <div className="comparison-item-label">{t.yourDistrict}</div>
                            <div className="comparison-item-value" style={{ color: comparison.budget.isAbove ? '#10b981' : '#f59e0b' }}>
                                {formatLargeNumber(comparison.budget.value, lang)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}