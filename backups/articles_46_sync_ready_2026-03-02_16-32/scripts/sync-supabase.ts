import { createClient } from '@supabase/supabase-js';
import { PROPERTIES, ARTICLES } from '../src/constants';
import { LOCATIONS } from '../src/lib/data';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sync() {
    console.log('🚀 Starting Production Sync to Supabase...');

    // 1. Sync Locations
    console.log('📍 Syncing Locations...');
    const locationsData = LOCATIONS.map(l => ({
        id: l.id,
        slug: l.slug,
        name_en: l.nameEn,
        name_mt: l.nameMt,
        island: l.island,
        region: l.region,
        location_type: l.locationType,
        is_popular: l.isPopular,
        is_luxury_hub: l.isLuxuryHub,
        short_desc: l.shortDesc,
        long_intro: l.longIntro
    }));

    const { error: locError } = await supabase
        .from('locations')
        .upsert(locationsData, { onConflict: 'slug' });

    if (locError) {
        console.error('❌ Error syncing locations:', locError.message);
    } else {
        console.log('✅ Locations synced successfully.');
    }

    // 2. Sync Articles
    console.log('📰 Syncing Articles...');
    const articlesData = ARTICLES.map(a => ({
        slug: a.slug,
        title: a.title,
        category: a.category,
        excerpt: a.excerpt,
        content: a.content,
        image: a.image,
        date: a.date,
        read_time: a.readTime,
        published: true
    }));

    const { error: artError } = await supabase
        .from('articles')
        .upsert(articlesData, { onConflict: 'slug' });

    if (artError) {
        console.error('❌ Error syncing articles:', artError.message);
    } else {
        console.log('✅ Articles synced successfully.');
    }

    // 3. Sync Properties
    console.log('🏠 Syncing Properties...');
    const propertiesData = PROPERTIES.map(p => ({
        slug: p.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + p.id,
        title: p.title,
        description: p.description,
        location_id: p.locationId,
        price: p.price,
        listing_type: p.type,
        property_type: p.propertyType,
        bedrooms: p.beds,
        bathrooms: p.baths,
        area_sqm: p.sqm,
        images: p.images,
        features: p.features,
        tags: p.tags,
        is_seafront: p.isSeafront,
        has_sea_view: p.features.some(f => f.toLowerCase().includes('sea view')),
        has_pool: p.features.some(f => f.toLowerCase().includes('pool')),
        is_new_build: p.tags?.includes('New Build') || false,
        is_luxury_tag: p.tags?.includes('Exclusive') || p.price > 2000000,
        agency_name: p.agency?.name,
        agency_logo: p.agency?.logo,
        status: 'active'
    }));

    const { error: propError } = await supabase
        .from('properties')
        .upsert(propertiesData, { onConflict: 'slug' });

    if (propError) {
        console.error('❌ Error syncing properties:', propError.message);
    } else {
        console.log('✅ Properties synced successfully.');
    }

    console.log('🏁 Sync Complete!');
}

sync();
