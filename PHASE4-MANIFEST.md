# BankingCRM 2.5 — PHASE 4 MANIFEST (Comprehensive)

**File name:** `PHASE4-MANIFEST.md`  
**Version:** 1.1 FINAL  
**Date:** 22 February 2026  
**Objective:** Raise readiness from **58/100 → ≥92/100** by fixing **all 38 QA bugs**, completing **6/6 end-to-end workflows**, and delivering all **Blueprint Phase-4 deferred epics** (Wealth, Branch Ops, Analytics, Knowledge Base) while keeping the **open allow-all (no auth/RBAC)** guardrail. [file:1][file:2][file:5]

---

## P4-M0. EXECUTIVE OVERVIEW (PHASE 3 → PHASE 4)

Phase 3 achieved strong UI/IA and broad persona coverage, but QA confirms the product remains a demo prototype: **38 bugs**, **7 P0 demo blockers**, **0/6 workflows complete**, onboarding blocked at Step 2, lead views show **SEGMENT** placeholders, compliance shows **NaN/undefined** errors, and multiple submissions create **no records**. [file:1]

**Phase 4 mission:** ship a demo-grade, internally consistent, deterministic BankingCRM by:
- Resolving **all 38 QA defects** (BUG-001…BUG-044). [file:1]
- Completing **6/6 workflows** end-to-end with persistence + user feedback. [file:1]
- Implementing Blueprint Phase-4 deferred modules **in full**: **Wealth (Epic 4.1), Branch Ops (Epic 4.2), Analytics Dashboard (Epic 4.4), Knowledge Base (Epic 4.5)**. [file:5]
- Preserving Blueprint guardrails: **open allow-all**, **no authentication/authorization/RBAC** (deferred to Phase 5). [file:2][file:5]

---

## P4-M1. NON-NEGOTIABLE GUARDRAILS

- **No authentication / authorization / RBAC**; persona switcher is the only role simulation. [file:2][file:5]
- **Deterministic rendering**: avoid `Math.random()`, `Date.now()`, `new Date()` in render paths. [file:5]
- **Turbopack only**: do not add webpack-only dependencies. [file:5]
- **No orphaned UI**: every button click must produce observable behavior (modal/nav/toast), every submit must persist and show success/failure feedback. [file:1]
- **No trust-breakers**: eliminate **SEGMENT**, **NaN**, **undefined**, contradictory KPIs (e.g., revenue 0.0M with positive YoY), and silent failures. [file:1]

---

## P4-M2. PHASE 4 SCOPE (WHAT MUST BE DELIVERED)

### P4-M2.1 Fix all 38 QA bugs
QA bug register totals **38** defects spanning header, onboarding, leads/branch, wealth, servicing, marketing/campaigns, compliance, credit, executive KPIs, and locale consistency. [file:1]

### P4-M2.2 Complete 6 workflows end-to-end (0/6 → 6/6)
Phase 3 workflow completion is explicitly scored and remains non-functional end-to-end. [file:1]

Phase 4 must deliver end-to-end completion for:
1) Digital onboarding (6 steps) [file:1]
2) Lead ingestion → qualification (BANT) → conversion [file:1]
3) Deal creation → stage progression → close [file:1]
4) Service case creation → SLA → resolution/closure [file:1]
5) Credit application intake → queue → decision flow [file:1]
6) Marketing journey build → save → activate (campaign orchestration) [file:1]

### P4-M2.3 Deliver Blueprint deferred Phase-4 epics in full
These are explicitly deferred to Phase 4 in the prior plan and must be implemented fully now: **Wealth (4.1), Branch Ops (4.2), Analytics (4.4), Knowledge Base (4.5)**. [file:5]

### P4-M2.4 Defer Phase-5 items (do NOT implement in Phase 4)
- Authentication/RBAC (GAP-DA-02) [file:5]
- Autonomous agents in Blueprint Section 5.3 (Email Drafting, Financial Statement Summarizer, Meeting Prep, Compliance Check, Campaign Optimization) [file:2][file:5]
- Full ML models and training pipelines (XGBoost/Random Forest training) [file:2]
- Event-driven architecture / event bus (GAP-EVENT) [file:5]

---

## P4-M3. DATA & SEED PLAN (≥500 records, no placeholders)

