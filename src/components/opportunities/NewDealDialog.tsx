import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface NewDealDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewDealDialog({ open, onOpenChange }: NewDealDialogProps) {
    const { mutate } = useSWRConfig();
    const [saving, setSaving] = useState(false);

    // Form state
    const [customerId, setCustomerId] = useState("");
    const [productType, setProductType] = useState("");
    const [dealName, setDealName] = useState("");
    const [dealValue, setDealValue] = useState("");
    const [probability, setProbability] = useState("50");
    const [expectedCloseDate, setExpectedCloseDate] = useState("");
    const [rmAssigned, setRmAssigned] = useState("");
    const [pipelineStage, setPipelineStage] = useState("Prospecting");

    const [customers, setCustomers] = useState<{ id: string, full_name: string }[]>([]);

    useEffect(() => {
        if (open) {
            fetch('/api/customers?limit=20').then(r => r.json()).then(d => {
                if (d.data) setCustomers(d.data);
            }).catch(console.error);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!customerId || !dealName || !dealValue || !expectedCloseDate || !productType || !rmAssigned || !probability) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/opportunities/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: customerId,
                    title: dealName,
                    product_id: productType,
                    projected_value: parseFloat(dealValue),
                    probability_weighting: parseInt(probability, 10),
                    expected_close_date: new Date(expectedCloseDate).toISOString(),
                    assigned_to: rmAssigned,
                    pipeline_stage: pipelineStage,
                    status: 'Open'
                })
            });

            if (res.ok) {
                toast.success("Deal created successfully", { description: dealName });
                mutate('/api/opportunities?limit=100'); // Refresh kanban board
                onOpenChange(false);
                // Reset form
                setCustomerId(""); setProductType(""); setDealName(""); setDealValue(""); setProbability("50"); setExpectedCloseDate(""); setRmAssigned(""); setPipelineStage("Prospecting");
            } else {
                const err = await res.json();
                toast.error("Failed to create deal", { description: err.error || "Unknown error" });
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-white">Create New Deal</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2 col-span-2">
                        <Label className="text-xs text-slate-300">Customer *</Label>
                        <Select value={customerId} onValueChange={setCustomerId}>
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100">
                                <SelectValue placeholder="Select Customer" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 max-h-48">
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.full_name || 'Unnamed Customer'}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label className="text-xs text-slate-300">Deal Name *</Label>
                        <Input value={dealName} onChange={e => setDealName(e.target.value)} placeholder="e.g. Q3 Software Implementation" className="bg-slate-950 border-slate-700 text-slate-100" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-300">Product Type *</Label>
                        <Select value={productType} onValueChange={setProductType}>
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100">
                                <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                                <SelectItem value="PROD-001">Treasury Management</SelectItem>
                                <SelectItem value="PROD-002">Commercial Loan</SelectItem>
                                <SelectItem value="PROD-003">Merchant Services</SelectItem>
                                <SelectItem value="PROD-004">Corporate Credit Card</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-300">Deal Value ($) *</Label>
                        <Input type="number" value={dealValue} onChange={e => setDealValue(e.target.value)} min="1" className="bg-slate-950 border-slate-700 text-slate-100" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-300">Probability (%) *</Label>
                        <Input type="number" value={probability} onChange={e => setProbability(e.target.value)} min="0" max="100" className="bg-slate-950 border-slate-700 text-slate-100" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-300">Expected Close Date *</Label>
                        <Input type="date" value={expectedCloseDate} onChange={e => setExpectedCloseDate(e.target.value)} className="bg-slate-950 border-slate-700 text-slate-100" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-300">Pipeline Stage *</Label>
                        <Select value={pipelineStage} onValueChange={setPipelineStage}>
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100">
                                <SelectValue placeholder="Select Stage" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                                <SelectItem value="Prospecting">Prospecting</SelectItem>
                                <SelectItem value="Qualification">Qualification</SelectItem>
                                <SelectItem value="Needs Analysis">Needs Analysis</SelectItem>
                                <SelectItem value="Proposal">Proposal</SelectItem>
                                <SelectItem value="Negotiation">Negotiation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 border-t border-slate-800 pt-4 col-span-2">
                        <Label className="text-xs text-slate-300">Assigned RM *</Label>
                        <Input value={rmAssigned} onChange={e => setRmAssigned(e.target.value)} placeholder="Full Name" className="bg-slate-950 border-slate-700 text-slate-100" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Creating...' : 'Create Deal'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
