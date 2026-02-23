import { Button } from "@/components/ui/button";
import { FileText, Download, UploadCloud } from "lucide-react";

export function DocumentsTab({ data }: { data: any }) {
    const docs = data?.compliance?.documents || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-100">Document Repository</h2>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs"><UploadCloud className="h-3.5 w-3.5 mr-1" /> Upload</Button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    {docs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">No documents on file.</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-800/50 text-slate-400 font-medium uppercase text-[10px]">
                                <tr>
                                    <th className="px-4 py-3">Document</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Uploaded</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {/* Map docs here when structure is known, fallback below */}
                                <tr>
                                    <td colSpan={5} className="px-4 py-4 text-center text-slate-500 text-xs text-italic">Sample structure - data parsing required based on JSONB schema</td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-64 flex items-center justify-center text-slate-500 text-sm">
                Document Upload Form (Placeholder)
            </div>
        </div>
    );
}
