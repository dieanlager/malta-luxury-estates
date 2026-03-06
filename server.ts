import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ============================================================
  // DYNAMIC SITEMAP.XML – Generates 500+ URLs for pSEO
  // Google needs this to discover all programmatic pages
  // ============================================================
  app.get("/sitemap.xml", (req, res) => {
    const BASE = "https://maltaluxuryrealestate.com";

    const locations = [
      'sliema', 'st-julians', 'valletta', 'mdina', 'mellieha',
      'victoria', 'swieqi', 'attard', 'madliena', 'san-pawl-il-bahar',
      'naxxar', 'marsascala', 'three-cities', 'xlendi', 'gharghur'
    ];

    const filterSlugs = [
      'under-500k', 'under-1m', '500k-1m', 'over-1m', 'over-3m',
      'sea-view', 'with-pool', 'new-build', 'furnished',
      'for-sale', 'for-rent', '3-bed-plus',
    ];

    const typeSlugs = [
      'apartments', 'villas', 'penthouses',
      'houses-of-character', 'maisonettes', 'palazzos',
    ];

    const articleSlugs = [
      // Phase 1 (5 articles)
      'buying-property-in-malta-as-a-foreigner-2026',
      'malta-real-estate-investment-guide-2026',
      'property-taxes-malta-2026',
      'special-designated-areas-malta-guide',
      'rental-yields-malta-2026',
      // Phase 2 (4 articles)
      'step-by-step-buying-process-malta',
      'selling-property-malta-complete-guide',
      'rental-law-malta-landlords-tenants-2026',
      'short-let-vs-long-let-malta-2026',
      // Phase 3 (2 articles)
      'malta-permanent-residency-property-mprp',
      'property-inheritance-malta',
      // Phase 3B (2 articles)
      'moving-to-malta-complete-guide',
      'rental-income-tax-malta-2026',
      // Phase 4 (2 articles)
      'planning-permission-malta-guide',
      'mortgage-malta-foreigners-guide-2026',
      // Phase 4B (2 articles)
      'off-plan-buying-guide-malta-2026',
      'gozo-property-investment-guide-2026',
      // Phase 5 (2 articles)
      'student-accommodation-malta-guide-2026',
      'sda-projects-complete-list-malta-2026',
      // Phase 5B (2 articles)
      'cost-of-living-malta-2026',
      'malta-property-market-forecast-2026-2030',
    ];

    const today = new Date().toISOString().split('T')[0];

    let urls = '';

    // Homepage
    urls += `  <url><loc>${BASE}/</loc><changefreq>daily</changefreq><priority>1.0</priority><lastmod>${today}</lastmod></url>\n`;
    // All Properties
    urls += `  <url><loc>${BASE}/properties/all</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    // Insights Hub
    urls += `  <url><loc>${BASE}/insights</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;

    // City pages (priority 0.9 – pillar pages)
    for (const loc of locations) {
      urls += `  <url><loc>${BASE}/properties/${loc}</loc><changefreq>daily</changefreq><priority>0.9</priority><lastmod>${today}</lastmod></url>\n`;
    }

    // City + property type pages (priority 0.8)
    for (const loc of locations) {
      for (const type of typeSlugs) {
        urls += `  <url><loc>${BASE}/properties/${loc}/${type}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
      }
    }

    // City + filter pages (priority 0.7 – long-tail)
    for (const loc of locations) {
      for (const filter of filterSlugs) {
        urls += `  <url><loc>${BASE}/properties/${loc}/${filter}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
      }
    }

    // Knowledge Hub articles (priority 0.8)
    for (const slug of articleSlugs) {
      urls += `  <url><loc>${BASE}/insights/${slug}</loc><changefreq>monthly</changefreq><priority>0.8</priority><lastmod>${today}</lastmod></url>\n`;
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // ============================================================
  // ROBOTS.TXT – Controls crawler behavior
  // ============================================================
  app.get("/robots.txt", (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://maltaluxuryrealestate.com/sitemap.xml
`);
  });

  // API: Contact Form
  // TODO: Integrate Resend.com for actual email delivery
  // npm install resend → add RESEND_API_KEY to .env
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, message, propertyId, propertyTitle } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const inquiry = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name,
        email,
        phone: phone || "",
        message: message || "",
        propertyId: propertyId || null,
        propertyTitle: propertyTitle || null,
        timestamp: new Date().toISOString(),
        status: "new",
      };

      console.log(`[Contact] New inquiry from ${name} (${email}) for property: ${propertyTitle || 'general'}`);

      // Store inquiry to JSON file (simple persistence for MVP)
      const fs = await import("fs");
      const inquiriesPath = path.join(__dirname, "data", "inquiries.json");
      const dataDir = path.join(__dirname, "data");

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      let inquiries: any[] = [];
      if (fs.existsSync(inquiriesPath)) {
        inquiries = JSON.parse(fs.readFileSync(inquiriesPath, "utf-8"));
      }
      inquiries.push(inquiry);
      fs.writeFileSync(inquiriesPath, JSON.stringify(inquiries, null, 2));

      // TODO: When Resend is set up, uncomment:
      // import { Resend } from 'resend';
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: 'Malta Luxury Real Estate <noreply@maltaluxuryrealestate.com>',
      //   to: 'info@maltaluxuryrealestate.com',
      //   replyTo: email,
      //   subject: `New inquiry – ${propertyTitle || 'General'}`,
      //   html: `<h2>New Property Inquiry</h2>
      //          <p><strong>From:</strong> ${name} (${email})</p>
      //          <p><strong>Phone:</strong> ${phone}</p>
      //          <p><strong>Property:</strong> ${propertyTitle || 'N/A'}</p>
      //          <p><strong>Message:</strong> ${message}</p>`
      // });

      return res.status(200).json({ success: true, id: inquiry.id });
    } catch (e) {
      console.error("[Contact] Error:", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // API: Import Properties (Standard for Agencies)
  // This is a stub implementation as requested, ready for DB integration
  app.post("/api/import/properties", async (req, res) => {
    try {
      const { agency_id, source_name, properties } = req.body;

      if (!agency_id || !Array.isArray(properties)) {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      console.log(`[Import] Received ${properties.length} properties from agency: ${agency_id}`);

      let created = 0;
      let updated = 0;
      const errors: string[] = [];

      // In a real app, you would loop and save to DB (SQLite/Postgres)
      // For now, we just simulate success
      properties.forEach((p: any) => {
        if (!p.external_id || !p.location_slug) {
          errors.push(`Missing fields for external_id=${p.external_id || 'unknown'}`);
        } else {
          created++;
        }
      });

      return res.status(200).json({
        status: "ok",
        agency_id,
        imported: created + updated,
        updated,
        created,
        errors
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: __dirname,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
