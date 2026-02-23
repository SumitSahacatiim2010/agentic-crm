"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export function ProposalGenerator() {
    const [generating, setGenerating] = useState(false);
    const [downloadReady, setDownloadReady] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        // Simulate generation delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setGenerating(false);
        setDownloadReady(true);
        toast.success("Investment Proposal Created Successfully.");
    };

    const handleDownload = () => {
        toast.info("Downloading PDF", { description: "Robert_Fox_Investment_Proposal_v3.pdf" });
        setDownloadReady(false); // Reset
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-400" />
                    Investment Proposal
                </CardTitle>
                <CardDescription>Compile IPS, Suitability Logs, and recommended allocation.</CardDescription>
            </CardHeader>
            <CardContent>
                {downloadReady ? (
                    <Button
                        onClick={handleDownload}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white animate-in zoom-in"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF Proposal
                    </Button>
                ) : (
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                        {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                        Generate New Proposal
                    </Button>
                )}
                <p className="text-xs text-slate-500 mt-4 text-center">
                    Last generated 14 days ago by Sarah Connor
                </p>
            </CardContent>
        </Card>
    );
}
