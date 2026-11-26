# CLAUDE.md: Brottsfokus

Instructions for Claude Code. Read this whole file before writing any code.

## What we are building

A public, static website in Swedish called **Brottsfokus** (formerly "Brott och bakgrund"), at https://brottsfokus.xyz/, with a full English copy at https://brottsfokus.xyz/en/. The country parts are also translated into the country's language: Denmark in Danish (/da/danmark/), Finland in Finnish (/fi/suomi/). It presents official Swedish statistics and research on crime and background (country of birth, parents' country of birth, citizenship) in the style of a quality newspaper's data journalism: minimal, light theme only, factual and neutral.

Core principles, in priority order:

1. **Every number has a visible source.** No figure appears without a source line under its chart.
2. **Neutral tone.** Headlines state what the numbers show, nothing more. No opinions, no loaded words, no conclusions the sources don't draw. Chapter headlines lead with the size of the difference against the comparison group or the population, in numbers; trends go in the intro (owner's decision, November 2026).
3. **Compare with the population whenever possible.** Show a group's share next to that group's share of the population.
4. **Caveats stay visible.** Every chart has a "Läs så här" box with its limitations.
5. **Never invent or estimate data.** If a value is missing, show a gap and say so.

## Project folder at start

```
data/                       CSV files (see "Data" below)
design/Main.dc.html         Desktop mockup, full page (visual reference only)
design/Mobile.dc.html       Mobile mockup, 390px (visual reference only)
design/chart-svgs.json      Static SVGs used in the mockup (reference only)
README.md                   Summary of the handoff
CLAUDE.md                   This file
```

The `.dc.html` files are design mockups in a canvas format. Open them as plain HTML to read layout, spacing, copy and colours. Do not ship them. Rebuild everything as proper components.

## Stack

