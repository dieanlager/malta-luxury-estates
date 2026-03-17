## URL & i18n audit – Malta Luxury Estates

### 1. Zakres i metodologia

- Przeanalizowane elementy:
  - Router (`src/App.tsx`) – wszystkie ścieżki `Route`.
  - i18n (`src/i18n.ts`, `public/locales/*/common.json`) – klucze `slugs.*`.
  - SEO (`src/lib/seo/meta.ts` i `canonicalPath` w stronach) – generowanie `canonical` i `hreflang`.
  - Linki nawigacyjne (`Navbar`, `Footer`, `HomePage`, `InsightsHub`, itp.).
- Celem audytu jest:
  - Lista wszystkich głównych URL-i (EN) i ich wariantów językowych.
  - Wykrycie niespójności: 404, rozjazdy między canonical a routerem, aliasy URL-i, mieszanie języków w ścieżkach.
  - Rekomendacje ujednolicenia (bez wdrożeń).

---

### 2. Sekcje i główne URL-e (EN)

- **Home**: `/`
- **Properties**:
  - Lista: `/properties/all`
  - Miasto: `/properties/:citySlug`
  - Detal: `/properties/:id`
- **Market Live**: `/market/live`
- **Insights**:
  - Hub: `/insights`
  - Artykuł: `/insights/:slug`
  - Gozo Bridge Effect (planowane): `/insights/gozo-bridge-effect`
- **Tools**:
  - AI Property Price Oracle: `/tools/property-valuation` (canonical w SEO, brak trasy w routerze).
  - Malta Property Quiz: `/tools/property-quiz` (canonical w SEO, brak trasy w routerze).
- **Agency**:
  - Login: `/agency/login`
  - Register: `/agency/register`
  - Portal: `/agency/portal`
- **Legal / About**:
  - About: `/about`
  - Privacy: `/privacy-policy`
  - Terms: `/terms-of-service`
  - Cookies: `/cookie-policy`

---

### 3. Mapowanie slugów i mechanika i18n

- Języki: `en`, `it`, `de`, `fr`, `pl`.
- Główne źródło slugów: `slugs.*` w `public/locales/*/common.json`, np.:
  - IT: `properties: "immobiliare"`, `all: "tutti"`, `insights: "approfondimenti"`, `market: "mercato"`, `live: "in-diretta"`, `tools: "strumenti"`, `valuation: "valutazione-immobiliare"`, `quiz: "quiz-immobiliare"`.
  - DE: `properties: "immobilien"`, `all: "alle"`, `insights: "einblicke"`, `market: "markt"`, `live: "live-ticker"`, `tools: "tools"`, `valuation: "immobilienbewertung"`, `quiz: "immobilien-quiz"`.
  - FR: `properties: "proprietes"`, `all: "toutes"`, `insights: "conseils"`, `market: "marche"`, `live: "en-direct"`, `tools: "outils"`, `valuation: "estimation-immobiliere"`, `quiz: "quiz-immobilier"`.
  - PL: `properties: "nieruchomosci"`, `all: "wszystkie"`, `insights: "wiedza"`, `market: "rynek"`, `live: "na-zywo"`, `tools: "narzedzia"`, `valuation: "wycena-nieruchomosci"`, `quiz: "quiz-nieruchomosci"`.
- Funkcje:
  - `getLocalizedPath(path)` (Navbar, Footer, HomePage):
    - EN: zwraca `path` bez zmian.
    - Inne języki: tłumaczy każdy segment przez `slugs.*` i dokleja prefiks `/:lng`.
  - `LanguageSelector`:
    - Wykrywa aktualny język po `/:lng`.
    - Używa `slugReverseMap`, by przemapować tłumaczone slug-i z powrotem na „core” (`properties`, `insights`, `market`, `tools`, `valuation`, `quiz`).
    - Artykuły obsługuje przez `getLocalizedArticleLink` i `articleSlugs`.
  - `usePageMeta`:
    - Z `canonicalPath` generuje `hreflang` dla każdego języka, tłumacząc segmenty przez `slugs.*`.

---

### 4. Audyt per sekcja (EN / IT / DE / FR / PL)

