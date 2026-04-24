"use client"

import { useState, useEffect } from "react"
import { Check, Plus, Clock, AlertCircle, Target, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

type Task = {
  id: string
  teacherId: string
  title: string
  deadline: string
  urgent: boolean
  color: "rose" | "sky" | "amber"
  completed: boolean
  createdAt: string
}

const colorMap = {
  rose: { border: "border-rose-400", icon: "text-rose-500", bg: "bg-rose-50" },
  sky: { border: "border-sky-400", icon: "text-sky-500", bg: "bg-sky-50" },
  amber: { border: "border-amber-400", icon: "text-amber-500", bg: "bg-amber-50" },
}

export function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([])
  const { user, isAuthReady } = useAuth()
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (!isAuthReady || !user) return

    const q = query(collection(db, "tasks"), where("teacherId", "==", user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[]
      
      // Sort by creation date or urgency
      tasksData.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      
      setTasks(tasksData)
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "tasks")
    })

    return () => unsubscribe()
  }, [user, isAuthReady])

  const toggleTask = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "tasks", id), {
        completed: !currentStatus
      })
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`)
    }
  }

  const deleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteDoc(doc(db, "tasks", id))
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`)
    }
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newTaskTitle.trim()) return

    try {
      await addDoc(collection(db, "tasks"), {
        teacherId: user.uid,
        title: newTaskTitle.trim(),
        deadline: "À définir",
        urgent: false,
        color: "sky",
        completed: false,
        createdAt: new Date().toISOString()
      })
      setNewTaskTitle("")
      setIsAdding(false)
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "tasks")
    }
  }

  const pendingCount = tasks.filter(t => !t.completed).length

  return (
    <Card className="border border-slate-200 bg-white flex flex-col h-full rounded-[2rem] sm:rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 px-4 sm:px-8 pt-5 sm:pt-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Target className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Priorités du Jour</CardTitle>
            <p className="text-xs sm:text-sm font-bold text-slate-400 pt-0.5">À faire en priorité</p>
          </div>
        </div>
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-slate-100 font-black text-slate-600 border border-slate-200 text-sm sm:text-base">
          {pendingCount}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4 sm:pt-8 flex flex-col px-4 sm:px-8 pb-4 sm:pb-8 overflow-hidden">
        <div className="space-y-3 sm:space-y-6 flex-1 overflow-y-auto pr-2">
          {tasks.length === 0 && !isAdding && (
            <div className="text-center py-8 text-slate-500 font-medium">
              Aucune tâche pour le moment.
            </div>
          )}
          {tasks.map((task) => {
            const colors = colorMap[task.color] || colorMap.sky
            return (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id, task.completed)}
                className={`group flex items-center gap-3 sm:gap-4 rounded-2xl border p-3 sm:p-4 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-md ${task.completed ? 'bg-slate-50 border-slate-200 opacity-60' : `bg-white ${colors.border}`}`}
              >
                <button 
                  className={`flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${task.completed ? 'bg-emerald-400 border-emerald-500 text-white scale-110' : 'bg-slate-50 border-slate-300 text-transparent group-hover:border-slate-400'}`}
                >
                  <Check className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                </button>
                
                <div className="flex-1 space-y-0.5 sm:space-y-1">
                  <p className={`text-base sm:text-lg font-black leading-tight transition-all duration-300 ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.title}
                  </p>
                  <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${task.completed ? 'text-slate-400' : colors.icon}`}>
                    {task.urgent ? <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    <span>{task.deadline}</span>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => deleteTask(task.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            )
          })}
          
          {isAdding && (
            <form onSubmit={addTask} className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3 sm:p-4">
              <div className="flex-1">
                <input
                  type="text"
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Nouvelle tâche..."
                  className="w-full bg-transparent border-none focus:ring-0 text-base sm:text-lg font-bold text-slate-800 placeholder:text-slate-400 p-0"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="text-slate-500">
                  Annuler
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                  Ajouter
                </Button>
              </div>
            </form>
          )}
        </div>
        
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="mt-4 sm:mt-8 w-full h-12 sm:h-14 rounded-2xl border-b-4 border-indigo-700 bg-indigo-500 text-base sm:text-lg font-bold hover:bg-indigo-600 hover:-translate-y-1 transition-transform active:translate-y-0 active:border-b-0 shrink-0"
          >
            <Plus className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
            Nouvelle Tâche
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
