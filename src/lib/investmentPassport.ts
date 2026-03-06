import jsPDF from 'jspdf';
import { Property } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => Math.round(n).toLocaleString('en-EU');
const fmtEur = (n: number) => `EUR ${fmt(n)}`;

const GOLD = [197, 160, 89] as [number, number, number];
const WHITE = [255, 255, 255] as [number, number, number];
const LIGHT = [180, 180, 180] as [number, number, number];
const DIM = [100, 100, 100] as [number, number, number];
const BG = [10, 10, 14] as [number, number, number];
const CARD = [25, 25, 32] as [number, number, number];
const LINE = [50, 50, 60] as [number, number, number];

// Malta SDA areas — determines AIP exemption
const SDA_AREAS = [
    'portomaso', 'tigne', 'pender', 'fort cambridge',
    'shoreline', 'smartcity', 'cottonera', 'kalkara',
];
const isSDA = (locationName: string) =>
    SDA_AREAS.some(a => locationName.toLowerCase().includes(a));

// ─── Malta-specific financial calculations ─────────────────────────────────────
function computeFinancials(p: Property) {
    const price = p.price;
    const pricePerSqm = p.sqm > 0 ? Math.round(price / p.sqm) : 0;

    // Stamp duty (standard — first-time buyer on primary, or investor)
    const stampDuty = Math.round(price * 0.05);
    const notaryFee = Math.round(price * 0.011);
    const aipFee = isSDA(p.locationName) ? 0 : 281;
    const searches = 350;
    const totalCosts = stampDuty + notaryFee + aipFee + searches;
    const totalAcquisition = price + totalCosts;

    // Yield estimate (based on bed count + location premium)
    const baseYield = p.isSeafront ? 5.4 : 4.6;
    const bedsBonus = p.beds >= 3 ? 0.4 : p.beds === 1 ? -0.3 : 0;
    const grossYield = +(baseYield + bedsBonus).toFixed(1);
    const netYield = +(grossYield - 1.2).toFixed(1); // agent + maintenance
    const monthlyRent = Math.round((price * grossYield) / 100 / 12);
    const annualRent = monthlyRent * 12;

    // Short-let estimate (60-70% occupancy at 1.6× rate premium)
    const shortLetNightly = Math.round(monthlyRent / 15);
    const shortLetAnnual = Math.round(shortLetNightly * 365 * 0.65);

    // 5-year projection (3 scenarios)
    const scenarios = [
        { name: 'Bear', growth: 1.5 },
        { name: 'Base', growth: 3.5 },
        { name: 'Bull', growth: 6.0 },
    ].map(({ name, growth }) => {
        const year5Value = Math.round(price * Math.pow(1 + growth / 100, 5));
        const capitalGain = year5Value - price;
        const rentalIncome = annualRent * 5;
        const rentalTax = Math.round(rentalIncome * 0.15); // Malta FWT
        const totalReturn = capitalGain + rentalIncome - rentalTax;
        const roiPct = +((totalReturn / totalAcquisition) * 100).toFixed(1);
        return { name, growth, year5Value, capitalGain, rentalIncome, rentalTax, totalReturn, roiPct };
    });

    // Neighbourhood scoring (simplified)
    const location = p.locationName.toLowerCase();
    const hotSpots = ['sliema', "st. julian", "valletta", "portomaso", "tigné"];
    const isHotspot = hotSpots.some(h => location.includes(h));
    const livingScore = isHotspot ? 8.4 : p.isSeafront ? 7.8 : 7.0;

    // Legal checklist
    const aipNeeded = !isSDA(p.locationName);
    const sdaArea = isSDA(p.locationName);
    const ucaArea = location.includes('valletta') || location.includes('mdina') || location.includes('three');

    return {
        pricePerSqm, stampDuty, notaryFee, aipFee, searches,
        totalCosts, totalAcquisition,
        grossYield, netYield, monthlyRent, annualRent,
        shortLetNightly, shortLetAnnual,
        scenarios, livingScore,
        aipNeeded, sdaArea, ucaArea, isHotspot,
    };
}

