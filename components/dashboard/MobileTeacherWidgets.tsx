"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { UserCheck, Target, AlertTriangle, Star, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"
import { collection, onSnapshot, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "@/firebase"
import { useAuth } from "@/components/AuthProvider"

interface Task {
  id: string
  text: string
  completed: boolean
}

interface StudentAlert {
  id: string
  type: "warning" | "success"
  title?: string
  message: string
}

export function MobileTeacherWidgets() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [alerts, setAlerts] = useState<StudentAlert[]>([])

  useEffect(() => {
    if (!user?.uid) return

    // Écoute de la collection "tasks" en temps réel
    const qTasks = query(collection(db, "tasks"), where("teacherId", "==", user.uid))
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]
      setTasks(tasksData)
    })

    // Écoute de la collection "student_alerts" en temps réel
    const qAlerts = query(collection(db, "student_alerts"), where("teacherId", "==", user.uid))
    const unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudentAlert[]
      setAlerts(alertsData)
    })

    return () => {
      unsubscribeTasks()
      unsubscribeAlerts()
    }
  }, [user?.uid])

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const progressWidth = totalCount === 0 ? 0 : (completedCount / totalCount) * 100

  const toggleTask = async (id: string, currentCompleted: boolean) => {
    try {
      const taskRef = doc(db, "tasks", id)
      await updateDoc(taskRef, {
        completed: !currentCompleted
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche :", error)
    }
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Section 1 : Appel Express */}
      <Link href="/classes/attendance" className="block outline-none">
        <motion.div 
          whileTap={{ scale: 0.97 }}
          className="relative bg-emerald-400 border-b-4 border-emerald-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-sm active:border-b-0 active:translate-y-1 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Faire l&apos;appel</h3>
              <p className="text-emerald-50 font-medium text-sm">5ème AP - Français (Maintenant)</p>
            </div>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500/50 px-2 py-1 rounded-lg border border-emerald-300/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">En cours</span>
          </div>
        </motion.div>
      </Link>

      {/* Section 2 : Quêtes du Jour */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-pink-100 p-2 rounded-xl">
              <Target className="w-5 h-5 text-pink-500" />
            </div>
            <h3 className="font-black text-slate-800 text-lg">Objectifs</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400">{completedCount}/{totalCount}</span>
            <div className="w-16 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressWidth}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {tasks.length > 0 ? tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id, !!task.completed)}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div className="mt-0.5 shrink-0">
                {task.completed ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                  </motion.div>
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 group-hover:text-slate-400 transition-colors" />
                )}
              </div>
              <span className={`text-sm font-medium transition-colors ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {task.text}
              </span>
            </div>
          )) : (
            <div className="text-center py-2">
              <p className="text-sm font-medium text-slate-400">Aucune quête pour le moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 3 : Radar Élèves */}
      <div className="flex flex-col gap-2">
        <h3 className="font-black text-slate-800 text-sm px-1">Radar Élèves</h3>
        <div className="flex flex-row overflow-x-auto gap-3 pb-2 px-1 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {alerts.length > 0 ? alerts.map((alert) => (
            <div key={alert.id} className="w-48 shrink-0 snap-start bg-slate-50 border-2 border-slate-100 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {alert.type === "success" ? (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                )}
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {alert.title || (alert.type === "success" ? "Bravo" : "Attention")}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 leading-tight">
                {alert.message}
              </p>
            </div>
          )) : (
            <div className="w-48 shrink-0 snap-start bg-slate-50 border-2 border-slate-100/50 rounded-xl p-3 flex flex-col items-center justify-center min-h-[80px]">
              <p className="text-xs font-medium text-slate-400">Rien à signaler</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
