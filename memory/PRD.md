# Agent Forge — PRD

## Original problem statement
Build a web/mobile app to build and configure custom AI agents tailored to a user's project-specific needs. Agents act as all-around personal assistants specializing in whatever role/goal/background/expected output the user assigns; responses natural, informative, always two steps ahead (guide to next best step + rationale). Provide powerful pre-configured templates users can pick and tweak. Config fields have dropdown "smart suggestions". Sleek dark/futuristic UI that adapts visuals per configured agent persona. Google login. Interchangeable, free-to-use models.

## Architecture
- Frontend: React 19 + Tailwind + shadcn + framer-motion. Persona-adaptive theming via CSS variables (ThemeContext). react-markdown for AI replies.
- Backend: FastAPI, all routes under /api. Emergent-managed Google OAuth (session cookie). LLM via emergentintegrations `LlmChat` (Universal Key `EMERGENT_LLM_KEY`), interchangeable providers (OpenAI/Anthropic/Gemini) per agent.
- DB: MongoDB — collections: users, user_sessions, agents, messages.

## User persona
Solo builders / professionals who want a tailored AI assistant per project (legal, research, finance, creative, health, startup, marketing, coaching).

## Core requirements (static)
- Google login, per-user agent workspace.
- Create/configure agents: name, description, persona, role, goal, background, expected output, tone, model.
- Smart-suggestion chips per config field.
- 8 powerful templates, one-tap apply + tweak.
- Chat with agent; proactive "Next best step" guidance; persistent history.
- Persona-adaptive dark futuristic UI.

## Implemented (2026-06)
- Emergent Google OAuth: /api/auth/session, /api/auth/me, /api/auth/logout (cookie + Bearer).
- Agents CRUD (user-scoped): /api/agents [POST/GET], /api/agents/{id} [GET/PUT/DELETE].
- Chat: /api/agents/{id}/chat (LLM, history injected, persists messages), /api/agents/{id}/messages.
- Frontend: Login, AuthCallback, Dashboard (agents grid + templates), Builder (split config + live preview), Chat (markdown, persona theme).
- Model interchangeability verified (openai gpt-5.4, anthropic claude-sonnet-4-6, gemini-3-flash-preview).
- Backend 23/23 automated tests pass; frontend functional flows pass. Markdown render + chat layout polish fixed.

## Backlog (prioritized)
- P1: Filter smart-suggestion chips by selected persona.
- P2: Validate agent name non-empty + model allow-list in AgentCreate; unique index on user_sessions.session_token + cleanup old sessions on login.
- P2: Streaming responses (currently non-streaming send_message).
- P2: Knowledge base uploads (docs the agent references) — object storage.
- P2: Tools/capabilities (web search) per agent.
- P3: Mobile viewport polish pass.

## Notes
- ngrok: user wants to use it in future; app is env-var driven and portable.
- test_credentials.md / auth_testing.md maintained for testing.