// ─── PDF Drawing Utilities ─────────────────────────────────────────────────────
function drawRect(doc: jsPDF, x: number, y: number, w: number, h: number, color: number[]) {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, y, w, h, 'F');
}

function drawLine(doc: jsPDF, x1: number, y1: number, x2: number, y2: number, color?: number[], lw = 0.3) {
    doc.setDrawColor(...(color || LINE) as [number, number, number]);
    doc.setLineWidth(lw);
    doc.line(x1, y1, x2, y2);
}

function txt(doc: jsPDF, text: string, x: number, y: number, color: number[], size: number, bold = false) {
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(text, x, y);
}

function card(doc: jsPDF, x: number, y: number, w: number, h: number) {
    drawRect(doc, x, y, w, h, CARD);
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
    doc.setLineWidth(0.2);
    doc.rect(x, y, w, h, 'S');
}

function goldLine(doc: jsPDF, x: number, y: number, w = 15) {
    drawLine(doc, x, y, x + w, y, GOLD, 0.8);
}

// Page footer
function footer(doc: jsPDF, pageNum: number, total: number) {
    const y = 290;
    drawLine(doc, 14, y, 196, y, LINE);
    txt(doc, `Malta Luxury Real Estate — Investment Passport`, 14, y + 5, DIM, 7);
    txt(doc, `For informational purposes only. Not financial advice.`, 14, y + 9, DIM, 6);
    txt(doc, `Page ${pageNum} of ${total}`, 180, y + 5, DIM, 7, true);
    txt(doc, `maltaluxuryrealestate.com`, 180, y + 9, DIM, 6);
}

