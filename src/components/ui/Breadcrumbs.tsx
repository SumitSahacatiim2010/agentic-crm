"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
    dashboard: "RM Dashboard",
    leads: "Leads",
    opportunities: "Opportunities",
    customer: "Customer Directory",
    servicing: "Service Inbox",
    onboarding: "Onboarding",
    credit: "Credit Engine",
    compliance: "Compliance",
    campaigns: "Campaigns",
    wealth: "Wealth Portfolio",
    branch: "Branch Ops",
    analytics: "Analytics",
    knowledge: "Knowledge Base",
    marketing: "Marketing",
    fna: "Needs Assessment",
    portfolio: "Portfolio",
    quotes: "Quotations",
    service: "Service",
};

export function Breadcrumbs() {
    const pathname = usePathname();

    if (!pathname || pathname === "/") return null;

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 px-6 pt-4 pb-0">
            <Link href="/" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                <Home className="h-3 w-3" />
                <span>Home</span>
            </Link>
            {segments.map((segment, index) => {
                const href = "/" + segments.slice(0, index + 1).join("/");
                const isLast = index === segments.length - 1;
                const label = ROUTE_LABELS[segment] || segment.replace(/-/g, " ");

                return (
                    <span key={href} className="flex items-center gap-1.5">
                        <ChevronRight className="h-3 w-3 text-slate-700" />
                        {isLast ? (
                            <span className="text-slate-300 font-medium capitalize">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-indigo-400 transition-colors capitalize">
                                {label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
