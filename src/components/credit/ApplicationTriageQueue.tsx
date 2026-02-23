"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditApplication, MOCK_APPLICATIONS } from "@/lib/credit-mock-data";
import { ArrowRight, Filter } from "lucide-react";

interface ApplicationTriageQueueProps {
    onSelect: (app: CreditApplication) => void;
    selectedId?: string;
}

export function ApplicationTriageQueue({ onSelect, selectedId }: ApplicationTriageQueueProps) {
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-slate-100 text-lg">Incoming Application Triage</CardTitle>
                <Button variant="outline" size="sm" className="h-8 border-slate-700 text-slate-400">
                    <Filter className="h-3 w-3 mr-2" /> Filter
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-950">
                        <TableRow className="border-slate-800">
                            <TableHead className="text-slate-400">ID</TableHead>
                            <TableHead className="text-slate-400">Applicant</TableHead>
                            <TableHead className="text-slate-400">Amount</TableHead>
                            <TableHead className="text-slate-400">Routing</TableHead>
                            <TableHead className="text-slate-400 text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_APPLICATIONS.map((app) => (
                            <TableRow
                                key={app.id}
                                className={`
                    cursor-pointer border-slate-800 transition-colors
                    ${selectedId === app.id ? 'bg-indigo-900/20 border-l-4 border-l-indigo-500' : 'hover:bg-slate-800/50'}
                `}
                                onClick={() => onSelect(app)}
                            >
                                <TableCell className="font-mono text-xs text-slate-500">{app.id}</TableCell>
                                <TableCell>
                                    <div className="font-medium text-slate-200">{app.businessName || app.applicantName}</div>
                                    <div className="text-xs text-slate-500">{app.purpose}</div>
                                </TableCell>
                                <TableCell className="text-slate-200">${app.loanAmount.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={`
                        ${app.routing === 'STP' ? 'bg-emerald-500/10 text-emerald-400' :
                                            app.routing === 'Specialist' ? 'bg-purple-500/10 text-purple-400' :
                                                'bg-slate-700 text-slate-300'}
                    `}>
                                        {app.routing}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
