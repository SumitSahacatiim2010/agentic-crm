"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TaxResidencyFormProps {
    onComplete: (data: any) => void;
    onBack?: () => void;
}

export function TaxResidencyForm({ onComplete, onBack }: TaxResidencyFormProps) {
    const [isUSPerson, setIsUSPerson] = useState<string>("");
    const [tin, setTin] = useState("");

    // CRS Logic
    const [taxCountry, setTaxCountry] = useState("");
    const [crsStatus, setCrsStatus] = useState("active_nfe");

    const handleSubmit = () => {
        onComplete({
            isUSPerson: isUSPerson === 'yes',
            tin,
            taxCountry: isUSPerson === 'no' ? taxCountry : 'USA',
            crsStatus: isUSPerson === 'no' ? crsStatus : 'N/A'
        });
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-white">Tax Residency & Compliance</h3>
                <p className="text-sm text-slate-400">FATCA & CRS Self-Certification</p>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 space-y-8">

                    {/* US Person Check */}
                    <div className="space-y-4">
                        <Label className="text-base text-slate-200">Are you a US Citizen or Tax Resident?</Label>
                        <RadioGroup value={isUSPerson} onValueChange={setIsUSPerson} className="flex gap-6">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="us-yes" />
                                <Label htmlFor="us-yes" className="text-slate-300">Yes (Form W-9)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="us-no" />
                                <Label htmlFor="us-no" className="text-slate-300">No (Form W-8BEN)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Conditional: US Person -> W-9 Fields */}
                    {isUSPerson === 'yes' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 bg-slate-950 p-4 rounded border border-slate-800">
                            <h4 className="font-semibold text-slate-300">US Taxpayer Information</h4>
                            <div className="space-y-2">
                                <Label>Social Security Number (SSN) or ITIN</Label>
                                <Input
                                    className="bg-slate-900 border-slate-700 font-mono"
                                    placeholder="XXX-XX-XXXX"
                                    value={tin}
                                    onChange={(e) => setTin(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Conditional: Non-US -> CRS Fields */}
                    {isUSPerson === 'no' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 bg-slate-950 p-4 rounded border border-slate-800">
                            <h4 className="font-semibold text-slate-300">CRS (Common Reporting Standard) Classification</h4>

                            <div className="space-y-2">
                                <Label>Country of Tax Residence</Label>
                                <select
                                    value={taxCountry}
                                    onChange={(e) => setTaxCountry(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none"
                                >
                                    <option value="">Select Country...</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="DE">Germany</option>
                                    <option value="FR">France</option>
                                    <option value="SG">Singapore</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <Label>Entity Classification (if applicable)</Label>
                                <RadioGroup value={crsStatus} onValueChange={setCrsStatus}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="active_nfe" id="active" />
                                        <Label htmlFor="active" className="text-slate-300">Active NFE (Non-Financial Entity)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="passive_nfe" id="passive" />
                                        <Label htmlFor="passive" className="text-slate-300">Passive NFE</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="fi" id="fi" />
                                        <Label htmlFor="fi" className="text-slate-300">Financial Institution</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label>Foreign Tax ID (TIN) for {taxCountry || 'Selected Country'}</Label>
                                <Input
                                    className="bg-slate-900 border-slate-700 font-mono"
                                    placeholder="Tax ID Number"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        {onBack && (
                            <Button variant="outline" onClick={onBack} className="w-1/3 border-slate-700 hover:bg-slate-800 text-slate-300">
                                Back
                            </Button>
                        )}
                        <Button
                            onClick={handleSubmit}
                            disabled={!isUSPerson}
                            className={`${onBack ? 'w-2/3' : 'w-full'} bg-blue-600 hover:bg-blue-700 text-white`}
                        >
                            Confirm & Continue
                        </Button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
