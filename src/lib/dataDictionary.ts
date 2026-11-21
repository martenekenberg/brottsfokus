// Data dictionary for the CSV files on the table pages: each column's name in each language, its type,
// unit and meaning. Shown on each table page, in its Markdown copy and in /data/datapackage.json.
// tests/dataDictionary.test.ts checks that the columns match each CSV file's header exactly, in order.
// Item 10 of the SEO plan, November 2026.
import type { Lang } from './i18n';
import { DK_CSV, DK_OFFENCE_CSV, DK_ORDER, DK_STYLE, OFFENCE_NAME } from './chapters/kap11';
import { kap12DictionaryColumns } from './chapters/kap12';
import type { DkOffence } from './data';

type Text = { sv: string; en: string };
/** Types as in the Frictionless Table Schema. */
export type FieldType = 'string' | 'integer' | 'number';

export interface Column {
  name: Text;
  type: FieldType;
  unit?: Text;
  description: Text;
}

const PCT: Text = { sv: 'procent', en: 'percent' };
const COUNT: Text = { sv: 'antal', en: 'count' };
const PER1000: Text = { sv: 'per 1 000 personer', en: 'per 1,000 people' };
const TIMES: Text = { sv: 'gånger (kvot)', en: 'times (ratio)' };

const col = (sv: string, en: string, type: FieldType, description: Text, unit?: Text): Column => ({ name: { sv, en }, type, unit, description });

