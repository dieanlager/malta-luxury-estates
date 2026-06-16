import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { load as cheerioLoad } from 'cheerio'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

async function verifySupabaseWebhook(body: string, sig: string | undefined): Promise<boolean> {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET
  if (!secret) return true
  if (!sig) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  const sigBytes = Uint8Array.from(atob(sig), c => c.charCodeAt(0))
  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(body))
}

app.post('/api/lead-notification', async (req, res) => {
  const rawBody = JSON.stringify(req.body)
  const isValid = await verifySupabaseWebhook(rawBody, req.headers['x-supabase-signature'] as string | undefined)
  if (!isValid) return res.status(401).send('Unauthorized')
  const payload = req.body
  if (payload.type !== 'INSERT' || payload.table !== 'leads') return res.status(200).send('Ignored')
  const lead = payload.record
  const [{ data: agency }, { data: property }] = await Promise.all([
    supabase.from('agencies').select('name, email').eq('id', lead.agency_id).single(),
    supabase.from('properties').select('title, location_text, price').eq('id', lead.property_id).single(),
  ])
  if (!agency?.email) return res.status(200).send('No agency email')
  const price = property?.price ? `€${Number(property.price).toLocaleString('en-MT')}` : 'N/A'
  await resend.emails.send({
    from: `Malta Luxury Estates <${process.env.RESEND_FROM_EMAIL}>`,
    to: agency.email,
    subject: `New enquiry: ${lead.name} re ${property?.title ?? 'listing'}`,
    html: `<p><b>${lead.name}</b> (${lead.email}) enquired about <b>${property?.title}</b> at ${price}.</p>`,
  })
  return res.status(200).json({ ok: true })
})

const ADMIN_KEY = process.env.ADMIN_KEY || 'malta2026admin'
function requireAdmin(req: any, res: any, next: any) {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

app.post('/api/admin/scrape', requireAdmin, async (req, res) => {
  const { url } = req.body as { url: string }
  if (!url) return res.status(400).json({ error: 'url required' })
  try {
    const html = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }).then(r => r.text())
    const $ = cheerioLoad(html)

    const title = $('h1').first().text().trim() || $('title').text().split('|')[0].trim()

    let price = 0
    $('*').each((_: any, el: any) => {
      const t = $(el).text().trim()
      const m = t.match(/€\s*([\d,\.]+)/) || t.match(/([\d,\.]+)\s*€/)
      if (m && !price) {
        const n = parseFloat(m[1].replace(/,/g, ''))
        if (n > 10000) price = n
      }
    })

    let beds = 0, baths = 0, sqm = 0
    const fullText = $('body').text()
    const bedMatch = fullText.match(/(\d+)\s*(?:Bedroom|bedroom|bed|Bed)/)
    const bathMatch = fullText.match(/(\d+)\s*(?:Bathroom|bathroom|bath|Bath)/)
    const sqmMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:m2|sqm|sq\.m|sq m)/i)
    if (bedMatch) beds = parseInt(bedMatch[1])
    if (bathMatch) baths = parseInt(bathMatch[1])
    if (sqmMatch) sqm = parseFloat(sqmMatch[1])

    const location_text = url.includes('mellieha') ? 'Mellieha' : url.includes('sliema') ? 'Sliema' : url.includes('valletta') ? 'Valletta' : url.includes('gozo') ? 'Gozo' : url.includes('st-julian') ? "St Julian's" : url.includes('msida') ? 'Msida' : url.includes('mosta') ? 'Mosta' : 'Malta'
    const listing_type = fullText.toLowerCase().includes('for rent') ? 'rent' : 'sale'
    let description = $('p').map((_: any, el: any) => $(el).text().trim()).get().filter((t: string) => t.length > 20).slice(0, 3).join('\n\n')

    const images: string[] = []
    $('img').each((_: any, el: any) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || ''
      if (src && (src.includes('/resize/') || src.includes('/crop/') || src.includes('property') || src.includes('upload')) && !images.includes(src) && images.length < 10) images.push(src)
    })

    const fullTextLower = fullText.toLowerCase()
    const is_seafront = fullTextLower.includes('sea view') || fullTextLower.includes('seafront')
    const has_pool = fullTextLower.includes('pool')
    const has_garage = fullTextLower.includes('garage') || fullTextLower.includes('parking')

    let aiDescription = description
    if (process.env.GROQ_API_KEY && description) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: `Rewrite this Malta property description in polished premium English (3-4 sentences, factual). Property: ${title}, €${price}, ${beds} bed, ${location_text}. Original: "${description}". Return ONLY the text.` }],
            max_tokens: 300,
          })
        })
        const groqData = await groqRes.json() as any
        aiDescription = groqData.choices?.[0]?.message?.content?.trim() || description
      } catch (e) { console.error('Groq error:', e) }
    }

    const featureKeywords: Record<string, string> = {
      'sea view': 'Sea Views', 'seafront': 'Sea Views', 'pool': 'Swimming Pool',
      'garage': 'Garage', 'parking': 'Private Parking', 'air condition': 'Air Conditioning',
      'balcon': 'Balcony', 'terrace': 'Terrace', 'lift': 'Elevator', 'elevator': 'Elevator',
      'furnished': 'Furnished', 'en-suite': 'En-suite Bathrooms', 'solar': 'Solar Panels',
      'concierge': 'Concierge', 'gym': 'Gym', 'security': '24/7 Security',
    }
    const features = Object.entries(featureKeywords)
      .filter(([kw]) => fullTextLower.includes(kw))
      .map(([, label]) => label)
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)

    return res.json({ title, price, beds, baths, sqm, location_text, listing_type, description: aiDescription, is_seafront, has_pool, has_garage, images, affiliate_url: url, features })
  } catch (err: any) {
    console.error('Scrape error:', err)
    return res.status(500).json({ error: err.message })
  }
})

