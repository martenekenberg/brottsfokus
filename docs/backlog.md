# Backlog

Items from the SEO audit and the site review (November 2026) that are not done yet.

## Decided: new page structure (owner, 19 November 2026)

Option 2 of three: a front page plus one page per part. Plan and owner check before building.

- Front page: masthead, key figures, and one short card per part with its main number and a link.
- One page and URL per part:
  1. Misstänkta för brott: över tid (+ icke folkbokförda), födelseområde (+ andra faktorer), Brås äldre studier.
  2. Lagförda och dömda: lagförda före 25 år, lagförda efter födelseår, våldtäkt.
  3. Fängelse och utvisning: fängelse, utvisning.
  4. Brottsoffer: utsatta för brott, dödligt våld.
- Metod and Om sidan stay reachable from every page.
- Chapters are numbered within each part. Old links such as `/#kap3` must still work (redirect or a small script on the front page).
- Table pages and CSV files keep their URLs. Update CLAUDE.md, the sitemap, llms.txt and the English pages in the same change.
- Open: merge chapters 9 and 10 into one chapter in part 2?

## To do: fixes from the site review (both languages)

Fix now:

- Chapter 10: describe Brå's population correctly (registered in Sweden at age 15 and when convicted; people who arrived later are not included). "Lagförd" includes district-court verdicts later overturned.
- "iVercels" missing space in Om sidan (`src/components/About.astro`). English leftovers "Brå rapport" and "m.fl." in the Method source list. English key figure "22 %".
- Masthead, share image, llms.txt intro and caveats still describe only chapters 1–5 (no victims, deportation or Stockholms universitet).
- Chapter 3: add Brå's statement that the number without Swedish citizenship has been roughly stable since 2021 (the share fell because more Swedish citizens were admitted), and an age caveat (prisoners are adults, the population includes children).
- Chapter 7: add that 5 045 of the 5 826 (87 %) were not registered in Sweden (table B1).
- Chapter 7: the dashed "Alla" line runs through the value labels. Chapter 1, second chart: purple is not in the palette.
- Chapter 2: the share view keeps risk order instead of sorting by the value shown.
- Check against the papers: 6,4 % (256 of 4 032 is 6,35 %) and 47,8 % (1 451 of 3 039 is 47,7 %) in the rape studies.
- Key figure source "Brå 2025; SCB": name the report.
- CLAUDE.md: describe chapters 6–10, the new sources and the nav.

Next:

- Nav: two rows on desktop, no "you are here" marker, no scroll hint at 360 px. (Largely solved by the new structure.)
- Metod: a table showing which background grouping each chapter uses; one spelling ("utrikesfödda") in the site's own text.
- Chapter 9: draw as line charts per sex, like chapter 10.
- Chapter 3: make all/men/women easier to tell apart; fill 2016, 2017 and 2021 from Brå's own table (same series).
- Table pages on phones: keep the year column fixed when scrolling sideways.
- Colour rules: grey is used for comparison groups in chapters 1, 5 and 9, not only for the population.

Owner decisions still open:

- Keep the income and work charts (chapter 4 prior convictions, chapter 8 second chart)?
- Masthead "Uppdaterad" date: keep the build date?
- Brå plans new suspect statistics for 2019–2024 by the end of 2026. Update chapters 1–2 and the key figures when it is out.

## To do

- **Confirm the license of the two Lund studies.** Europe PMC lists both articles as open access under CC BY, but the publisher pages (Taylor & Francis, SAGE) could not be read to confirm it. If either is not CC BY, change the terms text on `/data/valdtakt/`.
- **Error report form.** Add a form so readers can report errors without the owner's name or email address being shown. Use a form service that forwards messages privately and has spam protection. When it is in place, update the "Fel och rättelser" text in `src/components/About.astro`.
- **Correction log.** The first time a number is corrected, add a dated list of corrections to the "Om sidan" section.
- **Chapter summaries.** Where a chapter intro lacks the key number, year and source, add one short sentence. Owner approves the copy first.

## Later, once there is search data

- Give each chapter its own URL, keeping the one-page overview. (Partly replaced by the decided structure above: one URL per part.)
- A Markdown copy of the main page. The table pages and `/llms.txt` have them already.
- Links from relevant places (data journalists, researchers, newsletters).

## Done

- Three headlines rewritten to say only what the data shows (chapter 4, chapter 2 second chart, chapter 10 second chart), 19 November 2026.

- Redirect www to the plain domain (308), November 2026.
- Site verified in Google Search Console and Bing Webmaster Tools, sitemap submitted, November 2026.
