"use client"

import { useState, useEffect } from "react"
import { Check, Plus, Clock, AlertCircle, ListTodo, Trash2 } from "lucide-react"
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
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 px-4 sm:px-5 pt-4 sm:pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <ListTodo className="h-5 w-5 sm:h-7 sm:w-7" />
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
      <CardContent className="flex-1 pt-3 sm:pt-4 flex flex-col px-4 sm:px-5 pb-4 sm:pb-5 overflow-hidden">
        <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto pr-2">
          {tasks.length === 0 && !isAdding && (
            <div className="text-center py-8 text-slate-500 font-medium">
              Aucune tâche pour le moment.
            </div>
          )}
          <AnimatePresence>
            {tasks.map((task) => {
              const colors = colorMap[task.color] || colorMap.sky
              return (
                <motion.div 
                  key={task.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  className={`group relative p-4 rounded-[1.25rem] border-2 transition-all ${
                    task.completed 
                      ? 'bg-slate-50 border-slate-200 opacity-75' 
                      : task.urgent
                        ? 'bg-rose-50 border-rose-200 shadow-sm'
                        : `${colors.bg} ${colors.border} shadow-sm`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        task.completed 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-white border-2 border-slate-300 hover:border-indigo-500 text-transparent hover:text-indigo-200'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-base sm:text-lg leading-tight mb-1 ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {!task.completed && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            task.urgent ? 'bg-rose-100 text-rose-700' :
                            task.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                            'bg-sky-100 text-sky-700'
                          }`}>
                            {task.urgent ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {task.deadline || "À définir"}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => deleteTask(task.id, e)}
                      className="shrink-0 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          
          {isAdding && (
            <form onSubmit={addTask} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-1">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Que devez-vous accomplir ?"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="text-slate-500 font-bold h-12 w-12 rounded-xl">
                  <Trash2 className="w-5 h-5"/>
                </Button>
                <Button type="submit" disabled={!newTaskTitle.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border-b-[4px] border-indigo-800 active:translate-y-[2px] active:border-b-0 transition-all font-black h-12 px-6">
                  Ajouter
                </Button>
              </div>
            </form>
          )}
        </div>
        
        {!isAdding && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="mt-4 sm:mt-6 w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black border-b-[4px] border-indigo-800 shadow-lg hover:-translate-y-1 active:translate-y-[2px] active:border-b-0 transition-all shrink-0 text-base sm:text-lg"
          >
            <Plus className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
            Nouvelle Tâche
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
