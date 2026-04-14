"use client"

import { useState, useEffect } from "react"
import { FileText, CheckCircle, Calendar as CalendarIcon, ClipboardList, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

type ActivityItem = {
  id: string
  title: string
  description: string
  type: "grade" | "document" | "schedule" | "task"
  createdAt: string
}

const typeStyles = {
  grade: {
    icon: CheckCircle,
    cardBg: "bg-emerald-400",
    cardBorder: "border-emerald-500",
    iconText: "text-emerald-500",
    titleText: "text-emerald-950",
    descText: "text-emerald-800",
    timeBg: "bg-emerald-300",
    timeText: "text-emerald-900",
  },
  document: {
    icon: FileText,
    cardBg: "bg-sky-400",
    cardBorder: "border-sky-500",
    iconText: "text-sky-500",
    titleText: "text-sky-950",
    descText: "text-sky-800",
    timeBg: "bg-sky-300",
    timeText: "text-sky-900",
  },
  schedule: {
    icon: CalendarIcon,
    cardBg: "bg-amber-400",
    cardBorder: "border-amber-500",
    iconText: "text-amber-500",
    titleText: "text-amber-950",
    descText: "text-amber-800",
    timeBg: "bg-amber-300",
    timeText: "text-amber-900",
  },
  task: {
    icon: ClipboardList,
    cardBg: "bg-indigo-400",
    cardBorder: "border-indigo-500",
    iconText: "text-indigo-500",
    titleText: "text-indigo-950",
    descText: "text-indigo-800",
    timeBg: "bg-indigo-300",
    timeText: "text-indigo-900",
  }
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthReady } = useAuth()

  useEffect(() => {
    const fetchActivities = async () => {
      if (!isAuthReady || !user) return

      try {
        const q = query(
          collection(db, "activities"),
          where("teacherId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        )
        const snapshot = await getDocs(q)
        
        const activitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ActivityItem[]
        
        setActivities(activitiesData)
      } catch (error) {
        // Fallback if index is missing
        try {
          const fallbackQ = query(collection(db, "activities"), where("teacherId", "==", user.uid))
          const snapshot = await getDocs(fallbackQ)
          const activitiesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ActivityItem[]
          
          const sorted = activitiesData
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            
          setActivities(sorted)
        } catch (fallbackError) {
          handleFirestoreError(fallbackError, OperationType.GET, "activities")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [user, isAuthReady])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "À l'instant"
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 172800) return "Hier"
    return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
  }

  if (isLoading) {
    return (
      <Card className="border border-slate-200 bg-white h-[350px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </Card>
    )
  }

  return (
    <Card className="border border-slate-200 bg-white h-full flex flex-col">
      <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-xl sm:text-2xl font-black text-slate-800">Activité Récente</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 flex-1 flex flex-col">
        {activities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <Activity className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-600">Aucune activité récente</p>
            <p className="text-xs text-slate-400 mt-1">Vos actions apparaîtront ici.</p>
          </div>
        ) : (
          <div className="relative space-y-4 sm:space-y-6 before:absolute before:inset-0 before:ml-5 sm:before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1.5 sm:before:w-2 before:bg-slate-100 before:rounded-full">
            {activities.map((activity) => {
              const style = typeStyles[activity.type] || typeStyles.document
              const Icon = style.icon
              return (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white bg-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                    <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${style.iconText}`} />
                  </div>
                  <div className={`w-[calc(100%-3.5rem)] sm:w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-3 sm:p-4 rounded-2xl border ${style.cardBorder} ${style.cardBg} shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 sm:mb-2 gap-1 sm:gap-2">
                      <h4 className={`text-sm sm:text-base font-black ${style.titleText}`}>{activity.title}</h4>
                      <span className={`text-[10px] sm:text-xs font-bold ${style.timeText} ${style.timeBg} px-2 py-0.5 sm:py-1 rounded-lg w-fit`}>
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm font-bold ${style.descText}`}>{activity.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
