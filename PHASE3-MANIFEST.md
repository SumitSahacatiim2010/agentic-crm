# BankingCRM 2.5 — Phase 3 Development Manifest & Comprehensive Antigravity IDE Orchestration Prompts

**Version:** 2.0 FINAL | **Date:** 21 February 2026 | **Classification:** Development Anchor Document
**Instruction:** Upload this entire document to the Antigravity IDE workspace root as `PHASE3-MANIFEST.md`. Every prompt references this manifest by section ID. Pin the Global Governor (Section M3) in Mission Control.

***

## M1. DEVELOPMENT MANIFEST — MASTER TRACEABILITY REGISTER

This section is the **single source of truth** for all Phase 3 work. Every defect, gap, epic, and AI capability from the three input documents is mapped to its resolution prompt. Developers must consult this register before and after each prompt execution to verify completeness.

### M1.1 Defect Traceability Matrix (QA Report → Prompt)

| DEF ID | Severity | Module | Description | Resolution Prompt | Task Ref | Acceptance Criteria |
|--------|----------|--------|-------------|-------------------|----------|---------------------|
| DEF-001 | LOW | Dashboard | Persona data not filtered by role[^1] | Prompt 5 | T5.3 | API calls include `?persona=` param; dashboard shows persona-specific KPIs |
| DEF-002 | MEDIUM | Dashboard | Dashboard/Kanban count mismatch[^1] | Prompt 5 | T5.4 | Pipeline funnel counts = Kanban board counts, sourced from same API |
| DEF-003 | CRITICAL | Leads | New leads not persisted after ingestion[^1] | Prompt 2 | T2.4.2 | POST `/api/leads` persists to DB; new lead visible in queue on refresh |
| DEF-004 | HIGH | Leads | Lead names show as 'SEGMENT'[^1] | Prompt 2 | T2.4.2 | Actual lead `full_name` displayed from DB |
| DEF-005 | HIGH | Leads | BANT checklist not persistable[^1] | Prompt 2 | T2.4.2 | PUT `/api/leads/:id` saves BANT checkbox state; persists on refresh |
| DEF-006 | MEDIUM | Leads | Export button non-functional[^1] | Prompt 2 | T2.4.2 | Export triggers CSV download from `/api/leads?format=csv` |
| DEF-007 | CRITICAL | Customer | `/customer/:id` returns 404[^1] | Prompt 3 | T3.1 | Route returns 200 OK for all 200 customers with 7-tab profile |
| DEF-008 | HIGH | Customer | Customer IDs truncated[^1] | Prompt 2 | T2.4.1 | Full `CUST-{TIER}-{INDEX}` format displayed |
| DEF-009 | MEDIUM | Customer | 2 'Unknown' customer records[^1] | Prompt 1 | T1.2 | Seed data has zero Unknown/N/A records |
| DEF-010 | CRITICAL | Pipeline | `+ New Deal` button non-functional[^1] | Prompt 3 | T3.3 | Modal form opens; POST creates deal; deal appears in Kanban |
| DEF-011 | HIGH | Pipeline | Stage advancement not persisted[^1] | Prompt 3 | T3.4 | PUT updates stage in DB; survives page refresh |
| DEF-012 | HIGH | Pipeline | Completed column always 0[^1] | Prompt 3 | T3.5 | Closed-Won deals appear in Completed column with accurate count |
| DEF-013 | MEDIUM | Pipeline | Filter not showing options[^1] | Prompt 3 | T3.6 | Filter dropdown renders; applies query params to API |
| DEF-014 | HIGH | Service | No 'New Case' creation button[^1] | Prompt 4 | T4.1.1 | `+ New Case` button opens form; POST creates case; case in Inbox |
| DEF-015 | HIGH | Service | Save Classification not persistent[^1] | Prompt 4 | T4.1.2 | PUT saves classification; persists on refresh |
| DEF-016 | MEDIUM | Service | SLA breach only badge, no escalation[^1] | Prompt 4 | T4.1.3 | Countdown timer; auto-breach flag; escalation button |
| DEF-017 | CRITICAL | Campaigns | Journey builder canvas non-functional[^1] | Prompt 4 | T4.2.1 | Drag triggers onto canvas → nodes created → edges connected → save/load |
| DEF-018 | HIGH | Campaigns | Audience & ROI tabs empty[^1] | Prompt 4 | T4.2.2–T4.2.3 | Audience filter builder + consent dashboard; ROI metrics table |
| DEF-019 | HIGH | Campaigns | Activate button non-functional[^1] | Prompt 4 | T4.2.1 | Validation: ≥1 trigger + ≥1 action → PUT status='Active' |
| DEF-020 | MEDIUM | Campaigns | `/marketing` 404 blocks persona[^1] | Prompt 4 | T4.2.4 | Route returns 200 OK; Marketing Hub page renders |
| DEF-021 | HIGH | Compliance | KYC/Suitability/Audit tabs empty[^1] | Prompt 4 | T4.4.1 | KYC table with aging, Suitability form, Audit trail table |
| DEF-022 | MEDIUM | Compliance | All resolution/control metrics 0[^1] | Prompt 2 | T2.3.10 | Dashboard metrics from live DB aggregation |
| DEF-023 | HIGH | Credit | Spreading form fields empty[^1] | Prompt 4 | T4.3.1 | Auto-populated from `spreading_data` JSONB; ratios calculated |
| DEF-024 | HIGH | Credit | Bureau/Policy/Offer tabs empty[^1] | Prompt 4 | T4.3.4–T4.3.6 | Bureau from mock API; Policy checklist; Offer term sheet |
| DEF-025 | HIGH | Credit | `+ New Application` non-functional[^1] | Prompt 4 | T4.3.2 | Modal form; POST creates application; appears in queue |
| DEF-026 | MEDIUM | Credit | Status filter tabs non-functional[^1] | Prompt 4 | T4.3.3 | Filter tabs query `?status=`; count badges update |

### M1.2 Gap Traceability Matrix (QA Report → Prompt)

| GAP ID | Description | Resolution Prompt | Status |
|--------|-------------|-------------------|--------|
| GAP-DA-01 | No persistent data storage[^1] | Prompt 1 (Schema + Seed) | IN SCOPE |
| GAP-DA-02 | No auth/RBAC[^1] | EXCLUDED by guardrail | EXCLUDED |
| GAP-DA-03 | REST API incomplete[^1] | Prompt 2 (API Layer) | IN SCOPE |
| GAP-DA-04 | No real-time data binding[^1] | Prompt 5 (Dashboard Sync) | IN SCOPE |
| GAP-CX-01 | No 360° customer profile[^1] | Prompt 3 (Customer 360) | IN SCOPE |
| GAP-CX-02 | No customer onboarding workflow[^1] | Prompt 6 (Onboarding) | IN SCOPE |
| GAP-CX-03 | No relationship mgmt actions[^1] | Prompt 3 (Interactions Tab) | IN SCOPE |
| GAP-CX-04 | No product holdings/cross-sell[^1] | Prompt 3 (Products Tab) | IN SCOPE |
| GAP-SP-01 | Cannot create new deals[^1] | Prompt 3 (New Deal) | IN SCOPE |
| GAP-SP-02 | Cannot close to Closed-Won[^1] | Prompt 3 (Close Deal) | IN SCOPE |
| GAP-SP-03 | No deal detail view[^1] | Prompt 3 (Deal Detail) | IN SCOPE |
| GAP-SP-04 | No RM performance tracking[^1] | Prompt 5 (RM Portfolio) | IN SCOPE |
| GAP-SP-05 | No product-specific pipeline[^1] | Prompt 5 (Pipeline Filters) | IN SCOPE |
| GAP-SO-01 | Cannot create new service cases[^1] | Prompt 4 (New Case) | IN SCOPE |
| GAP-SO-02 | No case resolution workflow[^1] | Prompt 4 (Case Resolution) | IN SCOPE |
| GAP-SO-03 | No omnichannel routing[^1] | Prompt 5 (Routing Logic) | IN SCOPE |
| GAP-SO-04 | Wealth workspace absent[^1] | Placeholder only (Phase 4) | DEFERRED |
| GAP-SO-05 | Branch workspace absent[^1] | Placeholder only (Phase 4) | DEFERRED |
| GAP-MK-01 | Journey Builder non-functional[^1] | Prompt 4 (Canvas Fix) | IN SCOPE |
| GAP-MK-02 | Audience segmentation absent[^1] | Prompt 4 (Audience Tab) | IN SCOPE |
| GAP-MK-03 | Campaign analytics absent[^1] | Prompt 4 (ROI Tab) | IN SCOPE |
| GAP-MK-04 | `/marketing` 404[^1] | Prompt 4 (Marketing Hub) | IN SCOPE |
| GAP-MK-05 | No consent management[^1] | Prompt 4 (Consent Dashboard) | IN SCOPE |
| GAP-CR-01 | AML hit workflow absent[^1] | Prompt 4 (AML Queue) | IN SCOPE |
| GAP-CR-02 | KYC refresh empty[^1] | Prompt 4 (KYC Tab) | IN SCOPE |
| GAP-CR-03 | Suitability assessment absent[^1] | Prompt 4 (Suitability Tab) | IN SCOPE |
| GAP-CR-04 | Audit trail not implemented[^1] | Prompt 4 (Audit Trail Tab) | IN SCOPE |
| GAP-CR-05 | Preventive controls zero[^1] | Prompt 4 (AML Alerts Seed) | PARTIAL |
| GAP-CO-01 | Spreading form no data[^1] | Prompt 4 (Auto-populate) | IN SCOPE |
| GAP-CO-02 | Bureau data tab absent[^1] | Prompt 4 (Bureau Tab) | IN SCOPE |
| GAP-CO-03 | Policy check absent[^1] | Prompt 4 (Policy Tab) | IN SCOPE |
| GAP-CO-04 | Offer generation absent[^1] | Prompt 4 (Offer Tab) | IN SCOPE |
| GAP-CO-05 | Approval/decline absent[^1] | Prompt 4 (Approve/Decline) | IN SCOPE |

### M1.3 Blueprint Epic Traceability (19 Epics → Prompts)

| Epic | Name | Blueprint Phase[^2] | Resolution Prompt | Status |
|------|------|------------------------|-------------------|--------|
| 0.1 | React Hydration Remediation | Phase 0[^2] | Prompt 2 T2.2 | IN SCOPE |
| 0.2 | Turbopack Migration | Phase 0[^2] | Prompt 2 T2.1 | IN SCOPE |
| 0.3 | UI Clipping/Layout Bug Fixes | Phase 0[^2] | Prompt 2 T2.4 | IN SCOPE |
| 1.1 | Postgres Schema Design | Phase 1[^2] | Prompt 1 T1.1 | IN SCOPE |
| 1.2 | Deterministic Mock Data (200 Records) | Phase 1[^2] | Prompt 1 T1.2 | IN SCOPE |
| 1.3 | External API Mocks (Edge Functions) | Phase 1[^2] | Prompt 2 T2.5 | IN SCOPE |
| 1.4 | Complete REST API Layer | Phase 1[^2] | Prompt 2 T2.3 | IN SCOPE |
| 2.1 | Customer 360 Profile Page | Phase 2[^2] | Prompt 3 T3.1–T3.2 | IN SCOPE |
| 2.2 | Lead Lifecycle Completion | Phase 2[^2] | Prompt 2 T2.4.2 | IN SCOPE |
| 2.3 | Sales Pipeline Functionalization | Phase 2[^2] | Prompt 3 T3.3–T3.7 | IN SCOPE |
| 2.4 | RM Portfolio Dashboard | Phase 2[^2] | Prompt 5 T5.1–T5.2 | IN SCOPE |
| 3.1 | Unified Case Inbox / Case Lifecycle | Phase 3[^2] | Prompt 4 T4.1 | IN SCOPE |
| 3.2 | Digital Onboarding State Machine | Phase 3[^2] | Prompt 6 T6.1–T6.2 | IN SCOPE |
| 3.3 | Compliance Workflow Implementation | Phase 3[^2] | Prompt 4 T4.4 | IN SCOPE |
| 4.1 | Wealth Management Module | Phase 4[^2] | Placeholder page | DEFERRED |
| 4.2 | Branch Operations Module | Phase 4[^2] | Placeholder page | DEFERRED |
| 4.3 | Marketing Hub + Campaign Builder | Phase 4[^2] | Prompt 4 T4.2 | IN SCOPE |
| 4.4 | Analytics Dashboard | Phase 4[^2] | Placeholder page | DEFERRED |
| 4.5 | Knowledge Base Module | Phase 4[^2] | Placeholder page | DEFERRED |

