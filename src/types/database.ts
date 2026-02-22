export type RechnungStatus = 'entwurf' | 'gesendet' | 'bezahlt' | 'überfällig' | 'storniert'

export interface Rechnung {
  id: string
  user_id: string
  nummer: string
  kontakt_id: string | null
  kontakt_name: string
  titel: string | null
  datum: string
  faelligkeitsdatum: string | null
  status: RechnungStatus
  nettobetrag: number
  mwst_betrag: number
  bruttobetrag: number
  mwst_satz: number
  waehrung: string
  notizen: string | null
  created_at: string
  updated_at: string
}

export interface RechnungPosition {
  id: string
  rechnung_id: string
  beschreibung: string
  menge: number
  einheit: string | null
  einzelpreis: number
  mwst_satz: number
  gesamtpreis: number
  reihenfolge: number
}

export interface Kontakt {
  id: string
  user_id: string
  firma: string | null
  vorname: string | null
  nachname: string | null
  email: string | null
  adresse: string | null
  plz: string | null
  ort: string | null
  land: string
}
