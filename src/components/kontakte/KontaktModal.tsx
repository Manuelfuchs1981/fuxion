'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Kontakt } from '@/types/database'
import { X, Plus, Trash2, ChevronDown, Building2, User } from 'lucide-react'

interface Props {
  kontakt: Kontakt | null
  onClose: () => void
  onSaved: () => void
}

interface Person {
  id?: string
  personennummer?: string
  anrede: string
  vorname: string
  nachname: string
  funktion: string
  email: string
  telefon: string
  mobile: string
  expanded: boolean
}

const newPerson = (): Person => ({
  anrede: 'Herr', vorname: '', nachname: '', funktion: '',
  email: '', telefon: '', mobile: '', expanded: true,
})

export default function KontaktModal({ kontakt, onClose, onSaved }: Props) {
  const supabase = createClient()
  const isEdit = !!kontakt

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stammdaten
  const [typ, setTyp] = useState(kontakt?.typ || 'firma')
  const [firma, setFirma] = useState(kontakt?.firma || '')
  const [branche, setBranche] = useState(kontakt?.branche || '')
  const [mwstNr, setMwstNr] = useState(kontakt?.mwst_nr || '')
  const [website, setWebsite] = useState(kontakt?.website || '')
  const [iban, setIban] = useState(kontakt?.iban || '')
  const [telefon, setTelefon] = useState(kontakt?.telefon || '')
  const [adresse, setAdresse] = useState(kontakt?.adresse || '')
  const [plz, setPlz] = useState(kontakt?.plz || '')
  const [ort, setOrt] = useState(kontakt?.ort || '')
  const [land, setLand] = useState(kontakt?.land || 'CH')
  const [notizen, setNotizen] = useState(kontakt?.notizen || '')
  const [kundennummer, setKundennummer] = useState(kontakt?.kundennummer || '')

  // Kontaktpersonen
  const [personen, setPersonen] = useState<Person[]>([newPerson()])

  useEffect(() => {
    // Kundennummer generieren
    if (!isEdit) {
      supabase.from('kontakte').select('kundennummer').order('created_at', { ascending: false }).limit(1)
        .then(({ data }) => {
          const last = data?.[0]?.kundennummer
          const next = last ? `KD-${parseInt(last.replace('KD-', '')) + 1}` : 'KD-1001'
          setKundennummer(next)
        })
    }

    // Bestehende Personen laden
    if (isEdit && kontakt) {
      supabase.from('kontakt_personen').select('*').eq('kontakt_id', kontakt.id).order('created_at')
        .then(({ data }) => {
          if (data && data.length > 0) {
            setPersonen(data.map(p => ({
              id: p.id,
              personennummer: p.personennummer,
              anrede: p.anrede || 'Herr',
              vorname: p.vorname || '',
              nachname: p.nachname || '',
              funktion: p.funktion || '',
              email: p.email || '',
              telefon: p.telefon || '',
              mobile: p.mobile || '',
              expanded: false,
            })))
          }
        })
    }
  }, [])

  const updatePerson = (i: number, field: keyof Person, value: string | boolean) => {
    setPersonen(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  const addPerson = () => setPersonen(prev => [...prev, newPerson()])
  const removePerson = (i: number) => setPersonen(prev => prev.filter((_, idx) => idx !== i))

  const getPersonNr = (i: number) => {
    if (personen[i].personennummer) return personen[i].personennummer
    const base = parseInt(kundennummer.replace('KD-', '') || '1000') + 1000
    return `KP-${base + i}`
  }

  const handleSave = async () => {
    if (typ === 'firma' && !firma) { setError('Bitte Firmenname eingeben.'); return }
    if (typ === 'privat' && !personen[0].nachname) { setError('Bitte Nachname eingeben.'); return }
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Nicht angemeldet')

      let kontaktId = kontakt?.id

      const kontaktData = {
        typ,
        firma: firma || null,
        branche: branche || null,
        mwst_nr: mwstNr || null,
        website: website || null,
        iban: iban || null,
        telefon: telefon || null,
        adresse: adresse || null,
        plz: plz || null,
        ort: ort || null,
        land,
        notizen: notizen || null,
        kundennummer,
        // Hauptperson für Rückwärtskompatibilität
        vorname: personen[0]?.vorname || null,
        nachname: personen[0]?.nachname || null,
        email: personen[0]?.email || null,
        kontakt_name: firma || `${personen[0]?.vorname || ''} ${personen[0]?.nachname || ''}`.trim(),
      }

      if (isEdit) {
        const { error: e } = await supabase.from('kontakte').update(kontaktData).eq('id', kontaktId!)
        if (e) throw e
      } else {
        const { data: newK, error: e } = await supabase.from('kontakte')
          .insert({ ...kontaktData, user_id: user.id }).select().single()
        if (e) throw e
        kontaktId = newK.id
      }

      // Personen speichern
      await supabase.from('kontakt_personen').delete().eq('kontakt_id', kontaktId!)
      const personenInsert = personen.map((p, i) => ({
        kontakt_id: kontaktId!,
        user_id: user.id,
        personennummer: getPersonNr(i),
        anrede: p.anrede || null,
        vorname: p.vorname || null,
        nachname: p.nachname,
        funktion: p.funktion || null,
        email: p.email || null,
        telefon: p.telefon || null,
        mobile: p.mobile || null,
        ist_hauptperson: i === 0,
      }))
      const { error: pe } = await supabase.from('kontakt_personen').insert(personenInsert)
      if (pe) throw pe

      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Kunde bearbeiten' : 'Neuer Kunde'}</h2>
            {kundennummer && (
              <span className="inline-flex items-center gap-1.5 mt-1 bg-green-50 border border-green-200 text-green-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                {kundennummer}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg mt-0.5">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

          {/* Typ */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setTyp('firma')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${typ === 'firma' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              <Building2 className="w-4 h-4" /> Firma / Organisation
            </button>
            <button onClick={() => setTyp('privat')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${typ === 'privat' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              <User className="w-4 h-4" /> Privatperson
            </button>
          </div>

          {/* Firmendaten */}
          {typ === 'firma' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-100">Firmendaten</p>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Firmenname *</label>
                <input value={firma} onChange={e => setFirma(e.target.value)} placeholder="z.B. Morf aG"
                  className="w-full border-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Branche <span className="font-normal text-gray-400">optional</span></label>
                  <select value={branche} onChange={e => setBranche(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">— wählen —</option>
                    {['Bau & Immobilien','Detailhandel','Dienstleistung','Gastronomie','Gesundheit','IT & Technologie','Marketing & Medien','Produktion','Transport & Logistik','Andere'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">MwSt-Nr. <span className="font-normal text-gray-400">optional</span></label>
                  <input value={mwstNr} onChange={e => setMwstNr(e.target.value)} placeholder="CHE-123.456.789"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Website <span className="font-normal text-gray-400">optional</span></label>
                  <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.beispiel.ch"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">IBAN <span className="font-normal text-gray-400">optional</span></label>
                  <input value={iban} onChange={e => setIban(e.target.value)} placeholder="CH56 0483 5012 3456 7800 9"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          )}

          {/* Adresse */}
<<<<<<< HEAD
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              value={adresse}
              onChange={e => setAdresse(e.target.value)}
              placeholder="Musterstrasse 1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PLZ + Ort + Land */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
              <input
                value={plz}
                onChange={e => setPlz(e.target.value)}
                placeholder="8000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
              <input
                value={ort}
                onChange={e => setOrt(e.target.value)}
                placeholder="Zürich"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
              <select
                value={land}
                onChange={e => setLand(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
=======
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-100">Adresse</p>
            <input value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="Strasse und Hausnummer"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="grid grid-cols-3 gap-3">
              <input value={plz} onChange={e => setPlz(e.target.value)} placeholder="PLZ"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={ort} onChange={e => setOrt(e.target.value)} placeholder="Ort"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={land} onChange={e => setLand(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
>>>>>>> a2729ae (Feature: Erweitertes Kontakt Modal mit CRM-Funktionen)
                <option value="CH">🇨🇭 Schweiz</option>
                <option value="DE">🇩🇪 Deutschland</option>
                <option value="AT">🇦🇹 Österreich</option>
                <option value="FR">🇫🇷 Frankreich</option>
                <option value="IT">🇮🇹 Italien</option>
              </select>
            </div>
          </div>

          {/* Kontaktpersonen */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {typ === 'firma' ? 'Kontaktpersonen' : 'Person'}
              </p>
              {typ === 'firma' && <span className="text-xs text-gray-400">Jede Person erhält eine Personennummer (KP-)</span>}
            </div>

            <div className="space-y-2">
              {personen.map((p, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Person Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => updatePerson(i, 'expanded', !p.expanded)}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {p.vorname ? p.vorname[0].toUpperCase() : p.nachname ? p.nachname[0].toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {p.vorname || p.nachname ? `${p.vorname} ${p.nachname}`.trim() : 'Neue Kontaktperson'}
                        </p>
                        {p.funktion && <p className="text-xs text-gray-400">{p.funktion}</p>}
                      </div>
                      <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                        {getPersonNr(i)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {i > 0 && (
                        <button onClick={e => { e.stopPropagation(); removePerson(i) }}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50">
                          <Trash2 className="w-3 h-3" /> Entfernen
                        </button>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${p.expanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Person Body */}
                  {p.expanded && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Anrede</label>
                          <select value={p.anrede} onChange={e => updatePerson(i, 'anrede', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Herr</option><option>Frau</option><option>Divers</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Funktion <span className="font-normal text-gray-400">optional</span></label>
                          <input value={p.funktion} onChange={e => updatePerson(i, 'funktion', e.target.value)} placeholder="z.B. Geschäftsführer"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Vorname</label>
                          <input value={p.vorname} onChange={e => updatePerson(i, 'vorname', e.target.value)} placeholder="Vorname"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Nachname *</label>
                          <input value={p.nachname} onChange={e => updatePerson(i, 'nachname', e.target.value)} placeholder="Nachname"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">E-Mail</label>
                          <input type="email" value={p.email} onChange={e => updatePerson(i, 'email', e.target.value)} placeholder="email@beispiel.ch"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile <span className="font-normal text-gray-400">optional</span></label>
                          <input type="tel" value={p.mobile} onChange={e => updatePerson(i, 'mobile', e.target.value)} placeholder="+41 79 123 45 67"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Direkt-Telefon <span className="font-normal text-gray-400">optional</span></label>
                          <input type="tel" value={p.telefon} onChange={e => updatePerson(i, 'telefon', e.target.value)} placeholder="+41 44 123 45 67"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Personennummer</label>
                          <input value={getPersonNr(i) || ''} readOnly
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 font-mono cursor-default" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {typ === 'firma' && (
              <button onClick={addPerson}
                className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium">
                <Plus className="w-4 h-4" /> Weitere Kontaktperson hinzufügen
              </button>
            )}
          </div>

          {/* Notizen */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-gray-100">Notizen <span className="font-normal">optional</span></p>
            <textarea value={notizen} onChange={e => setNotizen(e.target.value)} rows={2}
              placeholder="Interne Notizen zum Kunden…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Abbrechen</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Wird gespeichert…' : isEdit ? 'Speichern' : 'Kunde erstellen'}
          </button>
        </div>
      </div>
    </div>
  )
}
