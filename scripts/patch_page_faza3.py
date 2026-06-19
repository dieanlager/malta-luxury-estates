import sys
sys.stdout.reconfigure(encoding="utf-8")

src = r"C:\Users\beatw\Desktop\malta-luxury-estates\app\[locale]\properties\[slug]\page.tsx"
with open(src, encoding="utf-8") as fp:
    content = fp.read()

# 1. Add imports
old_imports = "import { PropertyContactCard } from '@/src/components/PropertyContactCard';"
new_imports = """import { PropertyContactCard } from '@/src/components/PropertyContactCard';
import { AmenitiesGrid } from '@/src/components/AmenitiesGrid';"""
if old_imports not in content:
    print("ERROR: import anchor not found"); import sys; sys.exit(1)
content = content.replace(old_imports, new_imports, 1)

# 2. Add property_detail translations alongside common
old_t = "  const t = await getTranslations({ locale, namespace: 'common' });"
new_t = """  const t = await getTranslations({ locale, namespace: 'common' });
  const tPD = await getTranslations({ locale, namespace: 'property_detail' });"""
# Only replace in the property-detail function (second occurrence in file)
parts = content.split(old_t)
if len(parts) < 3:
    print(f"ERROR: getTranslations anchor found {len(parts)-1} times (need 2)")
    import sys; sys.exit(1)
# Replace only the last occurrence (property detail page function)
content = old_t.join(parts[:-1]) + new_t + parts[-1]

# 3. Replace old specs row with new specs strip
old_specs = """            <div className="flex items-center gap-8 mt-8 py-6 border-y border-white/10">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Bed size={16} className="text-gold" />
                <span>{property.beds} {t('common.beds_label')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Bath size={16} className="text-gold" />
                <span>{property.baths} {t('common.baths_label')}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Maximize size={16} className="text-gold" />
                <span>{property.sqm} m\xb2</span>
              </div>
            </div>"""

new_specs = """            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              {property.beds ? (
                <div className="glass-card border border-white/10 rounded-2xl p-5 text-center">
                  <Bed size={24} className="text-gold mx-auto mb-2" aria-hidden="true" />
                  <div className="font-serif text-3xl text-white">{property.beds}</div>
                  <div className="text-white/50 text-[10px] uppercase tracking-widest mt-1">{t('common.beds_label')}</div>
                </div>
              ) : null}
              {property.baths ? (
                <div className="glass-card border border-white/10 rounded-2xl p-5 text-center">
                  <Bath size={24} className="text-gold mx-auto mb-2" aria-hidden="true" />
                  <div className="font-serif text-3xl text-white">{property.baths}</div>
                  <div className="text-white/50 text-[10px] uppercase tracking-widest mt-1">{t('common.baths_label')}</div>
                </div>
              ) : null}
              {property.sqm ? (
                <div className="glass-card border border-white/10 rounded-2xl p-5 text-center">
                  <Maximize size={24} className="text-gold mx-auto mb-2" aria-hidden="true" />
                  <div className="font-serif text-3xl text-white">{property.sqm}</div>
                  <div className="text-white/50 text-[10px] uppercase tracking-widest mt-1">{tPD('specs.area')} m\xb2</div>
                </div>
              ) : null}
              {property.propertyType ? (
                <div className="glass-card border border-white/10 rounded-2xl p-5 text-center">
                  <Home size={24} className="text-gold mx-auto mb-2" aria-hidden="true" />
                  <div className="font-serif text-lg text-white truncate">{property.propertyType}</div>
                  <div className="text-white/50 text-[10px] uppercase tracking-widest mt-1">{tPD('specs.type')}</div>
                </div>
              ) : null}
            </div>"""

if old_specs not in content:
    print("ERROR: old specs not found - checking content:")
    idx = content.find("border-y border-white/10")
    print(repr(content[max(0,idx-100):idx+200]))
    import sys; sys.exit(1)
content = content.replace(old_specs, new_specs, 1)
print("Specs strip replaced")

# 4. Fix contrast: text-white/60 -> text-white/90 on description
old_desc = '              <div className="text-white/60 leading-relaxed whitespace-pre-line">{property.description}</div>'
new_desc = '              <div className="text-white/85 leading-relaxed whitespace-pre-line text-[1.0625rem]">{property.description}</div>'
if old_desc in content:
    content = content.replace(old_desc, new_desc, 1)
    print("Contrast fixed")
else:
    print("WARNING: description div not found for contrast fix")

# 5. Replace features list with AmenitiesGrid
old_features = """              {property.features && property.features.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-serif text-xl text-white mb-6">{t('common.features', { defaultValue: 'Features & Amenities' })}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/60 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}"""

new_features = """              <AmenitiesGrid
                features={property.features ?? []}
                heading={t('common.features', { defaultValue: 'Features & Amenities' })}
              />"""

if old_features in content:
    content = content.replace(old_features, new_features, 1)
    print("AmenitiesGrid replacing features list")
else:
    print("WARNING: features block not found - checking")
    idx = content.find("property.features.map")
    print(repr(content[max(0,idx-100):idx+200]))

# 6. Add Home to imports (for specs strip propertyType icon)
old_lucide = "import { Bed, Bath, Maximize, MapPin, ArrowLeft } from 'lucide-react';"
new_lucide = "import { Bed, Bath, Maximize, MapPin, ArrowLeft, Home } from 'lucide-react';"
if old_lucide in content:
    content = content.replace(old_lucide, new_lucide, 1)
    print("Home icon import added")

with open(src, "w", encoding="utf-8") as fp:
    fp.write(content)
print("page.tsx updated OK")