# 🚀 Malta Luxury Estates — Deploy Checklist
> Estimated setup time: 60 minutes

---

## 1. GitHub Setup
- [ ] Create repository on GitHub
- [ ] Push local code: `git init`, `git add .`, `git commit`, `git remote add origin`, `git push`

## 2. Vercel Configuration
- [ ] Import project from GitHub
- [ ] Framework: Vite
- [ ] **Environment Variables**: Add all keys from `.env.production` in Vercel Dashboard
- [ ] Deploy initial build

## 3. Custom Domain
- [ ] Add `maltaluxuryestates.com` in Vercel Project Settings
- [ ] Update DNS records (Type A and CNAME) in your domain registrar
- [ ] Wait for SSL certificate generation (automatic)

## 4. Supabase Production Config
- [ ] **URL Configuration**:
    - Site URL: `https://maltaluxuryestates.com`
    - Redirect URLs: `https://maltaluxuryestates.com/agency/portal`, `https://maltaluxuryestates.com/agency/reset-password`
- [ ] **RLS**: Confirm Row Level Security is active for all tables in the `schema.sql`

## 5. Stripe Production Activation
- [ ] Create Live Products/Prices in Stripe Dashboard
- [ ] Update Vercel Environment Variables with `Live` keys
- [ ] **Webhooks**: Create a new endpoint pointing to `https://maltaluxuryestates.com/api/stripe-webhook`
- [ ] **Customer Portal**: Enable in Settings -> Customer Portal

## 6. Verification (Smoke Tests)
- [ ] Load `maltaluxuryestates.com` (Home)
- [ ] Test Agency Sign Registration + Login
- [ ] Test Stripe Checkout redirect
- [ ] Verify lead capture form sends email (after Resend integration)
- [ ] Check `/sitemap.xml` and `/robots.txt`

## 7. Search Console & Analytics
- [ ] Verify site in Google Search Console
- [ ] Submit sitemap
- [ ] (Optional) Add GA4 Measurement ID to Vercel env
