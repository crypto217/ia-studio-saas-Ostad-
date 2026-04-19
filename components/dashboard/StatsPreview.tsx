"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, BookOpen, AlertTriangle } from "lucide-react"
import { motion } from "motion/react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

export function StatsPreview() {
  const [stats, setStats] = useState({
    averageScore: 0,
    totalStudents: 0,
    studentsInDifficulty: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthReady } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthReady || !user) return

      try {
        const studentsQuery = query(collection(db, "students"), where("teacherId", "==", user.uid))
        const snapshot = await getDocs(studentsQuery)
        
        let totalScore = 0
        let scoreCount = 0
        let difficultyCount = 0
        
        snapshot.forEach(doc => {
          const student = doc.data()
          if (student.score !== undefined) {
            totalScore += student.score
            scoreCount++
            if (student.score < 10) {
              difficultyCount++
            }
          }
        })
        
        setStats({
          averageScore: scoreCount > 0 ? Number((totalScore / scoreCount).toFixed(1)) : 0,
          totalStudents: snapshot.size,
          studentsInDifficulty: difficultyCount
        })
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "students")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [user, isAuthReady])

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-slate-100 border-0 h-[120px] animate-pulse rounded-[2rem] sm:rounded-3xl"></Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-3">
      <Card className="relative overflow-hidden bg-emerald-500 text-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 rounded-[2rem] sm:rounded-3xl">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <CardContent className="p-6 sm:p-8 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white text-emerald-500 shadow-sm shrink-0">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              >
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7" />
              </motion.div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-emerald-100 uppercase tracking-wider">Moyenne Générale</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.averageScore}<span className="text-base sm:text-lg font-bold text-emerald-200">/20</span></h3>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="text-emerald-900 bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl shadow-sm">Global</span>
            <span className="text-emerald-100">Toutes classes</span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-violet-500 text-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 rounded-[2rem] sm:rounded-3xl">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <CardContent className="p-6 sm:p-8 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white text-violet-500 shadow-sm shrink-0">
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <Users className="h-6 w-6 sm:h-7 sm:w-7" />
              </motion.div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-violet-100 uppercase tracking-wider">Effectif Total</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.totalStudents}</h3>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="text-violet-900 bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl shadow-sm">Élèves</span>
            <span className="text-violet-100">Inscrits</span>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-rose-500 text-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 rounded-[2rem] sm:rounded-3xl">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <CardContent className="p-6 sm:p-8 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm shrink-0">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7" />
              </motion.div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-rose-100 uppercase tracking-wider">Élèves en Difficulté</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.studentsInDifficulty}</h3>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="text-rose-900 bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl shadow-sm">Moyenne &lt; 10</span>
            <span className="text-rose-100">À surveiller</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
