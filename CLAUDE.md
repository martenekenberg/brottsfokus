# CLAUDE.md: Brott och bakgrund

Instructions for Claude Code. Read this whole file before writing any code.

## What we are building

A public, static website in Swedish called **Brott och bakgrund**. It presents official Swedish statistics and research on crime and background (country of birth, parents' country of birth, citizenship) in the style of a quality newspaper's data journalism: minimal, light theme only, factual and neutral.

Core principles, in priority order:

1. **Every number has a visible source.** No figure appears without a source line under its chart.
2. **Neutral tone.** Headlines state what the numbers show, nothing more. No opinions, no loaded words, no conclusions the sources don't draw.
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
- No tracking, cookies or analytics unless I ask.

## First steps

1. Check that `data/` contains all six CSV files listed below. If `misstankta_bakgrund_2007_2018.csv` or `misstankta_ursprung_2015_2018.csv` is missing, tell me and build the other chapters first. Those two are downloaded manually from the claude.ai dashboard's Sources panel.
2. Read the header row and a few lines of each CSV, and confirm the column names match "Data" below. Report any differences before building charts.
3. Scaffold the Astro project, then build the page shell (masthead, nav, chapter layout, footer) before any charts.
4. Build one chapter fully (chapter 3, prison, is the simplest), show me, then do the rest.

## Data

All files are UTF-8 CSV with a header row. Values use a dot as the decimal separator. Empty cell = no value (do not treat it as 0).

| File | Used in | Notes |
|---|---|---|
| `intagna_medborgarskap.csv` | Ch. 3 | `year, population (nyintagna / 1okt), group (totalt / man / kvinnor), share_without_pct, persons, source, source_url`. Years missing where Brå states no value. |
| `scb_befolkning.csv` | Ch. 3, 4 | `year, folkmangd, utrikes_fodda, utlandsk_bakgrund, utlandska_medborgare, source`. Foreign citizens for 2014–2025; foreign-born and foreign background only for 2000, 2005, 2010, 2015, 2020, 2025. |
| `valdtakt_domda.csv` | Ch. 4 | Column `chart` selects the set: `bakgrund`, `region`, `kontroll`, `ovrigt`. |
| `bra2005.csv` | Ch. 2 (placeholder), 5 | Column `chart` selects the set: `overrisk`, `andel`, `period`, `andel_misst`, `befolkning`, `region`, `region_misst`, `region_bef`, `brott`. |
| `misstankta_bakgrund_2007_2018.csv` | Ch. 1 | From Brå 2021:9 appendix 2. Inspect the columns first; expect year, crime type, group, rate per 1,000. |
| `misstankta_ursprung_2015_2018.csv` | Ch. 2 | From Brå 2021:9 appendix 1. Inspect the columns first; expect view (land / region / moder), unit, crime, rate per 1,000, risk, adjusted risk, n. |

Calculated values (shares, averages) are computed in code from these files. Keep each calculation in one small, named function so it can be checked. Rules:

- Foreign citizens' share of population = `utlandska_medborgare / folkmangd * 100`, one decimal.
- Swedish-born with two foreign-born parents = `utlandsk_bakgrund - utrikes_fodda`.
- Population comparison for the rape study 2000–2015 = mean of 2000, 2005, 2010, 2015.

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

White page background. **No dark mode.** Text contrast must be at least 4.5:1.

Visual grammar, used the same way in every chart:
- Filled blue mark = the group. Hollow grey mark or outlined grey bar = the same group's share of the population.
- Dashed grey line = population in line charts.
- Dashed black line at 1 = the comparison group in risk charts.

### Typography

- **Newsreader**: h1 (80px desktop / 44px mobile), chapter headlines (40px / 28px), intro text (20–24px).
- **Inter**: navigation, kickers (13px, uppercase, 0.08em letter spacing, orange), chart labels (12–13px, tabular numbers), sources (12px), body text in notes (14px).
- Swedish number format: decimal comma, space as thousands separator, `%` with a space before it (`22 %`), multiplier as `2,5×`.

### Layout

- Max content width 1120px, side padding 40px desktop / 16px mobile.
- Intro text at most 680px wide; charts use the full content width.
- Must work from 360px upward. Test at 390px and 1440px.

## Page structure

One long page with anchored chapters, matching `design/Main.dc.html`:

1. **Masthead**: kicker "Statistik i fokus", date and sources line, h1 "Brott och bakgrund", intro paragraph.
2. **Chapter nav**: thick top rule, thin bottom rule, links `01 Över tid`, `02 Födelseområde`, `03 Fängelse`, `04 Våldtäkt`, `05 Äldre studier`, `Metod`. Wraps on desktop, one horizontally scrollable row on mobile. Not sticky. Touch targets at least 44px.
3. **Key figures**: three figures in a grid (2,5×, 3×, 22 %), each with a one-line explanation and its source. Copy is in the mockup.
4. **Chapters 1–5**, each with the same pattern:
   - kicker (`01 · Misstänkta över tid`)
   - factual headline (h2)
   - short intro
   - legend (when the chart has more than one series)
   - chart
   - "Läs så här" box with caveats
   - source line
   - "Nästa: …" link to the next chapter
5. **Metod och begrepp**: short definitions in a grid.
6. **Footer**: site name, "Till början ↑".

## Chapters

Copy for headlines, intros, notes and sources is in `design/Main.dc.html`. Reuse it unless the data says otherwise.

1. **Misstänkta över tid, 2007–2018.** Line chart, four background groups (plus whole population dashed), rate per 1,000. Crime type selector (default: brott totalt). Toggle "per 1 000 invånare" / "jämfört med två inrikesfödda föräldrar". Source: Brå 2021:9.
2. **Födelseområde, 2015–2018.** Dot plot by region of birth (toggle to country), rate or risk, sorted highest first. Compare with population where the data allows. Until the 2015–2018 file is in place, use the 1997–2001 regional data from `bra2005.csv` (share of suspects vs share of population), as the mockup does, and label the period clearly.
3. **Fängelse och medborgarskap, 2014–2025.** Line chart: new inmates (all), new inmates (men), new inmates (women), inmates 1 October, foreign citizens in the population (dashed grey). Break lines where a year is missing; never join across a gap.
4. **Dömda för våldtäkt.** Paired bars: convicted vs matched controls (2000–2020), convicted vs population (2000–2015). Also region of birth and prior convictions as smaller charts.
5. **Brås äldre studier.** Small multiples of excess risk 1985–89 vs 1997–2001 (with standardised value), share of suspects vs share of population per group, and crime types as grouped bars (leave out "samtliga brott", which is shown elsewhere).

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

## Sources

- Brå 2021:9: https://bra.se/rapporter/arkiv/2021-08-25-misstankta-for-brott-bland-personer-med-inrikes-respektive-utrikes-bakgrund
- Brå 2005:17: https://www.bra.se/download/18.cba82f7130f475a2f1800012697/2005_17_brottslighet_bland_personer_fodda_sverige_och_utlandet.pdf
- Brå, prison statistics: per-row URLs in `data/intagna_medborgarskap.csv`
- Khoshnood et al. 2021: https://doi.org/10.1080/20961790.2020.1868681
- Khoshnood et al. 2026: https://lup.lub.lu.se/record/d9a9d1f6-f428-4b57-abf2-5e0e9c7b84f5
- SCB, population summary 1960–2025: https://www.scb.se/hitta-statistik/statistik-efter-amne/befolkning-och-levnadsforhallanden/befolkningens-sammansattning-och-utveckling/befolkningsstatistik/pong/tabell-och-diagram/sveriges-befolkning-i-sammandrag-1960-2025-korrigerad-2026-06-18/
- SCB, foreign citizens: https://www.scb.se/hitta-statistik/sverige-i-siffror/manniskorna-i-sverige/utlandska-medborgare-i-sverige/

A "Källor" list with all links goes in the Metod section.

## Working rules

- Swedish for all site copy. Code, comments and commit messages in English.
- No em dashes in site copy. Use commas, colons or full stops.
- Don't add new data sources, chapters or claims without asking me first.
- Keep the build passing and commit in small steps with clear messages.
- When a decision isn't covered here, pick the simplest option that fits the design and tell me what you chose.
