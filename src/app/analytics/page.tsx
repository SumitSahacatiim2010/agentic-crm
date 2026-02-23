import { AnalyticsDashboardClient } from "@/components/analytics/AnalyticsDashboardClient";
import Link from "next/link";
import { ArrowLeft, BarChart4 } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
            <header className="border-b border-slate-800 bg-slate-950 p-6 shrink-0 flex items-center justify-between z-10">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BarChart4 className="h-6 w-6 text-indigo-400" />
                        Executive Analytics
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Cross-domain performance and operational KPIs</p>
                </div>
                <Link href="/" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-md">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
            </header>

            <main className="flex-1 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto p-6 lg:p-8">
                    <AnalyticsDashboardClient />
                </div>
            </main>
        </div>
    );
}
