"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { PersonalDetailsStep, PersonalDetailsData } from "./steps/PersonalDetailsStep";
import { EKYCStep, EKYCData } from "./steps/eKYCStep";
import { CDDStep, CDDData } from "./steps/CDDStep";
import { EDDStep, EDDData } from "./steps/EDDStep";
import { FATCACRSStep, FATCACRSData } from "./steps/FATCACRSStep";
import { SanctionsScreeningStep, SanctionsData } from "./steps/SanctionsScreeningStep";
import { fmtDateTime } from "@/lib/date-utils";
import { ReviewSubmitStep } from "./steps/ReviewSubmitStep";

/* ────────────────────────────────────────────────────────────
   Step definitions (EDD step 4 is conditionally inserted)
   ──────────────────────────────────────────────────────────── */
interface StepDef { id: number; key: string; label: string; edd?: boolean }

const BASE_STEPS: StepDef[] = [
    { id: 1, key: 'personal', label: 'Personal Details' },
    { id: 2, key: 'ekyc', label: 'Identity (eKYC)' },
    { id: 3, key: 'cdd', label: 'CDD Questionnaire' },
    // Step 4 EDD injected dynamically
    { id: 5, key: 'fatca', label: 'FATCA / CRS' },
    { id: 6, key: 'sanctions', label: 'Sanctions Screening' },
    { id: 7, key: 'review', label: 'Review & Submit' },
];
const EDD_STEP: StepDef = { id: 4, key: 'edd', label: 'EDD', edd: true };

function buildSteps(eddRequired: boolean): StepDef[] {
    const steps = [...BASE_STEPS];
    if (eddRequired) steps.splice(3, 0, EDD_STEP);
    return steps.map((s, i) => ({ ...s, id: i + 1 }));
}

/* ────────────────────────────────────────────────────────────
   Resume-token persistence
   ──────────────────────────────────────────────────────────── */
const RESUME_KEY = 'onboarding_resume_token';

function getResumeToken(searchToken?: string): string | null {
    if (searchToken) return searchToken;
    if (typeof window !== 'undefined') return localStorage.getItem(RESUME_KEY);
    return null;
}

function storeResumeToken(token: string) {
    if (typeof window !== 'undefined') localStorage.setItem(RESUME_KEY, token);
}

/* ────────────────────────────────────────────────────────────
   Step indicator component
   ──────────────────────────────────────────────────────────── */
