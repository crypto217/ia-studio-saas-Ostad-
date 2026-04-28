"use client"

import React, { useState, useEffect, use } from "react"
import { motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Users, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  MapPin,
  Award,
  Sparkles,
  BookOpen,
  ArrowLeft
} from "lucide-react"

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
  studentsCount: number
  average: number
  schedule: string
  room: string
  students: Student[]
}

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

export default function ClassDetailsPage({ params }: { params: Promise<{ classId: string }> }) {
  const router = useRouter()
  const { classId } = use(params)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClass = () => {
      const saved = localStorage.getItem('ludiclass_mock_classes')
      if (saved) {
        try {
          const classes: ClassData[] = JSON.parse(saved)
          setSelectedClass(classes.find(c => c.id === classId) || null)
        } catch (e) {
          console.error("Error parsing", e)
        }
      }
      setIsLoading(false)
    }
    fetchClass()
  }, [classId])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <BookOpen className="w-12 h-12 text-slate-300" />
          <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!selectedClass) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-16 h-16 text-rose-400 mb-4" />
        <h2 className="text-2xl font-black text-slate-700 mb-2">Classe introuvable</h2>
        <p className="text-slate-500 mb-6">Cette classe n&apos;existe pas ou a été supprimée.</p>
        <button 
          onClick={() => router.push('/classes')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition-colors"
        >
          Retour aux classes
        </button>
      </div>
    )
  }

  const theme = themeStyles[selectedClass.theme]
  
  return (
    <div className="bg-slate-50 min-h-full">
      {/* Class Header */}
      <div className={`bg-gradient-to-br ${theme.gradient} px-4 py-6 sm:px-8 sm:py-10 text-white relative shadow-sm rounded-[2rem] sm:rounded-3xl`}>
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => router.push('/classes')}
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
              onClick={() => router.push(`/students/${student.id}?classId=${selectedClass.id}`)}
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
