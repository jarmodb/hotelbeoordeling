import json

SRC = r'C:\Users\jarmo\Desktop\Hotelbeoordeling app\scripts\hotels.json'
OUT = r'C:\Users\jarmo\Desktop\Hotelbeoordeling app\supabase\import_data.sql'
USER_EMAIL = 'jarmo2@zeelandnet.nl'

with open(SRC, encoding='utf-8') as f:
    records = json.load(f)


def sql_str(v):
    if v is None:
        return 'null'
    return "'" + str(v).replace("'", "''") + "'"


def sql_num(v):
    return 'null' if v is None else str(v)


lines = []
lines.append('-- Bulk import of existing Excel hotel data.')
lines.append('-- Run in the Supabase SQL Editor while logged in as the project owner (any role works,')
lines.append(f"-- since user_id is resolved from auth.users by email: {USER_EMAIL}).")
lines.append('-- Deletes this user\'s previous import first so re-running is safe (no duplicates).')
lines.append('')
lines.append('delete from public.hotel_ratings_entries')
lines.append(f"  where user_id = (select id from auth.users where email = {sql_str(USER_EMAIL)});")
lines.append('')
lines.append('insert into public.hotel_ratings_entries')
lines.append('  (user_id, land, provincie, stad, hotelnaam, hygiene, badkamer, ontbijt, bed, begin_datum, eind_datum, aantal_keer_geweest, werk_prive, opmerkingen)')
lines.append('values')

row_sqls = []
for r in records:
    user_id_expr = f"(select id from auth.users where email = {sql_str(USER_EMAIL)})"
    row = (
        f"  ({user_id_expr}, {sql_str(r['land'])}, {sql_str(r['provincie'])}, {sql_str(r['stad'])}, "
        f"{sql_str(r['hotelnaam'])}, {sql_num(r['hygiene'])}, {sql_num(r['badkamer'])}, {sql_num(r['ontbijt'])}, "
        f"{sql_num(r['bed'])}, {sql_str(r['begin_datum'])}, {sql_str(r['eind_datum'])}, "
        f"{sql_num(r['aantal_keer_geweest'])}, {sql_str(r['werk_prive'])}, {sql_str(r['opmerkingen'])})"
    )
    row_sqls.append(row)

lines.append(',\n'.join(row_sqls) + ';')

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n')

print(f'{len(records)} rows written to {OUT}')