#### 4.1. Home

- EN: `/`
- IT/DE/FR/PL: `/:lng`
- **Status**: OK – brak slugów, czysty prefiks językowy, brak kolizji.

---

#### 4.2. Properties – lista, miasto, detal

**Lista wszystkich**

- EN (kanoniczne): `/properties/all`.
- Docelowe (wg `slugs`):
  - IT: `/it/immobiliare/tutti`
  - DE: `/de/immobilien/alle`
  - FR: `/fr/proprietes/toutes`
  - PL: `/pl/nieruchomosci/wszystkie`
- Router:
  - Aliasowa pętla `p ∈ ['properties', 'nieruchomosci', 'immobiliare', 'immobilien', 'proprietes']`:
    - `/${p}/all`
    - `/:lng/${p}/all`
    - Specjalne warianty z przetłumaczonym `all`: `/:lng/${p}/wszystkie`, `/:lng/${p}/tutti`, `/:lng/${p}/alle`, `/:lng/${p}/toutes`.
- **Status**:
  - Funkcjonalnie OK (mało prawdopodobne 404).
  - Duża liczba aliasów (np. `/nieruchomosci/all`, `/pl/properties/all`) → potencjalna duplikacja SEO i mieszanie języków w jednej ścieżce.

**Miasto**

- EN: `/properties/:citySlug`.
- IT/DE/FR/PL:
  - Wzorce typu `/:lng/{slugs.properties}/:citySlug` oraz aliasy z bazą `properties`.
- Mechanika:
  - `getLocalizedPath` nie tłumaczy segmentu miasta (slug miasta zawsze EN), tłumaczy tylko bazę (`properties` → `nieruchomosci` itp.).
- **Status**:
  - OK funkcjonalnie; świadoma decyzja, że slugi miast pozostają angielskie.
  - Znów nadmiar aliasów baz (EN/zlokalizowane) z i bez `/:lng`.

**Detail**

- EN: `/properties/:id`.
- Inne języki:
  - Router: `/:lng/${p}/:id` (p jak wyżej).
  - SEO: `usePageMeta` ma specjalną logikę dla `/properties/\d+` i generuje zlokalizowany canonical.
- **Status**:
  - OK funkcjonalnie i SEO; małe rozjazdy możliwe (canonical EN jako baza dla hreflang), ale nie jest to krytyczny błąd.

---

#### 4.3. Market Live

- EN: `/market/live`.
- Docelowe wg slugów:
  - IT: `/it/mercato/in-diretta`
  - DE: `/de/markt/live-ticker`
  - FR: `/fr/marche/en-direct`
  - PL: `/pl/rynek/na-zywo`
- Router:
  - Aliasowa pętla `p ∈ ['market', 'rynek', 'mercato', 'markt', 'marche']`:
    - `/${p}/live`, `/:lng/${p}/live`.
    - Dodatkowe warianty tłumaczone: `/:lng/${p}/na-zywo`, `/:lng/${p}/in-diretta`, `/:lng/${p}/live-ticker`, `/:lng/${p}/en-direct`.
- **Status**:
  - OK funkcjonalnie i i18n.
  - Jak wcześniej – sporo aliasów, ale canonical + hreflang z `usePageMeta` są poprawnie zestrojone.

---

#### 4.4. Insights Hub i artykuły

**Hub**

- EN: `/insights`.
- Inne języki:
  - IT: `/it/approfondimenti`
  - DE: `/de/einblicke`
  - FR: `/fr/conseils`
  - PL: `/pl/wiedza`
- Router:
  - Pętla `p ∈ ['insights', 'wiedza', 'approfondimenti', 'einblicke', 'conseils']`:
    - `/${p}` i `/:lng/${p}`.
- **Status**:
  - OK w wariantach z `/:lng` (zgodne z `slugs.*` i nawigacją).
  - Aliasowe ścieżki bez języka (np. `/wiedza`) są duplikatami.

**Artykuły**

- EN: `/insights/:slug`.
- Inne języki:
  - `/:lng/{slugs.insights}/:localizedSlug` – generowane przez `getLocalizedArticleLink` i mapę `articleSlugs`.
