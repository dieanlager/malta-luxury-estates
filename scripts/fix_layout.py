import sys
sys.stdout.reconfigure(encoding="utf-8")

src = r"C:\Users\beatw\Desktop\malta-luxury-estates\app\layout.tsx"
with open(src, encoding="utf-8-sig") as fp:
    content = fp.read()

# Fix garbled em dash in title
content = content.replace(
    "Malta Luxury Real Estate â Luxury Property for Sale in Malta",
    "Malta Luxury Real Estate — Luxury Property for Sale in Malta"
)
content = content.replace(
    "Malta Luxury Real Estate â€“ Luxury Property for Sale in Malta",
    "Malta Luxury Real Estate — Luxury Property for Sale in Malta"
)
# simpler: just find the garbled pattern
import re
content = re.sub(
    r"Malta Luxury Real Estate [^—']+Luxury Property for Sale in Malta",
    "Malta Luxury Real Estate — Luxury Property for Sale in Malta",
    content
)

new_content = """import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

const BASE_URL = 'https://www.maltaluxuryrealestate.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Malta Luxury Real Estate — Luxury Property for Sale in Malta',
    template: '%s | Malta Luxury Real Estate',
  },
  description: 'Discover the finest luxury real estate in Malta. Exclusive property for sale, penthouses, and villas. Your premier Malta property partner.',
  openGraph: {
    type: 'website',
    siteName: 'Malta Luxury Real Estate',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Malta Luxury Real Estate' }],
  },
  twitter: { card: 'summary_large_image' },
  verification: { google: '6dHOYfMYPGAfqjVSSTjmknLrEppz2TSz2PpMacUQ7CI' },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
};

const ga4Id = 'G-WKQN5F0HGK';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RealEstateAgent',
              name: 'Malta Luxury Real Estate',
              url: BASE_URL,
              logo: `${BASE_URL}/favicon.png`,
              email: 'info@maltaluxuryrealestate.com',
              description: 'Premium real estate agency in Malta specializing in luxury property for sale, penthouses and villas.',
              address: { '@type': 'PostalAddress', addressLocality: 'Malta', addressCountry: 'MT' },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Malta Luxury Real Estate',
              url: BASE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/properties/all?q={search_term_string}` },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
"""

with open(src, "w", encoding="utf-8") as fp:
    fp.write(new_content)
print("layout.tsx written")