"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase"

export type AuthUser = { 
  uid: string;
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: AuthUser | null
  isAuthReady: boolean
  signIn: () => Promise<void>
  logOut: () => Promise<void>
  onboardingCompleted: boolean
  setOnboardingCompleted: (val: boolean) => void
}

const mockUser: AuthUser = {
  uid: "d3b07384-d113-4956-809e-206af520d0e2",
  id: "d3b07384-d113-4956-809e-206af520d0e2",
  email: "dev@example.com",
  displayName: "Dev Teacher",
  photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=dev"
}

const AuthContext = createContext<AuthContextType>({
  user: mockUser,
  isAuthReady: false,
  signIn: async () => {},
  logOut: async () => {},
  onboardingCompleted: true,
  setOnboardingCompleted: () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    const initAuth = async () => {
      // 1. Essayer de récupérer la session actuelle
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser({
          uid: session.user.id,
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || "Dev Teacher"
        })
        setIsAuthReady(true)
      } else {
        // 2. Connexion auto en tâche de fond avec le compte de dev
        try {
          const { data: { session: newSession }, error } = await supabase.auth.signInWithPassword({
            email: 'dev@example.com',
            password: 'password123'
          })
          
          if (newSession?.user) {
            setUser({
              uid: newSession.user.id,
              id: newSession.user.id,
              email: newSession.user.email,
              displayName: newSession.user.user_metadata?.full_name || "Dev Teacher"
            })
          }
        } catch (e) {
          console.error("Auto sign in failed:", e)
        } finally {
          setIsAuthReady(true)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          uid: session.user.id,
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || "Dev Teacher"
        })
      } else {
        setUser(null)
      }
      setIsAuthReady(true)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthReady, 
      signIn: async () => {}, 
      logOut: async () => {}, 
      onboardingCompleted, 
      setOnboardingCompleted: () => {} 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
