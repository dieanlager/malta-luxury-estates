// ============================================================
// MALTA LUXURY ESTATES — CSV BULK IMPORT LOGIC
// ============================================================

export const CSV_COLUMNS = [
    // Required
    { key: 'title', label: 'Title', required: true, example: 'Luxury 3-bed apartment, Sliema seafront' },
    { key: 'property_type', label: 'Property Type', required: true, example: 'apartment | penthouse | villa | house | maisonette | townhouse | farmhouse' },
    { key: 'listing_type', label: 'Listing Type', required: true, example: 'sale | rent' },
    { key: 'price', label: 'Price (€)', required: true, example: '450000' },
    { key: 'location_text', label: 'Location', required: true, example: 'Sliema' },
    // Highly recommended
    { key: 'bedrooms', label: 'Bedrooms', required: false, example: '3' },
    { key: 'bathrooms', label: 'Bathrooms', required: false, example: '2' },
    { key: 'area_sqm', label: 'Area (sqm)', required: false, example: '120' },
    { key: 'description', label: 'Description', required: false, example: 'Stunning seafront apartment with panoramic views...' },
    { key: 'epc_rating', label: 'EPC Rating', required: false, example: 'A | B | C | D | E | F | G' },
    // Amenities (yes/no)
    { key: 'is_seafront', label: 'Sea View', required: false, example: 'yes | no' },
    { key: 'has_pool', label: 'Pool', required: false, example: 'yes | no' },
    { key: 'has_garage', label: 'Garage', required: false, example: 'yes | no' },
    { key: 'is_sda', label: 'SDA', required: false, example: 'yes | no' },
    { key: 'is_uca', label: 'UCA', required: false, example: 'yes | no' },
    // Media
    { key: 'images', label: 'Images (URLs)', required: false, example: 'https://... | https://... (pipe-separated)' },
    { key: 'external_ref', label: 'Your Ref ID', required: false, example: 'AG-1234' },
] as const;

export type CSVColumn = typeof CSV_COLUMNS[number]['key'];

export interface SupabaseProperty {
    title: string;
    property_type: string;
    listing_type: 'sale' | 'rent';
    price: number;
    location_text: string;
    bedrooms: number | null;
    bathrooms: number | null;
    area_sqm: number | null;
    description: string | null;
    epc_rating: string | null;
    is_seafront: boolean;
    has_pool: boolean;
    has_garage: boolean;
    is_sda: boolean;
    is_uca: boolean;
    images: string[];
    external_ref: string | null;
    status: 'active';
}

export interface ParsedRow {
    rowIndex: number;
    raw: Record<string, string>;
    mapped: Partial<SupabaseProperty>;
    errors: string[];
    warnings: string[];
    isDuplicate: boolean;
}

export interface ImportResult {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
    rows: ParsedRow[];
}

const VALID_PROPERTY_TYPES = ['apartment', 'penthouse', 'villa', 'house', 'maisonette', 'townhouse', 'farmhouse', 'commercial', 'land'];
const VALID_LISTING_TYPES = ['sale', 'rent'];
const VALID_EPC_RATINGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const VALID_LOCATIONS = [
    'sliema', 'st. julians', 'valletta', 'mdina', 'rabat', 'mosta', 'naxxar',
    'swieqi', 'san gwann', 'gzira', 'msida', 'ta xbiex', 'attard', 'balzan',
    'lija', 'birkirkara', 'qormi', 'zebbug', 'siggiewi', 'zurrieq', 'mqabba',
    'qrendi', 'kirkop', 'safi', 'luqa', 'hal farrug', 'marsa', 'santa venera',
    'hamrun', 'floriana', 'paola', 'tarxien', 'zabbar', 'marsaskala', 'zejtun',
    'marsaxlokk', 'birzebbuga', 'gudja', 'ghaxaq', 'san lawrenz', 'xghajra',
    'kalkara', 'birgu', 'senglea', 'cospicua', 'mellieha', "st. paul's bay",
    'bugibba', 'qawra', 'mgarr', 'gharghur', 'san pawl il-bahar', 'nadur',
    'victoria', 'gozo', 'xaghra', 'xewkija', 'sannat', 'munxar', 'gharb',
    'ghasri', 'kercem', 'marsalforn', 'xlendi', 'dwejra', 'comino',
];

