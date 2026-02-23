
export const OCCUPATIONS = [
    { id: 'eng', label: 'Engineer', risk: 'Low' },
    { id: 'tchr', label: 'Teacher', risk: 'Low' },
    { id: 'law', label: 'Lawyer', risk: 'Medium' },
    { id: 'cas', label: 'Casino/Gambling', risk: 'High' },
    { id: 'jewel', label: 'Precious Metals Dealer', risk: 'High' },
    { id: 'def', label: 'Defense Contractor', risk: 'High' }
];

export const SOURCE_OF_FUNDS = [
    'Salary/Employment',
    'Business Profits',
    'Inheritance',
    'Investment Returns',
    'Gift',
    'Other'
];

export const SANCTIONS_HITS = [
    {
        id: 'HIT-001',
        list: 'OFAC SDN',
        match_score: 98,
        entity_name: 'ALEXANDER STERLING',
        matched_term: 'ALEXANDER V. STERLING',
        status: 'False Positive',
        resolution_required: true
    },
    {
        id: 'HIT-002',
        list: 'UN CONSOLIDATED',
        match_score: 75,
        entity_name: 'ALEX STERLING LTD',
        matched_term: 'STERLING',
        status: 'Review Needed',
        resolution_required: true
    }
];
