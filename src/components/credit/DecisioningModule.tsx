"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileWarning, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner"; // Using custom toast if sonner missing, but assume sonner installed now

interface DecisioningModuleProps {
    isPolicyCompliant: boolean;
}

export function DecisioningModule({ isPolicyCompliant }: DecisioningModuleProps) {
    const [decision, setDecision] = useState<string>("");
    const [declineReason, setDeclineReason] = useState<string>("");

    const handleDecisionSubmit = () => {
        if (decision === 'decline' && !declineReason) {
            alert("Please select a Decline Reason Code.");
            return;
        }

        if (decision === 'decline') {
            alert("Generating FCRA Adverse Action Notice...\n\nProcess completed. Document sent to applicant.");
        } else {
            alert("Decision Submitted Successfully. Proceeding to Documentation.");
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 h-full flex flex-col">
            <CardHeader className="bg-slate-950/50 border-b border-slate-800 pb-3">
                <CardTitle className="text-slate-100 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-indigo-400" />
                    Decisioning & Outcomes
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 pt-6">

                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Final Decision</label>
                    <Select onValueChange={setDecision}>
                        <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200">
                            <SelectValue placeholder="Select outcome..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="approve" disabled={!isPolicyCompliant}>Approve Application</SelectItem>
                            <SelectItem value="condition">Approve with Conditions</SelectItem>
                            <SelectItem value="decline">Decline / Adverse Action</SelectItem>
                        </SelectContent>
                    </Select>
                    {!isPolicyCompliant && decision !== 'decline' && (
                        <div className="text-xs text-rose-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Approval blocked by Hard Stop Rules
                        </div>
                    )}
                </div>

                {decision === 'decline' && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 fade-in">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Regulatory Decline Reason</label>
                            <Select onValueChange={setDeclineReason}>
                                <SelectTrigger className="bg-slate-950 border-rose-900/50 text-rose-200 ring-1 ring-rose-900/50">
                                    <SelectValue placeholder="Select reason code..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit_history">Delinquent Credit Obligations</SelectItem>
                                    <SelectItem value="income">Insufficient Income / Cash Flow</SelectItem>
                                    <SelectItem value="collateral">Collateral Value Insufficient</SelectItem>
                                    <SelectItem value="bankruptcy">Public Record / Bankruptcy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            variant="destructive"
                            className="w-full mt-4 bg-rose-900/50 hover:bg-rose-900 border border-rose-800 text-rose-100"
                            onClick={() => alert("FCRA Notice Generated: PDF ready for review.")}
                        >
                            <FileWarning className="h-4 w-4 mr-2" />
                            Generate FCRA Adverse Action Notice
                        </Button>
                    </div>
                )}

                {decision === 'approve' && (
                    <div className="p-3 bg-emerald-900/20 border border-emerald-900/50 rounded text-sm text-emerald-300 animate-in fade-in">
                        Application meets all policy requirements. Ready for Closing.
                    </div>
                )}

            </CardContent>
            <CardFooter className="border-t border-slate-800 pt-4 bg-slate-950/30">
                <Button
                    className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200"
                    disabled={!decision || (decision === 'approve' && !isPolicyCompliant)}
                    onClick={handleDecisionSubmit}
                >
                    Step 14: Submit Final Decision
                </Button>
            </CardFooter>
        </Card>
    );
}
