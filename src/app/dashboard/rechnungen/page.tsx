'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Rechnung, RechnungStatus } from '@/types/database'
import RechnungenTable from '@/components/rechnungen/RechnungenTable'
import RechnungModal from '@/components/rechnungen/RechnungModal'
import { Plus, Search, Filter, FileText } from 'lucide-react'

const STATUS_LABELS: Record<RechnungStatus, string> = {
  entwurf:    'Entwurf',
  gesendet:   'Gesendet',
  bezahlt:    'Bezahlt',
  überfällig: 'Überfällig',
  storniert:  'Storniert',
}

const STATUS_COLORS: Record<RechnungStatus, string> = {
  entwurf:    'bg-gray-100 text-gray-700',
  gesendet:   'bg-blue-100 text-blue-700',
  bezahlt:    'bg-green-100 text-green-700',
  überfällig: 'bg-red-100 text-red-700',
  storniert:  'bg-orange-100 text-orange-700',
}

export default function RechnungenPage() {
  const supabase = createClient()
  const [rechnungen, setRechnungen] = useState<Rechnung[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RechnungStatus | 'alle'>('alle')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRechnung, setEditRechnung] = useState<Rechnung | null>(null)
  const [kpis, setKpis] = useState({ offen: 0, bezahlt: 0, ueberfaellig: 0, total: 0 })

  const fetchRechnungen = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rechnungen')
      .select('*')
      .order('datum', { ascending: false })

    if (!error && data) {
      setRechnungen(data as Rechnung[])
      setKpis({
        offen:        data.filter(r => r.status === 'gesendet').reduce((s, r) => s + r.bruttobetrag, 0),
        bezahlt:      data.filter(r => r.status === 'bezahlt').reduce((s, r) => s + r.bruttobetrag, 0),
        ueberfaellig: data.filter(r => r.status === 'überfällig').reduce((s, r) => s + r.bruttobetrag, 0),
        total:        data.length,
      })
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchRechnungen() }, [fetchRechnungen])

  const filtered = rechnungen.filter(r => {
    const matchSearch =
      r.nummer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.kontakt_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.titel || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'alle' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const formatCHF = (n: number) =>
    new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n)

  const handleNew = () => { setEditRechnung(null); setModalOpen(true) }
  const handleEdit = (r: Rechnung) => { setEditRechnung(r); setModalOpen(true) }

  const handleDelete = async (id: string) => {
    if (!confirm('Rechnung wirklich löschen?')) return
    await supabase.from('rechnungen').delete().eq('id', id)
    fetchRechnungen()
  }

  const handleStatusChange = async (id: string, status: RechnungStatus) => {
    await supabase.from('rechnungen').update({ status }).eq('id', id)
    fetchRechnungen()
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Rechnungen</h1>
            <p className="text-sm text-gray-500 mt-0.5">{kpis.total} Rechnungen total</p>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Neue Rechnung
          </button>
        </div>

        {/* KPI-Karten */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600 opacity-70">Offen</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{formatCHF(kpis.offen)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-red-600 opacity-70">Überfällig</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{formatCHF(kpis.ueberfaellig)}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600 opacity-70">Bezahlt (YTD)</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{formatCHF(kpis.bezahlt)}</p>
          </div>
        </div>

        {/* Filter + Search */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechnung, Kunde suchen…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            {(['alle', 'entwurf', 'gesendet', 'bezahlt', 'überfällig', 'storniert'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s === 'alle' ? 'Alle' : STATUS_LABELS[s as RechnungStatus]}
              </button>
            ))}
          </div>
        </div>

        {/* Inhalt */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">Lade Rechnungen…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">
              {searchQuery || statusFilter !== 'alle' ? 'Keine Rechnungen gefunden' : 'Noch keine Rechnungen'}
            </p>
            {!searchQuery && statusFilter === 'alle' && (
              <button onClick={handleNew} className="mt-3 text-blue-600 text-sm font-medium hover:underline">
                Jetzt erstellen
              </button>
            )}
          </div>
        ) : (
          <RechnungenTable
            rechnungen={filtered}
            statusColors={STATUS_COLORS}
            statusLabels={STATUS_LABELS}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            formatCHF={formatCHF}
          />
        )}

        {modalOpen && (
          <RechnungModal
            rechnung={editRechnung}
            onClose={() => setModalOpen(false)}
            onSaved={() => { setModalOpen(false); fetchRechnungen() }}
          />
        )}
      </div>
    </div>
  )
}