Phase 4 must expand and harden seed data to remove QA-visible placeholder artifacts:
- Remove **SEGMENT** placeholder everywhere by ensuring leads have real identifying fields and UI binds to them. [file:1]
- Eliminate **NaN/undefined** values in compliance/executive KPIs by safe math and seeded denominators. [file:1]
- Diversify case subjects (not all “Issue with account”) and include case IDs + customer names. [file:1]
- Ensure opportunities/deals exist across stages so kanban and funnel KPIs are coherent. [file:1]
- Expand onboarding nationalities from 5 options to a full list. [file:1]

Seed target: **+300 new seeds** to reach **≥500 total** primary entities across domains (customers/leads/opps/cases/credit/KYC/AML/journeys/knowledge). [file:1]

---

## P4-M4. REMEDIATION REGISTER (FULL BUG COVERAGE)

### P4-M4.1 P0 Critical bugs (must match QA list exactly)

| BUG ID | Sev | Module | QA Finding | Prompt |
|---|---:|---|---|---|
| BUG-012 | P0 | Onboarding | Step 2 Next does not advance; workflow blocked | Prompt 2 [file:1] |
| BUG-014 | P0 | Leads/Branch/Credit | Lead detail shows SEGMENT placeholder everywhere | Prompt 2 [file:1] |
| BUG-022 | P0 | Servicing | Open Case & Start SLA Timer creates no record | Prompt 4 [file:1] |
| BUG-030 | P0 | Compliance | NaN/undefined visible on KPI cards | Prompt 3 [file:1] |
| BUG-032 | P0 | Credit | Submit Application creates no record | Prompt 5 [file:1] |
| BUG-024 | P0 | Leads | Ingest Web Lead creates no record | Prompt 2 [file:1] |
| BUG-028 | P0 | Opportunities | Create Deal creates no deal record | Prompt 5 [file:1] |

### P4-M4.2 P1/P2/P3 coverage
All remaining bugs **must** be fixed in Phase 4 and are assigned below (no omissions). [file:1]

- Header / Persona
  - BUG-001 (persona button no-op) → Prompt 9 [file:1]
  - BUG-002 (profile icon no panel) → Prompt 9 [file:1]
  - BUG-003 (Onboard CTA missing in 7/10 personas) → Prompt 9 [file:1]

- Dashboard / Executive KPI integrity
  - BUG-004 (AI insights always empty) → Prompt 10 [file:1]
  - BUG-005 (grammar) → Prompt 10 [file:1]
  - BUG-006 (0.0M revenue with +YoY contradiction) → Prompt 8 [file:1]

- Onboarding
  - BUG-007 (DOB keyboard input broken) → Prompt 2 [file:1]
  - BUG-008 (DOB skippable) → Prompt 2 [file:1]
  - BUG-009 (only 5 nationalities) → Prompt 1 [file:1]
  - BUG-010 (no inline validation errors) → Prompt 2 [file:1]
  - BUG-011 (upload unconfirmed) → Prompt 9 [file:1]
  - BUG-013 (pre-populated values fail validation until retyped) → Prompt 2 [file:1]

- Branch / Leads
  - BUG-015 (BANT checkboxes non-interactive) → Prompt 2 [file:1]
  - BUG-016 (ratings placeholders) → Prompt 2 [file:1]
  - BUG-017 (export no feedback) → Prompt 9 [file:1]

- Wealth
  - BUG-018 (rebalance stub) → Prompt 6 [file:1]
  - BUG-019 (proposal stub) → Prompt 6 [file:1]
  - BUG-020 (header truncation) → Prompt 6 [file:1]
  - BUG-021 (/wealth placeholder) → Prompt 6 [file:1]

- Servicing
  - BUG-023 (case counters incorrect) → Prompt 4 [file:1]
  - BUG-024P1 (all cases “Issue with account”) → Prompt 1 [file:1]
  - BUG-025 (case click broken on homepage) → Prompt 4 [file:1]
  - BUG-026 (knowledge tab empty/no search) → Prompt 7 [file:1]
  - BUG-027 (view customer link unconfirmed) → Prompt 9 [file:1]

- Marketing
  - BUG-028M (segment drill-down no-op) → Prompt 7 [file:1]
  - BUG-029 (journey health not a funnel) → Prompt 7 [file:1]