### M1.4 Agentic Intelligence Layer Traceability (Blueprint Section 5)

| AI Capability | Blueprint Ref[^2] | Resolution Prompt | Status |
|---------------|----------------------|-------------------|--------|
| NBA Engine (Real-time Decisioning API) | Section 5.1[^2] | Prompt 7 T7.1 | IN SCOPE (Rule-based V1) |
| CLV Calculation Model | Section 5.1[^2] | Prompt 7 T7.2 | IN SCOPE (Deterministic formula) |
| Credit Scoring Model (XGBoost) | Section 5.2[^2] | Prompt 7 T7.3 | IN SCOPE (Mock scoring Edge Fn) |
| Churn Prediction Model | Section 5.2[^2] | Prompt 7 T7.3 | IN SCOPE (Mock scoring Edge Fn) |
| AML Risk Rating Model | Section 5.2[^2] | Prompt 7 T7.3 | IN SCOPE (Rule-based in seed) |
| Email Drafting Agent | Section 5.3[^2] | DEFERRED | Phase 5 |
| Financial Statement Summarizer | Section 5.3[^2] | DEFERRED | Phase 5 |
| Meeting Prep Agent | Section 5.3[^2] | DEFERRED | Phase 5 |
| Compliance Check Agent | Section 5.3[^2] | DEFERRED | Phase 5 |
| Case Triage Agent | Section 5.3[^2] | Prompt 5 T5.5 | IN SCOPE (Rule-based) |
| Campaign Optimization Agent | Section 5.3[^2] | DEFERRED | Phase 5 |
| AI Explainability Requirements | Section 5.4[^2] | Prompt 7 T7.4 | IN SCOPE (UI components) |

***

## M2. SCHEMA CONTRACT

Every prompt references this schema. The AI must not deviate from these table names, column names, or data types.

### M2.1 Table Registry (16 Tables)

| # | Table Name | Domain | Prompt Created |
|---|-----------|--------|----------------|
| 1 | `individual_parties` | Party | Prompt 1 |
| 2 | `corporate_parties` | Party | Prompt 1 |
| 3 | `households` | Party | Prompt 1 |
| 4 | `household_members` | Party | Prompt 1 |
| 5 | `product_catalog` | Product | Prompt 1 |
| 6 | `customer_products` | Product | Prompt 1 |
| 7 | `interactions` | Interaction | Prompt 1 |
| 8 | `account_balances` | Financial | Prompt 1 |
| 9 | `transactions` | Financial | Prompt 1 |
| 10 | `leads` | Operational | Prompt 1 |
| 11 | `opportunities` | Operational | Prompt 1 |
| 12 | `service_cases` | Operational | Prompt 1 |
| 13 | `credit_applications` | Operational | Prompt 1 |
| 14 | `kyc_records` | Compliance | Prompt 1 |
| 15 | `aml_alerts` | Compliance | Prompt 1 |
| 16 | `audit_trail` | Compliance | Prompt 1 |

### M2.2 API Endpoint Registry

| Endpoint | Methods | Prompt Built | Key Filters |
|----------|---------|-------------|-------------|
| `/api/customers` | GET, POST | Prompt 2 | `?tier=&search=&lifecycle_stage=&persona=` |
| `/api/customers/:id` | GET, PUT | Prompt 2 | Joins: products, interactions, KYC, AML, balances |
| `/api/leads` | GET, POST | Prompt 2 | `?status=&lead_rating=&source_channel=` |
| `/api/leads/:id` | GET, PUT | Prompt 2 | BANT update, status change |
| `/api/opportunities` | GET, POST | Prompt 2 | `?pipeline_stage=&assigned_rm=&product_type=` |
| `/api/opportunities/:id` | GET, PUT | Prompt 2 | Stage advancement, close deal |
| `/api/service/cases` | GET, POST | Prompt 2 | `?status=&priority=&channel=` |
| `/api/service/cases/:id` | GET, PUT | Prompt 2 | Classification, resolution, close |
| `/api/credit/applications` | GET, POST | Prompt 2 | `?status=&route_type=` |
| `/api/credit/applications/:id` | GET, PUT | Prompt 2 | Spreading, decision |
| `/api/compliance/dashboard-metrics` | GET | Prompt 2 | Live DB aggregation |
| `/api/compliance/aml-alerts` | GET | Prompt 2 | `?status=&severity=` |
| `/api/compliance/aml-alerts/:id` | PUT | Prompt 2 | Investigation, close |
| `/api/compliance/kyc-reviews` | GET | Prompt 2 | `?aging_bucket=30\|60\|90` |
| `/api/marketing/journeys` | GET, POST | Prompt 2 | Journey save/load |
| `/api/nba/recommendations/:customerId` | GET | Prompt 7 | Top-3 NBA recommendations |
| `/api/models/clv/:customerId` | GET | Prompt 7 | CLV calculation |
| `/api/mock/credit-bureau` | GET | Prompt 2 | `?customer_id=` |
| `/api/mock/sanctions-screening` | GET | Prompt 2 | `?customer_id=` |
| `/api/mock/core-banking/account` | GET | Prompt 2 | `?customer_id=` |
| `/api/mock/aml-screening` | GET | Prompt 2 | `?customer_id=` |

### M2.3 Seed Data Contract

| Entity | Count | Distribution | ID Format |
|--------|-------|-------------|-----------|
| Individual Parties | 200 | 80 Standard, 60 Premium, 40 HNW, 20 UHNW[^2] | `CUST-STD-00001` thru `CUST-UHNW-00020` |
| Corporate Parties | 15 | Across industries | `CORP-00001` thru `CORP-00015` |
| Households | 30 | Linking related individuals | `HH-00001` thru `HH-00030` |
| Product Catalog | 20 | 5 per category (Deposits/Loans/Investments/Cards/Insurance) | `PROD-DEP-001` etc. |
| Customer Products | 400–800 | 2–8 per customer | `CP-{PADDED}` |
| Interactions | 1000–2000 | 5–20 per customer across all channels | UUID |
| Leads | 50 | 12 Hot, 18 Warm, 20 Cold across 4 channels | `LEAD-00001` thru `LEAD-00050` |
| Opportunities | 80 | 12/13/9/15/14/10/7 per stage[^1] | `OPP-00001` thru `OPP-00080` |
| Service Cases | 30 | 3 P1, 8 P2, 12 P3, 7 P4 | `CAS-1001` thru `CAS-1030` |
| Credit Applications | 20 | With pre-populated spreading JSONB[^2] | `CA-00001` thru `CA-00020` |
| AML Alerts | 15 | 10 false positives, 5 under investigation | `AML-00001` thru `AML-00015` |
| KYC Records | 200 | One per customer; 25 with refresh due | UUID |
| Audit Trail | 200+ | One CREATE per customer minimum | UUID |

**Preserved Names:** Alexander V. Sterling (UHNW), Alexander Thomas (UHNW), Michael Scott, Dwight Schrute, Pam Beesly, Jim Halpert, Stanley Hudson, Oscar Martinez, Angela Martin, Ryan Howard.[^1]

**Edge Cases:** 2 PEP-flagged, 3 sanctions near-matches, 5 per lifecycle stage, 3 at-risk with declining balances, 2 dormant (>6 months), 1 SLA-breached case (CAS-1026).[^2]

***

## M3. GLOBAL GOVERNOR SYSTEM PROMPT

**Instruction:** Pin this entire section in Antigravity IDE Mission Control.

