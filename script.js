let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let responseOutput = document.querySelector("#response-output");

const API_KEY = "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";
const MODEL = "llama3-8b-8192";

function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 0.8; // Slow speech
    text_speak.pitch = 1; // Normal pitch
    text_speak.volume = 1; // Full volume
    text_speak.lang = "te-IN"; // Set language to Telugu

    const words = text.split(" "); // Split text into words
    let wordIndex = 0;

    // Highlight words as they are spoken
    text_speak.onboundary = (event) => {
        if (event.name === "word") {
            highlightWord(words, wordIndex);
            wordIndex++;
        }
    };

    text_speak.onend = () => {
        clearHighlight(); // Clear highlights after speech ends
    };

    window.speechSynthesis.speak(text_speak);
}

function stopSpeaking() {
    window.speechSynthesis.cancel(); // Stop any ongoing speech synthesis
}

function highlightWord(words, index) {
    const highlightedText = words.map((word, i) => {
        if (i === index) {
            return `<span style="background-color: yellow;">${word}</span>`;
        }
        return word;
    }).join(" ");
    responseOutput.innerHTML = highlightedText; // Update displayed text with highlighted word
}

function clearHighlight() {
    responseOutput.innerHTML = responseOutput.innerText; // Remove highlight
}

function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    if (hours >= 0 && hours < 12) {
        speak("శుభోదయం బాబు!");
    } else if (hours >= 12 && hours < 16) {
        speak("శుభ మధ్యాహ్నం బాబు!");
    } else {
        speak("శుభ సాయంత్రం బాబు!");
    }
}

// Speech recognition setup
let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.lang = "te-IN"; // Set recognition language to Telugu

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
    responseOutput.innerHTML = ""; // Clear the response output
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
                    { role: "system", content: "You are a helpful and kind virtual teacher assisting Telugu primary school students. Speak clearly and slowly, and make learning fun for children." },
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
            return "క్షమించండి, నేను మీ ప్రశ్నను సమాధానపరచలేకపోయాను.";
        }
    } catch (error) {
        console.error("Error generating response:", error);
        return "AI సేవతో కనెక్ట్ చేయడంలో సమస్య తలెత్తింది.";
    }
}

async function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    if (message.includes("నమస్కారం")) {
        const response = "హలో బాబు! ఎలా ఉన్నావు?";
        displayAndSpeakResponse(response);
    } else if (message.includes("నీ పేరు ఏమిటి")) {
        const response = "నేను మీ సహాయక ఉపాధ్యాయురాలు, తెలుగులో బోధించడానికి నేను ఇక్కడ ఉన్నాను.";
        displayAndSpeakResponse(response);
    } else if (message.includes("యూట్యూబ్ ఓపెన్ చేయి")) {
        const response = "యూట్యూబ్ ఓపెన్ చేస్తున్నాను...";
        displayAndSpeakResponse(response);
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("గూగుల్ ఓపెన్ చేయి")) {
        const response = "గూగుల్ ఓపెన్ చేస్తున్నాను...";
        displayAndSpeakResponse(response);
        window.open("https://google.com/", "_blank");
    } else {
        const response = "ఇది మీకోసం...";
        displayAndSpeakResponse(response);
        const generatedResponse = await generateResponse(message);
        displayAndSpeakResponse(generatedResponse);
    }
}

function displayAndSpeakResponse(response) {
    responseOutput.innerHTML = response; // Update the text area with the response
    speak(response); // Speak the response
}

// Stop speech synthesis when the page is refreshed
window.addEventListener("beforeunload", () => {
    stopSpeaking();
});
