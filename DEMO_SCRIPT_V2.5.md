# BankingCRM 2.5 - Product Demo Script (Demo Readiness Run)
Target Duration: 12-15 Minutes
Audience: Executive & Product Stakeholders
Goal: Showcase cross-functional CRM workflows, deterministic logic, and AI Insights.

## 1. Onboarding (2 mins)
- **Goal:** Show seamless digital onboarding with validation.
- **Action:** Open Persona Switcher -> Global Admin. Click "Onboard New Customer".
- **Narrative:** "Our digital onboarding captures identity, KYC, and product selection in one flow."
- **Steps:**
  1. Fill in basic identity (Name, DOB via keyboard, valid SSN).
  2. Proceed to KYC (Upload valid document, mock verification).
  3. Product Selection (Select Checking & Credit Card).
  4. Final Review & Welcome. "We now have a real customer record ready to build a relationship."

## 2. Lead to Deal Conversion (3 mins)
- **Goal:** Transform a suspect into a qualified opportunity.
- **Action:** Switch Persona -> Retail RM. Navigate to Branch Ops / Leads workspace.
- **Narrative:** "Leads flow in automatically. The RM manages qualification via BANT checks."
- **Steps:**
  1. Select an "Inbound Web" lead (e.g., Lead: John Smith).
  2. Check BANT criteria (Budget, Authority, Need, Timeline). Observe interactive state.
  3. Click "Convert to Opportunity".
  4. Navigate to Global Pipeline / Opportunities (Kanban). See deal mapped at "Prospecting" stage.

## 3. Service Case & SLA Workflow (2 mins)
- **Goal:** Service efficiency and integrated communication.
- **Action:** Switch Persona -> Service Agent. Open Service Inbox.
- **Narrative:** "Customer service cases are centralized, SLA-bound, and context-rich."
- **Steps:**
  1. Select an "Issue with account" case. Notice diverse subject variations.
  2. Click "Start SLA Timer". Observe timeline audit update + status changes to "In Progress".
  3. Briefly open the integrated Knowledge Base side panel to search for resolution article.
  4. Add notes and click "Resolve". Show success toast.

## 4. Compliance Drilldown (2 mins)
- **Goal:** Demonstrate enterprise risk management capabilities.
- **Action:** Switch Persona -> Compliance Officer. Open Dashboard.
- **Narrative:** "Compliance is embedded, resolving NaN/undefined issues from earlier releases. Real data drives these KPIs."
- **Steps:**
  1. Review AML Alert volume on the Dashboard.
  2. Click on a "Sanctions Hit" or "PEP Match" to drill down into the drawer view.
  3. Show the detailed entity profile (no placeholder gaps). "Sanctions issues can be reviewed inline and investigated immediately."

## 5. Credit Application Intake & Decisioning (2 mins)
- **Goal:** Automated origination workflows.
- **Action:** Switch Persona -> Credit Officer. Navigate to Credit Origination.
- **Narrative:** "We streamline lending with integrated bureau data and policy checks."
- **Steps:**
  1. Click "New Credit Application" -> Submit an Auto/Personal Loan.
  2. Show persistence: The application populates in the "Pending Triage" queue.
  3. Open decision flow: Show mocked policy execution, spreading data, and decisioning form. "Full lifecycle from intake to booked."

## 6. Marketing Journey Activation (2 mins)
- **Goal:** Self-serve marketing automation.
- **Action:** Switch Persona -> Marketing Manager. Navigate to Journey Builder.
- **Narrative:** "Campaigns go out using drag-and-drop node logic."
- **Steps:**
  1. Open the Journey Builder Canvas. Point out the extended Toolbox.
  2. Drag an "Audience Trigger" -> "Logic Split" -> "Email Action".
  3. Click Save (Show confirmation). Click Activate.
  4. Show funnel visualization on the Campaign dashboard turning green/active.

## 7. Wealth Proposal & AI Insights (2 mins)
- **Goal:** Show advisory-grade interactions.
- **Action:** Switch Persona -> Wealth Advisor.
- **Narrative:** "Finally, deep relationship insight."
- **Steps:**
  1. Show Executive KPI integrity on the Global Dashboard (showing Total Revenue $X.XM, with positive YoY calculation).
  2. Navigate to a Customer 360 view (e.g. UHNW client).
  3. Show AI Insights (Next Best Action Widget). Highlight that it computes propensity scores deterministically (fixing the empty state bug).
  4. Navigate to Wealth Workspace. Click "Generate Proposal" on a portfolio, show the confirmation toast, and the resulting structured proposal generation.

**End Demo** 
State achievement: 38 bugs squashed, 6 full E2E workflows, ready for scale.
