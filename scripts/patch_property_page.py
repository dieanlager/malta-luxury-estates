import sys
sys.stdout.reconfigure(encoding='utf-8')

src = r'C:\Users\beatw\Desktop\malta-luxury-estates\app\[locale]\properties\[slug]\page.tsx'

with open(src, encoding='utf-8-sig') as fp:
    content = fp.read()

# Add PropertyGallery import after the last existing import
old_import = "import PropertyDetailTools from '@/src/components/PropertyDetailTools';"
new_import = "import PropertyDetailTools from '@/src/components/PropertyDetailTools';\nimport { PropertyGallery } from '@/src/components/PropertyGallery';"

if old_import not in content:
    print('ERROR: import anchor not found')
    sys.exit(1)
content = content.replace(old_import, new_import, 1)

# Replace <main> opening + hero + thumbnail grid + old wrapper div
# Find the exact property-detail <main> block
main_start = content.find('      <main className="min-h-screen bg-luxury-black pt-24 pb-24">')
if main_start == -1:
    print('ERROR: main block not found')
    print(repr(content[content.find('pt-24'):content.find('pt-24')+200]))
    sys.exit(1)

# Find the next <div className="max-w-5xl
next_div = content.find('        <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10">', main_start)
if next_div == -1:
    print('ERROR: -mt-32 div not found')
    idx = content.find('-mt-32', main_start)
    print(repr(content[idx-50:idx+100]))
    sys.exit(1)

old_section = content[main_start:next_div + len('        <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10">')]
new_section = '''      <main className="min-h-screen bg-luxury-black pt-24 pb-24">
        <PropertyGallery images={property.images ?? []} title={property.title} />
        <div className="max-w-5xl mx-auto px-6 pt-10 relative z-10">'''

content = content.replace(old_section, new_section, 1)
print('Replaced hero+thumbnail section')

with open(src, 'w', encoding='utf-8') as fp:
    fp.write(content)
print('File written OK')