- Router:
  - `/${p}/:slug` oraz `/:lng/${p}/:slug` dla `p` jak wyżej.
- **Status**:
  - Spójne, pełne zlokalizowanie slugów artykułów.
  - Istnieją aliasy z bazą `insights` w nie-EN, ale to raczej fallback niż bug.

**Gozo Bridge Effect**

- Canonical strony TSX: `/insights/gozo-bridge-effect`.
- Router:
  - Brak dedykowanej trasy dla `GozoBridgeTrackerPage`.
  - Temat jest też reprezentowany jako sekcja na `/market/live`.
- **Status**:
  - Problem logiczny: istnieje strona z canonicalem, do której nie prowadzi żadna trasa.
  - Możliwy konflikt z ewentualnym artykułem markdown o tym samym slugu.

---

#### 4.5. Tools – AI Property Price Oracle

- EN:
  - Linki w UI (Footer): `/tools/valuation` (przez `getLocalizedPath('/tools/valuation')`).
  - Canonical w SEO: `/tools/property-valuation`.
  - Router: ma wyłącznie ścieżki z prefiksem `/:lng`, m.in.:
    - `/:lng/tools/valuation`
    - `/:lng/narzedzia/wycena-nieruchomosci`
    - `/:lng/strumenti/valutazione-immobiliare`
    - `/:lng/tools/immobilienbewertung`
    - `/:lng/outils/estimation-immobiliere`
  - **Brak**: `/tools/valuation` i `/tools/property-valuation`.
- IT/DE/FR/PL:
  - Oczekiwane z `slugs.*` – dokładnie takie, jakie mają ścieżki w routerze (`/:lng/{slugs.tools}/{slugs.valuation}`).
- **Status**:
  - EN: BŁĄD – linki i canonical prowadzą do nieistniejących tras → 404.
  - Inne języki: OK – slug-i i router są spójne.

---

#### 4.6. Tools – Malta Property Quiz

- EN:
  - Linki w UI: `/tools/quiz`.
  - Canonical w SEO: `/tools/property-quiz`.
  - Router: tylko `/:lng/...`:
    - `/:lng/tools/quiz`
    - `/:lng/narzedzia/quiz-nieruchomosci`
    - `/:lng/strumenti/quiz-immobiliare`
    - `/:lng/tools/immobilien-quiz`
    - `/:lng/outils/quiz-immobilier`
  - **Brak**: `/tools/quiz` i `/tools/property-quiz`.
- IT/DE/FR/PL:
  - Jak w `slugs.*` – router je wspiera.
- **Status**:
  - EN: BŁĄD – linki i canonical kierują do 404.
  - Inne języki: OK.

---

#### 4.7. Agency Portal

- EN:
  - `/agency/login`, `/agency/register`, `/agency/portal` – router obsługuje.
- IT/DE/FR/PL:
  - Link w stopce: `getLocalizedPath('/agency/portal')` → np. `/pl/agency/portal`.
  - Router: nie ma żadnej trasy `/:lng/agency/portal`.
- **Status**:
  - EN: OK.
  - IT/DE/FR/PL: BŁĄD – link do portalu agencji prowadzi do 404.
- Dodatkowo:
  - Komponenty `ForgotPassword`, `ResetPassword`, `UpgradePage` istnieją, ale nie mają przypisanych tras.

---

#### 4.8. Legal / About / Privacy / Terms / Cookies

- About:
  - EN: `/about`.
  - IT: `/it/chi-siamo`, DE: `/de/ueber-uns`, FR: `/fr/a-propos`, PL: `/pl/o-nas`.
  - Router: pełne wsparcie dla bazowych i zlokalizowanych slugów (aliasy z i bez `/:lng`).
  - Status: OK (z drobnym nadmiarem aliasów bez języka).
- Privacy / Terms / Cookies:
  - EN: `/privacy-policy`, `/terms-of-service`, `/cookie-policy`.
  - IT/DE/FR/PL:
    - Wzorce typu `/:lng/privacy-policy`, `/:lng/terms-of-service`, `/:lng/cookie-policy`.
    - Slug-i pozostają angielskie, jedynie prefiks językowy się zmienia.
  - Status:
    - Funkcjonalnie OK (brak 404).
    - Lingwistycznie – częściowo zlokalizowane (prefiks), slug wciąż EN (świadoma decyzja lub miejsce na dalszą lokalizację).

