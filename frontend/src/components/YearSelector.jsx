import React from "react";

export default function YearSelector({ value, onChange, lang = "hi" }) {
    const years = ["2020-2021", "2021-2022", "2022-2023", "2023-2024", "2024-2025"];

    return (
        <div className="year-pills">
            {years.map((year) => (
                <button
                    key={year}
                    onClick={() => onChange(year)}
                    className={`year-pill ${value === year ? "selected" : ""}`}
                    aria-pressed={value === year}
                    aria-label={`Select year ${year}`}
                >
                    {year}
                </button>
            ))}
        </div>
    );
}