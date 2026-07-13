import { useMemo, useState } from 'react'
import type { HotelEntry } from '../types'

interface HotelListProps {
  entries: HotelEntry[]
  onSelect: (entry: HotelEntry) => void
  onAddNew: () => void
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

export function HotelList({ entries, onSelect, onAddNew }: HotelListProps) {
  const [search, setSearch] = useState('')
  const [land, setLand] = useState('alle')

  const landen = useMemo(
    () => Array.from(new Set(entries.map((e) => e.land))).sort(),
    [entries]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entries
      .filter((e) => land === 'alle' || e.land === land)
      .filter(
        (e) =>
          !q ||
          e.hotelnaam.toLowerCase().includes(q) ||
          (e.stad ?? '').toLowerCase().includes(q) ||
          (e.provincie ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => (b.datum_geweest ?? '').localeCompare(a.datum_geweest ?? ''))
  }, [entries, search, land])

  return (
    <div className="hotel-list-screen">
      <div className="filters">
        <input
          type="search"
          placeholder="Zoek op hotel, stad of provincie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={land} onChange={(e) => setLand(e.target.value)}>
          <option value="alle">Alle landen</option>
          {landen.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="empty-state">Nog geen hotels{search || land !== 'alle' ? ' gevonden' : ''}. Tik op + om er een toe te voegen.</p>
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
                {entry.datum_geweest && <span>{formatDate(entry.datum_geweest)}</span>}
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
