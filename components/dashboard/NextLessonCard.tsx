"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, MapPin, Users, Star, Circle, Sparkles, BookOpen } from "lucide-react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

type Lesson = {
  id: string
  title: string
  taskType: string
  classId: string
  className?: string
  studentCount?: number
  start: number
  duration: number
}

export function NextLessonCard() {
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthReady } = useAuth()

  useEffect(() => {
    const fetchNextLesson = async () => {
      if (!isAuthReady || !user?.uid) return

      try {
        // En vrai: filtrer par jour (actuel ou après) et trier par début
        const q = query(
          collection(db, "lessons"),
          where("teacherId", "==", user.uid),
          orderBy("day", "asc"),
          orderBy("start", "asc")
        )
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          const now = new Date()
          const currentDay = now.getDay() // 0 = Dimanche, 1 = Lundi, etc.
          const currentHour = now.getHours() + now.getMinutes() / 60

          let upcomingLessonDoc = null

          // Chercher le prochain cours d'aujourd'hui
          for (const doc of snapshot.docs) {
            const data = doc.data()
            if (data.day === currentDay && data.start + data.duration > currentHour) {
              upcomingLessonDoc = doc
              break
            }
          }

          // Si plus de cours aujourd'hui, prendre le premier cours du jour suivant disponible
          if (!upcomingLessonDoc) {
             for (const doc of snapshot.docs) {
               const data = doc.data()
               if (data.day !== currentDay) { // simplifie on prend les jours qui suivent vu qu'on a trié
                 upcomingLessonDoc = doc
                 break
               }
             }
          }

          // Si c'est très vide, on retourne à rien
          if (!upcomingLessonDoc) {
             setNextLesson(null)
             setIsLoading(false)
             return
          }
          
          const lessonData = upcomingLessonDoc.data()
          
          let className = "Classe"
          let studentCount = 0

          // Fetch class details
          if (lessonData.classId) {
            try {
              const classDocRef = doc(db, "classes", lessonData.classId)
              const classDocSnap = await getDoc(classDocRef)
              if (classDocSnap.exists()) {
                className = classDocSnap.data().name
              }

              const studentsQuery = query(
                collection(db, "students"), 
                where("classId", "==", lessonData.classId),
                where("teacherId", "==", user.uid)
              )
              const studentsSnapshot = await getDocs(studentsQuery)
              studentCount = studentsSnapshot.size
            } catch (e) {
              console.error("Error fetching class details for lesson", e)
            }
          }

          setNextLesson({
            id: upcomingLessonDoc.id,
            title: lessonData.title,
            taskType: lessonData.taskType,
            classId: lessonData.classId,
            className,
            studentCount,
            start: lessonData.start,
            duration: lessonData.duration
          })
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "lessons")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNextLesson()
  }, [user, isAuthReady])

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 text-white shadow-sm border-0 rounded-[2rem] sm:rounded-3xl h-[280px] flex items-center justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </Card>
    )
  }

  if (!nextLesson) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-sm border-0 rounded-[2rem] sm:rounded-3xl h-[280px] flex flex-col items-center justify-center text-center p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white/50 mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-2">Plus de cours aujourd&apos;hui !</h2>
        <p className="text-slate-400 font-medium max-w-[300px]">
          Ajoutez vos cours dans le planning pour voir votre prochain créneau ici.
        </p>
        <Link href="/schedule" className="mt-6 outline-none block">
           <motion.div
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="w-full flex items-center justify-center bg-white text-slate-800 border-b-4 border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-xl px-6 py-2 shadow-xl transition-colors cursor-pointer font-bold text-sm"
           >
             Voir mon Planning
           </motion.div>
        </Link>
      </Card>
    )
  }

  // Format time (e.g., 9 -> "09:00", 9.5 -> "09:30")
  const formatTime = (time: number) => {
    const hours = Math.floor(time)
    const minutes = Math.round((time - hours) * 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const startTimeStr = formatTime(nextLesson.start)
  const endTimeStr = formatTime(nextLesson.start + nextLesson.duration)

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 text-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 rounded-[2rem] sm:rounded-3xl group min-h-[300px] flex flex-col justify-between">
      {/* Premium Glass Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

      {/* Playful Floating Background Elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }} 
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute -right-8 -top-8 text-white/10 blur-[2px] pointer-events-none"
      >
        <Star className="h-48 w-48 fill-current" />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 30, 0], x: [0, 15, 0] }} 
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-12 -left-12 text-white/10 blur-[1px] pointer-events-none"
      >
        <Circle className="h-56 w-56 fill-current" />
      </motion.div>
      
      <CardHeader className="relative z-10 p-4 sm:p-5 pb-0 sm:pb-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-white/20">
            <div className="relative flex h-1.5 w-1.5 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 bg-white"></span>
            </div>
            <span className="text-[9px] sm:text-xs font-black tracking-wide text-white uppercase drop-shadow-sm">
              Prochainement
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold bg-black/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-sky-200" />
            <span className="tracking-wide">{startTimeStr} - {endTimeStr}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 p-4 sm:p-5 pt-2 flex-1 flex flex-col justify-end">
        <div className="space-y-1 sm:space-y-2 mt-2 sm:mt-4">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="bg-white/20 border border-white/30 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl backdrop-blur-md shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" /> Prochain Cours
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-lg leading-none">{nextLesson.taskType}</h2>
          <p className="text-sky-100 font-medium text-sm sm:text-base flex items-center gap-2 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.8)] shrink-0" /> 
            <span className="truncate">{nextLesson.title}</span>
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6">
          {/* Class Box */}
          <div className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/20 shadow-xl transition-all duration-300 group/box">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/box:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
            <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg shadow-pink-500/30 relative z-10 shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex flex-col relative z-10 min-w-0 w-full">
              <span className="text-[10px] text-sky-100 uppercase tracking-widest font-black mb-0.5">Classe</span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">{nextLesson.className}</span>
              <span className="opacity-75 font-medium text-[10px] sm:text-xs truncate">{nextLesson.studentCount} élèves</span>
            </div>
          </div>

          {/* Room Box */}
          <div className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/20 shadow-xl transition-all duration-300 group/box">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/box:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg shadow-emerald-500/30 relative z-10 shrink-0">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex flex-col relative z-10 min-w-0 w-full">
              <span className="text-[10px] text-sky-100 uppercase tracking-widest font-black mb-0.5">Salle</span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">Salle de classe</span>
            </div>
          </div>
        </div>

        {/* Action Button: Démarrer le cours */}
        <div className="mt-4 sm:mt-6 flex sm:justify-end">
          <Link href="/live-session/1" className="w-full sm:w-auto outline-none block">
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-center bg-white text-indigo-600 border-b-4 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-xl transition-colors cursor-pointer"
              >
                <span className="font-black text-sm sm:text-base uppercase tracking-wide">Démarrer le cours 🚀</span>
              </motion.div>
            </motion.div>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

