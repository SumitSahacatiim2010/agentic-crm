# Project Configuration for Antigravity Workspace Orchestrator
# Banking CRM – Version 2.5 – Product Development

## Global Governor Enforcement

**ACTIVE PROJECT GOVERNOR FILE**: `.cursorrules`

As dictated by the "Banking CRM Phase 2 Strategy Update.pdf":
This project is subject to rigorous top-down architectural enforcement. All AI agents operating within this workspace MUST strictly adhere to the technical stack, execution framework, and compliance requirements defined in `.cursorrules`.

## Operational Modes

1. **PLANNING MODE**
   - **Trigger**: New epic, new feature phase, or complex architectural bug.
   - **Action**: Read strategy documents -> Produce markdown Artifacts (Implementation Plans, Schema Deltas) -> Await human approval.
   - **Constraint**: DO NOT write code logic.

2. **FAST MODE**
   - **Trigger**: Approved Planning Artifacts or isolated/localized bug fixes.
   - **Action**: Execute code changes precisely as detailed in the artifacts.
   - **Constraint**: Only operate within bounds of defined implementation plan.

## Master Constraints
- Framework: Next.js App Router (15+)
- Types: TypeScript
- UI: Tailwind CSS + Shadcn-UI strictly. NO generic CSS or external UI libraries.
- React Rendering: Strict deterministic rendering. No stochastic functions (`Math.random()`, `Date.now()`) outside of `useEffect()`.
- Error Boundaries: All components must fallback gracefully.
- Checklists: Maintain `task.md` checklists rigorously.

Failure to follow these directives is considered a critical deviation from the Tier-1 banking standard.