# Brottsfokus (formerly Brott och bakgrund): handoff for Claude Code

Goal: a static, minimal, newspaper-style site (Swedish) presenting official statistics on crime and background in Sweden, neutral in tone, every number with its source. No dark mode.

Suggested stack: Astro (or Vite) + D3, data as CSV in `data/`, deploy via GitHub + Vercel.

## Start prompt for Claude Code
"Build the site described in README.md. Use the design in design/Main.dc.html and design/Mobile.dc.html as the visual reference, draw every chart with D3 from the CSV files in data/, and keep all source lines and 'Läs så här' notes."

## Data files
| File | Content | Source |
|---|---|---|
| data/intagna_medborgarskap.csv | Share without Swedish citizenship among new inmates (all, men, women) and inmates 1 Oct, 2014–2025. Gaps where Brå states no value. | Brå kriminalvårdsstatistik 2018–2025 (URL per row) |
| data/scb_befolkning.csv | Population, foreign-born, foreign background, foreign citizens, 31 Dec, 2000–2025 (some years only folkmängd + foreign citizens) | SCB |
| data/valdtakt_domda.csv | Rape convictions by background, region, prior convictions, cases vs controls | Khoshnood et al. 2021 and 2026 |
| data/bra2005.csv | Suspects 1997–2001 and 1985–89: share, excess risk, standardised risk, share of suspects vs share of population, regions, crime types | Brå 2005:17 (tables 7–11, appendix 4 table 1) |

**Still to download** (too large to include here): open the dashboard "Misstänkta för brott efter bakgrund" on claude.ai, open Sources, and download
- `misstankta_bakgrund_2007_2018.csv` (per year, crime type, group; Brå 2021:9 appendix 2)
- `misstankta_ursprung_2015_2018.csv` (per country/region of birth; Brå 2021:9 appendix 1)

## Design rules
- Fonts: Newsreader (headlines, intros), Inter (nav, chart labels, sources). Tabular numbers in charts.
- Colours: ink #121212, text grey #5C5C5C, rules #E3E3E3, blue #1D4E89 = group in focus, orange #C2410C = second series + chapter numbers, grey #8A8A8A / hollow grey = population or comparison group.
- Population comparison: whenever possible show the group's share next to its share of the population (filled vs hollow/outlined, or dashed grey line).
- Chapter pattern: kicker (number · topic), factual headline, short intro, legend, chart, grey "Läs så här" box with caveats, source line, "Nästa: …" link.
- Navigation: numbered chapter bar under the title (01 Över tid, 02 Födelseområde, 03 Fängelse, 04 Våldtäkt, 05 Äldre studier, Metod), swipeable row on mobile. Not sticky.
- Max width ~1120px, works at 390px. Charts sized from container width, with tooltips and printed values.

## Chapters
1. Misstänkta över tid 2007–2018 (Brå 2021:9) – use the full yearly series from the dashboard file.
2. Födelseland/födelseområde 2015–2018 (Brå 2021:9) – group vs population dots; the mockup shows the 1997–2001 version from bra2005.csv as placeholder.
3. Fängelse och medborgarskap 2014–2025 + foreign citizens in population.
4. Dömda för våldtäkt (Lund University) vs population/controls.
5. Brås äldre studier 1985–89 and 1997–2001.
6. Metod och begrepp.

## Caveats that must stay on the site
- Suspicions are not convictions; unadjusted figures; age and sex matter a lot.
- Citizenship is not country of birth; prison figures include non-residents not counted in the population.
- Rape studies cover convicted people only; population comparison is all ages and both sexes vs men 15–60; first study was reported to the ethics appeals board.
- Brå 2005 figures are over 20 years old; some crime-type rows (robbery, car theft, burglary, sex crimes) could not be read from the PDF.
- Values were machine-read from PDFs: spot-check against the original tables before publishing.

## Source links
- Brå 2021:9: https://bra.se/rapporter/arkiv/2021-08-25-misstankta-for-brott-bland-personer-med-inrikes-respektive-utrikes-bakgrund
- Brå 2005:17: https://www.bra.se/download/18.cba82f7130f475a2f1800012697/2005_17_brottslighet_bland_personer_fodda_sverige_och_utlandet.pdf
- Khoshnood et al. 2021: https://doi.org/10.1080/20961790.2020.1868681
- Khoshnood et al. 2026: https://lup.lub.lu.se/record/d9a9d1f6-f428-4b57-abf2-5e0e9c7b84f5
- SCB befolkning i sammandrag: https://www.scb.se/hitta-statistik/statistik-efter-amne/befolkning-och-levnadsforhallanden/befolkningens-sammansattning-och-utveckling/befolkningsstatistik/pong/tabell-och-diagram/sveriges-befolkning-i-sammandrag-1960-2025-korrigerad-2026-06-18/
- SCB utländska medborgare: https://www.scb.se/hitta-statistik/sverige-i-siffror/manniskorna-i-sverige/utlandska-medborgare-i-sverige/
- Brå kriminalvård reports: URLs in data/intagna_medborgarskap.csv
