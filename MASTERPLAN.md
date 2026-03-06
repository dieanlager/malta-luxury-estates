# 🚀 INNOVATION MASTERPLAN — MALTA LUXURY REAL ESTATE
> Updated: 2026-03-05 | Owner: Brand House Dawid Ziobro (PL6381513187)

## 🥇 GAME CHANGERS (nikt tego nie ma na Malcie)

| Feature | Status | Route | Revenue |
|---------|--------|-------|---------|
| Property Price Oracle (AI) | ✅ DONE | `/tools/property-valuation` | Lead Gen |
| AI Luxury Concierge (Bot) | ✅ DONE | Floating Chat Widget | Engagement |
| Neighbourhood Intelligence | ✅ DONE | `/properties/[city]` | SEO + engagement |
| Buy vs Rent Calculator | ✅ DONE | `/tools/buy-vs-rent` | Virality + SEO |
| ROI & Mortgage Calculators | ✅ DONE | In-article / Detail Page | Conversion |
| Investment PDF Report | ✅ DONE | per property page | Email capture |
| Live Market Pulse | ✅ DONE | `/market/live` | Media visibility |

## 🥈 DIFFERENTIATORS

| Feature | Status | Route |
|---------|--------|-------|
| Mortgage Pre-Qualifier | ✅ DONE | `/tools/pre-qualifier` | Bank Leads |
| About Us (E-E-A-T) | ✅ DONE | `/about` | Trust & Brand |
| Price History per Listing | ✅ DONE | per property card | Negotiation edge |
| Gozo Bridge Price Tracker | ✅ DONE | `/insights/gozo-bridge-effect` | Regional SEO |
| Property Twin Finder (AI) | ✅ DONE | per property card | Conversion |
| EPC Rating Filter + Calculator | ✅ DONE | per property card | EU Regulation |

## 🥉 VIRAL & ENGAGEMENT

| Feature | Status |
|---------|--------|
| Malta Property Quiz — "What area are you?" | ✅ DONE | `/tools/property-quiz` |
| Price Drop Newsletter (weekly email) | 🔮 FUTURE |
| Noise Map Integration per property | ✅ DONE | per property card | Tranquility Score |

## 💰 B2B REVENUE MODEL

- **Agency Pro:** ✅ DONE (Portal at `/agency/portal` with Supabase Auth)
- **Agency Enterprise:** 🔮 FUTURE — API access + CRM integration
- **Agency Auth System:** ✅ DONE (Login, Register, Forgot Password, Reset Password)
- **Mortgage Affiliate:** €15–50/lead (BOV, HSBC Malta, APS Bank)

