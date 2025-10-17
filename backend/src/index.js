// server.js

import express from 'express';
import axios from 'axios';
import 'dotenv/config';// This line loads the variables from your .env file
import dotenv from "dotenv";
import connectDb from "./db/index.js";

dotenv.config({
    path: './.env'
})
// 2. INITIALIZE THE EXPRESS APP
const app = express();
connectDb()
.then(() => {

    app.on("error", (error) => {
            console.error("ERROR",error);
            throw error;
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`SERVER IS LISTENING AT PORT ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("mongo db con fail", err)
})


const PORT = process.env.PORT || 3001; // Use port 3001 unless specified otherwise

// This is middleware that allows Express to understand JSON request bodies
app.use(express.json());

// server.js

// 3. DEFINE THE UPDATED GAME GENERATION ENDPOINT
app.post('/api/new-game', async (req, res) => {
    // ---- NEW: Read theme and location from the request body ----
    const { theme, location } = req.body;
    console.log(`Received new game request with Theme: ${theme}, Location: ${location}`);

    // ---- NEW: Dynamically build the master prompt ----
    // This function will create the prompt based on user input.
    const masterPrompt = buildMasterPrompt(theme, location);

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "tngtech/deepseek-r1t2-chimera:free",
                messages: [{ role: "system", content: masterPrompt }],
                response_format: { "type": "json_object" }
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "AImposter"
                }
            }
        );

        const aiResponseContent = response.data.choices[0].message.content;
        const gameData = JSON.parse(aiResponseContent);

        // Future step: Save this gameData to MongoDB here.
        res.status(200).json(gameData);

    } catch (error) {
        console.error("Error calling OpenRouter API:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to generate new game." });
    }
});

// ---- NEW: Prompt Building Function ----
function buildMasterPrompt(theme, location) {
    // Start with the core instructions
    let prompt = `
        You are a master mystery writer for a detective game called "AImposter".
        Your task is to generate a complete game scenario in a single, valid JSON object. Do not include any text before or after the JSON.
        The entire setting, including character names, must be authentically Indian.

        The JSON object must have:
        - "story": A short backstory for the mystery.
        - "theme": The genre of the mystery.
        - "location": The specific Indian setting for the story.
        - "characters": An array of less than 6 character objects.
        - "truth": A string describing what actually happened.

        For the characters array:
        - Each character must have a "name", a "bio", and a "gender" ('male', 'female', or 'other').
        - Exactly one character must have "isImposter" set to true.

        the mystery should be harder to solve with atleast 2 very strong suspects.


        also record the time taken to generate output by the chatbot in seconds in a field called "timeTaken".

        ${theme? `The mystery's theme must be '${theme}'` : `You must invent a suitable theme`} and 
        ${location? `it must be set in a '${location}' in India.` : `it must be set in a suitable Indian location you invent.`}
        Generate a new, unique scenario now based on these rules.
    `;

    
    return prompt;
}


// ... (keep the app.listen part the same)

// Add other endpoints like /api/chat here later...


// 8. START THE SERVER
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});