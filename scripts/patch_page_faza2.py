import sys
sys.stdout.reconfigure(encoding='utf-8')

src = r'C:\Users\beatw\Desktop\malta-luxury-estates\app\[locale]\properties\[slug]\page.tsx'
with open(src, encoding='utf-8') as fp:
    content = fp.read()

# 1. Add new imports after PropertyGallery import
old_import = "import { PropertyGallery } from '@/src/components/PropertyGallery';"
new_imports = """import { PropertyGallery } from '@/src/components/PropertyGallery';
import { PropertyContactCard } from '@/src/components/PropertyContactCard';
import { StickyPropertyBar } from '@/src/components/StickyPropertyBar';"""
if old_import not in content:
    print('ERROR: import anchor not found'); sys.exit(1)
content = content.replace(old_import, new_imports, 1)

# 2. Replace the property-detail main block
old_main = '''      <main className="min-h-screen bg-luxury-black pt-24 pb-24">
        <PropertyGallery images={property.images ?? []} title={property.title} />
        <div className="max-w-5xl mx-auto px-6 pt-10 relative z-10">
          <div className="mb-8">
            <Link href="/properties/all" className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-gold transition-colors mb-6">
              <ArrowLeft size={14} />
              {t('common.back_to_listings', { defaultValue: 'Back to Listings' })}
            </Link>
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                {property.propertyType && (
                  <span className="text-[9px] uppercase tracking-[0.3em] text-gold mb-3 block">{property.propertyType}</span>
                )}
                <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">{property.title}</h1>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <MapPin size={14} />
                  <span>{property.locationName}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif text-4xl text-gold">
                  {\'€\'}{property.price?.toLocaleString(\'en-GB\')}
                </div>
                <div className="text-white/30 text-xs uppercase tracking-widest mt-1">
                  {property.type === \'rent\' ? t(\'common.per_month\', { defaultValue: \'per month\' }) : t(\'common.for_sale\', { defaultValue: \'For Sale\' })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8 mt-8 py-6 border-y border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Bed size={16} className="text-gold" />
                <span>{property.beds} {t(\'common.beds_label\')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Bath size={16} className="text-gold" />
                <span>{property.baths} {t(\'common.baths_label\')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Maximize size={16} className="text-gold" />
                <span>{property.sqm} m\xb2</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl text-white mb-6">{t(\'common.description\', { defaultValue: \'Property Description\' })}</h2>
              <div className="text-white/60 leading-relaxed whitespace-pre-line">{property.description}</div>
              {property.features && property.features.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-serif text-xl text-white mb-6">{t(\'common.features\', { defaultValue: \'Features & Amenities\' })}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/60 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="glass-card p-8 rounded-3xl border border-white/10 sticky top-28">
                <h3 className="font-serif text-xl text-white mb-2">{t(\'common.enquire\', { defaultValue: \'Enquire About This Property\' })}</h3>
                {property.agency?.name && (
                  <p className="text-white/40 text-xs mb-6">{t(\'common.listed_by\', { defaultValue: \'Listed by\' })} {property.agency.name}</p>
                )}
                <Link
                    href="/contact"
                    className="w-full block text-center py-4 gold-gradient text-luxury-black font-bold text-sm uppercase tracking-widest rounded-2xl hover:opacity-90 transition-opacity"
                  >
                    {t(\'common.contact_agent\')}
                  </Link>
              </div>
            </div>
          </div>
        </div>
      <PropertyDetailTools property={property} />
      </main>'''

new_main = '''      <main className="min-h-screen bg-luxury-black pt-24 pb-24 lg:pb-24">
        <PropertyGallery images={property.images ?? []} title={property.title} />
        <StickyPropertyBar
          title={property.title}
          price={property.price}
          image={property.images?.[0]}
          slug={property.slug ?? String(property.id)}
          statusLabel={property.type === \'rent\' ? t(\'common.per_month\', { defaultValue: \'per month\' }) : t(\'common.for_sale\', { defaultValue: \'For Sale\' })}
          sentinelId="property-title-sentinel"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10 pb-24 lg:pb-0">
          <div className="mb-8" id="property-title-sentinel">
            <Link href="/properties/all" className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-gold transition-colors mb-6">
              <ArrowLeft size={14} />
              {t(\'common.back_to_listings\', { defaultValue: \'Back to Listings\' })}
            </Link>
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                {property.propertyType && (
                  <span className="text-[9px] uppercase tracking-[0.3em] text-gold mb-3 block">{property.propertyType}</span>
                )}
                <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">{property.title}</h1>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <MapPin size={14} />
                  <span>{property.locationName}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif text-4xl text-gold">
                  {\'€\'}{property.price?.toLocaleString(\'en-GB\')}
                </div>
                <div className="text-white/30 text-xs uppercase tracking-widest mt-1">
                  {property.type === \'rent\' ? t(\'common.per_month\', { defaultValue: \'per month\' }) : t(\'common.for_sale\', { defaultValue: \'For Sale\' })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8 mt-8 py-6 border-y border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Bed size={16} className="text-gold" />
                <span>{property.beds} {t(\'common.beds_label\')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Bath size={16} className="text-gold" />
                <span>{property.baths} {t(\'common.baths_label\')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Maximize size={16} className="text-gold" />
                <span>{property.sqm} m\xb2</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl text-white mb-6">{t(\'common.description\', { defaultValue: \'Property Description\' })}</h2>
              <div className="text-white/60 leading-relaxed whitespace-pre-line">{property.description}</div>
              {property.features && property.features.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-serif text-xl text-white mb-6">{t(\'common.features\', { defaultValue: \'Features & Amenities\' })}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/60 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <PropertyContactCard
                price={property.price}
                slug={property.slug ?? String(property.id)}
                statusLabel={property.type === \'rent\' ? t(\'common.per_month\', { defaultValue: \'per month\' }) : t(\'common.for_sale\', { defaultValue: \'For Sale\' })}
                agencyName={property.agency?.name}
                agencyLogo={property.agency?.logo}
              />
            </div>
          </div>
        </div>
        <PropertyDetailTools property={property} />
      </main>'''

if old_main not in content:
    print('ERROR: main block not found - checking current state')
    idx = content.find('PropertyGallery images=')
    print(repr(content[idx:idx+200]))
    sys.exit(1)

content = content.replace(old_main, new_main, 1)
print('Replaced main block')

with open(src, 'w', encoding='utf-8') as fp:
    fp.write(content)
print('File written OK')