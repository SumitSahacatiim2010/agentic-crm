# STATE.md — Project Memory

> Last updated: 2026-03-01T02:04:00+05:30

## Current Position
- **Milestone**: v2.5 Production Readiness
- **Phase**: 6
- **Task**: Planning complete
- **Status**: Ready for execution

## Next Steps
1. /execute 6

## Session Context
### What was just completed
- Split Phase 6 into "Headless Microservices + MCP Tools" and "AI Agent Integration" (Phase 7).
- Created execution plans `6-1-PLAN.md` and `6-2-PLAN.md`.

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
