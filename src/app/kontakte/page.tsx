'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Kontakt } from '@/types/database'
import KontakteTable from '@/components/kontakte/KontakteTable'
import KontaktModal from '@/components/kontakte/KontaktModal'
import { Plus, Search, Users } from 'lucide-react'

export default function KontaktePage() {
  const supabase = createClient()
  const [kontakte, setKontakte] = useState<Kontakt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editKontakt, setEditKontakt] = useState<Kontakt | null>(null)

  const fetchKontakte = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('kontakte')
      .select('*')
      .order('firma', { ascending: true })
    if (!error && data) setKontakte(data as Kontakt[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchKontakte() }, [fetchKontakte])

  const filtered = kontakte.filter(k => {
    const name = `${k.firma || ''} ${k.vorname || ''} ${k.nachname || ''} ${k.email || ''}`.toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  const handleNew = () => { setEditKontakt(null); setModalOpen(true) }
  const handleEdit = (k: Kontakt) => { setEditKontakt(k); setModalOpen(true) }

  const handleDelete = async (id: string) => {
    if (!confirm('Kontakt wirklich löschen?')) return
    await supabase.from('kontakte').delete().eq('id', id)
    fetchKontakte()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontakte</h1>
          <p className="text-sm text-gray-500 mt-0.5">{kontakte.length} Kontakte total</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Neuer Kontakt
        </button>
      </div>

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Firma, Name, Email suchen…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      <div className="min-w-0">

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Lade Kontakte…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">
            {searchQuery ? 'Keine Kontakte gefunden' : 'Noch keine Kontakte'}
          </p>
          {!searchQuery && (
            <button onClick={handleNew} className="mt-3 text-blue-600 text-sm font-medium hover:underline">
              Ersten Kontakt erfassen
            </button>
          )}
        </div>
      ) : (
        <KontakteTable
          kontakte={filtered}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {modalOpen && (
        <KontaktModal
          kontakt={editKontakt}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); fetchKontakte() }}
        />
      )}
    </div>
  )
}
