"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AIMagicHub } from '@/components/ui/AIMagicHub'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"
  const isDashboard = pathname === "/"

  if (isLoginPage) {
    return (
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
        <MobileNav />
        {isDashboard && <AIMagicHub />}
      </div>
    </ProtectedRoute>
  )
}