app.post('/api/admin/upload-photo', requireAdmin, express.raw({ type: '*/*', limit: '15mb' }), (req, res) => {
  const { slug, filename } = req.query as { slug: string; filename: string }
  if (!slug || !filename) return res.status(400).json({ error: 'slug and filename required' })
  const dir = path.join(__dirname, 'uploads', 'properties', slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), req.body)
  const url = `${process.env.VITE_URL || 'https://www.maltaluxuryrealestate.com'}/uploads/properties/${slug}/${filename}`
  return res.json({ url })
})

app.delete('/api/admin/delete', requireAdmin, async (req, res) => {
  const { id } = req.query as { id: string }
  if (!id) return res.status(400).json({ error: 'id required' })
  try {
    const { data: property, error: fetchError } = await supabase
      .from('properties').select('title, images').eq('id', id).single()
    if (fetchError || !property) return res.status(404).json({ error: 'Property not found' })
    const { error: deleteError } = await supabase.from('properties').delete().eq('id', id)
    if (deleteError) throw deleteError
    if (property.images && Array.isArray(property.images)) {
      property.images.forEach((imgUrl: string) => {
        try {
          const match = imgUrl.match(/\/uploads\/([^\/]+)\/(.+)$/)
          if (match) {
            const filePath = path.join(__dirname, 'uploads', match[1], match[2])
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
          }
        } catch (e) { console.error('Image delete error:', e) }
      })
    }
    return res.json({ ok: true, deleted: property.title })
  } catch (err: any) {
    console.error('Delete error:', err)
    return res.status(500).json({ error: err.message })
  }
})


app.get('/api/admin/properties', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return res.status(500).json({ error: error.message })
  return res.json(data || [])
})

app.put('/api/admin/update', requireAdmin, async (req, res) => {
  const p = req.body as any
  if (!p.id) return res.status(400).json({ error: 'id required' })
  const featuresStr = Array.isArray(p.features) && p.features.length ? `[FEATURES:${p.features.join(',')}]\n` : ''
  const desc = (p.affiliate_url ? `[AFFILIATE_URL:${p.affiliate_url}]\n` : '') + featuresStr + (p.description || '')
  const { data, error } = await supabase.from('properties').update({
    title: p.title,
    price: Number(p.price),
    bedrooms: Number(p.beds) || null,
    bathrooms: Number(p.baths) || null,
    area_sqm: Number(p.sqm) || null,
    location_text: p.location_text,
    listing_type: p.listing_type || 'sale',
    status: p.status || 'active',
    listing_status: p.status || 'active',
    is_seafront: Boolean(p.is_seafront),
    has_pool: Boolean(p.has_pool),
    has_garage: Boolean(p.has_garage),
    description: desc,
    seo_title: p.seo_title || null,
    seo_description: p.seo_description || null,
    featured: p.featured || false,
    featured_position: p.featured_position || null,
    featured_badge: p.featured_badge || null,
    images: p.images || [],
  }).eq('id', p.id).select('id').single()
  if (error) { console.error('Update error:', error); return res.status(500).json({ error: error.message }) }
  return res.json({ id: data.id })
})

