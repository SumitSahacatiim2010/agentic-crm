"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner installed

export function CaseClassification() {
    const [isComplaint, setIsComplaint] = useState(false);
    const [severity, setSeverity] = useState("Low");

    const handleSave = () => {
        // Logic to save classification would go here
        toast.success("Case classification updated successfully.");
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-sm font-medium text-slate-100 uppercase tracking-wider">Case Classification ({isComplaint ? 'Complaint' : 'Standard Inquiry'})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">

                <div className="space-y-2">
                    <Label className="text-slate-300">Case Type</Label>
                    <RadioGroup defaultValue="inquiry" onValueChange={(v) => setIsComplaint(v === 'complaint')} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="inquiry" id="inquiry" className="border-slate-500 text-indigo-500" />
                            <Label htmlFor="inquiry" className="text-slate-300">Standard Inquiry</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="complaint" id="complaint" className="border-slate-500 text-indigo-500" />
                            <Label htmlFor="complaint" className="text-slate-300 font-bold">Formal Complaint</Label>
                        </div>
                    </RadioGroup>
                </div>

                {isComplaint && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 border-l-2 border-rose-500 pl-4 py-2 bg-rose-950/10 rounded-r">

                        <div className="flex items-start gap-2 text-rose-400 text-xs mb-2">
                            <AlertCircle className="h-4 w-4 mt-0.5" />
                            <span>Regulatory reporting required (FCA/CFPB). Please ensure accuracy.</span>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300 text-xs">Severity Level</Label>
                            <Select onValueChange={setSeverity} defaultValue="Low">
                                <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low - Resolved FCR</SelectItem>
                                    <SelectItem value="Medium">Medium - Distressed</SelectItem>
                                    <SelectItem value="High">High - Regulatory/Legal Risk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300 text-xs">Root Cause Category</Label>
                            <Select>
                                <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200 h-8">
                                    <SelectValue placeholder="Select root cause..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="product">Product Features / Terms</SelectItem>
                                    <SelectItem value="service">Employee Conduct / Service</SelectItem>
                                    <SelectItem value="system">System Failure / Outage</SelectItem>
                                    <SelectItem value="fraud">Fraud / Unauthorized Activity</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300 text-xs">Customer Sentiment</Label>
                            <Textarea placeholder="Describe customer's emotional state and key grievance..." className="bg-slate-950 border-slate-700 text-slate-200 min-h-[60px]" />
                        </div>

                    </div>
                )}

            </CardContent>
            <CardFooter className="pt-2">
                <Button size="sm" onClick={handleSave} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200">
                    <Save className="h-3 w-3 mr-2" /> Save Classification
                </Button>
            </CardFooter>
        </Card>
    );
}
