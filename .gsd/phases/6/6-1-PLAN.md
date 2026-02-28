---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: Headless Journey Microservices

## Objective
Extract the core business logic from Next.js API routes (`/api/leads`, `/api/opportunities`, `/api/onboarding`, `/api/credit`) into headless, protocol-agnostic service functions (e.g., `src/services/`) that can be executed independently of HTTP request/response lifecycles.

## Context
- `.gsd/SPEC.md`
- `src/app/api/` (Existing API routes)
- `PHASE4-MANIFEST.md` (for J1, J2, J3 definitions)

## Tasks

<task type="auto">
  <name>Extract Lead & Opportunity Services (J1/J2)</name>
  <files>src/services/lead-service.ts, src/services/opportunity-service.ts</files>
  <action>
    - Create a `src/services` directory if it doesn't exist.
    - Build `lead-service.ts` with typed functions: `ingestLead(data)`, `updateBANT(id, bantData)`, `convertLeadToOpportunity(id)`.
    - Build `opportunity-service.ts` with typed functions: `createOpportunity(data)`, `updateOpportunityStage(id, stage)`.
    - Refactor existing `/api/leads` and `/api/opportunities` routes to call these service functions instead of running raw DB queries directly.
    - Ensure all functions return standardized success/error objects, decoupling them from Next.js `NextResponse`.
  </action>
  <verify>grep -rn "export const ingestLead" src/services/lead-service.ts</verify>
  <done>Lead and Opportunity core logic is abstracted into testable service functions</done>
</task>

<task type="auto">
  <name>Extract Onboarding & Credit Services (J1/J3)</name>
  <files>src/services/onboarding-service.ts, src/services/credit-service.ts</files>
  <action>
    - Build `onboarding-service.ts` with functions: `createOnboardingSession(data)`, `updateOnboardingStep(sessionId, stepData)`, `completeOnboarding(sessionId)`.
    - Build `credit-service.ts` with functions: `submitCreditApplication(data)`, `updateCreditDecision(appId, decision)`.
    - Refactor `/api/onboarding` and `/api/credit` routes to consume these services.
  </action>
  <verify>grep -rn "export const completeOnboarding" src/services/onboarding-service.ts</verify>
  <done>Onboarding and Credit logic is fully abstracted into headless services</done>
</task>

## Success Criteria
- [ ] Business logic for J1, J2, and J3 journeys is decoupled from HTTP handlers
- [ ] Service functions accept strictly typed inputs and return predictable outputs
- [ ] Existing UI still functions correctly using the refactored API routes
