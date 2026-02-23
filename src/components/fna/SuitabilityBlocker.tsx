"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Lock } from "lucide-react";
import { Product, RiskProfile } from "@/lib/fna-mock-data";
import { toast } from "sonner"; // Assuming sonner is available, or use alert/console

interface SuitabilityBlockerProps {
    product: Product | null;
    clientProfile: RiskProfile;
    isOpen: boolean;
    onClose: () => void;
    onOverride: (justification: string) => void;
}

export function SuitabilityBlocker({ product, clientProfile, isOpen, onClose, onOverride }: SuitabilityBlockerProps) {
    const [justification, setJustification] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!product) return null;

    const handleConfirm = async () => {
        if (justification.length < 20) {
            // Simple validation visualization
            alert("Please provide a detailed justification (min 20 chars) for compliance audit.");
            return;
        }

        setIsSubmitting(true);
        // Simulate API call to log audit trail
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`[AUDIT LOG] Override approved for ${product.name} by RM. Justification: ${justification}`);
        onOverride(justification);
        setIsSubmitting(false);
        onClose();
        setJustification("");
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-slate-950 border-rose-500/50 text-slate-100 max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-rose-500">
                        <Lock className="h-5 w-5" />
                        Unsuitable Product Block
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                        <strong>Regulatory Warning (MiFID II / Reg BI):</strong>
                        <br />
                        You are attempting to recommend a <strong>{product.riskRating} Risk</strong> product ({product.name}) to a <strong>{clientProfile.category}</strong> investor.
                        <br /><br />
                        This action is blocked. To proceed, you must provide a specific overriding justification which will be logged in the centralized compliance audit trail.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-2">
                    <Label htmlFor="justification" className="text-rose-200">Override Justification</Label>
                    <Textarea
                        id="justification"
                        className="bg-slate-900 border-slate-700 focus:border-rose-500 min-h-[100px]"
                        placeholder="I confirm the client understands the risks because..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                    />
                    {justification.length > 0 && justification.length < 20 && (
                        <span className="text-xs text-rose-400">Min 20 characters required.</span>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} className="border-slate-700 hover:bg-slate-800 text-slate-300">Cancel Recommendation</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={justification.length < 20 || isSubmitting}
                        className="bg-rose-600 hover:bg-rose-700 text-white border-none"
                    >
                        {isSubmitting ? "Logging Audit..." : "Confirm Override"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
