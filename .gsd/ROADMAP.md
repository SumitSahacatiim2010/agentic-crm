# ROADMAP.md

> **Current Phase**: Phase 5 (next up)
> **Milestone**: v2.5 Production Readiness

## Must-Haves (from SPEC)

- [x] 10-persona workspace system
- [x] 6 end-to-end workflows with persistence
- [x] Full module coverage (12 modules)
- [x] Live database binding via InsForge
- [x] Demo-ready quality (no trust-breakers)
- [ ] Production build + deployment
- [ ] AI agent integrations

---

## Phases

### Phase 1: Foundation & Schema
**Status**: ✅ Complete
**Objective**: Establish Next.js 15 project, InsForge integration, core schema (parties, individual_parties, addresses, contacts, products), and seed data.
**Delivered**:
- Project scaffolding with Turbopack
- InsForge MCP connection
- Core entity tables with allow-all RLS
- Initial 200 customer seed records
- Customer Directory and basic persona layout

---

### Phase 2: Core Modules — Leads, Opportunities, Servicing, Credit
**Status**: ✅ Complete
**Objective**: Build the four main operational modules with live data binding and basic workflow support.
**Delivered**:
- Lead Capture & Management (`/leads`)
- Opportunity Pipeline with Kanban (`/opportunities`)
- Service Case Inbox with SLA tracking (`/servicing`)
- Credit Origination queue (`/credit`)
- Customer 360 with financial profiles, interaction timeline, compliance cards
- RM Dashboard with performance scorecard and territory analytics

---

### Phase 3: Compliance, Marketing, Onboarding, Executive
**Status**: ✅ Complete
**Objective**: Complete remaining persona workspaces, build onboarding wizard, and deliver executive KPIs.
**Delivered**:
- Compliance Dashboard with AML/KYC monitoring, sanctions screening
- Marketing Hub with campaign analytics and segment drill-downs
- 6-step Digital Onboarding Wizard (Identity → CDD → EDD → Products → Review → Complete)
- Journey Builder canvas with drag-and-drop nodes
- Executive KPI dashboard
- Persona Switcher (10 personas)

---

### Phase 4: QA Remediation, Deferred Epics, Demo Readiness
**Status**: ✅ Complete
**Objective**: Fix all 38 QA bugs, complete 6/6 workflows end-to-end, deliver deferred epics (Wealth, Branch Ops, Analytics, Knowledge Base).
**Delivered**:
- All 38 bugs resolved (BUG-001 through BUG-044)
- 6/6 workflows functional end-to-end
- Wealth Management module (portfolio, drift, rebalance, proposals)
- Branch Operations workspace (lead queues, BANT, branch KPIs)
- Executive Analytics Dashboard (cross-domain charts, filters)
- Knowledge Base module (article search, service context linking)
- Campaign Builder DnD, Save, Activate
- Profile dropdown panel
- Date locale standardization (`fmtDate` utility)
- 500+ seed records across all entities

---

### Phase 5: Cross-cutting Polish & Production Build
**Status**: ⬜ Not Started
**Objective**: Harden the application for production: build optimization, error boundaries, loading states, SEO, accessibility audit, and production deployment.
**Requirements**: REQ-P5-01 through REQ-P5-06

Planned tasks:
- Production `next build` — zero errors, zero warnings
- Global error boundaries and 404/500 pages
- Loading skeletons for all async data-fetching pages
- SEO meta tags on all routes
- WCAG 2.1 AA accessibility audit and fixes
- Performance optimization (bundle analysis, image optimization, code splitting)

---

### Phase 6: Headless Journey Microservices & MCP Tools Layer
**Status**: ✅ Complete
**Objective**: Decompose the 3 hero journeys (J1: Retail Walk-In, J2: Digital Lead Capture, J3: Branch-Led Onboarding) into headless, architecture-based microservices. Then expose these as MCP-layered tools that AI agents can invoke for goal-oriented task execution.
**Source Docs**: `Story1.md`, `Story2.md`, `Story3.md` (project root)
**Requirements**: REQ-P6-01 through REQ-P6-06

Planned tasks:
- Analyze J1/J2/J3 journey step maps and extract discrete business operations
- Build headless microservices for each atomic operation (lead capture, BANT qualification, lead→opportunity conversion, credit application intake, onboarding step progression, case creation, etc.)
- Expose each microservice as an MCP tool with typed inputs/outputs
- Create MCP tool manifest describing available actions, parameters, and return schemas
- Integration tests proving each tool can be invoked independently
- Documentation: tool catalog with usage examples for agent consumption

---

### Phase 7: AI Agent Integration
**Status**: ⬜ Not Started
**Objective**: Build goal-oriented AI agents that consume the Phase 6 MCP tools to autonomously execute journey steps, draft communications, summarize financials, and optimize campaigns.
**Depends on**: Phase 6 (MCP tools must exist first)
**Requirements**: REQ-P7-01 through REQ-P7-05

Planned tasks:
- InsForge AI SDK integration
- Journey orchestration agents (use MCP tools to execute J1/J2/J3 steps)
- Email Drafting Agent (RM workspace)
- Financial Statement Summarizer (Wealth workspace)
- Meeting Prep Agent (Customer 360)
- Compliance Check Agent (automated screening)
- Campaign Optimization Agent (marketing A/B testing)

---

### Phase 8: Event Architecture & Real-time
**Status**: ⬜ Not Started
**Objective**: Implement event-driven architecture with real-time updates via InsForge WebSockets.
**Requirements**: REQ-P8-01 through REQ-P8-03

Planned tasks:
- InsForge Real-time subscription layer
- Live case status updates in Service Agent inbox
- Real-time lead routing notifications
- Pipeline stage change broadcasts
- Compliance alert push notifications

---

### Phase 9: Production Deployment & Monitoring
**Status**: ⬜ Not Started
**Objective**: Deploy to production with CI/CD, monitoring, alerting, and observability.
**Requirements**: REQ-P9-01 through REQ-P9-04

Planned tasks:
- InsForge deployment via MCP
- Environment variable management
- Health checks and uptime monitoring
- Error tracking and alerting
- Performance monitoring dashboards
