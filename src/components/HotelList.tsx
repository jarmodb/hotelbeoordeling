import { useMemo, useState } from 'react'
import type { HotelEntry, WerkPrive } from '../types'

interface HotelListProps {
  entries: HotelEntry[]
  onSelect: (entry: HotelEntry) => void
  onAddNew: () => void
}

const ALL = 'alle'
const STAR_OPTIONS = [1, 2, 3, 4, 5]

interface Filters {
  land: string
  provincie: string
  stad: string
  datumVan: string
  datumTot: string
  minAantalKeer: number
  minGemiddeld: number
  minHygiene: number
  minBadkamer: number
  minOntbijt: number
  minBed: number
  werkPrive: WerkPrive | ''
}

const DEFAULT_FILTERS: Filters = {
  land: ALL,
  provincie: ALL,
  stad: ALL,
  datumVan: '',
  datumTot: '',
  minAantalKeer: 0,
  minGemiddeld: 0,
  minHygiene: 0,
  minBadkamer: 0,
  minOntbijt: 0,
  minBed: 0,
  werkPrive: '',
}

function countActive(f: Filters): number {
  let n = 0
  if (f.datumVan) n++
  if (f.datumTot) n++
  if (f.minAantalKeer > 0) n++
  if (f.minGemiddeld > 0) n++
  if (f.minHygiene > 0) n++
  if (f.minBadkamer > 0) n++
  if (f.minOntbijt > 0) n++
  if (f.minBed > 0) n++
  if (f.werkPrive) n++
  return n
}

