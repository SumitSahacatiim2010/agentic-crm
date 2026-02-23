
export type ApplicationStatus = 'Pending Triage' | 'Underwriting' | 'Approved' | 'Declined' | 'More Info Needed';
export type RoutingPath = 'STP' | 'Standard' | 'Specialist';

export interface CreditApplication {
    id: string;
    applicantName: string;
    businessName?: string;
    loanAmount: number;
    purpose: string;
    submissionDate: string;
    status: ApplicationStatus;
    routing: RoutingPath;
    creditScore: number;
    riskRating: number; // 1 (Best) to 10 (Worst)
    assignedTo?: string;
}

export interface Financials {
    annualIncome: number;
    monthlyDebt: number;
    collateralValue: number;
    requestedLoan: number;
    // Calculated on fly, but storing base data here
}

export const MOCK_APPLICATIONS: CreditApplication[] = [
    {
        id: 'LN-2024-001',
        applicantName: 'Michael Scott',
        businessName: 'Paper Great Inc.',
        loanAmount: 50000,
        purpose: 'Working Capital',
        submissionDate: '2024-02-18',
        status: 'Pending Triage',
        routing: 'STP',
        creditScore: 780,
        riskRating: 2
    },
    {
        id: 'LN-2024-002',
        applicantName: 'Dwight Schrute',
        businessName: 'Beet Farms LLC',
        loanAmount: 1200000,
        purpose: 'Equipment Purchase',
        submissionDate: '2024-02-17',
        status: 'Underwriting',
        routing: 'Specialist',
        creditScore: 710,
        riskRating: 4,
        assignedTo: 'Jim Halpert'
    },
    {
        id: 'LN-2024-003',
        applicantName: 'Ryan Howard',
        businessName: 'WUPHF.com',
        loanAmount: 25000,
        purpose: 'Marketing',
        submissionDate: '2024-02-19',
        status: 'Declined',
        routing: 'Standard',
        creditScore: 580,
        riskRating: 8
    }
];
