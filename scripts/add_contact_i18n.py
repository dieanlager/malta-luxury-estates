import json, sys, os
sys.stdout.reconfigure(encoding="utf-8")

base = r"C:\Users\beatw\Desktop\malta-luxury-estates\public\locales"

contact_keys = {
    "en": {
        "request_viewing": "Request a viewing",
        "contact_agent": "Contact agent",
        "listed_by": "Listed by",
        "save": "Save",
        "share": "Share",
    },
    "de": {
        "request_viewing": "Besichtigung anfragen",
        "contact_agent": "Makler kontaktieren",
        "listed_by": "Angeboten von",
        "save": "Speichern",
        "share": "Teilen",
    },
    "fr": {
        "request_viewing": "Demander une visite",
        "contact_agent": "Contacter l’agent",
        "listed_by": "Proposé par",
        "save": "Sauvegarder",
        "share": "Partager",
    },
    "it": {
        "request_viewing": "Richiedi una visita",
        "contact_agent": "Contatta l’agente",
        "listed_by": "Proposto da",
        "save": "Salva",
        "share": "Condividi",
    },
    "pl": {
        "request_viewing": "Umów oglądanie",
        "contact_agent": "Skontaktuj się z agentem",
        "listed_by": "Oferowane przez",
        "save": "Zapisz",
        "share": "Udostępnij",
    },
}

for locale, keys in contact_keys.items():
    path = os.path.join(base, locale, "property_detail.json")
    with open(path, encoding="utf-8-sig") as fp:
        data = json.load(fp)
    data["contact"] = keys
    with open(path, "w", encoding="utf-8") as fp:
        json.dump(data, fp, ensure_ascii=False, indent=2)
    print(locale + ": contact.* written")

print("Done")