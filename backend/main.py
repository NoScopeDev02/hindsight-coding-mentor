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
    
    # Map friendly dimension IDs to storage tags
    tag_map = {
        "scandine": "SaaS_Scandine",
        "core": "Python_Core",
        "arch": "System_Design"
    }
    dim_tag = tag_map.get(dim, f"Dim_{dim}")

    try:
        # 1. Multi-Dimensional Recall
        # Priority 1: Current Dimension
        local_recalled = await hindsight.arecall(
            bank_id=BANK_ID, 
            query=user_msg, 
            tags=[dim_tag]
        )
        
        # Priority 2: Global Context (All dimensions) for cross-pollination
        global_recalled = await hindsight.arecall(bank_id=BANK_ID, query=user_msg)

        # 2. Advanced Context Grouping
        # We'll filter global results to see what happened in OTHER dimensions if the user asks about history
        is_history_query = any(word in user_msg.lower() for word in ["previous error", "past mistake", "history", "what did i do", "remember"])
        
        context_blocks = []
        if local_recalled:
            local_facts = [str(f) for f in local_recalled][:5]
            context_blocks.append(f"--- CURRENT DIMENSION [{dim_tag.upper()}] MEMORIES ---\n" + "\n".join(local_facts))
        
        if is_history_query and global_recalled:
            # Group global facts by their tags to prevent 'Mental Clutter'
            other_dims = {}
            for fact in global_recalled:
                # fact is a RecallResult, checking if it has tags
                ftags = getattr(fact, 'tags', [])
                if ftags:
                    tag = ftags[0]
                    if tag != dim_tag:
                        if tag not in other_dims: other_dims[tag] = []
                        other_dims[tag].append(str(fact))
            
            if other_dims:
                context_blocks.append("\n--- CROSS-DIMENSION CONTEXT (OTHER VAULTS) ---")
                for tag, facts in other_dims.items():
                    context_blocks.append(f"In {tag.replace('_', ' ')}, you encountered:\n" + "\n".join(facts[:2]))

        context = "\n\n".join(context_blocks)

        # 3. Generate advice using Groq
        dim_name = dim_tag.replace('_', ' ')
        system_prompt = (
            f"You are a supportive peer mentor at Avinya Code. You are currently mentoring in the {dim_name} dimension. "
            "Your goal is to guide the user with empathy and technical depth. Acknowledge personal projects (like Scandine or the Ice Factory) as valid context. "
            f"STRICTLY isolate your main response to facts and progress within the {dim_name} dimension. "
            f"Begin your response or summary by saying: 'In this dimension [{dim_name}], we have achieved...' to reinforce the UI selection. "
            "If providing a summary, perform a 'Dimension Deep Dive' into the current vault first. "
            "Only mention other dimensions (like Python Core or System Design) in a small 'Related Insights' section at the very end of your message, rather than mixing them into the main body. "
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

        # Final facts list for the sidebar
        facts_list = [str(f) for f in local_recalled][:10] if local_recalled else []

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
        tag_map = {"scandine": "SaaS_Scandine", "core": "Python_Core", "arch": "System_Design"}
        dim_tag = tag_map.get(dimension.lower(), f"Dim_{dimension}")
        
        recalled = await hindsight.arecall(bank_id=BANK_ID, query="summarize progress", tags=[dim_tag])
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
