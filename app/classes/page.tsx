"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { 
  Users, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  X, 
  Clock,
  MapPin,
  Award,
  Sparkles,
  BookOpen,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  ArrowLeft
} from "lucide-react"

import { db } from "@/firebase"
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore"
import { useAuth } from "@/components/AuthProvider"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

// --- TYPES ---
type StudentStatus = "excellent" | "good" | "needs_help"

interface Student {
  id: string
  name: string
  status: StudentStatus
  grade: number
  gender: "M" | "F"
}

interface ClassData {
  id: string
  name: string
  cycle: string
  theme: "amber" | "emerald" | "violet" | "sky" | "rose"
  studentsCount?: number
  average?: number
  schedule: string
  room: string
  students?: Student[]
}

const themeStyles = {
  amber: {
    gradient: "from-amber-400 to-amber-500",
    bg: "bg-white",
    text: "text-amber-600",
    border: "border-slate-200",
    borderBottom: "border-b-amber-500 border-b-[4px]", // keeping a subtle touch if needed, or remove completely as per instruction. Wait, instruction says: "Supprime les classes d'effet 3D... Remets les couleurs de fond en blanc".
    // Let's just rely on the main standard Card classes for border
    shadow: "shadow-amber-500/10",
    icon: Star,
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800"
  },
  emerald: {
    gradient: "from-emerald-400 to-emerald-500",
    bg: "bg-white",
    text: "text-emerald-600",
    border: "border-slate-200",
    shadow: "shadow-emerald-500/10",
    icon: Award,
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800"
  },
  violet: {
    gradient: "from-violet-400 to-violet-500",
    bg: "bg-white",
    text: "text-violet-600",
    border: "border-slate-200",
    shadow: "shadow-violet-500/10",
    icon: Sparkles,
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-800"
  },
  sky: {
    gradient: "from-sky-400 to-sky-500",
    bg: "bg-white",
    text: "text-sky-600",
    border: "border-slate-200",
    shadow: "shadow-sky-500/10",
    icon: BookOpen,
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-800"
  },
  rose: {
    gradient: "from-rose-400 to-rose-500",
    bg: "bg-white",
    text: "text-rose-600",
    border: "border-slate-200",
    shadow: "shadow-rose-500/10",
    icon: Users,
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-800"
  }
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function StudentsPage() {
  const { user, isAuthReady } = useAuth()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [filterCycle, setFilterCycle] = useState<string>("Toutes")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  // New Class Form State
  const [newName, setNewName] = useState("")
  const [newCycle, setNewCycle] = useState("Primaire")
  const [newTheme, setNewTheme] = useState<ClassData['theme']>("emerald")

  useEffect(() => {
    if (!isAuthReady || !user?.uid) return

    const q = query(collection(db, "classes"), where("teacherId", "==", user.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as ClassData[]
      setClasses(clsData)
      setIsLoading(false)
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "classes")
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user, isAuthReady])

  const deleteClass = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent opening the details modal
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      try {
        await deleteDoc(doc(db, "classes", id))
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `classes/${id}`)
      }
    }
  }

  const addClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !user?.uid) return

    try {
      await addDoc(collection(db, "classes"), {
        teacherId: user.uid,
        name: newName,
        cycle: newCycle,
        theme: newTheme,
        studentsCount: 0,
        average: 0,
        schedule: "À définir",
        room: "À définir",
        createdAt: serverTimestamp()
      })

      setIsAddModalOpen(false)
      setNewName("")
      setNewCycle("Primaire")
      setNewTheme("emerald")
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "classes")
    }
  }

  const filteredClasses = filterCycle === "Toutes" 
    ? classes 
    : classes.filter(c => c.cycle === filterCycle)

  // --- RENDER CLASSES LIST (INITIAL STATE) ---
  return (
    <div className="min-h-full bg-slate-50 flex flex-col gap-4 sm:gap-6 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-24">
      {/* Dashboard App Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 -mx-4 px-4 sm:-mx-8 sm:px-8 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-slate-800">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          Mes Classes
        </h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nouvelle
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {["Toutes", "Primaire", "Moyen", "Secondaire"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterCycle(tab)}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filterCycle === tab 
                ? "bg-slate-800 text-white shadow-md border-b-2 border-slate-950" 
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Classes Bento Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 shadow-xl mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Chargement de vos classes...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-700 mb-2">Aucune classe</h2>
          <p className="text-slate-500 font-medium max-w-sm">Créer une classe pour y ajouter des élèves.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredClasses.map((cls) => {
              const theme = themeStyles[cls.theme]
              const Icon = theme.icon
              
              return (
                <Link key={cls.id} href={`/classes/${cls.id}`} className="contents">
                    <motion.div
                      layoutId={`class-card-${cls.id}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors active:scale-95 cursor-pointer select-none [-webkit-tap-highlight-color:transparent] group relative overflow-hidden`}
                    >
                    <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-inner`}>
                      <Icon className="w-6 h-6" strokeWidth={2.5} />
                    </div>
  
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-slate-800 truncate leading-tight flex items-center gap-2">
                        {cls.name}
                      </h2>
                      <p className="text-sm text-slate-500 truncate mt-0.5">
                        {cls.cycle} • {cls.studentsCount || 0} élèves
                      </p>
                    </div>
  
                    <div className="shrink-0 flex items-center gap-2">
                      <button 
                        onClick={(e) => deleteClass(e, cls.id)}
                        className="p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-slate-300">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* FAB: Floating Action Button */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] right-4 z-50 flex sm:hidden h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 [-webkit-tap-highlight-color:transparent]"
      >
        <Plus className="w-7 h-7" strokeWidth={3} />
      </button>

      {/* ADD CLASS MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden pointer-events-auto border border-slate-100"
              >
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    Nouvelle Classe
                  </h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white rounded-xl text-slate-400 hover:text-slate-600 shadow-sm border border-slate-200 hover:border-slate-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={addClass} className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nom de la classe</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: 5ème AP - B"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Cycle</label>
                    <select 
                      value={newCycle}
                      onChange={(e) => setNewCycle(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                    >
                      <option value="Primaire">Primaire</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Secondaire">Secondaire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Thème de la classe</label>
                    <div className="flex flex-wrap items-center gap-3">
                      {(Object.keys(themeStyles) as Array<ClassData['theme']>).map((theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => setNewTheme(theme)}
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${themeStyles[theme].gradient} flex items-center justify-center transition-transform ${newTheme === theme ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105 hover:-translate-y-1'}`}
                        >
                          {newTheme === theme && <Check className="w-6 h-6 text-white" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-lg transition-transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 border-b-[4px] border-slate-950 active:border-b-0">
                      <Plus className="w-5 h-5" />
                      Créer la classe
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
