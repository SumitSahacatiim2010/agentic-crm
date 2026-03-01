# SPEC.md — Project Specification

> **Status**: `FINALIZED`
> **Project**: BankingCRM 2.5
> **Created**: 2026-03-01 (retroactive — project is brownfield, Phases 1-4 complete)

## Vision

Build a **demo-grade, multi-persona enterprise Banking CRM** that showcases end-to-end workflows across Retail RM, Corporate RM, Branch Manager, Marketing Manager, Compliance Officer, Credit Officer, Wealth Advisor, Service Agent, Executive, and Global Admin personas — all powered by a live Postgres database via InsForge MCP with deterministic rendering, zero authentication (open allow-all), and premium dark-mode UI.

## Goals

1. **10-persona workspace system** with persona-specific dashboards, KPIs, and contextual actions
2. **6 end-to-end workflows**: Digital Onboarding, Lead→Deal conversion, Service Case lifecycle, Credit Application, Campaign Journey Builder, Wealth Portfolio Management
3. **Full module coverage**: Customer 360, Leads, Opportunities, Servicing, Compliance, Credit, Wealth, Branch Ops, Analytics, Marketing/Campaigns, Knowledge Base
4. **Live database binding** — all data fetched from/persisted to InsForge Postgres, no static mocks in production views
5. **Demo-ready quality** — no NaN/undefined/placeholder values, every button produces observable behavior, every form persists and shows feedback
6. **Headless journey microservices** — decompose J1/J2/J3 into atomic operations exposed as MCP tools for AI agent consumption
7. **Goal-oriented AI agents** — agents that use MCP tools to autonomously execute journey steps, draft comms, and optimize campaigns

## Non-Goals (Out of Scope)

- Authentication / Authorization / RBAC — indefinitely deferred; persona switcher remains the only role mechanism to preserve demo flow
- Full ML model training pipelines (XGBoost/Random Forest)
- Mobile app or PWA
- Real payment processing or banking integrations

## Users

| Persona | Role |
|---|---|
| Retail RM | Personal banking client management, cross-sell, portfolio growth |
| Corporate RM | Enterprise client management, deal structuring |
| Branch Manager | Walk-in lead capture, team oversight, branch KPIs |
| Marketing Manager | Campaign design, journey builder, segment analytics |
| Compliance Officer | AML/KYC monitoring, sanctions screening, audit trails |
| Credit Officer | Application intake, underwriting queue, decisioning |
| Wealth Advisor | Portfolio oversight, drift detection, rebalancing, proposal generation |
| Service Agent | Case inbox, SLA tracking, knowledge base, screen pop |
| Executive | Cross-domain KPIs, revenue, margin, CLV, churn analytics |
| Global Admin | Full system oversight, all quick links, configuration |

## Tech Stack

- **Framework**: Next.js 15 App Router + TypeScript
- **Build**: Turbopack
- **Styling**: Tailwind CSS + Shadcn/UI (Radix primitives)
- **Charts**: Recharts
- **DnD**: @dnd-kit
- **Forms**: react-hook-form + Zod
- **Database**: Postgres via InsForge MCP (allow-all RLS)
- **State**: React useState/useEffect (no external state manager)

## Constraints

- **No authentication** — persona switcher is the only role simulation
- **Deterministic rendering** — no `Math.random()`, `Date.now()`, `new Date()` in render paths
- **Turbopack only** — no webpack-only dependencies
- **Additive schema only** — existing tables/columns cannot be renamed or removed
- **InsForge MCP** — all DB operations go through InsForge SDK, no direct Postgres connections

## Success Criteria

- [x] All 10 personas have dedicated workspaces with relevant KPIs
- [x] 6/6 workflows complete end-to-end with persistence + feedback
- [x] 0 NaN/undefined/SEGMENT placeholder values visible anywhere
- [x] Every button click produces observable behavior (modal/nav/toast)
- [x] Every form submit persists data and shows success/failure feedback
- [x] 500+ seeded records across all entity domains
- [ ] 15-minute demo script executable without manual DB edits
- [ ] Production build succeeds with zero errors
- [ ] Readiness score ≥ 92/100
