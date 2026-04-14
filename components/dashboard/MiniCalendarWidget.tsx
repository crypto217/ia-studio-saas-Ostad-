"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, ChevronRight, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"
import Link from "next/link"

type ScheduleItem = {
  id: string
  time: string
  subject: string
  class: string
  type: string
  start: number
}

export function MiniCalendarWidget() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthReady } = useAuth()

  // Get current date info
  const today = new Date()
  const dateStr = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  // JS getDay(): 0 = Sunday, 1 = Monday. 
  // Assuming the app uses 0 = Monday, 1 = Tuesday, ..., 6 = Sunday for the `day` field
  const jsDay = today.getDay()
  const appDay = jsDay === 0 ? 6 : jsDay - 1

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!isAuthReady || !user) return

      try {
        const q = query(
          collection(db, "lessons"),
          where("teacherId", "==", user.uid),
          where("day", "==", appDay),
          orderBy("start")
        )
        const snapshot = await getDocs(q)
        
        const items: ScheduleItem[] = []
        
        for (const lessonDoc of snapshot.docs) {
          const data = lessonDoc.data()
          
          let className = ""
          if (data.classId) {
            try {
              const classDocRef = doc(db, "classes", data.classId)
              const classDocSnap = await getDoc(classDocRef)
              if (classDocSnap.exists()) {
                className = classDocSnap.data().name
              }
            } catch (e) {
              console.error("Error fetching class name", e)
            }
          }

          const hours = Math.floor(data.start)
          const minutes = Math.round((data.start - hours) * 60)
          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

          items.push({
            id: lessonDoc.id,
            time: timeStr,
            subject: data.title,
            class: className,
            type: data.taskType,
            start: data.start
          })
        }

        setSchedule(items)
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "lessons")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [user, isAuthReady, appDay])

  if (isLoading) {
    return (
      <Card className="border border-slate-200 bg-white h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </Card>
    )
  }

  return (
    <Card className="border border-slate-200 bg-white h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-500">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-slate-800">Aujourd&apos;hui</CardTitle>
            <p className="text-xs font-bold text-slate-400 capitalize">{dateStr}</p>
          </div>
        </div>
        <Button asChild variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
          <Link href="/planning">
            <ChevronRight className="h-5 w-5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        {schedule.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-600">Aucun cours aujourd&apos;hui</p>
            <p className="text-xs text-slate-400 mt-1">Profitez de votre journée !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map((item, index) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-500">{item.time}</span>
                  {index !== schedule.length - 1 && (
                    <div className="w-0.5 h-8 bg-slate-100 mt-1 rounded-full" />
                  )}
                </div>
                <div className={`flex-1 rounded-xl p-3 border ${item.type === 'Pause' ? 'bg-slate-50 border-slate-100' : item.type === 'Évaluation' ? 'bg-rose-50 border-rose-100' : 'bg-sky-50 border-sky-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-sm ${item.type === 'Pause' ? 'text-slate-600' : item.type === 'Évaluation' ? 'text-rose-700' : 'text-sky-700'}`}>{item.subject}</span>
                    {item.class && <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-md text-slate-500 shadow-sm">{item.class}</span>}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
