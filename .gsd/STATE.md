# STATE.md — Project Memory

> Last updated: 2026-03-01T02:04:00+05:30

## Current Position
- **Milestone**: v2.5 Production Readiness
- **Phase**: 8 (completed)
- **Status**: ✅ Event Architecture & Real-time complete

## Session Context
### What was just completed
- Created `useRealtimeChannel` hook (singleton connect, auto-subscribe/cleanup).
- Refactored `ServiceInbox.tsx` and `AlertsQueue.tsx` to use shared hook.
- Added real-time to `LeadDataTable`, `BranchLeadQueue`, `OpportunityKanban`, and `ComplianceDashboardClient`.
- Phase 8 Execution fully completed.

## Next Steps
1. /verify 8

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
