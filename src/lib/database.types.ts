// Auto-generated types for Supabase tables
// After running schema.sql, you can regenerate these with:
// npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/lib/database.types.ts

export interface Database {
    public: {
        Tables: {
            locations: {
                Row: {
                    id: number;
                    slug: string;
                    name_en: string;
                    name_mt: string | null;
                    island: 'malta' | 'gozo' | 'comino';
                    region: string | null;
                    location_type: 'city' | 'area' | 'village';
                    is_popular: boolean;
                    is_luxury_hub: boolean;
                    short_desc: string;
                    long_intro: string;
                    hero_image: string | null;
                    lat: number | null;
                    lng: number | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['locations']['Insert']>;
            };
            location_stats: {
                Row: {
                    id: number;
                    location_id: number;
                    listings_sale_count: number;
                    listings_rent_count: number;
                    median_price_sale: number | null;
                    median_price_rent: number | null;
                    avg_price_sale: number | null;
                    avg_price_rent: number | null;
                    last_calculated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['location_stats']['Row'], 'id'>;
                Update: Partial<Database['public']['Tables']['location_stats']['Insert']>;
            };
            properties: {
                Row: {
                    id: string;
                    slug: string;
                    title: string;
                    description: string;
                    location_id: number;
                    price: number;
                    listing_type: 'sale' | 'rent';
                    property_type: string;
                    bedrooms: number;
                    bathrooms: number;
                    area_sqm: number;
                    has_sea_view: boolean;
                    has_pool: boolean;
                    is_seafront: boolean;
                    is_new_build: boolean;
                    is_furnished: boolean;
                    is_luxury_tag: boolean;
                    features: string[];
                    tags: string[];
                    images: string[];
                    agency_name: string | null;
                    agency_logo: string | null;
                    agency_id: string;
                    external_ref: string | null;
                    source_url: string | null;
                    status: 'active' | 'sold' | 'rented' | 'inactive';
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'slug' | 'created_at' | 'updated_at'> & { id?: string; slug?: string };
                Update: Partial<Database['public']['Tables']['properties']['Insert']>;
            };
            articles: {
                Row: {
                    id: number;
                    slug: string;
                    title: string;
                    category: string;
                    excerpt: string;
                    content: string;
                    image: string;
                    date: string;
                    read_time: string;
                    published: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['articles']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['articles']['Insert']>;
            };
            inquiries: {
                Row: {
                    id: string;
                    name: string;
                    email: string;
                    phone: string | null;
                    message: string | null;
                    property_id: string | null;
                    property_title: string | null;
                    status: 'new' | 'contacted' | 'closed';
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['inquiries']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['inquiries']['Insert']>;
            };
            agencies: {
                Row: {
                    id: string;
                    name: string;
                    email: string;
                    license_no: string | null;
                    phone: string | null;
                    plan: 'basic' | 'pro' | 'featured';
                    active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['agencies']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['agencies']['Insert']>;
            };
            leads: {
                Row: {
                    id: string;
                    property_id: string | null;
                    agency_id: string;
                    name: string;
                    email: string;
                    phone: string | null;
                    intent: string | null;
                    budget_min: number | null;
                    budget_max: number | null;
                    status: 'new' | 'contacted' | 'qualified' | 'closed';
                    source: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['leads']['Insert']>;
            };
        };
    };
}