```
═══════════════════════════════════════════════════════════════════
  BANKINGCRM 2.5 — PHASE 3 GLOBAL GOVERNOR v2.0
  Pin in Antigravity IDE Mission Control
  Anchor Document: PHASE3-MANIFEST.md (workspace root)
═══════════════════════════════════════════════════════════════════

IDENTITY:
You are a Senior Full-Stack Engineer executing Phase 3 of an enterprise
Banking CRM ("BankingCRM 2.5") deployed on GCP via Insforge MCP. You
operate under strict architectural constraints defined in
PHASE3-MANIFEST.md. Before executing ANY prompt, read section M1 to
verify traceability and section M2 to verify schema compliance.

═══════════════════════════════════════════════════════════════════
SECTION 1: TECHNOLOGY STACK — NO DEVIATIONS
═══════════════════════════════════════════════════════════════════

FRONTEND:
  Framework:    Next.js 15 App Router (NOT Pages Router)
  Language:     TypeScript (strict mode)
  Styling:      Tailwind CSS v3+ (utility-first, no custom CSS files)
  Components:   Shadcn-UI (Radix-based). NO MUI, NO Ant Design, NO Chakra.
  Bundler:      Turbopack (use `next dev --turbopack`; no webpack config)
  State:        React Server Components by default. `"use client"` only
                when browser APIs are required.
  Data Fetching: Server Components with async/await. For client components,
                use SWR or React Query with fetch() to Insforge REST API.
  DnD Library:  @dnd-kit/core + @dnd-kit/sortable (Turbopack compatible)
  Charts:       Recharts (already in project)

BACKEND:
  Platform:     Insforge MCP (Managed Cloud Platform)
  Database:     PostgreSQL (Insforge-provisioned). Tables → REST APIs via
                PostgREST automatically.
  Edge Funcs:   Insforge Edge Functions for external system mocks.
  API Style:    RESTful. Insforge auto-generates CRUD from schema.
                Custom endpoints via Next.js Route Handlers (app/api/).
  ORM:          NONE. Use Insforge client SDK or raw SQL via Insforge.

DEPLOYMENT:
  Hosting:      Insforge Site Deployment
  Environment:  Single environment (no staging/prod split for this phase)

═══════════════════════════════════════════════════════════════════
SECTION 2: ABSOLUTE PROHIBITIONS
═══════════════════════════════════════════════════════════════════

1. NO AUTHENTICATION / AUTHORIZATION / RBAC
   - No login pages, signup forms, session management.
   - No JWT tokens, API keys, bearer token validation.
   - No middleware that checks roles or permissions.
   - No user tables for authentication purposes.
   - All PostgreSQL RLS policies MUST return TRUE:
     CREATE POLICY "allow_all" ON <table> FOR ALL
       USING (true) WITH CHECK (true);
   - The UI persona switcher is the SOLE mechanism for role simulation.
   - Persona filtering: query parameter (?persona=retail_rm), NOT auth.

2. NO NON-DETERMINISTIC RENDERING
   - NEVER use Math.random() in component render paths.
   - NEVER use Date.now() or new Date() in component render paths.
   - NEVER use crypto.randomUUID() in component render paths.
   - Randomness in UI: wrap in useEffect() or use seedrandom('banking-crm-42').
   - Timestamps: pass from Server Component as props or fetch from API.
   - suppressHydrationWarning is LAST RESORT with documented justification.

3. NO WEBPACK CONFIGURATION
   - Turbopack is the bundler. Period.
   - If dependency requires webpack config, find Turbopack alternative.

4. NO EXTERNAL UI LIBRARIES
   - ONLY Shadcn-UI + Tailwind CSS.
   - Exceptions: Recharts (charts), @dnd-kit (drag-and-drop).

5. MANIFEST COMPLIANCE
   - Before creating any table: verify name matches M2.1.
   - Before creating any API endpoint: verify matches M2.2.
   - Before resolving any defect: verify acceptance criteria in M1.1.
   - After completing any task: update PHASE3-MANIFEST.md status.

═══════════════════════════════════════════════════════════════════
SECTION 3: DATA ARCHITECTURE RULES
═══════════════════════════════════════════════════════════════════

SCHEMA CONVENTIONS:
  - Table names: snake_case, plural (e.g., individual_parties, leads)
  - Column names: snake_case (e.g., customer_id, created_at)
  - Primary keys: UUID v4 (deterministic in seeds)
  - Timestamps: created_at TIMESTAMPTZ DEFAULT NOW(), updated_at
  - Soft deletes: deleted_at TIMESTAMPTZ NULL (never hard delete)
  - Foreign keys: ALWAYS with ON DELETE CASCADE or SET NULL
  - Indexes: On all FKs, created_at, and WHERE/ORDER BY columns

SEED DATA RULES:
  - seed(42) for all pseudo-random generation. ZERO randomness.
  - Names: hardcoded array per M2.3. NOT Faker.js random.
  - Dates: fixed ISO-8601 strings. NOT Date.now().
  - IDs: format per M2.3 (CUST-STD-00001, LEAD-00001, etc.)
  - Include edge cases per M2.3.

API RESPONSE SCHEMA:
  - Success: { data: T | T[], meta: { page, limit, total } }
  - Error: { error: { code: string, message: string, details?: any } }
  - All list endpoints: ?page=, ?limit=, ?sort_by=, ?order=
  - All list endpoints: entity-specific filters via query params

═══════════════════════════════════════════════════════════════════
SECTION 4: ANTIGRAVITY MODE DISCIPLINE
═══════════════════════════════════════════════════════════════════

PLANNING MODE:
  - Database schema (CREATE TABLE, ALTER, indexes, RLS)
  - Multi-file component architecture (new pages with 3+ components)
  - State machine design (onboarding wizard, case lifecycle)
  - Seed data script architecture (spans all tables)
  - Build configuration changes (Turbopack migration)
  - Journey builder canvas engine rebuild

FAST MODE:
  - Individual component bug fixes (hydration, styling, data binding)
  - Single API route handler creation (app/api/*/route.ts)
  - CSS/Tailwind adjustments
  - Adding useEffect wrappers
  - Wiring existing UI to API calls (fetch + SWR)
  - Dashboard KPI components

NEVER use Fast Mode for multi-table schema changes.
NEVER use Planning Mode for single-component CSS fixes.

═══════════════════════════════════════════════════════════════════
SECTION 5: FILE STRUCTURE
═══════════════════════════════════════════════════════════════════

/PHASE3-MANIFEST.md                   ← THIS FILE (anchor document)
/app
  /api
    /customers/route.ts
    /customers/[id]/route.ts
    /leads/route.ts
    /leads/[id]/route.ts
    /opportunities/route.ts
    /opportunities/[id]/route.ts
    /service/cases/route.ts
    /service/cases/[id]/route.ts
    /credit/applications/route.ts
    /credit/applications/[id]/route.ts
    /compliance/aml-alerts/route.ts
    /compliance/aml-alerts/[id]/route.ts
    /compliance/kyc-reviews/route.ts
    /compliance/dashboard-metrics/route.ts
    /marketing/journeys/route.ts
    /nba/recommendations/[customerId]/route.ts
    /models/clv/[customerId]/route.ts
    /mock/credit-bureau/route.ts
    /mock/sanctions-screening/route.ts
    /mock/core-banking/account/route.ts
    /mock/aml-screening/route.ts
  /customer/[id]/page.tsx
  /onboarding/page.tsx
  /wealth/page.tsx                     ← Phase 4 placeholder
  /branch/page.tsx                     ← Phase 4 placeholder
  /marketing/page.tsx
  /knowledge/page.tsx                  ← Phase 4 placeholder
  /analytics/page.tsx                  ← Phase 4 placeholder
/lib
  /db/schema.sql
  /db/seed.ts
  /db/insforge-client.ts
  /types/*.ts
  /nba/engine.ts
  /models/clv.ts
/components
  /customer-360/
  /pipeline/
  /service/
  /credit/
  /campaigns/
  /onboarding/
  /rm-portfolio/
  /compliance/

═══════════════════════════════════════════════════════════════════
END OF GLOBAL GOVERNOR
═══════════════════════════════════════════════════════════════════
```

***

## M4. SPRINT ALLOCATION & PROMPT EXECUTION ORDER

| Sprint | Prompt | Epic Coverage | Key Deliverables | Defects Resolved |
|--------|--------|---------------|-----------------|-----------------|
| Sprint 1 | **Prompt 1** | 1.1, 1.2 | 16 tables, 200+ records, RLS | GAP-DA-01, DEF-009 |
| Sprint 2 | **Prompt 2** | 0.1, 0.2, 0.3, 1.3, 1.4, 2.2 | APIs, hydration fixes, Turbopack, mocks | DEF-003–006, DEF-008, DEF-022 |
| Sprint 3 | **Prompt 3** | 2.1, 2.3 | Customer 360, Pipeline | DEF-007, DEF-010–013 |
| Sprint 4 | **Prompt 4** | 3.1, 3.3, 4.3 | Service, Campaigns, Credit, Compliance | DEF-014–021, DEF-023–026 |
| Sprint 5 | **Prompt 5** | 2.4, 0.3 (remaining) | RM Dashboard, Routing, Dashboard sync | DEF-001, DEF-002, GAP-SP-04/05, GAP-SO-03 |
| Sprint 6 | **Prompt 6** | 3.2 | Digital Onboarding State Machine | GAP-CX-02 |
| Sprint 7 | **Prompt 7** | 5.1, 5.2, 5.4 (partial) | NBA Engine V1, CLV, Mock Models, Explainability | AI Layer foundation |

***

## PART 2: COMPREHENSIVE ANTIGRAVITY EXECUTION PROMPTS

***

## Prompt 1 — Schema Design & Data Seeding

**Mode: 🏗️ PLANNING MODE** | **Sprint: 1** | **Epics: 1.1, 1.2** | **Manifest Ref: M2.1, M2.3**

```
══════════════════════════════════════════════════════════════════
PROMPT 1: SCHEMA DESIGN & DETERMINISTIC DATA SEEDING
Mode: PLANNING MODE
Manifest Reference: Read PHASE3-MANIFEST.md sections M2.1 (Table
Registry), M2.3 (Seed Data Contract) before starting.
Resolves: GAP-DA-01, DEF-009 | Epics: 1.1, 1.2
══════════════════════════════════════════════════════════════════

CONTEXT:
The Banking CRM has ZERO data persistence (GAP-DA-01). All data is
hardcoded in React components. The QA report confirms ~52% functional
readiness with no database write operations succeeding. We use
Insforge MCP for PostgreSQL provisioning.

GUARDRAIL: NO auth tables. ALL RLS = allow-all. seed(42), NO randomness.

BEFORE STARTING: Open PHASE3-MANIFEST.md and read M2.1 (Table Registry)
to confirm you are creating exactly 16 tables with the exact names listed.

═══════════════════════════════════════════════════════════════════

TASK T1.1: CREATE COMPLETE POSTGRESQL SCHEMA

Generate /lib/db/schema.sql with exactly these 16 tables per M2.1:

PARTY DOMAIN (4 tables):
1. individual_parties — Full customer master with:
   id UUID PK, customer_id VARCHAR UNIQUE (format per M2.3:
   CUST-{TIER}-{INDEX}), full_name, date_of_birth, gender,
   marital_status, nationality, citizenship, ssn_national_id,
   passport_number, email, phone_mobile, phone_work,
   address_primary JSONB, address_mailing JSONB, employer_name,
   occupation, industry, employment_status (Employed/Self-Employed/
   Retired/Student), annual_income DECIMAL(15,2), education_level,
   language_preference DEFAULT 'en', tier VARCHAR NOT NULL CHECK
   (IN Standard/Premium/HNW/UHNW), lifecycle_stage VARCHAR DEFAULT
   'Onboarding' CHECK (IN Prospect/Onboarding/Growth/Maturity/
   At-Risk/Dormant/Churned), financial_health_score INTEGER (0-100),
   clv DECIMAL(15,2), nps_score INTEGER, churn_risk_score DECIMAL(5,4),
   assigned_rm VARCHAR, is_pep BOOLEAN DEFAULT FALSE, is_sanctioned
   BOOLEAN DEFAULT FALSE, fatca_status, crs_classification,
   created_at/updated_at/deleted_at TIMESTAMPTZ

2. corporate_parties — id UUID PK, entity_id UNIQUE, legal_name,
   dba_name, registration_number, tax_id, lei, industry_naics,
   industry_sic, business_structure (LLC/Corp/Partnership/Sole),
   incorporation_date, incorporation_country, annual_revenue
   DECIMAL(15,2), employee_count, business_credit_score,
   parent_entity_id UUID SELF-REF, tier, assigned_rm,
   created_at/updated_at/deleted_at

3. households — id UUID PK, household_name, primary_member_id FK
   individual_parties, combined_income DECIMAL(15,2),
   combined_net_worth DECIMAL(15,2), household_life_stage,
   created_at/updated_at

4. household_members — junction: household_id FK, individual_id FK,
   role (Head/Co-Head/Dependent/Authorized User), COMPOSITE PK

PRODUCT DOMAIN (2 tables):
5. product_catalog — id UUID PK, product_name, product_category
   (Deposits/Loans/Investments/Cards/Insurance), product_type,
   status DEFAULT 'Active', features JSONB, fee_schedule JSONB,
   interest_rate DECIMAL(5,4), min_balance DECIMAL(15,2),
   created_at/updated_at

6. customer_products — id UUID PK, customer_id FK individual_parties
   CASCADE, product_id FK product_catalog, account_number UNIQUE,
   opening_date, closing_date NULL, status DEFAULT 'Active'
   (Active/Dormant/Closed), current_balance DECIMAL(15,2) DEFAULT 0,
   available_balance, credit_limit NULL, ownership_type DEFAULT
   'Individual' (Individual/Joint), created_at/updated_at

INTERACTION DOMAIN (1 table):
7. interactions — id UUID PK, customer_id FK CASCADE, channel
   (Branch/Phone/Web/Mobile/Chatbot/Email/SMS), direction
   (Inbound/Outbound), interaction_type (Meeting/Call/Transaction/
   Digital/Service), purpose, outcome, sentiment (Positive/Neutral/
   Negative), sentiment_score DECIMAL(3,2), notes TEXT, agent_id,
   duration_minutes, case_id UUID NULL, created_at TIMESTAMPTZ

FINANCIAL DOMAIN (2 tables):
8. account_balances — id UUID PK, customer_product_id FK, snapshot_date,
   current_balance, available_balance, average_daily_balance

9. transactions — id UUID PK, customer_product_id FK,
   transaction_date TIMESTAMPTZ, amount DECIMAL(15,2), transaction_type
   (Debit/Credit), description, category, merchant NULL, balance_after

OPERATIONAL DOMAIN (4 tables):
10. leads — id UUID PK, full_name, email, phone, source_channel
    (Web/Branch/Marketing/Partner), product_interest, utm_source,
    lead_score INTEGER DEFAULT 0, lead_rating (Hot/Warm/Cold),
    bant_budget BOOLEAN DEFAULT FALSE, bant_authority BOOLEAN,
    bant_need BOOLEAN, bant_timeline BOOLEAN, qualification_stage
    DEFAULT 'Suspect' (Suspect/Prospect/Qualified/Sales-Accepted/
    Opportunity), assigned_rm, converted_customer_id FK NULL,
    status DEFAULT 'New' (New/Contacted/Qualified/Converted/
    Disqualified), created_at/updated_at/deleted_at

11. opportunities — id UUID PK, deal_name, customer_id FK, contact_person,
    product_type, deal_value DECIMAL(15,2), probability INTEGER (0-100),
    pipeline_stage DEFAULT 'Prospecting' (Prospecting/Qualification/
    Needs Analysis/Proposal/Negotiation/Completed/Closed-Lost),
    expected_close_date, assigned_rm, acquisition_channel, loss_reason
    NULL, win_reason NULL, notes TEXT, created_at/updated_at/deleted_at

12. service_cases — id UUID PK, case_number UNIQUE (CAS-{INDEX}),
    customer_id FK, subject, description TEXT, channel (Phone/Branch/
    Web/Chatbot/Email/Mobile), priority (P1-Critical/P2-High/P3-Medium/
    P4-Low), status DEFAULT 'Open' (Open/In Progress/Escalated/
    Resolved/Closed), case_type (Service Request/Inquiry/Complaint/
    Technical), classification NULL (Standard Inquiry/Formal Complaint),
    sla_target_hours INTEGER, sla_breached BOOLEAN DEFAULT FALSE,
    assigned_agent, resolution_notes NULL, resolution_code NULL,
    resolved_at NULL, closed_at NULL, csat_score NULL,
    created_at/updated_at

13. credit_applications — id UUID PK, application_number UNIQUE,
    applicant_name, company_name, customer_id FK NULL,
    corporate_id FK NULL, loan_type (Term Loan/Line of Credit/
    Mortgage/Auto/Personal), requested_amount DECIMAL(15,2),
    orr_rating (ORR-1 thru ORR-10), fico_score INTEGER,
    route_type (STP/Standard/Specialist), status DEFAULT
    'Pending Triage' (Pending Triage/Underwriting/Approved/
    Declined/Booked), spreading_data JSONB NULL, bureau_data
    JSONB NULL, policy_check_result JSONB NULL, offer_terms
    JSONB NULL, decision_notes NULL, assigned_officer,
    created_at/updated_at

COMPLIANCE DOMAIN (3 tables):
14. kyc_records — id UUID PK, customer_id FK CASCADE, kyc_level
    (Standard/Simplified/Enhanced), completion_date, next_refresh_date,
    edd_required BOOLEAN DEFAULT FALSE, documents JSONB, status DEFAULT
    'Active' (Active/Pending Refresh/Expired), risk_rating (Low/Medium/
    High), reviewed_by, created_at/updated_at

15. aml_alerts — id UUID PK, customer_id FK, alert_type (Transaction
    Monitoring/Sanctions Hit/Adverse Media), severity (Low/Medium/High/
    Critical), description TEXT, status DEFAULT 'Open' (Open/Under
    Investigation/Escalated/Closed-False Positive/Closed-SAR Filed),
    investigation_notes NULL, assigned_analyst, resolved_at NULL,
    created_at/updated_at

16. audit_trail — id UUID PK, entity_type (customer/lead/opportunity/
    case/credit/compliance), entity_id UUID, action (CREATE/READ/
    UPDATE/DELETE), changed_fields JSONB NULL, previous_values JSONB
    NULL, new_values JSONB NULL, performed_by DEFAULT 'system',
    ip_address NULL, created_at TIMESTAMPTZ DEFAULT NOW()

INDEXES: All FKs + individual_parties.tier + individual_parties.
lifecycle_stage + leads.status + leads.lead_rating + opportunities.
pipeline_stage + service_cases.status + service_cases.priority +
credit_applications.status + aml_alerts.status + audit_trail.
entity_type + audit_trail.entity_id + audit_trail.created_at

RLS: Enable on ALL tables. Create allow-all policy on ALL:
  CREATE POLICY "allow_all" ON <table> FOR ALL
    USING (true) WITH CHECK (true);

═══════════════════════════════════════════════════════════════════

TASK T1.2: CREATE DETERMINISTIC SEED DATA

Generate /lib/db/seed.ts. Consult PHASE3-MANIFEST.md M2.3 for exact
counts, ID formats, and preserved names.

RULES:
- seedrandom('banking-crm-42') for ALL pseudo-random choices
- ALL names from HARDCODED 200-name array (include preserved names)
- ALL dates are FIXED ISO-8601 strings
- Customer IDs per M2.3: CUST-STD-00001 thru CUST-UHNW-00020
- Generate EXACTLY per M2.3 counts:
  200 individual_parties (80/60/40/20), 15 corporate_parties,
  30 households, 20 product_catalog, 400-800 customer_products,
  1000-2000 interactions, 50 leads (12/18/20), 80 opportunities
  (12/13/9/15/14/10/7), 30 service_cases (3/8/12/7),
  20 credit_applications (with spreading_data JSONB),
  15 aml_alerts (10 false positive / 5 investigating),
  200 kyc_records (25 with refresh due), 200+ audit_trail

EDGE CASES per M2.3:
  2 PEP-flagged, 3 sanctions near-matches, 5 per lifecycle_stage,
  3 at-risk declining balances, 2 dormant >6 months,
  2 customer_products status='Dormant', 1 sla_breached case

CREDIT APPLICATION SPREADING DATA:
Each of the 20 credit apps MUST have spreading_data JSONB:
{
  "income_statement": { "revenue": N, "cogs": N, "opex": N,
    "depreciation": N, "interest": N, "annual_debt_service": N,
    "monthly_income": N, "monthly_debt_payments": N },
  "balance_sheet": { "total_assets": N, "liabilities": N,
    "current_assets": N, "current_liabilities": N }
}

VERIFICATION: After seed completes, log:
  - Table record counts (must match M2.3)
  - Tier distribution (80/60/40/20)
  - Edge case presence (PEP count, dormant count, etc.)

══════════════════════════════════════════════════════════════════
```

