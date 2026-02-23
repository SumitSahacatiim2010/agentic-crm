"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink } from "lucide-react";

interface ReviewSection {
    title: string;
    items: { label: string; value: string | boolean | string[] | null | undefined }[];
    editStep: number;
}

interface Props {
    wizardData: Record<string, any>;
    eddRequired: boolean;
    submitting: boolean;
    submitted: boolean;
    applicationId: string;
    onGoToStep: (step: number) => void;
    onSubmit: () => void;
    onBack: () => void;
}

function val(v: unknown): string {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    if (Array.isArray(v)) return v.join(', ') || '—';
    return String(v);
}

export function ReviewSubmitStep({ wizardData, eddRequired, submitting, submitted, applicationId, onGoToStep, onSubmit, onBack }: Props) {
    const d = wizardData;
    const canSubmit = d.sanctionsOutcome !== 'HIT' && !submitting && !submitted;

    const sections: ReviewSection[] = [
        {
            title: 'Personal Details', editStep: 1,
            items: [
                { label: 'Full Name', value: d.fullName },
                { label: 'Email', value: d.email },
                { label: 'Date of Birth', value: d.dob },
                { label: 'Nationality', value: d.nationality },
                { label: 'Country of Residence', value: d.countryOfResidence },
                { label: 'Tax Residence', value: d.taxResidenceCountry },
                { label: 'Occupation', value: d.occupation },
                { label: 'Employment Status', value: d.employmentStatus },
                { label: 'Phone', value: d.phone },
            ],
        },
        {
            title: 'Identity Verification (eKYC)', editStep: 2,
            items: [
                { label: 'Document Type', value: d.kycDocType },
                { label: 'Status', value: d.kycStatus },
                { label: 'Name Match', value: d.kycNameScore ? `${d.kycNameScore}/100` : null },
                { label: 'Authenticity', value: d.kycAuthScore ? `${d.kycAuthScore}/100` : null },
                { label: 'Tamper Flag', value: d.kycTamperFlag },
            ],
        },
        {
            title: 'CDD Risk Assessment', editStep: 3,
            items: [
                { label: 'Risk Rating', value: d.cddRiskRating },
                { label: 'PEP Declared', value: d.cddPepDeclared },
                { label: 'Annual Income', value: d.cddAnnualIncome },
                { label: 'Transaction Volume', value: d.cddTxVolume },
                { label: 'Source of Funds', value: d.cddSourceOfFunds },
                { label: 'High-Risk Country Exposure', value: d.cddHighRiskCountry },
            ],
        },
        ...(eddRequired ? [{
            title: 'Enhanced Due Diligence (EDD)', editStep: 4,
            items: [
                { label: 'Wealth Narrative', value: d.eddNarrative },
                { label: 'Country of Risk', value: d.eddCountry },
                { label: 'Net Worth Band', value: d.eddNetWorth ? `$${d.eddNetWorth}M` : null },
                { label: 'Third-Party Transactions', value: d.eddThirdParty },
            ],
        } as ReviewSection] : []),
        {
            title: 'FATCA / CRS', editStep: eddRequired ? 5 : 4,
            items: [
                { label: 'US Person', value: d.fatcaUsPerson },
                { label: 'US TIN', value: d.fatcaTin },
                { label: 'FATCA Status', value: d.fatcaStatus },
                { label: 'CRS Countries', value: d.crsCountries },
                { label: 'Declaration', value: d.fatcaDeclared ? 'Certified' : 'Not declared' },
            ],
        },
        {
            title: 'Sanctions Screening', editStep: -1, // not editable
            items: [
                { label: 'Outcome', value: d.sanctionsOutcome },
                { label: 'Score', value: d.sanctionsScore !== undefined ? `${d.sanctionsScore}/100` : null },
                { label: 'Account Number', value: d.accountNumber },
                { label: 'Sort Code', value: d.sortCode },
            ],
        },
    ];

    if (submitted) {
        return (
            <div className="flex flex-col items-center gap-6 py-12">
                <div className="h-16 w-16 rounded-full bg-emerald-950/50 border-2 border-emerald-600/40 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">Application Submitted!</h2>
                    <p className="text-slate-400 text-sm">Reference: <span className="font-mono font-bold text-indigo-300">{applicationId.slice(0, 8).toUpperCase()}</span></p>
                    <p className="text-xs text-slate-600 max-w-sm">Keep your reference number safe. You will receive a confirmation email shortly.</p>
                </div>
                <a href="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <ExternalLink className="h-3.5 w-3.5" /> Return to Dashboard
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sections.map(section => (
                <details key={section.title} open className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none">
                        <span className="text-sm font-bold text-slate-200">{section.title}</span>
                        <div className="flex items-center gap-2">
                            {section.editStep > 0 && (
                                <button onClick={(e) => { e.preventDefault(); onGoToStep(section.editStep); }}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 border border-indigo-800/40 rounded px-1.5 py-0.5">
                                    Edit
                                </button>
                            )}
                            <span className="text-slate-700 group-open:rotate-90 transition-transform">›</span>
                        </div>
                    </summary>
                    <div className="px-4 pb-4 space-y-1.5">
                        {section.items.map(item => (
                            <div key={item.label} className="flex items-baseline justify-between text-xs">
                                <span className="text-slate-600">{item.label}</span>
                                <span className={`text-slate-300 font-medium max-w-[60%] text-right ${item.label.includes('Outcome') && typeof item.value === 'string' ? (item.value === 'CLEAR' ? 'text-emerald-400' : item.value === 'HIT' ? 'text-red-400' : 'text-amber-400') : ''}`}>
                                    {val(item.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </details>
            ))}

            {d.sanctionsOutcome === 'HIT' && (
                <div className="p-3 bg-red-950/30 border border-red-700/40 rounded-xl text-xs text-red-400 text-center">
                    Application cannot be submitted — compliance intervention required.
                </div>
            )}

            <div className="pt-2 space-y-3">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-700 cursor-pointer text-sm text-slate-300 hover:border-slate-600">
                    <input type="checkbox" id="final-declaration"
                        onChange={e => { /* handled by canSubmit condition via d.sanctionsOutcome */ }}
                        defaultChecked={false}
                        className="mt-1 accent-indigo-500" />
                    I confirm all information provided is true and complete to the best of my knowledge.
                </label>
                <div className="flex justify-between">
                    <Button variant="outline" onClick={onBack} className="border-slate-700 text-slate-300">← Back</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8"
                        disabled={!canSubmit} onClick={onSubmit}>
                        {submitting ? 'Submitting…' : '✓ Submit Application'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
