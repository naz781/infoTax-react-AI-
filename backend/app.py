from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.llms import Ollama
from langchain_qdrant import Qdrant
from qdrant_client import QdrantClient
# CONFIG 
QDRANT_URL = "http://localhost:6333"
COLLECTION_NAME = "mybot8_local_20251017_150632"

# INITIALIZE FASTAPI
app = FastAPI(title="Lecture Chatbot API")

# Allow OpenWebUI (or browser) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict to your OpenWebUI origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# LOAD EMBEDDINGS AND LLM
embedding = OllamaEmbeddings(model="nomic-embed-text:latest")
llm = Ollama(model="llama3.2:1b")

# INITIALIZE QDRANT VECTOR DB
client = QdrantClient(url=QDRANT_URL)
try:
    vectordb = Qdrant.from_existing_collection(
        embedding=embedding,
        collection_name=COLLECTION_NAME,
        url=QDRANT_URL
    )
except Exception as e:
    raise RuntimeError(f"Failed to connect to Qdrant collection: {e}")

# HELPER FUNCTION
def limit_context_by_tokens(docs, max_chars=6000):
    total_text = ""
    selected_docs = []
    for d in docs:
        if len(total_text) + len(d.page_content) > max_chars:
            break
        total_text += d.page_content + "\n"
        selected_docs.append(d)
    return selected_docs, total_text

# SESSION MANAGEMENT session_id -> list of messages
sessions = {}
next_session_id = 1

# DATA MODELS
class ChatRequest(BaseModel):
    input: str
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    output: str
    session_id: int

# OPENWEBUI COMPATIBLE ENDPOINT
@app.post("/chat")
def chat_owui(req: ChatRequest):
    """
    OpenWebUI-compatible endpoint.
    Expects JSON: {"input": "<USER_MESSAGE>", "session_id": optional int}
    Returns JSON: {"output": "<LLM_REPLY>", "session_id": <int>}
    """
    global next_session_id

    user_input = req.input
    session_id = req.session_id

    # Assign session ID
    if session_id is None:
        session_id = next_session_id
        next_session_id += 1
        sessions[session_id] = []

    if session_id not in sessions:
        sessions[session_id] = []

    history = sessions[session_id]

    # Append user message
    history.append({"role": "user", "content": user_input})

    # Retrieve relevant docs
    docs_filtered = vectordb.similarity_search(user_input, k=5)
    limited_docs, context = limit_context_by_tokens(docs_filtered, max_chars=6000)

    # Build conversation + context prompt
    conversation_text = ""
    for msg in history[-10:]:  # last 10 messages
        conversation_text += f"{msg['role'].capitalize()}: {msg['content']}\n"

    # prompt = (
    #     f"You are a helpful lecture assistant.\n"
    #     f"Context:\n{context}\n\n"
    #     f"Conversation so far:\n{conversation_text}\n"
    #     f"Answer the last question clearly."
    # )
    prompt = f"""
<System>
You are a helpful Lecture Assistant that helps students understand their course material.

Your behavior rules:
1. If the user greets you or says something casual (e.g., "hi", "hello", "hey", "good morning", "thanks", "how are you"), 
   respond politely and naturally but DO NOT use any lecture context or retrieved material.
2. Only use the provided <Context> if the user's question is academic or related to lecture content.
3. If the user asks something general or conversational, ignore the context completely.
4. Always give concise, clear, and correct answers.

</System>

<Context>
{context}
</Context>

<Conversation>
{conversation_text}
</Conversation>

Now, respond appropriately to the user’s latest message.
"""

    # Get LLM reply
    reply = llm.invoke(prompt)
    history.append({"role": "assistant", "content": reply})
    sessions[session_id] = history

    return {"output": reply, "session_id": session_id}

# OPTIONAL: List all sessions / full chat
@app.get("/sessions")
def get_sessions():
    return {sid: len(msgs) for sid, msgs in sessions.items()}

@app.get("/session/{session_id}")
def get_session(session_id: int):
    if session_id not in sessions:
        return {"error": "Session not found"}
    return sessions[session_id]
@app.get("/")
def root():
    return {"status": "Backend running!"}
 