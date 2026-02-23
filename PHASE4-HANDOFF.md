# Handoff: Banking CRM V2.5 → Phase 4 (Intelligent Banking Operations)

Welcome! Phase 3 of the Banking CRM transition is strictly complete. The application has been refactored from a generic CRM into a data-driven Banking Relationship Manager (RM) workspace.

## 🚀 Core Accomplishments in Phase 3
- **Schema Refactoring**: Successfully swapped the generic `parties` table for a specialized `individual_parties` root. All foreign keys (`customer_id`) have been aligned.
- **Unified 360 View**: A 7-tab customer profile (`/customer/[id]`) is now live, featuring Financials, Products, Compliance, and Interactions.
- **RM Portfolio Dashboard**: Real-time analytics on Tier penetration (Standard, Premium, HNW, UHNW) and Whitespace analysis. Fixed a critical $0.00M revenue bug by aligning `Completed` stages with DB constraints.
- **Agentic AI V1**: 
  - **NBA Engine**: Deterministic recommendation engine at `/api/nba/recommendations/[customerId]`.
  - **CLV Model**: 5-Year DCF-based Lifetime Value model at `/api/models/clv/[customerId]`.
  - **Explainability**: UI cards for "Why this action?" and "Why this score?".
- **Onboarding & Operations**: Built a multi-stage Onboarding Wizard and wired the Lead Ingestion lifecycle.

## 🛠 Tech Stack & Infrastructure
- **Framework**: Next.js 15 (App Router)
- **Database**: Insforge Managed Cloud (Postgres)
- **SDK**: `@insforge/sdk`
- **MCP Server**: `my-first-project` (Handles DB, Storage, and Edge Functions)

## ⚠️ Critical Context & Architecture Decisions
- **Table Renaming**: **DO NOT USE** `sales_opportunities`. The correct table is `opportunities`.
- **Primary Keys**: Always query `individual_parties(id)` for customer-related data.
- **Stage Alignment**: The Opportunity stage `Completed` is the hardcoded check constraint in the DB for a "Won" deal. Avoid `Closed-Won` in code logic for persistence.
- **Edge Functions**: 6 critical proxies are active (e.g., `core-banking-proxy`, `aml-sanctions-proxy`). Use them to fetch real-world data from legacy systems.

## 🎯 Next Steps for Phase 4
1. **Service Case Management**: Implement automated Triage logic based on Priority and SLA.
2. **Campaign Journey Builder**: Finalize the drag-and-drop marketing automation UI.
3. **Credit Origination**: Integrate ML-based credit scoring into the Loan application workflow.
4. **Compliance Workflows**: Build the full KYC/Onboarding approval queue for back-office users.

Good luck explorer. The foundations are solid.
