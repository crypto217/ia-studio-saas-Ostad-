"use client"

import { useState } from "react"
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
  BookOpen
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

const mockClasses: ClassData[] = [
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
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)

  return (
    <div className="min-h-screen pb-24 bg-slate-50/50">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-8 sm:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Mes Classes</h1>
          </div>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">
            Gérez vos classes, suivez vos élèves et organisez votre enseignement de manière ludique !
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
                layoutId={`class-card-${cls.id}`}
                onClick={() => setSelectedClass(cls)}
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
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      Moy: {cls.average}/20
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

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
                    className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors z-10"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-2 sm:mb-3">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-bold text-xs">
                      {selectedClass.cycle}
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 leading-tight pr-10">{selectedClass.name}</h2>
                  
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
