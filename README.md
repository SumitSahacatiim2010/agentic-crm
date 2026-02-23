# Banking CRM – Version 2.5 – Product Development

Enterprise Banking CRM platform built with Next.js 15, TypeScript, Tailwind CSS, and InsForge backend.

## Version History

| Version | Phase | Description |
|---------|-------|-------------|
| 2.0 | P0–P8 | Demo & Validation — 32 DB tables, 35 API routes, 20 pages, full E2E regression |
| **2.5** | **Product Development** | Production hardening, environment separation, scalability |

## Architecture

- ⚡ **Next.js 15** — App Router, Server Components, SSR + Client Hydration
- 🎨 **Tailwind CSS** — Design system with dark mode
- 🔥 **TypeScript** — Full type safety, 0 compilation errors
- 🔒 **InsForge** — PostgreSQL backend with RLS on all 32 tables + 31 FK constraints
- 📊 **3 Views** — compliance_dashboard_metrics, marketing_analytics_daily, onboarding_dashboard_metrics

## Modules

| Module | Route | Phase |
|--------|-------|-------|
| RM Dashboard | `/dashboard` | P0 |
| Customer 360 | `/customer/[id]` | P0 |
| Leads Workspace | `/leads` | P2 |
| Opportunities | `/opportunities` | P2 |
| Service Inbox | `/servicing` | P3 |
| Digital Onboarding | `/onboarding` | P4 |
| Credit Origination | `/credit` | P5 |
| Compliance | `/compliance` | P6 |
| Marketing Campaigns | `/campaigns` | P7 |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
NEXT_PUBLIC_INSFORGE_BASE_URL=https://your-project.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key
```

## Deployment

```bash
npm run build   # 0 errors required
npm run start   # Production server
```

Staging: Deployed via InsForge CI/CD to `https://eig7swuu.insforge.site`
