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
  Check
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
    schedule: "Dimanche 08:00 - 10:00",
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
    schedule: "Lundi 10:00 - 12:00",
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
    schedule: "Mardi 08:00 - 10:00",
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
    schedule: "Mercredi 14:00 - 16:00",
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

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ostad_mock_classes')
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
    localStorage.setItem('ostad_mock_classes', JSON.stringify(classes))
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

  return (
    <div className="min-h-screen pb-24 bg-slate-50/50">
      {/* COMPACT HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 pt-6 pb-4 sm:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Mes Classes</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm sm:text-lg max-w-2xl hidden sm:block mt-2">
            Gérez vos classes, suivez vos élèves et organisez votre enseignement de manière ludique !
          </p>
        </div>
      </div>

      {/* STICKY TABS BAR */}
      <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md px-4 py-3 sm:px-8 border-b border-slate-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {["Toutes", "Primaire", "Moyen", "Secondaire"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterCycle(tab)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                filterCycle === tab 
                  ? "bg-slate-800 text-white shadow-md" 
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-4 sm:mt-8">
        {/* CLASSES GRID / LIST (Mobile vs Desktop) */}
        {filteredClasses.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-700 mb-2">Aucune classe trouvée</h2>
            <p className="text-slate-500 font-medium max-w-sm">Vous n&apos;avez pas encore de classe dans ce cycle. Cliquez sur le bouton + pour en créer une.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer bg-white rounded-[1.25rem] sm:rounded-[2rem] p-3 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0`}
                  >
                    {/* Trash Button */}
                    <button 
                      onClick={(e) => deleteClass(e, cls.id)}
                      className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-20 shadow-sm"
                      title="Supprimer la classe"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {/* Desktop background flourish */}
                <div className={`hidden sm:block absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${theme.gradient} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`} />
                
                {/* Left: Icon in circle */}
                <div className="shrink-0 flex sm:justify-between items-center sm:items-start sm:mb-6 sm:w-full relative z-10">
                  <div className={`w-12 h-12 sm:w-12 sm:h-12 rounded-full sm:rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="hidden sm:block bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full">
                    {cls.cycle}
                  </div>
                </div>

                {/* Center: Details */}
                <div className="flex-1 min-w-0 relative z-10 sm:w-full">
                  <div className="flex sm:hidden items-center text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">
                    {cls.cycle}
                  </div>
                  <h2 className="text-base sm:text-2xl font-black text-slate-800 truncate leading-tight sm:mb-1">{cls.name}</h2>
                  <div className="flex flex-row items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-slate-500 mt-1 sm:mt-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                      {cls.studentsCount} élèves
                    </div>
                    {/* Hide desktop average here, move to Right section on mobile */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                      Moy: {cls.average}/20
                    </div>
                  </div>
                </div>

                {/* Right: Average Pill & Chevron (Mobile mainly, or unified) */}
                <div className="shrink-0 flex items-center gap-2 relative z-10">
                  <div className={`sm:hidden px-2 py-1 rounded-lg text-xs font-bold border ${theme.bg} ${theme.text} ${theme.border}`}>
                    {cls.average}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
              </motion.div>
            )
          })}
          </AnimatePresence>
        </div>
        )}
      </div>

      {/* FAB: Floating Action Button */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-[0_10px_25px_-5px_rgba(244,63,94,0.5)] z-30 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden pointer-events-auto"
              >
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    Nouvelle Classe
                  </h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={addClass} className="p-6 space-y-6">
                  {/* Name Input */}
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

                  {/* Cycle Select */}
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Cycle</label>
                    <select 
                      value={newCycle}
                      onChange={(e) => setNewCycle(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Primaire">Primaire</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Secondaire">Secondaire</option>
                    </select>
                  </div>

                  {/* Theme Select */}
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Thème de couleur</label>
                    <div className="flex items-center gap-3">
                      {(Object.keys(themeStyles) as Array<ClassData['theme']>).map((theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => setNewTheme(theme)}
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${themeStyles[theme].gradient} flex items-center justify-center transition-transform ${newTheme === theme ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-110'}`}
                        >
                          {newTheme === theme && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" />
                      Créer la classe
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* EXPANDED CLASS MODAL */}
      <AnimatePresence>
        {selectedClass && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClass(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 pointer-events-none">
              <motion.div
                layoutId={`class-card-${selectedClass.id}`}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={(e, info) => {
                  if (info.offset.y > 150) setSelectedClass(null);
                }}
                className="bg-white w-full max-w-4xl h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto sm:border-4 sm:border-white"
              >
                {/* Mobile Drag Indicator */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden absolute top-0 left-0 z-50">
                  <div className="w-12 h-1.5 bg-white/40 rounded-full" />
                </div>

                {/* Modal Header */}
                <div className={`bg-gradient-to-br ${themeStyles[selectedClass.theme].gradient} p-5 pt-8 sm:p-6 relative shrink-0`}>
                  <button 
                    onClick={() => setSelectedClass(null)}
                    className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors z-20"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-2 sm:mb-3 mt-4 sm:mt-0">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-bold text-xs">
                      {selectedClass.cycle}
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 leading-tight pr-16">{selectedClass.name}</h2>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white/90 font-medium mt-3 sm:mt-4">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm text-xs sm:text-sm">
                      <Clock className="w-4 h-4" />
                      {selectedClass.schedule}
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm text-xs sm:text-sm">
                      <MapPin className="w-4 h-4" />
                      {selectedClass.room}
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm text-xs sm:text-sm">
                      <Users className="w-4 h-4" />
                      {selectedClass.studentsCount} élèves
                    </div>
                  </div>
                </div>

                {/* Modal Body (Students List) */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800">Liste des élèves</h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 self-start sm:self-auto">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      Moyenne : <span className="text-slate-800 text-lg">{selectedClass.average}/20</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedClass.students.map((student) => (
                      <Link href={`/students/${student.id}`} key={student.id} className="block">
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white shadow-inner group-hover:scale-105 transition-transform ${
                            student.status === 'excellent' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                            student.status === 'good' ? 'bg-gradient-to-br from-sky-400 to-blue-500' :
                            'bg-gradient-to-br from-amber-400 to-orange-500'
                          }`}>
                            {getInitials(student.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{student.name}</p>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                                student.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                              }`}>
                                {student.gender === 'M' ? 'Garçon' : 'Fille'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                student.status === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                                student.status === 'good' ? 'bg-sky-100 text-sky-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {student.grade}/20
                              </span>
                              {student.status === 'needs_help' && (
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                    
                    {/* Placeholder for missing students to show it's a list */}
                    {Array.from({ length: Math.max(0, selectedClass.studentsCount - selectedClass.students.length) }).map((_, i) => (
                      <div key={`empty-${i}`} className="bg-slate-100/50 border-2 border-dashed border-slate-200 p-4 rounded-2xl flex items-center gap-4 opacity-50">
                        <div className="w-12 h-12 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-24" />
                          <div className="h-3 bg-slate-200 rounded w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
