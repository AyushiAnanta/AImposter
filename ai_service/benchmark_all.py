import os
import time
import json
import httpx
from dotenv import load_dotenv

# Load env variables
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

prompt = """
You are a master mystery writer for a detective game called "AImposter".
Your task is to generate a complete game scenario in a single, valid JSON object. Do not include any text before or after the JSON.
The entire setting, including character names, must be authentically Indian.

The JSON object must have:
- "story": A short backstory for the mystery.
- "theme": "Murder Mystery"
- "location": "Mumbai Palace"
- "characters": An array of 3 character objects (each has "name", "bio", and "gender" 'male'/'female'). Exactly one character must have "isImposter" set to true.
- "truth": A string describing what actually happened.
"""

def clean_and_parse_json(content: str) -> bool:
    cleaned = content.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    try:
        json.loads(cleaned)
        return True
    except Exception:
        return False

async def test_openrouter_chimera():
    if not OPENROUTER_API_KEY:
        print("[-] Skipping OpenRouter Chimera: OPENROUTER_API_KEY not found in env.")
        return None
        
    print("\n[+] Testing OpenRouter (DeepSeek R1 Chimera)...")
    async with httpx.AsyncClient(timeout=45.0) as client:
        start = time.time()
        try:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json={
                    "model": "tngtech/deepseek-r1t2-chimera:free",
                    "messages": [{"role": "user", "content": prompt}],
                },
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                }
            )
            duration = time.time() - start
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                # DeepSeek R1 has <think> tags. We should strip them if present
                actual_content = content
                if "<think>" in content and "</think>" in content:
                    actual_content = content.split("</think>")[-1].strip()
                is_valid = clean_and_parse_json(actual_content)
                return {"model": "DeepSeek R1 (OpenRouter)", "status": "Success", "time": f"{duration:.2f}s", "json": "PASS" if is_valid else "FAIL", "response": content}
            else:
                return {"model": "DeepSeek R1 (OpenRouter)", "status": f"Failed ({response.status_code})", "time": f"{duration:.2f}s", "json": "-", "response": response.text}
        except Exception as e:
            return {"model": "DeepSeek R1 (OpenRouter)", "status": f"Error ({str(e)})", "time": f"{(time.time()-start):.2f}s", "json": "-", "response": f"Exception: {str(e)}"}

async def test_google_gemini():
    if not GEMINI_API_KEY:
        print("[-] Skipping Google Gemini: GEMINI_API_KEY not found in env.")
        return None
        
    print("\n[+] Testing Google AI Studio (Gemini 2.0 Flash)...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        start = time.time()
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
            response = await client.post(
                url,
                json={
                    "contents": [{"parts": [{"text": prompt}]}]
                },
                headers={"Content-Type": "application/json"}
            )
            duration = time.time() - start
            if response.status_code == 200:
                content = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                is_valid = clean_and_parse_json(content)
                return {"model": "Gemini 2.0 Flash (Google)", "status": "Success", "time": f"{duration:.2f}s", "json": "PASS" if is_valid else "FAIL", "response": content}
            else:
                return {"model": "Gemini 2.0 Flash (Google)", "status": f"Failed ({response.status_code})", "time": f"{duration:.2f}s", "json": "-", "response": response.text}
        except Exception as e:
            return {"model": "Gemini 2.0 Flash (Google)", "status": f"Error ({str(e)})", "time": f"{(time.time()-start):.2f}s", "json": "-", "response": f"Exception: {str(e)}"}

async def test_groq():
    if not GROQ_API_KEY:
        print("[-] Skipping Groq: GROQ_API_KEY not found in env.")
        return None
        
    print("\n[+] Testing Groq (Llama 3.3 70B)...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        start = time.time()
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
            duration = time.time() - start
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                is_valid = clean_and_parse_json(content)
                return {"model": "Llama 3.3 70B (Groq)", "status": "Success", "time": f"{duration:.2f}s", "json": "PASS" if is_valid else "FAIL", "response": content}
            else:
                return {"model": "Llama 3.3 70B (Groq)", "status": f"Failed ({response.status_code})", "time": f"{duration:.2f}s", "json": "-", "response": response.text}
        except Exception as e:
            return {"model": "Llama 3.3 70B (Groq)", "status": f"Error ({str(e)})", "time": f"{(time.time()-start):.2f}s", "json": "-", "response": f"Exception: {str(e)}"}

import asyncio
async def main():
    print("=" * 60)
    print("               AIMPOSTER MULTI-PLATFORM BENCHMARK")
    print("=" * 60)
    
    results = []
    
    # Run tests
    r = await test_openrouter_chimera()
    if r: results.append(r)
        
    r = await test_google_gemini()
    if r: results.append(r)
        
    r = await test_groq()
    if r: results.append(r)
    
    print("\n" + "=" * 60)
    print("                         BENCHMARK RESULTS")
    print("=" * 60)
    if not results:
        print("No benchmarks were run. Please add GEMINI_API_KEY or GROQ_API_KEY to your .env file.")
    else:
        print(f"{'Model / Platform':<28} | {'Status':<12} | {'Time':<8} | {'JSON Match':<10}")
        print("-" * 65)
        for res in results:
            print(f"{res['model']:<28} | {res['status']:<12} | {res['time']:<8} | {res['json']:<10}")
            
        print("\n" + "=" * 60)
        print("                      RESPONSES FROM MODELS")
        print("=" * 60)
        for res in results:
            print(f"\n--- {res['model']} Response ---")
            print(res.get("response", "No response received."))
    print("=" * 60)

asyncio.run(main())
