export type WerkPrive = 'werk' | 'prive' | 'anders'

export interface HotelEntry {
  id: string
  user_id: string
  land: string
  provincie: string | null
  stad: string | null
  hotelnaam: string
  hygiene: number | null
  badkamer: number | null
  ontbijt: number | null
  bed: number | null
  datum_geweest: string | null
  aantal_keer_geweest: number | null
  werk_prive: WerkPrive | null
  opmerkingen: string | null
  created_at: string
  updated_at: string
}

export type HotelEntryInput = Omit<HotelEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>
