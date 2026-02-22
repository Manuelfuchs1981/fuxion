import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
