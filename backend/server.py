from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import json
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
import httpx
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------------- Models ----------------
def now_utc():
    return datetime.now(timezone.utc)


class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None


class Agent(BaseModel):
    id: str = Field(default_factory=lambda: f"agent_{uuid.uuid4().hex[:12]}")
    user_id: str
    name: str
    description: str = ""
    persona: str = "default"
    role: str = ""
    goal: str = ""
    background: str = ""
    expected_output: str = ""
    tone: str = "Warm, natural and professional"
    model_provider: str = "openai"
    model_name: str = "gpt-5.4"
    created_at: str = Field(default_factory=lambda: now_utc().isoformat())


class AgentCreate(BaseModel):
    name: str
    description: str = ""
    persona: str = "default"
    role: str = ""
    goal: str = ""
    background: str = ""
    expected_output: str = ""
    tone: str = "Warm, natural and professional"
    model_provider: str = "openai"
    model_name: str = "gpt-5.4"


class ChatIn(BaseModel):
    message: str


# ---------------- Auth ----------------
async def get_current_user(request: Request) -> User:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now_utc():
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user_doc)


class SessionIn(BaseModel):
    session_id: str


@api_router.post("/auth/session")
async def create_session(body: SessionIn, response: Response):
    async with httpx.AsyncClient() as hc:
        r = await hc.get(EMERGENT_AUTH_URL, headers={"X-Session-ID": body.session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Failed to validate session")
    data = r.json()

    existing = await db.users.find_one({"email": data["email"]}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data["name"], "picture": data.get("picture")}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": data["email"],
            "name": data["name"],
            "picture": data.get("picture"),
            "created_at": now_utc().isoformat(),
        })

    session_token = data["session_token"]
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (now_utc() + timedelta(days=7)).isoformat(),
        "created_at": now_utc().isoformat(),
    })

    response.set_cookie(
        key="session_token", value=session_token, httponly=True,
        secure=True, samesite="none", path="/", max_age=7 * 24 * 60 * 60,
    )
    return {"user_id": user_id, "email": data["email"], "name": data["name"], "picture": data.get("picture")}


