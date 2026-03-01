"use client";

import { useState } from 'react';
import { Building2, User, Filter, LayoutDashboard } from 'lucide-react';
import useSWR from 'swr';
import { BranchQueuePanel } from './BranchQueuePanel';
import { BranchDetailPanel } from './BranchDetailPanel';
import { BranchCustomer360Panel } from './BranchCustomer360Panel';
import { BranchLeadWizard } from './BranchLeadWizard';
import { BranchManagerDashboard } from './BranchManagerDashboard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function BranchWorkspaceClient({ initialStaffUser, branchName }: { initialStaffUser: any, branchName: string }) {
    const [viewMode, setViewMode] = useState<'my_work' | 'branch_work' | 'manager_dashboard'>('my_work');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [wizardOpen, setWizardOpen] = useState(false);

    // Fetch the workqueue directly
    const apiUrl = `/api/branches/${initialStaffUser.branch_id}/workqueue${viewMode === 'my_work' ? `?ownerId=${initialStaffUser.id}` : ''}`;
    const { data: queueResponse, error, mutate } = useSWR(apiUrl, fetcher, { revalidateOnFocus: false });

    const workItems = queueResponse?.data || [];
    const selectedItem = workItems.find((w: any) => w.id === selectedItemId) || null;

    // Derived customer ID from selected item to feed into C360 panel
    // Leads without customers might need creation; cases usually have customers
    const activeCustomerId = selectedItem?.customerId || selectedItem?.converted_customer_id || null;

    return (
        <div className="h-screen flex flex-col bg-slate-950 font-sans text-slate-200 overflow-hidden">
            {/* Minimal Header */}
            <header className="border-b border-slate-800 bg-slate-950 p-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-indigo-400" />
                        <h1 className="text-xl font-semibold text-white">{branchName} Ops</h1>
                    </div>
                    <div className="h-6 w-px bg-slate-700 mx-2"></div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <User className="h-4 w-4" />
                        <span>{initialStaffUser.name}</span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-xs ml-2 text-indigo-300">
                            {initialStaffUser.role.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center bg-slate-900 rounded-md border border-slate-800 p-1">
                    <button
                        onClick={() => setViewMode('my_work')}
                        className={`px-4 py-1.5 text-sm rounded transition-colors ${viewMode === 'my_work' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        My Work
                    </button>
                    <button
                        onClick={() => setViewMode('branch_work')}
                        className={`px-4 py-1.5 text-sm rounded transition-colors ${viewMode === 'branch_work' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        Branch Queue
                    </button>
                    <button
                        onClick={() => setViewMode('manager_dashboard')} // For manager dashboard
                        className={`px-4 py-1.5 text-sm rounded transition-colors ml-1 ${initialStaffUser.role === 'BRANCH_MANAGER' ? 'block' : 'hidden'} ${viewMode === 'manager_dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                    </button>
                </div>

                <div className="ml-4">
                    <Button onClick={() => setWizardOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                        <PlusCircle className="h-4 w-4" />
                        New Walk-In
                    </Button>
                </div>
            </header>

            {/* 3-Panel Main Content or Manager Dashboard */}
            {viewMode === 'manager_dashboard' ? (
                <BranchManagerDashboard branchId={initialStaffUser.branch_id} />
            ) : (
                <main className="flex-1 flex overflow-hidden">

                    {/* Panel 1: Workqueue (Left, 300px) */}
                    <div className="w-[380px] shrink-0 border-r border-slate-800 bg-slate-950/50 flex flex-col">
                        <BranchQueuePanel
                            items={workItems}
                            isLoading={!queueResponse && !error}
                            selectedId={selectedItemId}
                            onSelect={setSelectedItemId}
                            onRefresh={() => mutate()}
                        />
                    </div>

                    {/* Panel 2: Detail Workspace (Center, Auto) */}
                    <div className="flex-1 overflow-y-auto bg-slate-950/80 p-6">
                        {selectedItem ? (
                            <BranchDetailPanel
                                item={selectedItem}
                                staffUser={initialStaffUser}
                                onUpdated={() => mutate()}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <Filter className="h-12 w-12 mb-4 opacity-20" />
                                <p>Select an item from the queue to start working.</p>
                            </div>
                        )}
                    </div>

                    {/* Panel 3: Customer 360 (Right, 380px, Collapsible) */}
                    {activeCustomerId && (
                        <div className="w-[420px] shrink-0 border-l border-slate-800 bg-slate-900/50 overflow-y-auto">
                            <BranchCustomer360Panel customerId={activeCustomerId} />
                        </div>
                    )}
                </main>
            )}

            {/* Lead Wizard Modal */}
            <BranchLeadWizard
                open={wizardOpen}
                onOpenChange={setWizardOpen}
                staffUser={initialStaffUser}
                onCreated={() => mutate()}
            />
        </div>
    );
}
