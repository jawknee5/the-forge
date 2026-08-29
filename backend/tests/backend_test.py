"""Agent Forge backend API tests (auth, agents CRUD, chat, model interchangeability)."""
import os
import re
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")


@pytest.fixture(scope="session")
def session_token():
    p = Path("/app/memory/test_credentials.md")
    if not p.exists():
        pytest.skip("missing test_credentials.md")
    m = re.search(r'session_token[^\n]*:\s*`([^`]+)`', p.read_text())
    if not m:
        pytest.skip("no session_token in test_credentials.md")
    return m.group(1)


@pytest.fixture(scope="session")
def client(session_token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json",
                      "Authorization": f"Bearer {session_token}"})
    return s


@pytest.fixture(scope="session")
def anon():
    return requests.Session()


@pytest.fixture(scope="module")
def created_agent_ids():
    return []


@pytest.fixture(scope="module", autouse=True)
def cleanup(client, created_agent_ids):
    yield
    for aid in created_agent_ids:
        client.delete(f"{BASE_URL}/api/agents/{aid}", timeout=30)


# ---------- Auth ----------
class TestAuth:
    def test_root(self, anon):
        r = anon.get(f"{BASE_URL}/api/", timeout=30)
        assert r.status_code == 200
        assert "message" in r.json()

    def test_me_with_bearer(self, client):
        r = client.get(f"{BASE_URL}/api/auth/me", timeout=30)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert d["user_id"] == "test-user-forge"
        assert d["email"] == "forge.tester@example.com"
        assert "_id" not in d

    def test_me_with_cookie(self, session_token):
        r = requests.get(f"{BASE_URL}/api/auth/me",
                         cookies={"session_token": session_token}, timeout=30)
        assert r.status_code == 200
        assert r.json()["user_id"] == "test-user-forge"

    def test_me_unauthenticated(self, anon):
        r = anon.get(f"{BASE_URL}/api/auth/me", timeout=30)
        assert r.status_code == 401

    def test_me_invalid_token(self, anon):
        r = anon.get(f"{BASE_URL}/api/auth/me",
                     headers={"Authorization": "Bearer bogus_token_xyz"}, timeout=30)
        assert r.status_code == 401

    def test_session_invalid_id(self, anon):
        r = anon.post(f"{BASE_URL}/api/auth/session",
                      json={"session_id": "not-a-real-session"}, timeout=60)
        assert r.status_code == 401

    def test_session_missing_body(self, anon):
        r = anon.post(f"{BASE_URL}/api/auth/session", json={}, timeout=30)
        assert r.status_code == 422


# ---------- Agents CRUD ----------
AGENT_PAYLOAD = {
    "name": "TEST_Legal Eagle",
    "description": "Contract review assistant",
    "persona": "law",
    "role": "Senior contracts attorney",
    "goal": "Spot risky clauses in vendor agreements",
    "background": "15 years in commercial law",
    "expected_output": "Bulleted risk list with severity",
    "tone": "Precise and authoritative",
    "model_provider": "openai",
    "model_name": "gpt-5.4",
}


class TestAgentsCRUD:
    def test_agents_require_auth(self, anon):
        assert anon.get(f"{BASE_URL}/api/agents", timeout=30).status_code == 401
        assert anon.post(f"{BASE_URL}/api/agents", json=AGENT_PAYLOAD, timeout=30).status_code == 401

    def test_create_validation(self, client):
        r = client.post(f"{BASE_URL}/api/agents", json={"description": "no name"}, timeout=30)
        assert r.status_code == 422

    def test_create_get_update_delete(self, client, created_agent_ids):
        r = client.post(f"{BASE_URL}/api/agents", json=AGENT_PAYLOAD, timeout=30)
        assert r.status_code == 200, r.text[:300]
        a = r.json()
        aid = a["id"]
        created_agent_ids.append(aid)
        assert a["user_id"] == "test-user-forge"
        for k, v in AGENT_PAYLOAD.items():
            assert a[k] == v, f"{k} mismatch"
        assert "_id" not in a

        # GET
        g = client.get(f"{BASE_URL}/api/agents/{aid}", timeout=30)
        assert g.status_code == 200
        assert g.json()["name"] == AGENT_PAYLOAD["name"]
        assert g.json()["persona"] == "law"

        # LIST
        ls = client.get(f"{BASE_URL}/api/agents", timeout=30)
        assert ls.status_code == 200
        assert isinstance(ls.json(), list)
        assert any(x["id"] == aid for x in ls.json())

        # UPDATE
        upd = dict(AGENT_PAYLOAD, name="TEST_Legal Eagle v2", tone="Blunt")
        u = client.put(f"{BASE_URL}/api/agents/{aid}", json=upd, timeout=30)
        assert u.status_code == 200
        assert u.json()["name"] == "TEST_Legal Eagle v2"
        g2 = client.get(f"{BASE_URL}/api/agents/{aid}", timeout=30)
        assert g2.json()["name"] == "TEST_Legal Eagle v2"
        assert g2.json()["tone"] == "Blunt"
        assert g2.json()["id"] == aid

        # DELETE
        d = client.delete(f"{BASE_URL}/api/agents/{aid}", timeout=30)
        assert d.status_code == 200
        assert client.get(f"{BASE_URL}/api/agents/{aid}", timeout=30).status_code == 404
        created_agent_ids.remove(aid)

    def test_get_nonexistent(self, client):
        assert client.get(f"{BASE_URL}/api/agents/agent_doesnotexist", timeout=30).status_code == 404

    def test_update_nonexistent(self, client):
        r = client.put(f"{BASE_URL}/api/agents/agent_nope", json=AGENT_PAYLOAD, timeout=30)
        assert r.status_code == 404

    def test_delete_nonexistent(self, client):
        assert client.delete(f"{BASE_URL}/api/agents/agent_nope", timeout=30).status_code == 404

    def test_user_scoping(self, client, anon, created_agent_ids):
        """Agent created by seeded user must not be readable by another user's session."""
        r = client.post(f"{BASE_URL}/api/agents", json=dict(AGENT_PAYLOAD, name="TEST_Scoped"), timeout=30)
        aid = r.json()["id"]
        created_agent_ids.append(aid)
        other = anon.get(f"{BASE_URL}/api/agents/{aid}",
                         headers={"Authorization": "Bearer other_user_token"}, timeout=30)
        assert other.status_code == 401


