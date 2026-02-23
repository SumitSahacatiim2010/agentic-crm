"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TrendingDown, AlertTriangle, Zap, Mail, Phone, CheckCircle2 } from "lucide-react";
import { CHURN_RISK_METRICS, RETENTION_OFFER, PRE_DRAFTED_EMAIL } from "@/lib/churn-mock-data";
import { useState } from "react";

interface ChurnRetentionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeploy: () => void;
}

export function ChurnRetentionModal({ isOpen, onClose, onDeploy }: ChurnRetentionModalProps) {
    const [emailBody, setEmailBody] = useState(PRE_DRAFTED_EMAIL.body);
    const [deploying, setDeploying] = useState(false);

    const handleDeploy = () => {
        setDeploying(true);
        setTimeout(() => {
            setDeploying(false);
            onDeploy();
        }, 1500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">High Attrition Risk Detected</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Sterling Corp • AI Confidence: {CHURN_RISK_METRICS.probability}%
                            </DialogDescription>
                        </div>
                        <Badge className="ml-auto bg-red-500 text-white hover:bg-red-600">CRITICAL</Badge>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 my-4">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Revenue at Risk</div>
                        <div className="text-lg font-bold text-slate-200 mt-1">
                            ${(CHURN_RISK_METRICS.projectedLoss / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-500">/ yr</span>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-center col-span-2 flex items-center justify-around">
                        {CHURN_RISK_METRICS.primaryDrivers.map((driver, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-red-300 bg-red-950/30 px-2 py-1 rounded">
                                <TrendingDown className="h-3 w-3" /> {driver}
                            </div>
                        ))}
                    </div>
                </div>

                <Tabs defaultValue="strategy" className="w-full">
                    <TabsList className="bg-slate-900 w-full justify-start border-b border-slate-800 rounded-none p-0 h-10">
                        <TabsTrigger value="strategy" className="px-6 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 rounded-none">
                            AI Retention Strategy
                        </TabsTrigger>
                        <TabsTrigger value="action" className="px-6 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 rounded-none">
                            Preview Communications
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="strategy" className="space-y-4 pt-4">
                        <Alert className="bg-blue-500/10 border-blue-500/30 text-blue-300">
                            <Zap className="h-4 w-4 text-blue-400" />
                            <AlertTitle>Recommended Intervention</AlertTitle>
                            <AlertDescription className="text-xs opacity-90 leading-relaxed mt-1">
                                The model suggests an immediate pricing intervention. The client's recent large transfer indicates rate shopping.
                                Deploying <strong>{RETENTION_OFFER.title}</strong> has a <strong>64%</strong> probability of retaining the account.
                            </AlertDescription>
                        </Alert>

                        <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/50">
                            <h4 className="text-sm font-medium text-slate-200 mb-2">Pre-Approved Offer Details</h4>
                            <div className="flex justify-between items-start text-sm">
                                <div>
                                    <div className="font-semibold text-emerald-400">{RETENTION_OFFER.title}</div>
                                    <div className="text-slate-400 text-xs mt-1">{RETENTION_OFFER.description}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-slate-200 font-mono">{RETENTION_OFFER.value}</div>
                                    <div className="text-[10px] text-slate-500">Exp: {RETENTION_OFFER.validUntil}</div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="action" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs text-slate-400">
                                <span>Subject: {PRE_DRAFTED_EMAIL.subject}</span>
                                <Badge variant="outline">Generated by Cortex AI</Badge>
                            </div>
                            <Textarea
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                className="h-48 bg-slate-100 text-slate-900 border-none font-sans text-sm resize-none" // Light mode for "Email Preview" feel
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="gap-2 sm:justify-between mt-4 border-t border-slate-800 pt-4">
                    <Button variant="ghost" onClick={onClose} className="text-slate-500 hover:text-slate-300">
                        Dismiss
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-slate-700">
                            <Phone className="h-4 w-4 mr-2" /> Log Call
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
                            onClick={handleDeploy}
                            disabled={deploying}
                        >
                            {deploying ? (
                                <>Sending...</>
                            ) : (
                                <><Mail className="h-4 w-4 mr-2" /> Deploy Offer</>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
