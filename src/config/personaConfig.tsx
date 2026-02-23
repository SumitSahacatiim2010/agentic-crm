import React from "react";
import {
    Briefcase,
    Building2,
    PieChart,
    Store,
    Headset,
    CreditCard,
    Megaphone,
    ShieldAlert,
    TrendingUp,
    Globe
} from "lucide-react";

export type PersonaId =
    | "RETAIL_RM"
    | "CORPORATE_RM"
    | "WEALTH_ADVISOR"
    | "BRANCH_MANAGER"
    | "SERVICE_AGENT"
    | "CREDIT_OFFICER"
    | "MARKETING_MANAGER"
    | "COMPLIANCE_OFFICER"
    | "EXECUTIVE"
    | "GLOBAL_ADMIN";

export interface WidgetDefinition {
    id: string;
    title: string;
    description?: string;
    componentName: string; // Map to a registry of components
    layout?: { colSpan?: number; rowSpan?: number };
}

export interface PersonaDefinition {
    id: PersonaId;
    label: string;
    shortLabel: string;
    description: string;
    icon: React.ReactNode;
    widgets: WidgetDefinition[];
}

export const PERSONA_CONFIG: Record<PersonaId, PersonaDefinition> = {
    RETAIL_RM: {
        id: "RETAIL_RM",
        label: "Retail Relationship Manager",
        shortLabel: "Retail RM",
        description: "Manage personal banking clients, cross-sell products, and drive portfolio growth.",
        icon: <Briefcase className="w-4 h-4" />,
        widgets: [
            { id: "my-portfolio", title: "My Portfolio", componentName: "RealPerformanceScorecard", layout: { colSpan: 2 } },
            { id: "nba", title: "Next Best Action", componentName: "RealNextBestActionWidget", layout: { colSpan: 1 } },
            { id: "opp-funnel", title: "Opportunity Funnel", componentName: "RealPipelineFunnel", layout: { colSpan: 2 } },
            { id: "clients", title: "My Top Clients", componentName: "RealCustomerList", layout: { colSpan: 2 } },
            { id: "alerts", title: "Task Queue", componentName: "RealAlertsQueue", layout: { colSpan: 1 } }
        ]
    },
    CORPORATE_RM: {
        id: "CORPORATE_RM",
        label: "Corporate Banking RM",
        shortLabel: "Corp RM",
        description: "Manage enterprise relationships, credit facilities, and treasury services.",
        icon: <Building2 className="w-4 h-4" />,
        widgets: [
            { id: "key-accounts", title: "Territory Analytics", componentName: "RealTerritoryAnalytics", layout: { colSpan: 3 } },
            { id: "credit-opps", title: "Corporate Pipeline", componentName: "RealPipelineFunnel", layout: { colSpan: 2 } },
            { id: "early-warning", title: "Alerts Queue", componentName: "RealAlertsQueue", layout: { colSpan: 1 } }
        ]
    },
    WEALTH_ADVISOR: {
        id: "WEALTH_ADVISOR",
        label: "Wealth Advisor",
        shortLabel: "Wealth",
        description: "Advisory for HNW/UHNW clients, portfolio management, and financial planning.",
        icon: <PieChart className="w-4 h-4" />,
        widgets: [
            { id: "drift-alert", title: "Portfolio Drift Alerts", componentName: "RealDriftAlert", layout: { colSpan: 3 } },
            { id: "portfolio-table", title: "Portfolio Valuation", componentName: "RealPortfolioTable", layout: { colSpan: 2, rowSpan: 2 } },
            { id: "performance", title: "Performance Chart", componentName: "RealPerformanceChart", layout: { colSpan: 1 } },
            { id: "proposals", title: "Proposal Generator", componentName: "RealProposalGenerator", layout: { colSpan: 1 } }
        ]
    },
    BRANCH_MANAGER: {
        id: "BRANCH_MANAGER",
        label: "Branch Manager",
        shortLabel: "Branch",
        description: "Oversee branch operations, team performance, and local market sales.",
        icon: <Store className="w-4 h-4" />,
        widgets: [
            { id: "branch-kpis", title: "Branch KPIs", componentName: "BranchKpisCard", layout: { colSpan: 1 } },
            { id: "leads-table", title: "Lead & App Routing", componentName: "RealLeadTable", layout: { colSpan: 2, rowSpan: 2 } },
            { id: "todays-traffic", title: "Today's Traffic", componentName: "TrafficCard", layout: { colSpan: 1 } },
            { id: "branch-compliance", title: "Branch Compliance", componentName: "BranchComplianceCard", layout: { colSpan: 1 } }
        ]
    },
    SERVICE_AGENT: {
        id: "SERVICE_AGENT",
        label: "Service Agent",
        shortLabel: "Service",
        description: "Handle inbound inquiries, resolve cases, and provide omnichannel support.",
        icon: <Headset className="w-4 h-4" />,
        widgets: [
            { id: "service-inbox", title: "Unified Service Inbox", componentName: "RealServiceInbox", layout: { colSpan: 2, rowSpan: 2 } },
            { id: "customer-context", title: "Customer Context", componentName: "RealServiceCustomerContext", layout: { colSpan: 1 } },
            { id: "interaction-timeline", title: "Interaction Timeline", componentName: "RealInteractionTimeline", layout: { colSpan: 1 } }
        ]
    },
    CREDIT_OFFICER: {
        id: "CREDIT_OFFICER",
        label: "Credit Officer",
        shortLabel: "Credit",
        description: "Underwrite loans, manage counterparty risk, and approve credit exceptions.",
        icon: <CreditCard className="w-4 h-4" />,
        widgets: [
            { id: "work-queue", title: "Applications Queue", componentName: "RealLeadTable", layout: { colSpan: 2, rowSpan: 2 } },
            { id: "financial-donut", title: "Applicant Financials", componentName: "RealFinancialProfileDonut", layout: { colSpan: 1 } },
            { id: "exceptions", title: "Exceptions", componentName: "ExceptionsCard", layout: { colSpan: 1 } }
        ]
    },
    MARKETING_MANAGER: {
        id: "MARKETING_MANAGER",
        label: "Marketing Manager",
        shortLabel: "Marketing",
        description: "Design campaigns, analyze segment performance, and manage customer journeys.",
        icon: <Megaphone className="w-4 h-4" />,
        widgets: [
            { id: "active-campaigns", title: "Active Campaigns", componentName: "CampaignsCard", layout: { colSpan: 2 } },
            { id: "segment-perf", title: "Segment Performance", componentName: "SegmentPerfCard", layout: { colSpan: 1 } },
            { id: "journey-health", title: "Journey Health", componentName: "JourneyHealthCard", layout: { colSpan: 1 } },
            { id: "fatigue-optout", title: "Fatigue & Opt-outs", componentName: "FatigueCard", layout: { colSpan: 1 } }
        ]
    },
    COMPLIANCE_OFFICER: {
        id: "COMPLIANCE_OFFICER",
        label: "Compliance Officer",
        shortLabel: "Compliance",
        description: "Monitor AML alerts, review KYC status, and handle regulatory reporting.",
        icon: <ShieldAlert className="w-4 h-4" />,
        widgets: [
            { id: "kyc-status", title: "KYC / CDD Status", componentName: "KycStatusCard", layout: { colSpan: 2 } },
            { id: "compliance-details", title: "Customer Compliance Profile", componentName: "RealComplianceCard", layout: { colSpan: 1 } },
            { id: "monitoring-flags", title: "Monitoring Flags", componentName: "MonitoringCard", layout: { colSpan: 2 } },
            { id: "aml-alerts", title: "AML Alerts", componentName: "AmlAlertsCard", layout: { colSpan: 1 } }
        ]
    },
    EXECUTIVE: {
        id: "EXECUTIVE",
        label: "Executive Management",
        shortLabel: "Executive",
        description: "High-level overview of bank performance, risk, and customer experience.",
        icon: <TrendingUp className="w-4 h-4" />,
        widgets: [
            { id: "exec-kpis", title: "Executive KPIs", componentName: "ExecKpisCard", layout: { colSpan: 3 } },
            { id: "sales-pipe", title: "Global Sales Pipeline", componentName: "RealPipelineFunnel", layout: { colSpan: 2 } },
            { id: "territory-risk", title: "Territory Exposure", componentName: "RealTerritoryAnalytics", layout: { colSpan: 1 } },
            { id: "cx-metrics", title: "Customer Experience", componentName: "CxMetricsCard", layout: { colSpan: 3 } }
        ]
    },
    GLOBAL_ADMIN: {
        id: "GLOBAL_ADMIN",
        label: "Global Administrator",
        shortLabel: "Global",
        description: "Manage system configurations, roles, and global operational health.",
        icon: <Globe className="w-4 h-4" />,
        widgets: [
            { id: "customer-directory", title: "Customer Directory", componentName: "RealCustomerList", layout: { colSpan: 3 } },
            { id: "adoption", title: "Adoption & Usage", componentName: "AdoptionCard", layout: { colSpan: 1 } },
            { id: "rbac-matrix", title: "RBAC / Roles Matrix", componentName: "RbacMatrixCard", layout: { colSpan: 1 } },
            { id: "system-health", title: "Audit & System Health", componentName: "SystemHealthCard", layout: { colSpan: 1 } }
        ]
    }
};
