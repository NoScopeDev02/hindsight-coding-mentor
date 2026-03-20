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

print(f"DEBUG: HINDSIGHT_API_KEY starts with: {HINDSIGHT_API_KEY[:10] if HINDSIGHT_API_KEY else 'NONE'}")
print(f"DEBUG: BANK_ID: {BANK_ID}")

hindsight = Hindsight(
    api_key=HINDSIGHT_API_KEY, 
    base_url="https://api.hindsight.vectorize.io"
)
groq_client = Groq(api_key=GROQ_API_KEY)

class ChatRequest(BaseModel):
    user_msg: str
    dimension: str = "core" # Default dimension

@app.post("/chat")
async def chat(request: ChatRequest):
    user_msg = request.user_msg
    dim = request.dimension.lower()
    
    # Map friendly dimension IDs to storage tags
    tag_map = {
        "scandine": "SaaS_Scandine",
        "core": "Python_Core",
        "arch": "System_Design",
        "dsa": "Data_Structures_Algo"
    }
    dim_tag = tag_map.get(dim, f"Dim_{dim}")
    dim_name = dim_tag.replace('_', ' ')

    try:
        # 1. STRICT Dimensional Recall
        # We perform a strict tag search to ensure zero "context bleed" from other vaults.
        # We do NOT perform a global search unless the user specifically asks for it.
        recalled_facts = await hindsight.arecall(
            bank_id=BANK_ID, 
            query=user_msg, 
            tags=[dim_tag],
            tags_match="all_strict" # Force strict matching on the dimension tag
        )
        
        # 2. Advanced Context Handling
        context = ""
        facts_list = []
        is_fresh_dimension = False

        if recalled_facts and len(recalled_facts) > 0:
            facts_list = [str(f) for f in recalled_facts][:5]
            context = f"--- STRICT VAULT: [{dim_name.upper()}] ---\n" + "\n".join(facts_list)
        else:
            is_fresh_dimension = True
            context = f"--- SYSTEM NOTICE ---\nThis is a fresh dimension with no existing trace. Inform the user that we are starting from scratch for {dim_name}."

        # 3. Generate advice using Groq
        system_prompt = (
            f"You are a supportive peer mentor at Avinya Code. You are currently working strictly within the {dim_name} dimension. "
            "Pedagogical Rules:\n"
            f"1. STRICT ISOLATION: Do not reference, summarize, or bridge concepts from other dimensions (like SaaS or Arch) into this {dim_name} session. "
            "2. FRESH START: If there are no recalled memories, you MUST say: 'This is a fresh dimension. Let's start building your " + dim_name + " knowledge base from scratch.' "
            "3. NO CONTEXT BLEED: Do not allow concepts from one language/pattern to bleed into another unless the user asks for a comparison. "
            f"4. REINFORCEMENT: Always start with 'In this dimension [{dim_name}], we have achieved...' (or a variation if it's fresh). "
            "DO NOT use Markdown, asterisks, or bolding. Use only plain text and standard spacing."
        )
        
        prompt = f"{context}\n\nUser: {user_msg}\nMentor:"
        
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
        )
        
        mentor_response = chat_completion.choices[0].message.content

        # 4. Retain with Dimension Tag
        await hindsight.aretain(
            bank_id=BANK_ID, 
            content=f"User: {user_msg}\nMentor: {mentor_response}",
            tags=[dim_tag]
        )

        return {
            "mentor_message": mentor_response,
            "recalled_facts": facts_list
        }

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        import traceback
        traceback.print_exc()
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
        print(f"Error in get_memory: {e}")
        return {"recalled_facts": []} # Return empty list on error instead of 500

@app.delete("/memory")
async def clear_memory():
    try:
        await hindsight.adelete_bank(bank_id=BANK_ID)
        await hindsight.acreate_bank(bank_id=BANK_ID)
        return {"status": "success", "message": "Memory bank cleared and reset."}
    except Exception as e:
        print(f"Error clearing memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
