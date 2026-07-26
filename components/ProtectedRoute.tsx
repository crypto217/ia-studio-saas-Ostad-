"use client"

import { useAuth } from "@/components/AuthProvider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicPage = pathname === "/login" || pathname === "/onboarding"

  useEffect(() => {
    if (isAuthReady && !user && !isPublicPage) {
      router.push("/login")
    }
  }, [user, isAuthReady, isPublicPage, router])

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500">Connexion sécurisée en cours...</p>
        </div>
      </div>
    )
  }

  if (!user && !isPublicPage) {
    return null
  }

  return <>{children}</>
}