***

## Prompt 2 — API Layer, Hydration, Turbopack & Edge Functions

**Mode: ⚡ FAST MODE** | **Sprint: 2** | **Epics: 0.1, 0.2, 0.3, 1.3, 1.4, 2.2** | **Manifest Ref: M2.2**

```
══════════════════════════════════════════════════════════════════
PROMPT 2: API PLUMBING, TURBOPACK, HYDRATION & EDGE FUNCTIONS
Mode: FAST MODE
Manifest Reference: Read PHASE3-MANIFEST.md M2.2 (API Endpoint
Registry) before starting. Every endpoint you create must match.
Resolves: DEF-003/004/005/006/008/009/022, GAP-DA-03
Epics: 0.1, 0.2, 0.3, 1.3, 1.4, 2.2
══════════════════════════════════════════════════════════════════

PRE-FLIGHT: Schema and seed from Prompt 1 are live in Insforge MCP.
Verify by querying: SELECT COUNT(*) FROM individual_parties; → 200

GUARDRAIL: NO auth. ALL endpoints open. Insforge SDK for DB ops.

═══════════════════════════════════════════════════════════════════

TASK T2.1: TURBOPACK MIGRATION (Epic 0.2)

1. Update next.config.ts — remove webpack config, add Turbopack:
   export default { experimental: { turbo: {} } }
2. Run `next dev --turbopack` — must start without errors.
3. Verify all 9 currently-functional routes render identically.
Success: Dev start <3s, HMR <200ms.

═══════════════════════════════════════════════════════════════════

TASK T2.2: REACT HYDRATION FIXES (Epic 0.1)

Scan ALL components in /app and /components. Fix these patterns:

Pattern A — Math.random() in render:
  WRAP in useState + useEffect with seedrandom('banking-crm-42')

Pattern B — Date.now()/new Date() in render:
  PASS from Server Component as prop, or wrap in useEffect

Pattern C — typeof window mismatch:
  USE mounted state: const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

Pattern D — Dynamic imports without ssr:false:
  ADD { ssr: false } for browser-only components

DELIVERABLE: List every file modified. Target: ZERO hydration warnings.

═══════════════════════════════════════════════════════════════════

TASK T2.3: BUILD ALL API ROUTE HANDLERS (Epic 1.4)

Create every endpoint listed in PHASE3-MANIFEST.md M2.2.
Each wraps Insforge SDK with validation, pagination, business logic.

For EACH endpoint below, create the file, implement the methods,
and support the filters listed in M2.2:

T2.3.1: /app/api/customers/route.ts — GET (paginated, filtered), POST
T2.3.2: /app/api/customers/[id]/route.ts — GET (joined: products,
         interactions, KYC, AML, balances), PUT (+ audit_trail)
T2.3.3: /app/api/leads/route.ts — GET (filtered), POST (FIXES DEF-003)
T2.3.4: /app/api/leads/[id]/route.ts — GET, PUT (BANT, FIXES DEF-005)
T2.3.5: /app/api/opportunities/route.ts — GET (filtered), POST
T2.3.6: /app/api/opportunities/[id]/route.ts — GET, PUT (stage advance
         + audit_trail; if Completed → set win_reason; if Closed-Lost
         → set loss_reason. FIXES DEF-011 backend)
T2.3.7: /app/api/service/cases/route.ts — GET, POST (auto-generate
         case_number CAS-{next}. FIXES DEF-014 backend)
T2.3.8: /app/api/service/cases/[id]/route.ts — GET (join customer
         screen pop), PUT (classification, resolution)
T2.3.9: /app/api/credit/applications/route.ts — GET, POST
T2.3.10: /app/api/compliance/dashboard-metrics/route.ts — GET with
          LIVE aggregation queries replacing hardcoded zeros:
          open_aml_cases = COUNT(*) FROM aml_alerts WHERE status='Open'
          kyc_reviews_due = COUNT(*) WHERE next_refresh_date <= NOW()+30d
          high/medium/low_risk = GROUP BY from kyc_records
          false_positives_cleared = COUNT(*) WHERE status='Closed-FP'
          FIXES DEF-022.
T2.3.11: /app/api/compliance/aml-alerts/route.ts — GET, PUT via [id]
T2.3.12: /app/api/compliance/kyc-reviews/route.ts — GET (?aging_bucket=)
T2.3.13: /app/api/marketing/journeys/route.ts — GET, POST (journey save)

═══════════════════════════════════════════════════════════════════

TASK T2.4: WIRE EXISTING UI TO NEW APIs (Epics 0.3, 2.2)

T2.4.1: /app/customer/page.tsx (Customer Directory)
  - Replace static array → fetch('/api/customers?page=1&limit=100')
  - Tier filter → ?tier={selected}
  - Search → ?search={query}
  - Show FULL customer_id per M2.3 format (FIXES DEF-008)
  - No Unknown records exist in seed (FIXES DEF-009)

T2.4.2: /app/leads/page.tsx (Lead Management)
  - Queue → fetch('/api/leads')
  - Ingest form → POST /api/leads (FIXES DEF-003)
  - Display actual full_name, NOT 'SEGMENT' (FIXES DEF-004)
  - BANT checkboxes → PUT /api/leads/{id} (FIXES DEF-005)
  - Export → GET /api/leads?format=csv (FIXES DEF-006)

T2.4.3: /app/compliance/page.tsx
  - KPIs → fetch('/api/compliance/dashboard-metrics')
  - AML Queue → fetch('/api/compliance/aml-alerts')
  - KYC tab → fetch('/api/compliance/kyc-reviews')

═══════════════════════════════════════════════════════════════════

TASK T2.5: EXTERNAL API MOCKS (Epic 1.3)

Create 4 Insforge Edge Functions per M2.2:

T2.5.1: /app/api/mock/credit-bureau/route.ts
  - GET ?customer_id= → { fico_score, report_date, credit_utilization,
    delinquency_status, num_inquiries, total_accounts }
  - 200ms simulated latency (await sleep(200))
  - Deterministic: same customer_id always returns same score

T2.5.2: /app/api/mock/sanctions-screening/route.ts
  - GET ?customer_id= → { match: boolean, match_type, confidence }
  - Return match=true for 3 sanctions near-match customers per M2.3

T2.5.3: /app/api/mock/core-banking/account/route.ts
  - GET ?customer_id= → { accounts: [...], total_balance }

T2.5.4: /app/api/mock/aml-screening/route.ts
  - GET ?customer_id= → { risk_rating: 'Low'|'Medium'|'High' }

VERIFICATION: After all tasks, confirm:
  - All endpoints in M2.2 return 200 OK
  - Zero hydration warnings in console
  - Turbopack dev server running
  - All 4 mock endpoints respond <500ms

══════════════════════════════════════════════════════════════════
```

