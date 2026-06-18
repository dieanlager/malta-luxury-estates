// Translate manually-added keys via DeepL — fixes ASCII-ified umlauts in DE/IT/FR/PL
const deepl = require('deepl-node');
const fs = require('fs');
const path = require('path');

const DEEPL_KEY = process.argv[2];
if (!DEEPL_KEY) { console.error('Usage: node deepl-translate.js <API_KEY>'); process.exit(1); }

const translator = new deepl.Translator(DEEPL_KEY);
const BASE = path.join(__dirname, '..', 'public', 'locales');
const LANG_MAP = { de: 'DE', it: 'IT', fr: 'FR', pl: 'PL' };

// EN source — single source of truth
const keys = {
  'home.hero.eyebrow':       "Malta's #1 Premium Real Estate Marketplace",
  'home.hero.title':         "Luxury Real Estate",
  'home.hero.title2':        "in Malta",
  'home.hero.subtitle':      "Curated listings from Malta's leading agencies for international buyers, HNWIs, and residency seekers.",
  'home.hero.cta_browse':    "Browse Properties",
  'home.hero.cta_quiz':      "Take the Quiz",
  'home.featured.eyebrow':   "Exclusive Portfolio",
  'home.featured.title':     "Curated Selection",
  'home.locations.eyebrow':  "Explore by Location",
  'home.locations.title':    "Malta's Finest Addresses",
  'home.insights.eyebrow':   "Market Intelligence",
  'home.insights.title':     "Property Insights",
  'home.insights.description': "Expert guides and market analysis for Malta real estate buyers and investors.",
  'home.insights.cta':       "View All Insights",
  'contact.eyebrow':         "Get in Touch",
  'contact.subtitle':        "Our team of experts is ready to assist you in finding your perfect Malta property.",
  'contact.name':            "Full Name",
  'contact.name_placeholder': "John Smith",
  'contact.email':           "Email Address",
  'contact.email_placeholder': "john@example.com",
  'contact.message':         "Message",
  'contact.message_placeholder': "Tell us about your property requirements...",
  'contact.submit':          "Send Message",
  'valuation.eyebrow':       "AI-Powered",
  'valuation.subtitle':      "Get an instant AI estimate for any Malta or Gozo property.",
  'quiz.eyebrow':            "Property Matcher",
  'quiz.subtitle':           "Answer a few questions and we'll match you with the ideal property type and location.",
  'about.eyebrow':           "Our Story",
  'about.p1':                "Malta Luxury Real Estate was founded to connect discerning international buyers with Malta's finest properties.",
  'about.p2':                "We work exclusively with licensed agencies and developers to bring you a curated selection of premium real estate across Malta and Gozo.",
  'about.browse_properties': "Browse Properties",
  'common.knowledge_hub':    "Knowledge Hub",
  'common.all':              "All",
  'common.contact_us':       "Contact Us",
  'common.our_collection':   "Our Collection",
  'common.back_to_listings': "Back to Listings",
  'common.description':      "Description",
  'common.features':         "Features",
  'common.for_sale':         "For Sale",
  'common.listed_by':        "Listed by",
  'common.view_listing':     "View Listing",
  'common.explore_location': "Explore Location",
  'common.faq':              "Frequently Asked Questions",
  'common.view_properties':  "View Properties",
  'common.browse_properties':"Browse Properties",
  'market.avg_price':        "Average Price",
  'market.avg_size':         "Average Size",
  'market.data_updated':     "Data Updated",
  'market.for_sale':         "For Sale",
  'market.live_data':        "Live Data",
  'market.subtitle':         "Real-time market intelligence for Malta property buyers and investors.",
  'market.total_listings':   "Total Listings",
};

function setNested(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

const keyNames = Object.keys(keys);
const texts = Object.values(keys);

async function run() {
  for (const [lang, deeplLang] of Object.entries(LANG_MAP)) {
    const filePath = path.join(BASE, lang, 'common.json');
    const raw = fs.readFileSync(filePath, 'utf-8').replace(/^﻿/, ''); // strip BOM
    const json = JSON.parse(raw);

    console.log(`\nTranslating ${keyNames.length} keys → ${deeplLang}...`);
    const results = await translator.translateText(texts, 'EN', deeplLang);

    keyNames.forEach((k, i) => {
      setNested(json, k, results[i].text);
    });

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', { encoding: 'utf-8' });
    console.log(`  ✓ Saved ${lang}/common.json`);
  }
  console.log('\n✓ All done.');
}

run().catch(e => { console.error(e.message || e); process.exit(1); });