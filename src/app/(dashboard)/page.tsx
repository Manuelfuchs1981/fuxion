import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // TODO: Echte Daten aus Supabase holen
  // const { data: rechnungen } = await supabase.from('rechnungen').select('*')

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Willkommen zurück, {user?.email?.split('@')[0]}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Offene Rechnungen', value: 'CHF 55\'300', sub: '8 ausstehend', color: 'text-slate-900' },
          { label: 'Überfällig',        value: 'CHF 11\'750', sub: '2 Rechnungen',  color: 'text-red-600'   },
          { label: 'Umsatz YTD',        value: 'CHF 99\'300', sub: '+12% vs Vorjahr',color: 'text-slate-900'},
          { label: 'Nicht verbucht',    value: '7',           sub: 'Transaktionen', color: 'text-amber-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {kpi.label}
            </div>
            <div className={`font-mono text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-slate-400 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Placeholder für Charts / Aktivität */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Letzte Rechnungen</h2>
          <div className="text-sm text-slate-400 text-center py-8">
            Daten werden aus Supabase geladen…
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Offene Transaktionen</h2>
          <div className="text-sm text-slate-400 text-center py-8">
            Daten werden aus Supabase geladen…
          </div>
        </div>
      </div>
    </div>
  )
}
