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
- [ ] Auth/RBAC
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

### Phase 6: Authentication & RBAC
**Status**: ⬜ Not Started
**Objective**: Implement real authentication, role-based access control, and per-persona route guards using InsForge Auth.
**Requirements**: REQ-P6-01 through REQ-P6-04

Planned tasks:
- InsForge Auth integration (sign-up, sign-in, session management)
- Role-to-persona mapping (10 roles)
- Route-level middleware guards
- RLS policy migration from allow-all to role-based
- Profile management (replace demo profile panel with real user data)

---

### Phase 7: AI Agent Integration
**Status**: ⬜ Not Started
**Objective**: Integrate autonomous AI agents for email drafting, financial statement summarization, meeting prep, compliance checks, and campaign optimization.
**Requirements**: REQ-P7-01 through REQ-P7-05

Planned tasks:
- InsForge AI SDK integration
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
