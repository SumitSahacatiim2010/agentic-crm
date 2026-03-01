# STATE.md — Project Memory

> Last updated: 2026-03-01T02:04:00+05:30

## Current Position
- **Milestone**: v2.5 Production Readiness
- **Phase**: 9 (completed)
- **Status**: ✅ Production Deployment complete — LIVE at https://eig7swuu.insforge.site

## Session Context
### What was just completed
- Created `activities` table on `my-first-project` backend.
- Updated `.env` with fresh anon key from `my-first-project`.
- Production build passed (`next build`, exit 0).
- Deployed via `create-deployment` MCP tool.
- Live URL verified: https://eig7swuu.insforge.site
- Phase 9 Execution fully completed.

## Next Steps
1. All 9 phases complete. Project is production-ready.

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
