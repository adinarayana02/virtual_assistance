let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let responseOutput = document.querySelector("#response-output");

const API_KEY = "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";
const MODEL = "llama3-8b-8192";

function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "hi-GB";
    window.speechSynthesis.speak(text_speak);
}

function stopSpeaking() {
    window.speechSynthesis.cancel(); // Stop any ongoing speech synthesis
}

function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good Morning Sir");
    } else if (hours >= 12 && hours < 16) {
        speak("Good Afternoon Sir");
    } else {
        speak("Good Evening Sir");
    }
}

// Speech recognition setup
let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());
};

btn.addEventListener("click", () => {
    stopSpeaking(); // Stop any ongoing speech synthesis
    resetApp(); // Reset the application state
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";
});

function resetApp() {
    content.innerText = ""; // Clear the displayed transcript
    responseOutput.value = ""; // Clear the response output
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
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 150,
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
        const response = "I am your virtual assistant, created by Ayush Sir.";
        displayAndSpeakResponse(response);
    } else if (message.includes("open youtube")) {
        const response = "Opening YouTube...";
        displayAndSpeakResponse(response);
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("open google")) {
        const response = "Opening Google...";
        displayAndSpeakResponse(response);
        window.open("https://google.com/", "_blank");
    } else if (message.includes("search") || message.includes("open")) {
        const query = message.replace(/search|open|for/gi, "").trim(); // Extract search keywords
        if (query) {
            const response = `Searching youtube for: ${query}`;
            displayAndSpeakResponse(response);
            const googleSearchURL = `https://youtube.com/search?q=${encodeURIComponent(query)}`;
            window.open(yutubeSearchURL, "_blank");
        } else {
            const response = "Please specify what you would like me to search for.";
            displayAndSpeakResponse(response);
        }} else if (message.includes("search") || message.includes("open")) {
        const query = message.replace(/search|open |for/gi, "").trim(); // Extract search keywords
        if (query) {
            const response = `Searching Google for: ${query}`;
            displayAndSpeakResponse(response);
            const googleSearchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(googleSearchURL, "_blank");
        } else {
            const response = "Please specify what you would like me to search for.";
            displayAndSpeakResponse(response);
        }
    } else {
        const response = "Let me find the best answer for you...";
        displayAndSpeakResponse(response);
        const generatedResponse = await generateResponse(message);
        displayAndSpeakResponse(generatedResponse);
    }
}

function displayAndSpeakResponse(response) {
    responseOutput.value = response; // Update the text area with the response
    speak(response); // Speak the response
}

// Stop speech synthesis when the page is refreshed
window.addEventListener("beforeunload", () => {
    stopSpeaking();
});
