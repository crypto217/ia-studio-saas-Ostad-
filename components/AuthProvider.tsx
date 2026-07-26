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

const AuthContext = createContext<AuthContextType>({
  user: null,
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

  const mapSupabaseUser = (sbUser: any): AuthUser => {
    const name = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || "Professeur"
    const photo = sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${sbUser.id}`
    return {
      uid: sbUser.id,
      id: sbUser.id,
      email: sbUser.email,
      displayName: name,
      photoURL: photo
    }
  }

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .maybeSingle()

      if (data && typeof data.onboarding_completed === 'boolean') {
        setOnboardingCompleted(data.onboarding_completed)
      } else {
        setOnboardingCompleted(true)
      }
    } catch (e) {
      console.error("Error checking onboarding status:", e)
      setOnboardingCompleted(true)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(mapSupabaseUser(session.user))
          await checkOnboardingStatus(session.user.id)
        } else {
          setUser(null)
        }
      } catch (e) {
        console.error("Init auth error:", e)
        setUser(null)
      } finally {
        setIsAuthReady(true)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
        await checkOnboardingStatus(session.user.id)
      } else {
        setUser(null)
      }
      setIsAuthReady(true)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined
        }
      })
    } catch (err) {
      console.error("Google signIn error:", err)
    }
  }

  const logOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthReady, 
      signIn, 
      logOut, 
      onboardingCompleted, 
      setOnboardingCompleted: (val: boolean) => setOnboardingCompleted(val)
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
