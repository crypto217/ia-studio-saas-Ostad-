"use client"

import { useState, useEffect } from "react"
import { Check, Plus, Clock, AlertCircle, ListTodo, Trash2, CalendarHeart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"
import { motion, AnimatePresence } from "motion/react"

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

const colors = [
  { bg: "bg-indigo-50/70", border: "border-indigo-100", text: "text-indigo-700", icon: "text-indigo-500", badgeBg: "bg-indigo-100/80" },
  { bg: "bg-rose-50/70", border: "border-rose-100", text: "text-rose-700", icon: "text-rose-500", badgeBg: "bg-rose-100/80" },
  { bg: "bg-amber-50/70", border: "border-amber-100", text: "text-amber-700", icon: "text-amber-500", badgeBg: "bg-amber-100/80" },
  { bg: "bg-emerald-50/70", border: "border-emerald-100", text: "text-emerald-700", icon: "text-emerald-500", badgeBg: "bg-emerald-100/80" },
  { bg: "bg-violet-50/70", border: "border-violet-100", text: "text-violet-700", icon: "text-violet-500", badgeBg: "bg-violet-100/80" },
  { bg: "bg-sky-50/70", border: "border-sky-100", text: "text-sky-700", icon: "text-sky-500", badgeBg: "bg-sky-100/80" },
]

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
    <Card className="border border-slate-200/60 bg-white flex flex-col h-full rounded-[2rem] sm:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-400/20 via-fuchsia-400/20 to-rose-400/20 blur-3xl pointer-events-none"></div>
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100/50 px-4 sm:px-6 pt-5 sm:pt-6 relative z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-md">
            <ListTodo className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">Priorités du Jour</CardTitle>
            <p className="text-sm font-semibold text-slate-500 pt-1 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              En cours
            </p>
          </div>
        </div>
        <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-slate-50 font-black text-slate-700 border border-slate-200 shadow-sm text-base sm:text-lg">
          {pendingCount}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-4 sm:pt-5 flex flex-col px-4 sm:px-6 pb-5 sm:pb-6 overflow-hidden relative z-10">
        <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {tasks.length === 0 && !isAdding && (
            <div className="text-center py-10 flex flex-col items-center justify-center text-slate-500 font-medium bg-slate-50 rounded-3xl border border-slate-100/50 border-dashed">
              <Check className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-lg text-slate-600 font-bold">Tout est à jour !</p>
              <p className="text-sm text-slate-400 mt-1">Profitez de votre journée.</p>
            </div>
          )}
          <AnimatePresence>
            {tasks.map((task, index) => {
              const colorStyle = colors[index % colors.length]
              return (
                <motion.div 
                  key={task.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] border transition-all duration-300 ${
                    task.completed 
                      ? 'bg-slate-50/50 border-slate-100 opacity-60 grayscale-[0.5]' 
                      : task.urgent
                        ? 'bg-rose-50 border-rose-200 shadow-sm shadow-rose-100/50'
                        : `${colorStyle.bg} ${colorStyle.border} shadow-sm hover:shadow-md`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={`mt-0.5 shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        task.completed 
                          ? 'bg-emerald-500 text-white shadow-md scale-110' 
                          : 'bg-white border-2 border-slate-300 hover:border-indigo-500 text-transparent hover:text-indigo-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-base sm:text-lg leading-tight mb-2 transition-colors ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {!task.completed && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wide ${
                            task.urgent 
                              ? 'bg-rose-100 text-rose-700 border border-rose-200/50' 
                              : `${colorStyle.badgeBg} ${colorStyle.text} border ${colorStyle.border}/50`
                          }`}>
                            {task.urgent ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {task.deadline || "À définir"}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => deleteTask(task.id, e)}
                      className="shrink-0 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={addTask} 
              className="flex flex-col sm:flex-row items-stretch gap-3 p-1 mt-2"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Que devez-vous accomplir ?"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white rounded-[1.25rem] px-5 py-3 sm:py-4 font-bold text-slate-700 placeholder:text-slate-400 outline-none transition-all shadow-sm"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 font-bold h-12 sm:h-14 w-12 sm:w-14 rounded-[1.25rem]">
                  <Trash2 className="w-5 h-5"/>
                </Button>
                <Button type="submit" disabled={!newTaskTitle.trim()} className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-700 hover:to-fuchsia-700 rounded-[1.25rem] font-black h-12 sm:h-14 px-6 sm:px-8 shadow-md hover:shadow-lg disabled:opacity-50 transition-all text-base border-0">
                  <Plus className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Ajouter</span>
                </Button>
              </div>
            </motion.form>
          )}
        </div>
        
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="mt-5 w-full h-14 sm:h-16 rounded-2xl bg-indigo-50/50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 font-black shadow-sm transition-all shrink-0 text-base sm:text-lg group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm text-indigo-600 mr-3 group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5" strokeWidth={3} />
            </div>
            Nouvelle Tâche
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

