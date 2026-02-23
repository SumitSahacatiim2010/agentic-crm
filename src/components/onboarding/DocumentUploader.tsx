"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, ScanLine, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface DocumentUploaderProps {
    onComplete: (data: any) => void;
}

export function DocumentUploader({ onComplete }: DocumentUploaderProps) {
    const [status, setStatus] = useState<'idle' | 'uploading' | 'scanning' | 'verified'>('idle');
    const [progress, setProgress] = useState(0);
    const [scannedData, setScannedData] = useState<any>(null);

    const handleUpload = () => {
        setStatus('uploading');
        // Simulate upload
        let p = 0;
        const interval = setInterval(() => {
            p += 10;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setStatus('scanning');
                startScanning();
            }
        }, 200);
    };

    const startScanning = () => {
        // Simulate OCR
        setTimeout(() => {
            setScannedData({
                firstName: "Alexander",
                lastName: "Sterling",
                docNumber: "A12345678",
                dob: "1985-04-12",
                expiry: "2030-01-01",
                mrz: "P<USASTERLING<<ALEXANDER<<<<<<<<<<<<<<<<<<<<<A12345678<8USA8504128M3001015<<<<<<<<<<<<<<02"
            });
            setStatus('verified');
            toast.success('Document uploaded and verified successfully', { description: 'Identity data has been extracted and validated.' });
            onComplete(true);
        }, 2500);
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-white">Identity Verification</h3>
                <p className="text-sm text-slate-400">Upload a valid Government ID (Passport or Driver's License)</p>
            </div>

            <Card className={`border-2 border-dashed transition-all duration-300 ${status === 'idle' ? 'border-slate-700 bg-slate-900/50 hover:bg-slate-900' :
                status === 'verified' ? 'border-emerald-500/50 bg-emerald-500/5' :
                    'border-blue-500/50 bg-slate-900'
                }`}>
                <CardContent className="flex flex-col items-center justify-center p-12 min-h-[300px]">

                    {status === 'idle' && (
                        <div className="text-center space-y-4">
                            <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Upload className="h-8 w-8 text-slate-400" />
                            </div>
                            <Button onClick={handleUpload} variant="outline" className="border-slate-600 hover:bg-slate-800">
                                Select Document
                            </Button>
                            <p className="text-xs text-slate-500">Supports JPG, PNG, PDF (Max 5MB)</p>
                        </div>
                    )}

                    {status === 'uploading' && (
                        <div className="w-full max-w-xs space-y-4 text-center">
                            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-300">Uploading...</p>
                                <Progress value={progress} className="h-2 bg-slate-800" />
                            </div>
                        </div>
                    )}

                    {status === 'scanning' && (
                        <div className="w-full max-w-md relative overflow-hidden rounded-lg bg-slate-950 border border-slate-800 p-8 text-center space-y-6">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                            <ScanLine className="h-12 w-12 text-blue-400 mx-auto" />
                            <div className="space-y-2">
                                <h4 className="font-medium text-blue-400">Authenticating Document...</h4>
                                <div className="text-xs text-slate-500 space-y-1">
                                    <p>Extracting MRZ Data...</p>
                                    <p>Verifying Holograms...</p>
                                    <p>Matching Face Geometry...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'verified' && scannedData && (
                        <div className="w-full text-left space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex items-center gap-3 text-emerald-400 justify-center">
                                <CheckCircle2 className="h-8 w-8" />
                                <span className="text-lg font-semibold">Verification Successful</span>
                            </div>

                            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 space-y-3">
                                <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider mb-2">
                                    <FileText className="h-3 w-3" /> Extracted Data
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500 block text-xs">Full Name</span>
                                        <span className="text-slate-200 font-medium">{scannedData.firstName} {scannedData.lastName}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-xs">Document No.</span>
                                        <span className="text-slate-200 font-medium">{scannedData.docNumber}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-500 block text-xs">MRZ String</span>
                                        <code className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded block mt-1 break-all">
                                            {scannedData.mrz}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
