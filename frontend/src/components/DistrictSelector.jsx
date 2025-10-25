import { useState, useMemo, useEffect, useRef } from "react";
import { strings } from "../i18n";

export default function DistrictSelector({
    districts = [],
    onSelect,
    lang = "hi",
    placeholder = "Select District",
}) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedName, setSelectedName] = useState("");
    const inputRef = useRef();

    const t = strings[lang];


    const unique = useMemo(() => {
        const map = new Map();
        for (const r of districts) {
            if (!map.has(r.district_code)) {
                map.set(r.district_code, {
                    district_code: r.district_code,
                    district_name: r.district_name,
                    district_name_hi: r.district_name_hi,
                });
            }
        }
        return Array.from(map.values()).sort((a, b) => {
            const nameA = lang === "hi" ? (a.district_name_hi || a.district_name) : a.district_name;
            const nameB = lang === "hi" ? (b.district_name_hi || b.district_name) : b.district_name;
            return nameA.localeCompare(nameB);
        });
    }, [districts, lang]);


    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return unique;
        return unique.filter((d) => {
            const name = (lang === "hi" ? d.district_name_hi || d.district_name : d.district_name) || "";
            const nameEn = d.district_name || "";
            const nameHi = d.district_name_hi || "";
            return (
                name.toLowerCase().includes(q) ||
                nameEn.toLowerCase().includes(q) ||
                nameHi.toLowerCase().includes(q) ||
                (d.district_code || "").toLowerCase().includes(q)
            );
        });
    }, [query, unique, lang]);


    useEffect(() => {
        const onDocClick = (e) => {
            if (!inputRef.current) return;
            if (!inputRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    const handleSelect = (district) => {
        const name = lang === "hi" ? (district.district_name_hi || district.district_name) : district.district_name;
        setSelectedName(name);
        setQuery(name);
        onSelect(district.district_code);
        setOpen(false);
    };

    const handleClear = () => {
        setQuery("");
        setSelectedName("");
        onSelect("");
        setOpen(false);
        inputRef.current?.querySelector('input')?.focus();
    };

    return (
        <div className="district-selector" ref={inputRef}>
            <div className="search-row">
                <input
                    className="search-input"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    aria-label={placeholder}
                />
                {query && (
                    <button
                        className="clear-btn"
                        onClick={handleClear}
                        title={t.clear || "Clear"}
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            {open && (
                <div className="results">
                    {filtered.length === 0 ? (
                        <div className="empty">
                            {lang === "hi" ? "कोई ज़िला नहीं मिला" : "No district found"}
                        </div>
                    ) : (
                        filtered.map((d) => {
                            const label = lang === "hi" ? (d.district_name_hi || d.district_name) : d.district_name;
                            const secondaryLabel = lang === "hi" ? d.district_name : d.district_name_hi;
                            return (
                                <button
                                    key={d.district_code}
                                    className="result-item"
                                    onClick={() => handleSelect(d)}
                                    aria-label={`Select ${label}`}
                                >
                                    <div>{label}</div>
                                    {secondaryLabel && secondaryLabel !== label && (
                                        <div style={{ fontStyle: 'italic', opacity: 0.7 }}>{secondaryLabel}</div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}