***

## Prompt 3 — Customer 360 & Sales Pipeline

**Mode: 🏗️ PLANNING → ⚡ FAST** | **Sprint: 3** | **Epics: 2.1, 2.3** | **Manifest Ref: M1.1 (DEF-007/010-013)**

```
══════════════════════════════════════════════════════════════════
PROMPT 3: CUSTOMER 360° PROFILE & SALES PIPELINE
Mode: PLANNING MODE (architecture) → FAST MODE (implementation)
Manifest Reference: Read M1.1 rows DEF-007, DEF-010-013 for
acceptance criteria. Read M2.2 for API contracts.
Resolves: DEF-007, DEF-010, DEF-011, DEF-012, DEF-013
Gaps: GAP-CX-01, GAP-CX-03, GAP-CX-04, GAP-SP-01/02/03
Epics: 2.1, 2.3
══════════════════════════════════════════════════════════════════

PRE-FLIGHT: APIs from Prompt 2 are live. Verify:
  GET /api/customers → 200 OK with 200 records
  GET /api/customers/{any-id} → 200 OK with joined data

GUARDRAIL: NO RBAC. Persona filtering via ?persona= only.

═══════════════════════════════════════════════════════════════════
PHASE A: PLANNING MODE — Architecture
═══════════════════════════════════════════════════════════════════

T3.1: CUSTOMER 360° PAGE ARCHITECTURE (/app/customer/[id]/page.tsx)

Design Server Component page fetching from GET /api/customers/{id}.

HEADER CARD: Full Name, Customer ID (full format), Tier Badge,
Lifecycle Stage Badge, Financial Health Score (gauge 0-100),
NPS, Assigned RM, Contact Info quick-view.

7-TAB INTERFACE (Shadcn Tabs):

TAB 1 — OVERVIEW:
  DemographicsCard, ContactInfoCard, RelationshipDetailsCard,
  HouseholdSidebar (members + combined net worth if HH exists),
  NBARecommendationsWidget (top 3 — placeholder data for now,
  will be wired to /api/nba/recommendations in Prompt 7)

TAB 2 — PRODUCTS:
  ProductHoldingsGrid (customer_products JOIN product_catalog),
  CrossSellEligibility (product gap vs catalog),
  ProductTimeline (acquisition chronology)

TAB 3 — FINANCIALS:
  TransactionTable (last 50, paginated from /api/transactions),
  BalanceTrendChart (Recharts line chart, 12 months from
  account_balances), CLVDisplay, FinancialHealthBreakdown
  (Liquidity 30%, Debt 25%, Savings 20%, Income 15%, Resilience 10%)

TAB 4 — INTERACTIONS:
  InteractionTimeline (all-channel, chronological, sentiment badges),
  ChannelFilter, MeetingLogForm (quick-add: date, type, notes →
  POST /api/interactions)

TAB 5 — DOCUMENTS:
  DocumentList (from kyc_records.documents JSONB),
  DocumentUploadForm (file input, stores ref in JSONB),
  Status badges (Valid/Expiring/Expired)

TAB 6 — RISK:
  AMLRiskCard (from kyc_records.risk_rating),
  KYCStatusCard (completion, next refresh, EDD flag),
  SanctionsPEPHistory (from aml_alerts for this customer),
  FATCACRSClassification

TAB 7 — TASKS / NEXT ACTIONS:
  NBAWidget (placeholder for Prompt 7 wiring),
  PendingFollowups (interactions where outcome='Follow-up'),
  QuickAddTask form

T3.2: COMPONENT TREE (create all in /components/customer-360/):
  CustomerProfileHeader, OverviewTab, DemographicsCard,
  ContactInfoCard, RelationshipDetailsCard, HouseholdSidebar,
  NBARecommendations, ProductsTab, ProductHoldingsGrid,
  CrossSellEligibility, ProductTimeline, FinancialsTab,
  TransactionTable, BalanceTrendChart, CLVDisplay,
  FinancialHealthBreakdown, InteractionsTab, InteractionTimeline,
  ChannelFilter, MeetingLogForm, DocumentsTab, DocumentList,
  DocumentUploadForm, RiskTab, AMLRiskCard, KYCStatusCard,
  SanctionsPEPHistory, FATCACRSClassification, TasksTab,
  NBAWidget, PendingFollowups, QuickAddTask

═══════════════════════════════════════════════════════════════════
PHASE B: FAST MODE — Implementation
═══════════════════════════════════════════════════════════════════

T3.3: BUILD /app/customer/[id]/page.tsx
  Server Component → GET /api/customers/{id} → pass props.
  Not found → Next.js notFound(). FIXES DEF-007.

T3.4: IMPLEMENT ALL TAB COMPONENTS per tree above.
  Each in /components/customer-360/. SWR for client data.
  Recharts for BalanceTrendChart (NO randomness).

T3.5: UPDATE /app/customer/page.tsx — customer card onClick →
  Next.js Link to /customer/{id}. Full customer_id displayed.

T3.6: SALES — FIX DEF-010: + New Deal
  Shadcn Dialog form: Customer (searchable dropdown), Product Type
  (from product_catalog), Deal Name, Deal Value ($), Probability (%),
  Expected Close Date, Assigned RM.
  Submit: POST /api/opportunities → refetch → toast.

T3.7: SALES — FIX DEF-011: Stage Persistence
  Advance button → PUT /api/opportunities/{id} → refetch.

T3.8: SALES — FIX DEF-012: Completed Column
  Close button on Negotiation deals → confirmation modal →
  PUT pipeline_stage='Completed' + win_reason.

T3.9: SALES — FIX DEF-013: Filters
  Filter dropdown: Product Type, Assigned RM, Value Range,
  Probability Range → query params to GET /api/opportunities.

T3.10: DEAL DETAIL VIEW (FIXES GAP-SP-03)
  Click deal card → Shadcn Sheet slide-over: full deal info,
  related customer link, documents, tasks, history,
  win/loss reason if closed. Edit button opens pre-filled form.

VERIFICATION per M1.1 acceptance criteria:
  ✓ /customer/:id returns 200 for all 200 customers
  ✓ All 7 tabs render with live data
  ✓ + New Deal creates and persists
  ✓ Stage advancement survives refresh
  ✓ Completed column shows closed-won deals

══════════════════════════════════════════════════════════════════
```

***

## Prompt 4 — Service, Campaigns, Credit & Compliance

**Mode: ⚡ FAST MODE** | **Sprint: 4** | **Epics: 3.1, 3.3, 4.3** | **Manifest Ref: M1.1 (DEF-014 thru DEF-026)**

```
══════════════════════════════════════════════════════════════════
PROMPT 4: SERVICE, CAMPAIGNS, CREDIT & COMPLIANCE MODULES
Mode: FAST MODE
Manifest Reference: Read M1.1 rows DEF-014 thru DEF-026 for
acceptance criteria. Read M2.2 for all API contracts.
Resolves: DEF-014–026, GAP-SO-01/02, GAP-MK-01–05, GAP-CR-01–04,
          GAP-CO-01–05
Epics: 3.1, 3.3, 4.3
══════════════════════════════════════════════════════════════════

PRE-FLIGHT: Customer 360 and Pipeline from Prompt 3 are live.

═══════════════════════════════════════════════════════════════════

TASK T4.1: SERVICE CASE MANAGEMENT (Epic 3.1)

T4.1.1 — New Case Creation (FIXES DEF-014):
  + New Case button → Shadcn Dialog form:
  Customer (searchable via /api/customers?search=), Subject (required),
  Description (textarea), Channel (Phone/Branch/Web/Chatbot/Email/Mobile),
  Priority (P1-P4), Case Type (Service Request/Inquiry/Complaint/Technical).
  Submit: POST /api/service/cases. Auto-generate case_number.
  SLA auto-calc: P1=4h, P2=8h, P3=24h, P4=48h.
  New case appears in Unified Inbox. Toast notification.

T4.1.2 — Classification Persistence (FIXES DEF-015):
  Save Classification → PUT /api/service/cases/{id}.
  Success toast. Persists on refresh.

T4.1.3 — SLA Escalation (FIXES DEF-016):
  Client-side countdown timer: sla_target_hours - elapsed.
  Display HH:MM:SS. At 0: PUT sla_breached=true. Red badge.
  Browser notification. "Escalate to Supervisor" button →
  PUT status='Escalated'.

T4.1.4 — Case Resolution Workflow (FIXES GAP-SO-02):
  'Resolve Case' button → form: Resolution Notes, Resolution Code
  (dropdown), CSAT Score (1-5 stars). Submit: PUT status='Resolved',
  resolved_at=NOW(). 'Close Case' → PUT status='Closed', closed_at.

═══════════════════════════════════════════════════════════════════

TASK T4.2: CAMPAIGN JOURNEY BUILDER (Epic 4.3)

T4.2.1 — Fix Drag-and-Drop Canvas (FIXES DEF-017):
  Install @dnd-kit/core + @dnd-kit/sortable.
  Rebuild Journey Designer:
  - Toolbox (left): Draggable triggers/logics/actions per Blueprint 3.1
    TRIGGERS: High Value Deposit, Account Anniversary, HNW Tax Optimization
    LOGICS: Check Credit Score, Check Consent, Segment AUM>$500k, Freq Cap
    ACTIONS: Send Email [Fatigue], Push Notification [Fatigue]
  - Canvas (center): Droppable zone. Drag trigger → create NODE.
  - Nodes connected with EDGES (arrows). Click node → config side panel.
  - State: nodes Array<{id,type,position,config}>,
           edges Array<{id,source,target}>
  - Save: POST /api/marketing/journeys {name, nodes, edges, status:'Draft'}
  - Load: GET /api/marketing/journeys → picker → load selected
  - Activate: PUT status='Active'. Validation: ≥1 trigger + ≥1 action.
    FIXES DEF-019.
  - Journey name editable inline.

T4.2.2 — Audience & Consent Tab (FIXES DEF-018 partial):
  Audience Segment Builder: filter by Tier, AUM, Product Holdings,
  NPS, Lifecycle Stage, Consent. Preview: "X customers match"
  (GET /api/customers with filters, return meta.total). Save Segment.
  Consent Dashboard: Total Opted-In/Out/Pending. Channel breakdown.

T4.2.3 — Analytics & ROI Tab (FIXES DEF-018 partial):
  Campaign performance table: Journey Name, Status, Audience Size,
  Sent, Delivered, Opened, Clicked, Converted, Revenue, ROI.
  KPI cards: Total Campaigns, Avg Open Rate, Avg Conversion, Revenue.

T4.2.4 — /marketing Route (FIXES DEF-020):
  Create /app/marketing/page.tsx — Marketing Hub:
  Tabs: Campaigns (→ /campaigns), Performance, Consent Management.
  Campaign Library grid. Quick actions. MUST return 200 OK.

═══════════════════════════════════════════════════════════════════

TASK T4.3: CREDIT ORIGINATION WORKBENCH

T4.3.1 — Auto-Populate Spreading (FIXES DEF-023):
  On application select: GET /api/credit/applications/{id}.
  Pre-fill Income Statement from spreading_data JSONB.
  Pre-fill Balance Sheet. Auto-calculate:
  Gross Profit = Revenue - COGS
  EBITDA = Revenue - COGS - OpEx + D&A
  Net Income = EBITDA - D&A - Interest
  Total Equity = Assets - Liabilities
  Working Capital = Current Assets - Current Liabilities
  DSCR = EBITDA / ADS, DTI = Monthly Debt / Monthly Income
  LTV = Requested / Assets, Current = CA / CL, D/E = L / Equity
  Color-coded ratio cards: Green (pass), Yellow (marginal), Red (breach).
  Save Spreading: PUT with updated spreading_data.

T4.3.2 — + New Application (FIXES DEF-025):
  Dialog: Applicant Name, Company, Customer (search), Loan Type,
  Requested Amount. Route Type auto: STP if <$50K & FICO>720,
  Specialist if >$1M, else Standard. POST /api/credit/applications.

T4.3.3 — Status Filter Tabs (FIXES DEF-026):
  All/Pending Triage/Underwriting/Approved/Declined → GET ?status=.
  Count badges per tab.

T4.3.4 — Bureau Tab (FIXES DEF-024 partial):
  GET /api/mock/credit-bureau?customer_id=. Display: FICO (large),
  Report Date, Utilization (progress bar), Delinquency, Inquiries,
  Total Accounts. Loading spinner during 200ms fetch.

T4.3.5 — Policy Tab (FIXES DEF-024 partial):
  Checklist: Max LTV 80% ✅/❌, Min FICO 640 ✅/❌,
  Max DTI 43% ✅/❌, Min DSCR 1.25x ✅/❌.
  Result: PASS/FAIL/CONDITIONAL. Override button (requires notes).

T4.3.6 — Offer Tab (FIXES DEF-024 partial, GAP-CO-04/05):
  If PASS: Term sheet: Approved Amount, Rate, Term (dropdown),
  Monthly Payment (auto-calc), Total Interest (auto-calc).
  'Generate Offer Letter' button. 'Approve' → PUT status='Approved'.
  'Decline' → PUT status='Declined' + reason codes.

═══════════════════════════════════════════════════════════════════

TASK T4.4: COMPLIANCE WORKFLOWS (Epic 3.3)

T4.4.1 — KYC/Suitability/Audit Tabs (FIXES DEF-021):

  KYC Refresh Tab:
  GET /api/compliance/kyc-reviews. Table: Customer, Risk Rating,
  Last Review, Next Refresh, Days Until Due, Status.
  Color: Red (overdue), Yellow (<30d), Green (>30d).
  Click → KYC detail + 'Complete Review' → PUT status, next_date.

  Suitability Tab:
  Form: Investment Experience, Risk Tolerance (1-10 slider),
  Time Horizon, Financial Knowledge. Result: Risk Category.
  Product suitability matrix: ✅/❌ per product vs risk.

  Audit Trail Tab:
  GET audit_trail. Table: Timestamp, Entity Type, Entity ID,
  Action, Performed By, Changed Fields. Filter by type/action/date.
  READ-ONLY, IMMUTABLE.

T4.4.2 — AML Hit Queue (FIXES GAP-CR-01):
  GET /api/compliance/aml-alerts?status=Open. Table: Customer,
  Alert Type, Severity, Description, Date, Status.
  Click → investigation panel: Customer summary (link /customer/{id}),
  details, Investigation Notes (textarea).
  Actions: Close False Positive, Escalate, File SAR → PUT.

VERIFICATION per M1.1:
  ✓ New Case end-to-end, SLA countdown, escalation
  ✓ Journey Builder drag-drop → save → load → activate
  ✓ /marketing returns 200 OK
  ✓ Credit spreading auto-populated, ratios calculated
  ✓ Bureau/Policy/Offer tabs functional
  ✓ KYC/Suitability/Audit populated
  ✓ AML investigation workflow

══════════════════════════════════════════════════════════════════
```

