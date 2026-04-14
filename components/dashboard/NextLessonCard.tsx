"use client"

import { useState, useEffect } from "react"
import { Clock, MapPin, Users, Star, Circle, Sparkles, BookOpen } from "lucide-react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore"
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
      if (!isAuthReady || !user) return

      try {
        // In a real app, we would filter by current day and time.
        // For now, just get the first lesson sorted by day and start time.
        const q = query(
          collection(db, "lessons"),
          where("teacherId", "==", user.uid),
          orderBy("day"),
          orderBy("start"),
          limit(1)
        )
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          const lessonDoc = snapshot.docs[0]
          const lessonData = lessonDoc.data()
          
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
            id: lessonDoc.id,
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
      <Card className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/20 border-0 rounded-[2rem] h-[280px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </Card>
    )
  }

  if (!nextLesson) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl border-0 rounded-[2rem] h-[280px] flex flex-col items-center justify-center text-center p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white/50 mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black tracking-tight mb-2">Aucun cours prévu</h2>
        <p className="text-slate-400 font-medium max-w-[300px]">
          Ajoutez vos cours dans le planning pour voir votre prochain cours ici.
        </p>
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
    <Card className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/20 border-0 rounded-[2rem] group">
      {/* Premium Glass Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

      {/* Playful Floating Background Elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }} 
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute -right-8 -top-8 text-white/10 blur-[2px]"
      >
        <Star className="h-48 w-48 fill-current" />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 30, 0], x: [0, 15, 0] }} 
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-12 -left-12 text-white/10 blur-[1px]"
      >
        <Circle className="h-56 w-56 fill-current" />
      </motion.div>
      
      <CardHeader className="relative z-10 pb-2 px-5 sm:px-8 pt-6 sm:pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-white/20">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </div>
            <span className="text-xs sm:text-sm font-black tracking-wide text-white uppercase drop-shadow-sm">
              Prochainement
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-black/20 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
            <Clock className="h-4 w-4 text-sky-200" />
            <span className="tracking-wide">{startTimeStr} - {endTimeStr}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 px-5 sm:px-8 pb-6 sm:pb-8">
        <div className="mt-4 sm:mt-6 space-y-2">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="bg-white/20 border border-white/30 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl backdrop-blur-md shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" /> Prochain Cours
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-lg leading-none">{nextLesson.taskType}</h2>
          <p className="text-sky-100 font-medium text-sm sm:text-lg mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.8)]" /> {nextLesson.title}
          </p>
        </div>
        
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4">
          {/* Class Box */}
          <div className="relative overflow-hidden flex items-center gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-4 rounded-2xl border border-white/20 shadow-xl transition-all duration-300 w-full sm:w-auto group/box">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/box:translate-x-[100%] transition-transform duration-1000" />
            <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-3 rounded-xl shadow-lg shadow-pink-500/30 relative z-10">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-[10px] sm:text-xs text-sky-100 uppercase tracking-widest font-black mb-0.5">Classe</span>
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">{nextLesson.className} <span className="opacity-75 font-medium text-xs sm:text-sm">({nextLesson.studentCount} élèves)</span></span>
            </div>
          </div>

          {/* Room Box */}
          <div className="relative overflow-hidden flex items-center gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-4 rounded-2xl border border-white/20 shadow-xl transition-all duration-300 w-full sm:w-auto group/box">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/box:translate-x-[100%] transition-transform duration-1000" />
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-xl shadow-lg shadow-emerald-500/30 relative z-10">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-[10px] sm:text-xs text-sky-100 uppercase tracking-widest font-black mb-0.5">Salle</span>
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">Salle de classe</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
