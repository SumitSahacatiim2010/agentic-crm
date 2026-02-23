"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerProfileHeader } from "./CustomerProfileHeader";
import { OverviewTab } from "./OverviewTab";
import { ProductsTab } from "./ProductsTab";
import { FinancialsTab } from "./FinancialsTab";
import { InteractionsTab } from "./InteractionsTab";
import { DocumentsTab } from "./DocumentsTab";
import { RiskTab } from "./RiskTab";
import { TasksTab } from "./TasksTab";

export default function Customer360Client({ data, id }: { data: any, id: string }) {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <CustomerProfileHeader data={data} id={id} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 mb-6 overflow-x-auto">
                    <TabsList className="bg-transparent h-10 w-full justify-start min-w-max gap-2">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">Overview</TabsTrigger>
                        <TabsTrigger value="products" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">Products</TabsTrigger>
                        <TabsTrigger value="financials" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">Financials</TabsTrigger>
                        <TabsTrigger value="interactions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">Interactions</TabsTrigger>
                        <TabsTrigger value="documents" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">Documents</TabsTrigger>
                        <TabsTrigger value="risk" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">Risk & KYC</TabsTrigger>
                        <TabsTrigger value="tasks" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">Tasks & Journey</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview"><OverviewTab data={data} /></TabsContent>
                <TabsContent value="products"><ProductsTab data={data} /></TabsContent>
                <TabsContent value="financials"><FinancialsTab data={data} /></TabsContent>
                <TabsContent value="interactions"><InteractionsTab data={data} /></TabsContent>
                <TabsContent value="documents"><DocumentsTab data={data} /></TabsContent>
                <TabsContent value="risk"><RiskTab data={data} /></TabsContent>
                <TabsContent value="tasks"><TasksTab data={data} /></TabsContent>
            </Tabs>
        </div>
    );
}
