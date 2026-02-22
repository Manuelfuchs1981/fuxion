'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Rechnung, Kontakt } from '@/types/database'
import { X, Plus, Trash2 } from 'lucide-react'

interface Props {
  rechnung: Rechnung | null
  onClose: () => void
  onSaved: () => void
}

interface PositionForm {
  beschreibung: string
  menge: number
  einheit: string
  einzelpreis: number
  mwst_satz: number
}

const DEFAULT_POSITION: PositionForm = {
  beschreibung: '', menge: 1, einheit: 'Stk', einzelpreis: 0, mwst_satz: 8.1,
}

export default function RechnungModal({ rechnung, onClose, onSaved }: Props) {
  const supabase = createClient()
  const isEdit = !!rechnung

  const [kontakte, setKontakte] = useState<Kontakt[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [kontaktId, setKontaktId] = useState(rechnung?.kontakt_id || '')
  const [kontaktName, setKontaktName] = useState(rechnung?.kontakt_name || '')
  const [titel, setTitel] = useState(rechnung?.titel || '')
  const [datum, setDatum] = useState(rechnung?.datum || new Date().toISOString().split('T')[0])
  const [faellig, setFaellig] = useState(rechnung?.faelligkeitsdatum || '')
  const [notizen, setNotizen] = useState(rechnung?.notizen || '')
  const [positionen, setPositionen] = useState<PositionForm[]>([{ ...DEFAULT_POSITION }])

  useEffect(() => {
    supabase.from('kontakte').select('*').order('firma').then(({ data }) => {
      if (data) setKontakte(data as Kontakt[])
    })
    if (rechnung) {
      supabase
        .from('rechnung_positionen')
        .select('*')
        .eq('rechnung_id', rechnung.id)
        .order('reihenfolge')
        .then(({ data }) => {
          if (data && data.length > 0) {
            setPositionen(data.map(p => ({
              beschreibung: p.beschreibung,
              menge: p.menge,
              einheit: p.einheit || 'Stk',
              einzelpreis: p.einzelpreis,
              mwst_satz: p.mwst_satz,
            })))
          }
        })
    }
  }, [])

  const handleKontaktChange = (id: string) => {
    setKontaktId(id)
    const k = kontakte.find(c => c.id === id)
    if (k) setKontaktName(k.firma || `${k.vorname || ''} ${k.nachname || ''}`.trim())
  }

  const updatePosition = (index: number, field: keyof PositionForm, value: string | number) => {
    setPositionen(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  const netto = positionen.reduce((sum, p) => sum + p.menge * p.einzelpreis, 0)
  const mwst = positionen.reduce((sum, p) => sum + p.menge * p.einzelpreis * p.mwst_satz / 100, 0)
  const brutto = netto + mwst

  const formatCHF = (n: number) =>
    new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n)

  const handleSave = async () => {
    if (!kontaktName) { setError('Bitte einen Kunden auswählen.'); return }
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Nicht angemeldet')

      let rechnungId = rechnung?.id

      if (isEdit) {
        const { error: e } = await supabase.from('rechnungen').update({
          kontakt_id: kontaktId || null,
          kontakt_name: kontaktName,
          titel: titel || null,
          datum,
          faelligkeitsdatum: faellig || null,
          notizen: notizen || null,
          nettobetrag: netto,
          mwst_betrag: mwst,
          bruttobetrag: brutto,
          updated_at: new Date().toISOString(),
        }).eq('id', rechnungId!)
        if (e) throw e
      } else {
        const year = new Date().getFullYear()
        const { count } = await supabase
          .from('rechnungen')
          .select('*', { count: 'exact', head: true })
          .like('nummer', `RE-${year}-%`)
        const nummer = `RE-${year}-${String((count || 0) + 1).padStart(3, '0')}`

        const { data: newR, error: e } = await supabase.from('rechnungen').insert({
          user_id: user.id,
          nummer,
          kontakt_id: kontaktId || null,
          kontakt_name: kontaktName,
          titel: titel || null,
          datum,
          faelligkeitsdatum: faellig || null,
          notizen: notizen || null,
          status: 'entwurf',
          nettobetrag: netto,
          mwst_betrag: mwst,
          bruttobetrag: brutto,
          mwst_satz: 8.1,
          waehrung: 'CHF',
        }).select().single()
        if (e) throw e
        rechnungId = newR.id
      }

      await supabase.from('rechnung_positionen').delete().eq('rechnung_id', rechnungId!)
      const { error: posErr } = await supabase.from('rechnung_positionen').insert(
        positionen.map((p, i) => ({
          rechnung_id: rechnungId!,
          beschreibung: p.beschreibung,
          menge: p.menge,
          einheit: p.einheit,
          einzelpreis: p.einzelpreis,
          mwst_satz: p.mwst_satz,
          gesamtpreis: p.menge * p.einzelpreis,
          reihenfolge: i,
        }))
      )
      if (posErr) throw posErr
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? `Rechnung ${rechnung!.nummer} bearbeiten` : 'Neue Rechnung'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Felder */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kunde *</label>
              <select
                value={kontaktId}
                onChange={e => handleKontaktChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Kunde auswählen —</option>
                {kontakte.map(k => (
                  <option key={k.id} value={k.id}>
                    {k.firma || `${k.vorname || ''} ${k.nachname || ''}`.trim()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel / Betreff</label>
              <input
                value={titel}
                onChange={e => setTitel(e.target.value)}
                placeholder="z.B. Webentwicklung März"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rechnungsdatum</label>
              <input
                type="date"
                value={datum}
                onChange={e => setDatum(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fällig am</label>
              <input
                type="date"
                value={faellig}
                onChange={e => setFaellig(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Positionen */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800">Positionen</h3>
              <button
                onClick={() => setPositionen(p => [...p, { ...DEFAULT_POSITION }])}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" /> Position hinzufügen
              </button>
            </div>
            <div className="space-y-2">
              {/* Spalten-Header */}
              <div className="grid grid-cols-12 gap-2 px-3 text-xs text-gray-400 font-medium">
                <div className="col-span-5">Beschreibung</div>
                <div className="col-span-2 text-right">Menge</div>
                <div className="col-span-2 text-right">Preis CHF</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1" />
              </div>
              {positionen.map((p, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg p-3">
                  <div className="col-span-5">
                    <input
                      value={p.beschreibung}
                      onChange={e => updatePosition(i, 'beschreibung', e.target.value)}
                      placeholder="Beschreibung"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={p.menge}
                      onChange={e => updatePosition(i, 'menge', parseFloat(e.target.value) || 0)}
                      min={0}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-right"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={p.einzelpreis}
                      onChange={e => updatePosition(i, 'einzelpreis', parseFloat(e.target.value) || 0)}
                      min={0}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-right"
                    />
                  </div>
                  <div className="col-span-2 text-sm text-right text-gray-600 font-medium pr-1">
                    {formatCHF(p.menge * p.einzelpreis)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {positionen.length > 1 && (
                      <button
                        onClick={() => setPositionen(prev => prev.filter((_, j) => j !== i))}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Nettobetrag</span><span>{formatCHF(netto)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>MWST (8.1%)</span><span>{formatCHF(mwst)}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-gray-900 pt-1 border-t border-gray-200">
              <span>Total CHF</span><span>{formatCHF(brutto)}</span>
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notizen / Zahlungskonditionen</label>
            <textarea
              value={notizen}
              onChange={e => setNotizen(e.target.value)}
              rows={2}
              placeholder="z.B. Zahlbar innerhalb 30 Tagen"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Wird gespeichert…' : isEdit ? 'Speichern' : 'Rechnung erstellen'}
          </button>
        </div>
      </div>
    </div>
  )
}
