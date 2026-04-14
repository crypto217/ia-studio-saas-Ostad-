"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  Users, 
  Star, 
  X, 
  ChevronLeft,
  Award,
  Sparkles,
  BookOpen,
  ClipboardList,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  FileText,
  Brain,
  MessageCircle,
  Calculator
} from "lucide-react"

// --- TYPES & MOCK DATA ---
type AssessmentType = 'devoir' | 'examen' | 'evaluation' | 'comportement'

interface Assessment {
  id: string
  name: string
  type: AssessmentType
  maxScore: 10 | 20
}

interface Student {
  id: string
  name: string
}

interface ClassData {
  id: string
  name: string
  cycle: string
  theme: "amber" | "emerald" | "violet" | "sky" | "rose"
  studentsCount: number
  students: Student[]
  defaultAssessments: Assessment[]
  mockGrades: Record<string, Record<string, string>> // studentId -> assessmentId -> score
}

const mockClasses: ClassData[] = [
  {
    id: "3ap-a",
    name: "3ème AP - Groupe A",
    cycle: "Primaire",
    theme: "amber",
    studentsCount: 24,
    defaultAssessments: [
      { id: "a1", name: "Devoir 1", type: "devoir", maxScore: 10 },
      { id: "a2", name: "Comportement", type: "comportement", maxScore: 10 },
      { id: "a3", name: "Composition", type: "examen", maxScore: 20 },
    ],
    students: [
      { id: "s1", name: "Amine Benali" },
      { id: "s2", name: "Lina Merzoug" },
      { id: "s3", name: "Yanis Kadi" },
      { id: "s4", name: "Ines Saidi" },
      { id: "s5", name: "Rayane Toumi" },
      { id: "s6", name: "Sarah Djouadi" },
    ],
    mockGrades: {
      "s1": { "a1": "8.5", "a2": "10", "a3": "18" },
      "s2": { "a1": "7", "a2": "9", "a3": "15" },
      "s3": { "a1": "5", "a2": "7", "a3": "9" },
    }
  },
  {
    id: "4ap-b",
    name: "4ème AP - Groupe B",
    cycle: "Primaire",
    theme: "emerald",
    studentsCount: 28,
    defaultAssessments: [
      { id: "b1", name: "Éval. Continue", type: "evaluation", maxScore: 10 },
      { id: "b2", name: "Examen Trim 1", type: "examen", maxScore: 20 },
    ],
    students: [
      { id: "s7", name: "Mehdi L." },
      { id: "s8", name: "Aya B." },
      { id: "s9", name: "Wassim C." },
    ],
    mockGrades: {}
  }
]