@api_router.get("/auth/me", response_model=User)
async def auth_me(user: User = Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ---------------- Agents ----------------
@api_router.post("/agents", response_model=Agent)
async def create_agent(body: AgentCreate, user: User = Depends(get_current_user)):
    agent = Agent(user_id=user.user_id, **body.model_dump())
    await db.agents.insert_one(agent.model_dump())
    return agent


@api_router.get("/agents", response_model=List[Agent])
async def list_agents(user: User = Depends(get_current_user)):
    docs = await db.agents.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [Agent(**d) for d in docs]


@api_router.get("/agents/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str, user: User = Depends(get_current_user)):
    doc = await db.agents.find_one({"id": agent_id, "user_id": user.user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Agent not found")
    return Agent(**doc)


@api_router.put("/agents/{agent_id}", response_model=Agent)
async def update_agent(agent_id: str, body: AgentCreate, user: User = Depends(get_current_user)):
    doc = await db.agents.find_one({"id": agent_id, "user_id": user.user_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Agent not found")
    await db.agents.update_one({"id": agent_id}, {"$set": body.model_dump()})
    doc.update(body.model_dump())
    return Agent(**doc)


@api_router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str, user: User = Depends(get_current_user)):
    res = await db.agents.delete_one({"id": agent_id, "user_id": user.user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Agent not found")
    await db.messages.delete_many({"agent_id": agent_id})
    await db.documents.delete_many({"agent_id": agent_id})
    return {"ok": True}


# ---------------- Chat ----------------
def build_system_prompt(agent: dict, history: List[dict], docs: Optional[List[dict]] = None) -> str:
    parts = [
        f"You are {agent.get('name', 'an AI agent')}, a highly capable all-around personal assistant.",
        f"ROLE: {agent.get('role') or 'A versatile expert assistant.'}",
        f"PRIMARY GOAL: {agent.get('goal') or 'Help the user succeed at their objective.'}",
        f"BACKGROUND & EXPERTISE: {agent.get('background') or 'Broad, deep, cross-domain expertise.'}",
        f"EXPECTED OUTPUT STYLE: {agent.get('expected_output') or 'Clear, structured, actionable responses.'}",
        f"TONE & PERSONALITY: {agent.get('tone') or 'Warm, natural, professional.'}",
        "",
        "CORE OPERATING PRINCIPLES (always follow):",
        "1. Be natural, authentic and genuinely conversational — never robotic.",
        "2. Always think TWO STEPS AHEAD. Don't just answer; anticipate what the user will need next.",
        "3. After answering, proactively GUIDE the user toward the single next best step.",
        "4. For every recommended step, briefly explain WHAT it is, WHY you chose it, and WHY it's the best route for their situation.",
        "5. Be thorough yet concise. Prefer structure (short sections, tight bullets) over walls of text.",
        "6. If information is missing, make one smart assumption and state it, rather than stalling with questions.",
        "",
        "Always end your response with a short section titled \"Next best step\" containing exactly one recommended action and a one-line rationale.",
    ]
    if docs:
        parts.append("\nKNOWLEDGE BASE — the user has attached the following reference documents. Use them as authoritative context when relevant and cite the document name when you rely on it:")
        for d in docs:
            snippet = (d.get("text") or "")[:6000]
            parts.append(f"\n--- DOCUMENT: {d.get('filename')} ---\n{snippet}")
    if history:
        parts.append("\nCONVERSATION SO FAR:")
        for m in history[-20:]:
            role = "User" if m["role"] == "user" else "You"
            parts.append(f"{role}: {m['content']}")
    return "\n".join(parts)


def extract_text(filename: str, data: bytes) -> str:
    name = filename.lower()
    try:
        if name.endswith(".pdf"):
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(data))
            return "\n".join((page.extract_text() or "") for page in reader.pages)
        if name.endswith(".docx"):
            import docx
            doc = docx.Document(io.BytesIO(data))
            return "\n".join(p.text for p in doc.paragraphs)
        return data.decode("utf-8", errors="ignore")
    except Exception as e:
        logging.exception("extract failed")
        return ""


@api_router.get("/agents/{agent_id}/messages")
async def get_messages(agent_id: str, user: User = Depends(get_current_user)):
    agent = await db.agents.find_one({"id": agent_id, "user_id": user.user_id}, {"_id": 0})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    msgs = await db.messages.find({"agent_id": agent_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return msgs


# ---------------- Knowledge base ----------------
async def _require_agent(agent_id: str, user: User) -> dict:
    agent = await db.agents.find_one({"id": agent_id, "user_id": user.user_id}, {"_id": 0})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@api_router.post("/agents/{agent_id}/documents")
async def upload_document(agent_id: str, file: UploadFile = File(...), user: User = Depends(get_current_user)):
    await _require_agent(agent_id, user)
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 5MB)")
    text = extract_text(file.filename, data)
    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not read any text from this file")
    doc = {
        "id": f"doc_{uuid.uuid4().hex[:12]}",
        "agent_id": agent_id,
        "filename": file.filename,
        "text": text,
        "chars": len(text),
        "created_at": now_utc().isoformat(),
    }
    await db.documents.insert_one({k: v for k, v in doc.items()})
    return {"id": doc["id"], "filename": doc["filename"], "chars": doc["chars"], "created_at": doc["created_at"]}


@api_router.get("/agents/{agent_id}/documents")
async def list_documents(agent_id: str, user: User = Depends(get_current_user)):
    await _require_agent(agent_id, user)
    docs = await db.documents.find({"agent_id": agent_id}, {"_id": 0, "text": 0}).sort("created_at", 1).to_list(100)
    return docs


@api_router.delete("/agents/{agent_id}/documents/{doc_id}")
async def delete_document(agent_id: str, doc_id: str, user: User = Depends(get_current_user)):
    await _require_agent(agent_id, user)
    res = await db.documents.delete_one({"id": doc_id, "agent_id": agent_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"ok": True}


def _make_chat(agent: dict, history: List[dict], docs: List[dict]) -> LlmChat:
    system_prompt = build_system_prompt(agent, history, docs)
    return LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"{agent['id']}",
        system_message=system_prompt,
    ).with_model(agent.get("model_provider", "openai"), agent.get("model_name", "gpt-5.4"))


@api_router.post("/agents/{agent_id}/chat/stream")
async def chat_stream(agent_id: str, body: ChatIn, user: User = Depends(get_current_user)):
    agent = await _require_agent(agent_id, user)
    history = await db.messages.find({"agent_id": agent_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    docs = await db.documents.find({"agent_id": agent_id}, {"_id": 0}).sort("created_at", 1).to_list(100)

    await db.messages.insert_one({
        "id": f"msg_{uuid.uuid4().hex[:12]}", "agent_id": agent_id, "role": "user",
        "content": body.message, "created_at": now_utc().isoformat(),
    })

    chat_client = _make_chat(agent, history, docs)

    async def event_generator():
        collected = []
        try:
            async for ev in chat_client.stream_message(UserMessage(text=body.message)):
                if isinstance(ev, TextDelta):
                    collected.append(ev.content)
                    yield f"data: {json.dumps({'delta': ev.content})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logging.exception("stream error")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        text = "".join(collected)
        if text:
            await db.messages.insert_one({
                "id": f"msg_{uuid.uuid4().hex[:12]}", "agent_id": agent_id, "role": "assistant",
                "content": text, "created_at": now_utc().isoformat(),
            })
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


@api_router.post("/agents/{agent_id}/chat")
async def chat(agent_id: str, body: ChatIn, user: User = Depends(get_current_user)):
    agent = await _require_agent(agent_id, user)

    history = await db.messages.find({"agent_id": agent_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    docs = await db.documents.find({"agent_id": agent_id}, {"_id": 0}).sort("created_at", 1).to_list(100)

    await db.messages.insert_one({
        "id": f"msg_{uuid.uuid4().hex[:12]}", "agent_id": agent_id, "role": "user",
        "content": body.message, "created_at": now_utc().isoformat(),
    })

    chat_client = _make_chat(agent, history, docs)

    try:
        reply = await chat_client.send_message(UserMessage(text=body.message))
    except Exception as e:
        logging.exception("LLM error")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")

    reply_text = reply if isinstance(reply, str) else str(reply)
    msg_doc = {
        "id": f"msg_{uuid.uuid4().hex[:12]}", "agent_id": agent_id, "role": "assistant",
        "content": reply_text, "created_at": now_utc().isoformat(),
    }
    await db.messages.insert_one({k: v for k, v in msg_doc.items()})
    return {"role": "assistant", "content": reply_text, "id": msg_doc["id"], "created_at": msg_doc["created_at"]}


@api_router.get("/")
async def root():
    return {"message": "Agent Forge API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