# ---------- Chat ----------
class TestChat:
    @pytest.fixture(scope="class")
    def chat_agent(self, client, created_agent_ids):
        r = client.post(f"{BASE_URL}/api/agents", json=dict(
            AGENT_PAYLOAD, name="TEST_Chat Agent", persona="finance",
            role="Startup CFO", goal="Build a 12-month runway plan",
            expected_output="Short structured plan"), timeout=30)
        assert r.status_code == 200
        aid = r.json()["id"]
        created_agent_ids.append(aid)
        return aid

    def test_chat_requires_auth(self, anon, chat_agent):
        r = anon.post(f"{BASE_URL}/api/agents/{chat_agent}/chat", json={"message": "hi"}, timeout=30)
        assert r.status_code == 401

    def test_chat_nonexistent_agent(self, client):
        r = client.post(f"{BASE_URL}/api/agents/agent_nope/chat", json={"message": "hi"}, timeout=60)
        assert r.status_code == 404

    def test_messages_empty_initially(self, client, chat_agent):
        r = client.get(f"{BASE_URL}/api/agents/{chat_agent}/messages", timeout=30)
        assert r.status_code == 200
        assert r.json() == []

    def test_chat_openai_and_persistence(self, client, chat_agent):
        r = client.post(f"{BASE_URL}/api/agents/{chat_agent}/chat",
                        json={"message": "We have $200k in the bank and burn $30k/mo. What now?"},
                        timeout=180)
        assert r.status_code == 200, r.text[:500]
        d = r.json()
        assert d["role"] == "assistant"
        assert isinstance(d["content"], str) and len(d["content"]) > 50
        assert "next best step" in d["content"].lower(), d["content"][-300:]

        msgs = client.get(f"{BASE_URL}/api/agents/{chat_agent}/messages", timeout=30).json()
        assert len(msgs) == 2
        assert msgs[0]["role"] == "user"
        assert msgs[1]["role"] == "assistant"
        assert msgs[1]["content"] == d["content"]
        assert all("_id" not in m for m in msgs)

    def test_chat_history_order_second_turn(self, client, chat_agent):
        r = client.post(f"{BASE_URL}/api/agents/{chat_agent}/chat",
                        json={"message": "Summarize what I just told you in one line."}, timeout=180)
        assert r.status_code == 200, r.text[:500]
        msgs = client.get(f"{BASE_URL}/api/agents/{chat_agent}/messages", timeout=30).json()
        assert len(msgs) == 4
        assert [m["role"] for m in msgs] == ["user", "assistant", "user", "assistant"]
        # history injection: reply should reference prior context (burn/runway/200k)
        low = msgs[3]["content"].lower()
        assert any(k in low for k in ["burn", "runway", "200", "30k"]), low[:400]

    def test_chat_empty_message(self, client, chat_agent):
        r = client.post(f"{BASE_URL}/api/agents/{chat_agent}/chat", json={}, timeout=30)
        assert r.status_code == 422

    def test_delete_agent_removes_messages(self, client):
        r = client.post(f"{BASE_URL}/api/agents", json=dict(AGENT_PAYLOAD, name="TEST_Del Msgs"), timeout=30)
        aid = r.json()["id"]
        c = client.post(f"{BASE_URL}/api/agents/{aid}/chat", json={"message": "Say hello briefly."}, timeout=180)
        assert c.status_code == 200, c.text[:300]
        assert client.delete(f"{BASE_URL}/api/agents/{aid}", timeout=30).status_code == 200
        assert client.get(f"{BASE_URL}/api/agents/{aid}/messages", timeout=30).status_code == 404


# ---------- Model interchangeability ----------
@pytest.mark.parametrize("provider,model", [
    ("anthropic", "claude-sonnet-4-6"),
    ("gemini", "gemini-3-flash-preview"),
])
def test_model_interchangeability(client, created_agent_ids, provider, model):
    r = client.post(f"{BASE_URL}/api/agents", json=dict(
        AGENT_PAYLOAD, name=f"TEST_{provider}", model_provider=provider, model_name=model), timeout=30)
    assert r.status_code == 200
    aid = r.json()["id"]
    created_agent_ids.append(aid)
    assert r.json()["model_provider"] == provider
    assert r.json()["model_name"] == model
    c = client.post(f"{BASE_URL}/api/agents/{aid}/chat",
                    json={"message": "In 2 sentences, what should I check first in a vendor NDA?"}, timeout=180)
    assert c.status_code == 200, f"{provider}/{model} failed: {c.text[:500]}"
    assert len(c.json()["content"]) > 30