function StepIndicator({ steps, current }: { steps: StepDef[]; current: number }) {
    return (
        <nav aria-label="Application progress" className="mb-8">
            <ol className="flex items-center gap-0 w-full">
                {steps.map((step, idx) => {
                    const done = step.id < current;
                    const active = step.id === current;
                    const locked = step.id > current;
                    return (
                        <li key={step.key} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1 z-10">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-emerald-600 border-emerald-600 text-white' : active ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300 ring-4 ring-indigo-500/20' : 'border-slate-700 bg-slate-900 text-slate-600'}`}
                                    aria-current={active ? 'step' : undefined}>
                                    {done ? <CheckCircle2 className="h-4 w-4" /> : locked ? <Lock className="h-3 w-3" /> : <span className="text-xs font-bold">{step.id}</span>}
                                </div>
                                <span className={`text-[9px] font-semibold uppercase tracking-wide truncate max-w-[60px] text-center ${active ? 'text-indigo-400' : done ? 'text-emerald-500' : 'text-slate-700'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 mt-[-16px] ${done ? 'bg-emerald-600' : 'bg-slate-800'}`} />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

/* ────────────────────────────────────────────────────────────
   Main wizard orchestrator
   ──────────────────────────────────────────────────────────── */
interface Props { initialData?: Record<string, any>; searchToken?: string }

export function OnboardingWizardClient({ initialData, searchToken }: Props) {
    const [appId, setAppId] = useState<string | null>(initialData?.application_id || null);
    const [resumeToken, setResumeToken] = useState<string>(initialData?.resume_token || '');
    const [currentStep, setCurrentStep] = useState<number>(initialData?.wizard_step || 1);
    const [eddRequired, setEddRequired] = useState<boolean>(initialData?.edd_required || false);

    // Collected data per step
    const [personal, setPersonal] = useState<Partial<PersonalDetailsData>>(initialData?.wizard_state?.personal || {});
    const [ekyc, setEkyc] = useState<Partial<EKYCData>>(initialData?.wizard_state?.ekyc || {});
    const [cdd, setCdd] = useState<Partial<CDDData>>(initialData?.wizard_state?.cdd || {});
    const [edd, setEdd] = useState<Partial<EDDData>>(initialData?.wizard_state?.edd || {});
    const [fatca, setFatca] = useState<Partial<FATCACRSData>>(initialData?.wizard_state?.fatca || {});
    const [sanctions, setSanctions] = useState<Partial<SanctionsData>>(initialData?.wizard_state?.sanctions || {});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const steps = buildSteps(eddRequired);

    // Resolve step key → position
    const keyToPos = (key: string) => (steps.findIndex(s => s.key === key) + 1) || currentStep;

    // ── Resume from token on mount ──
    useEffect(() => {
        const token = getResumeToken(searchToken);
        if (token && !initialData) {
            fetch(`/api/onboarding/get-application?token=${token}`)
                .then(r => r.ok ? r.json() : null)
                .then(app => {
                    if (!app) return;
                    setAppId(app.application_id);
                    setResumeToken(app.resume_token);
                    setCurrentStep(app.wizard_step || 1);
                    setEddRequired(app.edd_required || false);
                    const state = app.wizard_state || {};
                    if (state.personal) setPersonal(state.personal);
                    if (state.ekyc) setEkyc(state.ekyc);
                    if (state.cdd) setCdd(state.cdd);
                    if (state.edd) setEdd(state.edd);
                    if (state.fatca) setFatca(state.fatca);
                    if (state.sanctions) setSanctions(state.sanctions);
                    toast.success(`Resuming application — last saved at ${fmtDateTime(app.updated_at)}`);
                })
                .catch(() => { });
        }
    }, []); // eslint-disable-line

    const buildWizardState = useCallback(() => ({ personal, ekyc, cdd, edd, fatca, sanctions }), [personal, ekyc, cdd, edd, fatca, sanctions]);

    const saveProgress = useCallback(async (step: number, extraFields: Record<string, unknown> = {}): Promise<{ application_id?: string }> => {
        const payload = {
            application_id: appId,
            resume_token: resumeToken || undefined,
            wizard_step: step,
            wizard_state: buildWizardState(),
            edd_required: eddRequired,
            ...extraFields,
        };
        try {
            const res = await fetch('/api/onboarding/save-progress', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (res.ok) {
                if (!appId && json.application_id) setAppId(json.application_id);
                if (!resumeToken && json.resume_token) {
                    setResumeToken(json.resume_token);
                    storeResumeToken(json.resume_token);
                }
                return { application_id: json.application_id || appId || undefined };
            }
        } catch { /* silent */ }
        return { application_id: appId || undefined };
    }, [appId, resumeToken, buildWizardState, eddRequired]);

    // ── Step handlers ──
    const goTo = (step: number) => setCurrentStep(step);

    const handlePersonal = async (d: PersonalDetailsData) => {
        setPersonal(d);
        const result = await saveProgress(2, {
            full_name: d.full_name, email: d.email, date_of_birth: d.date_of_birth,
            nationality: d.nationality, country_of_residence: d.country_of_residence,
            tax_residence_country: d.tax_residence_country, occupation: d.occupation,
            employment_status: d.employment_status, phone: d.phone,
        });
        // BUG-012 fix: ensure appId is set before navigating so eKYC gate passes
        if (result.application_id && !appId) setAppId(result.application_id);
        setCurrentStep(2);
    };

    const handleEKYC = async (d: EKYCData) => {
        setEkyc(d);
        await saveProgress(3, { kyc_status: d.kyc_status, kyc_doc_type: d.doc_type, kyc_name_score: d.name_match_score, kyc_auth_score: d.auth_score, kyc_tamper_flag: d.tamper_flag });
        setCurrentStep(3);
    };

    const handleCDD = async (d: CDDData) => {
        setCdd(d);
        const eddNow = d.risk_rating === 'High';
        setEddRequired(eddNow);
        await saveProgress(eddNow ? 4 : keyToPos('fatca'), {
            cdd_risk_rating: d.risk_rating, cdd_pep_declared: d.pep_declared,
            cdd_source_of_funds: d.source_of_funds, cdd_account_purpose: d.account_purpose,
            cdd_high_risk_country: d.high_risk_country, cdd_annual_income_band: d.annual_income_band,
            cdd_tx_volume_band: d.tx_volume_band, edd_required: eddNow,
        });
        setCurrentStep(eddNow ? 4 : keyToPos('fatca'));
    };

    const handleEDD = async (d: EDDData) => {
        setEdd(d);
        await saveProgress(keyToPos('fatca'));
        setCurrentStep(keyToPos('fatca'));
    };

    const handleFATCA = async (d: FATCACRSData) => {
        setFatca(d);
        await saveProgress(keyToPos('sanctions'), {
            fatca_us_person: d.us_person, fatca_tin: d.us_tin, crs_tax_countries: d.crs_countries,
            crs_tins: d.crs_tins, fatca_crs_declared_at: d.declared_at, fatca_status: d.fatca_status,
        });
        setCurrentStep(keyToPos('sanctions'));
    };

    const handleSanctions = async (d: SanctionsData) => {
        setSanctions(d);
        await saveProgress(keyToPos('review'), {
            sanctions_outcome: d.outcome, sanctions_score: d.score,
            account_number: d.account_number, sort_code: d.sort_code,
        });
        setCurrentStep(keyToPos('review'));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        await saveProgress(keyToPos('review'), { status: 'submitted' });
        setSubmitting(false);
        setSubmitted(true);
        if (typeof window !== 'undefined') localStorage.removeItem(RESUME_KEY);
    };

    const handleSaveLater = () => {
        if (resumeToken) {
            navigator.clipboard.writeText(`${window.location.origin}/onboarding?resume=${resumeToken}`)
                .then(() => toast.success('Resume link copied to clipboard!'))
                .catch(() => toast.info(`Resume token: ${resumeToken}`));
        } else {
            toast.info('Save your first step to generate a resume link');
        }
    };

    // ── Current step def ──
    const step = steps[currentStep - 1];

    // ── Aggregate wizard data for ReviewSubmit ──
    const wizardData = {
        fullName: personal.full_name, email: personal.email, dob: personal.date_of_birth,
        nationality: personal.nationality, countryOfResidence: personal.country_of_residence,
        taxResidenceCountry: personal.tax_residence_country, occupation: personal.occupation,
        employmentStatus: personal.employment_status, phone: personal.phone,
        kycDocType: ekyc.doc_type, kycStatus: ekyc.kyc_status, kycNameScore: ekyc.name_match_score,
        kycAuthScore: ekyc.auth_score, kycTamperFlag: ekyc.tamper_flag,
        cddRiskRating: cdd.risk_rating, cddPepDeclared: cdd.pep_declared,
        cddAnnualIncome: cdd.annual_income_band, cddTxVolume: cdd.tx_volume_band,
        cddSourceOfFunds: cdd.source_of_funds, cddHighRiskCountry: cdd.high_risk_country,
        eddNarrative: edd.wealth_narrative, eddCountry: edd.country_of_risk, eddNetWorth: edd.net_worth_band, eddThirdParty: edd.third_party_tx,
        fatcaUsPerson: fatca.us_person, fatcaTin: fatca.us_tin, fatcaStatus: fatca.fatca_status,
        crsCountries: fatca.crs_countries, fatcaDeclared: fatca.declared,
        sanctionsOutcome: sanctions.outcome, sanctionsScore: sanctions.score,
        accountNumber: sanctions.account_number, sortCode: sanctions.sort_code,
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Top bar */}
            <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-lg font-bold text-white">Digital Account Opening</h1>
                    <p className="text-[10px] text-slate-600">Regulated onboarding · Phase 4</p>
                </div>
                <button onClick={handleSaveLater} className="text-xs text-indigo-400 hover:text-indigo-300 border border-slate-800 rounded px-3 py-1.5 transition-colors">
                    Save & Continue Later
                </button>
            </header>

            {/* Resume banner */}
            {initialData?.updated_at && (
                <div className="px-6 py-2 bg-indigo-950/30 border-b border-indigo-900/30 text-xs text-indigo-400">
                    Resuming application · Last saved {fmtDateTime(initialData.updated_at)}
                </div>
            )}

            <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
                <StepIndicator steps={steps} current={currentStep} />

                {/* Step title */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {step?.label || 'Onboarding'}
                    </h2>
                    <p className="text-xs text-slate-600">Step {currentStep} of {steps.length}</p>
                </div>

                {/* Step content */}
                {step?.key === 'personal' && <PersonalDetailsStep data={personal} onNext={handlePersonal} />}
                {step?.key === 'ekyc' && appId && (
                    <EKYCStep applicationId={appId} fullName={personal.full_name!} dob={personal.date_of_birth!}
                        data={ekyc} onNext={handleEKYC} onBack={() => goTo(1)} />
                )}
                {step?.key === 'cdd' && <CDDStep data={cdd} onNext={handleCDD} onBack={() => goTo(2)} />}
                {step?.key === 'edd' && <EDDStep data={edd} onNext={handleEDD} onBack={() => goTo(3)} />}
                {step?.key === 'fatca' && (
                    <FATCACRSStep data={fatca} onNext={handleFATCA} onBack={() => goTo(eddRequired ? keyToPos('edd') : 3)} />
                )}
                {step?.key === 'sanctions' && appId && (
                    <SanctionsScreeningStep applicationId={appId} fullName={personal.full_name!}
                        nationality={personal.nationality!} data={sanctions} onNext={handleSanctions}
                        onBack={() => goTo(keyToPos('fatca'))} />
                )}
                {step?.key === 'review' && (
                    <ReviewSubmitStep wizardData={wizardData} eddRequired={eddRequired} submitting={submitting}
                        submitted={submitted} applicationId={appId || ''} onGoToStep={goTo} onSubmit={handleSubmit}
                        onBack={() => goTo(keyToPos('sanctions'))} />
                )}

                {/* Fallback for step 2 before appId exists */}
                {step?.key === 'ekyc' && !appId && (
                    <div className="p-6 bg-amber-950/30 border border-amber-700/40 rounded-xl text-amber-300 text-sm">
                        Please complete Step 1 first to generate your application record.
                        <button className="ml-3 underline" onClick={() => goTo(1)}>Go to Step 1</button>
                    </div>
                )}
            </div>
        </div>
    );
}
