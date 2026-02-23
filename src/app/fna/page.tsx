"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoalPlanningMatrix } from "@/components/fna/GoalPlanningMatrix";
import { ProtectionGapCalculator } from "@/components/fna/ProtectionGapCalculator";
import { RiskQuestionnaire } from "@/components/fna/RiskQuestionnaire";
import { SuitabilityBlocker } from "@/components/fna/SuitabilityBlocker";
import { MOCK_PRODUCTS, Product, RiskProfile } from "@/lib/fna-mock-data";
import { AlertTriangle, CheckCircle, FileText, Shield, Target, TrendingUp } from "lucide-react";

export default function FNAPage() {
    const [riskProfile, setRiskProfile] = useState<RiskProfile>({
        score: 0,
        category: 'Moderate', // Default for initial state visuals
        description: 'Pending Assessment',
        maxEquityExposure: 0
    });
    const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showBlocker, setShowBlocker] = useState(false);

    const handleProductSelect = (product: Product) => {
        // Suitability Logic
        // If Client is Conservative and Product is High Risk -> Block
        // If Client is Conservative and Product is Medium Risk -> Warn (We'll treat as Block for demo simplicity)
        // If Client is Moderate and Product is High Risk -> Warn/Block

        let isUnsuitable = false;
        if (riskProfile.category === 'Conservative' && product.riskRating !== 'Low') isUnsuitable = true;
        if (riskProfile.category === 'Moderate' && product.riskRating === 'High') isUnsuitable = true;

        if (isUnsuitable) {
            setSelectedProduct(product);
            setShowBlocker(true);
        } else {
            alert(`Product ${product.name} selected successfully. Added to proposal.`);
        }
    };

    const handleOverride = (justification: string) => {
        alert(`AUDIT LOGGED: Product ${selectedProduct?.name} added with override.`);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center">
            <div className="w-full max-w-7xl space-y-6">

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Financial Needs Analysis</h1>
                        <div className="flex items-center text-slate-400 gap-4 text-sm">
                            <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> Client: <strong>Robert Fox</strong></span>
                            <span className="flex items-center gap-1">
                                Risk Profile:
                                <Badge variant="outline" className={`ml-2 ${!isAssessmentComplete ? 'border-slate-600 text-slate-500' :
                                        riskProfile.category === 'Conservative' ? 'border-emerald-500 text-emerald-400' :
                                            riskProfile.category === 'Moderate' ? 'border-amber-500 text-amber-400' :
                                                'border-rose-500 text-rose-400'
                                    }`}>
                                    {isAssessmentComplete ? riskProfile.category : 'Not Assessed'}
                                </Badge>
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-slate-700 hover:bg-slate-800">Save Draft</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">Generate Report</Button>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="risk" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-900 border border-slate-800">
                        <TabsTrigger value="risk" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <TrendingUp className="h-4 w-4 mr-2" /> Risk Profiling
                        </TabsTrigger>
                        <TabsTrigger value="goals" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <Target className="h-4 w-4 mr-2" /> Goal Planning
                        </TabsTrigger>
                        <TabsTrigger value="protection" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <Shield className="h-4 w-4 mr-2" /> Protection Gap
                        </TabsTrigger>
                        <TabsTrigger value="selection" disabled={!isAssessmentComplete} className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white disabled:opacity-50">
                            <CheckCircle className="h-4 w-4 mr-2" /> Product Selection
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6 min-h-[500px]">
                        <TabsContent value="risk" className="h-full">
                            <RiskQuestionnaire onComplete={(p) => { setRiskProfile(p); setIsAssessmentComplete(true); }} />
                        </TabsContent>

                        <TabsContent value="goals" className="h-full">
                            <GoalPlanningMatrix />
                        </TabsContent>

                        <TabsContent value="protection" className="h-full">
                            <ProtectionGapCalculator />
                        </TabsContent>

                        <TabsContent value="selection" className="h-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {MOCK_PRODUCTS.map(product => (
                                    <Card key={product.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <Badge className={`mb-2 ${product.riskRating === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        product.riskRating === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                                            'bg-rose-500/10 text-rose-400'
                                                    }`}>
                                                    {product.riskRating} Risk
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg text-slate-100">{product.name}</CardTitle>
                                            <CardDescription>{product.type}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-slate-400">Min Investment: <span className="text-slate-200 font-mono">${product.minInvestment.toLocaleString()}</span></p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                className="w-full bg-slate-800 hover:bg-slate-700"
                                                onClick={() => handleProductSelect(product)}
                                            >
                                                Select Logic
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <SuitabilityBlocker
                    product={selectedProduct}
                    clientProfile={riskProfile}
                    isOpen={showBlocker}
                    onClose={() => setShowBlocker(false)}
                    onOverride={handleOverride}
                />
            </div>
        </div>
    );
}
