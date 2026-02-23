import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingState } from "./types";
import { Camera } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";

interface Props {
    state: OnboardingState['identity'];
    updateState: (updates: Partial<OnboardingState['identity']>) => void;
}

export function Step1Identity({ state, updateState }: Props) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-100">Identity & eKYC</h2>
                    <p className="text-sm text-slate-400">Capture identity documents and biometrics.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label className="text-slate-300">First Name</Label>
                    <Input
                        value={state.firstName}
                        onChange={e => updateState({ firstName: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-slate-100 mt-2"
                        placeholder="e.g. Jean-Luc"
                    />
                </div>
                <div>
                    <Label className="text-slate-300">Last Name</Label>
                    <Input
                        value={state.lastName}
                        onChange={e => updateState({ lastName: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-slate-100 mt-2"
                        placeholder="e.g. Picard"
                    />
                </div>

                <div>
                    <Label className="text-slate-300">Date of Birth</Label>
                    <Input
                        type="date"
                        value={state.dob}
                        onChange={e => updateState({ dob: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-slate-100 mt-2"
                    />
                </div>
                <div>
                    <Label className="text-slate-300">Nationality</Label>
                    <Select value={state.nationality} onValueChange={(val) => updateState({ nationality: val })}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 mt-2">
                            <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-64">
                            {COUNTRIES.map(c => (
                                <SelectItem key={c.code} value={c.code}>
                                    {c.name}{c.highRisk ? ' ⚠️' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="text-slate-300">ID Type</Label>
                    <Select value={state.idType} onValueChange={(val) => updateState({ idType: val })}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 mt-2">
                            <SelectValue placeholder="Select ID Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="Passport">Passport</SelectItem>
                            <SelectItem value="National ID">National ID</SelectItem>
                            <SelectItem value="Driving License">Driving License</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-slate-300">ID Number</Label>
                    <Input
                        value={state.idNumber}
                        onChange={e => updateState({ idNumber: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-slate-100 mt-2"
                        placeholder="Enter ID sequence"
                    />
                </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-800">
                <Label className="text-slate-300 mb-2 block">Document Upload (Simulated OCR)</Label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/50 transition-colors"
                    onClick={() => updateState({ idDocument: new File([], "mock_id.png") })}>
                    {state.idDocument ? (
                        <>
                            <div className="text-emerald-400 mb-2">✓ Document Attached</div>
                            <div className="text-xs text-slate-400">OCR Extraction Complete</div>
                        </>
                    ) : (
                        <>
                            <Camera className="h-10 w-10 text-slate-500 mb-4" />
                            <div className="text-sm text-slate-300">Click to capture or upload ID document</div>
                            <div className="text-xs text-slate-500 mt-2">Supports JPG, PNG, PDF</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