app.post('/api/admin/publish', requireAdmin, async (req, res) => {
  const p = req.body as any
  // Use admin-provided slug OR generate clean one from location + title
  function generateCleanSlug(title: string, location: string): string {
    const combined = (location ? location + '-' : '') + title;
    return combined.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  let baseSlug = p.slug
    ? p.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    : generateCleanSlug(p.title || '', p.location_text || '');

  // Ensure unique slug by checking DB
  let slug = baseSlug;
  let counter = 2;
  while (true) {
    const { data: existing } = await supabase.from('properties').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    slug = baseSlug + '-' + counter++;
  }
  const featuresStr = Array.isArray(p.features) && p.features.length ? `[FEATURES:${p.features.join(',')}]\n` : ''
  const desc = (p.affiliate_url ? `[AFFILIATE_URL:${p.affiliate_url}]\n` : '') + featuresStr + (p.description || '')
  const { data, error } = await supabase.from('properties').insert([{
    title: p.title, slug,
    price: Number(p.price),
    bedrooms: Number(p.beds) || null,
    bathrooms: Number(p.baths) || null,
    area_sqm: Number(p.sqm) || null,
    location_text: p.location_text,
    listing_type: p.listing_type || 'sale',
    status: p.status || 'active',
    listing_status: p.status || 'active',
    is_seafront: Boolean(p.is_seafront),
    has_pool: Boolean(p.has_pool),
    has_garage: Boolean(p.has_garage),
    description: desc,
    seo_title: p.seo_title || null,
    seo_description: p.seo_description || null,
    featured: p.featured || false,
    featured_position: p.featured_position || null,
    featured_badge: p.featured_badge || null,
    images: p.images || [],
  }]).select('id').single()
  if (error) { console.error('Publish error:', error); return res.status(500).json({ error: error.message }) }
  try {
    const fmtP = (v: number) => v >= 1000000 ? `€${(v/1000000).toFixed(1)}M` : v >= 1000 ? `€${(v/1000).toFixed(0)}k` : `€${v.toLocaleString()}`
    const thumb = p.images?.[0] ? `<img src="${p.images[0]}" style="max-width:200px;border-radius:4px;margin-top:12px" />` : ''
    await resend.emails.send({
      from: `Malta Luxury Estates <${process.env.RESEND_FROM_EMAIL || 'noreply@maltaluxuryrealestate.com'}>`,
      to: 'info@maltaluxuryrealestate.com',
      subject: `New Property: ${p.title} - ${fmtP(Number(p.price))}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1a1a2e;padding:24px;border-radius:8px 8px 0 0"><h1 style="color:#c9a84c;margin:0">Malta Luxury Estates</h1></div><div style="padding:32px;background:#fff;border:1px solid #eee;border-radius:0 0 8px 8px"><h2>${p.title}</h2><p>Price: <strong>${fmtP(Number(p.price))}</strong> | Location: ${p.location_text}</p>${thumb}<p style="margin-top:20px"><a href="${process.env.VITE_URL || 'https://www.maltaluxuryrealestate.com'}/properties/${slug}" style="background:#1a1a2e;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none">View Listing</a></p></div></div>`,
    })
  } catch (err: any) { console.error('Admin email error:', err) }
  return res.json({ id: data.id, slug })
})

app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'leads@maltaluxuryrealestate.com',
      to: process.env.CONTACT_EMAIL || 'info@maltaluxuryrealestate.com',
      subject: 'New Newsletter Subscription — Malta Luxury RE',
      html: `<p>New newsletter subscriber: <strong>${email}</strong></p>`
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Newsletter error:', error);
    res.status(500).json({ error: 'Failed to send' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message, propertyTitle, affiliateUrl } = req.body as any
  if (!name || !email) return res.status(400).json({ error: 'name and email required' })
  try {
    await resend.emails.send({
      from: `Malta Luxury Estates <${process.env.RESEND_FROM_EMAIL || 'leads@maltaluxuryrealestate.com'}>`,
      to: process.env.CONTACT_EMAIL || 'info@maltaluxuryrealestate.com',
      replyTo: email,
      subject: `Enquiry: ${name} - ${propertyTitle || 'General'}`,
      html: `<p><strong>From:</strong> ${name} (${email})${phone ? ', ' + phone : ''}</p>${message ? '<p><strong>Message:</strong> ' + message + '</p>' : ''}${affiliateUrl ? '<p><strong>Property:</strong> <a href="' + affiliateUrl + '">' + (propertyTitle || affiliateUrl) + '</a></p>' : ''}`,
    })
    await resend.emails.send({
      from: `Malta Luxury Estates <${process.env.RESEND_FROM_EMAIL || 'leads@maltaluxuryrealestate.com'}>`,
      to: email,
      subject: `Your enquiry about ${propertyTitle || 'the property'}`,
      html: `<p>Thank you, ${name}! We received your enquiry about <strong>${propertyTitle || 'the property'}</strong>. Our specialist will be in touch within 24 hours.</p>`,
    })
    return res.json({ ok: true })
  } catch (err: any) {
    console.error('Contact error:', err)
    return res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// SEO BOT MIDDLEWARE — must come BEFORE static file serving
// ─────────────────────────────────────────────────────────────────────────────


const BOT_AGENTS = ['googlebot','bingbot','slurp','duckduckbot','baiduspider','yandexbot','sogou','petalbot','ahrefsbot','semrushbot','rogerbot','dotbot','facebot','ia_archiver','msnbot']

function isBot(req: any): boolean {
  const ua = (req.headers['user-agent'] || '').toLowerCase()
  return BOT_AGENTS.some(b => ua.includes(b))
}

const LOCALE_META: Record<string, {
  homepageTitle: string;
  homepageDesc: string;
  propertiesTitle: string;
  propertiesDesc: string;
  propertyTitle: (p: any) => string;
  propertyDesc: (p: any, price: string) => string;
  beds: string;
  baths: string;
  area: string;
  price: string;
  location: string;
  viewAll: string;
  viewAllHref: string;
  lang: string;
}> = {
  en: {
    homepageTitle: 'Malta Luxury Real Estate | Premium Properties for Sale in Malta',
    homepageDesc: "Malta's premier luxury real estate agency. Browse exclusive villas, penthouses and apartments for sale in Malta and Gozo. Expert buyer representation.",
    propertiesTitle: 'Luxury Properties for Sale in Malta | Exclusive Listings',
    propertiesDesc: "Browse Malta's finest luxury properties — sea-view penthouses, historic Valletta palazzos and private villas. Contact us for off-market opportunities.",
    propertyTitle: (p: any) => `${p.title} | Malta Luxury Real Estate`,
    propertyDesc: (p: any, price: string) => `${p.title} in ${p.location_text || 'Malta'}. ${p.bedrooms ? p.bedrooms + ' bedrooms, ' : ''}${p.bathrooms ? p.bathrooms + ' bathrooms. ' : ''}Price: ${price}. Exclusive Malta luxury property.`,
    beds: 'Bedrooms', baths: 'Bathrooms', area: 'Area', price: 'Price', location: 'Location',
    viewAll: 'View all luxury properties in Malta', viewAllHref: '/properties/all', lang: 'en',
  },
  fr: {
    homepageTitle: 'Immobilier de Luxe à Malte | Propriétés Exclusives à La Valette',
    homepageDesc: "Spécialiste de l'immobilier de prestige à Malte — penthouses vue mer, palazzos historiques à La Valette, villas privées. Conseil discret pour acquéreurs internationaux francophones.",
    propertiesTitle: 'Propriétés de Luxe à Malte | Appartements et Villas en Vente',
    propertiesDesc: "Sélection exclusive de biens immobiliers de prestige à Malte. Des appartements front de mer de Sliema aux domaines de Mdina. Opportunités hors marché disponibles.",
    propertyTitle: (p: any) => `${p.title} à Malte | Immobilier de Luxe`,
    propertyDesc: (p: any, price: string) => `Propriété de prestige à ${p.location_text || 'Malte'}. ${p.bedrooms ? p.bedrooms + ' chambres, ' : ''}${p.bathrooms ? p.bathrooms + ' salles de bain. ' : ''}Prix: ${price}. Immobilier de luxe à Malte.`,
    beds: 'Chambres', baths: 'Salles de bain', area: 'Surface', price: 'Prix', location: 'Quartier',
    viewAll: 'Voir toutes les propriétés de luxe à Malte', viewAllHref: '/fr/properties/all', lang: 'fr',
  },
  de: {
    homepageTitle: 'Luxusimmobilien Malta | Exklusive Immobilien kaufen in Malta',
    homepageDesc: 'Maltas führende Luxusimmobilienagentur. Entdecken Sie exklusive Meerblick-Penthäuser, historische Valletta-Palazzi und private Villen. Diskrete Beratung für internationale Käufer.',
    propertiesTitle: 'Luxusimmobilien kaufen auf Malta | Wohnungen, Villen, Penthouses',
    propertiesDesc: 'Erstklassige Luxusimmobilien auf Malta — von Sliemas Meeresfront-Apartments bis zu exklusiven Landgütern in Mdina. Off-Market-Objekte auf Anfrage.',
    propertyTitle: (p: any) => `${p.title} auf Malta | Luxusimmobilien`,
    propertyDesc: (p: any, price: string) => `Luxusimmobilie in ${p.location_text || 'Malta'}. ${p.bedrooms ? p.bedrooms + ' Schlafzimmer, ' : ''}${p.bathrooms ? p.bathrooms + ' Badezimmer. ' : ''}Preis: ${price}. Exklusive Luxusimmobilien Malta.`,
    beds: 'Schlafzimmer', baths: 'Badezimmer', area: 'Fläche', price: 'Preis', location: 'Lage',
    viewAll: 'Alle Luxusimmobilien auf Malta ansehen', viewAllHref: '/de/properties/all', lang: 'de',
  },
  it: {
    homepageTitle: 'Immobili di Lusso a Malta | Proprietà Esclusive in Vendita',
    homepageDesc: "Agenzia immobiliare di lusso a Malta. Scoprite attici con vista mare, palazzi storici a La Valletta e ville private. Consulenza personalizzata per acquirenti internazionali.",
    propertiesTitle: 'Proprietà di Lusso in Vendita a Malta | Appartamenti, Ville, Attici',
    propertiesDesc: 'Selezione esclusiva di immobili di pregio a Malta. Dagli appartamenti fronte mare di Sliema alle tenute di Mdina. Opportunità fuori mercato su richiesta.',
    propertyTitle: (p: any) => `${p.title} a Malta | Immobili di Lusso`,
    propertyDesc: (p: any, price: string) => `Immobile di lusso a ${p.location_text || 'Malta'}. ${p.bedrooms ? p.bedrooms + ' camere, ' : ''}${p.bathrooms ? p.bathrooms + ' bagni. ' : ''}Prezzo: ${price}. Immobili di lusso a Malta.`,
    beds: 'Camere', baths: 'Bagni', area: 'Superficie', price: 'Prezzo', location: 'Quartiere',
    viewAll: 'Vedi tutte le proprietà di lusso a Malta', viewAllHref: '/it/properties/all', lang: 'it',
  },
  pl: {
    homepageTitle: 'Luksusowe Nieruchomości na Malcie | Ekskluzywne Apartamenty i Wille',
    homepageDesc: 'Wiodąca agencja nieruchomości luksusowych na Malcie. Ekskluzywne penthousy z widokiem na morze, historyczne palazzi w Valletcie i prywatne wille. Dyskretne doradztwo dla zamożnych nabywców.',
    propertiesTitle: 'Nieruchomości na Malcie | Luksusowe Apartamenty i Wille na Sprzedaż',
    propertiesDesc: 'Ekskluzywna selekcja luksusowych nieruchomości na Malcie. Od apartamentów nad morzem w Sliemie po rezydencje w Mdinie. Oferty off-market na żądanie.',
    propertyTitle: (p: any) => `${p.title} na Malcie | Luksusowe Nieruchomości`,
    propertyDesc: (p: any, price: string) => `Luksusowa nieruchomość w ${p.location_text || 'Malcie'}. ${p.bedrooms ? p.bedrooms + ' sypialnie, ' : ''}${p.bathrooms ? p.bathrooms + ' łazienki. ' : ''}Cena: ${price}. Ekskluzywne nieruchomości na Malcie.`,
    beds: 'Sypialnie', baths: 'Łazienki', area: 'Powierzchnia', price: 'Cena', location: 'Lokalizacja',
    viewAll: 'Zobacz wszystkie luksusowe nieruchomości na Malcie', viewAllHref: '/pl/properties/all', lang: 'pl',
  },
};

const SUPPORTED_LANGS = ['fr', 'de', 'it', 'pl'];
const BASE_URL = 'https://www.maltaluxuryrealestate.com';

function buildHreflang(enPath: string, localePath: string, locale: string): string {
  const langs: Record<string, string> = { en: enPath, fr: `/fr${enPath}`, de: `/de${enPath}`, it: `/it${enPath}`, pl: `/pl${enPath}` };
  return Object.entries(langs).map(([lang, path]) =>
    `<link rel="alternate" hreflang="${lang}" href="${BASE_URL}${path}">`
  ).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${BASE_URL}${enPath}">`;
}

function buildWebsiteSchema(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    "url": BASE_URL,
    "name": "Malta Luxury Real Estate",
    "publisher": { "@type": "Organization", "name": "Malta Luxury Real Estate", "@id": `${BASE_URL}/#org` }
  });
}

function buildOrgSchema(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${BASE_URL}/#org`,
    "name": "Malta Luxury Real Estate",
    "url": BASE_URL,
    "description": "Premium luxury real estate agency specialising in exclusive properties across Malta and Gozo.",
    "areaServed": { "@type": "Country", "name": "Malta" },
    "knowsLanguage": ["en", "fr", "de", "it", "pl"]
  });
}