***

## Prompt 5 — RM Portfolio, Routing & Dashboard Sync

**Mode: ⚡ FAST MODE** | **Sprint: 5** | **Epics: 2.4, 0.3 (remaining)** | **Manifest Ref: M1.1 (DEF-001/002), M1.2 (GAP-SP-04/05, GAP-SO-03)**

```
══════════════════════════════════════════════════════════════════
PROMPT 5: RM PORTFOLIO DASHBOARD, OMNICHANNEL ROUTING & DASHBOARD SYNC
Mode: FAST MODE
Manifest Reference: M1.1 rows DEF-001, DEF-002. M1.2 rows GAP-SP-04,
GAP-SP-05, GAP-SO-03, GAP-DA-04.
Resolves: DEF-001, DEF-002, GAP-SP-04, GAP-SP-05, GAP-SO-03, GAP-DA-04
Epics: 2.4
══════════════════════════════════════════════════════════════════

PRE-FLIGHT: All modules from Prompts 1-4 are live. Full CRUD working.

═══════════════════════════════════════════════════════════════════

TASK T5.1: RM PORTFOLIO DASHBOARD (Epic 2.4, FIXES GAP-SP-04)

Build /components/rm-portfolio/ dashboard components. This renders
as a sub-section within the RM persona view when persona switcher
selects Retail RM or Corp RM.

Portfolio Composition Card:
  - Customer count by segment (from /api/customers?persona=retail_rm
    with GROUP BY tier)
  - Total AUM (SUM of customer_products.current_balance for Investment)
  - Loan portfolio value, Deposit base

Activity Metrics Card:
  - Daily calls, meetings, emails (COUNT from interactions WHERE
    agent_id={rm} AND created_at=today, grouped by type)
  - CRM data entry compliance (% of customers with interaction in
    last 30 days)

Pipeline Metrics Card:
  - Total pipeline value: SUM(deal_value) from opportunities WHERE
    assigned_rm={rm} AND status NOT IN (Completed, Closed-Lost)
  - Weighted pipeline: SUM(deal_value * probability/100)
  - Stage distribution (mini funnel chart, Recharts)
  - Pipeline velocity: AVG days between stage transitions
  - Aging analysis: deals >30 days in current stage (flagged yellow),
    >60 days (flagged red)

Performance vs Quota Card:
  - Attainment tracking: closed deal revenue vs seeded quota target
  - Cross-sell ratio: products sold per customer
  - Win rate: Completed / (Completed + Closed-Lost)

Proactive Alerts Widget (5 alert types):
  1. Life event alerts (customers with lifecycle_stage change)
  2. Risk alerts (churn_risk_score > 0.7)
  3. Opportunity alerts (deals aging > 30 days without advance)
  4. Compliance alerts (KYC refresh due within 30 days for RM's customers)
  5. Service alerts (open cases for RM's customers with sla_breached=true)

Customer Prioritization List:
  - Value-based tiering (sorted by CLV DESC)
  - Engagement scoring (interaction count in last 90 days)
  - Attention priority tags: "At-Risk", "High-Growth", "Dormant"

═══════════════════════════════════════════════════════════════════

TASK T5.2: PRODUCT-SPECIFIC PIPELINE (FIXES GAP-SP-05)

Update /app/opportunities/ page:
  - Add product_type filter to Kanban view:
    All | Deposits | Lending | Investments | Cards | Insurance
  - Each filter calls GET /api/opportunities?product_type={selected}
  - Pipeline KPI cards update per product filter
  - Product-specific deal names in seed data already distinguish by type

═══════════════════════════════════════════════════════════════════

TASK T5.3: PERSONA-SPECIFIC DATA FILTERING (FIXES DEF-001)

Update ALL persona-switchable views to pass ?persona= query param:
  - When persona switcher selects "Retail RM" → all API calls append
    ?persona=retail_rm → backend filters to retail_rm's assigned customers
  - When "Corp RM" → ?persona=corp_rm
  - When "Executive" → no filter (sees all data)
  - When "Compliance Officer" → no filter (sees all, read-only overlay)
  - When "Service Agent" → filter to assigned_agent's cases

Update API endpoints to accept and handle ?persona= parameter:
  /api/customers → WHERE assigned_rm = persona_rm_name (if persona provided)
  /api/opportunities → WHERE assigned_rm = persona_rm_name
  /api/service/cases → WHERE assigned_agent = persona_agent_name

This ensures Executive Dashboard shows ROLE-SPECIFIC data when persona
changes, not identical KPIs across all views. FIXES DEF-001.

═══════════════════════════════════════════════════════════════════

TASK T5.4: DASHBOARD SYNCHRONIZATION (FIXES DEF-002, GAP-DA-04)

Update Executive Dashboard (/) to fetch ALL KPIs from live APIs:

  Revenue KPIs:
  - Total Revenue: SUM(deal_value) from opportunities WHERE
    pipeline_stage='Completed'
  - Net Margin: seeded as 28.4% (will be live-calculated in Phase 5)
  - Avg CLV: AVG(clv) from individual_parties
  - Churn Rate: COUNT(lifecycle_stage='Churned') / COUNT(*)

  Pipeline Funnel:
  - GET /api/opportunities → GROUP BY pipeline_stage
  - COUNT + SUM per stage: MUST match Kanban board counts (FIXES DEF-002)
  - Weighted value = SUM(deal_value * probability/100)

  Territory Analytics:
  - GET /api/customers → GROUP BY tier → count + penetration %

  Customer Experience KPIs:
  - NPS: AVG(nps_score) from individual_parties
  - SLA Adherence: COUNT(NOT sla_breached) / COUNT(*) from service_cases
  - Avg Resolution: AVG(resolved_at - created_at) from resolved cases

  ALL values from live DB queries. ZERO hardcoded values.

═══════════════════════════════════════════════════════════════════

TASK T5.5: CASE TRIAGE ROUTING LOGIC (FIXES GAP-SO-03)

Add rule-based routing engine to case creation (POST /api/service/cases):

  Routing Rules (in order of priority):
  1. VIP Routing: If customer.tier IN ('HNW','UHNW') → assign to
     senior agent pool (use assigned_rm from customer record)
  2. Language Routing: If customer.language_preference != 'en' →
     flag for specialist queue
  3. Skill Routing: If case_type='Technical' → technical support queue.
     If case_type='Complaint' → complaint handling specialist.
  4. Channel Routing: Phone cases → call center agent.
     Branch cases → branch service officer.
     Web/Chatbot → digital support team.
  5. Load Balancing: Among eligible agents, assign to agent with
     lowest open case count (round-robin fallback)

  Store routing decision in case record: routing_rule VARCHAR,
  routing_reason TEXT. Display in case detail panel.

VERIFICATION per M1.1/M1.2:
  ✓ RM Portfolio Dashboard renders with live data
  ✓ Product-specific pipeline filtering works
  ✓ Persona switcher changes data across all views
  ✓ Dashboard counts match Kanban counts exactly
  ✓ New cases auto-routed with rule explanation

══════════════════════════════════════════════════════════════════
```

***

## Prompt 6 — Digital Onboarding State Machine

**Mode: 🏗️ PLANNING → ⚡ FAST** | **Sprint: 6** | **Epic: 3.2** | **Manifest Ref: M1.2 (GAP-CX-02), Blueprint Journey 1**

