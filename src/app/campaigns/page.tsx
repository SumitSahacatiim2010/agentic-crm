"use client";

import { JourneyBuilder } from "@/components/marketing/JourneyBuilder";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
    return (
        <div className="min-h-screen bg-slate-950 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                <Link href="/marketing" className="p-2 hover:bg-slate-900 rounded border border-slate-800 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-100">Journey Designer</h1>
                    <p className="text-xs text-slate-500">Drag and drop triggers, logic, and actions to orchestrate campaigns.</p>
                </div>
            </div>

            <div className="flex-1">
                <JourneyBuilder />
            </div>
        </div>
    );
}
