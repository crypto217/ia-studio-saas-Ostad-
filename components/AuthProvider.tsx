"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        try {
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
      }
      
      setIsAuthReady(true)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
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
