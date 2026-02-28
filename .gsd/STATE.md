# STATE.md — Project Memory

> Last updated: 2026-03-01T02:04:00+05:30

## Current Position

- **Milestone**: v2.5 Production Readiness
- **Phase**: Phase 4 ✅ Complete → Phase 5 next
- **Status**: All Phase 4 deliverables shipped. Ready for Phase 5 planning.

## Session Context

### What was just completed
- Phase 4 Prompts 6-10: Wealth module, Branch Ops, Analytics, Knowledge Base, KPI coherence, cross-cutting polish, and full acceptance run
- Profile dropdown panel added (BUG-002)
- Executive KPIs verified: Revenue $0.7M (+41.1% YoY), Net Margin 15.4%, Avg CLV $25.5k, Churn Rate 2.5%
- Final acceptance: 10/10 modules passed

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