- Compliance
  - BUG-031 (sanctions/PEP dead-end) → Prompt 3 [file:1]
  - BUG-032P2 (AML/KYC KPI blanks) → Prompt 3 [file:1]
  - BUG-033 (preventive controls count missing) → Prompt 3 [file:1]
  - BUG-034 (live check no effect) → Prompt 9 [file:1]

- Campaigns
  - BUG-035 (DnD broken) → Prompt 7 [file:1]
  - BUG-036 (save no confirmation) → Prompt 7 [file:1]
  - BUG-037 (activate no workflow) → Prompt 7 [file:1]
  - BUG-038 (toolbox too small) → Prompt 9 [file:1]

- Credit / Opportunities
  - BUG-039 (submit creates no record) is covered by P0 BUG-032 (credit persistence) in this QA’s P0 list; still validate credit submit and queue creation as part of Prompt 5. [file:1]
  - BUG-040 (no feedback on submit) → Prompt 5 [file:1]
  - BUG-041 (ingest lead creates no record) overlaps with P0 BUG-024 in this QA’s P0 list; still validate ingest. [file:1]
  - BUG-042 (create deal creates no deal) overlaps with P0 BUG-028 in this QA’s P0 list; still validate deal creation. [file:1]
  - BUG-043 (missing stage selector) → Prompt 5 [file:1]
  - BUG-044 (date locale inconsistency) → Prompt 9 [file:1]

---

## P4-M5. GLOBAL GOVERNOR PROMPT (PIN IN MISSION CONTROL)

```
═══════════════════════════════════════════════════════════════════
BANKINGCRM 2.5 — PHASE 4 GLOBAL GOVERNOR v1.1
Anchor: PHASE4-MANIFEST.md
═══════════════════════════════════════════════════════════════════

IDENTITY
You are a senior full-stack engineer executing Phase 4 for BankingCRM 2.5.
Your job is to implement all items in PHASE4-MANIFEST.md without omission.

STACK — NO DEVIATIONS
- Next.js 15 App Router + TypeScript
- Turbopack
- Tailwind + Shadcn-UI
- Recharts
- @dnd-kit
- react-hook-form + Zod
- Postgres via Insforge MCP (allow-all RLS)

SECURITY / ACCESS
- No authentication, no authorization, no RBAC.
- RLS policies are allow-all.

DETERMINISM
- Never use Math.random/Date.now/new Date in render paths.

UI RULES
- No orphaned UI: every button triggers an observable action.
- Every form submit persists and shows loading + toast success/failure.
- No NaN/undefined/SEGMENT placeholders anywhere.

PHASE 4 OUTPUTS
- Fix all 38 QA bugs (BUG-001..BUG-044).
- Complete 6/6 workflows end-to-end.
- Build full modules: Wealth, Branch Ops, Analytics Dashboard, Knowledge Base.

END GOVERNOR
═══════════════════════════════════════════════════════════════════
```

---

## P4-M6. REQUIRED SEQUENTIAL PROMPTS (COMPLETE SET)

> Execute prompts in order. Each prompt ends with explicit verification steps so coverage is provable. [file:1][file:5]

### Prompt 1 — Schema + Seeds + Data Quality (≥500 total)
**Mode: 🏗️ Planning** [file:5]

```
PROMPT 1 (PLANNING): PHASE 4 DATA FOUNDATION

GOALS
- Expand deterministic seeds by +300 to reach ≥500 total primary entities.
- Fix data quality issues called out by QA:
  - Replace SEGMENT placeholders (BUG-014 driver)
  - Diversify service case subjects (BUG-024 P1)
  - Expand nationalities beyond 5 (BUG-009)
  - Ensure there are real leads, deals, and customers for demos

DELIVERABLES
1) Nationality list dataset powering onboarding dropdown.
2) Seeded Leads: real fullname, productinterest, leadrating, leadscore.
3) Seeded Opportunities across all stages with coherent totals.
4) Seeded Service Cases with varied subjects and customer mapping.
5) Seeded Knowledge Articles (≥50) for service resolution.
6) Seeded Marketing Journeys (≥10) and campaign metrics.

VALIDATION
- Grep for “SEGMENT” in UI + seeds: must be 0.
- Leads page shows real names and ratings.
- Servicing list shows varied subjects and IDs.
- Onboarding nationality dropdown lists full set.
```

### Prompt 2 — Onboarding + Leads + Branch (P0 blockers + UX validation)
**Mode: ⚡ Fast** [file:5]

