# Backlog

Items from the SEO audit and the site review (November 2026) that are not done yet.

## To do: fixes from the site review (both languages)

Fix now: done 19 November 2026 (see "Done" below).

Next: nothing right now.

Watch:

- Brå plans new suspect statistics for 2019–2024 by the end of 2026. Update 1.1, 1.2 and the key figures when it is out.

## To do


## Backlog from the SEO plan (November 2026)

- **AI citation check (item 11).** A fixed list of about 25 questions (most can reuse the short-answer questions in `src/lib/shortAnswers.ts`), asked once a month in ChatGPT, Perplexity and Gemini. Log per question and tool: Brottsfokus mentioned, linked, used as the main source, quoted correctly. Owner put this in the backlog, 20 November 2026.
- **"Om uppgifterna": newer data.** Only 1.3 says a newer study exists (Brå 2021:9). Check by hand on Brå's site whether newer comparable data exists for the other chapters before saying so on the site.
- **Table page 2.1 (Brå 2025:21), temporalCoverage "1958/2023".** Mixes birth years (from 1958) and conviction years (to 2023). Consider stating the conviction period only, or saying which is which.

## Later, once there is search data

- **Separate question pages (item 12).** Only if Search Console shows clear demand for a question that the short answers and Frågor och svar do not already meet.

- Give each chapter its own URL. Each part has one since November 2026; per chapter only if search data shows a need.
- A Markdown copy of the main page. The table pages and `/llms.txt` have them already.
- Links from relevant places (data journalists, researchers, newsletters).

## Done

- Chapter summaries, 20 November 2026 (owner approved the copy): 1.1 and 1.3 got a sentence with the key numbers, years and source, with build checks. The other chapters already had them in "Kort svar" and "Om uppgifterna".

- Colour rules (owner's decision, 20 November 2026): "born in Sweden with one foreign-born parent" is teal (new token "fourth") in 1.1 and 2.1 instead of grey; the outlined grey bar stays and the rule now says it marks what a group is compared with (population, control group or Swedish background).

- SEO plan, 20 November 2026: part page titles and descriptions with the period, BreadcrumbList and Article markup (items 3–4); front page intro and "Om uppgifterna" in every chapter (1–2); ten "Kort svar" boxes (6); Frågor och svar page with FAQPage markup (7); "Läs också" links between chapters and to Metod terms (8); data dictionary and datapackage.json (10); Om sidan: owner works with data analysis, editorial points added (9).

- Table pages on phones: the first column (year, group or region) stays in place when scrolling sideways, with a thin edge once scrolled; it is narrower on phones. Also fixed: 3.1 now lists Brå's table 8 as a source next to table 12 (both share one web address, so table 8 was dropped), 19 November 2026.

- Error report form on Om sidan (both languages) via Formward, hosted in Sweden: honeypot, no captcha, no cookies; "Fel och rättelser" and "Kakor och besöksstatistik" updated, 19 November 2026.

- 3.1 Fängelse: remaining gaps filled (men and women 2014, 2015, 2022 from table 8; 1 October 2014–2022 from table 12), 19 November 2026. All series now run 2014–2025.

- 3.1 Fängelse: 2016, 2017 and 2021 filled from Brå's table 8 (computed from counts, checked against all 21 stated shares); men and women moved to their own chart on the same scale, 19 November 2026.

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