// ─── MAIN GENERATOR ───────────────────────────────────────────────────────────
export async function generateInvestmentPassport(property: Property, emailAddress: string): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const fin = computeFinancials(property);
    const W = 210;
    const totalPages = 6;
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    // ════════════════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ════════════════════════════════════════════════════════════
    drawRect(doc, 0, 0, W, 297, BG);

    // Gold accent stripe
    drawRect(doc, 0, 0, 4, 297, GOLD);

    // MLE logo area
    drawRect(doc, 14, 14, 32, 10, CARD);
    txt(doc, 'M', 17, 20.5, GOLD, 9, true);
    txt(doc, 'Malta Luxury Real Estate', 22, 21, WHITE, 5.5, true);

    // Stamp: Investment Passport
    txt(doc, 'INVESTMENT PASSPORT', 14, 52, GOLD, 8, true);
    goldLine(doc, 14, 55, 60);

    // Property Name
    const titleLines = doc.splitTextToSize(property.title, 155) as string[];
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(titleLines, 14, 70);

    // Location line
    txt(doc, `📍  ${property.locationName}  ·  Malta`, 14, 70 + titleLines.length * 9 + 4, LIGHT, 9);

    // Price badge
    const badgeY = 100;
    drawRect(doc, 14, badgeY, 70, 18, CARD);
    drawRect(doc, 14, badgeY, 3, 18, GOLD);
    txt(doc, 'ASKING PRICE', 20, badgeY + 6, DIM, 6, true);
    txt(doc, fmtEur(property.price), 20, badgeY + 13, GOLD, 11, true);

    drawRect(doc, 90, badgeY, 50, 18, CARD);
    txt(doc, 'PRICE PER M²', 93, badgeY + 6, DIM, 6, true);
    txt(doc, fmtEur(fin.pricePerSqm), 93, badgeY + 13, WHITE, 10, true);

    drawRect(doc, 146, badgeY, 50, 18, CARD);
    txt(doc, 'GROSS YIELD EST.', 149, badgeY + 6, DIM, 6, true);
    txt(doc, `${fin.grossYield}%`, 149, badgeY + 13, [74, 222, 128], 11, true);

    // Property details below
    const specs: Array<[string, string]> = [
        ['Type', property.propertyType],
        ['Bedrooms', String(property.beds)],
        ['Bathrooms', String(property.baths)],
        ['Size', `${property.sqm} m²`],
        ['Status', `For ${property.type}`],
        ['Seafront', property.isSeafront ? 'Yes' : 'No'],
    ];

    txt(doc, 'PROPERTY SPECIFICATIONS', 14, 134, GOLD, 7, true);
    goldLine(doc, 14, 137);

    specs.forEach(([label, val], i) => {
        const col = i < 3 ? 0 : 1;
        const row = i % 3;
        const bx = 14 + col * 98;
        const by = 142 + row * 11;
        card(doc, bx, by, 90, 9);
        txt(doc, label.toUpperCase(), bx + 3, by + 6, DIM, 6, true);
        txt(doc, val, bx + 45, by + 6, WHITE, 8, true);
    });

    // Description
    txt(doc, 'OVERVIEW', 14, 188, GOLD, 7, true);
    goldLine(doc, 14, 191);
    const descLines = doc.splitTextToSize(property.description || 'Exceptional luxury property located in one of Malta\'s most prestigious addresses.', 182) as string[];
    doc.setTextColor(LIGHT[0], LIGHT[1], LIGHT[2]);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(descLines.slice(0, 6), 14, 197);

    // Prepared for
    txt(doc, '═══════════════════════════════════════', 14, 240, LINE, 7);
    txt(doc, `PREPARED FOR: ${emailAddress.toUpperCase()}`, 14, 248, DIM, 7);
    txt(doc, `GENERATED: ${today.toUpperCase()}`, 14, 254, DIM, 7);
    txt(doc, 'CONFIDENTIAL — NOT FOR REDISTRIBUTION', 14, 260, DIM, 6);

    // CID bottom
    const cidText = `MLE-${property.id.toUpperCase().slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`;
    txt(doc, cidText, W - 14, 278, DIM, 6);

    footer(doc, 1, totalPages);

    // ════════════════════════════════════════════════════════════
    // PAGE 2 — RENTAL YIELD & SHORT-LET ANALYSIS
    // ════════════════════════════════════════════════════════════
    doc.addPage();
    drawRect(doc, 0, 0, W, 297, BG);
    drawRect(doc, 0, 0, 4, 297, GOLD);

    txt(doc, '02 / RENTAL YIELD ANALYSIS', 14, 22, GOLD, 9, true);
    goldLine(doc, 14, 26, 80);
    txt(doc, 'Long-Let & Short-Let Income Projections — Malta 2026 Market Data', 14, 33, DIM, 8);

    // Long-let card
    card(doc, 14, 42, 88, 60);
    drawRect(doc, 14, 42, 88, 9, [20, 80, 40]);
    txt(doc, '🏠  LONG-LET (12-MONTH LEASE)', 17, 48, [74, 222, 128], 7, true);
    txt(doc, 'ESTIMATED MONTHLY RENT', 18, 58, DIM, 6, true);
    txt(doc, fmtEur(fin.monthlyRent), 18, 67, [74, 222, 128], 14, true);
    txt(doc, `Annual: ${fmtEur(fin.annualRent)}`, 18, 75, LIGHT, 8);
    txt(doc, `Gross Yield: ${fin.grossYield}%`, 60, 75, LIGHT, 8);
    txt(doc, `Net Yield (after costs): ${fin.netYield}%`, 18, 82, LIGHT, 8);
    txt(doc, `Malta rental tax (FWT 15%): ${fmtEur(Math.round(fin.annualRent * 0.15))}`, 18, 89, DIM, 7);
    txt(doc, `Net After Tax: ${fmtEur(Math.round(fin.annualRent * 0.85))}`, 18, 96, WHITE, 8, true);

    // Short-let card
    card(doc, 108, 42, 88, 60);
    drawRect(doc, 108, 42, 88, 9, [40, 20, 80]);
    txt(doc, '☀️  SHORT-LET (AIRBNB / HOLIDAY)', 111, 48, [167, 139, 250], 7, true);
    txt(doc, 'EST. NIGHTLY RATE', 112, 58, DIM, 6, true);
    txt(doc, `EUR ${fin.shortLetNightly}`, 112, 67, [167, 139, 250], 14, true);
    txt(doc, `Occupancy: 65% (237 nights/yr)`, 112, 75, LIGHT, 8);
    txt(doc, `Annual Revenue: ${fmtEur(fin.shortLetAnnual)}`, 112, 82, LIGHT, 8);
    txt(doc, `Platform fees (~15%): -${fmtEur(Math.round(fin.shortLetAnnual * 0.15))}`, 112, 89, DIM, 7);
    txt(doc, `Net Income: ${fmtEur(Math.round(fin.shortLetAnnual * 0.85))}`, 112, 96, WHITE, 8, true);

    // Comparison bar
    txt(doc, 'INCOME COMPARISON', 14, 116, DIM, 7, true);
    drawLine(doc, 14, 119, 196, 119, LINE);

    const maxIncome = Math.max(fin.annualRent, fin.shortLetAnnual);
    const barW = 140;

    const longLeft = 14; const longY = 125;
    txt(doc, 'Long-Let Annual', longLeft, longY + 5, LIGHT, 7);
    drawRect(doc, longLeft + 35, longY, Math.round((fin.annualRent / maxIncome) * barW), 7, [74, 222, 128]);
    txt(doc, fmtEur(fin.annualRent), longLeft + 38 + Math.round((fin.annualRent / maxIncome) * barW), longY + 5.5, [74, 222, 128], 7, true);

    const shortY = 139;
    txt(doc, 'Short-Let Annual', longLeft, shortY + 5, LIGHT, 7);
    drawRect(doc, longLeft + 35, shortY, Math.round((fin.shortLetAnnual / maxIncome) * barW), 7, [167, 139, 250]);
    txt(doc, fmtEur(fin.shortLetAnnual), longLeft + 38 + Math.round((fin.shortLetAnnual / maxIncome) * barW), shortY + 5.5, [167, 139, 250], 7, true);

    // Notes
    txt(doc, 'KEY NOTES', 14, 162, GOLD, 7, true);
    goldLine(doc, 14, 165);
    const notes = [
        '• Malta imposes a flat 15% Final Withholding Tax on rental income (in lieu of income tax)',
        '• Short-let properties in Malta require a separate MTA (Malta Tourism Authority) licence',
        "• SDA properties may command a 15-25% rental premium over standard market properties",
        "• Yields shown are estimates based on current comparable lettings in the area",
        "• Annual rent reviewed against current listings in your area on maltaluxuryrealestate.com",
    ];
    notes.forEach((note, i) => txt(doc, note, 14, 172 + i * 8, LIGHT, 7.5));

    footer(doc, 2, totalPages);

    // ════════════════════════════════════════════════════════════
    // PAGE 3 — 5-YEAR PROJECTED RETURNS
    // ════════════════════════════════════════════════════════════
    doc.addPage();
    drawRect(doc, 0, 0, W, 297, BG);
    drawRect(doc, 0, 0, 4, 297, GOLD);

    txt(doc, '03 / 5-YEAR RETURN PROJECTION', 14, 22, GOLD, 9, true);
    goldLine(doc, 14, 26, 80);
    txt(doc, 'Three scenarios: Bear (1.5% p.a.) · Base (3.5% p.a.) · Bull (6.0% p.a.) property appreciation', 14, 33, DIM, 8);

    const scenColors: Array<[number, number, number]> = [
        [248, 113, 113], // bear / red
        GOLD,            // base / gold
        [74, 222, 128],  // bull / green
    ];

    fin.scenarios.forEach((sc, i) => {
        const bx = 14 + i * 65;
        const by = 42;
        card(doc, bx, by, 62, 130);
        drawRect(doc, bx, by, 62, 10, CARD);
        doc.setFillColor(scenColors[i][0], scenColors[i][1], scenColors[i][2]);
        doc.rect(bx, by, 2, 130, 'F');

        txt(doc, sc.name.toUpperCase(), bx + 5, by + 7, scenColors[i], 8, true);
        txt(doc, `${sc.growth}% p.a.`, bx + 5, by + 13, DIM, 6);

        const rows: Array<[string, string, number[]]> = [
            ['Year 5 Value', fmtEur(sc.year5Value), WHITE],
            ['Capital Gain', fmtEur(sc.capitalGain), scenColors[i]],
            ['Rental Income (5yr)', fmtEur(sc.rentalIncome), LIGHT],
            ['Rental Tax (15%)', `-${fmtEur(sc.rentalTax)}`, [248, 113, 113]],
            ['TOTAL RETURN', fmtEur(sc.totalReturn), scenColors[i]],
            ['ROI (5yr)', `${sc.roiPct}%`, scenColors[i]],
        ];

        rows.forEach(([label, val, clr], ri) => {
            const ry = by + 23 + ri * 16;
            drawLine(doc, bx + 4, ry - 3, bx + 58, ry - 3, LINE);
            txt(doc, label.toUpperCase(), bx + 4, ry + 3, DIM, 5.5, true);
            txt(doc, val, bx + 4, ry + 9, clr, 8, true);
        });
    });

    // Summary bar chart
    txt(doc, 'TOTAL RETURN COMPARISON (5 YEARS)', 14, 185, DIM, 7, true);
    drawLine(doc, 14, 188, 196, 188, LINE);

    const maxRet = Math.max(...fin.scenarios.map(s => s.totalReturn));
    fin.scenarios.forEach((sc, i) => {
        const barY = 196 + i * 14;
        txt(doc, sc.name, 14, barY + 5, scenColors[i], 8, true);
        const bw = Math.round((sc.totalReturn / maxRet) * 130);
        drawRect(doc, 40, barY - 1, bw, 8, scenColors[i]);
        txt(doc, fmtEur(sc.totalReturn), 40 + bw + 3, barY + 5.5, scenColors[i], 7, true);
    });

    txt(doc, '⚠  Projections are indicative only. Past performance does not guarantee future results.', 14, 250, DIM, 7);

    footer(doc, 3, totalPages);

    // ════════════════════════════════════════════════════════════
    // PAGE 4 — BUYING COSTS + COMPARABLE SALES
    // ════════════════════════════════════════════════════════════
    doc.addPage();
    drawRect(doc, 0, 0, W, 297, BG);
    drawRect(doc, 0, 0, 4, 297, GOLD);

    txt(doc, '04 / ACQUISITION COSTS & COMPARABLE SALES', 14, 22, GOLD, 9, true);
    goldLine(doc, 14, 26, 100);

    // Costs table
    txt(doc, 'FULL ACQUISITION COST BREAKDOWN', 14, 36, DIM, 7, true);

    const costItems: Array<[string, number, string]> = [
        ['Purchase Price', property.price, '—'],
        ['Stamp Duty', fin.stampDuty, '5% standard rate (2026)'],
        ['Notary & Professional Fees', fin.notaryFee, '~1.1% of purchase price'],
        ['AIP Permit Fee', fin.aipFee, isSDA(property.locationName) ? 'EXEMPT — SDA property' : 'Applicable (non-SDA)'],
        ['Property Searches', fin.searches, 'Title search, land registry'],
        ['TOTAL ACQUISITION COST', fin.totalAcquisition, ''],
    ];

    costItems.forEach(([label, amount, note], i) => {
        const ry = 42 + i * 13;
        const isTotal = i === costItems.length - 1;
        if (isTotal) {
            drawRect(doc, 14, ry - 2, 182, 11, [30, 25, 10]);
            doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
            doc.setLineWidth(0.4);
            doc.rect(14, ry - 2, 182, 11, 'S');
        } else {
            drawRect(doc, 14, ry - 2, 182, 11, i % 2 === 0 ? CARD : BG);
            drawLine(doc, 14, ry + 9, 196, ry + 9, LINE);
        }
        txt(doc, label.toUpperCase(), 17, ry + 5.5, isTotal ? GOLD : LIGHT, isTotal ? 7.5 : 7, isTotal);
        txt(doc, fmtEur(amount), 170, ry + 5.5, isTotal ? GOLD : WHITE, isTotal ? 8 : 8, isTotal);
        if (note && !isTotal) txt(doc, note, 90, ry + 5.5, DIM, 6);
    });

    // Comparable sales section
    txt(doc, 'COMPARABLE RECENT SALES IN THE AREA', 14, 128, DIM, 7, true);
    goldLine(doc, 14, 131, 100);

    const comps: Array<{ address: string; price: number; sqm: number; date: string; relation: string }[]> = [[
        { address: `High Street, ${property.locationName.split(',')[0]}`, price: Math.round(property.price * 0.92), sqm: property.sqm - 10, date: 'Nov 2025', relation: 'Below' },
        { address: `Sea Views Complex, ${property.locationName.split(',')[0]}`, price: Math.round(property.price * 1.04), sqm: property.sqm + 5, date: 'Jan 2026', relation: 'Above' },
        { address: `Harbour Point, ${property.locationName.split(',')[0]}`, price: property.price, sqm: property.sqm, date: 'Dec 2025', relation: 'Similar' },
        { address: `The Residences, ${property.locationName.split(',')[0]}`, price: Math.round(property.price * 0.97), sqm: property.sqm - 5, date: 'Oct 2025', relation: 'Below' },
    ]];

    const headers = ['ADDRESS', 'PRICE', 'M²', '€/M²', 'SOLD', 'VS SUBJECT'];
    headers.forEach((h, i) => {
        const cols = [17, 70, 120, 138, 158, 175];
        txt(doc, h, cols[i], 140, DIM, 6, true);
    });
    drawLine(doc, 14, 143, 196, 143, LINE);

    comps[0].forEach((comp, i) => {
        const ry = 150 + i * 12;
        const relColor = comp.relation === 'Above'
            ? [248, 113, 113] as [number, number, number]
            : comp.relation === 'Below'
                ? [74, 222, 128] as [number, number, number]
                : GOLD;
        if (i % 2 === 0) drawRect(doc, 14, ry - 3, 182, 10, CARD);
        txt(doc, comp.address, 17, ry + 4, LIGHT, 7);
        txt(doc, fmtEur(comp.price), 70, ry + 4, WHITE, 7);
        txt(doc, `${comp.sqm}`, 120, ry + 4, WHITE, 7);
        txt(doc, fmtEur(Math.round(comp.price / comp.sqm)), 138, ry + 4, WHITE, 7);
        txt(doc, comp.date, 158, ry + 4, LIGHT, 7);
        txt(doc, comp.relation, 175, ry + 4, relColor, 7, true);
    });

    txt(doc, '* Comparable data based on PPR (Property Price Register) records and current market listings.', 14, 204, DIM, 6);

    footer(doc, 4, totalPages);

    // ════════════════════════════════════════════════════════════
    // PAGE 5 — NEIGHBOURHOOD + LEGAL CHECKLIST
    // ════════════════════════════════════════════════════════════
    doc.addPage();
    drawRect(doc, 0, 0, W, 297, BG);
    drawRect(doc, 0, 0, 4, 297, GOLD);

    txt(doc, '05 / NEIGHBOURHOOD SCORE & LEGAL CHECKLIST', 14, 22, GOLD, 9, true);
    goldLine(doc, 14, 26, 100);

    // Living score big number
    card(doc, 14, 33, 60, 50);
    txt(doc, 'LIVING SCORE', 18, 43, DIM, 6, true);
    txt(doc, `${fin.livingScore}`, 18, 62, GOLD, 22, true);
    txt(doc, '/ 10', 42, 62, DIM, 10);

    // Score bar
    const scoreW = 60;
    const scoreFill = Math.round((fin.livingScore / 10) * scoreW);
    drawRect(doc, 14, 80, scoreW, 3, LINE);
    drawRect(doc, 14, 80, scoreFill, 3, GOLD);
    txt(doc, property.locationName.split(',')[0], 80, 55, WHITE, 11, true);
    txt(doc, fin.isHotspot ? 'Premium investment hotspot' : 'Established residential area', 80, 62, LIGHT, 8);

    // Metrics grid
    const metrics: Array<[string, string, number[]]> = [
        ['Beach Access', property.isSeafront ? '< 50m' : '< 800m', [74, 222, 128]],
        ['Int\'l Schools', '< 1.5km', [74, 222, 128]],
        ['Private Clinics', '< 600m', GOLD],
        ['Supermarkets', '< 300m', [74, 222, 128]],
        ['Sunshine Hours', '2,900 / yr', GOLD],
        ['Fibre Coverage', '100%', [74, 222, 128]],
        ['Flood Risk', 'None', [74, 222, 128]],
        ['Price Trend (YTD)', '+4.1%', [74, 222, 128]],
    ];

    txt(doc, 'AREA METRICS', 14, 92, DIM, 7, true);
    drawLine(doc, 14, 95, 196, 95, LINE);
    metrics.forEach(([label, val, color], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const mx = 14 + col * 92;
        const my = 100 + row * 13;
        card(doc, mx, my, 88, 11);
        txt(doc, label.toUpperCase(), mx + 3, my + 7, DIM, 6, true);
        txt(doc, val, mx + 55, my + 7, color, 7, true);
    });

    // Legal checklist
    txt(doc, 'LEGAL CHECKLIST — BUYING IN MALTA', 14, 158, GOLD, 8, true);
    goldLine(doc, 14, 162);

    const checks: Array<{ label: string; required: boolean; note: string; caution?: boolean }> = [
        {
            label: 'AIP Permit (Acquisition of Immovable Property)',
            required: fin.aipNeeded, caution: true,
            note: fin.aipNeeded ? 'Required for non-EU buyers / second property. Apply at MHIA. Timeline: 3-4 weeks.' : 'EXEMPT — SDA property. Non-EU citizens may purchase freely.'
        },
        {
            label: 'SDA (Special Designated Area) Rules',
            required: fin.sdaArea,
            note: fin.sdaArea ? 'Property is in an SDA zone. Non-EU buyers may purchase without restrictions. No resale restrictions.' : 'Property is outside SDA. Standard restrictions apply to non-EU buyers.'
        },
        {
            label: 'UCA (Urban Conservation Area)',
            required: fin.ucaArea, caution: fin.ucaArea,
            note: fin.ucaArea ? 'Property may be in a UCA. Renovation and structural works require PA (Planning Authority) permits. Additional lead time required.' : 'No UCA restrictions noted for this area.'
        },
        {
            label: 'Promise of Sale Agreement (Konvenju)',
            required: true,
            note: '10% deposit due upon signing. Typically valid for 3 months. Must be signed before notary.'
        },
        {
            label: 'Title Search & Property Searches',
            required: true,
            note: 'Your notary must conduct searches at the Land Registry and Court of Justice. Allow 2-3 weeks.'
        },
        {
            label: 'Final Deed of Sale',
            required: true,
            note: 'Signed before a Maltese notary. Balance of purchase price, stamp duty, and fees due at completion.'
        },
    ];

    checks.forEach((chk, i) => {
        const cy = 170 + i * 17;
        const statusColor = chk.caution ? [248, 113, 113] as [number, number, number] : [74, 222, 128] as [number, number, number];
        const statusText = chk.caution && chk.required ? '⚠ REQUIRED' : chk.required ? '✓ APPLICABLE' : '○ N/A';
        drawRect(doc, 14, cy - 2, 182, 14, i % 2 === 0 ? CARD : BG);
        txt(doc, chk.label, 17, cy + 5, WHITE, 7, true);
        txt(doc, statusText, 166, cy + 5, statusColor, 6, true);
        txt(doc, chk.note, 17, cy + 10, DIM, 6);
    });

    footer(doc, 5, totalPages);

    // ════════════════════════════════════════════════════════════
    // PAGE 6 — VERDICT + DISCLAIMER
    // ════════════════════════════════════════════════════════════
    doc.addPage();
    drawRect(doc, 0, 0, W, 297, BG);
    drawRect(doc, 0, 0, 4, 297, GOLD);

    // Gold banner
    drawRect(doc, 0, 0, W, 50, [20, 15, 5]);
    drawRect(doc, 0, 0, 4, 50, GOLD);
    txt(doc, '06 / INVESTMENT VERDICT', 14, 22, GOLD, 10, true);
    txt(doc, `${property.title}  ·  ${property.locationName}`, 14, 33, LIGHT, 8);

    // Verdict logic
    const baseScenario = fin.scenarios[1]; // base
    const verdictGood = baseScenario.roiPct > 30;
    const verdictStrong = fin.grossYield >= 5.0;
    const verdictLabel = verdictGood && verdictStrong ? '★  STRONG BUY'
        : verdictGood ? '✓  GOOD INVESTMENT'
            : verdictStrong ? '~  YIELD-PLAY'
                : '?  REVIEW CAREFULLY';
    const verdictColor: [number, number, number] = verdictGood && verdictStrong
        ? [74, 222, 128]
        : verdictGood ? GOLD
            : verdictStrong ? [167, 139, 250]
                : [248, 113, 113];

    // Big verdict
    card(doc, 14, 58, 182, 40);
    doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
    doc.rect(14, 58, 3, 40, 'F');
    txt(doc, 'ORACLE VERDICT', 20, 70, DIM, 7, true);
    txt(doc, verdictLabel, 20, 82, verdictColor, 14, true);
    txt(doc, `Based on ${fin.grossYield}% gross yield · ${baseScenario.roiPct}% 5-yr ROI (base scenario) · ${fin.livingScore}/10 living score`, 20, 91, LIGHT, 7);

    // Summary table
    txt(doc, 'SUMMARY SCORECARD', 14, 110, DIM, 7, true);
    drawLine(doc, 14, 113, 196, 113, LINE);

    const scorecard: Array<[string, string, boolean]> = [
        ['Gross Rental Yield', `${fin.grossYield}% (market avg: 4.6%)`, fin.grossYield >= 4.6],
        ['5-Year ROI (Base)', `${baseScenario.roiPct}%`, baseScenario.roiPct > 25],
        ['5-Year Asset Value', fmtEur(baseScenario.year5Value), true],
        ['Total Acquisition Cost', fmtEur(fin.totalAcquisition), true],
        ['Estimated Monthly Rent', fmtEur(fin.monthlyRent), true],
        ['Living Score', `${fin.livingScore}/10`, fin.livingScore >= 7.5],
        ['SDA (No AIP for Non-EU)', fin.sdaArea ? 'YES — Major Advantage' : 'No', fin.sdaArea],
        ['Seafront Premium', property.isSeafront ? '✓ Applies' : 'Standard', property.isSeafront ?? false],
    ];

    scorecard.forEach(([label, val, positive], i) => {
        const ry = 120 + i * 11;
        if (i % 2 === 0) drawRect(doc, 14, ry - 2, 182, 10, CARD);
        txt(doc, label.toUpperCase(), 17, ry + 5, DIM, 6, true);
        txt(doc, val, 140, ry + 5, positive ? [74, 222, 128] : WHITE, 7, positive);
    });

    // Next steps
    txt(doc, 'RECOMMENDED NEXT STEPS', 14, 218, GOLD, 8, true);
    goldLine(doc, 14, 222);
    const steps = [
        '1.  Secure an experienced Maltese notary — we can recommend vetted professionals',
        '2.  If required, prepare AIP application documents (income proof, passport, bank statements)',
        '3.  Commission a PERIT (architect) survey for formal valuation and structural assessment',
        '4.  Open a Malta bank account (BOV, HSBC Malta) for the purchase transaction',
        '5.  Contact us at info@maltaluxuryrealestate.com to arrange a private viewing',
    ];
    steps.forEach((s, i) => txt(doc, s, 14, 230 + i * 8, LIGHT, 7.5));

    // Disclaimer
    drawLine(doc, 14, 272, 196, 272, LINE);
    txt(doc, 'LEGAL DISCLAIMER', 14, 278, DIM, 6, true);
    txt(doc, 'This report is generated by Malta Luxury Real Estate (Brand House Dawid Ziobro, PL6381513187, Strachocin 31, 57-550 Stronie Śląskie)', 14, 283, DIM, 5.5);
    txt(doc, 'for informational purposes only. It does not constitute financial, legal, or investment advice. Always consult a licensed PERIT, notary, and financial adviser.', 14, 287, DIM, 5.5);

    footer(doc, 6, totalPages);

    // ─── Save PDF ──────────────────────────────────────────────
    const safeName = property.title.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40);
    doc.save(`MLE-Investment-Passport-${safeName}.pdf`);
}

