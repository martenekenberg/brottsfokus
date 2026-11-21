#!/usr/bin/env python3
"""Download the Danish figures for part 5 from Statistics Denmark's open Statbank API.

Writes two files in data/:
  dst_lagforda_herkomst.csv   people found guilty (STRFNA10), by origin group and offence
  dst_befolkning_herkomst.csv population aged 15-79 on 1 January (FOLK1E), by origin group

Run from the repository root: python3 scripts/dst_fetch.py
Then run `npm run datadates` and `npm run sifferkontroll`, as after any change in data/.
The API needs no key. Docs: https://www.dst.dk/en/Statistik/hjaelp-til-statistikbanken/api
"""
import csv
import io
import json
import urllib.request

API = 'https://api.statbank.dk/v1/data'
FIRST_YEAR = 2008  # FOLK1E, with the Western / non-Western split, starts in 2008.

# Origin groups: Statbank code -> code in our files.
GROUPS = {
    'TOT': 'alla',
    '1': 'dansk',
    '24': 'indv_vest',
    '25': 'indv_ikkevest',
    '34': 'eftk_vest',
    '35': 'eftk_ikkevest',
}
# Offences in STRFNA10: criminal code total, and crimes of violence.
OFFENCES = {'11101485': 'straffelov', '12101292': 'vold'}


def query(body):
    req = urllib.request.Request(API, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as res:
        text = res.read().decode('utf-8-sig')
    return list(csv.DictReader(io.StringIO(text), delimiter=';'))


def periods(table, var='Tid'):
    req = urllib.request.Request(
        'https://api.statbank.dk/v1/tableinfo',
        data=json.dumps({'table': table, 'lang': 'da', 'format': 'JSON'}).encode(),
        headers={'Content-Type': 'application/json'},
    )
    with urllib.request.urlopen(req, timeout=60) as res:
        info = json.load(res)
    return [v['id'] for v in next(x for x in info['variables'] if x['id'] == var)['values']]


def main():
    years = [p for p in periods('STRFNA10') if int(p) >= FIRST_YEAR]
    guilty = query({
        'table': 'STRFNA10', 'format': 'CSV', 'lang': 'da', 'valuePresentation': 'Code',
        'variables': [
            {'code': 'OVERTRÆD', 'values': list(OFFENCES)},
            {'code': 'HERKOMST', 'values': list(GROUPS)},
            {'code': 'Tid', 'values': years},
        ],
    })
    with open('data/dst_lagforda_herkomst.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f, lineterminator='\n')
        w.writerow(['year', 'offence', 'group', 'persons', 'source'])
        for r in sorted(guilty, key=lambda r: (r['TID'], list(OFFENCES).index(r['OVERTRÆD']), list(GROUPS).index(r['HERKOMST']))):
            w.writerow([r['TID'], OFFENCES[r['OVERTRÆD']], GROUPS[r['HERKOMST']], r['INDHOLD'], 'Danmarks Statistik, STRFNA10'])

    # Population on 1 January of each year, and of the year after the last one, so each year has a start and an end.
    quarters = [f'{y}K1' for y in range(FIRST_YEAR, int(years[-1]) + 2)]
    available = set(periods('FOLK1E'))
    missing = [q for q in quarters if q not in available]
    if missing:
        raise SystemExit(f'FOLK1E has no figures yet for {", ".join(missing)}')
    pop = query({
        'table': 'FOLK1E', 'format': 'CSV', 'lang': 'da', 'valuePresentation': 'Code',
        'variables': [
            {'code': 'OMRÅDE', 'values': ['000']},
            {'code': 'KØN', 'values': ['TOT']},
            {'code': 'ALDER', 'values': [str(a) for a in range(15, 80)]},
            {'code': 'HERKOMST', 'values': list(GROUPS)},
            {'code': 'Tid', 'values': quarters},
        ],
    })
    totals = {}
    for r in pop:
        key = (r['TID'][:4], r['HERKOMST'])
        totals[key] = totals.get(key, 0) + int(r['INDHOLD'])
    with open('data/dst_befolkning_herkomst.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f, lineterminator='\n')
        w.writerow(['year', 'group', 'population_15_79', 'source'])
        for (year, code), n in sorted(totals.items(), key=lambda kv: (kv[0][0], list(GROUPS).index(kv[0][1]))):
            w.writerow([year, GROUPS[code], n, 'Danmarks Statistik, FOLK1E, 1 januari'])
    print(f'Wrote {len(guilty)} rows of guilty persons ({years[0]}-{years[-1]}) and {len(totals)} population rows.')


if __name__ == '__main__':
    main()
