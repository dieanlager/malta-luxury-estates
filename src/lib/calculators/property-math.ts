/**
 * PROPERTY MATH LIB - Malta 2026 Regulations
 * Logic central for all investment and tax calculations.
 */

export interface BuyingResult {
    stampDuty: number;
    notaryFees: number;
    searchFees: number;
    aipFee: number;
    totalAcquisitionCosts: number;
    totalInvestment: number;
    costPercentage: number;
}

export interface ROIResult {
    grossYearlyRent: number;
    netYearlyRent: number;
    yearlyExpenses: number;
    rentalTax: number;
    grossYield: number;
    netYield: number;
    paybackPeriodYears: number;
}

export interface SellingResult {
    sellingPrice: number;
    fwtTax: number;
    agentFee: number;
    netProceeds: number;
}

/**
 * Calculate Buying Costs
 */
export function calculateBuyingCosts(params: {
    price: number;
    isFirstTimeBuyer: boolean;
    isPrimaryResidence: boolean;
    isUCA: boolean; // Urban Conservation Area
    isGozo: boolean;
    needsAIP: boolean;
}): BuyingResult {
    const { price, isFirstTimeBuyer, isPrimaryResidence, isUCA, isGozo, needsAIP } = params;

    let stampDuty = 0;

    if (isUCA) {
        // UCA incentive: 0% on first 750k (typical 2025/2026 scheme)
        stampDuty = Math.max(0, price - 750000) * 0.05;
    } else if (isFirstTimeBuyer) {
        // First Time Buyer: 0% on first 200k, 5% on balance
        stampDuty = Math.max(0, price - 200000) * 0.05;
    } else if (isGozo) {
        // Gozo scheme (often 2% stamp duty)
        stampDuty = price * 0.02;
    } else if (isPrimaryResidence) {
        // Standard Primary: 3.5% on first 200k, 5% balance
        const firstTier = Math.min(price, 200000);
        const secondTier = Math.max(0, price - 200000);
        stampDuty = (firstTier * 0.035) + (secondTier * 0.05);
    } else {
        // Buy-to-let or 2nd home
        stampDuty = price * 0.05;
    }

    const notaryFees = price * 0.01 + 200; // 1% + base
    const searchFees = 600; // Average for 2026
    const aipFee = needsAIP ? 233 : 0;

    const totalAcquisitionCosts = stampDuty + (notaryFees * 1.18) + searchFees + aipFee; // Incl VAT on notary

    return {
        stampDuty,
        notaryFees: notaryFees * 1.18,
        searchFees,
        aipFee,
        totalAcquisitionCosts,
        totalInvestment: price + totalAcquisitionCosts,
        costPercentage: (totalAcquisitionCosts / price) * 100
    };
}

/**
 * Calculate Investment ROI
 */
export function calculateROI(params: {
    purchasePrice: number;
    buyingCosts: number;
    monthlyRent: number;
    monthlyExpenses: number;
    managementFeePercent: number;
}): ROIResult {
    const totalInvestment = params.purchasePrice + params.buyingCosts;
    const grossYearlyRent = params.monthlyRent * 12;

    // Rental Tax: 15% flat on gross in Malta
    const rentalTax = grossYearlyRent * 0.15;

    const managementFee = grossYearlyRent * (params.managementFeePercent / 100);
    const yearlyExpenses = (params.monthlyExpenses * 12) + managementFee;

    const netYearlyRent = grossYearlyRent - rentalTax - yearlyExpenses;

    const grossYield = (grossYearlyRent / totalInvestment) * 100;
    const netYield = (netYearlyRent / totalInvestment) * 100;
    const paybackPeriodYears = totalInvestment / netYearlyRent;

    return {
        grossYearlyRent,
        netYearlyRent,
        yearlyExpenses,
        rentalTax,
        grossYield,
        netYield,
        paybackPeriodYears
    };
}

/**
 * Calculate Selling Taxes
 */
export function calculateSellingProceeds(params: {
    price: number;
    acquisitionSystem: 'standard' | 'pre2004' | 'aip';
    isSoleResidence: boolean; // Exempt if lived for 3+ years
    agentFeePercent: number;
}): SellingResult {
    let fwtRate = 0.08;
    if (params.acquisitionSystem === 'pre2004') fwtRate = 0.05;
    if (params.acquisitionSystem === 'aip') fwtRate = 0.12;

    // Tax is 0 if it was the sole residence for 3+ years
    const fwtTax = params.isSoleResidence ? 0 : (params.price * fwtRate);
    const agentFee = params.price * (params.agentFeePercent / 100) * 1.18; // Incl VAT

    return {
        sellingPrice: params.price,
        fwtTax,
        agentFee,
        netProceeds: params.price - fwtTax - agentFee
    };
}
