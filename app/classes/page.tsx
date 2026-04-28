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
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    shadow: "shadow-amber-500/20",
    icon: Star
  },
  emerald: {
    gradient: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    shadow: "shadow-emerald-500/20",
    icon: Award
  },
  violet: {
    gradient: "from-violet-400 to-fuchsia-500",
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
    shadow: "shadow-violet-500/20",
    icon: Sparkles
  },
  sky: {
    gradient: "from-sky-400 to-blue-500",
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-200",
    shadow: "shadow-sky-500/20",
    icon: BookOpen
  },
  rose: {
    gradient: "from-rose-400 to-pink-500",
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
    shadow: "shadow-rose-500/20",
    icon: Users
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
  
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
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

  // --- RENDER STUDENTS LIST FOR A SELECTED CLASS ---
  if (selectedClass) {
    const theme = themeStyles[selectedClass.theme]
    return (
      <div className="bg-slate-50 min-h-full">
        {/* Class Header */}
        <div className={`bg-gradient-to-br ${theme.gradient} px-4 py-6 sm:px-8 sm:py-10 text-white relative shadow-sm rounded-[2rem] sm:rounded-3xl`}>
          <div className="max-w-6xl mx-auto">
            <button 
              onClick={() => setSelectedClass(null)}
              className="flex items-center gap-2 text-white/90 hover:text-white font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-colors mb-4 backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux classes
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-bold text-xs shadow-inner">
                    {selectedClass.cycle}
                  </div>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{selectedClass.name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-white/90 font-medium mt-4">
                  <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm text-sm">
                    <Clock className="w-4 h-4" />
                    {selectedClass.schedule}
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm text-sm">
                    <MapPin className="w-4 h-4" />
                    {selectedClass.room}
                  </div>
                </div>
              </div>
              <div className="bg-white text-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex items-center gap-4 min-w-[200px]">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-inner`}>
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Moyenne</p>
                  <p className="text-3xl font-black">{selectedClass.average}<span className="text-lg text-slate-400">/20</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students List Content */}
        <div className="max-w-6xl mx-auto py-6 sm:py-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-500" />
              {selectedClass.studentsCount} élèves inscrits
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedClass.students.map((student) => (
              <motion.div 
                whileTap={{ scale: 0.98 }}
                key={student.id} 
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-xl font-black text-white shadow-inner group-hover:scale-105 transition-transform ${
                  student.status === 'excellent' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                  student.status === 'good' ? 'bg-gradient-to-br from-sky-400 to-blue-500' :
                  'bg-gradient-to-br from-amber-400 to-orange-500'
                }`}>
                  {getInitials(student.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors text-lg">{student.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      student.gender === 'M' ? 'bg-sky-100 text-sky-600' : 'bg-pink-100 text-pink-600'
                    }`}>
                      {student.gender === 'M' ? 'Garçon' : 'Fille'}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      student.status === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                      student.status === 'good' ? 'bg-sky-100 text-sky-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {student.status === 'excellent' ? 'Niveau Excellent' : student.status === 'good' ? 'Bon Niveau' : 'Aide requise'}
                    </span>
                  </div>
                </div>
                {student.status === 'needs_help' && (
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --- RENDER CLASSES LIST (INITIAL STATE) ---
  return (
    <div className="min-h-full bg-slate-50 flex flex-col gap-4 sm:gap-6 max-w-7xl mx-auto">
      {/* Welcome Banner Style Header */}
      <div className="relative overflow-hidden rounded-[2rem] sm:rounded-3xl bg-indigo-500 px-4 py-5 sm:py-10 md:px-12 md:py-16 text-white shadow-sm border border-indigo-600 flex items-center justify-between">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl opacity-50 md:opacity-100" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-indigo-700/30 blur-3xl opacity-50 md:opacity-100" />
        
        <div className="relative z-10 max-w-xl w-full">
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight flex items-center gap-2 md:gap-3">
              <Sparkles className="w-6 h-6 sm:w-10 sm:h-10 text-amber-300 fill-amber-300" />
              Mes Élèves
            </h1>
          </div>
          <p className="text-indigo-100 font-medium text-sm md:text-lg mb-0 max-w-md">
            Consultez vos classes, suivez les progrès et gardez un œil sur tous vos élèves.
          </p>
        </div>
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
                <motion.div
                  key={cls.id}
                  layoutId={`class-card-${cls.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedClass(cls)}
                  className={`cursor-pointer bg-white border-2 border-slate-200 border-b-[6px] rounded-[2rem] p-6 transition-all hover:-translate-y-1 hover:border-b-[3px] active:translate-y-1 active:border-b-2 relative overflow-hidden group flex flex-col justify-between min-h-[160px]`}
                >
                  <button 
                    onClick={(e) => deleteClass(e, cls.id)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all z-20 shadow-sm"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-inner`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className={`font-black text-xs px-2.5 py-1 rounded-lg ${theme.bg} ${theme.text}`}>
                        {cls.cycle}
                      </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 truncate pr-10">{cls.name}</h2>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <Users className="w-5 h-5 text-slate-400" />
                      {cls.studentsCount} élèves
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-black text-slate-300 group-hover:text-indigo-500 transition-colors">
                      Ouvrir
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* FAB: Floating Action Button */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-indigo-500/30 shadow-xl z-30 hover:scale-105 active:scale-95 transition-all border-2 border-white"
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
