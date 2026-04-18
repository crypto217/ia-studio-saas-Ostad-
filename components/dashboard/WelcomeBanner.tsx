"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { Sparkles, BookOpen, Star, Pencil, Heart } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"

export function WelcomeBanner() {
  const { user, isAuthReady } = useAuth()
  const [tasksCount, setTasksCount] = useState(0)
  const [classesCount, setClassesCount] = useState(0)

  useEffect(() => {
    if (!isAuthReady || !user?.uid) return

    const tasksQuery = query(
      collection(db, "tasks"), 
      where("teacherId", "==", user.uid)
    )
    
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      // Extraction explicite du tableau de données comme demandé
      const tasksData = snapshot.docs.map(doc => doc.data())
      const pendingTasks = tasksData.filter(task => task.completed === false)
      setTasksCount(pendingTasks.length)
    })

    const classesQuery = query(
      collection(db, "classes"), 
      where("teacherId", "==", user.uid)
    )
    
    const unsubscribeClasses = onSnapshot(classesQuery, (snapshot) => {
      // Utilisation du tableau récupéré pour la propriété .length
      const classesData = snapshot.docs.map(doc => doc.data())
      setClassesCount(classesData.length)
    })

    return () => {
      unsubscribeTasks()
      unsubscribeClasses()
    }
  }, [user, isAuthReady])

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-indigo-500 px-5 py-6 md:px-8 md:py-10 text-white shadow-sm border border-indigo-600 flex items-center justify-between">
      {/* Background decorative blobs */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-indigo-700/30 blur-3xl" />

      {/* Left Content */}
      <div className="relative z-10 max-w-xl w-full">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 md:mb-4 tracking-tight flex items-center gap-2 md:gap-3">
          Bonjour, Professeur ! 
          <motion.span 
            className="inline-block origin-bottom-right"
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
          >
            👋
          </motion.span>
        </h1>
        <motion.p 
          initial="rest"
          whileHover="hover"
          className="text-indigo-100 font-semibold mb-5 md:mb-8 text-sm sm:text-base md:text-lg leading-relaxed cursor-default"
        >
          Vous avez <span className="relative text-amber-950 font-black bg-amber-400 px-2 py-0.5 md:px-3 md:py-1 rounded-xl shadow-sm inline-block -rotate-1 hover:rotate-0 transition-transform">
            <span className="relative z-10">{tasksCount} tâche{tasksCount > 1 ? 's' : ''}</span>
            <motion.svg 
              className="absolute -bottom-2 -left-1 w-[110%] h-4 text-red-500 z-20 overflow-visible" 
              viewBox="0 0 100 20" 
              preserveAspectRatio="none"
            >
              <motion.path 
                d="M 0 15 Q 25 25 50 15 T 100 15" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="6" 
                strokeLinecap="round"
                variants={{
                  rest: { pathLength: 0, opacity: 0 },
                  hover: { pathLength: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
                }}
              />
            </motion.svg>
          </span> et <span className="relative text-emerald-950 font-black bg-emerald-400 px-2 py-0.5 md:px-3 md:py-1 rounded-xl shadow-sm inline-block rotate-1 hover:rotate-0 transition-transform">
            <span className="relative z-10">{classesCount} classe{classesCount > 1 ? 's' : ''}</span>
            <motion.svg 
              className="absolute -bottom-2 -left-1 w-[110%] h-4 text-red-500 z-20 overflow-visible rotate-2" 
              viewBox="0 0 100 20" 
              preserveAspectRatio="none"
            >
              <motion.path 
                d="M 0 10 Q 50 25 100 10" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="6" 
                strokeLinecap="round"
                variants={{
                  rest: { pathLength: 0, opacity: 0 },
                  hover: { pathLength: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.2 } }
                }}
              />
            </motion.svg>
          </span> aujourd&apos;hui. C&apos;est une belle journée pour inspirer vos élèves !
        </motion.p>
        <Button asChild variant="white" className="text-indigo-600 hover:bg-indigo-50 border-b-4 border-indigo-200 font-bold text-sm md:text-base px-6 md:px-8 h-12 rounded-xl md:rounded-2xl w-full sm:w-auto shadow-md">
          <Link href="/planning">
            Voir l&apos;emploi du temps
          </Link>
        </Button>
      </div>

      {/* Right Illustration (Playful CSS/SVG Art) */}
      <div className="absolute right-10 bottom-0 top-0 w-1/3 hidden lg:flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          
          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [-10, 10, -10] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute right-12 top-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 shadow-lg"
          >
            <Star className="h-8 w-8 fill-white text-white" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [10, -5, 10] }} 
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
            className="absolute left-10 bottom-12 flex h-14 w-14 items-center justify-center rounded-full bg-rose-400 shadow-lg"
          >
            <Heart className="h-7 w-7 fill-white text-white" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 2 }}
            className="absolute right-32 bottom-8 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 shadow-lg"
          >
            <Pencil className="h-6 w-6 text-white" />
          </motion.div>

          {/* Centerpiece */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
            className="relative z-10 flex h-32 w-32 items-center justify-center rounded-[2rem] bg-sky-400 shadow-xl"
          >
            <BookOpen className="h-16 w-16 text-white" />
            <div className="absolute -right-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full border-4 border-indigo-500 bg-white shadow-sm">
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
