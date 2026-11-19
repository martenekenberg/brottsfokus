# Backlog

Items from the SEO audit and the site review (November 2026) that are not done yet.

## To do: fixes from the site review (both languages)

Fix now: done 19 November 2026 (see "Done" below).

Next:

- 3.1 Fängelse: make all/men/women easier to tell apart; fill 2016, 2017 and 2021 from Brå's own table (same series).
- Table pages on phones: keep the year column fixed when scrolling sideways.
- Colour rules: grey is used for a comparison group in 1.1 (one foreign-born parent, solid grey) and 1.3, not only for the population. (2.1 fixed: Bäckman's comparison group is now a black line.)

Watch:

- Brå plans new suspect statistics for 2019–2024 by the end of 2026. Update 1.1, 1.2 and the key figures when it is out.

## To do

- **Error report form.** Add a form so readers can report errors without the owner's name or email address being shown. Use a form service that forwards messages privately and has spam protection. When it is in place, update the "Fel och rättelser" text in `src/components/About.astro`.
- **Chapter summaries.** Where a chapter intro lacks the key number, year and source, add one short sentence. Owner approves the copy first.

## Later, once there is search data

- Give each chapter its own URL. Each part has one since November 2026; per chapter only if search data shows a need.
- A Markdown copy of the main page. The table pages and `/llms.txt` have them already.
- Links from relevant places (data journalists, researchers, newsletters).

## Done

- Metod: table showing how each chapter groups background, and one spelling ("utrikesfödda") in the site's own text, 19 November 2026. Brå 2025:5's own labels ("utrikes födda") stay as Brå writes them.

- Owner decisions, 19 November 2026: the income and work charts (2.2 prior convictions and social assistance, 4.2 second chart) removed from the site and table pages; the masthead keeps the build date as "Uppdaterad".

- New page structure, 19 November 2026 (owner's decision): front page with part cards, one page per part, Metod and Om sidan on their own pages, menu with the current page marked and a scroll hint on phones, old `/#kap` links forwarded. Chapters 9 and 10 merged; Bäckman et al. drawn as line charts. The four card sentences in `src/lib/parts.ts` were approved by the owner.
- Purple for a fifth series added to the colour rules as "extra" (owner's request), 19 November 2026.
- Fixes from the site review, 19 November 2026: chapter 10 population wording; context in chapters 3 and 7; "iVercels" and English source wording; key figure source; chapter 2 share view order; chapter 7 labels over the reference line; masthead, share images (Swedish and English) and llms.txt cover all ten chapters; CLAUDE.md updated.
- Chapter 4 corrected to 47,7 and 40,8 % (Khoshnood et al. 2021, table 1); first entry in the correction log under "Om sidan", 19 November 2026.
- Both Lund studies confirmed CC BY 4.0 (licence text in the Europe PMC full texts), 19 November 2026.
- Three headlines rewritten to say only what the data shows (chapter 4, chapter 2 second chart, chapter 10 second chart), 19 November 2026.

- Redirect www to the plain domain (308), November 2026.
- Site verified in Google Search Console and Bing Webmaster Tools, sitemap submitted, November 2026.
