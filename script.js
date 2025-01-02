let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let responseOutput = document.querySelector("#response-output");

const API_KEY = "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";
const MODEL = "llama3-8b-8192";

function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 0.8;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "en-IN";

    const words = text.split(" ");
    let wordIndex = 0;

    text_speak.onboundary = (event) => {
        if (event.name === "word") {
            highlightWord(words, wordIndex);
            wordIndex++;
        }
    };

    text_speak.onend = () => {
        clearHighlight();
    };

    window.speechSynthesis.speak(text_speak);
}

function stopSpeaking() {
    window.speechSynthesis.cancel();
}

function highlightWord(words, index) {
    const highlightedText = words.map((word, i) => {
        if (i === index) {
            return `<span class="zoom-out" style="background-color: yellow;">${word}</span>`;
        }
        return word;
    }).join(" ");
    responseOutput.innerHTML = highlightedText;
}

function clearHighlight() {
    responseOutput.innerHTML = responseOutput.innerText;
}

function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good Morning students");
    } else if (hours >= 12 && hours < 16) {
        speak("Good Afternoon students");
    } else {
        speak("Good Evening students");
    }
}

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());
};

btn.addEventListener("click", () => {
    stopSpeaking();
    resetApp();
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";
});

function resetApp() {
    content.innerText = "";
    responseOutput.innerHTML = "";
}

async function generateResponse(prompt) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: "You are a compassionate and engaging virtual teacher designed to support Telugu primary school students. Use simple and clear language, speak slowly and articulately, and ensure your responses are easy to understand for young learners. Make the learning experience enjoyable by incorporating interactive, friendly, and encouraging communication. Share knowledge in a way that inspires curiosity, fosters confidence, and makes education both fun and meaningful for children." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        const data = await response.json();
        if (data && data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        } else {
            return "Sorry, I couldn't process that. Please try again.";
        }
    } catch (error) {
        console.error("Error generating response:", error);
        return "There was an error connecting to the AI service.";
    }
}

async function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    if (message.includes("hello") || message.includes("hey")) {
        const response = "Hello sir, what can I help you with?";
        displayAndSpeakResponse(response);
    } else if (message.includes("who are you")) {
        const response = "I am your virtual assistant, created by Adinarayana.";
        displayAndSpeakResponse(response);
    } else if (message.includes("open youtube")) {
        const response = "Opening YouTube...";
        displayAndSpeakResponse(response);
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("open google")) {
        const response = "Opening Google...";
        displayAndSpeakResponse(response);
        window.open("https://google.com/", "_blank");
    } else if (message.includes("search") || message.includes("look up")) {
        const query = message.replace(/search|look up|for/gi, "").trim();
        if (query) {
            const response = `Searching for: ${query}`;
            displayAndSpeakResponse(response);
            const googleSearchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(googleSearchURL, "_blank");
        } else {
            const response = "Please specify what you would like me to search for.";
            displayAndSpeakResponse(response);
        }
    } else {
        const response = "Here is the answer for you...";
        displayAndSpeakResponse(response);
        const generatedResponse = await generateResponse(message);
        displayAndSpeakResponse(generatedResponse);
    }
}

function displayAndSpeakResponse(response) {
    responseOutput.innerHTML = response;
    speak(response);
}

window.addEventListener("beforeunload", () => {
    stopSpeaking();
});