function buildPropertyHtml(p: any, locale: string): string {
  const meta = LOCALE_META[locale] || LOCALE_META.en;
  const price = p.price ? `€${Number(p.price).toLocaleString('en-MT')}` : '';
  const desc = (p.description || '').replace(/\[AFFILIATE_URL:[^\]]+\]\n?/g, '').replace(/\[FEATURES:[^\]]+\]\n?/g, '').substring(0, 500).trim();
  const slug = p.slug || p.id;

  const enPath = `/properties/${slug}`;
  const localePath = locale === 'en' ? enPath : `/${locale}/properties/${slug}`;
  const canonical = `${BASE_URL}${localePath}`;

  const title = meta.propertyTitle(p);
  const metaDesc = meta.propertyDesc(p, price).substring(0, 160);
  const hreflang = buildHreflang(enPath, localePath, locale);

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL + (locale === 'en' ? '' : `/${locale}`) },
      { "@type": "ListItem", "position": 2, "name": locale === 'en' ? "Properties" : "Propriétés", "item": BASE_URL + (locale === 'en' ? '/properties/all' : `/${locale}/properties/all`) },
      { "@type": "ListItem", "position": 3, "name": p.title, "item": canonical }
    ]
  });

  const listingSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": p.title,
    "description": desc.substring(0, 300),
    "url": canonical,
    "image": p.images?.[0] || '',
    "offers": { "@type": "Offer", "price": p.price, "priceCurrency": "EUR", "availability": "https://schema.org/InStock" },
    "address": { "@type": "PostalAddress", "addressLocality": p.location_text || '', "addressCountry": "MT" },
    "numberOfRooms": p.bedrooms,
    ...(p.area_sqm ? { "floorSize": { "@type": "QuantitativeValue", "value": p.area_sqm, "unitCode": "MTK" } } : {})
  });

  return `<!DOCTYPE html>
<html lang="${meta.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${metaDesc}">
<link rel="canonical" href="${canonical}">
${hreflang}
<meta property="og:title" content="${title}">
<meta property="og:description" content="${metaDesc}">
${p.images?.[0] ? `<meta property="og:image" content="${p.images[0]}">` : ''}
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${meta.lang}">
<script type="application/ld+json">${listingSchema}</script>
<script type="application/ld+json">${breadcrumbSchema}</script>
<script type="application/ld+json">${buildOrgSchema()}</script>
</head>
<body>
<header><a href="${BASE_URL}${locale === 'en' ? '' : '/' + locale}"><strong>Malta Luxury Real Estate</strong></a></header>
<main>
<nav><a href="${BASE_URL}${locale === 'en' ? '' : '/' + locale}">Home</a> › <a href="${BASE_URL}${locale === 'en' ? '/properties/all' : '/' + locale + '/properties/all'}">${locale === 'en' ? 'Properties' : 'Propriétés'}</a> › ${p.title}</nav>
<h1>${p.title}</h1>
<p><strong>${meta.price}:</strong> ${price} | <strong>${meta.location}:</strong> ${p.location_text || 'Malta'}</p>
${p.bedrooms ? `<p><strong>${meta.beds}:</strong> ${p.bedrooms} | <strong>${meta.baths}:</strong> ${p.bathrooms || 'N/A'} | <strong>${meta.area}:</strong> ${p.area_sqm ? p.area_sqm + ' m²' : 'N/A'}</p>` : ''}
${p.images?.[0] ? `<img src="${p.images[0]}" alt="${p.title}" style="max-width:100%;border-radius:8px;margin:16px 0">` : ''}
<div>${desc}</div>
<p><a href="${canonical}">${title}</a></p>
<p><a href="${BASE_URL}${meta.viewAllHref}">${meta.viewAll}</a></p>
</main>
</body>
</html>`;
}
// Parse YAML frontmatter from markdown file
function parseArticleMeta(raw: string): { title: string; desc: string; content: string; image: string; date: string } {
  try {
    const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return { title: '', desc: '', content: raw, image: '', date: '' };
    const fm = match[1];
    const content = match[2];
    const titleMatch = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const descMatch = fm.match(/^metaDescription:\s*["']?(.+?)["']?\s*$/m);
    const excerptMatch = fm.match(/^excerpt:\s*["']?(.+?)["']?\s*$/m);
    const imageMatch = fm.match(/^image:\s*["']?(.+?)["']?\s*$/m);
    const dateMatch = fm.match(/^date:\s*["']?(.+?)["']?\s*$/m);
    const title = titleMatch ? titleMatch[1] : '';
    const desc = descMatch ? descMatch[1] : (excerptMatch ? excerptMatch[1] : '');
    const image = imageMatch ? imageMatch[1] : '';
    const date = dateMatch ? dateMatch[1] : '';
    return { title, desc, content, image, date };
  } catch { return { title: '', desc: '', content: raw, image: '', date: '' }; }
}

// Convert markdown to plain HTML for bot consumption
function mdToHtml(md: string): string {
  return md
    .replace(/^#{1,2}\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#{3,6}\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(?!<[hulo])/gm, '')
    .trim();
}

function parseFaqSchema(content: string): string | null {
  try {
    const faqMatch = content.match(/##\s+(?:Frequently Asked Questions|FAQ|Questions fréquentes|Häufig gestellte Fragen|Domande frequenti|Często zadawane pytania)([\s\S]*?)(?=\n## [A-Z\*]|\n---\s*\n|\*Last updated|$)/i);
    if (!faqMatch) return null;
    const faqSection = faqMatch[1];
    const pairs: Array<{q: string; a: string}> = [];
    const regex = /\*\*([^*\n]{10,120}\?)\*\*\n+([\s\S]+?)(?=\n\*\*[^*\n]+\?\*\*|\n###|\n---|\*Last|\s*$)/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(faqSection)) !== null && pairs.length < 10) {
      const q = m[1].trim();
      const a = m[2].trim().replace(/\*\*/g, '').replace(/\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\n+/g, ' ').substring(0, 600);
      if (q && a.length > 20) pairs.push({ q, a });
    }
    if (pairs.length < 2) return null;
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": pairs.map(({ q, a }) => ({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a }
      }))
    });
  } catch { return null; }
}

function makeSeoTitle(title: string): string {
  const suffix = ' | Malta Luxury Real Estate';
  const full = `${title}${suffix}`;
  if (full.length <= 60) return full;
  for (const sep of [': ', ' – ', ' — ']) {
    const idx = title.indexOf(sep);
    if (idx > 15 && (idx + suffix.length) <= 62) return `${title.substring(0, idx)}${suffix}`;
  }
  const maxMain = 60 - suffix.length;
  const preps = new Set(['as', 'a', 'an', 'the', 'in', 'of', 'to', 'for', 'at', 'by', 'on', 'with']);
  let words = title.substring(0, maxMain).split(' ').slice(0, -1);
  while (words.length > 0 && preps.has(words[words.length - 1].toLowerCase())) words = words.slice(0, -1);
  const cut = words.join(' ').replace(/[&,;]\s*$/, '').trim();
  return `${cut}${suffix}`;
}

function buildArticleHtml(slug: string, title: string, description: string, content: string, locale = 'en', articleImage = '', articleDate = ''): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const canonical = `${BASE_URL}${prefix}/insights/${slug}`;
  const hreflang = buildHreflang(`/insights/${slug}`, `${prefix}/insights/${slug}`, locale);
  const today = new Date().toISOString().split('T')[0];
  // Parse datePublished from frontmatter date string
  let datePublished = today;
  if (articleDate) {
    try { const d = new Date(articleDate); if (!isNaN(d.getTime())) datePublished = d.toISOString().split('T')[0]; } catch {}
  }
  const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;
  const insightsLabel = { en: 'Insights', fr: 'Conseils', de: 'Einblicke', it: 'Approfondimenti', pl: 'Wiedza' }[locale] || 'Insights';
  const homeLabel = { en: 'Home', fr: 'Accueil', de: 'Startseite', it: 'Home', pl: 'Strona główna' }[locale] || 'Home';
  const articleSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description.substring(0, 200),
    "url": canonical,
    "datePublished": datePublished,
    "dateModified": today,
    "wordCount": wordCount,
    "inLanguage": locale,
    ...(articleImage ? { "image": { "@type": "ImageObject", "url": articleImage } } : {}),
    "author": { "@type": "Organization", "name": "Malta Luxury Real Estate", "url": BASE_URL },
    "publisher": { "@type": "Organization", "name": "Malta Luxury Real Estate", "@id": `${BASE_URL}/#org`, "logo": { "@type": "ImageObject", "url": `${BASE_URL}/logo.png` } }
  });
  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": homeLabel, "item": `${BASE_URL}${prefix}` },
      { "@type": "ListItem", "position": 2, "name": insightsLabel, "item": `${BASE_URL}${prefix}/insights` },
      { "@type": "ListItem", "position": 3, "name": title, "item": canonical }
    ]
  });
  const faqSchema = parseFaqSchema(content);
  const bodyHtml = mdToHtml(content);
  const pageTitle = makeSeoTitle(title);
  const safeDesc = description.substring(0, 160).replace(/"/g, '&quot;');
  const safeTitle = title.replace(/"/g, '&quot;');
  const ogImage = articleImage || `${BASE_URL}/og-default.jpg`;
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pageTitle}</title>
<meta name="description" content="${safeDesc}">
<link rel="canonical" href="${canonical}">
${hreflang}
<meta property="og:type" content="article">
<meta property="og:title" content="${safeTitle}">
<meta property="og:description" content="${safeDesc}">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="Malta Luxury Real Estate">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${safeTitle}">
<meta name="twitter:description" content="${safeDesc}">
<meta name="twitter:image" content="${ogImage}">
<script type="application/ld+json">${articleSchema}</script>
${faqSchema ? `<script type="application/ld+json">${faqSchema}</script>` : ''}
<script type="application/ld+json">${breadcrumbSchema}</script>
<script type="application/ld+json">${buildWebsiteSchema()}</script>
</head>
<body>
<header><a href="${BASE_URL}${prefix}"><strong>Malta Luxury Real Estate</strong></a></header>
<nav><a href="${BASE_URL}${prefix}">${homeLabel}</a> › <a href="${BASE_URL}${prefix}/insights">${insightsLabel}</a> › ${title}</nav>
<main>
<article>
<h1>${title}</h1>
<p>${description}</p>
<div>${bodyHtml}</div>
</article>
<p><a href="${BASE_URL}/properties/all">Browse luxury properties in Malta</a></p>
<p><a href="${BASE_URL}${prefix}/insights">All Malta Real Estate Guides</a></p>
</main>
</body>
</html>`;
}
// robots.txt — before static files so it isn't overridden by dist/robots.txt
app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /*?*

Sitemap: https://www.maltaluxuryrealestate.com/sitemap.xml`)
})