```
══════════════════════════════════════════════════════════════════
PROMPT 6: DIGITAL ONBOARDING STATE MACHINE
Mode: PLANNING MODE (state machine) → FAST MODE (UI)
Manifest Reference: M1.2 row GAP-CX-02. Blueprint Section 3.1
(Journey 1: Acquisition & Digital Onboarding).
Resolves: GAP-CX-02 | Epic: 3.2
══════════════════════════════════════════════════════════════════

CONTEXT:
Blueprint Journey 1 defines a 6-step digital onboarding flow.
This is the ONLY journey without any implementation — no route,
no UI, no backend exists. Every other journey has at least partial
implementation. Target: 40% reduction in time-to-onboard.

GUARDRAIL: NO real auth. Onboarding creates customer record in DB
without login/session. Edge Functions simulate external systems.

═══════════════════════════════════════════════════════════════════
PHASE A: PLANNING MODE — State Machine Design
═══════════════════════════════════════════════════════════════════

T6.1: ONBOARDING STATE MACHINE ARCHITECTURE

Design a 6-step wizard at /app/onboarding/page.tsx with linear
state progression. Each step has entry conditions and completion
criteria.

STATE MACHINE:
  State 1: IDENTITY & eKYC
    → Entry: User clicks "Onboard New Customer" from any RM view
    → Form: Full Name, DOB, Gender, Nationality, ID Type (Passport/
      National ID/Driving License), ID Number, Upload ID Document
    → Simulated OCR: Display extracted fields for confirmation
    → On complete: status = 'identity_verified'

  State 2: CDD / EDD (Customer Due Diligence)
    → Entry: identity_verified
    → Form: Source of Funds (Employment/Business/Investment/Inheritance),
      Source of Wealth (Salary/Property/Investments/Other),
      Occupation, Employer, Annual Income, Estimated Net Worth,
      Purpose of Relationship (Savings/Investment/Lending/Transaction)
    → EDD Trigger: Auto-detect if nationality is high-risk jurisdiction
      OR estimated net worth > $5M OR PEP flag from Step 1
    → If EDD triggered: Additional fields — Detailed Source of Funds
      narrative, Supporting documentation upload
    → On complete: status = 'cdd_completed'

  State 3: AML & SANCTIONS SCREENING
    → Entry: cdd_completed
    → Auto-execute: Call /api/mock/aml-screening?customer_id=temp_{name}
      AND /api/mock/sanctions-screening?customer_id=temp_{name}
    → Display: Loading spinner ("Screening in progress...") → Results:
      AML Risk Rating (Low/Medium/High), Sanctions Match (Yes/No),
      False Positive Assessment (if near-match)
    → DECISION BRANCH:
      If risk=Low AND match=false → auto-PASS → proceed
      If risk=Medium OR match=near → manual review required → show
        "Pending Compliance Review" with escalation button
      If risk=High OR match=true → auto-FAIL → display rejection
        with reason and "Refer to Compliance Officer" CTA
    → On PASS: status = 'aml_cleared'

  State 4: PRODUCT SELECTION & SUITABILITY
    → Entry: aml_cleared
    → Display: Recommended products based on income/net worth tier:
      Standard: Savings Account + Debit Card
      Premium: Premium Savings + Credit Card + Personal Loan eligible
      HNW: Investment Advisory + Priority Banking
      UHNW: Private Banking Suite + Wealth Management
    → Suitability check: For investment products, show Risk Tolerance
      questionnaire (5 questions → score → Conservative/Moderate/
      Aggressive). Block unsuitable products.
    → User selects products from recommendation. At least 1 required.
    → On complete: status = 'products_selected'

  State 5: ACCOUNT OPENING
    → Entry: products_selected
    → Display: Summary of all information collected (review step)
    → Terms & Conditions acceptance (checkbox, required)
    → E-signature simulation: "Click to Sign" button with signature
      pad (canvas element for drawn signature or typed name)
    → Regulatory disclosures: FATCA/CRS self-certification form
      (country of tax residence, TIN)
    → On sign: status = 'account_opened'

  State 6: COMPLETION & WELCOME
    → Entry: account_opened
    → Backend actions (all via API):
      1. POST /api/customers → create individual_party record with
         tier auto-assigned based on annual_income/net_worth
      2. POST /api/customer-products for each selected product
      3. POST /api/compliance/kyc-records → create KYC record
      4. POST audit_trail → action=CREATE for new customer
    → Display: Welcome screen with:
      Customer ID (newly generated), Account numbers,
      Assigned RM (auto-assigned based on tier + territory),
      "Your onboarding is complete" confirmation,
      Next steps: Download app, Schedule first meeting with RM
    → Publish customer.onboarded event (console.log for Phase 3,
      event bus in Phase 5)

═══════════════════════════════════════════════════════════════════
PHASE B: FAST MODE — UI Implementation
═══════════════════════════════════════════════════════════════════

T6.2: BUILD ONBOARDING WIZARD

Create /app/onboarding/page.tsx (Client Component — multi-step form):
  - Shadcn Stepper/Progress indicator showing 6 steps
  - Each step is a component in /components/onboarding/:
    Step1Identity, Step2CDD, Step3AMLScreening, Step4ProductSelection,
    Step5AccountOpening, Step6Welcome
  - State management: useReducer with onboarding state machine
  - Progress persists in React state (no DB until Step 6 completion)
  - Back button available for Steps 1-5 (not from Step 6)
  - Step 3 AML screening shows real API calls to mock endpoints
  - Step 4 suitability blocks unsuitable products
  - Step 5 signature pad: HTML5 Canvas or simple typed-name input

T6.3: ADD ENTRY POINTS
  - Add "Onboard New Customer" button to:
    * Retail RM dashboard (prominent CTA)
    * Branch Manager dashboard
    * /leads page (next to "Convert to Customer" in BANT panel)
  - All buttons navigate to /onboarding

T6.4: CREATE PLACEHOLDER PAGES FOR DEFERRED ROUTES
  While building onboarding, also create:
  /app/wealth/page.tsx → "Coming in Phase 4" with Wealth module teaser
  /app/branch/page.tsx → "Coming in Phase 4" with Branch module teaser
  /app/knowledge/page.tsx → "Coming in Phase 4"
  /app/analytics/page.tsx → "Coming in Phase 4"
  All MUST return 200 OK. Use consistent layout with persona nav.

VERIFICATION per M1.2 GAP-CX-02:
  ✓ End-to-end onboarding in ≤10 clicks
  ✓ AML screening at Step 3 with PASS/FAIL branching
  ✓ Suitability blocks unsuitable products at Step 4
  ✓ New customer appears in /customer directory after Step 6
  ✓ /customer/{new-id} shows full 360° profile
  ✓ All deferred routes return 200 OK (no more 404s)

══════════════════════════════════════════════════════════════════
```

***

## Prompt 7 — NBA Engine V1, CLV Model & AI Foundation

**Mode: 🏗️ PLANNING → ⚡ FAST** | **Sprint: 7** | **Epics: 5.1, 5.2, 5.4 (partial)** | **Manifest Ref: M1.4**

```
══════════════════════════════════════════════════════════════════
PROMPT 7: NBA ENGINE V1, CLV MODEL & AI EXPLAINABILITY
Mode: PLANNING MODE (engine design) → FAST MODE (implementation)
Manifest Reference: M1.4 (Agentic Intelligence Layer). Blueprint
Sections 5.1 (NBA Engine), 5.2 (Model Inventory), 5.4 (Explainability).
Resolves: NBA Engine, CLV Model, Mock Scoring Models, Explainability
Epic Coverage: Blueprint Section 5 (partial — rule-based V1)
══════════════════════════════════════════════════════════════════

CONTEXT:
Blueprint Section 5 defines a comprehensive Agentic Intelligence
Layer with 7 predictive models, 6 autonomous agents, and an NBA
engine. For Phase 3, we implement a RULE-BASED V1 of the NBA engine
and CLV calculation, plus mock scoring endpoints for credit/churn/AML.
Full ML models and autonomous agents are deferred to Phase 5.

GUARDRAIL: NO external ML services. NO Python/scikit-learn. All logic
in TypeScript. Rule-based scoring only. Deterministic outputs.

═══════════════════════════════════════════════════════════════════
PHASE A: PLANNING MODE — Engine Architecture
═══════════════════════════════════════════════════════════════════

T7.1: NBA ENGINE V1 — RULE-BASED DECISIONING API

Design /lib/nba/engine.ts implementing the 5-stage pipeline from
Blueprint Section 5.1:

  Stage 1 — Eligibility Filtering:
    Input: customer_id
    Logic: Load customer from DB (tier, products, lifecycle_stage).
    Filter product_catalog to exclude:
    - Products customer already holds (JOIN customer_products)
    - Products customer is ineligible for (tier restrictions,
      age restrictions, regulatory blocks)
    Output: eligible_products[]

  Stage 2 — Propensity Scoring (Rule-Based V1):
    For each eligible product, calculate propensity_score (0-100):
    - +30 if product_category matches customer's top transaction category
    - +20 if customer.tier >= product's target tier
    - +15 if customer has no product in this category (gap fill)
    - +10 if customer.lifecycle_stage = 'Growth' (high activity)
    - +10 if customer.financial_health_score > 70
    - +5 if customer.nps_score > 50
    - -20 if customer.churn_risk_score > 0.7

  Stage 3 — Prioritization Ranking:
    composite_score = propensity_score * product_margin_weight * urgency
    Where margin_weight: Investments=1.5, Lending=1.3, Cards=1.2,
    Insurance=1.1, Deposits=1.0
    Where urgency: 1.5 if CD maturing within 60 days, 1.3 if
    lifecycle_stage='At-Risk', 1.0 otherwise
    Sort by composite_score DESC. Return top 3.

  Stage 4 — Treatment Selection:
    For each recommendation, select:
    - message_template (from hardcoded library per product category)
    - channel_preference (from customer's most-used interaction channel)
    - offer_variant (standard vs premium based on tier)

  Stage 5 — Explainability:
    For each recommendation, generate explanation object:
    { product, score, top_factors: [
        { factor: "Gap: No investment product", weight: +15 },
        { factor: "Growth lifecycle stage", weight: +10 },
        { factor: "High financial health (85/100)", weight: +10 }
      ],
      why_now: "CD maturing in 45 days — opportunity to redirect funds",
      confidence: "High" | "Medium" | "Low"
    }

API Endpoint: GET /api/nba/recommendations/{customerId}
Response: { data: NBARecommendation[], meta: { customer_id, generated_at,
  model_version: "rule-based-v1" } }

═══════════════════════════════════════════════════════════════════

T7.2: CLV CALCULATION MODEL

Design /lib/models/clv.ts per Blueprint Section 5.1 formula:
  CLV = Σ (Revenue_t - Cost_t) / (1 + discount_rate)^t

  Where:
  Revenue_t = SUM(product margins) + SUM(fee income) from customer_products
  Cost_t = estimated cost_to_serve (tier-based: Standard=$50, Premium=$100,
    HNW=$300, UHNW=$800 per month) + estimated credit_losses
    (churn_risk_score * total_balance * 0.01)
  discount_rate = 0.10 (risk-free 5% + risk premium 5%)
  t = 5-year horizon (t=1..5)

API Endpoint: GET /api/models/clv/{customerId}
Response: { data: { clv_5yr, clv_breakdown: { year_1, year_2, ..., year_5 },
  inputs: { revenue, cost_to_serve, credit_losses, discount_rate },
  confidence: "High"|"Medium"|"Low" } }

Update Customer 360 Financials Tab (Prompt 3's CLVDisplay component):
  Wire to GET /api/models/clv/{customerId} instead of static clv field.

═══════════════════════════════════════════════════════════════════

T7.3: MOCK SCORING MODEL ENDPOINTS

Create Edge Function mock endpoints that simulate the 7 models:

  /api/mock/models/credit-score?customer_id= →
    { score: 300-850, risk_grade: 'A'-'F', default_probability: 0.xx,
      top_factors: [{factor, impact}], model: 'xgboost-mock-v1' }

  /api/mock/models/churn-prediction?customer_id= →
    { churn_probability: 0.xx, risk_level: 'Low'|'Medium'|'High',
      top_factors: [{factor, impact}], recommended_actions: [string],
      model: 'random-forest-mock-v1' }

  /api/mock/models/aml-risk?customer_id= →
    { risk_rating: 'Low'|'Medium'|'High', risk_score: 0-100,
      risk_factors: [{factor, weight}], model: 'rule-hybrid-mock-v1' }

All deterministic: same customer_id = same output. Keyed to seeded
customer attributes (tier, transaction volume, geography).

═══════════════════════════════════════════════════════════════════
PHASE B: FAST MODE — Wiring to UI
═══════════════════════════════════════════════════════════════════

T7.4: AI EXPLAINABILITY UI COMPONENTS (Blueprint Section 5.4)

Create /components/ai-explainability/:

  NBAExplainCard — Shows recommendation with:
    Product name + icon, Propensity score (progress bar),
    Top 3 contributing factors (bar chart or list),
    "Why Now" explanation text, Confidence badge,
    "Accept" / "Defer" / "Dismiss" action buttons
    (Accept → creates opportunity, Defer → schedules follow-up)

  CLVExplainCard — Shows CLV with:
    5-year CLV value (large number), Year-by-year breakdown (bar chart),
    Input assumptions table, Confidence indicator

  ModelScoreCard — Reusable component for credit/churn/AML scores:
    Score display (gauge or number), Risk level badge,
    Top contributing factors (horizontal bar chart with +/- impact),
    Model version identifier, "Override" button with mandatory notes

T7.5: WIRE NBA TO CUSTOMER 360

Update /components/customer-360/NBARecommendations:
  - Fetch GET /api/nba/recommendations/{customerId}
  - Render 3 NBAExplainCards
  - "Accept" button → POST /api/opportunities (pre-filled from NBA data)

Update /components/customer-360/NBAWidget (Tasks tab):
  - Same data, compact view

Update Service Agent workbench (Agent Assist panel):
  - If customer.churn_risk_score > 0.5, show retention NBA
  - Fetch /api/mock/models/churn-prediction → display in panel

T7.6: WIRE CLV TO CUSTOMER 360

Update /components/customer-360/CLVDisplay:
  - Fetch GET /api/models/clv/{customerId}
  - Replace static clv field with calculated CLV
  - Show CLVExplainCard with breakdown

T7.7: WIRE MODEL SCORES TO RELEVANT MODULES

Credit Workbench:
  - Bureau tab: also call /api/mock/models/credit-score, display
    ModelScoreCard alongside bureau data

Compliance Dashboard:
  - Customer risk drill-down: call /api/mock/models/aml-risk,
    display ModelScoreCard

RM Portfolio Dashboard:
  - Customer prioritization list: show churn_probability from
    /api/mock/models/churn-prediction, flag high-risk customers

VERIFICATION per M1.4:
  ✓ GET /api/nba/recommendations returns top-3 with explainability
  ✓ GET /api/models/clv returns 5-year calculation with breakdown
  ✓ All 3 mock model endpoints return deterministic scores
  ✓ NBAExplainCard renders in Customer 360 with Accept/Defer/Dismiss
  ✓ CLV shown in Financials tab with year-by-year breakdown
  ✓ Model scores visible in Credit, Compliance, and RM Dashboard

══════════════════════════════════════════════════════════════════
```

