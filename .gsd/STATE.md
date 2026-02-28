# STATE.md — Project Memory

> Last updated: 2026-03-01T02:04:00+05:30

## Current Position
- **Milestone**: v2.5 Production Readiness
- **Phase**: 6 (completed)
- **Task**: All tasks complete
- **Status**: Executed, awaiting verification

## Session Context
### What was just completed
- Extracted `lead-service.ts`, `opportunity-service.ts`, `onboarding-service.ts`, and `credit-service.ts`.
- Refactored `api/leads`, `api/opportunities`, `api/onboarding`, and `api/credit` to use headless services.
- Created `src/mcp/server.ts` and `src/mcp/tools.ts` with Zod schemas for 7 journey tools.
- Phase 6 Execution fully completed.

## Next Steps
1. /verify 6

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
