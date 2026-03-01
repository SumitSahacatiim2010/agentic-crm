# TODO.md — Deferred Items

## Phase 5 Prep
- [ ] Run `next build` and fix all compilation errors/warnings
- [ ] Add global error boundary component
- [ ] Add 404 and 500 error pages
- [ ] Add loading.tsx skeletons for all async routes
- [ ] SEO meta tags on all 22 routes
- [ ] WCAG 2.1 AA accessibility audit

## Phase 6 Prep (Headless Microservices & MCP Tools)
- [ ] Inventory all atomic operations across J1/J2/J3 journey steps
- [ ] Design MCP tool schema (typed inputs/outputs for each operation)
- [ ] Identify which existing API routes can be wrapped vs. need new services
- [ ] Research InsForge Edge Functions for microservice hosting

## Technical Debt
- [ ] Remove debug routes (`/debug-customer`, `/p1-validation`, `/test-static`)
- [ ] Consolidate duplicate mock data files
- [ ] Add TypeScript strict mode
- [ ] Reduce bundle size (analyze with `@next/bundle-analyzer`)

## Nice-to-Have
- [ ] Dark/light theme toggle
- [ ] Mobile-responsive improvements
- [ ] Keyboard shortcuts for power users
- [ ] Print-friendly views for compliance reports
