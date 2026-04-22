"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { AlertTriangle, Star } from "lucide-react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/firebase"
import { useAuth } from "@/components/AuthProvider"
import { TasksPanel } from "./TasksPanel"

interface StudentAlert {
  id: string
  type: "warning" | "success"
  title?: string
  message: string
}

export function MobileTeacherWidgets() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<StudentAlert[]>([])

  useEffect(() => {
    if (!user?.uid) return

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
      unsubscribeAlerts()
    }
  }, [user?.uid])

  return (
    <div className="flex flex-col gap-6 mb-6">
      {/* Todo List - Tasks Panel component repurposed for mobile */}
      <div className="w-full">
        <TasksPanel />
      </div>

      {/* Section 3 : Radar Élèves */}
      <div className="flex flex-col gap-2">
        <h3 className="font-black text-slate-800 text-sm px-1">Radar Élèves</h3>
        <div className="-mx-4 px-4 flex flex-row overflow-x-auto gap-3 pb-2 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {alerts.length > 0 ? alerts.map((alert) => {
            // Apply Erreurs -> Rouge/Rose, Success -> Jaune/Amber
            const isWarning = alert.type !== "success";
            const bgClass = isWarning ? "bg-rose-50 border-rose-100" : "bg-amber-50 border-amber-100";
            const iconColor = isWarning ? "text-rose-500" : "text-amber-500 fill-amber-500";
            const titleColor = isWarning ? "text-rose-800" : "text-amber-800";
            const textColor = isWarning ? "text-rose-700/80" : "text-amber-700/80";

            return (
              <div key={alert.id} className={`w-48 shrink-0 snap-start border rounded-2xl p-3 flex flex-col gap-2 shadow-sm ${bgClass}`}>
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1.5 rounded-lg shadow-sm">
                    {isWarning ? (
                      <AlertTriangle className={`w-4 h-4 ${iconColor}`} />
                    ) : (
                      <Star className={`w-4 h-4 ${iconColor}`} />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${titleColor}`}>
                    {alert.title || (isWarning ? "Attention" : "Bravo")}
                  </span>
                </div>
                <p className={`text-xs font-semibold leading-tight mt-1 ${textColor}`}>
                  {alert.message}
                </p>
              </div>
            );
          }) : (
            <div className="w-48 shrink-0 snap-start bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-center min-h-[90px] shadow-sm">
              <p className="text-xs font-medium text-slate-400">Rien à signaler</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
