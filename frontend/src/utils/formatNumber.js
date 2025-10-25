
export function formatNumber(num, lang = "hi") {
    if (num === null || num === undefined || Number.isNaN(num)) {
        return "—";
    }


    const formatted = Number(num).toLocaleString("en-IN");
    return formatted;
}


export function formatCurrency(num, lang = "hi", showSymbol = true) {
    if (num === null || num === undefined || Number.isNaN(num)) {
        return "—";
    }

    const formatted = formatNumber(num, lang);
    return showSymbol ? `₹${formatted}` : formatted;
}


export function formatLargeNumber(num, lang = "hi") {
    if (num === null || num === undefined || Number.isNaN(num)) {
        return "—";
    }

    const crores = num / 10000000;
    if (crores >= 1) {
        return `₹${crores.toFixed(2)} ${lang === "hi" ? "करोड़" : "Cr"}`;
    }

    const lakhs = num / 100000;
    if (lakhs >= 1) {
        return `₹${lakhs.toFixed(2)} ${lang === "hi" ? "लाख" : "L"}`;
    }

    const thousands = num / 1000;
    if (thousands >= 1) {
        return `₹${thousands.toFixed(2)} ${lang === "hi" ? "हजार" : "K"}`;
    }

    return `₹${num.toFixed(0)}`;
}


export function formatPercentage(num) {
    if (num === null || num === undefined || Number.isNaN(num)) {
        return "—";
    }
    return `${Number(num).toFixed(1)}%`;
}