```
PROMPT 2 (FAST): ONBOARDING + LEADS + BRANCH FIX PACK

ONBOARDING
- Fix BUG-012 Step 2 stuck; ensure steps 3–6 reachable.
- Fix BUG-013 default values validation on mount.
- Fix BUG-007 DOB keyboard input.
- Enforce BUG-008 DOB required gate.
- Implement BUG-010 inline validation errors and accessible messaging.

LEADS/BRANCH
- Fix BUG-014 SEGMENT placeholder by binding to real fields.
- Fix BUG-024 lead ingestion persistence (POST creates record).
- Fix BUG-015 checkboxes interactive + criteria gating.
- Fix BUG-016 ratings render.

VERIFICATION
- Complete onboarding end-to-end.
- Ingest a lead → appears in queue immediately → toast shown.
- Branch BANT checkboxes toggle; Convert enables when criteria met.
```

### Prompt 3 — Compliance Stabilization (No NaN/undefined + drilldowns)
**Mode: ⚡ Fast** [file:5]

```
PROMPT 3 (FAST): COMPLIANCE TRUST HARDENING

- Fix BUG-030 NaN/undefined errors with safe math and defaults.
- Fix BUG-031 sanctions/PEP dead-ends with drill-down drawer views.
- Fix BUG-032P2 KPI blanks for AML cases and KYC reviews.
- Fix BUG-033 preventive controls count.

VERIFICATION
- Navigate /compliance: zero NaN/undefined.
- Buttons open drawers with seeded records.
```

### Prompt 4 — Servicing Workflow Completion (Create → SLA → Resolve)
**Mode: ⚡ Fast** [file:5]

```
PROMPT 4 (FAST): SERVICE WORKFLOW END-TO-END

- Fix BUG-022 new case persistence.
- Fix BUG-023 counters to match data.
- Fix BUG-025 case click from homepage.

VERIFICATION
- Create a case and see it in the inbox with correct counts.
- Start SLA timer affects timeline and status.
```

### Prompt 5 — Credit + Opportunities Persistence + Feedback
**Mode: ⚡ Fast** [file:5]

```
PROMPT 5 (FAST): CREDIT + DEALS END-TO-END

CREDIT
- Fix BUG-032 submit application persistence.
- Fix BUG-040 success/failure toasts and loading.

OPPORTUNITIES
- Fix BUG-028 create deal persistence.
- Fix BUG-043 stage selector.

VERIFICATION
- Submit credit app → appears in queue; status filters work.
- Create deal → appears in kanban; stage is settable.
```

### Prompt 6 — Wealth Management Module (Epic 4.1 full)
**Mode: 🏗️ Planning → ⚡ Fast** [file:5]

```
PROMPT 6 (PLANNING→FAST): WEALTH MODULE FULL IMPLEMENTATION

- Fix BUG-021 replace /wealth placeholder.
- Fix BUG-018 Rebalance workflow.
- Fix BUG-019 Proposal generation workflow.
- Fix BUG-020 header truncation.

VERIFICATION
- /wealth is fully navigable from Global Admin.
- Rebalance and Generate Proposal produce visible outputs + toasts.
```

### Prompt 7 — Branch Ops + Marketing + Campaign Builder + Knowledge Base + Analytics (Epics 4.2/4.4/4.5)
**Mode: 🏗️ Planning** (then implement in Fast sub-steps) [file:5]

```
PROMPT 7 (PLANNING): PHASE 4 DEFERRED EPICS — BUILD IN FULL

BRANCH OPS (Epic 4.2)
- Implement Branch Operations workspace in full (not just the dashboard shell):
  - Lead queue + BANT + conversion integration
  - Team pipeline KPI rollups
  - Branch service queue view linking into servicing

KNOWLEDGE BASE (Epic 4.5)
- Implement Knowledge Base module in full:
  - /knowledge route with article list, filters, search
  - Service case context linking suggested articles
  - Seed ≥50 articles from Prompt 1

ANALYTICS DASHBOARD (Epic 4.4)
- Implement Analytics module in full:
  - Cross-domain dashboards (Sales, Service, Credit, Compliance, Marketing)
  - Filters by persona, tier, date range
  - Ensure all charts have backing data and no placeholder zeros

MARKETING + CAMPAIGNS
- Fix BUG-035 DnD using @dnd-kit.
- Fix BUG-036 Save confirmation.
- Fix BUG-037 Activate workflow.
- Fix BUG-028M segment drill-down.
- Fix BUG-029 funnel visualization.

VERIFICATION
- /branch, /analytics, /knowledge render and are functionally complete.
- Journey builder can build nodes, save, reload, and activate.
- Knowledge search returns results.
```

