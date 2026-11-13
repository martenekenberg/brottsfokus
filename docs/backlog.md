# Backlog

Items from the SEO audit (November 2026) that are not done yet.

## To do

- **Confirm the license of the two Lund studies.** Europe PMC lists both articles as open access under CC BY, but the publisher pages (Taylor & Francis, SAGE) could not be read to confirm it. If either is not CC BY, change the terms text on `/data/valdtakt/`.
- **Error report form.** Add a form so readers can report errors without the owner's name or email address being shown. Use a form service that forwards messages privately and has spam protection. When it is in place, update the "Fel och rättelser" text in `src/components/About.astro`.
- **Correction log.** The first time a number is corrected, add a dated list of corrections to the "Om sidan" section.
- **Redirect www to the plain domain.** In Vercel: Project, Settings, Domains. Set `www.brottsfokus.xyz` to redirect (308) to `brottsfokus.xyz`. Do not also set the reverse.
- **Google Search Console and Bing Webmaster Tools.** Verify the domain with a DNS record (no code on the site), submit `https://brottsfokus.xyz/sitemap.xml` and request indexing.
- **Chapter summaries.** Where a chapter intro lacks the key number, year and source, add one short sentence. Owner approves the copy first.

## Later, once there is search data

- Give each chapter its own URL, keeping the one-page overview.
- Markdown copies of the content, `/sitemap.md` and `/llms.txt`, generated at build time from the same data.
- Links from relevant places (data journalists, researchers, newsletters).