- Frontend: React + Vite + Tailwind CSS
- AI Engine: Anthropic Claude claude-sonnet-4-20250514
- Maps: Mapbox GL JS (token: VITE_MAPBOX_TOKEN) — ✅ LIVE
- Email: Resend.com (RESEND_API_KEY) — ✅ LEAD ALERTS IMPLEMENTED
- Deploy: Vercel (vercel.json + CI/CD) — ✅ LIVE at [maltaluxuryrealestate.com](https://maltaluxuryrealestate.com)
- Billing: Stripe — ✅ CORE LOGIC IMPLEMENTED

## 🔥 CRITICAL PRODUCTION STATUS (URGENT)
The following items are **REQUIRED** to move from the Vercel URL to the final `maltaluxuryrealestate.com` and enable full revenue generation:

1.  **Production DNS**: `maltaluxuryrealestate.com` LIVE & Verified.
2.  **SSL**: Active on both root and `www`.
3.  **Google Search Console**: Verified via Meta Tag.
4.  **Supabase Auth Config**: `Site URL` must be updated to `https://maltaluxuryrealestate.com` in Supabase Dashboard.
3.  **Missing Keys (Vercel Env Vars)**:
    - [ ] `SUPABASE_SERVICE_ROLE_KEY`: Required for lead notifications.
    - [ ] `STRIPE_PRICE_PRO`: Required for plan upgrades (€149).
    - [ ] `STRIPE_PRICE_FEATURED`: Required for plan upgrades (€299).
    - [ ] `STRIPE_WEBHOOK_SECRET`: Required for syncing payments with the database.
    - [ ] `ANTHROPIC_API_KEY`: Required for the AI Price Oracle.

---

# Malta Luxury Estates - Programmatic SEO & Data Strategy

## 1. Core Strategy: Programmatic SEO (pSEO)
The goal is to build a high-traffic engine using Malta's unique geographic structure (68 local councils) combined with property types and investment insights.

### Hierarchy
1. **Island**: Malta, Gozo, Comino.
2. **Council/City**: 68 local councils (Sliema, St. Julians, Valletta...).
3. **Area/Neighbourhood**: Paceville, Qawra, Tigné Point, Madliena...
4. **Property Type**: Apartments, Penthouses, Villas, Houses of Character, Maisonettes, Duplexes.

### URL Silos
- `/properties/{city-slug}`: City-level overview with market stats.
- `/properties/{city-slug}/{type-slug}`: Specific property type in a specific city (e.g., `luxury-villas-in-mellieha`).
- `/invest/{city-slug}`: Investment-focused guides per locality.
- `/guides/{topic-slug}`: Global knowledge hub (Taxes, Residency, Buying Process).

---

## 2. Database Schema (Target)

### Locations Table
Stores geographic and descriptive data for councils and areas.
- `id`, `slug`, `name_en`, `island`, `region`, `location_type`, `population`, `area_km2`, `lat`, `lng`, `is_luxury_hub`, `short_desc`, `long_intro`.

### Properties Table
Stores the actual listings (synced from agency feeds).
- `id`, `external_id`, `agency_id`, `location_id`, `listing_type` (sale/rent), `property_type`, `status`, `price`, `bedrooms`, `bathrooms`, `area_m2`, `has_sea_view`, `is_luxury_tag`, `lat`, `lng`, `main_image_url`.

### Location Stats Table
Aggregated data for "Market Snapshots" (updated via daily cron).
- `location_id`, `listings_sale_count`, `listings_rent_count`, `median_price_sale`, `median_price_rent`, `avg_price_sale`, `avg_price_rent`, `last_calculated_at`.

---

## 3. SEO Templates

### City Pages
- **Title**: `{City} Property for Sale & Rent in {Island} | Malta Luxury Estates`
- **Description**: `Discover curated properties in {City}, {Island} – seafront apartments, penthouses and villas from top local agencies. Explore prices and investment opportunities.`

### Type + City Pages
- **Title**: `{TypePlural} for Sale in {City}, {Island} | Malta Luxury Estates`
- **Description**: `Browse curated {typePlural} for sale in {City}, {Island}. Verified listings from leading agencies with seafront and exclusive options.`

---

## 4. Implementation Roadmap (Updated 2026-03-02)

1.  **[COMPLETED] Sprint 1**: Build `Location` table and seed with top 15 luxury hubs.
2.  **[COMPLETED] Sprint 2**: Implement `/properties/[citySlug]` dynamic routing.
3.  **[COMPLETED] Sprint 3**: Transition to Supabase-ready data layer (dual-mode).
4.  **[COMPLETED] Sprint 4**: Launch Knowledge Hub with 46 curated articles.
5.  **[COMPLETED] Sprint 5**: Production Deployment to Vercel (Auto-CI/CD).
6.  **[COMPLETED] Sprint 6**: Domain Integration & SSL.
7.  **[COMPLETED] Sprint 7**: AI Chatbot + About Us Page + Premium Newsletter.
8.  **[IN PROGRESS] The Grand Finale**: Production Key injection + Seed Sync.

---

## 5. Technical Stack & SEO Highlights
- **Tech**: React 19, Vite, Tailwind CSS 4, Mapbox GL.
- **pSEO Engine**: Custom metadata hook (`usePageMeta`) with JSON-LD schema support.
- **Components**: Dynamic Map, Market Snapshots, Property Filters, Knowledge Hub.
- **SEO Health**: 100/100 (Sitemap, Robots, Schema, Meta tags all implemented).

## 7. Premium Rendering & Branding (v11/10)
- **Status**: ACTIVE.
- **Goal**: Elevate the Knowledge Hub to world-class editorial standards (Awwwards-level).
- **Core Components**:
  - **Dynamic Article Renderer**: Custom `ReactMarkdown` components for premium tables and GitHub-style admonitions.
  - **Editorial Typography**: Large-scale serif headers (`clamp()` sizes), custom interline spacing (2.0), and gold decorative accents.
  - **Internal Linking v2**: Recursive-link protection logic for high-density pSEO networks.
- **Backup Location**: `src/backups/premium-render-v1/` (Contains versions of `ArticlePage.tsx` and `index.css`).

## 8. Next Steps (March 2026)
- **Supabase Production Sync**: Transition from mock data to real database population.
- **Interactive Tools**: ROI calculators and mortgage estimators for the Finance category.
- **Polish Phase**: Apply "11/10" styling to the Homepage and Property Details pages.
- **Lead Generation**: Refine contact modals and analytics tracking.
