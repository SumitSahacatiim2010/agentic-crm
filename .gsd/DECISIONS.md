# DECISIONS.md — Architecture Decision Records

## ADR-001: No Authentication in Phases 1-4
**Date**: 2026-02-18
**Status**: Active
**Context**: Building a demo-grade CRM that needs to showcase persona-based workflows without enterprise auth complexity.
**Decision**: Use a client-side persona switcher as the only role mechanism. RLS policies are allow-all. Auth/RBAC deferred to Phase 6.
**Consequences**: Any user can access any persona. No session management. Profile panel shows demo data.

---

## ADR-002: InsForge MCP as Backend
**Date**: 2026-02-18
**Status**: Active
**Context**: Need managed Postgres with edge functions, storage, and auth capabilities.
**Decision**: Use InsForge MCP for all database operations. Two projects available: `my-first-project` (primary) and `banking-crm-2-5`.
**Consequences**: All DB operations go through InsForge SDK. Schema changes via raw SQL through MCP.

---

## ADR-003: Deterministic Rendering
**Date**: 2026-02-18
**Status**: Active
**Context**: SSR/SSG with Next.js requires deterministic output to avoid hydration mismatches.
**Decision**: No `Math.random()`, `Date.now()`, or `new Date()` in render paths. All dynamic data fetched server-side or via useEffect.
**Consequences**: Seeds must be deterministic. Mock data uses fixed values.

---

## ADR-004: Turbopack Only
**Date**: 2026-02-18
**Status**: Active
**Context**: Next.js 15 supports Turbopack for faster dev builds.
**Decision**: Use `--turbopack` flag for dev. No webpack-only dependencies.
**Consequences**: Some community packages may not be compatible.

---

## ADR-005: Additive Schema Only
**Date**: 2026-02-20
**Status**: Active
**Context**: Multiple phases build on the same schema. Renaming/removing tables would break existing code.
**Decision**: Only add new tables/columns. Existing table names and column names are immutable.
**Consequences**: Schema may accumulate unused columns over time. Migration complexity is low.
