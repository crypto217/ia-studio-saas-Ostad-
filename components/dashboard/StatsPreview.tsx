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
    studentsInDifficulty: 0,
    totalClasses: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthReady } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthReady || !user) return

      try {
        const studentsQuery = query(collection(db, "students"), where("teacherId", "==", user.uid))
        const classesQuery = query(collection(db, "classes"), where("teacherId", "==", user.uid))
        
        const [snapshot, classesSnapshot] = await Promise.all([
          getDocs(studentsQuery),
          getDocs(classesQuery)
        ])
        
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
        
        let localClassesCount = classesSnapshot.size
        try {
          const savedLocal = localStorage.getItem('ostad_mock_classes')
          if (savedLocal) {
            localClassesCount = JSON.parse(savedLocal).length
          } else {
             // Default length based on our mockup
             localClassesCount = 4
          }
        } catch(e) {}
        
        setStats({
          averageScore: scoreCount > 0 ? Number((totalScore / scoreCount).toFixed(1)) : 0,
          totalStudents: snapshot.size,
          studentsInDifficulty: difficultyCount,
          totalClasses: localClassesCount
        })
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "dashboard_stats")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [user, isAuthReady])

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="bg-slate-100 border-0 h-[100px] sm:h-[130px] animate-pulse rounded-2xl sm:rounded-3xl"></Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pb-2 sm:pb-0">
      
      {/* Effectif (Statistiques -> Bleu) */}
      <Card className="bg-blue-600 border-0 shadow-md rounded-2xl sm:rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <CardContent className="p-3 sm:p-6 flex flex-col justify-between h-full gap-2 sm:gap-3 relative z-10">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-blue-100 uppercase tracking-wider">Effectif</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stats.totalStudents}</h3>
            </div>
            <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 shadow-sm text-white backdrop-blur-md border border-white/20">
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <Users className="h-5 w-5 sm:h-7 sm:w-7" />
              </motion.div>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg bg-white/20 text-white shadow-sm backdrop-blur-md">Total</span>
            <span className="text-[10px] sm:text-xs font-medium text-blue-100">Élèves inscrits</span>
          </div>
        </CardContent>
      </Card>

      {/* Moyenne (Progression -> Vert) */}
      <Card className="bg-emerald-500 border-0 shadow-md rounded-2xl sm:rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <CardContent className="p-3 sm:p-6 flex flex-col justify-between h-full gap-2 sm:gap-3 relative z-10">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-emerald-100 uppercase tracking-wider">Moyenne</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stats.averageScore}<span className="text-sm sm:text-lg font-bold text-emerald-200">/20</span></h3>
            </div>
            <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 shadow-sm text-white backdrop-blur-md border border-white/20">
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              >
                <TrendingUp className="h-5 w-5 sm:h-7 sm:w-7" />
              </motion.div>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg bg-white/20 text-white shadow-sm backdrop-blur-md">Global</span>
            <span className="text-[10px] sm:text-xs font-medium text-emerald-100">Toutes classes</span>
          </div>
        </CardContent>
      </Card>

      {/* Difficultés (Erreurs -> Rouge) */}
      <Card className="bg-rose-500 border-0 shadow-md rounded-2xl sm:rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <CardContent className="p-3 sm:p-6 flex flex-col justify-between h-full gap-2 sm:gap-3 relative z-10">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-rose-100 uppercase tracking-wider">Difficulté</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stats.studentsInDifficulty}</h3>
            </div>
            <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 shadow-sm text-white backdrop-blur-md border border-white/20">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <AlertTriangle className="h-5 w-5 sm:h-7 sm:w-7" />
              </motion.div>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg bg-white/20 text-white shadow-sm backdrop-blur-md">&lt; 10/20</span>
            <span className="text-[10px] sm:text-xs font-medium text-rose-100 hidden sm:inline-block">À surveiller</span>
          </div>
        </CardContent>
      </Card>

      {/* Groupes/Classes (Structure -> Violet) */}
      <Card className="bg-violet-600 border-0 shadow-md rounded-2xl sm:rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <CardContent className="p-3 sm:p-6 flex flex-col justify-between h-full gap-2 sm:gap-3 relative z-10">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-violet-100 uppercase tracking-wider">Classes</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stats.totalClasses}</h3>
            </div>
            <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/20 shadow-sm text-white backdrop-blur-md border border-white/20">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <BookOpen className="h-5 w-5 sm:h-7 sm:w-7" />
              </motion.div>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg bg-white/20 text-white shadow-sm backdrop-blur-md">Total</span>
            <span className="text-[10px] sm:text-xs font-medium text-violet-100 hidden sm:inline-block">Groupes gérés</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
