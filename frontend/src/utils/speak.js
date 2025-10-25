// src/utils/speak.js
import { numberToHindi } from "./numberToHindi";
import { formatLargeNumber } from "./formatNumber";

let voices = [];
let voicesLoaded = false;

function loadVoices() {
    return new Promise((resolve) => {
        voices = window.speechSynthesis.getVoices();
        if (voices.length) {
            voicesLoaded = true;
            return resolve(voices);
        }
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            voicesLoaded = true;
            resolve(voices);
        };
    });
}

function pickVoice(lang) {
    const target = lang === "hi" ? "hi-IN" : "en-US";


    let voice = voices.find(v => v.lang === target);


    if (!voice) {
        voice = voices.find(v => v.lang.startsWith(lang));
    }


    if (!voice && voices.length > 0) {
        voice = voices[0];
    }

    return voice;
}

export async function speak(data, lang = "hi") {
    if (!window.speechSynthesis || !data) {
        console.warn("Speech synthesis not supported or no data provided");
        return;
    }


    if (!voicesLoaded) {
        await loadVoices();
    }


    window.speechSynthesis.cancel();

    let text = "";

    if (lang === "hi") {
        const district = data.district_name_hi || data.district_name || "";
        const year = data.fin_year || "";


        const budgetFormatted = formatLargeNumber(data.Approved_Labour_Budget, lang);
        const wageFormatted = Math.round(data.Average_Wage_rate_per_day_per_person || 0);
        const workersFormatted = Math.round(data.Total_Individuals_Worked || 0);


        text = `${district} जिले में ${year} के लिए मनरेगा का बजट ${budgetFormatted} है। `;
        text += `एक मज़दूर को रोज़ औसतन ${wageFormatted} रुपये मिलते हैं। `;
        text += `कुल मिलाकर ${workersFormatted.toLocaleString('en-IN')} लोगों को काम मिला है।`;
    } else {
        const district = data.district_name || "";
        const year = data.fin_year || "";
        const budget = formatLargeNumber(data.Approved_Labour_Budget, lang);
        const wage = Math.round(data.Average_Wage_rate_per_day_per_person || 0);
        const workers = Math.round(data.Total_Individuals_Worked || 0);

        text = `In ${district} district for ${year}, the MGNREGA budget is ${budget}. `;
        text += `Average daily wage is ${wage} rupees. `;
        text += `A total of ${workers.toLocaleString('en-IN')} people received employment.`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const selectedVoice = pickVoice(lang);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }


    utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
    };

    window.speechSynthesis.speak(utterance);
}


export function stopSpeaking() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}