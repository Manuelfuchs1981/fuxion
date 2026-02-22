'use client'

import { useState, useEffect, useRef } from 'react'
import { Kontakt } from '@/types/database'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

interface Props {
  kontakte: Kontakt[]
  onEdit: (k: Kontakt) => void
  onDelete: (id: string) => void
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700',
]

export default function KontakteTable({ kontakte, onEdit, onDelete }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [flipUp, setFlipUp] = useState(false)
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.dropdown-wrap')) setOpenId(null)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const toggleMenu = (id: string, btn: HTMLButtonElement) => {
    if (openId === id) { setOpenId(null); return }
    const rect = btn.getBoundingClientRect()
    setFlipUp(window.innerHeight - rect.bottom < 100)
    setOpenId(id)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tl-xl">Firma / Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kundennr.</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ort</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Land</th>
            <th className="rounded-tr-xl w-12"></th>
          </tr>
        </thead>
        <tbody>
          {kontakte.map((k, idx) => {
            const label = k.firma || `${k.vorname || ''} ${k.nachname || ''}`.trim() || '—'
            const sub = k.firma ? `${k.vorname || ''} ${k.nachname || ''}`.trim() : ''
            const color = AVATAR_COLORS[idx % AVATAR_COLORS.length]
            const isOpen = openId === k.id

            return (
              <tr key={k.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${color}`}>
                      {label[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{label}</p>
                      {sub && <p className="text-xs text-gray-400">{sub}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {k.kundennummer
                    ? <span className="font-mono text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">{k.kundennummer}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {k.email ? <a href={`mailto:${k.email}`} className="hover:text-blue-600">{k.email}</a> : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {k.plz || k.ort ? `${k.plz || ''} ${k.ort || ''}`.trim() : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{k.land || '—'}</td>
                <td className="px-4 py-3">
                  <div className="dropdown-wrap relative flex justify-center">
                    <button
                      ref={el => { btnRefs.current[k.id] = el }}
                      onClick={() => toggleMenu(k.id, btnRefs.current[k.id]!)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {isOpen && (
                      <div className={`absolute right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-44 py-1 ${flipUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                        <button
                          onClick={() => { onEdit(k); setOpenId(null) }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Bearbeiten
                        </button>
                        <div className="h-px bg-gray-100 mx-2 my-1" />
                        <button
                          onClick={() => { onDelete(k.id); setOpenId(null) }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Löschen
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
