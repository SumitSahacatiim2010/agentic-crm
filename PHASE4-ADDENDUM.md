Version 1.0 DRAFT
Date 25 February 2026
Classification Development – Phase 4 Addendum

Instruction
This document extends PHASE4-MANIFEST.md. If there is any conflict, PHASE4-MANIFEST.md remains the primary source of truth for Phase 4 scope, bug coverage, and readiness targets.
Upload this document to the Antigravity IDE workspace root as PHASE4.5-MANIFEST.md (or PHASE4-ADDENDUM.md).
Phase 4 prompts may reference this file for additional orchestration detail but must continue to treat PHASE4-MANIFEST.md as the anchor document.[file:26]

TITLE  
BankingCRM 2.5 – Phase 4 Development Manifest  
Wealth, Branch, Marketing, Analytics, Knowledge & Demo Journey Completion  

This document is the single source of truth for all **Phase 4** work.  
It builds on PHASE3-MANIFEST.md (Phase 3), the Banking CRM Blueprint, the Requirements Specification, the Phase‑3 Test Report, and the three must-have demo journeys (Story 1–3).[file:26][file:27][file:28][file:29][file:31][file:32][file:33]

Developers MUST consult this register before and after each prompt execution to verify completeness and to avoid breaking the guardrails defined in PHASE3-MANIFEST.[file:26]

---

## F1. DEVELOPMENT MANIFEST – DEFECT & GAP TRACEABILITY (PHASE 4)

F1.1 Phase‑3 Critical & Major Defect Traceability (Demo‑Impacting Only)

Source of truth: Phase-3-Test-Report, consolidated bug register sections; only bugs that materially impact J1/J2/J3 or core dashboards are included here.[file:29]

| BUG ID  | Severity | Module / Journey Impacted        | Description (from Phase‑3 Test)                                                                                                                   | Phase‑4 Resolution Prompt | Task Ref   | Acceptance Criteria                                                                                                                                                               |
|---------|----------|----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| BUG-001 | CRITICAL | Onboarding (J3)                 | Onboarding Step 2 “Next” remains disabled even when all CDD fields are populated; Steps 3–6 are completely inaccessible.                          | Prompt 2                  | F2.T2.1   | 6‑step wizard completes; Step 2 “Next” enabled only when all required fields valid; Steps 3–6 reachable; J3 branch‑led journey completes with persisted customer + products. [file:29] |
| BUG-002 | MAJOR    | Retail RM, Global Admin (J2/J3) | Embedded Customer Directory shows “No customers found matching your search” even with no search input; embedded context doesn’t load any data.    | Prompt 2                  | F2.T2.2   | Embedded directory loads same 100 profiles as /customer; empty-state only when filters truly empty; J2/J3 can always see the newly created customer in embedded views. [file:29]    |
| BUG-003 | MAJOR    | Branch & Credit (J1/J2)         | Branch Incoming Leads Queue Rating column shows loading indicators; Status column is blank for all 50 leads.                                     | Prompt 3                  | F3.T3.1   | Rating and Status columns show correct values from leads.leadrating and leads.status; updated instantly after BANT changes; J1/J2 flows show meaningful lead prioritisation. [file:29] |
| BUG-004 | MAJOR    | Customer 360 – Financials / CLV | 5‑Year CLV Projection shows 0; Gross Revenue shows 0; CLV model is not executing or not bound to UI.                                             | Prompt 5                  | F5.T5.1   | CLV widget shows non‑zero values derived from apimodelsclv; numbers consistent with product holdings and transaction history for at least 5 sampled customers. [file:29]             |
| BUG-005 | MAJOR    | Credit Origination (J1/J2)      | New Application form shows loading but modal doesn’t close; application doesn’t appear in queue; 0 of 0 applications.                            | Prompt 3                  | F3.T3.3   | Submitting a valid credit application closes modal, creates record in creditapplications, increments queue count, and shows toast confirmation. [file:29]                             |
| BUG-006 | MAJOR    | Service Agent – Case Context    | Clicking different cases updates header title but “Screen Pop” customer context remains stuck on Alexander V. Sterling (first case).             | Prompt 5                  | F5.T5.2   | Selecting any case updates both case header and Screen Pop customer context to the correct customer; J1/J2/J3–related cases show correct linked customer. [file:29]                   |
| BUG-008 | MAJOR    | Leads Import / Export (J1)      | Leads CSV export/import buttons produce no download, no upload flow, no toast; Branch manager cannot bulk manage leads.                           | Prompt 3                  | F3.T3.1   | Export triggers CSV download with all visible leads; Import parses deterministic CSV and inserts records via apileads; both show toasts. [file:29]                                   |
| BUG-009 | MAJOR    | Customer Profile – KYC          | KYC header badge shows “KYC PENDING” while Risk/KYC tab shows “KYC Status Unknown”; inconsistent status rendering.                               | Prompt 5                  | F5.T5.3   | KYC status consistent between header and Risk tab; transitions correctly when kycrecords.status changes; no “Unknown” for customers with valid records. [file:29]                     |
| BUG-010 | MAJOR    | Tier Naming Consistency         | Executive shows Standard / Premium / HNW / UHNW; Customer Directory filter uses Standard / Silver / Gold / Platinum / UHNW; schemas conflict.    | Prompt 5                  | F5.T5.3   | Tier names unified to Blueprint taxonomy across dashboards, filters, and badges; Standard/Premium/HNW/UHNW mapping consistent for all views. [file:27][file:29]                        |
| BUG-011 | MAJOR    | Customer Profile – Contact Info | Header shows email as placeholder like contactuuid.demo.com; not demo‑reliable.                                                                  | Prompt 5                  | F5.T5.3   | All demo customers show realistic email addresses seeded in individualparties.email; no UUID placeholders in UI. [file:26][file:29]                                                  |

