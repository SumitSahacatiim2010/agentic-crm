# STATE.md — Project Memory

> Last updated: 2026-03-01T02:04:00+05:30

## Current Position
- **Milestone**: v2.5 Production Readiness
- **Phase**: 7 (completed)
- **Status**: ✅ AI Agent Integration complete

## Session Context
### What was just completed
- Installed `@google/genai` SDK for Gemini API with native tool-calling.
- Created `tool-declarations.ts` with 11 FunctionDeclarations mapped to Phase 6 microservices.
- Created `tool-executor.ts` dispatch layer and `gemini-agent.ts` core agent engine.
- Created `/api/agents/chat` and `/api/agents/orchestrate` API routes.
- Built `AIAssistantPanel.tsx` floating chat panel integrated into root layout.
- Phase 7 Execution fully completed.

## Next Steps
1. /verify 7

### Key files modified recently
- `src/components/home/PersonaLayout.tsx` — profile dropdown, Global Admin quick links
- `src/lib/date-utils.ts` — centralized ISO date formatting
- `src/lib/crm-service.ts` — executive KPI calculations

### Blockers
- None

## Architecture Notes

- 22 routes under `src/app/`
- 20 component domains under `src/components/`
- 56 API routes under `src/app/api/`
- InsForge MCP provides Postgres via `@insforge/sdk` and `@insforge/nextjs`
- Two MCP servers available: `my-first-project` (primary) and `banking-crm-2-5`

## Decision Log Reference
See DECISIONS.md for architectural choices.
