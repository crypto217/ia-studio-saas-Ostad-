"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady, onboardingCompleted } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isAuthReady) {
      if (!user && pathname !== "/login") {
        router.push("/login")
      } else if (user && !onboardingCompleted && pathname !== "/onboarding") {
        router.push("/onboarding")
      }
    }
  }, [user, isAuthReady, onboardingCompleted, router, pathname])

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Prevent rendering protected routes while redirecting
  if (!user && pathname !== "/login") {
    return null
  }
  
  if (user && !onboardingCompleted && pathname !== "/onboarding") {
    return null
  }

  return <>{children}</>
}
