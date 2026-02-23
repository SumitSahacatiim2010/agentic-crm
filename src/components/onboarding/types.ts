export type OnboardingState = {
    identity: {
        firstName: string;
        lastName: string;
        dob: string;
        gender: string;
        nationality: string;
        idType: string;
        idNumber: string;
        idDocument: File | null;
    };
    cdd: {
        sourceOfFunds: string;
        sourceOfWealth: string;
        occupation: string;
        employer: string;
        annualIncome: string;
        netWorth: string;
        purpose: string;
        eddNarrative?: string;
        eddDocument?: File | null;
        requiresEDD: boolean;
    };
    aml: {
        amlRiskRating: 'Low' | 'Medium' | 'High' | '';
        sanctionsMatch: boolean;
        sanctionsNearMatch: boolean;
        status: 'pending' | 'cleared' | 'review' | 'failed' | '';
    };
    products: {
        selected: string[];
        suitabilityScore: 'Conservative' | 'Moderate' | 'Aggressive' | '';
    };
    account: {
        agreedToTerms: boolean;
        signature: string;
        taxResidence: string;
        tin: string;
    };
};

export const initialOnboardingState: OnboardingState = {
    identity: { firstName: '', lastName: '', dob: '', gender: '', nationality: '', idType: '', idNumber: '', idDocument: null },
    cdd: { sourceOfFunds: '', sourceOfWealth: '', occupation: '', employer: '', annualIncome: '', netWorth: '', purpose: '', requiresEDD: false },
    aml: { amlRiskRating: '', sanctionsMatch: false, sanctionsNearMatch: false, status: '' },
    products: { selected: [], suitabilityScore: '' },
    account: { agreedToTerms: false, signature: '', taxResidence: '', tin: '' },
};