const DICTIONARY: Record<string, Column[]> = {
  // 1.1 Misstänkta över tid (Brå 2021:9, appendix 2 and 3)
  kap1: [
    col('brottstyp', 'crime_type', 'string', { sv: 'Brottstyp enligt Brås indelning.', en: 'Crime type, as grouped by Brå.' }),
    col('ar', 'year', 'integer', { sv: 'År då brottet begicks.', en: 'Year the crime was committed.' }),
    ...[
      ['inrikesfodda_tva_inrikesfodda_foraldrar', 'born_in_sweden_two_swedish_born_parents', 'inrikesfödda med två inrikesfödda föräldrar', 'people born in Sweden with two Swedish-born parents'],
      ['inrikesfodda_en_utrikesfodd_foralder', 'born_in_sweden_one_foreign_born_parent', 'inrikesfödda med en utrikesfödd förälder', 'people born in Sweden with one foreign-born parent'],
      ['inrikesfodda_tva_utrikesfodda_foraldrar', 'born_in_sweden_two_foreign_born_parents', 'inrikesfödda med två utrikesfödda föräldrar', 'people born in Sweden with two foreign-born parents'],
      ['utrikesfodda', 'born_abroad', 'utrikesfödda', 'people born abroad'],
      ['hela_befolkningen', 'whole_population', 'hela befolkningen', 'the whole population'],
    ].map(([sv, en, gsv, gen]) =>
      col(`${sv}_per1000`, `${en}_per1000`, 'number', { sv: `Misstänkta under året per 1 000 ${gsv}, folkbokförda 15 år och äldre.`, en: `People suspected during the year per 1,000 ${gen}, registered residents aged 15 and over.` }, PER1000),
    ),
    ...[
      ['inrikesfodda_tva_inrikesfodda_foraldrar', 'born_in_sweden_two_swedish_born_parents', 'inrikesfödda med två inrikesfödda föräldrar', 'people born in Sweden with two Swedish-born parents'],
      ['utrikesfodda', 'born_abroad', 'utrikesfödda', 'people born abroad'],
      ['inrikesfodda_tva_utrikesfodda_foraldrar', 'born_in_sweden_two_foreign_born_parents', 'inrikesfödda med två utrikesfödda föräldrar', 'people born in Sweden with two foreign-born parents'],
      ['inrikesfodda_en_utrikesfodd_foralder', 'born_in_sweden_one_foreign_born_parent', 'inrikesfödda med en utrikesfödd förälder', 'people born in Sweden with one foreign-born parent'],
      ['icke_folkbokforda', 'not_registered', 'personer som inte var folkbokförda i Sverige', 'people not registered as living in Sweden'],
    ].flatMap(([sv, en, gsv, gen], _i, all) => (_i > 0 ? [] : [
      ...all.map(([sv, en, gsv, gen]) =>
        col(`misstankar_${sv}_antal`, `suspicions_${en}_count`, 'integer', { sv: `Registrerade brottsmisstankar under året mot ${gsv}. Räknar misstankar, inte personer. Bara i raderna för brott totalt.`, en: `Registered crime suspicions during the year against ${gen}. Counts suspicions, not people. Only in the rows for all crimes.` }, COUNT),
      ),
      ...all.map(([sv, en, gsv, gen]) =>
        col(`misstankar_${sv}_andel_pct`, `suspicions_${en}_share_pct`, 'number', { sv: `Andel av alla registrerade brottsmisstankar under året som gällde ${gsv}. Bara i raderna för brott totalt.`, en: `Share of all registered crime suspicions during the year that concerned ${gen}. Only in the rows for all crimes.` }, PCT),
      ),
    ])),
  ],
  // 1.2 Födelseområde (Brå 2021:9, appendix 1)
  kap2: [
    col('vy', 'view', 'string', { sv: 'Indelning: bakgrund, fodelseomrade (utrikesföddas födelseområde), fodelseland, moderns_fodelseomrade (inrikesfödda med två utrikesfödda föräldrar efter moderns födelseområde) eller riskfaktorer (Brås jämförelse med försörjningsstöd, utbildning och kön).', en: 'Breakdown: background, birth region (people born abroad), birth country, mothers_birth_region (people born in Sweden with two foreign-born parents, by the mother’s birth region) or risk factors (Brå’s comparison with social assistance, education and sex).' }),
    col('brottstyp', 'crime_type', 'string', { sv: 'Brottstyp enligt Brås indelning.', en: 'Crime type, as grouped by Brå.' }),
    col('grupp', 'group', 'string', { sv: 'Gruppen raden gäller: bakgrundsgrupp, födelseområde, födelseland eller jämförelse.', en: 'The group the row is about: background group, birth region, birth country or comparison.' }),
    col('fodelseomrade', 'birth_region', 'string', { sv: 'Födelseområdet som födelselandet hör till. Tomt för andra indelningar.', en: 'The birth region the birth country belongs to. Empty for other breakdowns.' }),
    col('antal_i_befolkningen', 'population_count', 'integer', { sv: 'Antal folkbokförda 15 år och äldre i gruppen den 31 december 2014.', en: 'Number of registered residents aged 15 and over in the group on 31 December 2014.' }, COUNT),
    col('misstankta_per1000', 'suspects_per_1000', 'number', { sv: 'Misstänkta för minst ett brott någon gång 2015–2018 per 1 000 i gruppen.', en: 'People suspected of at least one crime at some point in 2015–2018 per 1,000 in the group.' }, PER1000),
    col('overrisk', 'excess_risk', 'number', { sv: 'Hur många gånger vanligare det var att misstänkas än för inrikesfödda med två inrikesfödda föräldrar (1 = lika vanligt). För riskfaktorer: jämfört med den motsatta gruppen.', en: 'How many times more common it was to be suspected than for people born in Sweden with two Swedish-born parents (1 = equally common). For risk factors: compared with the opposite group.' }, TIMES),
    col('overrisk_justerad', 'excess_risk_adjusted', 'number', { sv: 'Brås beräknade överrisk om gruppen hade haft samma ålder, kön, disponibel inkomst och utbildning som jämförelsegruppen. Inte en faktisk andel.', en: 'Brå’s calculated excess risk if the group had the same age, sex, disposable income and education as the comparison group. Not an actual share.' }, TIMES),
    col('antal_misstankta', 'suspects_count', 'integer', { sv: 'Antal i gruppen som misstänktes för minst ett brott 2015–2018.', en: 'Number in the group suspected of at least one crime in 2015–2018.' }, COUNT),
    col('andel_av_misstankta_pct', 'share_of_suspects_pct', 'number', { sv: 'Gruppens andel av alla misstänkta 2015–2018.', en: 'The group’s share of all suspects in 2015–2018.' }, PCT),
    col('andel_av_befolkningen_pct', 'share_of_population_pct', 'number', { sv: 'Gruppens andel av befolkningen 15 år och äldre den 31 december 2014.', en: 'The group’s share of the population aged 15 and over on 31 December 2014.' }, PCT),
    col('andel_misstankta_i_gruppen_pct', 'share_of_group_suspected_pct', 'number', { sv: 'Andel av gruppen som misstänktes för minst ett brott 2015–2018.', en: 'Share of the group suspected of at least one crime in 2015–2018.' }, PCT),
  ],
  // 3.1 Fängelse och medborgarskap (Brå's prison statistics, SCB)
  kap3: [
    col('ar', 'year', 'integer', { sv: 'År.', en: 'Year.' }),
    col('nyintagna_utan_sv_medb_pct', 'new_all_no_swedish_citizenship_pct', 'number', { sv: 'Andel av alla nyintagna i fängelse under året som saknade svenskt medborgarskap.', en: 'Share of all new prisoners during the year without Swedish citizenship.' }, PCT),
    col('nyintagna_man_utan_sv_medb_pct', 'new_men_no_swedish_citizenship_pct', 'number', { sv: 'Samma andel bland nyintagna män.', en: 'The same share among new prisoners who are men.' }, PCT),
    col('nyintagna_kvinnor_utan_sv_medb_pct', 'new_women_no_swedish_citizenship_pct', 'number', { sv: 'Samma andel bland nyintagna kvinnor.', en: 'The same share among new prisoners who are women.' }, PCT),
    col('intagna_1okt_utan_sv_medb_pct', 'prisoners_1oct_no_swedish_citizenship_pct', 'number', { sv: 'Andel av dem som satt i fängelse den 1 oktober som saknade svenskt medborgarskap.', en: 'Share of those in prison on 1 October without Swedish citizenship.' }, PCT),
    col('befolkning_utlandska_medborgare_pct', 'population_foreign_citizens_pct', 'number', { sv: 'Utländska medborgare som andel av befolkningen den 31 december, beräknat från SCB:s antal.', en: 'Foreign citizens as a share of the population on 31 December, calculated from SCB’s counts.' }, PCT),
    col('kalla_bra', 'source_bra', 'string', { sv: 'Brås rapporter och tabeller som årets värden kommer från.', en: 'The Brå reports and tables the year’s values come from.' }),
    col('nyintagna_antal', 'new_all_count', 'integer', { sv: 'Antal nyintagna under året enligt Brå. Tomt om Brå inte anger antalet.', en: 'Number of new prisoners during the year according to Brå. Empty if Brå gives no count.' }, COUNT),
    col('nyintagna_man_antal', 'new_men_count', 'integer', { sv: 'Antal nyintagna män.', en: 'Number of new prisoners who are men.' }, COUNT),
    col('nyintagna_kvinnor_antal', 'new_women_count', 'integer', { sv: 'Antal nyintagna kvinnor.', en: 'Number of new prisoners who are women.' }, COUNT),
    col('intagna_1okt_antal', 'prisoners_1oct_count', 'integer', { sv: 'Antal intagna den 1 oktober.', en: 'Number of prisoners on 1 October.' }, COUNT),
    col('folkmangd', 'population', 'integer', { sv: 'Folkmängd den 31 december (SCB).', en: 'Population on 31 December (SCB).' }, COUNT),
    col('utlandska_medborgare', 'foreign_citizens', 'integer', { sv: 'Antal utländska medborgare i befolkningen den 31 december (SCB).', en: 'Number of foreign citizens in the population on 31 December (SCB).' }, COUNT),
  ],
  // 2.2 Dömda för våldtäkt (Khoshnood et al. 2021 and 2026, SCB)
  kap4: [
    col('tabell', 'table', 'string', { sv: 'Jämförelse: bakgrund (dömda 2000–2015 och befolkningen), kontrollgrupp (dömda 2000–2020 och en kontrollgrupp med samma kön och födelseår) eller fodelseregion_utrikesfodda (utrikesfödda dömda efter födelseregion).', en: 'Comparison: background (convicted 2000–2015 and the population), control group (convicted 2000–2020 and a control group of the same sex and birth year) or birth region of those born abroad.' }),
    col('grupp', 'group', 'string', { sv: 'Bakgrundsgrupp eller födelseregion.', en: 'Background group or birth region.' }),
    col('period', 'period', 'string', { sv: 'År då domarna föll.', en: 'Years of the convictions.' }),
    col('antal', 'number', 'integer', { sv: 'Antal dömda i gruppen.', en: 'Number of convicted people in the group.' }, COUNT),
    col('andel_pct', 'share_pct', 'number', { sv: 'Gruppens andel av de dömda.', en: 'The group’s share of the convicted.' }, PCT),
    col('andel_kontrollgrupp_pct', 'share_control_group_pct', 'number', { sv: 'Gruppens andel av kontrollgruppen.', en: 'The group’s share of the control group.' }, PCT),
    col('andel_befolkning_snitt_pct', 'share_population_average_pct', 'number', { sv: 'Gruppens andel av hela befolkningen, snitt av 2000, 2005, 2010 och 2015 (SCB).', en: 'The group’s share of the whole population, average of 2000, 2005, 2010 and 2015 (SCB).' }, PCT),
  ],
  // 1.3 Brås äldre studier (Brå 2005:17)
  kap5: [
    col('diagram', 'chart', 'string', { sv: 'Uppgift: overrisk, andel (andel misstänkta i gruppen), period (överrisk 1985–89 och 1997–2001), region (överrepresentation efter födelseregion), andel_misst och befolkning (andel av misstänkta och av befolkningen), region_misst och region_bef (samma efter födelseregion) eller brott (andel misstänkta per brottstyp).', en: 'Measure: overrisk (excess risk), andel (share suspected in the group), period (excess risk 1985–89 and 1997–2001), region (overrepresentation by birth region), andel_misst and befolkning (share of suspects and of the population), region_misst and region_bef (the same by birth region) or brott (share suspected by crime type).' }),
    col('grupp', 'group', 'string', { sv: 'Bakgrundsgrupp, födelseregion eller brottstyp.', en: 'Background group, birth region or crime type.' }),
    col('serie', 'series', 'string', { sv: 'Serie: ostand (ojusterat), stand (standardiserat för kön, ålder, utbildning och förvärvsinkomst), p8589 (1985–89), p9701 (1997–2001), overrep (överrepresentation), misst (misstänkta), bef (befolkningen), sv2 (två inrikesfödda föräldrar), barn (inrikesfödda med en eller två utrikesfödda föräldrar), utr (utrikesfödda).', en: 'Series: ostand (unadjusted), stand (standardised for sex, age, education and income), p8589 (1985–89), p9701 (1997–2001), overrep (overrepresentation), misst (suspects), bef (population), sv2 (two Swedish-born parents), barn (born in Sweden with one or two foreign-born parents), utr (born abroad).' }),
    col('varde', 'value', 'number', { sv: 'Värdet. Överrisk och överrepresentation som kvot, andelar i procent.', en: 'The value. Excess risk and overrepresentation as a ratio, shares in percent.' }),
    col('bra_tabell', 'bra_table', 'string', { sv: 'Tabellen i Brå 2005:17 som värdet kommer från.', en: 'The table in Brå 2005:17 the value comes from.' }),
  ],
  // 4.1 Utsatta för brott (Brå NTU Kortanalys 2/2024)
  kap6: [
    col('vy', 'view', 'string', { sv: 'Indelning: bakgrund (svaren 2017–2023 sammanslagna), per_ar eller varldsdel.', en: 'Breakdown: background (answers 2017–2023 pooled), by year or world region.' }),
    col('brottstyp', 'crime_type', 'string', { sv: 'Brottstyp i Nationella trygghetsundersökningen.', en: 'Crime type in the Swedish Crime Survey.' }),
    col('kon', 'sex', 'string', { sv: 'Kön: Samtliga, Män eller Kvinnor.', en: 'Sex: all, men or women.' }),
    col('bakgrund', 'background', 'string', { sv: 'Svensk eller utländsk bakgrund enligt Brå (utländsk = själv eller minst en förälder född utomlands), eller världsdel.', en: 'Swedish or foreign background as Brå defines it (foreign = the person or at least one parent born abroad), or world region.' }),
    col('ar', 'years', 'string', { sv: 'År då brottet skedde, eller perioden för sammanslagna svar.', en: 'Year the crime took place, or the period for pooled answers.' }),
    col('andel_utsatta_pct', 'share_victims_pct', 'number', { sv: 'Andel som uppgav att de utsatts för brottet under året, personer 16–84 år.', en: 'Share who said they were victims of the crime during the year, people aged 16–84.' }, PCT),
    col('ki95_lag', 'ci95_low', 'number', { sv: 'Nedre gräns för 95 procents konfidensintervall.', en: 'Lower bound of the 95% confidence interval.' }, PCT),
    col('ki95_hog', 'ci95_high', 'number', { sv: 'Övre gräns för 95 procents konfidensintervall.', en: 'Upper bound of the 95% confidence interval.' }, PCT),
    col('anmarkning', 'remark', 'string', { sv: 'Brås anmärkning när värde saknas: för få svar eller inga fall.', en: 'Brå’s remark when a value is missing: too few answers or no cases.' }),
  ],
  // 3.2 Utvisning (Brå 2026:15)
  kap7: [
    col('indelning', 'breakdown', 'string', { sv: 'Indelning: totalt, kön, ålder, folkbokföring, medborgarskap efter världsdel eller område, eller huvudbrott i domen.', en: 'Breakdown: total, sex, age, registration, citizenship by world region or sub-region, or main offence in the sentence.' }),
    col('grupp', 'group', 'string', { sv: 'Gruppen raden gäller.', en: 'The group the row is about.' }),
    col('tillhor', 'part_of', 'string', { sv: 'Världsdelen som området hör till. Bara för medborgarskap efter område.', en: 'The world region the sub-region belongs to. Only for citizenship by sub-region.' }),
    col('utvisade_pct', 'deported_pct', 'number', { sv: 'Andel som hade utvisats i slutet av 2024, av dem med utvisningsbeslut som lämnade anstalt 2013–2023.', en: 'Share deported by the end of 2024, of those with a deportation order who left prison in 2013–2023.' }, PCT),
    col('utvisade_inom_1_ar_pct', 'deported_within_1_year_pct', 'number', { sv: 'Andel som utvisades inom ett år efter att de lämnat anstalten.', en: 'Share deported within a year of leaving prison.' }, PCT),
    col('lagforda_nya_brott_pct', 'convicted_new_crimes_pct', 'number', { sv: 'Andel som lagfördes för nya brott efter att de lämnat anstalten, till och med 2024.', en: 'Share convicted of new crimes after leaving prison, up to the end of 2024.' }, PCT),
    col('lagforda_brott_inom_1_ar_pct', 'convicted_crime_within_1_year_pct', 'number', { sv: 'Andel som lagfördes för brott begångna inom ett år efter att de lämnat anstalten.', en: 'Share convicted of crimes committed within a year of leaving prison.' }, PCT),
    col('antal', 'count', 'integer', { sv: 'Antal personer i gruppen.', en: 'Number of people in the group.' }, COUNT),
  ],
  // 4.2 Dödligt våld (Brå 2025:5)
  kap8: [
    col('del', 'part', 'string', { sv: 'Del av rapporten.', en: 'Part of the report.' }),
    col('matt', 'measure', 'string', { sv: 'Gruppen andelarna gäller, till exempel utländsk bakgrund eller utrikes födda.', en: 'The group the shares are about, for example foreign background or born abroad.' }),
    col('offer_pct', 'victims_pct', 'number', { sv: 'Andel av offren för dödligt våld 2005–2021.', en: 'Share of homicide victims in 2005–2021.' }, PCT),
    col('garningspersoner_pct', 'perpetrators_pct', 'number', { sv: 'Andel av de identifierade gärningspersonerna 2005–2021.', en: 'Share of identified perpetrators in 2005–2021.' }, PCT),
    col('befolkningen_pct', 'population_pct', 'number', { sv: 'Andel av befolkningen, snitt 2005–2021.', en: 'Share of the population, average 2005–2021.' }, PCT),
    col('kalla', 'source', 'string', { sv: 'Sida eller figur i Brå 2025:5.', en: 'Page or figure in Brå 2025:5.' }),
  ],
  // 2.1 Lagförda före 25 års ålder, Bäckman et al. 2021
  kap9: [
    col('urval', 'sample', 'string', { sv: 'Urval: alla, eller de som växte upp i familjer med lägst inkomster.', en: 'Sample: everyone, or those who grew up in the lowest-income families.' }),
    col('kon', 'sex', 'string', { sv: 'Kön.', en: 'Sex.' }),
    col('fodda', 'born', 'string', { sv: 'Födelseårsgrupp.', en: 'Birth-year group.' }),
    col('matt', 'measure', 'string', { sv: 'Minst en, två eller fyra lagföringar före 25 års ålder.', en: 'At least one, two or four convictions before age 25.' }),
    col('bakgrund', 'background', 'string', { sv: 'Bakgrund: utrikes födda, inrikes födda med två utrikes födda föräldrar, eller inrikes födda med minst en inrikes född förälder (jämförelsegruppen).', en: 'Background: born abroad, born in Sweden with two foreign-born parents, or born in Sweden with at least one Swedish-born parent (the comparison group).' }),
    col('andel_pct', 'share_pct', 'number', { sv: 'Andel av gruppen som lagförts före 25 års ålder.', en: 'Share of the group convicted before age 25.' }, PCT),
    col('relativ_risk', 'relative_risk', 'number', { sv: 'Andelen jämfört med jämförelsegruppen (1 = lika vanligt).', en: 'The share compared with the comparison group (1 = equally common).' }, TIMES),
    col('antal_i_gruppen', 'group_size', 'integer', { sv: 'Antal personer i gruppen.', en: 'Number of people in the group.' }, COUNT),
  ],
  // 2.1 Lagförda efter födelseår, Brå 2025:21
  kap10: [
    col('matt', 'measure', 'string', { sv: 'Lagförd före 25 eller före 20 års ålder.', en: 'Convicted before age 25 or before age 20.' }),
    col('fodelsear', 'birth_year', 'integer', { sv: 'Födelseår.', en: 'Birth year.' }),
    col('kon', 'sex', 'string', { sv: 'Kön: samtliga, man eller kvinnor.', en: 'Sex: everyone, men or women.' }),
    col('bakgrund', 'background', 'string', { sv: 'Födelsebakgrund (från födelseår 1984), eller alla.', en: 'Birth background (from birth year 1984), or everyone.' }),
    col('andel_pct', 'share_pct', 'number', { sv: 'Andel av alla folkbokförda födda det året som lagförts minst en gång före den åldern.', en: 'Share of everyone registered in Sweden and born that year who was convicted at least once before that age.' }, PCT),
  ],
  // 5.1 Lagförda i Danmark (Danmarks Statistik, STRFNA10 and FOLK1E)
  kap11: [
    col('ar', 'year', 'integer', { sv: 'År. För befolkningen: den 1 januari det året.', en: 'Year. For the population: 1 January of that year.' }),
    ...(['straffelov', 'vold'] as DkOffence[]).flatMap((o) =>
      DK_ORDER.map((g) =>
        col(`${DK_OFFENCE_CSV[o].sv}_${DK_CSV[g].sv}_per1000`, `${DK_OFFENCE_CSV[o].en}_${DK_CSV[g].en}_per1000`, 'number', {
          sv: `Lagförda för ${OFFENCE_NAME[o].sv} under året per 1 000 invånare 15–79 år, ${DK_STYLE[g].label.sv.toLowerCase().replace('dansk', 'med dansk')}. Uträknat: antal delat med medelvärdet av befolkningen den 1 januari samma år och året efter.`,
          en: `People convicted of ${OFFENCE_NAME[o].en} during the year per 1,000 residents aged 15–79, ${DK_STYLE[g].label.en.replace(/^(Immigrants|Descendants|Whole)/, (m) => m.toLowerCase())}. Calculated: the number divided by the mean of the population on 1 January of the year and of the next year.`,
        }, PER1000),
      ),
    ),
    ...(['straffelov', 'vold'] as DkOffence[]).flatMap((o) =>
      DK_ORDER.map((g) =>
        col(`${DK_OFFENCE_CSV[o].sv}_${DK_CSV[g].sv}_antal`, `${DK_OFFENCE_CSV[o].en}_${DK_CSV[g].en}_count`, 'integer', {
          sv: `Antal personer 15–79 år som lagförts för ${OFFENCE_NAME[o].sv} under året (STRFNA10).`,
          en: `Number of people aged 15–79 convicted of ${OFFENCE_NAME[o].en} during the year (STRFNA10).`,
        }, COUNT),
      ),
    ),
    ...DK_ORDER.map((g) =>
      col(`befolkning_1jan_${DK_CSV[g].sv}`, `population_1jan_${DK_CSV[g].en}`, 'integer', {
        sv: `Antal invånare 15–79 år den 1 januari (FOLK1E), ${DK_STYLE[g].label.sv.toLowerCase()}.`,
        en: `Number of residents aged 15–79 on 1 January (FOLK1E), ${DK_STYLE[g].label.en.toLowerCase().replace('danish', 'Danish').replace('non-western', 'non-Western').replace('western', 'Western')}.`,
      }, COUNT),
    ),
  ],
  // 5.2 Kriminalitetsindex (Danmarks Statistik, Indvandrere i Danmark 2025, tables 6.5, 6.7 and 6.9)
  kap12: [
    col('grupp', 'group', 'string', {
      sv: 'Grupp efter ursprung, enligt Danmarks Statistik: barn till invandrare (efterkommere) och invandrare från icke-västliga och västliga länder, och dansk ursprung.',
      en: 'Group by origin, according to Danmarks Statistik: descendants and immigrants from non-Western and Western countries, and Danish origin.',
    }),
    ...kap12DictionaryColumns().map((c) => col(c.name.sv, c.name.en, 'integer', c.description, { sv: 'index (genomsnitt = 100)', en: 'index (average = 100)' })),
  ],
};

/** The columns of one table page's CSV file. */
export function dataDictionary(chapterId: string): Column[] {
  const d = DICTIONARY[chapterId];
  if (!d) throw new Error(`No data dictionary for ${chapterId}`);
  return d;
}

/** One column in one language, for the table pages and Markdown copies. */
export function columnIn(c: Column, lang: Lang): { name: string; type: FieldType; unit: string; description: string } {
  return { name: c.name[lang], type: c.type, unit: c.unit?.[lang] ?? '', description: c.description[lang] };
}
