import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, Clock, Activity } from 'lucide-react';
import { WorkItem } from '@/services/branch-service';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function BranchManagerDashboard({ branchId }: { branchId: string }) {
    // Fetch all branch work
    const { data: queueResponse } = useSWR(`/api/branches/${branchId}/workqueue`, fetcher, { revalidateOnFocus: false });
    // Fetch staff
    const { data: staffResponse } = useSWR(`/api/branches/${branchId}/staff`, fetcher, { revalidateOnFocus: false });

    const workItems: WorkItem[] = queueResponse?.data || [];
    const staffMembers = staffResponse?.data || [];

    // Calculate metrics
    const now = new Date().getTime();
    let breachedSlas = 0;
    let newItems = 0;
    let aging24h = 0;

    workItems.forEach(item => {
        if (item.status === 'New') newItems++;
        if (item.slaDueAt && new Date(item.slaDueAt).getTime() < now) breachedSlas++;
        const ageHours = (now - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
        if (ageHours > 24) aging24h++;
    });

    // Staff Workload Map
    const workloads = staffMembers.map((s: any) => {
        const assignedItems = workItems.filter(w => w.ownerId === s.id);
        const leads = assignedItems.filter(w => w.entityType === 'lead').length;
        const cases = assignedItems.filter(w => w.entityType === 'case').length;
        const tasks = assignedItems.filter(w => w.entityType === 'task').length;
        return { ...s, assignedLeads: leads, assignedCases: cases, assignedTasks: tasks, total: leads + cases + tasks };
    }).sort((a: any, b: any) => b.total - a.total);

    return (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-200">
            <div className="max-w-6xl mx-auto space-y-6">

                <h2 className="text-2xl font-bold text-white mb-6">Manager Oversight Dashboard</h2>

                {/* KPIs */}
                <div className="grid grid-cols-4 gap-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Queue</CardTitle>
                            <Activity className="h-4 w-4 text-indigo-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{workItems.length}</div>
                            <p className="text-xs text-slate-500 mt-1">Active items in branch</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">New / Unassigned</CardTitle>
                            <Users className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-400">{newItems}</div>
                            <p className="text-xs text-slate-500 mt-1">Requires immediate routing</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Breached SLAs</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-500">{breachedSlas}</div>
                            <p className="text-xs text-slate-500 mt-1">Tasks past due time</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Aging &gt; 24h</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-500">{aging24h}</div>
                            <p className="text-xs text-slate-500 mt-1">Stale work items</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Staff Workload */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Staff Workload & Capacity</CardTitle>
                        <CardDescription>Live routing metrics for branch personnel.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-slate-950/50">
                                <TableRow className="border-slate-800">
                                    <TableHead className="text-slate-300">Staff Member</TableHead>
                                    <TableHead className="text-slate-300">Role</TableHead>
                                    <TableHead className="text-center text-slate-300">Active Leads</TableHead>
                                    <TableHead className="text-center text-slate-300">Open Cases</TableHead>
                                    <TableHead className="text-center text-slate-300">Tasks</TableHead>
                                    <TableHead className="text-right text-slate-300">Total Workload</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workloads.map((staff: any) => (
                                    <TableRow key={staff.id} className="border-slate-800">
                                        <TableCell className="font-medium text-slate-200">{staff.name}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-[10px]">{staff.role.replace('_', ' ')}</Badge></TableCell>
                                        <TableCell className="text-center text-emerald-400">{staff.assignedLeads}</TableCell>
                                        <TableCell className="text-center text-orange-400">{staff.assignedCases}</TableCell>
                                        <TableCell className="text-center text-indigo-400">{staff.assignedTasks}</TableCell>
                                        <TableCell className="text-right font-bold text-white">{staff.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Future: Bulk Assignment Board */}
                <div className="p-6 border border-dashed border-slate-700 rounded-lg text-center text-slate-500 bg-slate-900/30">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Drag-and-Drop Bulk Assignment Board (Planned capability)
                </div>

            </div>
        </div>
    );
}
