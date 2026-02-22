export type RechnungStatus = 'entwurf' | 'gesendet' | 'bezahlt' | 'überfällig' | 'storniert'

export interface Kontakt {
  id: string
  user_id: string
  typ: 'firma' | 'privat'
  kundennummer: string
  firma: string | null
  branche: string | null
  mwst_nr: string | null
  website: string | null
  iban: string | null
  vorname: string | null
  nachname: string | null
  email: string | null
  telefon: string | null
  adresse: string | null
  plz: string | null
  ort: string | null
  land: string
  notizen: string | null
  created_at: string
  updated_at: string
}

export interface KontaktPerson {
  id: string
  kontakt_id: string
  user_id: string
  personennummer: string
  anrede: string | null
  vorname: string | null
  nachname: string
  funktion: string | null
  email: string | null
  telefon: string | null
  mobile: string | null
  ist_hauptperson: boolean
  created_at: string
}

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
}

export interface RechnungPosition {
  id: string
  rechnung_id: string
  beschreibung: string
  menge: number
  einheit: string
  einzelpreis: number
  mwst_satz: number
  gesamtpreis: number
  reihenfolge: number
}
