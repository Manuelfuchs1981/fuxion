'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Kontakt } from '@/types/database'
import { X } from 'lucide-react'

interface Props {
  kontakt: Kontakt | null
  onClose: () => void
  onSaved: () => void
}

export default function KontaktModal({ kontakt, onClose, onSaved }: Props) {
  const supabase = createClient()
  const isEdit = !!kontakt

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [firma, setFirma] = useState(kontakt?.firma || '')
  const [vorname, setVorname] = useState(kontakt?.vorname || '')
  const [nachname, setNachname] = useState(kontakt?.nachname || '')
  const [email, setEmail] = useState(kontakt?.email || '')
  const [adresse, setAdresse] = useState(kontakt?.adresse || '')
  const [plz, setPlz] = useState(kontakt?.plz || '')
  const [ort, setOrt] = useState(kontakt?.ort || '')
  const [land, setLand] = useState(kontakt?.land || 'CH')

  const handleSave = async () => {
    if (!firma && !nachname) {
      setError('Bitte Firma oder Nachname eingeben.')
      return
    }
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Nicht angemeldet')

      if (isEdit) {
        const { error: e } = await supabase.from('kontakte').update({
          firma: firma || null,
          vorname: vorname || null,
          nachname: nachname || null,
          email: email || null,
          adresse: adresse || null,
          plz: plz || null,
          ort: ort || null,
          land,
        }).eq('id', kontakt!.id)
        if (e) throw e
      } else {
        const { error: e } = await supabase.from('kontakte').insert({
          user_id: user.id,
          firma: firma || null,
          vorname: vorname || null,
          nachname: nachname || null,
          email: email || null,
          adresse: adresse || null,
          plz: plz || null,
          ort: ort || null,
          land,
        })
        if (e) throw e
      }
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Firma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
            <input
              value={firma}
              onChange={e => setFirma(e.target.value)}
              placeholder="z.B. Muster AG"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Vor- und Nachname */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
              <input
                value={vorname}
                onChange={e => setVorname(e.target.value)}
                placeholder="Hans"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
              <input
                value={nachname}
                onChange={e => setNachname(e.target.value)}
                placeholder="Muster"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="hans@muster.ch"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Adresse */}
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
                <option value="CH">🇨🇭 CH</option>
                <option value="DE">🇩🇪 DE</option>
                <option value="AT">🇦🇹 AT</option>
                <option value="FR">🇫🇷 FR</option>
                <option value="IT">🇮🇹 IT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
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
            {saving ? 'Wird gespeichert…' : isEdit ? 'Speichern' : 'Kontakt erstellen'}
          </button>
        </div>
      </div>
    </div>
  )
}
