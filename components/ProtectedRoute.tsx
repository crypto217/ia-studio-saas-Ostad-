"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isAuthReady && !user && pathname !== "/login") {
      router.push("/login")
    }
  }, [user, isAuthReady, router, pathname])

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // If not logged in and trying to access a protected route, don't render anything while redirecting
  if (!user && pathname !== "/login") {
    return null
  }

  return <>{children}</>
}
