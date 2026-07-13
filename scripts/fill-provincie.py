import json
import time
import urllib.request
import urllib.parse

SRC = r'C:\Users\jarmo\Desktop\Hotelbeoordeling app\scripts\hotels.json'

with open(SRC, encoding='utf-8') as f:
    records = json.load(f)


def geocode(stad, land):
    q = urllib.parse.quote(f'{stad}, {land}')
    url = f'https://nominatim.openstreetmap.org/search?q={q}&format=jsonv2&addressdetails=1&limit=1'
    req = urllib.request.Request(url, headers={'User-Agent': 'hotelbeoordeling-app-import/1.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    if not data:
        return None
    addr = data[0].get('address', {})
    return addr.get('state') or addr.get('region') or addr.get('county')


for rec in records:
    if rec['provincie'] or not rec['stad']:
        continue
    try:
        found = geocode(rec['stad'], rec['land'])
        print(rec['land'], rec['stad'], '->', found)
        if found:
            rec['provincie'] = found
    except Exception as e:
        print('failed', rec['stad'], e)
    time.sleep(1.1)

with open(SRC, 'w', encoding='utf-8') as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

print('done')