### Prompt 8 — Executive KPI Math + Data Integrity
**Mode: 🏗️ Planning** [file:5]

```
PROMPT 8 (PLANNING): KPI COHERENCE

- Fix BUG-006 revenue 0.0M with positive YoY.
- Ensure all executive KPIs are computed from seeded/persisted data.
- If denominator is zero, show “—” not a percent.

VERIFICATION
- Executive dashboard KPIs are internally consistent.
```

### Prompt 9 — Cross-cutting Polish + Locale + Utilities
**Mode: ⚡ Fast** [file:5]

```
PROMPT 9 (FAST): POLISH PACK

- Fix BUG-001 persona switcher button.
- Fix BUG-002 profile panel.
- Fix BUG-003 Onboard CTA presence or explicit design justification.
- Fix BUG-011 upload UX confirmation.
- Fix BUG-017 export feedback.
- Fix BUG-027 view customer navigation.
- Fix BUG-034 compliance live check.
- Fix BUG-038 expand journey toolbox catalog.
- Fix BUG-044 date locale standardization.

VERIFICATION
- Every icon button has an ARIA label and visible focus.
- Every export/download action provides feedback.
- Dates use ISO yyyy-mm-dd.
```

### Prompt 10 — Demo Readiness + Acceptance Run
**Mode: ⚡ Fast** [file:5]

```
PROMPT 10 (FAST): DEMO READINESS RUN

- Fix BUG-004 AI insights non-functional (seed + render)
- Fix BUG-005 grammar
- Run the verification matrix below as an acceptance suite.

DELIVERABLE
- A 12–15 minute demo script covering: onboarding, lead→deal, service case, compliance drilldown, credit application, marketing journey activate, wealth proposal.
```

---

## P4-M7. VERIFICATION MATRIX (PHASE 4 DEFINITION OF DONE)

| Category | Target | Check |
|---|---|---|
| Total bugs | 0 open | Re-test all BUG-001…BUG-044 and close all. [file:1] |
| P0 blockers | 0 open | BUG-012/014/022/030/032/024/028 fixed & re-tested. [file:1] |
| Workflows | 6/6 complete | Onboarding, Lead, Deal, Service, Credit, Campaign activate all end-to-end. [file:1] |
| Wealth module | Full | /wealth not placeholder; rebalance + proposal functional. [file:1] |
| Branch ops module | Full | /branch supports lead + BANT + conversion + ops KPIs. [file:2][file:5] |
| Knowledge base | Full | /knowledge searchable; servicing suggests articles. [file:2][file:5] |
| Analytics | Full | /analytics cross-domain dashboards show real data. [file:2][file:5] |
| Data trust | Clean | No SEGMENT/NaN/undefined; no contradictory KPIs. [file:1] |
| UX feedback | 100% | Every submit shows loading + toast; failures show errors. [file:1] |
| Accessibility | Improved | Keyboard nav works; ARIA labels on icon buttons. [file:1] |

---

## P4-M8. COVERAGE SELF-AUDIT (NO OMISSIONS)

This section exists to prove the manifest did not leave anything out.

- P0 list included exactly as QA enumerates: BUG-012, 014, 022, 030, 032, 024, 028. [file:1]
- Non-P0 bugs referenced and assigned: BUG-001..BUG-011, BUG-013, BUG-015..BUG-021, BUG-023, BUG-025..BUG-027, BUG-028M, BUG-029, BUG-031, BUG-032P2, BUG-033..BUG-038, BUG-040, BUG-043, BUG-044. [file:1]
- Blueprint deferred Phase-4 epics explicitly in scope and assigned to Prompt 6/7: 4.1 Wealth, 4.2 Branch Ops, 4.4 Analytics, 4.5 Knowledge Base. [file:5]
- Blueprint Phase-5 items explicitly excluded: auth/RBAC, agents in Section 5.3, full ML training, event-driven architecture. [file:2][file:5]

If any item from QA/Blueprint is not present in this audit list, Phase 4 is incomplete. [file:1][file:2][file:5]

---

*End of PHASE4-MANIFEST.md*
