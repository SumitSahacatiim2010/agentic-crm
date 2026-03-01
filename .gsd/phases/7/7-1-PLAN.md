# Phase 7: AI Agent Integration (Gemini API)

Build goal-oriented AI agents using the **Gemini API** (`@google/genai`) with native tool-calling to autonomously execute banking CRM journeys via the Phase 6 microservices.

## Key Decision

> [!TIP]
> **Gemini native tool-calling** replaces the custom ReAct loop. The `@google/genai` SDK supports `functionDeclarations` — the model returns structured `functionCall` objects that we dispatch directly to microservices. No prompt engineering for action parsing needed.

## Proposed Changes

### Dependencies
- **Install**: `@google/genai` (Gemini SDK)
- **Env var**: `GEMINI_API_KEY` in `.env.local`

---

### Core Agent Engine

#### [NEW] [gemini-agent.ts](file:///d:/00%20WorkSpace/bankingcrm3/src/lib/agents/gemini-agent.ts)
- Wraps `@google/genai` with `functionDeclarations` mapped to Phase 6 microservices
- Handles the tool-call loop: prompt → model returns `functionCall` → execute service → feed result back → model synthesizes answer
- Supports streaming via `generateContentStream`

#### [NEW] [tool-declarations.ts](file:///d:/00%20WorkSpace/bankingcrm3/src/lib/agents/tool-declarations.ts)
- Converts Phase 6 service signatures into Gemini `FunctionDeclaration[]` format
- Maps: `ingest_lead`, `update_bant`, `convert_lead`, `create_opportunity`, `save_onboarding_progress`, `submit_credit_application`, `update_credit_decision`

#### [NEW] [tool-executor.ts](file:///d:/00%20WorkSpace/bankingcrm3/src/lib/agents/tool-executor.ts)
- Dispatch layer: receives `functionCall.name` + `functionCall.args` → calls the matching `src/services/*` function → returns result

---

### API Layer

#### [NEW] [chat/route.ts](file:///d:/00%20WorkSpace/bankingcrm3/src/app/api/agents/chat/route.ts)
- Generic agent chat endpoint (streaming)
- System prompt: banking RM assistant with access to CRM tools
- Accepts `{ message, history?, customerId? }`

#### [NEW] [orchestrate/route.ts](file:///d:/00%20WorkSpace/bankingcrm3/src/app/api/agents/orchestrate/route.ts)
- Journey orchestration endpoint (J1/J2/J3)
- System prompt includes journey step maps
- Accepts `{ journey: 'J1'|'J2'|'J3', goal, context }`

---

### UI Integration

#### [MODIFY] [RelationshipManagerDashboard.tsx](file:///d:/00%20WorkSpace/bankingcrm3/src/components/dashboard/RelationshipManagerDashboard.tsx)
- Add collapsible "AI Assistant" panel with chat input + streaming response display
- Quick-action buttons: "Draft Email", "Qualify Lead", "Create Opportunity"

## Verification Plan

### Automated
- `npx tsc --noEmit` — zero errors
- Browser test: open RM dashboard → type "Create a lead for John Doe" → verify lead appears in DB

### Manual
- Confirm streaming responses render token-by-token in the AI panel
- Verify tool-call logs show correct microservice dispatch
