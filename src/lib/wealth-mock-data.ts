
export type AssetClass = 'Equity' | 'Fixed Income' | 'Cash' | 'Alternative' | 'Real Estate';

export interface Holding {
    id: string;
    symbol: string;
    name: string;
    assetClass: AssetClass;
    quantity: number;
    avgCost: number;
    currentPrice: number;
    currency: 'USD' | 'EUR' | 'GBP';
    unrealizedPL: number;
    plPercent: number;
    weight: number;
}

export interface PortfolioSummary {
    totalAUM: number;
    currency: string;
    ytdReturn: number;
    riskScore: number;
    investmentObjective: string;
    investorClassification: 'Retail' | 'Accredited' | 'High-Net-Worth' | 'Ultra-High-Net-Worth';
}

export interface DriftRecord {
    assetClass: AssetClass;
    target: number;
    actual: number;
    drift: number; // Percent difference
    isBreach: boolean;
}

export const MOCK_SUMMARY: PortfolioSummary = {
    totalAUM: 5240000,
    currency: 'USD',
    ytdReturn: 8.4,
    riskScore: 65,
    investmentObjective: "Growth & Preservation",
    investorClassification: "Ultra-High-Net-Worth"
};

export const MOCK_HOLDINGS: Holding[] = [
    { id: '1', symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'Equity', quantity: 1500, avgCost: 145.20, currentPrice: 182.50, currency: 'USD', unrealizedPL: 55950, plPercent: 25.69, weight: 5.2 },
    { id: '2', symbol: 'MSFT', name: 'Microsoft Corp.', assetClass: 'Equity', quantity: 800, avgCost: 280.00, currentPrice: 315.40, currency: 'USD', unrealizedPL: 28320, plPercent: 12.64, weight: 4.8 },
    { id: '3', symbol: 'VTI', name: 'Vanguard Total Stock Market', assetClass: 'Equity', quantity: 5000, avgCost: 205.00, currentPrice: 228.10, currency: 'USD', unrealizedPL: 115500, plPercent: 11.27, weight: 21.7 },
    { id: '4', symbol: 'BND', name: 'Vanguard Total Bond Market', assetClass: 'Fixed Income', quantity: 12000, avgCost: 78.50, currentPrice: 72.30, currency: 'USD', unrealizedPL: -74400, plPercent: -7.90, weight: 16.5 },
    { id: '5', symbol: 'GLD', name: 'SPDR Gold Shares', assetClass: 'Alternative', quantity: 1000, avgCost: 170.00, currentPrice: 195.20, currency: 'USD', unrealizedPL: 25200, plPercent: 14.82, weight: 3.7 },
    { id: '6', symbol: 'CASH', name: 'USD Sweep Account', assetClass: 'Cash', quantity: 245000, avgCost: 1.00, currentPrice: 1.00, currency: 'USD', unrealizedPL: 0, plPercent: 0, weight: 4.6 }
];

export const DRIFT_ANALYSIS: DriftRecord[] = [
    { assetClass: 'Equity', target: 55, actual: 62.5, drift: 7.5, isBreach: true },
    { assetClass: 'Fixed Income', target: 35, actual: 29.5, drift: -5.5, isBreach: true },
    { assetClass: 'Alternatives', target: 5, actual: 3.7, drift: -1.3, isBreach: false },
    { assetClass: 'Cash', target: 5, actual: 4.3, drift: -0.7, isBreach: false }
] as DriftRecord[]; // Casting to allow 'Alternatives' string mismatch adjustment if needed, but keeping simple

export const PERFORMANCE_DATA = [
    { date: 'Jan', portfolio: 2.1, benchmark: 1.8 },
    { date: 'Feb', portfolio: 3.5, benchmark: 2.9 },
    { date: 'Mar', portfolio: 2.8, benchmark: 3.1 },
    { date: 'Apr', portfolio: 4.2, benchmark: 3.8 },
    { date: 'May', portfolio: 5.1, benchmark: 4.5 },
    { date: 'Jun', portfolio: 4.8, benchmark: 5.2 },
    { date: 'Jul', portfolio: 6.5, benchmark: 5.9 },
    { date: 'Aug', portfolio: 7.2, benchmark: 6.4 },
    { date: 'Sep', portfolio: 6.8, benchmark: 6.1 },
    { date: 'Oct', portfolio: 8.4, benchmark: 7.2 }
];
