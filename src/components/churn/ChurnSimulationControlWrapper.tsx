
"use client";

import { useState } from "react";
import { ChurnSimulationControl } from "./ChurnSimulationControl";
import { ChurnRetentionModal } from "./ChurnRetentionModal";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function ChurnSimulationControlWrapper() {
    const [showChurnModal, setShowChurnModal] = useState(false);

    const handleTriggerChurn = () => {
        toast.error("Critical Alert: Churn risk verified for automated trigger", {
            duration: 5000,
            action: {
                label: "Review",
                onClick: () => setShowChurnModal(true)
            }
        });
    };

    const handleDeployRetention = () => {
        setShowChurnModal(false);
        toast.success("Retention Strategy Deployed", {
            description: "Offer sent to client & Task logged in CRM.",
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        });
    };

    return (
        <>
            <ChurnSimulationControl onTriggerChurn={handleTriggerChurn} />
            <ChurnRetentionModal
                isOpen={showChurnModal}
                onClose={() => setShowChurnModal(false)}
                onDeploy={handleDeployRetention}
            />
        </>
    );
}
