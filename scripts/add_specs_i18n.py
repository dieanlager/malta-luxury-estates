import json, sys, os
sys.stdout.reconfigure(encoding="utf-8")

base = r"C:\Users\beatw\Desktop\malta-luxury-estates\public\locales"

specs = {
    "en": {"area": "Area", "type": "Type"},
    "de": {"area": "Fläche", "type": "Typ"},
    "fr": {"area": "Surface", "type": "Type"},
    "it": {"area": "Superficie", "type": "Tipo"},
    "pl": {"area": "Powierzchnia", "type": "Typ"},
}

for locale, keys in specs.items():
    path = os.path.join(base, locale, "property_detail.json")
    with open(path, encoding="utf-8-sig") as fp:
        data = json.load(fp)
    data["specs"] = keys
    with open(path, "w", encoding="utf-8") as fp:
        json.dump(data, fp, ensure_ascii=False, indent=2)
    print(locale + ": specs.* written -> " + json.dumps(keys, ensure_ascii=False))

print("Done")