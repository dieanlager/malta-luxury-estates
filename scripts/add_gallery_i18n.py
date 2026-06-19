import json, os, copy

def deep_merge(base, patch):
    result = copy.deepcopy(base)
    for key, val in patch.items():
        if key in result and isinstance(result[key], dict) and isinstance(val, dict):
            result[key] = deep_merge(result[key], val)
        else:
            result[key] = val
    return result

BASE = r'C:\Users\beatw\Desktop\malta-luxury-estates\public\locales'

a=chr(228); o=chr(246); u=chr(252)
pa=chr(261); pc=chr(263); pe=chr(281); po=chr(243)
em=chr(8212)

patches = {
'en': {'gallery': {
  'view_all': 'View all {count} photos',
  'photo_alt': '{title} ' + em + ' photo {index}',
  'counter': '{current} / {total}',
  'no_images': 'Photos coming soon',
}},
'de': {'gallery': {
  'view_all': 'Alle {count} Fotos ansehen',
  'photo_alt': '{title} ' + em + ' Foto {index}',
  'counter': '{current} / {total}',
  'no_images': 'Fotos demn' + a + 'chst verf' + u + 'gbar',
}},
'fr': {'gallery': {
  'view_all': 'Voir les {count} photos',
  'photo_alt': '{title} ' + em + ' photo {index}',
  'counter': '{current} / {total}',
  'no_images': 'Photos disponibles prochainement',
}},
'it': {'gallery': {
  'view_all': 'Vedi tutte le {count} foto',
  'photo_alt': '{title} ' + em + ' foto {index}',
  'counter': '{current} / {total}',
  'no_images': 'Foto disponibili a breve',
}},
'pl': {'gallery': {
  'view_all': 'Zobacz wszystkie {count} zdj' + pe + chr(263),
  'photo_alt': '{title} ' + em + ' zdj' + pe + 'cie {index}',
  'counter': '{current} / {total}',
  'no_images': 'Zdj' + pe + 'cia wkr' + po + 'tce dost' + pe + 'pne',
}},
}

for lang, patch in patches.items():
    p = os.path.join(BASE, lang, 'property_detail.json')
    with open(p, encoding='utf-8-sig') as fp:
        data = json.load(fp)
    merged = deep_merge(data, patch)
    with open(p, 'w', encoding='utf-8') as fp:
        json.dump(merged, fp, ensure_ascii=False, indent=2)
    print('OK', lang)