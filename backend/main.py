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
    dimension: str = "core" # Default dimension

@app.post("/chat")
async def chat(request: ChatRequest):
    user_msg = request.user_msg
    dim = request.dimension.lower()

    try:
        # 1. Recall past memories for the specific dimension/tag first
        # We use 'any' match for the dimension tag.
        recalled_facts = await hindsight.arecall(
            bank_id=BANK_ID, 
            query=user_msg, 
            tags=[dim]
        )
        
        # If no local dimension matches, perform a 'Global Search' (all tags)
        if not recalled_facts or len(recalled_facts) == 0:
            recalled_facts = await hindsight.arecall(bank_id=BANK_ID, query=user_msg)

        # Format context for Groq
        context = ""
        facts_list = []
        if recalled_facts:
            facts_list = [str(f) for f in recalled_facts][:5]
            context = f"Context from past sessions [{dim.upper()}]:\n" + "\n".join(facts_list)

        # 2. Generate advice using Groq
        system_prompt = (
            "You are a supportive peer mentor, not a rigid teacher. Your goal is to guide the user "
            "through coding challenges with empathy and technical depth. Acknowledge personal projects "
            "(like Scandine or the Ice Factory) as valid and valuable context for learning. "
            "Instead of forcing the user back to a specific task, be curious: ask how a new project or "
            "idea relates to what you've been learning together. Emphasize patterns they've struggled with "
            "or preferences they've expressed in the past, but always in a collaborative, peer-to-peer tone. "
            "DO NOT use Markdown, asterisks, or bolding in your responses. Use only plain text and standard spacing."
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

        # 3. Retain current turn with the dimension tag
        await hindsight.aretain(
            bank_id=BANK_ID, 
            content=f"User: {user_msg}\nMentor: {mentor_response}",
            tags=[dim]
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
        # Fetch facts for the specific dimension to refresh the sidebar
        recalled = await hindsight.arecall(bank_id=BANK_ID, query="summarize progress", tags=[dimension.lower()])
        facts_list = [str(f) for f in recalled]
        return {"recalled_facts": facts_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
