import mongoose from "mongoose"
import {GameSession} from "../models/gameSession.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import axios from "axios";
import { OpenRouter } from "@openrouter/sdk";



const createGame = asyncHandler(async (req, res) => {
  // 1. Extract inputs
  const { theme, location, character_count } = req.body;

  console.log(
    `Received new game request with Theme: ${theme}, Location: ${location}, Character Count: ${character_count}`
  );

  // 2. Fix character count
  let finalCharacterCount =
    character_count || Math.floor(Math.random() * 4) + 3;

  if (finalCharacterCount < 2) {
    throw new ApiError(400, "Character count must be at least 2.");
  }

  try {
    // 3. Call FastAPI Service
    const fastapiUrl = process.env.FASTAPI_SERVICE_URL || "http://127.0.0.1:8001";
    const aiResponse = await axios.post(`${fastapiUrl}/api/ai/generate-scenario`, {
      theme,
      location,
      character_count: finalCharacterCount
    });

    const parsedData = aiResponse.data;

    // 4. Save to DB
    const game = await GameSession.create(parsedData);

    // 5. Send response
    return res.status(201).json(
      new ApiResponse(201, game, "Game created successfully")
    );

  } catch (error) {
    console.error("AI ERROR:", error.response ? error.response.data : error.message);
    throw new ApiError(500, "AI generation failed");
  }
});

const getGameState = asyncHandler(async (req, res) => {
    // 1. Get the game ID from the request parameters (req.params.id).
    // 2. Find the corresponding game session in the MongoDB database.
    // 3. If the game is not found, return a 404 error.
    // 4. Create a "safe" version of the game object to send to the player.
    //    - IMPORTANT: Omit sensitive fields like 'truth' and the 'isImposter' flags on the characters to prevent cheating.
    // 5. Respond with the safe game state object (story, characters without imposter info, chat history).

    const gameId = req.params.id;
    console.log(`game requested with id: ${gameId}`)
    try {
        const gameState = await GameSession.findById(gameId).select("-truth")
    
        if (!gameState){
            throw new ApiError(400,'couldnt find game state')
        }
        const safeCharacters = gameState.characters.map(character => {
        // 1. Create a shallow copy of the plain character object
        const safeChar = { ...character };
        
        // 2. Delete the sensitive property from the copy
        delete safeChar.isImposter;
        
        // 3. Return the safe copy
        return safeChar;
    });

        const safeGameState = {
        _id: gameState._id,
        status: gameState.status,
        story: gameState.story,
        theme: gameState.theme,
        location: gameState.location,
        characters: safeCharacters, // Use the new safe array
        chatHistory: gameState.chatHistory,
        createdAt: gameState.createdAt,
        updatedAt: gameState.updatedAt
    };

        console.log(safeGameState)
        return res.status(200).json(new ApiResponse(200, safeGameState))
    } catch (error) {
        throw new ApiError(400,error,'error in finding gamestate')
    }



});