---

### 5. Kluczowe problemy wykryte w audycie

1. **Tools (EN) – Oracle & Quiz**
   - Linki (`/tools/valuation`, `/tools/quiz`) i canonicale (`/tools/property-valuation`, `/tools/property-quiz`) wskazują na ścieżki, których router nie zna → 404 dla użytkownika EN + niespójne SEO.
2. **Agency Portal – brak i18n w routingu**
   - `/agency/portal` działa tylko w EN, podczas gdy `getLocalizedPath` buduje także `/it/agency/portal`, `/pl/agency/portal` itp., które nie mają tras (404).
3. **Gozo Bridge Effect**
   - Strona `GozoBridgeTrackerPage` ma canonical `/insights/gozo-bridge-effect`, ale nie jest nigdzie podpięta w routerze.
   - Potencjalny konflikt z ewentualnym artykułem markdown o tym samym slugu.
4. **Nadmiar aliasów i mieszanie języków w ścieżkach**
   - `properties`, `insights`, `market` mają wiele równoległych slugów (np. `/nieruchomosci/all`, `/wiedza` bez `/:lng`).
   - Powoduje to duplikację treści, mieszane języki w jednej ścieżce i większą złożoność SEO.
5. **Legal – częściowa lokalizacja**
   - Slug-i `/privacy-policy`, `/terms-of-service`, `/cookie-policy` są wspólne dla wszystkich języków – funkcjonalnie OK, ale niespójne z resztą mocno lokalizowanych ścieżek.

---

### 6. Rekomendacje (bez wdrażania, tylko plan)

1. **Tools (Oracle & Quiz)**
   - Ustalić jeden spójny wzorzec EN:
     - np. `/tools/valuation` i `/tools/quiz` (prościej, zgodne z `slugs.*`),
     - lub `/tools/property-valuation` i `/tools/property-quiz` (bardziej opisowo),
   - i dopasować do niego:
     - router (dodać trasy bez `/:lng`),
     - linki w UI (`getLocalizedPath`),
     - `canonicalPath` w SEO.
2. **Agency Portal – pełna i18n**
   - Dodać co najmniej `/:lng/agency/portal` → `AgencyPortal`, by linki z innych języków nie generowały 404.
   - Rozważyć dalszą lokalizację slug-u `agency` przez `slugs.*`, jeśli celem jest pełna lokalizacja URL-i.
3. **Gozo Bridge Effect**
   - Spiąć `GozoBridgeTrackerPage` z routerem (np. `/insights/gozo-bridge-effect`) lub zdecydować, że temat będzie wyłącznie artykułem markdown i usunąć canonical/stronę TSX.
4. **Czyszczenie aliasów**
   - Zredukować liczbę aliasów dla `properties`, `insights`, `market`:
     - Zostawić EN + warianty `/:lng/{slugs.*}`.
     - Nadmiarowe aliasy (np. `/wiedza`, `/nieruchomosci/all` bez prefiksu) przekierować 301 do kanonicznych ścieżek.
5. **Legal – opcjonalne pełne i18n**
   - Jeżeli strategia SEO zakłada w pełni lokalizowane URL-e:
     - Dodać `slugs.privacy`, `slugs.terms`, `slugs.cookies`.
     - Przebudować ścieżki na wzorce typu `/:lng/{slugs.privacy}` i zaktualizować canonicale.
6. **Zasada na przyszłość: jedno źródło prawdy dla slugów**
   - Utrzymywać wszystkie „słowa URL” w `slugs.*` i generować na ich podstawie:
     - wzorce w routerze,
     - linki w UI (`getLocalizedPath`),
     - canonicale i hreflangi w SEO.

Ten plik może służyć jako referencja przy projektowaniu refaktoryzacji routera, i18n URL-i i SEO (canonical/hreflang). Nie wprowadza żadnych zmian – jest wyłącznie dokumentacją stanu obecnego i listą rekomendacji.