- **Astro** (static output), TypeScript, no client framework unless needed.
- **D3 v7** for charts, loaded only in chart components (client-side island).
- CSV files read at build time and passed to charts as JSON.
- Fonts from Google Fonts: Newsreader and Inter. Self-hosting via `@fontsource` is fine.
- Deploy: GitHub repo + Vercel, static build. Ask before creating the repo or connecting Vercel.
- Vercel Web Analytics is on (owner's request), via `@vercel/analytics` in `src/layouts/Base.astro`. No cookies and no other tracking unless I ask. If analytics changes, update "Kakor och besöksstatistik" in Om sidan.
- Error reports go through Formward (formward.eu, hosted in Sweden), via the form in `src/components/ErrorReportForm.astro` on Om sidan. Honeypot field, no captcha, no cookies. If the form service changes, update "Kakor och besöksstatistik" in Om sidan.
- The owner is anonymous. Never put the owner's name, email address or GitHub account on the site or in its metadata. Keep the repo private and do not link to it.
- Site name, URL, title, description and last update date live in `src/lib/site.ts`. `updated` is the build date (owner confirmed, November 2026); the main page's masthead, structured data, sitemap entry and Om sidan read it.
- The table pages and `/data/` use the date their data last changed instead (`src/lib/dataDates.json`, written by `npm run datadates`), so a deploy without data changes does not mark them as changed. The build stops if a data file changed since its date was recorded.

## First steps

1. Check that `data/` contains all six CSV files listed below. If `misstankta_bakgrund_2007_2018.csv` or `misstankta_ursprung_2015_2018.csv` is missing, tell me and build the other chapters first. Those two are downloaded manually from the claude.ai dashboard's Sources panel.
2. Read the header row and a few lines of each CSV, and confirm the column names match "Data" below. Report any differences before building charts.
3. Scaffold the Astro project, then build the page shell (masthead, nav, chapter layout, footer) before any charts.
4. Build one chapter fully (prison, now 3.1, is the simplest), show me, then do the rest.

## Data

All files are UTF-8 CSV with a header row. Values use a dot as the decimal separator. Empty cell = no value (do not treat it as 0).

| File | Used in (chapter) | Notes |
|---|---|---|
| `intagna_medborgarskap.csv` | 3.1 | `year, population (nyintagna / 1okt), group (totalt / man / kvinnor), share_without_pct, persons, persons_without, source, source_url`. `share_without_pct` is Brå's stated share. Where a report gives none, the row has Brå's counts (`persons`, `persons_without`) and the share is computed: new prisoners from Brå's table 8 ("558"), 1 October from table 12 ("562"). Every series runs 2014–2025 without gaps. |
| `scb_befolkning.csv` | 3.1, 2.2 | `year, folkmangd, utrikes_fodda, utlandsk_bakgrund, utlandska_medborgare, source`. Foreign citizens for 2014–2025; foreign-born and foreign background only for 2000, 2005, 2010, 2015, 2020, 2025. |
| `valdtakt_domda.csv` | 2.2 | Column `chart` selects the set: `bakgrund`, `region`, `kontroll`, `ovrigt`. |
| `bra2005.csv` | 1.3 | Column `chart` selects the set: `overrisk`, `andel`, `period`, `andel_misst`, `befolkning`, `region`, `region_misst`, `region_bef`, `brott`. |
| `misstankta_bakgrund_2007_2018.csv` | 1.1 | From Brå 2021:9 appendix 2. Inspect the columns first; expect year, crime type, group, rate per 1,000. |
| `misstankta_ursprung_2015_2018.csv` | 1.2 | From Brå 2021:9 appendix 1. Inspect the columns first; expect view (land / region / moder), unit, crime, rate per 1,000, risk, adjusted risk, n. |
| `bra2021_tabell_b6.csv` | 1.1, 1.2 | Brå 2021:9 appendix 1, table B6: population and suspects (n and %) per group, 2015–2018. |
| `bra2021_brottsmisstankar.csv` | 1.1 (second chart) | Brå 2021:9 appendix 3, tables D1 and D2: registered suspicions per group and year 2007–2018, including people not registered in Sweden. |
| `bra2021_riskfaktorer.csv` | 1.2 (second chart) | Brå 2021:9 report text pp. 54–55: excess risk for social assistance, education and sex. |
| `ntu_utsatthet.csv` | 4.1 | Brå NTU Kortanalys 2/2024, Excel appendix: self-reported victimisation by background, sex and world region, with confidence intervals. |
| `utvisning_b1.csv`, `utvisning_text.csv` | 3.2 | Brå 2026:15, appendix 1 table B1, and figures stated only in the text (pp. 5 and 36). |
| `dodligt_vald.csv` | 4.2 | Brå 2025:5: shares Brå states in the text or prints on a figure (pp. 9–14, 76–79). |
| `backman_lagforda_fore_25.csv` | 2.1 | Bäckman et al. 2021, tables 1 and 2 (CC BY 4.0). |
| `dst_lagforda_herkomst.csv`, `dst_befolkning_herkomst.csv` | 5.1 | Danmarks Statistik, Statbank tables STRFNA10 (people aged 15–79 found guilty, by origin, criminal code and violence) and FOLK1E (population aged 15–79 on 1 January, by origin). Written by `python3 scripts/dst_fetch.py`; the loader stops the build if the groups do not add up to the total. |
| `dst_kriminalitetsindeks.csv` | 5.2 | Danmarks Statistik, Indvandrere i Danmark 2025, tables 6.5, 6.7 and 6.9 (pp. 112, 115, 118): crime index for 2024 (all men or all women aged 15–79 = 100), unadjusted and adjusted for age, and for age plus employment, family education or family income; by offence adjusted for age. Machine-read from the PDF (`docs/kallor/Indvandrere_i_Danmark_2025.pdf`); empty = ".." in the report. The loader stops the build if the age-adjusted value differs between the three tables. Update by hand when a new edition is published. |
| `tk_misstankta_ursprung.csv` | 6.1, 6.2 | Statistics Finland, StatFin table 13zk: people suspected of solved criminal code offences, each counted once a year by the most aggravated offence, by origin (Finnish or foreign background, born in Finland or abroad), sex and age, with Statistics Finland's rate per 10,000. Written by `python3 scripts/tk_fetch.py`; the loader stops the build if the groups do not add up or the rates and counts do not fit together. Unknown origin has no rate (empty). |
| `bra_fodelsekohorter.csv` | 2.1 | Brå 2025:21 Excel tables 1 and 4: share of each birth year convicted before age 25 and 20, by sex and background (from birth year 1984). |

Calculated values (shares, averages) are computed in code from these files. Keep each calculation in one small, named function so it can be checked. Rules:

- Foreign citizens' share of population = `utlandska_medborgare / folkmangd * 100`, one decimal.
- Swedish-born with two foreign-born parents = `utlandsk_bakgrund - utrikes_fodda`.
- Population comparison for the rape study 2000–2015 = mean of 2000, 2005, 2010, 2015.
- Danish rates (5.1) = `persons / mean(population 1 January this year, 1 January next year) * 1000` (`per1000`, `meanPopulation`). Danmarks Statistik weights each person by the part of the year they lived in Denmark; the mean of the two dates is the closest the open tables allow.
- Finnish rates (6.1, 6.2) = Statistics Finland's rate per 10,000 / 10 (`per1000FromPer10000`). Ratios are computed from those rates.
- Share without Swedish citizenship from counts (prison) = `persons_without / persons * 100`, whole percent (`shareWithoutPctFromCounts`). Tests check that Brå's table 8 and 12 counts give Brå's stated share in every case where Brå states one (21 for new prisoners, 3 for 1 October), and the loader stops the build if a row's stated share and counts disagree.

## Design system

### Colours

| Token | Hex | Use |
|---|---|---|
| ink | `#121212` | Text, heavy rules |
| text-muted | `#5C5C5C` | Secondary text, axis labels, sources |
| rule | `#E3E3E3` | Grid lines, light dividers |
| panel | `#F3F4F6` | "Läs så här" boxes |
| focus | `#1D4E89` | The group a chart is about |
| second | `#C2410C` | Second data series, chapter numbers and kickers |
| population | `#8A8A8A` | Population / comparison group (lines and hollow marks only, never small text) |
| fourth | `#0F766E` | Born in Sweden with one foreign-born parent, in line charts (1.1, 2.1), so the group is not mistaken for the dashed grey population line. Contrast 5.5:1, so it may also be used for labels. Owner's decision, November 2026. |
| extra | `#6B3FA0` | A fifth series, when the four background groups already use ink, focus, second and grey. Used for people not registered in Sweden (1.1, second chart). Contrast 7.4:1, so it may also be used for labels. Added at the owner's request, November 2026. |

White page background. **No dark mode.** Text contrast must be at least 4.5:1.

Visual grammar, used the same way in every chart:
- Filled blue mark = the group. Hollow grey mark = the same group's share of the population.
- Outlined grey bar = what the group is compared with: the population, a matched control group (2.2), or the group with Swedish background or two Swedish-born parents (1.3, 4.1). Owner's decision, November 2026.
- Grey lines are only used for the population (dashed). A background group never gets a grey line.
- Dashed grey line = population in line charts.
- Dashed black line at 1 = the comparison group in risk charts.

### Typography

- **Newsreader**: h1 (80px desktop / 44px mobile), chapter headlines (40px / 28px), intro text (20–24px).
- **Inter**: navigation, kickers (13px, uppercase, 0.08em letter spacing, orange), chart labels (12–13px, tabular numbers), sources (12px), body text in notes (14px).
- Swedish number format: decimal comma, space as thousands separator, `%` with a space before it (`22 %`), multiplier as `2,5×`.
- English number format (`/en/`): decimal point, comma as thousands separator, no space before `%` (`22%`), multiplier as `2.5×`. Formatting is in `src/lib/format.ts`; every formatter takes the language.

### Layout

- Max content width 1120px, side padding 40px desktop / 16px mobile.
- All text (headlines, intros, notes, Om sidan) and charts use the full content width (owner's request). No narrower max-width on text blocks.
- Must work from 360px upward. Test at 390px and 1440px.

## Page structure

A front page plus one page per part (owner's decision, 19 November 2026). The parts, their pages in both languages, their one-line card text and their chapters are defined in `src/lib/parts.ts`; chapter numbers ("1.2") follow from that list. Each part also has a search title and description (`meta` in `parts.ts`); `{period}` in them is filled with the years its table pages cover (`src/lib/partMeta.ts`). Part pages carry BreadcrumbList and Article markup, with the part's Datasets and sources as `isBasedOn`.

| Page | Swedish | English | Contains |
|---|---|---|---|
| Front page | `/` | `/en/` | Masthead, menu, three key figures, one card per part |
| 1. Misstänkta för brott | `/misstankta/` | `/en/suspects/` | 1.1 Över tid, 1.2 Födelseområde, 1.3 Brås äldre studier |
| 2. Lagförda och dömda | `/lagforda-och-domda/` | `/en/convictions/` | 2.1 Lagförda före 25 års ålder, 2.2 Våldtäkt |
| 3. Fängelse och utvisning | `/fangelse-och-utvisning/` | `/en/prison-and-deportation/` | 3.1 Fängelse, 3.2 Utvisning |
| 4. Brottsoffer | `/brottsoffer/` | `/en/victims/` | 4.1 Utsatta för brott, 4.2 Dödligt våld |
| 5. Danmark | `/danmark/` (+ `/da/danmark/`) | `/en/denmark/` | 5.1 Lagförda i Danmark, 5.2 Justerat för ålder och sociala förhållanden |
| 6. Finland | `/finland/` (+ `/fi/suomi/`) | `/en/finland/` | 6.1 Misstänkta i Finland, 6.2 Efter ålder |
| Frågor och svar | `/fragor-och-svar/` | `/en/faq/` | Questions on terms and sources (`src/lib/faq.ts`), then every chapter's short answer grouped by part with a link to its chapter. FAQPage markup |
| Metod och begrepp | `/metod/` | `/en/method/` | Short definitions in a grid, and the "Källor" list |
| Om sidan | `/om/` | `/en/about/` | Why the site exists, how data is chosen, who runs it (a private person who works with data analysis; no name, owner's decision November 2026), how the work is done (editorial points, including checks against the source when data changes), errors and corrections (with the dated "Rättelser" list), cookies and visitor statistics |

1. **Masthead** (front page only): kicker "Offentlig statistik och forskning", date and sources line, h1 "Brottsfokus", intro paragraph, and a smaller line on where the figures come from with a link to `/data/`. Other pages have a smaller page header (`src/components/PageHead.astro`) with kicker, h1, intro, the page's chapters and a language link.
2. **Menu** (`src/components/ChapterNav.astro`): thick top rule, thin bottom rule, links to the six parts, Frågor (Q&A), Metod and Om sidan. One row on desktop, one horizontally scrollable row on mobile with a fade at the right edge while there is more to scroll. The current page is underlined. Sticky at the top while scrolling; on the front page a small site title slides in once the big headline has scrolled away, on other pages it always shows. Touch targets at least 44px.
3. **Key figures** (front page): three figures in a grid (2,5×, 3,2×, 22 %), each with a one-line explanation and its source.
4. **Part cards** (front page): part number, part name, one sentence (owner approves the copy) and the part's chapters as links. The sentence leads with the gap, like the chapter headlines, and is also the part page's intro. Where it names a year or period, a chapter check stops the build when the data moves on (3.1, 2.2). Card copy approved by the owner, 20 November 2026.
5. **Chapters**, one component each in `src/components/chapters/`, each with the same pattern:
   - kicker (`1.1 · Misstänkta över tid`)
   - factual headline (h2)
   - short intro
   - "Kort svar" boxes, if any (`src/components/ShortAnswer.astro`, slot `answers`): a search question, an answer with numbers computed from the data, one caveat and the source. Owner-approved questions, November 2026. Defined once in `src/lib/shortAnswers.ts` and shown both in the chapter and on Frågor och svar. "Invandrare" may be used in questions and once in the answer, meaning utrikesfödda only (defined on Metod); never for citizenship, "utländsk bakgrund" or people born in Sweden (write "barn till invandrare"). Headlines may say "barn till två invandrare" for inrikesfödda med två utrikesfödda föräldrar (defined on Metod). "Nästan dubbelt" covers ratios from 1.75 up to 2 (2.1 headline, owner approved November 2026)
   - "Om uppgifterna" panel: each study, the years its figures cover and when it was published (`src/lib/chapterFacts.ts`, years from the data where the data holds them), so the period is never confused with the site's update date
   - legend (when the chart has more than one series)
   - chart
   - "Läs så här" box with caveats: the required caveats in a few short sentences. Technical notes (rounding, computed years, footnote mismatches) go in the table page's "Läs så här" (owner's decision, November 2026)
   - source line
   - link to its table page
   - second charts, if any (`src/components/SubChart.astro`)
   - "Läs också": related chapters with a short note on how they relate, and the Metod terms the chapter relies on (`src/lib/related.ts`; the chapter "Nästa" points to is left out). Every Metod term has an anchor `begrepp-<id>`; `tests/related.test.ts` checks the links
   - "Nästa: …" link to the next chapter, or at the end of a part to the next part
6. **Footer**: site name, "Tabeller och CSV-filer" (link to `/data/`), a link to the same page in the other language, and "Till början ↑".

Old links to the one-page site (`/#kap3`, `/#kap10`, `/#kap7-brott`, `/#metod`) are forwarded by a small script on the front page (`src/components/MainPage.astro`). Keep chapter ids stable. Copy that names a chapter number reads it with `chapter(id).num`, so it follows any renumbering.

### English version (`/en/`)

The English site has the same pages, charts, tables and CSV files under `/en/`, with English slugs for the table pages (`/en/data/suspects-over-time/` etc., see `src/lib/dataPages.ts`). Rules:

- Copy is written side by side in each file as `tr(lang, sv, en)` (`src/lib/i18n.ts`). Change both languages in the same commit.
- Labels from the data files (crime types, birth regions, countries, groups) are translated in `src/lib/labels.ts`. `tests/i18n.test.ts` fails if a label in a data file has no English name.
- The Swedish CSV files keep their Swedish column names. The English CSV files have English column names and the same numbers.
- Official titles of reports and studies stay in their published form (Swedish titles of Brå reports, for example). Only the wording around them is English.
- Pages are rendered from `src/components/MainPage.astro` (front page), `src/components/PartPage.astro` (part pages), `src/components/InfoPage.astro` (Metod, Om sidan) and `src/components/data/TablePage.astro`, all in both languages. Language links between pages with different slugs go through `alternatePath` in `src/lib/dataPages.ts`. `/llms.txt` lists the English table pages in an English section; `/sitemap.xml` lists both languages with `hreflang` links.
- The English copy is a first translation. The owner should read it before it is treated as final.

### Country languages (`/da/`, `/fi/`)

Added at the owner's request, 26 November 2026. A country part also has a page in the country's own language (`path.da`, `path.fi` in `src/lib/parts.ts`, rendered by `src/pages/[local]/[part]/index.astro`). Rules:

- Only the part page is translated. Its menu, "Läs också", "Nästa", Metod terms and table links lead to the English pages, and the page says so under the header. The table pages and CSV files stay in Swedish and English.
- Copy is written as `tr(lang, sv, en, { da, fi })`, or as `{ sv, en, da, fi }` read with `pick(text, lang)`. A text shown on a Danish or Finnish page without a translation stops the build, so a page never mixes languages.
- Use the statistics office's own terms: Danish "indvandrere", "efterkommere", "dansk oprindelse"; Finnish "suomalaistaustaiset", "ulkomaalaistaustaiset".
- The language menu (`src/components/LanguageMenu.astro`) lists every language a page exists in, each in its own name, in the page header, the masthead and the footer. The front page cards link to the translations ("Læs på dansk", "Lue suomeksi"). `hreflang` links and the sitemap list all versions.
- Danish number format: decimal comma, full stop as thousands separator (`1.234,5`). Finnish and Norwegian: as Swedish.
- The Danish and Finnish copy is a first translation by Claude. A native speaker should read it before it is treated as final.
- Norwegian (`nb`) is prepared in `src/lib/i18n.ts` but has no page: there is no Norway part yet.

### Table pages

Each chapter links to a page under `/data/` with its numbers as HTML tables and a CSV file (added at the owner's request, for readers, accessibility and search). `/data/` lists them. Each page has: kicker, factual headline, summary with the key numbers and source, "Läs så här" above the tables, tables, CSV download, terms of use (CC BY 4.0, set in `src/lib/site.ts`), sources, link back to the chart, links to the other table pages, and Dataset markup. Build the tables with the same calculation code as the charts. `npm run sifferkontroll` lists every table value in `docs/sifferkontroll_tabeller.csv`. Each page's text and tables are defined once in `src/lib/tablePageContent.ts`; the HTML page, the CSV file and a Markdown copy (`/data/<slug>.md`) are generated from it. `/llms.txt` lists the Markdown copies with each page's summary and the main caveats. Every CSV column is described in `src/lib/dataDictionary.ts` (name in both languages, type, unit, meaning); `tests/dataDictionary.test.ts` fails if a CSV header and the dictionary differ, so update the dictionary when a CSV column changes. The dictionary is shown on each table page ("Kolumnerna i CSV-filen"), in its Markdown copy and in `/data/datapackage.json` and `/en/data/datapackage.json` (Frictionless Tabular Data Package, `src/lib/dataPackage.ts`).

## Chapters

Numbered by part (see "Page structure"). The ids (`kap1` and so on) are the old chapter numbers and stay as they are, so links keep working.

1.1 **Misstänkta över tid, 2007–2018** (`kap1`). Line chart, four background groups (plus whole population dashed), rate per 1,000. Crime type selector (default: brott totalt). Toggle "per 1 000 invånare" / "jämfört med två inrikesfödda föräldrar". Second chart: each group's share of all registered suspicions, including people not registered in Sweden. Source: Brå 2021:9.

1.2 **Födelseområde, 2015–2018** (`kap2`). Dot plot by region of birth (toggle to country and mother's region), rate, risk or share of suspects, sorted highest first by the value shown. Second chart: Brå's comparison with social assistance, education and sex.

1.3 **Brås äldre studier** (`kap5`). Small multiples of excess risk 1985–89 vs 1997–2001 (with standardised value), share of suspects vs share of population per group, and crime types as grouped bars (leave out "samtliga brott", which is shown elsewhere).

2.1 **Lagförda före 25 års ålder** (`kap9`, chapters 9 and 10 merged at the owner's request). Brå 2025:21 by birth year 1958–2003 (before 25, then before 20), and Bäckman et al. 2021 by birth-year group 1966–93 as line charts per sex, for everyone and for the lowest-income families. The two sources group background differently; the page says so. The table pages `kap9` (Bäckman) and `kap10` (Brå) both stay; `MERGED` in `src/lib/chapters.ts` points `kap10` here.

2.2 **Dömda för våldtäkt** (`kap4`). Paired bars: convicted vs matched controls (2000–2020), convicted vs population (2000–2015). Also region of birth as a smaller chart. (The chart of prior convictions and social assistance was removed at the owner's request, November 2026; the rows stay in the data file.)

3.1 **Fängelse och medborgarskap, 2014–2025** (`kap3`). Line chart: new inmates (all), inmates 1 October, foreign citizens in the population (dashed grey). Below it, on the same scale, a second line chart for new inmates by sex (men blue, women orange) with the same population line. Break lines where a year is missing; never join across a gap.

3.2 **Utvisning på grund av brott, 2013–2023** (`kap7`). Share deported by region of citizenship, and deported vs convicted of new crimes by main offence (Brå 2026:15).

4.1 **Utsatta för brott, 2016–2022** (`kap6`). Paired bars per crime type, men and women: foreign vs Swedish background (Brå NTU). Brå's grouping here counts one foreign-born parent as foreign background.

4.2 **Dödligt våld, 2005–2021** (`kap8`). Victims, perpetrators and population by background (Brå 2025:5). (The second chart on income, work, housing and earlier convictions was removed at the owner's request, November 2026; the rows stay in the data file.)

5.1 **Lagförda i Danmark, 2008–2025** (`kap11`). Added at the owner's request, November 2026. Line chart per 1,000 residents aged 15–79 for Danmarks Statistik's five origin groups plus the whole population (dashed), criminal code offences; second chart for crimes of violence. Swedish copy says "barn till invandrare" for Danish "efterkommere", English says "descendants" as Danmarks Statistik does. The Danish groups differ from Brå's and the page says the figures cannot be compared directly with the Swedish ones.

5.2 **Justerat för ålder och sociala förhållanden, 2024** (`kap12`). Grouped bars per origin group: Danmarks Statistik's crime index unadjusted, adjusted for age, and for age plus own employment, family education or family income, with a dashed line at 100. Men in the main chart, women in the second. The index counts all convictions, including traffic offences, unlike 5.1; the note says so and gives the criminal code value from table 6.9.

6.1 **Misstänkta i Finland, 2000–2025** (`kap13`). Added at the owner's request, 26 November 2026. Line chart per 1,000 residents of all ages: foreign background born abroad (blue), foreign background born in Finland (orange), Finnish background born in Finland (black), whole population (dashed). Statistics Finland's background regions (table 13z4) were left out: the regions do not match any standard grouping and could not be labelled reliably.

6.2 **Efter ålder, 2025** (`kap14`). Grouped bars per age group, men in the main chart, women in the second, with Finnish background born in Finland as the outlined comparison bar. Rates based on fewer than 20 suspects are left out of the charts (`MIN_PERSONS`) and kept in the table.

Every headline that makes a claim about the data has a check in its chapter component (`src/components/chapters/`) that stops the build if the data no longer supports it. Add one for every new headline.

## Charts

- One reusable component per chart type: line chart, grouped bar chart, dot plot, small multiples.
- Sized from the container width (ResizeObserver), never fixed width.
- Every chart has a tooltip showing all values for the hovered row or year, kept inside the chart area.
- Print key values directly on the chart too: phones and screenshots have no hover.
- Each SVG gets `role="img"` and an `aria-label` describing what it shows.
- Render a static, readable version at build time if practical, so the page works before JavaScript loads.

## Caveats that must stay on the site

- Suspicions are not convictions. Figures are not adjusted unless stated. Age and sex explain a large part of the differences.
- Citizenship is not country of birth. Prison figures include people who don't live in Sweden, who are not in the population figures.
- The rape studies cover convicted people only. The population comparison covers all ages and both sexes, while those convicted are men aged 15–60. The first study was reported to the ethics appeals board (Överklagandenämnden för etikprövning).
- Brå 2005 figures are over 20 years old. Some crime types in Brå's table 11 could not be read from the PDF and are left out.
- Values were machine-read from PDFs. Before publishing, list every number shown on the site with its source table so I can spot-check them against the originals.
- Background groupings differ between sources (4.1 counts one foreign-born parent as foreign background, 4.2 does not, Bäckman et al. in 2.1 use at least one Swedish-born parent as the comparison group). Each chapter says which grouping it uses.
- 4.1 is a survey of people aged 16–84 and includes crimes never reported.
- 4.2: perpetrators are missing in unsolved cases, most often in criminal milieus. Only people with a Swedish personal identity number are included.
- 5.1 (Denmark): not adjusted for age or sex; Danmarks Statistik's groups (one foreign-born parent counts as Danish origin if the other is a Danish citizen born in Denmark); most drug offences and all traffic offences are outside the criminal code; only people living in Denmark are counted.
- 6.1–6.2 (Finland): suspects in solved offences only, counted once a year; only people with a Finnish personal identity code; asylum seekers are not in the population; 6.1 is all ages and not adjusted for age.
- Brå's birth-cohort statistics (2.1) count only people registered in Sweden at age 15 and when convicted. "Lagförd" includes district court judgments later overturned.

## Sources

- Brå 2021:9: https://bra.se/rapporter/arkiv/2021-08-25-misstankta-for-brott-bland-personer-med-inrikes-respektive-utrikes-bakgrund
- Brå 2005:17: https://www.bra.se/download/18.cba82f7130f475a2f1800012697/2005_17_brottslighet_bland_personer_fodda_sverige_och_utlandet.pdf
- Brå, prison statistics: per-row URLs in `data/intagna_medborgarskap.csv`
- Khoshnood et al. 2021: https://doi.org/10.1080/20961790.2020.1868681
- Khoshnood et al. 2026: https://lup.lub.lu.se/record/d9a9d1f6-f428-4b57-abf2-5e0e9c7b84f5
- SCB, population summary 1960–2025: https://www.scb.se/hitta-statistik/statistik-efter-amne/befolkning-och-levnadsforhallanden/befolkningens-sammansattning-och-utveckling/befolkningsstatistik/pong/tabell-och-diagram/sveriges-befolkning-i-sammandrag-1960-2025-korrigerad-2026-06-18/
- SCB, foreign citizens: https://www.scb.se/hitta-statistik/sverige-i-siffror/manniskorna-i-sverige/utlandska-medborgare-i-sverige/
- Brå 2021:9 appendices 1 and 3: linked from the report page above.
- Brå NTU Kortanalys 2/2024: https://bra.se/rapporter/arkiv/2024-05-21-utsatthet-for-brott-bland-personer-med-utlandsk-bakgrund
- Brå 2026:15: https://bra.se/download/18.5d0a8fbf19ddcaf2a6cccb2/1777972068717/2026_15_Utvisningsd%C3%B6mda%20i%20brottm%C3%A5l.pdf
- Brå 2025:5: https://bra.se/rapporter/arkiv/2025-03-25-offer-och-garningspersoner-vid-dodligt-vald
- Bäckman et al. 2021: https://doi.org/10.1080/2578983X.2021.1900038
- Brå 2025:21: https://bra.se/rapporter/arkiv/2025-12-02-fodelsekohortstatistik
- Danmarks Statistik, Statbank: https://www.statistikbanken.dk/STRFNA10 and https://www.statistikbanken.dk/FOLK1E
- Danmarks Statistik, Indvandrere i Danmark 2025 (section 6.2, crime index): https://www.dst.dk/da/Statistik/udgivelser/VisPub?cid=54707
- Statistics Finland, StatFin table 13zk: https://pxdata.stat.fi/PxWeb/pxweb/sv/StatFin/StatFin__rpk/13zk.px/

A "Källor" list with all links goes in the Metod section.

## Working rules

- Site copy is in Swedish (`/`) and English (`/en/`), and the country parts also in Danish and Finnish. Code, comments and commit messages are in English.
- No em dashes in site copy, in any language. Use commas, colons or full stops.
- Don't add new data sources, chapters or claims without asking me first.
- Keep the build passing and commit in small steps with clear messages.
- After changing a file in `data/`, run `npm run datadates` and `npm run sifferkontroll`, and commit the results.
- When a published number is corrected, add a dated entry under "Rättelser" in Om sidan (`src/components/About.astro`), in both languages.
- The share images (`public/og.png`, `public/og-en.png`) are drawn by `scripts/og-image.cjs`. Redraw them when the site description changes.
- When a decision isn't covered here, pick the simplest option that fits the design and tell me what you chose.
- End every reply to me with a suggested next step (owner's request, November 2026).
- When suggesting URLs to submit or inspect in Google Search Console (or Bing Webmaster Tools), give each full URL in its own code block, so it has a copy button (owner's request, November 2026).
