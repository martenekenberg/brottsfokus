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
- Chapters 9 and 10 become one chapter in part 2 (owner, 19 November 2026).

## To do: fixes from the site review (both languages)

Fix now: done 19 November 2026 (see "Done" below).

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

- **Error report form.** Add a form so readers can report errors without the owner's name or email address being shown. Use a form service that forwards messages privately and has spam protection. When it is in place, update the "Fel och rättelser" text in `src/components/About.astro`.
- **Chapter summaries.** Where a chapter intro lacks the key number, year and source, add one short sentence. Owner approves the copy first.

## Later, once there is search data

- Give each chapter its own URL, keeping the one-page overview. (Partly replaced by the decided structure above: one URL per part.)
- A Markdown copy of the main page. The table pages and `/llms.txt` have them already.
- Links from relevant places (data journalists, researchers, newsletters).

## Done

- Purple for a fifth series added to the colour rules as "extra" (owner's request), 19 November 2026.
- Fixes from the site review, 19 November 2026: chapter 10 population wording; context in chapters 3 and 7; "iVercels" and English source wording; key figure source; chapter 2 share view order; chapter 7 labels over the reference line; masthead, share images (Swedish and English) and llms.txt cover all ten chapters; CLAUDE.md updated.
- Chapter 4 corrected to 47,7 and 40,8 % (Khoshnood et al. 2021, table 1); first entry in the correction log under "Om sidan", 19 November 2026.
- Both Lund studies confirmed CC BY 4.0 (licence text in the Europe PMC full texts), 19 November 2026.
- Three headlines rewritten to say only what the data shows (chapter 4, chapter 2 second chart, chapter 10 second chart), 19 November 2026.

- Redirect www to the plain domain (308), November 2026.
- Site verified in Google Search Console and Bing Webmaster Tools, sitemap submitted, November 2026.
