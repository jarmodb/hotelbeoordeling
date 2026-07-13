import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { HotelEntry, HotelEntryInput, WerkPrive } from '../types'
import { StarRating } from './StarRating'

interface HotelFormProps {
  initial: HotelEntry | null
  knownLanden: string[]
  entries: HotelEntry[]
  onSave: (input: HotelEntryInput) => Promise<void>
  onDelete?: () => Promise<void>
  onCancel: () => void
}

function lookupProvincieFromHistory(entries: HotelEntry[], land: string, stad: string): string | null {
  const l = land.trim().toLowerCase()
  const s = stad.trim().toLowerCase()
  if (!l || !s) return null
  const match = entries.find(
    (e) => e.provincie && e.land.trim().toLowerCase() === l && (e.stad ?? '').trim().toLowerCase() === s
  )
  return match?.provincie ?? null
}

async function lookupProvincieOnline(land: string, stad: string, signal: AbortSignal): Promise<string | null> {
  const query = encodeURIComponent(`${stad}, ${land}`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=jsonv2&addressdetails=1&limit=1`
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) return null
  const results = await res.json()
  const address = results[0]?.address
  return address?.state ?? address?.region ?? address?.county ?? null
}

export function HotelForm({ initial, knownLanden, entries, onSave, onDelete, onCancel }: HotelFormProps) {
  const [land, setLand] = useState(initial?.land ?? '')
  const [provincie, setProvincie] = useState(initial?.provincie ?? '')
  const [provincieAuto, setProvincieAuto] = useState(!initial?.provincie)
  const [stad, setStad] = useState(initial?.stad ?? '')
  const [hotelnaam, setHotelnaam] = useState(initial?.hotelnaam ?? '')
  const [hygiene, setHygiene] = useState<number | null>(initial?.hygiene ?? null)
  const [badkamer, setBadkamer] = useState<number | null>(initial?.badkamer ?? null)
  const [ontbijt, setOntbijt] = useState<number | null>(initial?.ontbijt ?? null)
  const [bed, setBed] = useState<number | null>(initial?.bed ?? null)
  const [beginDatum, setBeginDatum] = useState(initial?.begin_datum ?? '')
  const [eindDatum, setEindDatum] = useState(initial?.eind_datum ?? '')
  const [aantalKeerGeweest, setAantalKeerGeweest] = useState(initial?.aantal_keer_geweest ?? 1)
  const [werkPrive, setWerkPrive] = useState<WerkPrive | ''>(initial?.werk_prive ?? '')
  const [opmerkingen, setOpmerkingen] = useState(initial?.opmerkingen ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provincieLoading, setProvincieLoading] = useState(false)

  useEffect(() => {
    if (!provincieAuto) return

    const fromHistory = lookupProvincieFromHistory(entries, land, stad)
    if (fromHistory) {
      setProvincie(fromHistory)
      return
    }

    if (!land.trim() || !stad.trim()) return

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setProvincieLoading(true)
      try {
        const found = await lookupProvincieOnline(land, stad, controller.signal)
        if (found) setProvincie(found)
      } catch {
        // offline or lookup failed: leave provincie for manual entry
      } finally {
        setProvincieLoading(false)
      }
    }, 600)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [land, stad, provincieAuto, entries])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!land.trim() || !hotelnaam.trim()) {
      setError('Land en hotelnaam zijn verplicht')
      return
    }
    setBusy(true)
    try {
      await onSave({
        land: land.trim(),
        provincie: provincie.trim() || null,
        stad: stad.trim() || null,
        hotelnaam: hotelnaam.trim(),
        hygiene,
        badkamer,
        ontbijt,
        bed,
        begin_datum: beginDatum || null,
        eind_datum: eindDatum || null,
        aantal_keer_geweest: aantalKeerGeweest || null,
        werk_prive: werkPrive || null,
        opmerkingen: opmerkingen.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) return
    if (!confirm(`${hotelnaam} verwijderen?`)) return
    setBusy(true)
    try {
      await onDelete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verwijderen mislukt')
      setBusy(false)
    }
  }

  return (
    <form className="hotel-form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Hotel bewerken' : 'Nieuw hotel'}</h2>

      <label>
        Land
        <input
          list="landen-lijst"
          required
          value={land}
          onChange={(e) => setLand(e.target.value)}
        />
        <datalist id="landen-lijst">
          {knownLanden.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
      </label>

      <div className="form-row">
        <label>
          Provincie
          <input
            value={provincie}
            onChange={(e) => {
              setProvincie(e.target.value)
              setProvincieAuto(false)
            }}
            placeholder={provincieLoading ? 'Opzoeken...' : 'Vult zich automatisch in als bekend'}
          />
        </label>
        <label>
          Stad
          <input value={stad} onChange={(e) => setStad(e.target.value)} />
        </label>
      </div>

      <label>
        Hotelnaam
        <input required value={hotelnaam} onChange={(e) => setHotelnaam(e.target.value)} />
      </label>

      <div className="ratings-grid">
        <StarRating label="Hygiëne" value={hygiene} onChange={setHygiene} />
        <StarRating label="Badkamer" value={badkamer} onChange={setBadkamer} />
        <StarRating label="Ontbijt" value={ontbijt} onChange={setOntbijt} />
        <StarRating label="Bed" value={bed} onChange={setBed} />
      </div>

      <div className="form-row">
        <label>
          Begin datum
          <input
            type="date"
            value={beginDatum}
            onChange={(e) => setBeginDatum(e.target.value)}
          />
        </label>
        <label>
          Eind datum
          <input
            type="date"
            value={eindDatum}
            min={beginDatum || undefined}
            onChange={(e) => setEindDatum(e.target.value)}
          />
        </label>
      </div>

      <label>
        Aantal keer geweest
        <div className="stepper">
          <input
            type="number"
            min={1}
            value={aantalKeerGeweest}
            onChange={(e) => setAantalKeerGeweest(Number(e.target.value))}
          />
          <button
            type="button"
            className="stepper-button"
            onClick={() => setAantalKeerGeweest((n) => (n || 0) + 1)}
            aria-label="Aantal keer geweest ophogen"
          >
            +1
          </button>
        </div>
      </label>

      <label>
        Werk / prive
        <select value={werkPrive} onChange={(e) => setWerkPrive(e.target.value as WerkPrive | '')}>
          <option value="">-</option>
          <option value="werk">Werk</option>
          <option value="prive">Prive</option>
          <option value="anders">Anders</option>
        </select>
      </label>

      <label>
        Opmerkingen
        <textarea
          rows={4}
          value={opmerkingen}
          onChange={(e) => setOpmerkingen(e.target.value)}
        />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="secondary" onClick={onCancel} disabled={busy}>
          Annuleren
        </button>
        {onDelete && (
          <button type="button" className="danger" onClick={handleDelete} disabled={busy}>
            Verwijderen
          </button>
        )}
        <button type="submit" disabled={busy}>
          Opslaan
        </button>
      </div>
    </form>
  )
}
