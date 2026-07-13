import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import { Auth } from './components/Auth'
import { HotelList } from './components/HotelList'
import { HotelForm } from './components/HotelForm'
import type { HotelEntry, HotelEntryInput } from './types'
import './App.css'

const KNOWN_LANDEN = [
  'Nederland',
  'Belgie',
  'Frankrijk',
  'Italie',
  'Engeland',
  'Egypte',
  'China',
  'Spanje',
  'Duitsland',
  'Zwitserland',
]

type View = { name: 'list' } | { name: 'new' } | { name: 'edit'; entry: HotelEntry }

function App() {
  const { session, loading } = useAuth()
  const [entries, setEntries] = useState<HotelEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [view, setView] = useState<View>({ name: 'list' })

  const fetchEntries = useCallback(async () => {
    setLoadingEntries(true)
    setFetchError(null)
    const { data, error } = await supabase
      .from('hotel_ratings_entries')
      .select('*')
      .order('begin_datum', { ascending: false, nullsFirst: false })
    if (error) {
      setFetchError(error.message)
    } else {
      setEntries(data as HotelEntry[])
    }
    setLoadingEntries(false)
  }, [])

  useEffect(() => {
    if (session) fetchEntries()
  }, [session, fetchEntries])

  const landen = useMemo(() => {
    const fromData = entries.map((e) => e.land)
    return Array.from(new Set([...KNOWN_LANDEN, ...fromData])).sort()
  }, [entries])

  async function handleSave(input: HotelEntryInput) {
    if (view.name === 'edit') {
      const { error } = await supabase
        .from('hotel_ratings_entries')
        .update(input)
        .eq('id', view.entry.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('hotel_ratings_entries').insert(input)
      if (error) throw error
    }
    await fetchEntries()
    setView({ name: 'list' })
  }

  async function handleDelete(entry: HotelEntry) {
    const { error } = await supabase.from('hotel_ratings_entries').delete().eq('id', entry.id)
    if (error) throw error
    await fetchEntries()
    setView({ name: 'list' })
  }

  if (loading) {
    return <div className="center-screen">Laden...</div>
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hotelbeoordelingen</h1>
        <button className="link-button" onClick={() => supabase.auth.signOut()}>
          Uitloggen
        </button>
      </header>

      <main>
        {fetchError && <p className="error">{fetchError}</p>}
        {loadingEntries && <p className="loading-state">Laden...</p>}
        {!loadingEntries && view.name === 'list' && (
          <HotelList
            entries={entries}
            onSelect={(entry) => setView({ name: 'edit', entry })}
            onAddNew={() => setView({ name: 'new' })}
          />
        )}
        {view.name === 'new' && (
          <HotelForm
            initial={null}
            knownLanden={landen}
            entries={entries}
            onSave={handleSave}
            onCancel={() => setView({ name: 'list' })}
          />
        )}
        {view.name === 'edit' && (
          <HotelForm
            initial={view.entry}
            knownLanden={landen}
            entries={entries}
            onSave={handleSave}
            onDelete={() => handleDelete(view.entry)}
            onCancel={() => setView({ name: 'list' })}
          />
        )}
      </main>
    </div>
  )
}

export default App
