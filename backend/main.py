import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from hindsight_client import Hindsight
from groq import Groq

# Load environment variables
load_dotenv()

app = FastAPI(title="Hindsight AI Coding Practice Mentor")

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

if not all([HINDSIGHT_API_KEY, BANK_ID, GROQ_API_KEY]):
    print("WARNING: Missing environment variables. Please check your .env file.")

hindsight = Hindsight(
    api_key=HINDSIGHT_API_KEY, 
    base_url="https://api.hindsight.vectorize.io"
)
groq_client = Groq(api_key=GROQ_API_KEY)

class ChatRequest(BaseModel):
    user_msg: str

@app.post("/chat")
async def chat(request: ChatRequest):
    user_msg = request.user_msg

    try:
        # 1. Recall past memories/mistakes using the ASYNC method 'arecall'
        recalled_facts = await hindsight.arecall(bank_id=BANK_ID, query=user_msg)
        
        # Format context for Groq
        context = ""
        facts_list = []
        if recalled_facts:
            # recalled_facts might be a RecallResponse object, checking if it's iterable
            # LIMIT to top 5 facts to avoid token limit errors
            facts_list = [str(f) for f in recalled_facts][:5]
            context = "Context from past sessions:\n" + "\n".join(facts_list)

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

        # 3. Retain current turn using the ASYNC method 'aretain'
        await hindsight.aretain(bank_id=BANK_ID, content=f"User: {user_msg}\nMentor: {mentor_response}")

        return {
            "mentor_message": mentor_response,
            "recalled_facts": facts_list
        }

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        # Log more details if possible
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/memory")
async def clear_memory():
    try:
        # Based on the earlier inspect output, the Hindsight client has 'adelete_bank' and 'acreate_bank'
        await hindsight.adelete_bank(bank_id=BANK_ID)
        await hindsight.acreate_bank(bank_id=BANK_ID)
        return {"status": "success", "message": "Memory bank cleared and reset."}
    except Exception as e:
        print(f"Error clearing memory: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
