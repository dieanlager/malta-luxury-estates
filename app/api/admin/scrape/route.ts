import { NextRequest, NextResponse } from 'next/server';
import { load as cheerioLoad } from 'cheerio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function requireAdmin(req: NextRequest) {
  return req.headers.get('x-admin-key') === (process.env.ADMIN_KEY || 'malta2026admin');
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

  try {
    const html = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }).then(r => r.text());
    const $ = cheerioLoad(html);

    const title = $('h1').first().text().trim() || $('title').text().split('|')[0].trim();

    let price = 0;
    $('*').each((_: any, el: any) => {
      const t = $(el).text().trim();
      const m = t.match(/€\s*([\d,\.]+)/) || t.match(/([\d,\.]+)\s*€/);
      if (m && !price) {
        const n = parseFloat(m[1].replace(/,/g, ''));
        if (n > 10000) price = n;
      }
    });

    let beds = 0, baths = 0, sqm = 0;
    const fullText = $('body').text();
    const bedMatch = fullText.match(/(\d+)\s*(?:Bedroom|bedroom|bed|Bed)/);
    const bathMatch = fullText.match(/(\d+)\s*(?:Bathroom|bathroom|bath|Bath)/);
    const sqmMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:m2|sqm|sq\.m|sq m)/i);
    if (bedMatch) beds = parseInt(bedMatch[1]);
    if (bathMatch) baths = parseInt(bathMatch[1]);
    if (sqmMatch) sqm = parseFloat(sqmMatch[1]);

    const location_text = url.includes('mellieha') ? 'Mellieha'
      : url.includes('sliema') ? 'Sliema'
      : url.includes('valletta') ? 'Valletta'
      : url.includes('gozo') ? 'Gozo'
      : url.includes('st-julian') ? "St Julian's"
      : url.includes('msida') ? 'Msida'
      : url.includes('mosta') ? 'Mosta' : 'Malta';

    const listing_type = fullText.toLowerCase().includes('for rent') ? 'rent' : 'sale';
    let description = $('p').map((_: any, el: any) => $(el).text().trim()).get()
      .filter((t: string) => t.length > 20).slice(0, 3).join('\n\n');

    const images: string[] = [];
    $('img').each((_: any, el: any) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src && (src.includes('/resize/') || src.includes('/crop/') || src.includes('property') || src.includes('upload'))
        && !images.includes(src) && images.length < 10) images.push(src);
    });

    const fullTextLower = fullText.toLowerCase();
    const is_seafront = fullTextLower.includes('sea view') || fullTextLower.includes('seafront');
    const has_pool = fullTextLower.includes('pool');
    const has_garage = fullTextLower.includes('garage') || fullTextLower.includes('parking');

    let aiDescription = description;
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
        });
        const groqData = await groqRes.json() as any;
        aiDescription = groqData.choices?.[0]?.message?.content?.trim() || description;
      } catch (e) { console.error('Groq error:', e); }
    }

    const featureKeywords: Record<string, string> = {
      'sea view': 'Sea Views', 'seafront': 'Sea Views', 'pool': 'Swimming Pool',
      'garage': 'Garage', 'parking': 'Private Parking', 'air condition': 'Air Conditioning',
      'balcon': 'Balcony', 'terrace': 'Terrace', 'lift': 'Elevator', 'elevator': 'Elevator',
      'furnished': 'Furnished', 'en-suite': 'En-suite Bathrooms', 'solar': 'Solar Panels',
      'concierge': 'Concierge', 'gym': 'Gym', 'security': '24/7 Security',
    };
    const features = Object.entries(featureKeywords)
      .filter(([kw]) => fullTextLower.includes(kw))
      .map(([, label]) => label)
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

    return NextResponse.json({ title, price, beds, baths, sqm, location_text, listing_type, description: aiDescription, is_seafront, has_pool, has_garage, images, affiliate_url: url, features });
  } catch (err: any) {
    console.error('Scrape error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