const themeStyles = {
  amber: { gradient: "from-amber-400 to-orange-500", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", shadow: "shadow-amber-500/20", icon: Star },
  emerald: { gradient: "from-emerald-400 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", shadow: "shadow-emerald-500/20", icon: Award },
  violet: { gradient: "from-violet-400 to-fuchsia-500", bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", shadow: "shadow-violet-500/20", icon: Sparkles },
  sky: { gradient: "from-sky-400 to-blue-500", bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200", shadow: "shadow-sky-500/20", icon: BookOpen },
  rose: { gradient: "from-rose-400 to-pink-500", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", shadow: "shadow-rose-500/20", icon: Users }
}

const assessmentTypes: Record<AssessmentType, { label: string, icon: any, color: string, bg: string }> = {
  devoir: { label: "Devoir", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
  examen: { label: "Examen", icon: Brain, color: "text-purple-600", bg: "bg-purple-100" },
  evaluation: { label: "Évaluation", icon: Calculator, color: "text-emerald-600", bg: "bg-emerald-100" },
  comportement: { label: "Comportement", icon: MessageCircle, color: "text-amber-600", bg: "bg-amber-100" }
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

export default function GradesPage() {
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  
  // Dynamic State
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>({})
  
  // UI State
  const [isSaved, setIsSaved] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  // New Assessment Form State
  const [newAssName, setNewAssName] = useState("")
  const [newAssType, setNewAssType] = useState<AssessmentType>("devoir")
  const [newAssMax, setNewAssMax] = useState<10 | 20>(10)

  // Initialize class data
  const handleSelectClass = (cls: ClassData) => {
    setAssessments([...cls.defaultAssessments])
    
    // Initialize grades object
    const initialGrades: Record<string, Record<string, string>> = {}
    cls.students.forEach(student => {
      initialGrades[student.id] = { ...(cls.mockGrades[student.id] || {}) }
    })
    setGrades(initialGrades)
    setSelectedClass(cls)
    setIsSaved(false)
  }

  const handleGradeChange = (studentId: string, assessmentId: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentId]: value
      }
    }))
    setIsSaved(false)
  }

  const handleAddAssessment = () => {
    if (!newAssName.trim()) return
    const newAss: Assessment = {
      id: `ass_${Date.now()}`,
      name: newAssName,
      type: newAssType,
      maxScore: newAssMax
    }
    setAssessments([...assessments, newAss])
    setIsAddModalOpen(false)
    setNewAssName("")
    setNewAssType("devoir")
    setNewAssMax(10)
  }

  const handleDeleteAssessment = (idToDelete: string) => {
    setAssessments(assessments.filter(a => a.id !== idToDelete))
    // Optionally clean up grades for this assessment
    const newGrades = { ...grades }
    Object.keys(newGrades).forEach(studentId => {
      delete newGrades[studentId][idToDelete]
    })
    setGrades(newGrades)
  }

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const calculateAverage = (studentId: string) => {
    const studentGrades = grades[studentId] || {}
    let totalNormalized = 0
    let count = 0

    assessments.forEach(ass => {
      const val = parseFloat(studentGrades[ass.id])
      if (!isNaN(val)) {
        // Normalize everything to /20 for the final average calculation
        const multiplier = 20 / ass.maxScore
        totalNormalized += (val * multiplier)
        count++
      }
    })

    if (count === 0) return "-"
    return (totalNormalized / count).toFixed(2)
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50/50">
      <AnimatePresence mode="wait">
        {!selectedClass ? (
          <motion.div 
            key="class-selection"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 px-4 py-8 sm:px-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Carnet de notes</h1>
                </div>
                <p className="text-slate-500 font-medium text-lg max-w-2xl">
                  Gérez vos évaluations de manière flexible. Ajoutez des devoirs, examens ou notes de comportement sur 10 ou 20.
                </p>
              </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-8">
              {/* CLASSES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockClasses.map((cls) => {
                  const theme = themeStyles[cls.theme]
                  const Icon = theme.icon
                  
                  return (
                    <motion.div
                      key={cls.id}
                      onClick={() => handleSelectClass(cls)}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer bg-white rounded-[2rem] p-6 shadow-xl border-2 transition-all duration-300 ${theme.border} ${theme.shadow} relative overflow-hidden group`}
                    >
                      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${theme.gradient} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`} />
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white shadow-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full">
                          {cls.cycle}
                        </div>
                      </div>

                      <div className="relative z-10">
                        <h2 className="text-2xl font-black text-slate-800 mb-1">{cls.name}</h2>
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mt-4">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {cls.studentsCount} élèves
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="grading-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full min-h-screen bg-slate-50"
          >
            {/* GRADING HEADER */}
            <div className="relative z-40 max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 mb-6 sm:mb-8">
              <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-r ${themeStyles[selectedClass.theme].gradient} p-4 sm:p-5 shadow-2xl ${themeStyles[selectedClass.theme].shadow} border-2 border-white/40 backdrop-blur-xl`}>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button 
                      onClick={() => setSelectedClass(null)}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shrink-0 shadow-sm border border-white/10"
                    >
                      <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg text-white font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-sm">
                          {selectedClass.cycle}
                        </span>
                        <span className="bg-black/10 backdrop-blur-md px-2 py-0.5 rounded-lg text-white/90 font-bold text-[10px] sm:text-xs shadow-sm">
                          {selectedClass.studentsCount} élèves
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-sm">{selectedClass.name}</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-bold text-sm bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all border border-white/10 shadow-sm hover:scale-105 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="hidden sm:inline">Nouvelle colonne</span>
                      <span className="sm:hidden">Ajouter</span>
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 ${
                        isSaved 
                          ? "bg-emerald-400 text-white shadow-emerald-500/40" 
                          : "bg-white text-slate-800 hover:bg-slate-50 shadow-black/10"
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="hidden sm:inline">Enregistré !</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span className="hidden sm:inline">Enregistrer</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* GRADING CONTENT */}
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
              
              {assessments.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-slate-200 border-dashed flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ClipboardList className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-700 mb-2">Aucune évaluation</h3>
                  <p className="text-slate-500 mb-6 max-w-md">Commencez par ajouter un devoir, un examen ou une note de comportement pour cette classe.</p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/30"
                  >
                    <Plus className="w-5 h-5" />
                    Créer la première évaluation
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Desktop Table View (Hidden on Mobile) */}
                  <div className="hidden md:block bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-6 font-bold text-slate-500 uppercase tracking-wider text-sm sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_0_#f1f5f9]">
                              Élève
                            </th>
                            {assessments.map(ass => {
                              const typeInfo = assessmentTypes[ass.type]
                              const TypeIcon = typeInfo.icon
                              return (
                                <th key={ass.id} className="p-4 min-w-[140px]">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${typeInfo.bg} ${typeInfo.color}`}>
                                        <TypeIcon className="w-3.5 h-3.5" />
                                        {typeInfo.label}
                                      </div>
                                      <button 
                                        onClick={() => handleDeleteAssessment(ass.id)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                        title="Supprimer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="font-black text-slate-700 text-sm truncate" title={ass.name}>{ass.name}</span>
                                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">/{ass.maxScore}</span>
                                    </div>
                                  </div>
                                </th>
                              )
                            })}
                            <th className="p-6 font-bold text-slate-500 uppercase tracking-wider text-sm text-center sticky right-0 bg-slate-50 shadow-[-1px_0_0_0_#f1f5f9]">
                              Moy. (/20)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedClass.students.map((student) => {
                            const avg = calculateAverage(student.id)
                            return (
                              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors z-10 shadow-[1px_0_0_0_#f1f5f9]">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-inner bg-gradient-to-br ${themeStyles[selectedClass.theme].gradient}`}>
                                      {getInitials(student.name)}
                                    </div>
                                    <span className="font-bold text-slate-800 whitespace-nowrap">{student.name}</span>
                                  </div>
                                </td>
                                {assessments.map(ass => (
                                  <td key={ass.id} className="p-4">
                                    <input 
                                      type="number" 
                                      step="0.25"
                                      min="0"
                                      max={ass.maxScore}
                                      value={grades[student.id]?.[ass.id] || ""}
                                      onChange={(e) => handleGradeChange(student.id, ass.id, e.target.value)}
                                      className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-400 focus:bg-white rounded-xl py-2.5 text-center font-bold text-slate-700 transition-all outline-none"
                                      placeholder="-"
                                    />
                                  </td>
                                ))}
                                <td className="p-4 sticky right-0 bg-white group-hover:bg-slate-50/50 transition-colors shadow-[-1px_0_0_0_#f1f5f9]">
                                  <div className="flex justify-center">
                                    <div className={`px-3 py-1.5 rounded-lg font-black text-sm ${
                                      avg === "-" ? "bg-slate-100 text-slate-400" :
                                      parseFloat(avg) >= 10 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                    }`}>
                                      {avg}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards View (Visible only on Mobile) */}
                  <div className="md:hidden space-y-4">
                    {selectedClass.students.map((student) => {
                      const avg = calculateAverage(student.id)
                      return (
                        <div key={student.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                          {/* Student Header */}
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-black text-white shadow-inner bg-gradient-to-br ${themeStyles[selectedClass.theme].gradient}`}>
                                {getInitials(student.name)}
                              </div>
                              <span className="font-black text-slate-800 text-lg">{student.name}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Moyenne</span>
                              <div className={`px-3 py-1 rounded-lg font-black text-sm ${
                                avg === "-" ? "bg-slate-100 text-slate-400" :
                                parseFloat(avg) >= 10 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                              }`}>
                                {avg !== "-" ? `${avg}/20` : "-"}
                              </div>
                            </div>
                          </div>

                          {/* Assessments List for this student */}
                          <div className="space-y-3">
                            {assessments.map(ass => {
                              const typeInfo = assessmentTypes[ass.type]
                              const TypeIcon = typeInfo.icon
                              return (
                                <div key={ass.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                                      <span className="font-bold text-slate-700 text-sm">{ass.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${typeInfo.bg} ${typeInfo.color}`}>
                                        {typeInfo.label}
                                      </span>
                                      <button 
                                        onClick={() => handleDeleteAssessment(ass.id)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" 
                                      step="0.25"
                                      min="0"
                                      max={ass.maxScore}
                                      value={grades[student.id]?.[ass.id] || ""}
                                      onChange={(e) => handleGradeChange(student.id, ass.id, e.target.value)}
                                      className="w-16 h-10 bg-white border-2 border-slate-200 focus:border-indigo-400 rounded-xl text-center font-black text-slate-700 transition-all outline-none shadow-sm"
                                      placeholder="-"
                                    />
                                    <span className="text-xs font-bold text-slate-400 w-6">/{ass.maxScore}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD ASSESSMENT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 pointer-events-none">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-slate-800">Nouvelle évaluation</h3>
                    <button 
                      onClick={() => setIsAddModalOpen(false)}
                      className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Type Selection */}
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Type d&apos;évaluation</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(Object.keys(assessmentTypes) as AssessmentType[]).map(type => {
                          const info = assessmentTypes[type]
                          const Icon = info.icon
                          const isSelected = newAssType === type
                          return (
                            <button
                              key={type}
                              onClick={() => setNewAssType(type)}
                              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                isSelected 
                                  ? `border-${info.color.split('-')[1]}-500 ${info.bg}` 
                                  : "border-slate-100 hover:border-slate-200 bg-white"
                              }`}
                            >
                              <Icon className={`w-6 h-6 ${isSelected ? info.color : "text-slate-400"}`} />
                              <span className={`text-sm font-bold ${isSelected ? info.color : "text-slate-500"}`}>{info.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Name Input */}
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Titre (ex: Devoir N°1)</label>
                      <input 
                        type="text" 
                        value={newAssName}
                        onChange={(e) => setNewAssName(e.target.value)}
                        placeholder="Entrez le titre..."
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors"
                      />
                    </div>

                    {/* Max Score Selection */}
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Barème</label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setNewAssMax(10)}
                          className={`flex-1 py-3 rounded-xl font-black text-lg border-2 transition-all ${
                            newAssMax === 10 ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-100 text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          / 10
                        </button>
                        <button
                          onClick={() => setNewAssMax(20)}
                          className={`flex-1 py-3 rounded-xl font-black text-lg border-2 transition-all ${
                            newAssMax === 20 ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-100 text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          / 20
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleAddAssessment}
                      disabled={!newAssName.trim()}
                      className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-black text-lg transition-colors shadow-lg shadow-indigo-500/30 disabled:shadow-none mt-4"
                    >
                      Ajouter la colonne
                    </button>
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
