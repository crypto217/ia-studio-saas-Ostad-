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

// --- MOCK DATA ---
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
  studentsCount: number
  average: number
  schedule: string
  room: string
  students: Student[]
}

const initialMockClasses: ClassData[] = [
  {
    id: "3ap-a",
    name: "3ème AP - Groupe A",
    cycle: "Primaire",
    theme: "amber",
    studentsCount: 24,
    average: 14.5,
    schedule: "Dim. 08:00 - 10:00",
    room: "Salle 12",
    students: [
      { id: "s1", name: "Amine Benali", status: "excellent", grade: 18.5, gender: "M" },
      { id: "s2", name: "Lina Merzoug", status: "good", grade: 14, gender: "F" },
      { id: "s3", name: "Yanis Kadi", status: "needs_help", grade: 9.5, gender: "M" },
      { id: "s4", name: "Ines Saidi", status: "excellent", grade: 17, gender: "F" },
      { id: "s5", name: "Rayane Toumi", status: "good", grade: 13.5, gender: "M" },
      { id: "s6", name: "Sarah Djouadi", status: "excellent", grade: 19, gender: "F" },
    ]
  },
  {
    id: "4ap-b",
    name: "4ème AP - Groupe B",
    cycle: "Primaire",
    theme: "emerald",
    studentsCount: 28,
    average: 15.2,
    schedule: "Lun. 10:00 - 12:00",
    room: "Salle 14",
    students: [
      { id: "s7", name: "Mehdi L.", status: "good", grade: 15, gender: "M" },
      { id: "s8", name: "Aya B.", status: "excellent", grade: 18, gender: "F" },
      { id: "s9", name: "Wassim C.", status: "needs_help", grade: 8.5, gender: "M" },
    ]
  },
  {
    id: "1am-a",
    name: "1ère AM - Groupe A",
    cycle: "Moyen",
    theme: "violet",
    studentsCount: 32,
    average: 12.8,
    schedule: "Mar. 08:00 - 10:00",
    room: "Labo 2",
    students: [
      { id: "s10", name: "Karim D.", status: "needs_help", grade: 10, gender: "M" },
      { id: "s11", name: "Nour E.", status: "good", grade: 13, gender: "F" },
      { id: "s12", name: "Sami F.", status: "excellent", grade: 16.5, gender: "M" },
    ]
  },
  {
    id: "2am-c",
    name: "2ème AM - Groupe C",
    cycle: "Moyen",
    theme: "sky",
    studentsCount: 30,
    average: 13.5,
    schedule: "Mer. 14:00 - 16:00",
    room: "Salle 22",
    students: [
      { id: "s13", name: "Rania G.", status: "good", grade: 14.5, gender: "F" },
      { id: "s14", name: "Walid H.", status: "needs_help", grade: 9, gender: "M" },
    ]
  }
]

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
  const [classes, setClasses] = useState<ClassData[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ludiclass_mock_classes')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("Error parsing", e)
        }
      }
    }
    return initialMockClasses
  })
  
  const [filterCycle, setFilterCycle] = useState<string>("Toutes")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  // New Class Form State
  const [newName, setNewName] = useState("")
  const [newCycle, setNewCycle] = useState("Primaire")
  const [newTheme, setNewTheme] = useState<ClassData['theme']>("emerald")

  useEffect(() => {
    localStorage.setItem('ludiclass_mock_classes', JSON.stringify(classes))
  }, [classes])

  const deleteClass = (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent opening the details modal
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) {
      setClasses(prev => prev.filter(c => c.id !== id))
    }
  }

  const addClass = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const newClassData: ClassData = {
      id: Date.now().toString(),
      name: newName,
      cycle: newCycle,
      theme: newTheme,
      studentsCount: 0,
      average: 0,
      schedule: "À définir",
      room: "À définir",
      students: []
    }

    setClasses(prev => [...prev, newClassData])
    setIsAddModalOpen(false)
    setNewName("")
    setNewCycle("Primaire")
    setNewTheme("emerald")
  }

  const filteredClasses = filterCycle === "Toutes" 
    ? classes 
    : classes.filter(c => c.cycle === filterCycle)

  // --- RENDER CLASSES LIST (INITIAL STATE) ---
  return (
    <div className="min-h-full bg-slate-50 flex flex-col gap-4 sm:gap-6 max-w-7xl mx-auto pb-24">
      {/* Dashboard App Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 -mx-4 sm:mx-0 sm:px-0 flex justify-between items-center">
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
      {filteredClasses.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-700 mb-2">Aucune classe</h2>
          <p className="text-slate-500 font-medium max-w-sm">Créer une classe pour y ajouter des élèves.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      className={`cursor-pointer bg-white rounded-3xl border border-slate-200 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md p-5 active:scale-[0.98] select-none [-webkit-tap-highlight-color:transparent] min-h-[160px] flex flex-col justify-between group`}
                    >
                    <button 
                      onClick={(e) => deleteClass(e, cls.id)}
                      className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all z-20 shadow-sm"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
  
                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex items-center justify-between">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-inner shrink-0`}>
                          <Icon className="w-7 h-7" strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className={`inline-block font-black text-xs px-2.5 py-1 rounded-lg mb-2 ${theme.badgeBg} ${theme.badgeText}`}>
                          {cls.cycle}
                        </div>
                        <h2 className="text-xl font-black tracking-tight line-clamp-2 text-slate-800">{cls.name}</h2>
                      </div>
                    </div>
  
                    <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-100">
                      <div className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500">
                        <Users className="w-4 h-4 text-slate-400" />
                        {cls.studentsCount} élèves
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-black text-slate-400 group-hover:text-indigo-500 transition-colors">
                        Ouvrir
                        <ChevronRight className="w-4 h-4" />
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
