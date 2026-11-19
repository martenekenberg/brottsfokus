// Draws the share images public/og.png (Swedish) and public/og-en.png (English), 1200x630.
// Run after changing the text below: node scripts/og-image.cjs
// Needs Playwright with Chromium. It is not a project dependency: install it separately
// (or use a machine where it is already installed). The fonts are the site's own, from node_modules.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const font = (pkg, file) =>
  'data:font/woff2;base64,' + fs.readFileSync(path.join(root, 'node_modules/@fontsource-variable', pkg, 'files', file)).toString('base64');
const serif = font('newsreader', 'newsreader-latin-opsz-normal.woff2');
const sans = font('inter', 'inter-latin-wght-normal.woff2');

// Keep in step with the masthead (src/components/Masthead.astro) and src/lib/site.ts.
const TEXT = {
  sv: {
    file: 'og.png',
    kicker: 'Offentlig statistik och forskning',
    intro: 'Misstänkta, dömda, intagna och brottsoffer i Sverige efter födelseland och medborgarskap, jämfört med befolkningen.',
    sources: 'Källor: Brå, SCB, Lunds och Stockholms universitet',
  },
  en: {
    file: 'og-en.png',
    kicker: 'Official statistics and research',
    intro: 'Suspects, convicted people, prisoners and victims of crime in Sweden, by country of birth and citizenship, compared with the population.',
    sources: 'Sources: Brå, SCB, Lund and Stockholm universities',
  },
};

const html = (t) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Newsreader; src: url(${serif}) format('woff2'); font-weight: 200 800; }
@font-face { font-family: Inter; src: url(${sans}) format('woff2'); font-weight: 100 900; }
html, body { margin: 0; width: 1200px; height: 630px; background: #FFFFFF; }
body { box-sizing: border-box; border-top: 12px solid #121212; padding: 72px 80px 0; position: relative; }
.kicker { font: 600 22px Inter; letter-spacing: 0.08em; text-transform: uppercase; color: #C2410C; }
h1 { font: 500 150px/1 Newsreader; letter-spacing: -0.02em; color: #121212; margin: 14px 0 34px; }
.intro { font: 400 36px/1.4 Newsreader; color: #333333; margin: 0; max-width: 960px; }
.foot { position: absolute; left: 80px; right: 80px; bottom: 58px; border-top: 2px solid #121212; padding-top: 22px;
  display: flex; justify-content: space-between; font: 400 22px Inter; color: #5C5C5C; }
</style></head><body>
<div class="kicker">${t.kicker}</div>
<h1>Brottsfokus</h1>
<p class="intro">${t.intro}</p>
<div class="foot"><span>${t.sources}</span><span>brottsfokus.xyz</span></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const t of Object.values(TEXT)) {
    await page.setContent(html(t), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(root, 'public', t.file) });
    console.log('wrote public/' + t.file);
  }
  await browser.close();
})();
