// "Frågor och svar": common questions about the terms and the sources, written for the page and
// its FAQPage markup. The questions with numbers are the chapters' short answers (src/lib/shortAnswers.ts).
import { chapter, chapterHref } from './chapters';
import { tr, type BaseLang as Lang } from './i18n';
import { methodPath } from './parts';
import { shortAnswers, type Segment } from './shortAnswers';

export interface FaqItem {
  id: string;
  question: string;
  answer: Segment[];
}

export function faqTerms(lang: Lang): FaqItem[] {
  const L = (sv: string, en: string) => tr(lang, sv, en);
  const num = (id: string) => chapter(id).num;
  const ch = (id: string): Segment => ({ text: num(id), href: chapterHref(id, lang) });
  const method = (anchor: string, text: string): Segment => ({ text, href: `${methodPath[lang]}#${anchor}` });

  // The overview answer summarises the 1.2 short answers. Stop the build if they no longer say the
  // groups were suspected more often (their own checks cover the adjusted figures).
  const ids = shortAnswers(lang).map((a) => a.id);
  for (const id of ['kap2-svar-invandrare', 'kap2-svar-barn', 'kap2-svar-justerat']) {
    if (!ids.includes(id)) throw new Error(`Frågor och svar: the overview answer needs the short answer ${id}`);
  }

  return [
    {
      id: 'oversikt',
      question: L('Vad visar statistiken om invandring och brottslighet?', 'What do the statistics show about immigration and crime in Sweden?'),
      answer: [
        L(
          'Utrikesfödda och inrikesfödda med två utrikesfödda föräldrar registreras oftare som misstänkta för brott än inrikesfödda med två inrikesfödda föräldrar. När Brå räknar som om grupperna hade samma ålder, kön, inkomst och utbildning blir skillnaderna mindre, men de finns kvar. Svaren längre ner ger siffrorna för misstänkta, dömda, intagna i fängelse och brottsoffer, med källa och begränsningar för varje. Se särskilt kapitel ',
          'People born abroad, and people born in Sweden with two foreign-born parents, are more often registered as suspects of crime than people born in Sweden with two Swedish-born parents. When Brå calculates as if the groups had the same age, sex, income and education, the differences become smaller, but they remain. The answers further down give the figures for suspects, convicted people, prisoners and victims of crime, with the source and limitations of each. See especially chapter ',
        ),
        ch('kap2'),
        '.',
      ],
    },
    {
      id: 'invandrare',
      question: L('Vad menas med invandrare på Brottsfokus?', 'What does Brottsfokus mean by immigrants?'),
      answer: [
        L(
          'Samma sak som utrikesfödda: personer som är födda i ett annat land och folkbokförda i Sverige. Ordet har ingen officiell statistisk definition, och Brå och SCB skriver utrikesfödda. Barn till invandrare, ibland kallade andra generationens invandrare, är födda i Sverige och räknas inte som invandrare här. Sidan skriver inrikesfödda med en eller två utrikesfödda föräldrar. Se ',
          'The same as people born abroad: people who were born in another country and are registered as living in Sweden. The word has no official statistical definition, and Brå and SCB write “utrikesfödda” (born abroad). Children of immigrants, sometimes called second-generation immigrants, were born in Sweden and are not counted as immigrants here. The site writes born in Sweden with one or two foreign-born parents. See ',
        ),
        method('begrepp-invandrare', L('Metod och begrepp', 'Method and terms')),
        '.',
      ],
    },
    {
      id: 'misstankt-domd',
      question: L('Vad är skillnaden mellan misstänkt och dömd?', 'What is the difference between suspected and convicted?'),
      answer: [
        L(
          'Misstänkt betyder att polis eller åklagare bedömt att det finns skäl att misstänka personen för ett brott. Det är inte samma sak som att personen begått brottet. Lagförd betyder att personen dömts i domstol eller fått ett strafföreläggande eller en åtalsunderlåtelse. Kapitel ',
          'Suspected means that the police or a prosecutor judged there were grounds to suspect the person of a crime. It does not mean the person committed it. Convicted (lagförd) means the person was found guilty in court, or accepted a summary penalty or a waiver of prosecution. Chapters ',
        ),
        ch('kap1'),
        L(' till ', ' to '),
        ch('kap5'),
        L(' bygger på misstankar, kapitel ', ' are based on suspicions, chapters '),
        ch('kap9'),
        L(' och ', ' and '),
        ch('kap4'),
        L(' på lagföringar och domar.', ' on convictions.'),
      ],
    },
    {
      id: 'overrisk',
      question: L('Vad är en överrisk?', 'What is an excess risk?'),
      answer: [
        L(
          'Hur många gånger vanligare något är i en grupp än i en jämförelsegrupp, oftast inrikesfödda med två inrikesfödda föräldrar. En överrisk på 2,5 betyder två och en halv gånger så vanligt, och 1 betyder lika vanligt. Överrisken säger inte hur stor andel av gruppen det gäller, så sidan visar andelen också där källan anger den.',
          'How many times more common something is in a group than in a comparison group, usually people born in Sweden with two Swedish-born parents. An excess risk of 2.5 means two and a half times as common, and 1 means equally common. The excess risk does not say how large a share of the group is affected, so the site also shows the share where the source gives it.',
        ),
      ],
    },
    {
      id: 'utlandsk-bakgrund',
      question: L('Vad betyder utländsk bakgrund?', 'What does a foreign background mean?'),
      answer: [
        L('Det beror på källan. I kapitel ', 'It depends on the source. In chapter '),
        ch('kap8'),
        L(
          ' betyder det utrikesfödd eller inrikesfödd med två utrikesfödda föräldrar. I kapitel ',
          ' it means born abroad, or born in Sweden with two foreign-born parents. In chapter ',
        ),
        ch('kap6'),
        L(' räknar Brå även inrikesfödda med en utrikesfödd förälder. ', ' Brå also counts people born in Sweden with one foreign-born parent. '),
        method('indelning', L('Tabellen på Metod', 'The table on the Method page')),
        L(' visar hur varje källa delar in bakgrund.', ' shows how each source groups background.'),
      ],
    },
    {
      id: 'skillnader',
      question: L('Varför skiljer sig siffrorna mellan kapitlen?', 'Why do the figures differ between chapters?'),
      answer: [
        L(
          `Källorna mäter olika saker: misstankar, lagföringar, domar, intagna i fängelse och svar i en enkät. De gäller olika år och delar in bakgrund på olika sätt. Kapitel ${num('kap1')} räknar till exempel dem som misstänktes under ett år, och kapitel ${num('kap2')} alla som misstänktes någon gång under fyra år, så talen i ${num('kap2')} är högre. Siffror från olika kapitel går därför sällan att jämföra direkt. Varje kapitel har en ruta, Läs så här, med det som gäller just där.`,
          `The sources measure different things: suspicions, convictions, sentences, prisoners and survey answers. They cover different years and group background in different ways. Chapter ${num('kap1')}, for example, counts those suspected during one year, and chapter ${num('kap2')} everyone suspected at any point in four years, so the figures in ${num('kap2')} are higher. Figures from different chapters can therefore rarely be compared directly. Every chapter has a box, How to read this, with what applies there.`,
        ),
      ],
    },
    {
      id: 'uppdatering',
      question: L('Hur ofta uppdateras uppgifterna?', 'How often are the figures updated?'),
      answer: [
        L(
          'Det beror på källan. Brås statistik om kriminalvård kommer varje år. De andra kapitlen bygger på enskilda rapporter och studier. Varje kapitel visar under Om uppgifterna vilka år siffrorna avser och när studien publicerades.',
          'It depends on the source. Brå’s prison and probation statistics come out every year. The other chapters are based on single reports and studies. Under About the figures, every chapter shows the years the figures cover and when the study was published.',
        ),
      ],
    },
  ];
}