/*const handleChatMessage = asyncHandler(async (req, res) => {
    // 1. Get the game ID from the request parameters (req.params.id).
    // 2. Get the 'characterName' and player's 'message' from the request body (req.body).
    // 3. Find the game session in the database. If not found, return an error.
    // 4. Construct a new prompt for the AI. This prompt MUST include:
    //    - The original story context.
    //    - The specific character's persona (bio and whether they are the imposter).
    //    - The relevant chat history with this character.
    //    - The player's new message.
    // 5. Call the OpenRouter API with this prompt to get the character's reply.
    // 6. Save the player's message AND the AI's reply to the 'chatHistory' array in the database.
    // 7. Respond to the frontend with just the AI's new message object.

    const gameId = req.params.id;
    const {characterName, message} = req.body

    if(!characterName || !message) {
        throw new ApiError(400,"charactername and message, both are required")
    }

    const gameState = await GameSession.findById(gameId)

    const chatprompt = `this is the context of the game ${gameState} ,
     you are ${characterName} ,the detective is asking you this 
     question: ${message} answer according to your character either 
     truthfully or decietfully based on if you are an imposter or 
     not and in accordance with the chat history .
     
     return the response in the json format of 
     characterName, sender who is either "Player" or "AI", message and timestamp
     `

    
        try {
            const response = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "tngtech/deepseek-r1t2-chimera:free",
                    messages: [
                    { role: "system", content: chatprompt },
                    { role: "user", content: message } // The player's message
                ],
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
            console.log(response)
            return res.status(200).json(new ApiResponse(200, response, "chat generated successfully"))
        } catch (error) {
            throw new ApiError(400, error,"error in chat")
        }
});*/
const handleChatMessage = asyncHandler(async (req, res) => {
    // 1. Get IDs and Inputs
    const gameId = req.params.id;
    const { characterName, message } = req.body;

    if (!characterName || !message) {
        throw new ApiError(400, "Character name and message are both required");
    }

    // 2. Find the game session
    const gameState = await GameSession.findById(gameId);
    if (!gameState) {
        throw new ApiError(404, "Game session not found");
    }
    if (gameState.status !== 'active') {
        throw new ApiError(400, "This game is already completed.");
    }

    // 3. Find the specific character being spoken to
    const character = gameState.characters.find(c => c.name === characterName);
    if (!character) {
        throw new ApiError(404, "Character not found in this game session");
    }

    // 4. Filter chat history for this specific character to provide context
    const relevantHistory = gameState.chatHistory
        .filter(entry => entry.characterName === characterName)
        .map(entry => `${entry.sender}: ${entry.message}`) // Format for readability
        .join('\n');

    // 5. Construct a high-quality, detailed prompt for the AI
    const systemPrompt = `
        You are an AI actor in a detective game. You must stay in character completely.
        
        **Game Story Context:** ${gameState.story}
        **Truth:** ${gameState.truth}
        **Your Character Persona:**
        - Name: ${character.name}
        - Bio: ${character.bio}
        - Role: You are ${character.isImposter ? 'the IMPOSER. Your goal is to lie convincingly and deflect suspicion. Do not admit you are the imposter.' : 'INNOCENT. Your goal is to answer truthfully and help the detective.'}
        - All Characters: ${gameState.characters}
        **Previous conversation with the detective:**
        ${relevantHistory.length > 0 ? relevantHistory : 'No conversation yet.'}
        make sure to not introduce new characters and stick to context and remember the truth.
        Now, answer the detective's new question. Keep your response concise (1-3 sentences).
        NEVER IN ANY SCENARIO ACCEPT THAT YOU ARE THE IMPOSTER
    `;

    // 6. Call the FastAPI Service
    let aiReplyText;
    try {
        const fastapiUrl = process.env.FASTAPI_SERVICE_URL || "http://127.0.0.1:8001";
        const response = await axios.post(
            `${fastapiUrl}/api/ai/chat-completion`,
            {
                system_prompt: systemPrompt,
                user_message: message
            }
        );
        // Extract the reply text from FastAPI response
        aiReplyText = response.data.reply;

    } catch (error) {
        // Log the detailed error from the AI service for better debugging
        console.error("FastAPI AI Service Error:", error.response ? error.response.data : error.message);
        throw new ApiError(500, "Failed to get a response from the AI.");
    }

    // 7. Create the message objects
    const playerMessage = { characterName, sender: 'Player', message };
    const aiMessage = { characterName, sender: 'AI', message: aiReplyText };

    // 8. Save BOTH messages to the database and get the updated document
    const updatedGame = await GameSession.findByIdAndUpdate(
        gameId,
        { $push: { chatHistory: { $each: [playerMessage, aiMessage] } } },
        { new: true } // This option returns the updated document
    );

    // 9. Respond to the frontend with just the AI's new message
    res.status(200).json(new ApiResponse(200, aiMessage, "AI reply generated successfully"));
});
const checkAccusation = asyncHandler(async (req, res) => {
    // 1. Get the game ID from the request parameters (req.params.id).
    // 2. Get the 'characterName' of the accused from the request body (req.body).
    // 3. Find the game session in the database.
    // 4. Find the character object that the player accused.
    // 5. Check if the accused character's 'isImposter' property is true.
    // 6. Based on the check, update the game's 'status' to either 'completed-won' or 'completed-lost'.
    // 7. Respond with the final game outcome, including the 'truth' so the player knows what really happened.

    const gameId = req.params.id;
    const { characterName, message } = req.body;

    if (!characterName) {
        throw new ApiError(400, "Character name is required");
    }

    // 2. Find the game session
    let gameState = await GameSession.findById(gameId);
    if (!gameState) {
        throw new ApiError(404, "Game session not found");
    }
    if (gameState.status !== 'active') {
        throw new ApiError(400, "This game is already completed.");
    }

    // 3. Find the specific character being spoken to
    const character = gameState.characters.find(c => c.name === characterName);
    if (!character) {
        throw new ApiError(404, "Character not found in this game session");
    }
    console.log(character.isImposter)
    let result
    if(character.isImposter === true) {
        result='won!!!'
        gameState = await GameSession.findByIdAndUpdate(gameId,{
            $set: {
                status: 'completed-won'
            }
        },{new: true})
    } else {
        result='lost!!!'
        gameState = await GameSession.findByIdAndUpdate(gameId,{
            $set: {
                status: 'completed-lost'
            }
        },{new: true})
    }
    return res.status(200).json(new ApiResponse(200, result, gameState))

});


// Export all the controller functions so they can be used in the routes file.
export {
    createGame,
    getGameState,
    handleChatMessage,
    checkAccusation,
};
