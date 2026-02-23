import { Card, CardContent } from "@/components/ui/card";
import { User, Flag, Briefcase, Calendar, MapPin } from "lucide-react";
import { fmtDate } from "@/lib/date-utils";

export function DemographicsCard({ data }: { data: any }) {
    const ind = data?.individual;
    if (!ind) return null;

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">Demographics</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px] block mb-1">Date of Birth</span>
                        <span className="text-slate-200 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-500" />{fmtDate(ind.date_of_birth)}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px] block mb-1">Nationality</span>
                        <span className="text-slate-200 flex items-center gap-1.5"><Flag className="h-3.5 w-3.5 text-slate-500" />{ind.nationality || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px] block mb-1">Employment</span>
                        <span className="text-slate-200 flex items-center gap-1.5 capitalize"><Briefcase className="h-3.5 w-3.5 text-slate-500" />{ind.employment_status || 'N/A'}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ContactInfoCard() {
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">Contact Info</h3>
                <div className="space-y-3 text-xs">
                    <div>
                        <span className="text-slate-500 uppercase font-bold tracking-wider text-[10px] block mb-1">Primary Address</span>
                        <span className="text-slate-200 flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />123 Financial District Ave<br />Suite 400<br />New York, NY 10004</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
