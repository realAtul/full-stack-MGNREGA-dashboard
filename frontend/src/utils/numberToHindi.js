
const units = ["", "एक", "दो", "तीन", "चार", "पांच", "छह", "सात", "आठ", "नौ"];
const tens = ["", "दस", "बीस", "तीस", "चालीस", "पचास", "साठ", "सत्तर", "अस्सी", "नब्बे"];
const teens = ["दस", "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस"];

export function numberToHindi(num) {
    if (typeof num !== 'number') {
        num = Number(num);
    }

    if (Number.isNaN(num)) return "";
    if (num === 0) return "शून्य";
    if (num < 0) return "ऋण " + numberToHindi(Math.abs(num));

    // Handle numbers up to 99
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
        const u = num % 10;
        const t = Math.floor(num / 10);
        return `${tens[t]}${u ? " " + units[u] : ""}`;
    }

    // Handle hundreds
    if (num < 1000) {
        const h = Math.floor(num / 100);
        const rem = num % 100;
        return `${units[h]} सौ${rem ? " " + numberToHindi(rem) : ""}`;
    }

    // Handle thousands
    if (num < 100000) {
        const th = Math.floor(num / 1000);
        const rem = num % 1000;
        return `${numberToHindi(th)} हज़ार${rem ? " " + numberToHindi(rem) : ""}`;
    }

    // Handle lakhs
    if (num < 10000000) {
        const l = Math.floor(num / 100000);
        const rem = num % 100000;
        return `${numberToHindi(l)} लाख${rem ? " " + numberToHindi(rem) : ""}`;
    }

    // Handle crores
    const cr = Math.floor(num / 10000000);
    const rem = num % 10000000;
    return `${numberToHindi(cr)} करोड़${rem ? " " + numberToHindi(rem) : ""}`;
}