*(Extend this table for any additional Critical/Major bugs you deem in scope for Phase 4.)*

---

F1.2 Phase‑4 Gap Traceability (From Blueprint & PHASE3‑MANIFEST)

Source of truth: PHASE3-MANIFEST M1.2 (items deferred to Phase 4) plus additional gaps observed in Phase-3 test that relate to Wealth, Branch, Analytics, Knowledge or Journeys.[file:26][file:29]

| GAP ID   | Description (Blueprint / Phase‑3)                                                   | Phase‑3 Status     | Phase‑4 Resolution Prompt | Task Ref   | Acceptance Criteria                                                                                                                                           |
|---------|--------------------------------------------------------------------------------------|--------------------|---------------------------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GAP-SO-04 | Wealth workspace absent – Phase 4 placeholder [PHASE3-MANIFEST]                    | DEFERRED (Phase 3) | Prompt 4                  | F4.T4.1   | /wealth route renders full wealth advisor workspace: live holdings from DB, drift, proposal history, rebalance/proposal workflows are functional. [file:26][file:27][file:29] |
| GAP-SO-05 | Branch workspace absent – Phase 4 placeholder [PHASE3-MANIFEST]                    | DEFERRED           | Prompt 4                  | F4.T4.2   | Branch workspace exposes functional Incoming Leads queue, BANT, onboarding CTA, branch KPIs, and compliance summary, all backed by live data. [file:26][file:29]                |
| GAP-AN-01 | Analytics dashboard not implemented – analytics route 404 / placeholder            | NEW (Phase 4)      | Prompt 5                  | F5.T5.1   | /analytics route returns 200 with Sales, Customer, Service, and Campaign analytics sections, all drawing from live DB and model endpoints. [file:26][file:27][file:29]          |
| GAP-KB-01 | Knowledge base workspace and in‑context KB tab not implemented (Service Agent)     | NEW                | Prompt 5                  | F5.T5.4   | Knowledge home page lists articles; Service Agent Knowledge tab shows contextual suggestions and supports full‑text search across seeded knowledge_articles. [file:29]         |
| GAP-J1-01 | J1 Retail walk‑in journey not fully supported end‑to‑end (branch → RM → credit)    | NEW (Journeys)     | Prompts 3, 4              | F3.T3.1–3 | Story1 happy path executes without manual DB tweaks; all screens, APIs, and queues show consistent state. [file:31]                                         |
| GAP-J2-01 | J2 Digital lead capture journey not fully supported (online → routing → RM → deal) | NEW                | Prompts 3, 4              | F3.T3.2   | Story2 happy path executes; web lead persists, is routed, appears in queues, and converts into pipeline and analytics. [file:32]                             |
| GAP-J3-01 | J3 Branch‑led onboarding & account opening incomplete (wizard blocked)              | NEW                | Prompt 2                  | F2.T2.1   | Story3 branch‑led onboarding completes all 6 steps and creates full customer profile with products and KYC. [file:33][file:29]                                |

