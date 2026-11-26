#!/usr/bin/env python3
"""Download the Finnish figures for part 6 from Statistics Finland's open PxWeb API.

Writes data/tk_misstankta_ursprung.csv: people suspected of solved criminal code offences
(table 13zk), counted once a year by their most aggravated offence, by origin, sex and age,
with Statistics Finland's rate per 10,000 residents in the same group.

Run from the repository root: python3 scripts/tk_fetch.py
Then run `npm run datadates` and `npm run sifferkontroll`, as after any change in data/.
The API needs no key. Docs: https://pxdata.stat.fi/api1.html
"""
import csv
import io
import json
import urllib.request

TABLE = 'https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/rpk/13zk.px'
SOURCE = 'Statistikcentralen, StatFin 13zk'

# Statistics Finland code -> code in our file.
ORIGINS = {
    'SSS': 'alla',
    '1': 'fi',
    '11': 'fi_fodd_fi',
    '12': 'fi_fodd_utl',
    '2': 'utl',
    '22': 'utl_fodd_utl',
    '21': 'utl_fodd_fi',
    'X': 'okand',
}
SEXES = {'SSS': 'alla', '1': 'man', '2': 'kvinnor'}
AGES = ['SSS', '0-14', '15-17', '18-20', '21-24', '25-29', '30-39', '40-49', '50-59', '60-69', '70-']
PENAL_CODE = '101T504X406'  # "1 Offences against penal code"
COUNT = 'ep_lkm_tork'  # suspects by the most aggravated offence of the year (each person once a year)
RATE = 'ep_lkm_tork_vaesto'  # the same per 10,000 population


def main():
    with urllib.request.urlopen(TABLE, timeout=60) as res:
        meta = json.load(res)
    years = next(v for v in meta['variables'] if v['code'] == 'timeperiod_y')['values']
    body = {
        'query': [
            {'code': 'timeperiod_y', 'selection': {'filter': 'item', 'values': years}},
            {'code': 'sukupuoli_9_20180101', 'selection': {'filter': 'item', 'values': list(SEXES)}},
            {'code': 'ikaryhma_10_20180101', 'selection': {'filter': 'item', 'values': AGES}},
            {'code': 'rikokset_74_20211209', 'selection': {'filter': 'item', 'values': [PENAL_CODE]}},
            {'code': 'syntypera_101_20180101', 'selection': {'filter': 'item', 'values': list(ORIGINS)}},
            {'code': 'contentscode', 'selection': {'filter': 'item', 'values': [COUNT, RATE]}},
        ],
        'response': {'format': 'json-stat2'},
    }
    req = urllib.request.Request(TABLE, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as res:
        d = json.load(res)

    ids, sizes = d['id'], d['size']
    codes = [list(d['dimension'][i]['category']['index']) for i in ids]
    status = d.get('status') or {}
    cells = {}
    for n, value in enumerate(d['value']):
        key, rest = [], n
        for size, cs in zip(reversed(sizes), reversed(codes)):
            key.append(cs[rest % size])
            rest //= size
        key.reverse()
        if value is None or str(n) in status:
            raise SystemExit(f'Missing or flagged value for {dict(zip(ids, key))}: {value!r} {status.get(str(n))!r}')
        cells[tuple(key)] = value

    def get(year, sex, age, origin, content):
        k = {'timeperiod_y': year, 'sukupuoli_9_20180101': sex, 'ikaryhma_10_20180101': age,
             'rikokset_74_20211209': PENAL_CODE, 'syntypera_101_20180101': origin, 'contentscode': content}
        return cells[tuple(k[i] for i in ids)]

    rows = 0
    with open('data/tk_misstankta_ursprung.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f, lineterminator='\n')
        w.writerow(['year', 'sex', 'age', 'origin', 'persons', 'per10000', 'source'])
        for year in years:
            for sex in SEXES:
                for age in AGES:
                    for origin in ORIGINS:
                        persons = int(get(year, sex, age, origin, COUNT))
                        rate = get(year, sex, age, origin, RATE)
                        # People of unknown origin have no population to divide by; the table shows 0 there.
                        rate_cell = '' if origin == 'X' else f'{rate:.1f}'
                        w.writerow([year, SEXES[sex], 'alla' if age == 'SSS' else age, ORIGINS[origin], persons, rate_cell, SOURCE])
                        rows += 1
    print(f'Wrote {rows} rows ({years[0]}-{years[-1]}).')


if __name__ == '__main__':
    main()
