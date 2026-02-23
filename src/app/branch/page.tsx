import { BranchKPIs } from "@/components/branch/BranchKPIs";
import { BranchLeadQueue } from "@/components/branch/BranchLeadQueue";
import { BranchServiceQueue } from "@/components/branch/BranchServiceQueue";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

export default function BranchManagementPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200">
            <header className="border-b border-slate-800 bg-slate-950 p-6 shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Building2 className="h-6 w-6 text-indigo-400" />
                        Branch Operations Workspace
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Daily metrics, service requests, and walk-in lead conversions</p>
                </div>
                <Link href="/" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-md">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Global Admin
                </Link>
            </header>

            <main className="flex-1 overflow-y-auto w-full">
                <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
                    {/* Top Row KPIs */}
                    <BranchKPIs />

                    {/* Bottom Row Splitting Leads & Service */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                        <BranchLeadQueue />
                        <BranchServiceQueue />
                    </div>
                </div>
            </main>
        </div>
    );
}
