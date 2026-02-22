'use client'

import { Rechnung, RechnungStatus } from '@/types/database'
import { MoreVertical, Pencil, Trash2, CheckCircle, Send } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface Props {
  rechnungen: Rechnung[]
  statusColors: Record<RechnungStatus, string>
  statusLabels: Record<RechnungStatus, string>
  formatCHF: (n: number) => string
  onEdit: (r: Rechnung) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: RechnungStatus) => void
}

export default function RechnungenTable({
  rechnungen, statusColors, statusLabels, formatCHF, onEdit, onDelete, onStatusChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Nummer</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Kunde</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Fällig</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Betrag</th>
            <th className="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rechnungen.map(r => (
            <RechnungRow
              key={r.id}
              rechnung={r}
              statusColors={statusColors}
              statusLabels={statusLabels}
              formatCHF={formatCHF}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RechnungRow({
  rechnung: r, statusColors, statusLabels, formatCHF, onEdit, onDelete, onStatusChange,
}: { rechnung: Rechnung } & Omit<Props, 'rechnungen'>) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('de-CH') : '—'

  const isOverdue =
    r.status === 'gesendet' &&
    r.faelligkeitsdatum &&
    new Date(r.faelligkeitsdatum) < new Date()

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 font-mono text-gray-900 font-medium">{r.nummer}</td>
      <td className="px-4 py-3 text-gray-700">{r.kontakt_name}</td>
      <td className="px-4 py-3 text-gray-500">{formatDate(r.datum)}</td>
      <td className={`px-4 py-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
        {formatDate(r.faelligkeitsdatum)}
        {isOverdue && <span className="ml-1 text-xs">⚠</span>}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
          {statusLabels[r.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-medium text-gray-900">
        {formatCHF(r.bruttobetrag)}
      </td>
      <td className="px-4 py-3">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-48 py-1">
              <button
                onClick={() => { onEdit(r); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="w-4 h-4" /> Bearbeiten
              </button>
              {r.status === 'entwurf' && (
                <button
                  onClick={() => { onStatusChange(r.id, 'gesendet'); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                >
                  <Send className="w-4 h-4" /> Als gesendet markieren
                </button>
              )}
              {(r.status === 'gesendet' || r.status === 'überfällig') && (
                <button
                  onClick={() => { onStatusChange(r.id, 'bezahlt'); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-gray-50"
                >
                  <CheckCircle className="w-4 h-4" /> Als bezahlt markieren
                </button>
              )}
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => { onDelete(r.id); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" /> Löschen
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
