'use client'

import { Kontakt } from '@/types/database'
import { MoreVertical, Pencil, Trash2, Mail, MapPin } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface Props {
  kontakte: Kontakt[]
  onEdit: (k: Kontakt) => void
  onDelete: (id: string) => void
}

export default function KontakteTable({ kontakte, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Firma / Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Ort</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Land</th>
            <th className="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {kontakte.map(k => (
            <KontaktRow key={k.id} kontakt={k} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function KontaktRow({ kontakt: k, onEdit, onDelete }: {
  kontakt: Kontakt
  onEdit: (k: Kontakt) => void
  onDelete: (id: string) => void
}) {
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

  const displayName = k.firma || `${k.vorname || ''} ${k.nachname || ''}`.trim() || '—'
  const subName = k.firma && (k.vorname || k.nachname)
    ? `${k.vorname || ''} ${k.nachname || ''}`.trim()
    : null

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{displayName}</p>
            {subName && <p className="text-xs text-gray-400">{subName}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-500">
        {k.email ? (
          <a href={`mailto:${k.email}`} className="flex items-center gap-1 hover:text-blue-600">
            <Mail className="w-3.5 h-3.5" />
            {k.email}
          </a>
        ) : '—'}
      </td>
      <td className="px-4 py-3 text-gray-500">
        {k.ort ? (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {k.plz ? `${k.plz} ` : ''}{k.ort}
          </span>
        ) : '—'}
      </td>
      <td className="px-4 py-3 text-gray-500">{k.land || '—'}</td>
      <td className="px-4 py-3">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-40 py-1" style={{bottom: '100%', marginBottom: '4px'}}>
              <button
                onClick={() => { onEdit(k); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="w-4 h-4" /> Bearbeiten
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => { onDelete(k.id); setMenuOpen(false) }}
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
