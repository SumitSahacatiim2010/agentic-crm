import { OnboardingState } from "./types";
import { useEffect, useState, useRef } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
    state: OnboardingState;
}

export function Step6Welcome({ state }: Props) {
    const router = useRouter();
    const [status, setStatus] = useState<'creating' | 'success' | 'error'>('creating');
    const [newCustomerId, setNewCustomerId] = useState('');
    const hasCreated = useRef(false);

    useEffect(() => {
        if (hasCreated.current) return;
        hasCreated.current = true;

        const finalizeOnboarding = async () => {
            try {
                // Determine Tier
                const nw = parseInt(state.cdd.netWorth.replace(/[^0-9]/g, '') || '0');
                const inc = parseInt(state.cdd.annualIncome.replace(/[^0-9]/g, '') || '0');
                let tier = 'Standard';
                if (nw > 5000000) tier = 'UHNW';
                else if (nw > 1000000 || inc > 250000) tier = 'HNW';
                else if (nw > 250000 || inc > 100000) tier = 'Premium';

                // 1. Create Customer Party
                const partyRes = await fetch('/api/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_type: 'individual',
                        full_legal_name: `${state.identity.firstName} ${state.identity.lastName}`,
                        nationality: state.identity.nationality,
                        segment_tier: tier,
                        email: `${state.identity.firstName.toLowerCase()}.${state.identity.lastName.toLowerCase()}@example.com`
                    })
                });

                if (!partyRes.ok) throw new Error('Party creation failed');
                const partyData = await partyRes.json();
                const custId = partyData.party_id;
                setNewCustomerId(custId);

                // 2. Attach Products
                await fetch('/api/customer-products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id: custId,
                        products: state.products.selected
                    })
                });

                // 3. Create KYC Record
                await fetch('/api/compliance/kyc-records', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id: custId,
                        status: 'Verified',
                        documents: [state.identity.idType]
                    })
                });

                console.log(`[EVENT] customer.onboarded payload: ${JSON.stringify({ customerId: custId, tier, products: state.products.selected })}`);
                setStatus('success');

            } catch (err) {
                console.error("Failed to onboard", err);
                setStatus('error');
            }
        };

        finalizeOnboarding();
    }, [state]);

    if (status === 'creating') {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                <h2 className="text-xl font-medium text-slate-200">Finalizing Onboarding</h2>
                <div className="text-slate-400">Provisioning accounts and generating profiles...</div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="text-red-500 font-bold text-xl">Onboarding Failed</div>
                <div className="text-slate-400">An error occurred while creating the customer profile.</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-20 w-20 text-emerald-500" />

            <div className="space-y-2">
                <h2 className="text-3xl font-light text-white">Onboarding Complete</h2>
                <p className="text-slate-400">The customer profile has been successfully created and accounts provisioned.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg w-full max-w-md space-y-4 text-left">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500 text-sm">Customer Name</span>
                    <span className="text-slate-200 font-medium">{state.identity.firstName} {state.identity.lastName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500 text-sm">Customer ID</span>
                    <span className="text-indigo-400 font-mono text-sm">{newCustomerId || 'Generating...'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500 text-sm">Products Provisioned</span>
                    <span className="text-slate-200 font-medium">{state.products.selected.length} items</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Status</span>
                    <span className="text-emerald-400 text-sm px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">Active</span>
                </div>
            </div>

            <div className="space-y-4 pt-4 w-full max-w-md">
                <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => router.push(`/customer/${newCustomerId}`)}
                    disabled={!newCustomerId}
                >
                    View Customer 360 Profile
                </Button>
                <Button
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                    onClick={() => router.push('/opportunities')}
                >
                    Return to Dashboard
                </Button>
            </div>
        </div>
    );
}
