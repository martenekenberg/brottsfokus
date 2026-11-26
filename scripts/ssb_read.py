#!/usr/bin/env python3
"""Read SSB's table 3 on people charged in Norway by immigrant background (yearly average 2021-2023)
into data/ssb_siktede.csv, for part 7.

The table is an Excel file attached to SSB's article "Siktelser og siktede personer etter
innvandringsbakgrunn" (not in Statbank), kept in docs/kallor/ssb_siktede_2021_2023_tabell3.xlsx:
https://www.ssb.no/sosiale-forhold-og-kriminalitet/kriminalitet-og-rettsvesen/statistikk/etterforskede-lovbrudd/artikler/siktelser-og-siktede-personer-etter-innvandringsbakgrunn

Sheet "Tab3 Siktede" has the yearly average number of people charged; sheet "Tab 3 siktede per 1 000"
has the same per 1,000 residents and SSB's over- or under-representation against the rest of the
population. Both have the same rows, and a block for men aged 15-24 from column N.

Run from the repository root: python3 scripts/ssb_read.py
Then run `npm run datadates` and `npm run sifferkontroll`, as after any change in data/.
Needs openpyxl (pip install openpyxl).
"""
import csv
import openpyxl

SOURCE = 'docs/kallor/ssb_siktede_2021_2023_tabell3.xlsx'
OUT = 'data/ssb_siktede.csv'
PERIOD = '2021-2023'

# Columns (0-based) in both sheets: B = all offences, H = SSB's ratio against the rest of the population,
# N = men aged 15-24, T = their ratio.
ALL, RATIO, MEN, MEN_RATIO = 1, 7, 13, 19

# The four rows at the top: code for our file.
TOP = {
    'ALLE BEFOLKNINGSGRUPPER': 'alle',
    'IKKE-BOSATT': 'ikke_bosatt',
    'ØVRIGE BOSATTE': 'ovrige',
    'INNVANDRERE, I ALT': 'innvandrere',
    'NORSKFØDTE MED INNVANDRERFORELDRE, I ALT': 'norskfodte',
}
# SSB's two country groups and four world regions.
REGIONS = {
    'Norden uten Norge, EU/EFTA, Storbritannia, Nord-Amerika og Oceania': 'landgruppe1',
    'Europa utenom EU/EFTA og Storbritannia,Afrika, Asia og Latin-Amerika': 'landgruppe2',
    '¬ Europa utenom EU/EFTA/Storbritannia': 'europa_ovrig',
    '¬ Afrika': 'afrika',
    '¬ Asia': 'asia',
    '¬ Latin-Amerika og Karibia': 'latinamerika',
}


def clean(label):
    return ' '.join(str(label).split())


def num(v, decimals):
    return '' if v is None else f'{float(v):.{decimals}f}'


def main():
    wb = openpyxl.load_workbook(SOURCE, data_only=True, read_only=True)
    counts = list(wb['Tab3 Siktede'].iter_rows(values_only=True))
    rates = list(wb['Tab 3 siktede per 1 000'].iter_rows(values_only=True))
    if len(counts) != len(rates):
        raise SystemExit('The two sheets have different numbers of rows')

    rows = []
    category = None  # innvandrere or norskfodte, for the rows by country background
    level = None
    # The first five rows are the title and column headings, which differ between the sheets.
    for c, r in zip(counts[5:], rates[5:]):
        label = c[0]
        if label is None or clean(label) != clean(r[0] or ''):
            if label is not None:
                raise SystemExit(f'Rows differ between the sheets: {label!r} / {r[0]!r}')
            continue
        name = clean(label)
        if name.startswith('Info om tabellen'):
            break
        if name == 'Innvandrere etter landbakgrunn':
            category = 'innvandrere'
            continue
        if name.startswith('Norksfødte med innvandrerforeldre') or name.startswith('Norskfødte med innvandrerforeldre'):
            category = 'norskfodte'
            continue
        if name == 'Verdensdeler':
            level = 'region'
            continue
        if name == 'Enkeltland':
            level = 'land'
            continue
        if name in ('Innvandringsbakgrunn',):
            continue
        if name in TOP:
            row = {'level': 'bakgrunn', 'category': TOP[name], 'group': TOP[name]}
        elif category and level == 'region':
            if name not in REGIONS:
                raise SystemExit(f'Unknown region {name!r}')
            row = {'level': 'region', 'category': category, 'group': REGIONS[name]}
        elif category and level == 'land':
            row = {'level': 'land', 'category': category, 'group': name}
        else:
            continue
        row.update(
            label_no=name,
            persons=num(c[ALL], 2),
            per1000=num(r[ALL], 4),
            ratio=num(r[RATIO], 4),
            men15_24_persons=num(c[MEN], 2),
            men15_24_per1000=num(r[MEN], 4),
            men15_24_ratio=num(r[MEN_RATIO], 4),
        )
        rows.append(row)

    with open(OUT, 'w', newline='', encoding='utf-8') as f:
        cols = ['period', 'level', 'category', 'group', 'label_no', 'persons', 'per1000', 'ratio',
                'men15_24_persons', 'men15_24_per1000', 'men15_24_ratio', 'source']
        w = csv.DictWriter(f, fieldnames=cols, lineterminator='\n')
        w.writeheader()
        for row in rows:
            w.writerow({'period': PERIOD, 'source': 'SSB, Siktede personer etter innvandringsbakgrunn, tabell 3', **row})
    print(f'Wrote {len(rows)} rows to {OUT}')


if __name__ == '__main__':
    main()
