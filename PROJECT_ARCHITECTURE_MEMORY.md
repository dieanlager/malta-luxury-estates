# 🏛️ MALTA LUXURY ESTATES — TECHNICAL MEMORY & ARCHITECTURE
## "The Developer's Truth" — Full Project Documentation

This document serves as the primary technical reference for the Malta Luxury Estates portal. It outlines the core logic, data flow, and architectural decisions to ensure any developer can manage or scale the system.

---

## 1. 🏗️ TECH STACK & CORE ARCHITECTURE

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React + Vite + TypeScript | High-performance, type-safe UI |
| **Styling** | Vanilla CSS + Tailwind | Premium Glassmorphism & Luxury Design |
| **Backend / DB** | Supabase (PostgreSQL) | Auth, Database, and Row Level Security (RLS) |
| **Auth** | Supabase Auth (JWT) | Agency B2B accounts |
| **Email** | Resend API | Lead notifications and transactional emails |
| **Logic** | Vercel Edge Functions | Server-side webhooks and API endpoints |
| **Animations** | Motion (Framer Motion) | Smooth, premium micro-interactions |

---

## 2. 🗄️ DATA MODEL (Supabase Schema)

### 2.1 Table: `agencies`
Stores B2B partner profiles. Linked to Supabase `auth.users` via `id`.
- `id`: UUID (Primary Key)
- `name`, `email`, `phone`, `website`: Business details.
- `plan`: 'basic' | 'pro' | 'featured' (Determines listing limits/features).
- `stripe_customer_id`: Link for subscription billing.

### 2.2 Table: `properties`
The core real estate database. Optimized for pSEO.
- `agency_id`: UUID (Foreign Key to `agencies`).
- `external_ref`: TEXT (Unique per agency. Used for CSV deduplication).
- `location_text`: Human-readable location (e.g., "Sliema").
- `listing_type`: 'sale' | 'rent'.
- `property_type`: 'apartment', 'villa', 'penthouse', etc.
- `epc_rating`: Energy class (A-G).
- `status`: 'active' | 'paused' | 'draft' | 'sold'.
- `is_seafront`, `has_pool`, `has_garage`, `is_sda`, `is_uca`: Boolean features.
- `images`: TEXT[] (Array of Cloudinary/S3 URLs).

### 2.3 Table: `leads`
Stores customer enquiries from listing pages.
- `property_id`: Link to the specific listing.
- `agency_id`: The agency responsible for the listing.
- `status`: 'new' | 'contacted' | 'qualified' | 'closed'.

---

## 3. 🚀 CORE FUNCTIONAL MODULES

### 3.1 Agency Onboarding & Portal (`src/pages/AgencyPortal.tsx`)
- **4-Step Listing Wizard**: Logic splits data entry into *Basics -> Location -> Features -> Media*.
- **AI Assist Logic**: Uses a predefined prompt template injected with property data to generate luxury descriptions.
- **Lead Pipeline**: Kanban-style status management for enquiries.

### 3.2 Lead Notification Webhook (`api/lead-notification.ts`)
**Logic Flow**:
1. **Trigger**: Supabase DB emits a Webhook on `INSERT` into the `leads` table.
2. **Security**: Verifies `x-supabase-signature` (HMAC SHA-256) using `SUPABASE_WEBHOOK_SECRET`.
3. **Email 1 (Agent)**: Fetches `agency.email` and sends lead details.
4. **Email 2 (Buyer)**: Sends a "Thank you" confirmation with branding.
5. **Runtime**: Runs on **Vercel Edge** for near-zero latency.

### 3.3 Bulk CSV Import Center (`src/lib/csvImport.ts`)
Designed for large-scale data migration (e.g. from QuickLets/Alliance).
- **Auto-Separator Detection**: Detects `,` or `;` automatically.
- **Validation**: Strict regex and type checks for prices, locations, and property types.
- **Deduplication Strategy**: Before import, queries Supabase for existing `external_ref` IDs. Skips duplicates to prevent data pollution.
- **Batch Processing**: Inserts into Supabase in chunks of 50 records with a 200ms throttle to avoid API rate limits.

### 3.4 pSEO & Dynamic Routing (`src/lib/data.ts`)
The portal generates thousands of SEO-friendly pages programmatically.
- **Hierarchy**: `/nieruchomosci/[locality]/[property-type]-[filter]`.
- **Filtering Logic**: `getFilteredProperties()` maps URL slugs (e.g., 'sea-view') directly to SQL filters or mock data fallbacks.
- **Sitemap Generator**: `scripts/generate-sitemap.ts` traverses 60+ Malta localities and creates unique entries for each language and category.

---

## 4. 🌍 MULTI-LANGUAGE ENGINE (i18n)
Managed via `i18next` and `react-i18next`.
- **Languages**: EN (English), PL (Polski), IT (Italiano), DE (Deutsch), FR (Français).
- **Structure**: Each localization has its own JSON file in `public/locales/[lang]/common.json`.
- **SEO Support**: `usePageMeta` hook handles `hreflang` tags to ensure Google indexes all versions correctly.

---

## 5. 🛡️ SECURITY PROTOCOLS (RLS)
The database is protected via **Row Level Security**:
- **Agencies**: Can only read/update their own profile (`auth.uid() = id`).
- **Properties**: Public can read `active` listings. Agencies can `ALL` on their own (`auth.uid() = agency_id`).
- **Leads**: Public can `INSERT` (to contact). Agencies can only see leads assigned to them.
- **Service Role**: Vercel Edge Functions use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for system tasks (like sending emails).

---

## 6. 🛠️ ENVIRONMENT VARIABLES
| Key | Context |
| :--- | :--- |
| `VITE_SUPABASE_URL` | DB Connection URL |
| `VITE_SUPABASE_ANON_KEY` | Public client key (Safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key (Only in Vercel Dash, **NEVER** in code) |
| `RESEND_API_KEY` | Transactional Email API Key |
| `SUPABASE_WEBHOOK_SECRET` | Signing secret for lead notifications |
| `VITE_URL` | Public production URL (for emails) |

---

## 📜 DEVELOPER HANDOVER CHECKLIST
1. **Local Dev**: Run `npm run dev` (uses simplified Vite server for Windows compatibility).
2. **Database Changes**: Update `supabase/schema.sql` and run in Supabase SQL Editor.
3. **SEO Updates**: If adding a new location, add it to `MALTA_LOCATIONS` in `src/pages/AgencyPortal.tsx` and `ALL_LOCALITIES` in `src/lib/data.ts`.
4. **Deploy**: Every `git push origin main` triggers a Vercel deployment.

---
*Last Updated: 2026-03-10*
