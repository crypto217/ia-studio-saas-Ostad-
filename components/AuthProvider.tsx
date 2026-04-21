"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, onIdTokenChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
import { auth, db } from "@/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

interface AuthContextType {
  user: User | null
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
  onboardingCompleted: false,
  setOnboardingCompleted: () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken()
          document.cookie = `__session=${token}; path=/; max-age=3600; secure; samesite=strict`
          
          const userDoc = await getDoc(doc(db, "users", currentUser.uid))
          if (userDoc.exists()) {
            setOnboardingCompleted(userDoc.data().onboardingCompleted || false)
          } else {
            // Create user profile
            await setDoc(doc(db, "users", currentUser.uid), {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              onboardingCompleted: false,
              createdAt: new Date().toISOString()
            })
            setOnboardingCompleted(false)
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`)
        }
      } else {
        document.cookie = `__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`
      }
      
      setIsAuthReady(true)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const token = await result.user.getIdToken(true) // force refresh immediately
      document.cookie = `__session=${token}; path=/; max-age=3600; secure; samesite=strict`
      
      // Wait a tiny bit and verify the cookie is readable to ensure it propagated
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        console.log("Sign-in popup closed by user.")
      } else {
        console.error("Error signing in", error)
      }
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth)
      document.cookie = `__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`
    } catch (error) {
      console.error("Error signing out", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthReady, signIn, logOut, onboardingCompleted, setOnboardingCompleted }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
