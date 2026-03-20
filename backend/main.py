import os
import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from hindsight_client import Hindsight
from groq import Groq

# Load environment variables
load_dotenv()

app = FastAPI(title="Avinya Code | Persistent Cognitive Mentor")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Clients
HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY")
BANK_ID = os.getenv("HINDSIGHT_BANK_ID")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

hindsight = Hindsight(
    api_key=HINDSIGHT_API_KEY, 
    base_url="https://api.hindsight.vectorize.io"
)
groq_client = Groq(api_key=GROQ_API_KEY)

class ChatRequest(BaseModel):
    user_msg: str
    dimension: str = "core"

@app.post("/chat")
async def chat(request: ChatRequest):
    user_msg = request.user_msg
    dim = request.dimension.lower()
    
    tag_map = {"scandine": "SaaS_Scandine", "core": "Python_Core", "arch": "System_Design", "dsa": "Data_Structures_Algo"}
    dim_tag = tag_map.get(dim, f"Dim_{dim}")
    dim_name = dim_tag.replace('_', ' ')

    try:
        recalled_facts = await hindsight.arecall(bank_id=BANK_ID, query=user_msg, tags=[dim_tag], tags_match="all_strict")
        
        context = ""
        facts_list = []
        if recalled_facts and len(recalled_facts) > 0:
            facts_list = [str(f) for f in recalled_facts][:5]
            context = f"--- STRICT VAULT: [{dim_name.upper()}] ---\n" + "\n".join(facts_list)
        else:
            context = f"--- SYSTEM NOTICE ---\nThis is a fresh dimension with no existing trace. Inform the user that we are starting from scratch for {dim_name}."

        system_prompt = (
            f"You are a supportive peer mentor at Avinya Code working strictly within the {dim_name} dimension. "
            f"1. STRICT ISOLATION: Do not reference other dimensions. "
            f"2. FRESH START: If no recalled memories, say: 'This is a fresh dimension. Let's start building your {dim_name} knowledge base from scratch.' "
            f"3. REINFORCEMENT: Start with 'In this dimension [{dim_name}], we have achieved...'. "
            "DO NOT use Markdown, asterisks, or bolding."
        )
        
        prompt = f"{context}\n\nUser: {user_msg}\nMentor:"
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
        )
        mentor_response = chat_completion.choices[0].message.content

        await hindsight.aretain(bank_id=BANK_ID, content=f"User: {user_msg}\nMentor: {mentor_response}", tags=[dim_tag])

        return {"mentor_message": mentor_response, "recalled_facts": facts_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/mentor/analyze")
async def analyze_progress(dimension: str = "core"):
    dim = dimension.lower()
    tag_map = {"scandine": "SaaS_Scandine", "core": "Python_Core", "arch": "System_Design", "dsa": "Data_Structures_Algo"}
    dim_tag = tag_map.get(dim, f"Dim_{dim}")
    
    try:
        # 1. Debugging Suggestions (Last 3 errors)
        error_facts = await hindsight.arecall(bank_id=BANK_ID, query="errors mistakes bugs struggles", tags=[dim_tag])
        errors = [str(f) for f in error_facts][:3] if error_facts else []
        
        # 2. Skill Radar logic (simulated for challenge gen)
        # We fetch all facts to determine the "lowest score"
        all_facts = await hindsight.arecall(bank_id=BANK_ID, query="technical progress", tags=[dim_tag])
        raw_text = " ".join([str(f).lower() for f in all_facts]) if all_facts else ""
        
        # Simple analysis
        challenge = ""
        learning_path = ""
        pro_tip = "Keep experimenting! No specific recurring errors found yet."
        
        if "async" in raw_text and "error" in raw_text:
            pro_tip = "You often encounter issues with async flow. Pro-Tip: Try using asyncio.gather for concurrent tasks instead of sequential awaits."
        elif "binding" in raw_text or "closure" in raw_text:
            pro_tip = "Watch out for late binding in closures. Pro-Tip: Use default arguments to capture loop variables."

        if dim == "core":
            challenge = "Write a high-performance closure that avoids late binding issues using default arguments. Can you implement it in under 10 lines?"
            learning_path = "Topic Mastered: Closures. Next Up: Global Interpreter Lock (GIL) and its impact on multi-threading."
        elif dim == "scandine":
            challenge = "Implement a robust error-handling wrapper for your SaaS API calls using asyncio.gather. Ensure one failure doesn't stop the whole batch."
            learning_path = "Topic Mastered: Basic APIs. Next Up: Redis Caching for SaaS performance."
        else:
            challenge = f"Create a simple proof-of-concept for a new idea in {dimension}. Focus on clean, modular code."
            learning_path = f"Topic Mastered: {dimension} Basics. Next Up: Advanced Design Patterns."

        return {
            "debugging_suggestions": pro_tip,
            "personalized_challenge": challenge,
            "learning_path": learning_path,
            "last_errors": errors
        }
    except Exception as e:
        print(f"Error in analyze: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/memory")
async def get_memory(dimension: str = "core"):
    try:
        tag_map = {"scandine": "SaaS_Scandine", "core": "Python_Core", "arch": "System_Design", "dsa": "Data_Structures_Algo"}
        dim_tag = tag_map.get(dimension.lower(), f"Dim_{dimension}")
        recalled = await hindsight.arecall(bank_id=BANK_ID, query="summarize progress", tags=[dim_tag])
        facts_list = [str(f) for f in recalled] if recalled else []
        return {"recalled_facts": facts_list}
    except Exception as e:
        return {"recalled_facts": []}

@app.delete("/memory")
async def clear_memory():
    try:
        await hindsight.adelete_bank(bank_id=BANK_ID)
        await hindsight.acreate_bank(bank_id=BANK_ID)
        return {"status": "success", "message": "Memory bank cleared and reset."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