// Dynamic SEO sitemap — replaces static 5800-URL sitemap
app.get('/sitemap.xml', async (_req, res) => {
  try {
    const { data: props } = await supabase
      .from('properties')
      .select('slug, id, updated_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    const today = new Date().toISOString().split('T')[0];
    const langs = ['en', 'fr', 'de', 'it', 'pl'];
    const langPrefixes: Record<string, string> = { en: '', fr: '/fr', de: '/de', it: '/it', pl: '/pl' };

    function buildHreflangsXml(enPath: string): string {
      return langs.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE_URL}${langPrefixes[l]}${enPath}"/>`).join('\n') +
        `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${enPath}"/>`;
    }

    function urlEntry(path: string, priority: string, changefreq: string, lastmod: string, hreflangsXml: string): string {
      return `  <url>\n    <loc>${BASE_URL}${path}</loc>\n${hreflangsXml}\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
    }

    let urls = '';

    // Static pages - EN + all localized variants
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/properties/all', priority: '0.9', changefreq: 'daily' },
      { path: '/about', priority: '0.5', changefreq: 'monthly' },
      { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    ];

    for (const page of staticPages) {
      const hx = buildHreflangsXml(page.path);
      // EN canonical entry
      urls += urlEntry(page.path || '/', page.priority, page.changefreq, today, hx);
      // Localized entries
      for (const lang of ['fr', 'de', 'it', 'pl']) {
        urls += urlEntry(`${langPrefixes[lang]}${page.path}`, String(Number(page.priority) - 0.05), page.changefreq, today, hx);
      }
    }

    // Article slugs — dynamically read from filesystem
    let articleSlugs: string[] = [];
    try {
      const articlesDir = path.join(__dirname, 'src', 'content', 'articles', 'en');
      if (fs.existsSync(articlesDir)) {
        articleSlugs = fs.readdirSync(articlesDir)
          .filter((f: string) => f.endsWith('.md'))
          .map((f: string) => f.replace('.md', ''));
      }
    } catch {}
    // fallback to known slugs if filesystem unavailable
    if (articleSlugs.length === 0) {
      articleSlugs = [
        'buying-property-in-malta-as-a-foreigner-2026',
        'cost-of-living-malta-2026',
        'property-inheritance-malta-succession-tax-2026',
        'gozo-property-investment-guide-2026',
        'valletta-investing-in-malta-baroque-capital-2026',
        'sliema-real-estate-market-deep-dive-2026',
        'special-designated-areas-malta-guide',
        'malta-permanent-residency-mprp-property-guide',
        'malta-property-market-forecast-2026-2030',
        'mortgage-malta-foreigners-guide-2026',
        'rental-yields-malta-2026',
        'buying-off-plan-property-malta-risks-rewards',
      ];
    }

    for (const slug of articleSlugs) {
      const enPath = `/insights/${slug}`;
      const hx = buildHreflangsXml(enPath);
      urls += urlEntry(enPath, '0.7', 'monthly', today, hx);
      for (const lang of ['fr', 'de', 'it', 'pl']) {
        urls += urlEntry(`${langPrefixes[lang]}${enPath}`, '0.65', 'monthly', today, hx);
      }
    }

    // Property pages - EN + all localized
    for (const p of (props || [])) {
      const slug = p.slug || p.id;
      const lastmod = p.updated_at ? p.updated_at.split('T')[0] : today;
      const enPath = `/properties/${slug}`;
      const hx = buildHreflangsXml(enPath);
      urls += urlEntry(enPath, '0.8', 'weekly', lastmod, hx);
      for (const lang of ['fr', 'de', 'it', 'pl']) {
        urls += urlEntry(`${langPrefixes[lang]}${enPath}`, '0.75', 'weekly', lastmod, hx);
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Sitemap error');
  }
});

// ============================================================
// SEO BOT SSR — serves real HTML to crawlers for all 5 languages
// ============================================================

// HOMEPAGE — EN
app.get('/', async (req, res, next) => {
  if (!isBot(req)) return next();
  try {
    const meta = LOCALE_META.en;
    const { data: props } = await supabase.from('properties').select('id,title,slug,price,location_text,bedrooms').eq('status','active').order('featured_position',{ascending:true}).order('price',{ascending:false}).limit(6);
    const items = (props||[]).map(p => `<li><a href="${BASE_URL}/properties/${p.slug||p.id}"><strong>${p.title}</strong></a> — ${p.location_text||'Malta'} — €${Number(p.price).toLocaleString('en-MT')}${p.bedrooms?' — '+p.bedrooms+' bed':''}</li>`).join('');
    const schema = JSON.stringify({ "@context":"https://schema.org","@type":"RealEstateAgent","@id":`${BASE_URL}/#org`,"name":"Malta Luxury Real Estate","url":BASE_URL,"description":meta.homepageDesc,"areaServed":{"@type":"Country","name":"Malta"},"knowsLanguage":["en","fr","de","it","pl"] });
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${meta.homepageTitle}</title><meta name="description" content="${meta.homepageDesc}"><link rel="canonical" href="${BASE_URL}">${buildHreflang('','','en')}<script type="application/ld+json">${schema}</script><script type="application/ld+json">${buildWebsiteSchema()}</script></head><body><header><strong>Malta Luxury Real Estate</strong></header><main><h1>Luxury Real Estate in Malta</h1><p>${meta.homepageDesc}</p>${items?`<ul>${items}</ul>`:''}<p><a href="${BASE_URL}/properties/all">${meta.viewAll}</a></p></main></body></html>`;
    res.setHeader('Content-Type','text/html;charset=utf-8'); return res.send(html);
  } catch { return next(); }
});

// HOMEPAGE — FR/DE/IT/PL
app.get('/:locale(fr|de|it|pl)', async (req, res, next) => {
  if (!isBot(req)) return next();
  try {
    const locale = req.params.locale;
    const meta = LOCALE_META[locale];
    const { data: props } = await supabase.from('properties').select('id,title,slug,price,location_text,bedrooms').eq('status','active').order('price',{ascending:false}).limit(6);
    const items = (props||[]).map(p => `<li><a href="${BASE_URL}/${locale}/properties/${p.slug||p.id}"><strong>${p.title}</strong></a> — ${p.location_text||'Malta'} — €${Number(p.price).toLocaleString('en-MT')}</li>`).join('');
    const canonical = `${BASE_URL}/${locale}`;
    const schema = JSON.stringify({ "@context":"https://schema.org","@type":"RealEstateAgent","@id":`${BASE_URL}/#org`,"name":"Malta Luxury Real Estate","url":BASE_URL,"description":meta.homepageDesc });
    const html = `<!DOCTYPE html><html lang="${meta.lang}"><head><meta charset="UTF-8"><title>${meta.homepageTitle}</title><meta name="description" content="${meta.homepageDesc}"><link rel="canonical" href="${canonical}">${buildHreflang('',`/${locale}`,'en')}<meta property="og:locale" content="${meta.lang}"><script type="application/ld+json">${schema}</script></head><body><header><a href="${BASE_URL}"><strong>Malta Luxury Real Estate</strong></a></header><main><h1>${meta.homepageTitle.split('|')[0].trim()}</h1><p>${meta.homepageDesc}</p>${items?`<ul>${items}</ul>`:''}<p><a href="${BASE_URL}${meta.viewAllHref}">${meta.viewAll}</a></p></main></body></html>`;
    res.setHeader('Content-Type','text/html;charset=utf-8'); return res.send(html);
  } catch { return next(); }
});

// PROPERTIES ALL — EN
app.get('/properties/all', async (req, res, next) => {
  if (!isBot(req)) return next();
  try {
    const meta = LOCALE_META.en;
    const { data: props } = await supabase.from('properties').select('id,title,slug,price,location_text,bedrooms,listing_type,images').eq('status','active').order('price',{ascending:false}).limit(30);
    if (!props?.length) return next();
    const items = props.map(p => `<li><a href="${BASE_URL}/properties/${p.slug||p.id}"><strong>${p.title}</strong></a> — ${p.location_text||'Malta'} — €${Number(p.price).toLocaleString('en-MT')}${p.bedrooms?' — '+p.bedrooms+' bed':''}</li>`).join('');
    const schema = JSON.stringify({ "@context":"https://schema.org","@type":"ItemList","name":"Luxury Properties for Sale in Malta","url":`${BASE_URL}/properties/all`,"numberOfItems":props.length,"itemListElement":props.map((p,i)=>({"@type":"ListItem","position":i+1,"url":`${BASE_URL}/properties/${p.slug||p.id}`,"name":p.title})) });
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${meta.propertiesTitle}</title><meta name="description" content="${meta.propertiesDesc}"><link rel="canonical" href="${BASE_URL}/properties/all">${buildHreflang('/properties/all','/properties/all','en')}<script type="application/ld+json">${schema}</script></head><body><header><a href="${BASE_URL}"><strong>Malta Luxury Real Estate</strong></a></header><main><h1>Luxury Properties for Sale in Malta</h1><ul>${items}</ul></main></body></html>`;
    res.setHeader('Content-Type','text/html;charset=utf-8'); return res.send(html);
  } catch { return next(); }
});

// PROPERTIES ALL — FR/DE/IT/PL
app.get('/:locale(fr|de|it|pl)/properties/all', async (req, res, next) => {
  if (!isBot(req)) return next();
  try {
    const locale = req.params.locale;
    const meta = LOCALE_META[locale];
    const { data: props } = await supabase.from('properties').select('id,title,slug,price,location_text,bedrooms').eq('status','active').order('price',{ascending:false}).limit(30);
    if (!props?.length) return next();
    const items = props.map(p => `<li><a href="${BASE_URL}/${locale}/properties/${p.slug||p.id}"><strong>${p.title}</strong></a> — ${p.location_text||'Malta'} — €${Number(p.price).toLocaleString('en-MT')}</li>`).join('');
    const canonical = `${BASE_URL}/${locale}/properties/all`;
    const html = `<!DOCTYPE html><html lang="${meta.lang}"><head><meta charset="UTF-8"><title>${meta.propertiesTitle}</title><meta name="description" content="${meta.propertiesDesc}"><link rel="canonical" href="${canonical}">${buildHreflang('/properties/all',`/${locale}/properties/all`,locale)}</head><body><main><h1>${meta.propertiesTitle.split('|')[0].trim()}</h1><ul>${items}</ul></main></body></html>`;
    res.setHeader('Content-Type','text/html;charset=utf-8'); return res.send(html);
  } catch { return next(); }
});

// PROPERTY DETAIL — EN
app.get('/properties/:slug', async (req, res, next) => {
  if (!isBot(req)) return next();
  try {
    const slug = req.params.slug;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const { data } = isUUID ? await supabase.from('properties').select('*').eq('id',slug).single() : await supabase.from('properties').select('*').eq('slug',slug).single();
    if (!data) return next();
    res.setHeader('Content-Type','text/html;charset=utf-8');
    return res.send(buildPropertyHtml(data, 'en'));
  } catch { return next(); }
});

// PROPERTY DETAIL — FR/DE/IT/PL
app.get('/:locale(fr|de|it|pl)/properties/:slug', async (req, res, next) => {
  if (!isBot(req)) return next();
  try {
    const { locale, slug } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const { data } = isUUID ? await supabase.from('properties').select('*').eq('id',slug).single() : await supabase.from('properties').select('*').eq('slug',slug).single();
    if (!data) return next();
    res.setHeader('Content-Type','text/html;charset=utf-8');
    return res.send(buildPropertyHtml(data, locale));
  } catch { return next(); }
});

// INSIGHTS ARTICLE — EN
app.get('/insights/:slug', (req, res, next) => {
  if (!isBot(req)) return next();
  try {
    const { slug } = req.params;
    const filePath = path.join(__dirname, 'src', 'content', 'articles', 'en', `${slug}.md`);
    if (!fs.existsSync(filePath)) return next();
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { title, desc, content, image, date } = parseArticleMeta(raw);
    if (!title) return next();
    res.setHeader('Content-Type', 'text/html;charset=utf-8');
    return res.send(buildArticleHtml(slug, title, desc, content, 'en', image, date));
  } catch { return next(); }
});

// INSIGHTS ARTICLE — FR/DE/IT/PL
app.get('/:locale(fr|de|it|pl)/insights/:slug', (req, res, next) => {
  if (!isBot(req)) return next();
  try {
    const { locale, slug } = req.params;
    const localePath = path.join(__dirname, 'src', 'content', 'articles', locale, `${slug}.md`);
    const enPath = path.join(__dirname, 'src', 'content', 'articles', 'en', `${slug}.md`);
    const filePath = fs.existsSync(localePath) ? localePath : (fs.existsSync(enPath) ? enPath : null);
    if (!filePath) return next();
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { title, desc, content, image, date } = parseArticleMeta(raw);
    if (!title) return next();
    res.setHeader('Content-Type', 'text/html;charset=utf-8');
    return res.send(buildArticleHtml(slug, title, desc, content, locale, image, date));
  } catch { return next(); }
});

// ─────────────────────────────────────────────────────────────────────────────
// Static file serving — AFTER all SSR/API routes
// ─────────────────────────────────────────────────────────────────────────────

// /admin — noindex so Google doesn't index the CMS
app.use('/admin', (_req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

// Image proxy for admin thumbnails (bypasses hotlink protection on external scraped images)
app.get('/api/proxy-image', requireAdmin, async (req: any, res: any) => {
  const { url } = req.query as { url: string };
  if (!url) return res.status(400).send('Missing url');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': new URL(url).origin + '/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      }
    });
    clearTimeout(timeout);
    if (!resp.ok) return res.status(resp.status).send('Upstream error');
    const ct = resp.headers.get('content-type') || 'image/jpeg';
    const buf = await resp.arrayBuffer();
    res.set('Content-Type', ct);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buf));
  } catch (e: any) {
    res.status(500).send('Proxy error: ' + e.message);
  }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
}))
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res: any, filePath: string) => {
    // HTML files must NOT be cached long (SPA routing)
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}))
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))

app.listen(PORT, '0.0.0.0', () => console.log(`Malta Luxury Estates running on port ${PORT}`))