---

F1.3 Blueprint Epic Traceability – Phase‑4 Scope

Source: PHASE3-MANIFEST M1.3 (Epics 4.1–4.5) and Blueprint Sections 3–5.[file:26][file:27]

| Epic ID | Epic Name                     | Blueprint Ref      | Phase‑3 Status         | Phase‑4 Prompt(s) | Acceptance Criteria (Phase 4)                                                                                  |
|---------|-------------------------------|--------------------|------------------------|-------------------|---------------------------------------------------------------------------------------------------------------|
| 4.1     | Wealth Management Module      | Blueprint 3.5, 4.1 | Placeholder page only  | Prompt 4          | Wealth advisor persona can demonstrate portfolio overview, drift, rebalancing, proposal generation end‑to‑end. [file:27][file:29] |
| 4.2     | Branch Operations Module      | Blueprint 3.4, 4.3 | Placeholder / partial  | Prompts 3, 4      | Branch manager can manage leads, launch onboarding, view branch KPIs, and route cases. [file:27][file:29]      |
| 4.3     | Marketing Hub / Campaigns V2  | Blueprint 3.2, 4.2 | Phase‑3 canvas + APIs  | Prompt 4          | Marketing manager can design, save, and activate journeys; see segment drill‑downs and campaign metrics. [file:26][file:29] |
| 4.4     | Analytics Dashboard           | Blueprint 4.6      | Placeholder only       | Prompt 5          | Executives and Global Ops can access /analytics with functional dashboards across domains. [file:27][file:29] |
| 4.5     | Knowledge Base Module         | Blueprint 4.3      | Placeholder only       | Prompt 5          | Service agents can search and read knowledge articles from both KB home and in‑context tabs. [file:27][file:29] |

---

## F2. JOURNEY TRACEABILITY – MUST‑HAVE DEMO JOURNEYS

Source: Overview_Journies, Story1, Story2, Story3, Blueprint Journey Architecture.[file:30][file:31][file:32][file:33][file:27]

F2.1 Journey Catalogue – Phase‑4 “Hero” Journeys

| Journey ID | Name                                                           | Source Story | Primary Personas                | Related Epics / Modules                      |
|------------|----------------------------------------------------------------|--------------|---------------------------------|---------------------------------------------|
| J1         | Retail Walk‑In Lead → Product Application (Branch‑led)        | Story 1      | Branch Manager, Retail RM, Credit Officer | Branch Workspace, Leads, Pipeline, Credit    |
| J2         | Digital Lead Capture → Routing → RM Conversion                | Story 2      | Digital, Retail RM, Marketing  | Leads, Routing, Pipeline, Campaigns         |
| J3         | Retail Account Opening & Onboarding (Branch‑led wizard)       | Story 3      | Branch Manager, Retail RM, Compliance | Onboarding Wizard, Customer 360, KYC        |

---

F2.2 Journey Step → Screen → API → Data → Defect / Gap Mapping (Example: J1)

*(Skeleton structure – you can expand each step with more granularity as needed.)*

### J1 – Retail Walk‑In Lead → Product Application