export async function parseCSV(
    file: File,
    existingRefs: string[] = []
): Promise<ImportResult> {
    const text = await file.text();
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);

    if (lines.length < 2) {
        throw new Error('Plik jest pusty lub zawiera tylko nagłówki.');
    }

    const separator = lines[0].includes(';') ? ';' : ',';
    const rawHeaders = lines[0].split(separator).map(h =>
        h.replace(/^["']|["']$/g, '').trim().toLowerCase()
    );

    const headerMap = buildHeaderMap(rawHeaders);
    const missingRequired = CSV_COLUMNS
        .filter(c => c.required && !headerMap.has(c.key))
        .map(c => c.label);

    if (missingRequired.length > 0) {
        throw new Error(`Missing required columns: ${missingRequired.join(', ')}`);
    }

    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = splitCSVLine(lines[i], separator);
        const raw: Record<string, string> = {};

        rawHeaders.forEach((h, idx) => {
            raw[h] = (values[idx] ?? '').replace(/^["']|["']$/g, '').trim();
        });

        const row = validateAndMap(raw, headerMap, i + 1, existingRefs);
        rows.push(row);
    }

    const valid = rows.filter(r => r.errors.length === 0 && !r.isDuplicate).length;
    const invalid = rows.filter(r => r.errors.length > 0).length;
    const duplicates = rows.filter(r => r.isDuplicate).length;

    return { total: rows.length, valid, invalid, duplicates, rows };
}

function buildHeaderMap(rawHeaders: string[]): Map<CSVColumn, number> {
    const aliases: Record<string, CSVColumn> = {
        'title': 'title', 'name': 'title', 'property name': 'title',
        'property type': 'property_type', 'type': 'property_type',
        'listing type': 'listing_type', 'sale or rent': 'listing_type',
        'price': 'price', 'price (€)': 'price', 'price eur': 'price',
        'location': 'location_text', 'area': 'location_text', 'location text': 'location_text',
        'bedrooms': 'bedrooms', 'beds': 'bedrooms',
        'bathrooms': 'bathrooms', 'baths': 'bathrooms',
        'area (sqm)': 'area_sqm', 'sqm': 'area_sqm', 'size': 'area_sqm',
        'description': 'description', 'desc': 'description',
        'epc rating': 'epc_rating', 'epc': 'epc_rating', 'energy': 'epc_rating',
        'sea view': 'is_seafront', 'seafront': 'is_seafront', 'is_seafront': 'is_seafront',
        'pool': 'has_pool', 'swimming pool': 'has_pool', 'has_pool': 'has_pool',
        'garage': 'has_garage', 'parking': 'has_garage', 'has_garage': 'has_garage',
        'sda': 'is_sda', 'is_sda': 'is_sda',
        'uca': 'is_uca', 'is_uca': 'is_uca',
        'images': 'images', 'photos': 'images', 'image urls': 'images',
        'your ref id': 'external_ref', 'ref': 'external_ref', 'reference': 'external_ref', 'external_ref': 'external_ref',
    };

    const map = new Map<CSVColumn, number>();
    rawHeaders.forEach((h, idx) => {
        const key = aliases[h];
        if (key) map.set(key, idx);
    });
    return map;
}

function validateAndMap(
    raw: Record<string, string>,
    headerMap: Map<CSVColumn, number>,
    rowIndex: number,
    existingRefs: string[]
): ParsedRow {
    const errors: string[] = [];
    const warnings: string[] = [];

    const getVal = (key: CSVColumn) => {
        const idx = headerMap.get(key);
        if (idx === undefined) return '';
        // Look up in raw record by matching header
        const headers = Object.keys(raw);
        const targetHeader = headers[idx];
        return raw[targetHeader] || '';
    };

    const title = getVal('title');
    if (!title) errors.push('Missing title');

    const propTypeRaw = getVal('property_type').toLowerCase();
    const property_type = VALID_PROPERTY_TYPES.includes(propTypeRaw) ? propTypeRaw : 'apartment';
    if (!propTypeRaw) errors.push('Missing property_type');
    else if (!VALID_PROPERTY_TYPES.includes(propTypeRaw)) errors.push(`Invalid type: ${propTypeRaw}`);

    const listingTypeRaw = getVal('listing_type').toLowerCase().replace(/sprzeda[żz]/, 'sale').replace(/wynajem/, 'rent');
    const listing_type = (VALID_LISTING_TYPES.includes(listingTypeRaw) ? listingTypeRaw : 'sale') as 'sale' | 'rent';
    if (!VALID_LISTING_TYPES.includes(listingTypeRaw)) errors.push(`Invalid listing_type: ${listingTypeRaw}`);

    const priceRaw = getVal('price').replace(/[€,\s]/g, '');
    const price = parseFloat(priceRaw);
    if (isNaN(price) || price <= 0) errors.push(`Invalid price: ${getVal('price')}`);

    const location_text = getVal('location_text');
    if (!location_text) errors.push('Missing location');

    const bedroomsRaw = getVal('bedrooms');
    const bedrooms = bedroomsRaw ? parseInt(bedroomsRaw) : null;

    const bathroomsRaw = getVal('bathrooms');
    const bathrooms = bathroomsRaw ? parseInt(bathroomsRaw) : null;

    const areaSqmRaw = getVal('area_sqm').replace(/[m²\s]/g, '');
    const area_sqm = areaSqmRaw ? parseFloat(areaSqmRaw) : null;

    const epcRaw = getVal('epc_rating').toUpperCase().trim();
    const epc_rating = epcRaw && VALID_EPC_RATINGS.includes(epcRaw.toLowerCase()) ? epcRaw : null;

    const parseBool = (v: string) => ['yes', 'tak', 'true', '1', 'y', 'x'].includes(v.toLowerCase().trim());

    const imagesRaw = getVal('images');
    const images = imagesRaw
        ? imagesRaw.split('|').map(u => u.trim()).filter(u => u.startsWith('http'))
        : [];

    const external_ref = getVal('external_ref') || null;
    const isDuplicate = !!external_ref && existingRefs.includes(external_ref);

    const mapped: Partial<SupabaseProperty> = {
        title,
        property_type,
        listing_type,
        price: isNaN(price) ? 0 : price,
        location_text,
        bedrooms,
        bathrooms,
        area_sqm,
        description: getVal('description') || null,
        epc_rating,
        is_seafront: parseBool(getVal('is_seafront')),
        has_pool: parseBool(getVal('has_pool')),
        has_garage: parseBool(getVal('has_garage')),
        is_sda: parseBool(getVal('is_sda')),
        is_uca: parseBool(getVal('is_uca')),
        images,
        external_ref,
        status: 'active',
    };

    return { rowIndex, raw, mapped, errors, warnings, isDuplicate };
}

function splitCSVLine(line: string, sep: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === sep && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

export function generateCSVTemplate(): string {
    const headers = CSV_COLUMNS.map(c => c.label).join(',');
    const exampleRow = CSV_COLUMNS.map(c => `"${c.example}"`).join(',');
    return [
        '# Malta Luxury Estates — Listings Import Template',
        '# Columns with * are required. Multiple images should be pipe-separated (|)',
        headers,
        exampleRow,
    ].join('\n');
}

export function downloadTemplate() {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'malta-luxury-estates-template.csv';
    a.click();
    URL.revokeObjectURL(url);
}