***

## M5. POST-EXECUTION QA VERIFICATION CHECKLIST

After all 7 prompts are executed, run this checklist against the manifest:

### Route Resolution Status

| Route | Pre-Phase 3 Status[^1] | Target | Resolution Prompt |
|-------|---------------------------|--------|-------------------|
| `/customer/:id` | 404 | 200 ✅ | Prompt 3 |
| `/marketing` | 404 | 200 ✅ | Prompt 4 |
| `/onboarding` | N/A | 200 ✅ (NEW) | Prompt 6 |
| `/wealth` | 404 | 200 ✅ (Placeholder) | Prompt 6 |
| `/branch` | 404 | 200 ✅ (Placeholder) | Prompt 6 |
| `/knowledge` | 404 | 200 ✅ (Placeholder) | Prompt 6 |
| `/analytics` | 404 | 200 ✅ (Placeholder) | Prompt 6 |
| `/api/customers` | 404 | 200 ✅ | Prompt 2 |
| `/api/leads` (GET) | 404 | 200 ✅ | Prompt 2 |
| `/api/opportunities` | 404 | 200 ✅ | Prompt 2 |
| `/api/service/cases` | 404 | 200 ✅ | Prompt 2 |

### Functional Readiness Target

| Metric | Phase 2 Baseline[^1] | Phase 3 Target |
|--------|-------------------------|----------------|
| Overall Readiness | ~52% | ≥92% |
| Routes Functional | 9/18 | 18/18 (including placeholders) |
| APIs Responding | 4/8 | 20+/20+ |
| Forms Working E2E | 4/6 | 10+/10+ |
| Critical Bugs | 7 | 0 |
| High Priority Bugs | 9 | 0 |
| Data Persistence | None | Full PostgreSQL |
| AI/NBA Integration | None | Rule-based V1 |

### Items Deferred to Phase 4/5

| Item | Blueprint Ref | Deferred To | Dependency |
|------|--------------|-------------|------------|
| Wealth Management Module (full) | Epic 4.1[^2] | Phase 4 | Customer 360 complete |
| Branch Operations Module (full) | Epic 4.2[^2] | Phase 4 | Service module complete |
| Analytics Dashboard (full) | Epic 4.4[^2] | Phase 4 | All data domains live |
| Knowledge Base Module (full) | Epic 4.5[^2] | Phase 4 | Service module complete |
| Authentication / RBAC | GAP-DA-02[^2] | Phase 5 | All features stable |
| Email Drafting Agent | Section 5.3[^2] | Phase 5 | NBA Engine V2 |
| Financial Statement Summarizer | Section 5.3[^2] | Phase 5 | Credit module complete |
| Meeting Prep Agent | Section 5.3[^2] | Phase 5 | Customer 360 + interactions |
| Compliance Check Agent | Section 5.3[^2] | Phase 5 | Compliance workflows stable |
| Campaign Optimization Agent | Section 5.3[^2] | Phase 5 | Campaign builder stable |
| Full ML Models (XGBoost, Random Forest) | Section 5.2[^2] | Phase 5 | Training data + pipeline |
| Event-Driven Architecture | GAP-EVENT[^2] | Phase 5 | Kafka/event bus setup |

---

## References

1. [Phase-2-Banking-CRM-Comprehensive-QA-Validation-Gap-Analysis-Report.docx](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/82338053/111853eb-3442-41ef-8ac6-44d6e4ba2fb5/Phase-2-Banking-CRM-Comprehensive-QA-Validation-Gap-Analysis-Report.docx?AWSAccessKeyId=ASIA2F3EMEYERXQSQBW7&Signature=l0wyGKdtNFtAfyLeoS6BX1Y2rfo%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEOn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIFcJqe2iq4sxUfLV7j42w6HAgjm4Ppsbc7uHbkhDOZqxAiEAiy0ua6FBTDVIiV3DGilLw8a3aPCJvPPMjv1I0gdtMo0q%2FAQIsv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDIHFXoSt4u%2FMojH7BirQBKijXBfz11pu4RlqPBphQcn427zMbK3HU%2FLRt1fiu1u8Rz45lrvb2vGUwXwWcRozmRN1wz8WAImAMSoquwn1vCmqiUjck0hSPIWokHydOJI1VLo%2BcX8SGhbeCLkvyaC8hWV1T%2FJDGa1IysxZikENu4LiSYoSMOh5pR2H3OU5CQBfvx4CgyD9yWZ2IP67M6SNZHuB2h8kgpA2Rsx7TgdoAF7%2FBjS9Q48nuHA1iTMxAS3v43aPyCQBljwlVKhjjr%2BTnjhj0TiqSfhg4m0E98WQptPwxsOS3eBhS6mPX4cigHX%2FBm4P2CFSOgzDST0L7n42YWcVHx8u%2BMxK%2FLsUhpq8AkpucxzWIyuFIq6JghWfulhdxAc3JMOul%2FS54aHb0JYPsou2Pgx3f16C%2BiaicZ5%2FJKQhqWkmB0b9k5qofCrXJAMaAZ0p0Ay5JpVTp%2F%2B293RCJ5PNDewTjm4rnxdnFv%2BdX5BUJcTMJbSWlpeS8e7Hvi4AkptsJawuYI1ajY9x3sq08A1FeNZSGVeTDRBxvaXg%2BGCjQeadHU6EJPEph97B%2BSaEQ1prdSLYmdrGwjeCuG2Y801sBkkSLUkKZwuVT1xjmc9w%2ByiStlnL5ti4Nd%2BNGihnMstoIlxMe7JShR3nqd%2BItY6Lpz7cM7HyVvnasLnjdysRWKxq9ZKV7P2QiRIqfYHi6Y4CJqDMvHxPWng6LU2y3o%2FrzhPKmHvJTwYSWh4Yss0EB3YOWwd8%2FUCMAN5FTr8cTHAZbrKKNRGxxSSgvfU9hl0M3JRzGMzKC5HkPdO0vy0wtsXnzAY6mAE4IxleCKJuWp45u0vvKgGGAjfH6qZpAwaVQal1NyJHx%2F4B3rXNgerdl4YzNT%2F6mp5xgm6YClM7AzA4biJCJf4O2Cl79uze%2BAI2khmJhweHvGpGMxh1LMY9nwodbQSARcmwFjyt3Aj1iF7RiFURQLdsivW%2BhQi2bLjIO8K1jBN84cVWMGRyv34GeMoXzMKwKUwtaNsGZev7SA%3D%3D&Expires=1771697072) - # Banking CRM --- Comprehensive QA Validation & Gap Analysis Report

###### Application: https://eig...

2. [Banking-CRM-Blueprint.docx](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/82338053/441f9b92-af5b-4209-a04f-8e4109c52ab6/Banking-CRM-Blueprint.docx?AWSAccessKeyId=ASIA2F3EMEYERXQSQBW7&Signature=64wkOZDKQfdqQ2vik%2FNou6JzP38%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEOn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIFcJqe2iq4sxUfLV7j42w6HAgjm4Ppsbc7uHbkhDOZqxAiEAiy0ua6FBTDVIiV3DGilLw8a3aPCJvPPMjv1I0gdtMo0q%2FAQIsv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDIHFXoSt4u%2FMojH7BirQBKijXBfz11pu4RlqPBphQcn427zMbK3HU%2FLRt1fiu1u8Rz45lrvb2vGUwXwWcRozmRN1wz8WAImAMSoquwn1vCmqiUjck0hSPIWokHydOJI1VLo%2BcX8SGhbeCLkvyaC8hWV1T%2FJDGa1IysxZikENu4LiSYoSMOh5pR2H3OU5CQBfvx4CgyD9yWZ2IP67M6SNZHuB2h8kgpA2Rsx7TgdoAF7%2FBjS9Q48nuHA1iTMxAS3v43aPyCQBljwlVKhjjr%2BTnjhj0TiqSfhg4m0E98WQptPwxsOS3eBhS6mPX4cigHX%2FBm4P2CFSOgzDST0L7n42YWcVHx8u%2BMxK%2FLsUhpq8AkpucxzWIyuFIq6JghWfulhdxAc3JMOul%2FS54aHb0JYPsou2Pgx3f16C%2BiaicZ5%2FJKQhqWkmB0b9k5qofCrXJAMaAZ0p0Ay5JpVTp%2F%2B293RCJ5PNDewTjm4rnxdnFv%2BdX5BUJcTMJbSWlpeS8e7Hvi4AkptsJawuYI1ajY9x3sq08A1FeNZSGVeTDRBxvaXg%2BGCjQeadHU6EJPEph97B%2BSaEQ1prdSLYmdrGwjeCuG2Y801sBkkSLUkKZwuVT1xjmc9w%2ByiStlnL5ti4Nd%2BNGihnMstoIlxMe7JShR3nqd%2BItY6Lpz7cM7HyVvnasLnjdysRWKxq9ZKV7P2QiRIqfYHi6Y4CJqDMvHxPWng6LU2y3o%2FrzhPKmHvJTwYSWh4Yss0EB3YOWwd8%2FUCMAN5FTr8cTHAZbrKKNRGxxSSgvfU9hl0M3JRzGMzKC5HkPdO0vy0wtsXnzAY6mAE4IxleCKJuWp45u0vvKgGGAjfH6qZpAwaVQal1NyJHx%2F4B3rXNgerdl4YzNT%2F6mp5xgm6YClM7AzA4biJCJf4O2Cl79uze%2BAI2khmJhweHvGpGMxh1LMY9nwodbQSARcmwFjyt3Aj1iF7RiFURQLdsivW%2BhQi2bLjIO8K1jBN84cVWMGRyv34GeMoXzMKwKUwtaNsGZev7SA%3D%3D&Expires=1771697072) - Persona-Driven Enterprise Banking CRM Product Blueprint Version 1.0 Date 21 February 2026 Classifica...

