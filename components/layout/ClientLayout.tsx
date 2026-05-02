"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AIMagicHub } from '@/components/ui/AIMagicHub'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/onboarding"
  const isDashboard = pathname === "/"

  if (isAuthPage) {
    return (
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-5 pb-24 md:pb-5">
            <div className="mx-auto max-w-7xl h-full">
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
