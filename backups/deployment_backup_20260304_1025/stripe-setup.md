# Stripe Setup — Malta Luxury Estates

## Krok 1: Utwórz produkty w Stripe Dashboard

1. Zaloguj się: https://dashboard.stripe.com
2. Products → Add Product

**Pro Plan:**
- Name: Agency Pro Plan
- Price: €149.00 / month (recurring)
- Currency: EUR
- Billing period: Monthly
→ Skopiuj Price ID → STRIPE_PRICE_PRO (price_...)

**Featured Plan:**
- Name: Agency Featured Plan
- Price: €299.00 / month (recurring)
→ Skopiuj Price ID → STRIPE_PRICE_FEATURED (price_...)

## Krok 2: Webhook endpoint

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: https://yourdomain.com/api/stripe-webhook
3. Events to listen:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed
   - invoice.payment_succeeded
4. Skopiuj Signing Secret → STRIPE_WEBHOOK_SECRET (whsec_...)

## Krok 3: Customer Portal

1. Stripe Dashboard → Settings → Customer Portal → Activate
2. Enable: Cancel subscription, Update payment method, View invoices
3. Branding: logo + kolory (opcjonalnie)

## Krok 4: Supabase — dodaj kolumny

Uruchom w Supabase SQL Editor:

```sql
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status    TEXT DEFAULT 'active',
  plan_updated_at        TIMESTAMPTZ;

-- Index dla webhooków (wyszukiwanie po customer_id)
CREATE INDEX IF NOT EXISTS agencies_stripe_customer_idx
  ON agencies (stripe_customer_id);
```

## Krok 5: Test lokalnie

```bash
# Zainstaluj Stripe CLI
# https://docs.stripe.com/stripe-cli

# Forward webhooks lokalnie
stripe login
stripe listen --forward-to localhost:5173/api/stripe-webhook

# Test checkout w nowym terminalu
stripe trigger checkout.session.completed
```

## Krok 6: Vercel environment variables

Ustaw te zmienne w Dashboardzie Vercel:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_FEATURED`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_URL` (na produkcji Twoja domena)
