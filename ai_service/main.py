import os
import json
import logging
import time
from typing import Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AImposterAIService")

app = FastAPI(title="AImposter AI Service")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for microservice calls
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.error("GROQ_API_KEY is not set in environment variables.")

# Request models
class ScenarioRequest(BaseModel):
    theme: Optional[str] = None
    location: Optional[str] = None
    character_count: int = Field(..., ge=2)

class ChatRequest(BaseModel):
    system_prompt: str
    user_message: str

def clean_json_response(raw_text: str) -> dict:
    """Cleans up the LLM response to extract valid JSON, stripping markdown wrappers if present."""
    text = raw_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {text}")
        raise HTTPException(status_code=500, detail=f"LLM did not return valid JSON: {str(e)}")

def build_master_prompt(theme: Optional[str], location: Optional[str], character_count: int) -> str:
    prompt = f"""
        You are a master mystery writer for a detective game called "AImposter".
        Your task is to generate a complete game scenario in a single, valid JSON object. Do not include any text before or after the JSON.
        The entire setting, including character names, must be authentically Indian.

        The JSON object must have:
        - "story": A short backstory for the mystery.
        - "theme": The genre of the mystery.
        - "location": The specific Indian setting for the story.
        - "characters": An array of {character_count} character objects.
        - "truth": A string describing what actually happened.

        For the characters array:
        - Each character must have a "name", a "bio", and a "gender" ('male', 'female', or 'other').
        - Exactly one character must have "isImposter" set to true.

        the mystery should be harder to solve with atleast 2 very strong suspects.

    """
    if theme:
        prompt += f"\n        The mystery's theme must be '{theme}'"
    else:
        prompt += "\n        You must invent a suitable theme"
        
    if location:
        prompt += f" and it must be set in a '{location}' in India."
    else:
        prompt += " and it must be set in a suitable Indian location you invent."

    prompt += "\n        Generate a new, unique scenario now based on these rules."
    return prompt

@app.post("/api/ai/generate-scenario")
async def generate_scenario(payload: ScenarioRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is missing on the server.")

    prompt = build_master_prompt(payload.theme, payload.location, payload.character_count)
    logger.info(f"Generating scenario for Theme: {payload.theme}, Location: {payload.location}")

    start_time = time.time()

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                },
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                }
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            logger.info("AI raw response successfully received from Groq.")
            
            # Clean and parse JSON
            scenario_json = clean_json_response(content)
            
            duration = time.time() - start_time
            logger.info(f"Story generation completed successfully in {duration:.2f} seconds.")
            
            return scenario_json

        except httpx.HTTPStatusError as e:
            logger.error(f"Groq HTTP Error: {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=f"Groq API error: {e.response.text}")
        except Exception as e:
            logger.error(f"Unexpected error in scenario generation: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Unexpected error during scenario generation: {str(e)}")

@app.post("/api/ai/chat-completion")
async def chat_completion(payload: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is missing on the server.")

    logger.info("Generating character chat completion response from Groq.")

    async with httpx.AsyncClient(timeout=45.0) as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": payload.system_prompt},
                        {"role": "user", "content": payload.user_message}
                    ],
                },
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                }
            )
            response.raise_for_status()
            data = response.json()
            reply_text = data["choices"][0]["message"]["content"]
            logger.info("AI chat reply generated successfully from Groq.")
            return {"reply": reply_text}

        except httpx.HTTPStatusError as e:
            logger.error(f"Groq HTTP Error: {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=f"Groq API error: {e.response.text}")
        except Exception as e:
            logger.error(f"Unexpected error in chat completion: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Unexpected error during chat completion: {str(e)}")

@app.get("/")
def read_root():
    return {"status": "AImposter AI service is running."}
