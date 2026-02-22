'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { href: '/dashboard',               label: 'Dashboard',    icon: 'grid'      },
  { href: '/journal',       label: 'Journal',      icon: 'book'      },
  { href: '/rechnungen',    label: 'Rechnungen',   icon: 'file-text' },
  { href: '/offerten',      label: 'Offerten',     icon: 'clipboard' },
  { href: '/banking',       label: 'Banking',      icon: 'home'      },
  { href: '/reporting',     label: 'Reporting',    icon: 'bar-chart' },
  { href: '/kontakte',      label: 'Kontakte',     icon: 'users'     },
  { href: '/mwst',          label: 'MWST',         icon: 'percent'   },
  { href: '/einstellungen', label: 'Einstellungen',icon: 'settings'  },
]

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    'grid':      <path d="M3 3h7v7H3zM13 3h8v7h-8zM3 13h7v8H3zM13 13h8v8h-8z"/>,
    'book':      <><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 014 17V5a2 2 0 012-2h12a2 2 0 012 2v12"/></>,
    'file-text': <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8"/></>,
    'clipboard': <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></>,
    'home':      <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></>,
    'bar-chart': <><path d="M18 20V10M12 20V4M6 20v-6"/></>,
    'users':     <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    'percent':   <><path d="M9 14l6-6M10 9h.01M15 13h.01M19 5H7a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2z"/></>,
    'settings':  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    'logout':    <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></>,
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] ?? null}
    </svg>
  )
}

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'MM'
  const width = collapsed ? 'w-14' : 'w-[220px]'

  return (
    <aside className={`${width} min-h-screen bg-slate-900 flex flex-col flex-shrink-0 transition-all duration-200`}>

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 min-h-[58px]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <svg width="26" height="24" viewBox="0 0 40 36" fill="none">
              <polygon points="2,0 34,0 30,8 2,8"    fill="white"/>
              <polygon points="2,11 25,11 21,19 2,19" fill="white"/>
              <polygon points="2,22 16,22 12,30 2,30" fill="white"/>
              <polygon points="30,0 40,0 30,10"       fill="#E4572E"/>
            </svg>
            <span className="text-lg font-bold text-white">Fuxion</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/25 hover:text-white/60 transition-colors p-1 rounded"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {collapsed
              ? <path d="M9 18l6-6-6-6"/>
              : <path d="M15 18l-6-6 6-6"/>
            }
          </svg>
        </button>
      </div>

      {/* Tenant */}
      {!collapsed && (
        <div className="mx-2 my-2 bg-white/5 rounded px-3 py-2">
          <div className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">Mandant</div>
          <div className="text-xs text-white font-semibold mt-0.5">Muster GmbH</div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 pt-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm border-l-2 transition-all
                ${collapsed ? 'justify-center px-0' : ''}
                ${isActive
                  ? 'text-white border-[#E4572E] bg-[#E4572E]/10'
                  : 'text-white/40 border-transparent hover:text-white hover:bg-white/5'
                }`}
            >
              <NavIcon name={item.icon} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 px-4 py-2.5 w-full text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all border-l-2 border-transparent ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <NavIcon name="logout" />
          {!collapsed && <span>Abmelden</span>}
        </button>
        <div className={`flex items-center gap-2.5 px-4 py-3 border-t border-white/10 ${collapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-[#E4572E] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div>
              <div className="text-xs text-white font-medium truncate max-w-[130px]">{user.email}</div>
              <div className="text-[10px] text-white/30">Owner</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
