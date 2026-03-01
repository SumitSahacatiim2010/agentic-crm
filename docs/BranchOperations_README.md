# Branch Operations Workspace (Epic: Phase 14)

## Overview
The Branch Operations Workspace (`/branch`) replaces the static metrics dashboard with a dynamic, operational workspace for Branch personnel. 
Designed using the GSD framework, this workspace unifies Lead Management, Service Escalations, and Task Coordination into a single UI, while maintaining deep context via the Customer 360 panel.

## Features & Roles
- **Routing by Persona:** 
  - Tellers/RMs default to `my_work` queue. 
  - Managers see a dedicated `manager_dashboard` overseeing queue health and staff workload.
- **Unified Workqueue:** One feed for Leads, Service Cases, and Activities.
- **Center Panel Validations:** Contextual forms based on entity type: 
  - **Leads:** BANT validation toggles and product-specific discovery sections.
  - **Cases:** SLA metrics, Case Timeline, and Omnichannel log link.
  - **Tasks:** Explicit instructions and actionable completions.
- **Customer 360 Context:** A right-hand collapsible panel aggregates the parsed customer's Holdings, Risk (KYC), and Recent Interactions in real-time.

## Component Hierarchy
`BranchWorkspaceClient.tsx` (Orchestrator - 3-Panel Layout & Manager Dashboard)
┣ `BranchQueuePanel.tsx` (Left: Consolidated Work Items list)
┣ `BranchDetailPanel.tsx` (Center: Entity-specific interactive forms)
┣ `BranchCustomer360Panel.tsx` (Right: Contextual profile integration)
┣ `BranchManagerDashboard.tsx` (Fullscreen: Overview KPIs and Workload table)
┗ `BranchLeadWizard.tsx` (Modal: Walk-In Wizard capturing Prospect -> Product -> BANT)

## API endpoints created
- `GET /api/branches/[branchId]/workqueue`: Consolidates `leads`, `service_cases`, and `activities` sorted by urgency/SLA.
- `GET /api/branches/[branchId]/staff`: Retrieves staff assigned to the branch.
- `GET /api/customers/[id]/summary`: Parallel aggregation of `individual_parties`, `customer_products`, `account_balances`, `kyc_records`, and `interactions`.

## Data Model Foundations
Added tables via `024_branch_ops_workspace.sql`:
- `branches`: Physical locations/hubs.
- `staff_users`: System users mapped to branches with specific roles.
- `activity_logs`: Task recording mechanism mapped against any entity.
Altered:
- `leads`: Extended with `owner_id`, `branch_id`, and `sla_due_at`.
- `service_cases`: Added `owner_id`, `branch_id`, `omnichannel_conversation_id`, `sla_due_at`.

## Next Steps / Future Enhancements
- Hook up "Bulk Assign" from the Manager Dashboard to a visual drag-and-drop surface.
- Integrate the Task "Add Note" button to directly append to `activity_logs`.
- Build the "Convert to Opportunity" full flow connecting to the Sales Pipeline module.