| Step | Business Action                                             | Screen / Route                          | API(s)                            | Tables Affected                         | Related BUG/GAP / Epic                 | Phase‑4 Task(s)      |
|------|-------------------------------------------------------------|-----------------------------------------|------------------------------------|------------------------------------------|----------------------------------------|----------------------|
| 1    | Branch officer captures walk‑in lead with BANT & product    | `/branch` – Incoming Leads Queue        | GET/POST `apileads`               | `leads`                                  | BUG‑003, BUG‑008, GAP-J1-01 [file:29][file:31] | F3.T3.1             |
| 2    | BANT updated, lead qualified                               | BANT side panel on `/branch`            | PUT `apileads/:id`                | `leads`                                  | DEF‑005 analogue, GAP-SP-01 [file:26][file:31]  | F3.T3.1             |
| 3    | Convert qualified lead into opportunity                    | Branch BANT panel – Convert button      | POST `apiopportunities`           | `opportunities`, `audittrail`           | GAP-SP-01, GAP-SP-02 [file:26][file:31]          | F3.T3.1             |
| 4    | Retail RM views new opportunity in pipeline                | `/opportunities` – Kanban view          | GET `apiopportunities`            | `opportunities`                          | Phase 3 Pipeline epics (already in scope) [file:26][file:29] | Phase 3; verify only |
| 5    | For credit product, create linked credit application       | Opportunity detail – “Create Application” | POST `apicreditapplications`      | `creditapplications`, `audittrail`       | BUG‑005, GAP-CO-02..05 [file:29][file:26][file:31] | F3.T3.3             |
| 6    | Credit Officer sees app in Credit Origination queue        | `/credit` – queue list                  | GET `apicreditapplications`       | `creditapplications`                    | BUG‑005 (persist & visibility) [file:29]           | F3.T3.3             |

*(Create similar tables for J2 and J3.)*

---

## F3. PHASE 4 GLOBAL GOVERNOR SYSTEM PROMPT

This section is the Phase‑4‑specific overlay on top of M3 Global Governor in PHASE3‑MANIFEST.[file:26]

**Instruction**  
Pin this entire section in Antigravity IDE Mission Control alongside the existing PHASE3 Global Governor.

```text
BANKINGCRM 2.5 – PHASE 4 GLOBAL GOVERNOR v1.0
Anchor Documents:
- PHASE3-MANIFEST.md (M1, M2, M3, M4)
- PHASE4-MANIFEST.md (F1–F5)
- Banking-CRM-Blueprint.docx
- Banking-CRM-Requirements.docx
- Phase-3-Test-Report.docx
- Story1/Story2/Story3 journey specs

IDENTITY
You are a Senior Full-Stack Engineer executing Phase 4 of an enterprise Banking CRM (BankingCRM 2.5) on GCP via Insforge MCP.

You must:
- Preserve all Phase 3 guardrails from M3 (no auth/RBAC, allow-all RLS, stack, deterministic rendering).
- Implement only additive schema changes (no renames/removals of existing tables/columns).
- Prioritize completion of journeys J1, J2, J3 to demo-grade quality.

KEY PHASE-4 GUARDRAILS
1. NO AUTH / RBAC
   - Same rules as Phase 3 apply.
   - Persona switcher and ?persona query parameters remain the ONLY role mechanism.

2. SCHEMA INTEGRITY
   - Tables in M2.1 are immutable in name and semantic.
   - You MAY add new tables for Wealth, Knowledge, Analytics, but you CANNOT change existing contracts.
   - All new tables must follow the same conventions (snake_case, UUID PK, created_at, updated_at, allow-all RLS).

3. JOURNEY SAFETY
   - Any change to routes /branch, /leads, /opportunities, /onboarding, /customer/:id, /credit, /service, /marketing, /wealth MUST preserve or improve J1, J2, J3.
   - Before modifying these routes, re-read F2 journey mappings and ensure you are not breaking a step.

4. MODE DISCIPLINE
   - PLANNING MODE:
     * new tables, new routes (page.tsx), new wizards/state machines, drag-and-drop canvases, multi-file refactors.
   - FAST MODE:
     * bug fixes (Phase-3 bugs), validation, API wiring, toast feedback, polishing.

5. ACCEPTANCE SOURCE
   - For defects: PHASE3-MANIFEST M1.1 + Phase-3-Test-Report bug descriptions.
   - For journeys: Story1/2/3.
   - For epics: Blueprint + PHASE3-MANIFEST M1.3.

SUCCESS = All F5 QA checklist items are "PASS" and J1/J2/J3 can be executed live without manual DB edits.
