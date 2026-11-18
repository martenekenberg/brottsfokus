# New data and topics for Brottsfokus

Research done in November 2026. This is a list of proposals. Nothing here is on the site. Each item needs the owner's approval before it is built, because most of them add a new source (see CLAUDE.md, "Working rules").

How to read the numbers below:

- **Checked**: I read the number in the source document myself (page or table given).
- **Not checked**: the number comes from a search summary or a secondary source. It must be read in the original before use.

---

## Summary: what I recommend

| # | Idea | New source? | Data ready? | Effort | Why |
|---|---|---|---|---|---|
| 1 | Victims of crime by background (NTU) | Yes, Brå | Yes, Excel table appendix | Small | Shows the other side: people with foreign background are also more often victims. Differences are small. |
| 2 | Homicide: victims and perpetrators | Yes, Brå | Numbers in the text; full report needed for tables | Medium | Strong, recent (2025), compares with the population, and shows victims as well as perpetrators. |
| 3 | Deportation: how many are actually deported | Yes, Brå | Table 6 ready; yearly series needs the appendix | Small | Fits the prison chapter (citizenship). Brand new (2026). |
| 4 | Other risk factors from Brå 2021:9 | No | Yes | Small | Puts the 2.5× and 3× in context: welfare 6.1×, education 4.1×, sex 3.2×. |
| 5 | Suspicions linked to people not registered in Sweden | No | Brå 2021:9 figure 1 | Small | Answers a common question and supports the caveat in chapter 3. |
| 6 | Long trend 1973–2017, age-adjusted (convictions) | Yes, Stockholm University | Appendix table 4.1 | Medium | The only long, age-adjusted Swedish series. Fills the "not adjusted" gap. |
| 7 | Birth cohorts: share convicted by age 25 | Yes, Brå | Probably Excel; check | Medium | Shows the decline in every background group. |
| 8 | Nordic comparison (Denmark, Norway) | Yes, DST/Justice Ministry DK, SSB | Yes | Medium | Denmark publishes age-adjusted figures every year, which Sweden does not. |
| 9 | Country of birth vs. the country's HDI | Yes, UNDP | Our existing data + UNDP | Small | Brå itself found a strong link (r = 0.66). A scatter plot makes it visible. |
| 10 | Self-reported crime among young people | Yes | Study must be read | Medium | Self-reports show a different picture than police registers after 2010. |