function average(entry: HotelEntry): number | null {
  const values = [entry.hygiene, entry.badkamer, entry.ontbijt, entry.bed].filter(
    (v): v is number => v != null
  )
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

function formatDate(date: string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateRange(entry: HotelEntry): string {
  const begin = formatDate(entry.begin_datum)
  const eind = formatDate(entry.eind_datum)
  if (begin && eind && begin !== eind) return `${begin} - ${eind}`
  return begin || eind
}

export function HotelList({ entries, onSelect, onAddNew }: HotelListProps) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => {
      const next = { ...f, [key]: value }
      if (key === 'land') {
        next.provincie = ALL
        next.stad = ALL
      }
      if (key === 'provincie') {
        next.stad = ALL
      }
      return next
    })
  }

  const landen = useMemo(() => Array.from(new Set(entries.map((e) => e.land))).sort(), [entries])

  const provincies = useMemo(
    () =>
      Array.from(
        new Set(
          entries
            .filter((e) => filters.land === ALL || e.land === filters.land)
            .map((e) => e.provincie)
            .filter((v): v is string => !!v)
        )
      ).sort(),
    [entries, filters.land]
  )

  const steden = useMemo(
    () =>
      Array.from(
        new Set(
          entries
            .filter((e) => filters.land === ALL || e.land === filters.land)
            .filter((e) => filters.provincie === ALL || e.provincie === filters.provincie)
            .map((e) => e.stad)
            .filter((v): v is string => !!v)
        )
      ).sort(),
    [entries, filters.land, filters.provincie]
  )

  const activeCount = countActive(filters)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entries
      .filter((e) => filters.land === ALL || e.land === filters.land)
      .filter((e) => filters.provincie === ALL || e.provincie === filters.provincie)
      .filter((e) => filters.stad === ALL || e.stad === filters.stad)
      .filter(
        (e) =>
          !q ||
          e.hotelnaam.toLowerCase().includes(q) ||
          (e.stad ?? '').toLowerCase().includes(q) ||
          (e.provincie ?? '').toLowerCase().includes(q)
      )
      .filter((e) => !filters.datumVan || (e.begin_datum ?? '') >= filters.datumVan)
      .filter((e) => !filters.datumTot || (e.begin_datum ?? '') <= filters.datumTot)
      .filter((e) => filters.minAantalKeer === 0 || (e.aantal_keer_geweest ?? 0) >= filters.minAantalKeer)
      .filter((e) => filters.minGemiddeld === 0 || (average(e) ?? 0) >= filters.minGemiddeld)
      .filter((e) => filters.minHygiene === 0 || (e.hygiene ?? 0) >= filters.minHygiene)
      .filter((e) => filters.minBadkamer === 0 || (e.badkamer ?? 0) >= filters.minBadkamer)
      .filter((e) => filters.minOntbijt === 0 || (e.ontbijt ?? 0) >= filters.minOntbijt)
      .filter((e) => filters.minBed === 0 || (e.bed ?? 0) >= filters.minBed)
      .filter((e) => !filters.werkPrive || e.werk_prive === filters.werkPrive)
      .sort((a, b) => (b.begin_datum ?? '').localeCompare(a.begin_datum ?? ''))
  }, [entries, search, filters])

  const anyFilterActive = activeCount > 0 || search || filters.land !== ALL || filters.provincie !== ALL || filters.stad !== ALL

  return (
    <div className="hotel-list-screen">
      <div className="filters">
        <input
          type="search"
          placeholder="Zoek op hotel, stad of provincie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="filters-toggle"
          onClick={() => setShowFilters((s) => !s)}
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
      </div>

      <div className="filters-row">
        <select value={filters.land} onChange={(e) => update('land', e.target.value)}>
          <option value={ALL}>Alle landen</option>
          {landen.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select value={filters.provincie} onChange={(e) => update('provincie', e.target.value)}>
          <option value={ALL}>Alle provincies</option>
          {provincies.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={filters.stad} onChange={(e) => update('stad', e.target.value)}>
          <option value={ALL}>Alle steden</option>
          {steden.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="form-row">
            <label>
              Vanaf datum
              <input
                type="date"
                value={filters.datumVan}
                onChange={(e) => update('datumVan', e.target.value)}
              />
            </label>
            <label>
              Tot datum
              <input
                type="date"
                value={filters.datumTot}
                onChange={(e) => update('datumTot', e.target.value)}
              />
            </label>
          </div>

          <label>
            Minimaal aantal keer geweest
            <select
              value={filters.minAantalKeer}
              onChange={(e) => update('minAantalKeer', Number(e.target.value))}
            >
              <option value={0}>Alle</option>
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}x of vaker
                </option>
              ))}
            </select>
          </label>

          <label>
            Minimaal gemiddelde sterren
            <select
              value={filters.minGemiddeld}
              onChange={(e) => update('minGemiddeld', Number(e.target.value))}
            >
              <option value={0}>Alle</option>
              {STAR_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}+ sterren
                </option>
              ))}
            </select>
          </label>

          <div className="ratings-grid">
            <label>
              Hygiëne minimaal
              <select value={filters.minHygiene} onChange={(e) => update('minHygiene', Number(e.target.value))}>
                <option value={0}>Alle</option>
                {STAR_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </label>
            <label>
              Badkamer minimaal
              <select value={filters.minBadkamer} onChange={(e) => update('minBadkamer', Number(e.target.value))}>
                <option value={0}>Alle</option>
                {STAR_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ontbijt minimaal
              <select value={filters.minOntbijt} onChange={(e) => update('minOntbijt', Number(e.target.value))}>
                <option value={0}>Alle</option>
                {STAR_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </label>
            <label>
              Bed minimaal
              <select value={filters.minBed} onChange={(e) => update('minBed', Number(e.target.value))}>
                <option value={0}>Alle</option>
                {STAR_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Werk / prive
            <select value={filters.werkPrive} onChange={(e) => update('werkPrive', e.target.value as WerkPrive | '')}>
              <option value="">Alle</option>
              <option value="werk">Werk</option>
              <option value="prive">Prive</option>
              <option value="anders">Anders</option>
            </select>
          </label>

          <button type="button" className="secondary" onClick={() => setFilters(DEFAULT_FILTERS)}>
            Filters wissen
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="empty-state">
          Nog geen hotels{anyFilterActive ? ' gevonden' : ''}. Tik op + om er een toe te voegen.
        </p>
      )}

      <ul className="hotel-cards">
        {filtered.map((entry) => {
          const avg = average(entry)
          return (
            <li key={entry.id} className="hotel-card" onClick={() => onSelect(entry)}>
              <div className="hotel-card-header">
                <div>
                  <h3>{entry.hotelnaam}</h3>
                  <p className="hotel-location">
                    {[entry.stad, entry.provincie, entry.land].filter(Boolean).join(', ')}
                  </p>
                </div>
                {avg != null && <span className="avg-badge">{avg.toFixed(1)}★</span>}
              </div>
              <div className="hotel-card-meta">
                {(entry.begin_datum || entry.eind_datum) && <span>{formatDateRange(entry)}</span>}
                {entry.werk_prive && <span className={`tag tag-${entry.werk_prive}`}>{entry.werk_prive}</span>}
                {entry.aantal_keer_geweest && entry.aantal_keer_geweest > 1 && (
                  <span>{entry.aantal_keer_geweest}x geweest</span>
                )}
              </div>
              {entry.opmerkingen && <p className="hotel-notes">{entry.opmerkingen}</p>}
            </li>
          )
        })}
      </ul>

      <button className="fab" onClick={onAddNew} aria-label="Hotel toevoegen">
        +
      </button>
    </div>
  )
}
