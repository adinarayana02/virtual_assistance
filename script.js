let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let responseOutput = document.querySelector("#response-output");

const API_KEY = "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";
const MODEL = "llama3-8b-8192";

// Enhanced speech function for bilingual output
function speak(teluguText, englishText = "") {
    // Queue Telugu speech
    let telugu_speak = new SpeechSynthesisUtterance(teluguText);
    telugu_speak.rate = 0.85;  // Slower for clarity
    telugu_speak.pitch = 1.0;  // Natural pitch
    telugu_speak.volume = 1;
    telugu_speak.lang = "te-IN";

    // Queue English speech if provided
    if (englishText) {
        let english_speak = new SpeechSynthesisUtterance(englishText);
        english_speak.rate = 0.9;
        english_speak.pitch = 1.0;
        english_speak.volume = 1;
        english_speak.lang = "en-IN";
        
        // Chain speeches
        telugu_speak.onend = () => {
            window.speechSynthesis.speak(english_speak);
        };
    }

    window.speechSynthesis.speak(telugu_speak);
}

function stopSpeaking() {
    window.speechSynthesis.cancel();
}

// Enhanced greeting function
function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    if (hours >= 0 && hours < 12) {
        speak("శుభోదయం చిన్నారీ", "Good morning dear student");
    } else if (hours >= 12 && hours < 16) {
        speak("శుభ మధ్యాహ్నం చిన్నారీ", "Good afternoon dear student");
    } else {
        speak("శుభ సాయంత్రం చిన్నారీ", "Good evening dear student");
    }
}

// Enhanced speech recognition setup
let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();
recognition.lang = 'te-IN';
recognition.continuous = false;
recognition.interimResults = false;

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());
};

// Smart YouTube search function
async function searchYouTube(query, isEducational = true) {
    const educationalTags = isEducational ? ' for kids educational' : '';
    const searchQuery = encodeURIComponent(query + educationalTags);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, "_blank");
}

// Smart Google search function
async function searchGoogle(query, isEducational = true) {
    const educationalTags = isEducational ? ' for students simple explanation' : '';
    const searchQuery = encodeURIComponent(query + educationalTags);
    window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank");
}

// Enhanced command handling
async function takeCommand(message) {
    voice.style.display = "none";
    btn.style.display = "flex";

    if (message.includes("youtube")) {
        const searchTerm = message.replace(/youtube|open|search|watch/gi, "").trim();
        if (searchTerm) {
            speak(
                `${searchTerm} గురించి యూట్యూబ్ వీడియోలు చూపిస్తున్నాను`,
                `Showing YouTube videos about ${searchTerm}`
            );
            await searchYouTube(searchTerm);
        } else {
            speak(
                "దయచేసి మీరు ఏ వీడియో చూడాలనుకుంటున్నారో చెప్పండి",
                "Please tell me what videos you'd like to watch"
            );
        }
    } else if (message.includes("google") || message.includes("search")) {
        const searchTerm = message.replace(/google|search|find|look up|for/gi, "").trim();
        if (searchTerm) {
            speak(
                `${searchTerm} గురించి సమాచారం వెతుకుతున్నాను`,
                `Searching for information about ${searchTerm}`
            );
            await searchGoogle(searchTerm);
        } else {
            speak(
                "దయచేసి మీరు ఏమి వెతకాలనుకుంటున్నారో చెప్పండి",
                "Please tell me what you'd like to search for"
            );
        }
    } else if (message.includes("నమస్కారం") || message.includes("hello") || message.includes("hi")) {
        speak(
            "నమస్కారం చిన్నారీ! నేను మీకు ఎలా సహాయం చేయగలను?",
            "Hello dear! How can I help you today?"
        );
    } else if (message.includes("మీరు ఎవరు") || message.includes("who are you")) {
        speak(
            "నేను మీ విద్యా సహాయకుడిని. మీకు చదువులో సహాయం చేస్తాను!",
            "I am your educational assistant. I'm here to help you learn!"
        );
    } else {
        // Generate AI response for other queries
        const response = await generateResponse(message);
        displayBilingualResponse(response);
    }
}

// Function to handle bilingual response display and speech
function displayBilingualResponse(response) {
    responseOutput.value = response;
    // Assuming response has both Telugu and English parts separated by a delimiter
    const [teluguPart, englishPart] = response.split(' || ');
    speak(teluguPart, englishPart);
}

// Modified API response generation for bilingual output
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
                    { 
                        role: "system", 
                        content: "You are a bilingual educational assistant. Provide responses in both Telugu and English, separated by ' || '. Use simple, clear language suitable for primary school students. Make explanations engaging and interactive." 
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 200,
            }),
        });

        const data = await response.json();
        if (data && data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        } else {
            return "క్షమించండి, నాకు అర్థం కాలేదు || Sorry, I didn't understand that";
        }
    } catch (error) {
        console.error("Error generating response:", error);
        return "ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి || Something went wrong. Please try again.";
    }
}

btn.addEventListener("click", () => {
    stopSpeaking();
    resetApp();
    speak("నేను వింటున్నాను...", "I'm listening...");
    recognition.start();
    voice.style.display = "block";
    btn.style.display = "none";
});

function resetApp() {
    content.innerText = "";
    responseOutput.value = "";
}

// Initialize voices when available
window.speechSynthesis.onvoiceschanged = () => {
    console.log("Voices loaded");
};

// Stop speech synthesis when page is refreshed
window.addEventListener("beforeunload", () => {
    stopSpeaking();
});