**Watch first:** Brå plans to publish new statistics on suspects by background for **2019–2024** at the end of 2026 ([Brå project page](https://bra.se/om-bra/projekt-och-uppdrag/projekt/2025-03-04-statistiska-produkter-baserade-pa-underlagen-till-kriminalstatistiken)). It was not out when I searched (17 November 2026). When it comes, it should update chapters 1 and 2 before anything else on this list. Brå says the update is a selection of the 2021:9 results and is not planned as a yearly series.

---

## 1. Victims of crime by background (NTU)

**Source:** Brå, NTU Kortanalys 2/2024, *Utsatthet för brott bland personer med utländsk bakgrund. En sammanställning av resultat från NTU 2017–2023* ([page](https://bra.se/rapporter/arkiv/2024-05-21-utsatthet-for-brott-bland-personer-med-utlandsk-bakgrund), [PDF](https://bra.se/download/18.45e4b8e192705389a3b1f/1728587195539/2024_Utsatthet-for-brott-bland-personer-med-utlandsk-bakgrund.pdf), [Excel tables](https://bra.se/download/18.45e4b8e192705389a3b2a/1728588682901/2024_Tabellbilaga-Utsatthet-for-brott-bland-personer-med-utlandsk-bakgrund.xlsx)). Companion report 3/2024 on insecurity and worry about crime ([page](https://bra.se/rapporter/arkiv/2024-05-21-otrygghet-och-oro-for-brott-bland-personer-med-utlandsk-bakgrund), [Excel](https://bra.se/download/18.45e4b8e192705389a3b4e/1728589090137/2024_Tabellbilaga-Otrygghet.och-oro-for-brott-bland-personer-med-utlandsk-bakgrund.xlsx)).

**What it shows (checked, reference years 2016–2022 pooled):**

| Crime | Men, foreign background | Men, Swedish background | Women, foreign background | Women, Swedish background |
|---|---|---|---|---|
| Assault | 4,2 % | 3,8 % | 2,8 % | 2,3 % |
| Threats | 9,6 % | 8,2 % | 9,2 % | 7,6 % |
| Sexual offences | 1,5 % | 1,3 % | 7,7 % | 9,2 % |

- People with foreign background report being victims somewhat more often for most crime types. Sexual offences against women are the exception: more common among women with Swedish background.
- Repeated victimisation of assault, threats and sexual offences is more common among people with Swedish background.
- In the sample, 21,5 % had foreign background (78,5 % Swedish background).
- Report 3/2024: worry about crime in society is *higher* among people with Swedish background; insecurity outdoors is slightly higher among people with foreign background.

**Chart idea:** paired dot plot per crime type, men and women side by side, with confidence intervals (Brå gives them). Region-of-birth breakdown as a second chart.

**Caveats:** Survey of people aged 16–84 who are registered in Sweden. Brå's background grouping here differs slightly from the one in official NTU statistics. Small groups have wide confidence intervals (Brå's own example: 4,3 %, interval 1,3–10,6 %).

**Where on the site:** a new chapter "Utsatta för brott" or a section after chapter 1.

---

## 2. Homicide: victims and perpetrators

**Source:** Brå 2025:5, *Homicide victims and perpetrators: socio-economic situation* (English summary of the Swedish report *Offer och gärningspersoner vid dödligt våld: Socioekonomisk situation*) ([PDF](https://bra.se/download/18.95667a5197a221e99c353d5/1751634990413/2025_5_Homicide%20victims%20and%20perpetrators.pdf)). All homicides in Sweden 2005–2021: 1 521 victims and 1 175 perpetrators.

**What it shows (checked, from the summary):**

| Measure | Victims | Perpetrators | Population |
|---|---|---|---|
| Foreign background | 49 % | 43 % | 21 % |
| Foreign background, homicides in criminal milieux | 80 % | 64 % | |
| Lowest income decile | 45 % | 51 % | 10 % (by definition) |
| Live in areas with high socio-economic disadvantage | 16 % | 15 % | 5 % |
| Single-parent household | 12 % | 13 % | 7 % |
| Convicted of a crime in the year before | 24 % | 28 % | 1,2 % (age 15+) |

- Victims per 100 000: Swedish-born with two foreign-born parents aged 20–24: 173; aged 25–29: 116. Swedish-born with two Swedish-born parents: 16.
- Among 16–19-year-olds: born in Africa 161 per 100 000, born in Asia 78, born in Sweden 15.
- Over-representation of foreign background is *larger among victims than among perpetrators*, and has grown among young victims.
- Foreign-born victims and perpetrators had lived in Sweden for 16 and 15 years on average.

**Chart idea:** the same "group vs population" grammar as the rest of the site: filled blue bar for victims, filled orange for perpetrators, hollow grey for the population. One row per measure.

**Caveats:** About 70 % of homicides in criminal milieux are unsolved, so perpetrator data is weighted. Registered income misses criminal income. Only people with a Swedish personal identity number are included.

**Next step:** get the Swedish main report for full tables and the 2005–2021 trend.

---

## 3. Deportation: how many are actually deported

**Source:** Brå 2026:15, *Utvisningsdömda i brottmål. En statistisk analys av verkställda utvisningar och fortsatt brottslighet* ([PDF](https://bra.se/download/18.5d0a8fbf19ddcaf2a6cccb2/1777972068717/2026_15_Utvisningsd%C3%B6mda%20i%20brottm%C3%A5l.pdf)). Everyone with a deportation order in a prison sentence who left prison 2013–2023, followed up to 2024.

**What it shows (checked):**

- 5 826 people. 48 % had the deportation carried out during the follow-up.
- Carried out within one year of leaving prison: 18 % (left prison 2013), 60 % (2019, the peak), 58 % (2023). Dip in 2020–2021 linked to the pandemic.
- 18 % were convicted of new crimes in Sweden, together 4 197 crimes, which is 0,2 % of all convicted crimes in the period.
- Table 6, share deported by region of citizenship:

| Citizenship | People | Share deported |
|---|---|---|
| Africa | 923 | 39,4 % |
| North Africa | 504 | 31,9 % |
| West Africa | 313 | 48,9 % |
| East Africa | 93 | 45,2 % |
| Asia | 1 002 | 42,0 % |
| South Central Asia | 261 | 39,8 % |
| West Asia | 694 | 42,2 % |
| Europe | 3 154 | 52,2 % |
| Northern Europe | 571 | 56,4 % |
| Southern Europe | 624 | 54,8 % |
| Western Europe | 203 | 81,8 % |
| Eastern Europe | 1 756 | 46,5 % |
| Latin America and Caribbean | 191 | 50,8 % |
| South America | 147 | 53,1 % |
| Not defined | 545 | 50,3 % |

**Chart idea:** line chart of the yearly share deported within one year (figure 12, values must be read from Bilaga 1 or asked from Brå), plus a bar chart of table 6.

**Caveats:** People can be deported to a country other than their country of citizenship. Brå does not claim causes for the rise, only that it coincides with new rules (2014), liaison officers (from 2016) and more border police.

**Where on the site:** chapter 3 (prison and citizenship), as a second chart.

---

## 4. Other risk factors, from Brå 2021:9 (no new source)

**Source:** Brå 2021:9, already used on the site. Cited in Brå 2025:7, p. 39–40 (checked there; check the page in 2021:9 itself before use).

Excess risk of being suspected of a crime, 2015–2018, not adjusted:

- Family received social assistance vs not: **6,1×**
- Only compulsory school vs at least three years of higher education: **4,1×**
- Men vs women: **3,2×**
- Foreign-born vs Swedish-born with two Swedish-born parents: 2,5× (1997–2001) → **2,2×** (2015–2018)
- Swedish-born with two foreign-born parents: 2,0× (1997–2001) → **2,4×** (2015–2018)

**Chart idea:** one horizontal bar chart, "excess risk compared with ...", with the dashed black line at 1. Background rows in blue, other factors in grey. This is the comparison Brå itself makes to show the size of the background differences.

**Caveat:** each factor is measured on its own. They overlap and cannot be added.

---

## 5. Suspicions linked to people not registered in Sweden (no new source)

**Source:** Brå 2021:9, figure 1 (cited in Brå 2025:7, p. 37–40).

- People not registered in Sweden: **6 %** of all registered suspicions in 2007, **9 %** in 2018.
- The rise 2007–2015 was mainly burglary and other theft linked to cross-border organised crime. 2015–2017 saw a temporary rise for most crime types.
- Suspicions against non-registered people were about 30 % higher per year in 2015–2017 than in 2011, while asylum seekers in 2015 were over 400 % more than in 2011.

**Chart idea:** stacked area or line chart of each group's share of all suspicions, 2007–2018 (figure 1 in Brå 2021:9). Values must be read from the report's table appendix.

---

## 6. Long trend 1973–2017, age-adjusted convictions

**Source:** Bäckman, Estrada, Nilsson and Sivertsson (2021), *Criminal convictions and immigrant background 1973–2017 in Sweden: have differences increased or declined?* Nordic Journal of Criminology 22(2), open access, CC BY ([DOI](https://doi.org/10.1080/2578983X.2021.1900038)). Longer Swedish report: *Den ojämlika brottsligheten*, Kriminologiska institutionen, Stockholms universitet, Rapport 2020:1 ([PDF](https://www.criminology.su.se/polopoly_fs/1.513595.1598864530!/menu/standard/file/Den%20oj%C3%A4mlika%20brottsligheten%20Rapport%202020_1.pdf)).

**What it shows (as cited in Brå 2025:7, p. 38–39; check against the article):**

Excess risk of conviction compared with Swedish-born with Swedish-born parents, standardised for age:

| Group | 1973 | Peak | 2017 |
|---|---|---|---|
| Men born in non-Western countries | 1,6 | about 2,5 (1992–2004) | 2,0 |
| Men born in Western countries | 1,9 | | 1,6 |
| Women born in Western countries | 2,3 | 2,4 (1989) | 1,5 |
| Women born in non-Western countries | 1,8 | 3,2 (1989) | 1,5 |
| Swedish-born men with foreign-born parents | 1,9 | | 2,4 |
| Swedish-born women with foreign-born parents | 1,1 | | 1,9 |

- Conviction rates fell in every group over 40 years. The rise for the second generation comes from a *smaller* fall than among the majority, not from a rise in their own convictions.

**Chart idea:** small multiples, men and women, 1973–2017, risk axis with dashed line at 1. This would be the site's first age-adjusted time series.

**Next step:** get yearly values from appendix table 4.1 in Rapport 2020:1. The download link returned a web page, not the PDF, so it needs to be fetched again.

---

## 7. Birth cohorts: share convicted by age 20 and 25

**Source:** Brå 2025:21, *Födelsekohortstatistik. Lagföringsbeslut bland personer folkbokförda i Sverige födda 1958–2007* ([PDF](https://bra.se/download/18.121c12819a7bb0f9a5333cc/1764606362923/2025_F%C3%B6delsekohortstatistik.pdf); summary in 2025:22).

**What it shows (checked, main report p. 58–60):**

- Share convicted of any crime by age 25 fell among the foreign-born from **26,3 %** (born 1984) to **19,9 %** (born 1998).
- Among Swedish-born with two Swedish-born parents: from **14,5 %** (born 1987) to **10,2 %** (born 1998).
- The share convicted and the share sentenced to prison fell with each cohort *in all four background groups*. Levels differ, trends are the same.
- Swedish-born with two Swedish-born parents make up 72 % of all convicted people in the study.

**Chart idea:** line chart by birth year (1984–2000s), four background groups, share convicted by age 25. Matches chapter 1's visual style.

**Caveats:** By background only for people born from 1984 (population data). Convictions, not suspicions. Only people registered in Sweden.

---

## 8. Nordic comparison

**Denmark.** Justitsministeriets Forskningsenhed, *Kriminalitet og herkomst 2023* (April 2025), built on Danmarks Statistik data ([PDF](https://www.justitsministeriet.dk/wp-content/uploads/2025/05/Kriminalitet-og-herkomst-2023-WT.pdf)). Annual figures also in Danmarks Statistik, *Indvandrere i Danmark* (crime chapter) and Statistikbanken.

Checked (figure 3, men 15–79, convictions under the criminal code, 2023, age-adjusted index, 100 = all men):

- Danish origin: 88
- Immigrants of Western origin: 85
- Descendants of Western origin: 131
- Immigrants of non-Western origin: 158
- Descendants of non-Western origin: **262**

Also checked: the number of convicted descendants of non-Western origin rose from 654 (2000) to 2 301 (2023), while the *share* convicted fell. Most convicted men (13 746 of 19 425) are of Danish origin.

**Norway.** SSB, *Siktelser og siktede personer etter innvandringsbakgrunn* ([article](https://www.ssb.no/sosiale-forhold-og-kriminalitet/kriminalitet-og-rettsvesen/statistikk/etterforskede-lovbrudd/artikler/siktelser-og-siktede-personer-etter-innvandringsbakgrunn)). Not checked: about 130 charges per 1 000 for immigrants and for Norwegian-born with immigrant parents, just over 80 for the rest of the population (2021–2023). Rates also for men aged 15–24 by country of origin.

**Finland.** Statistics Finland publishes suspects by origin in its database (tables 13zk, 14pd). Not checked.

**Chart idea:** one chart per country, each in its own units, *not* on a shared axis. The point is the pattern (which groups are above and below the majority), not the levels.

**Caveats:** Definitions differ (Denmark counts "Danish origin" as having at least one parent who is a Danish citizen born in Denmark). Convictions vs charges vs suspicions. Levels cannot be compared across countries.

---

## 9. Country of birth vs. the country's Human Development Index

**Source:** our existing `misstankta_ursprung_2015_2018.csv` (country view) plus UNDP's Human Development Index (new source).

Brå 2021:9 found a correlation of **r = 0,66** between countries' HDI and the share of people born there who were suspected of crime in Sweden: lower HDI, higher share (cited in Brå 2025:7, p. 32, checked there). Brå 2025:7 also cites Skardhamar et al. (2014): in Norway and Finland the highest risks were among groups from countries with war or conflict.

**Chart idea:** scatter plot, one dot per country, HDI on the x axis, rate per 1 000 on the y axis, dot size by group size. Label the largest groups.

**Caveats:** Correlation, not cause. HDI year must be chosen to match the period. A scatter with country labels needs careful neutral wording.

---

## 10. Self-reported crime among young people

**Source:** Vasiljevic, Svensson and Shannon (2020), *Immigration and crime: a time-trend analysis of self-reported crime in Sweden, 1999–2017*, Nordic Journal of Criminology 21(1). Data from Brå's Skolundersökningen om brott (year 9 students).

What Brå 2025:7 says about it (p. 26 and 36–37, checked there): foreign-born young people reported more crime than Swedish-born up to about 2010 and *less* after that. Self-reported crime fell in both groups 1999–2017, more among the foreign-born.

**Why it matters:** it is the only measure that does not depend on police reporting and investigation. It shows how registered and self-reported crime can tell different stories.

**Next step:** read the article for the yearly values and its licence.

---

## Useful for the Metod section (no chart)

**Brå 2025:7, *Migration och brott*** (May 2025, written for Konjunkturinstitutet) ([PDF](https://www.konj.se/media/42ydkrrl/brottsforebyggande-radet-migration-och-brott-en-kunskapssammanstallning.pdf)). Brå's own review of Swedish and international research. Main points (checked):

- No simple link between migration and the crime trend at national level. Other factors matter more.
- In the Nordic countries and Western Europe, foreign-born people are over-represented in registered crime. In the USA and several English-speaking countries they are under-represented.
- The over-representation gets smaller when studies adjust for sex, age and socio-economic situation.
- It varies a lot by group. In Norway, refugees and family members of refugees had the highest levels, and people who came for work or study had *lower* levels than Norwegian-born with Norwegian-born parents (Andersen et al. 2022).
- Large, sudden migration shocks are the case most often linked to more crime in the years around them.

**Hällsten, Szulkin and Sarnecki (2013), *Crime as a price of inequality?*** British Journal of Criminology 53(3). Stockholm cohort, school leavers 1990–93. Not checked in full: family resources and neighbourhood explain about half to three quarters of the gap for men, and more for women.

**Brå 2023:3, *Socioekonomisk bakgrund och brott*** (research review). Background for any chapter on what explains the differences.

---

## Considered and left out

- **Number of gang criminals** (Police, November 2025: about 17 500 active, about 50 000 linked). No background data, and the method changed in 2025, so the series is not comparable.
- **Police list of vulnerable areas** (59 in 2023, 65 in 2025). No background data, and the 2025 list changed method (risk areas removed, borders redrawn).
- **Hate crime statistics** (Brå 2025:19: 2 731 reports with a hate motive in 2024, about half xenophobic or racist). Relevant to the victim side, but a different topic. Ask the owner.
- **Share of foreign nationals in European prisons** (Council of Europe, SPACE I 2025). Could put chapter 3 in context, but I could not confirm Sweden's figure, and countries count foreign nationals differently.

---

## Suggested order

1. Watch for Brå's 2019–2024 update and update chapters 1 and 2 when it comes.
2. Items 4 and 5: no new source, small work, add context to what is already there.
3. Item 1 (victims) and item 3 (deportation): ready data, recent, fit existing chapters.
4. Item 2 (homicide) once the Swedish main report is in hand.
5. Items 6 and 7 together as a new chapter on long-term trends, with item 8 as a Nordic box.
