"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Sparkles, Save } from "lucide-react"

type Grade = 'A' | 'B' | 'C' | 'D' | null

interface StudentEvaluation {
  id: string
  name: string
  avatarColor: string
  grades: {
    graphie: Grade
    fluide: Grade
    intonation: Grade
  }
}

const initialStudents: StudentEvaluation[] = [
  {
    id: "1",
    name: "Sami Benali",
    avatarColor: "bg-sky-100 text-sky-600",
    grades: { graphie: null, fluide: null, intonation: null }
  },
  {
    id: "2",
    name: "Lina Mansouri",
    avatarColor: "bg-pink-100 text-pink-600",
    grades: { graphie: 'A', fluide: 'B', intonation: 'A' }
  },
  {
    id: "3",
    name: "Yanis Kaddour",
    avatarColor: "bg-amber-100 text-amber-600",
    grades: { graphie: 'C', fluide: 'D', intonation: 'C' }
  }
]

const criteriaList = [
  { id: 'graphie', label: 'Graphie/Phonie' },
  { id: 'fluide', label: 'Lecture fluide' },
  { id: 'intonation', label: 'Intonation' }
] as const

const gradeConfig = {
  A: { label: 'A', activeClass: 'bg-emerald-100 text-emerald-700 font-bold border-emerald-200 z-10', hoverClass: 'hover:bg-emerald-50' },
  B: { label: 'B', activeClass: 'bg-blue-100 text-blue-700 font-bold border-blue-200 z-10', hoverClass: 'hover:bg-blue-50' },
  C: { label: 'C', activeClass: 'bg-amber-100 text-amber-700 font-bold border-amber-200 z-10', hoverClass: 'hover:bg-amber-50' },
  D: { label: 'D', activeClass: 'bg-rose-100 text-rose-700 font-bold border-rose-200 z-10', hoverClass: 'hover:bg-rose-50' }
}

export function EvaluationGrid() {
  const [students, setStudents] = useState<StudentEvaluation[]>(initialStudents)

  const handleGradeChange = (studentId: string, criterion: keyof StudentEvaluation['grades'], grade: Grade) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, grades: { ...student.grades, [criterion]: grade } }
        : student
    ))
  }

  const setAllToB = () => {
    setStudents(prev => prev.map(student => ({
      ...student,
      grades: { graphie: 'B', fluide: 'B', intonation: 'B' }
    })))
  }

  return (
    <div className="flex flex-col h-full relative pb-24">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">
            Évaluation des acquis : Lecture 📚
          </h1>
          <p className="text-slate-500 font-medium">
            Classe 5ème AP - 28 Élèves
          </p>
        </div>
        
        <button 
          onClick={setAllToB}
          className="flex items-center gap-2 bg-purple-100 text-purple-700 px-5 py-3 rounded-2xl font-bold hover:bg-purple-200 transition-colors active:scale-95 shadow-sm border border-purple-200"
        >
          <Sparkles className="w-5 h-5" />
          Mettre &apos;B&apos; à toute la classe
        </button>
      </div>

      {/* Student Cards List */}
      <div className="flex flex-col gap-4">
        {students.map((student) => (
          <motion.div 
            key={student.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-6 lg:items-center hover:shadow-md transition-shadow"
          >
            {/* Student Info */}
            <div className="flex items-center gap-4 lg:w-1/4 shrink-0">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${student.avatarColor}`}>
                {student.name.charAt(0)}
              </div>
              <span className="font-bold text-lg text-slate-800">{student.name}</span>
            </div>

            {/* Criteria */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {criteriaList.map((criterion) => (
                <div key={criterion.id} className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {criterion.label}
                  </span>
                  
                  {/* Segmented Control */}
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1 gap-1">
                    {(Object.keys(gradeConfig) as Grade[]).map((grade) => {
                      if (!grade) return null;
                      const isSelected = student.grades[criterion.id] === grade
                      const config = gradeConfig[grade]
                      
                      return (
                        <button
                          key={grade}
                          onClick={() => handleGradeChange(student.id, criterion.id, grade)}
                          className={`flex-1 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isSelected 
                              ? config.activeClass + ' shadow-sm'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          {config.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 z-50 flex justify-center md:pl-64">
        <button className="flex items-center gap-3 bg-gradient-to-r from-orange-400 to-rose-500 text-white px-8 py-4 rounded-full font-black text-lg shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-1 transition-all active:translate-y-0 w-full max-w-md justify-center">
          <Save className="w-6 h-6" />
          Enregistrer l&apos;évaluation 🚀
        </button>
      </div>
    </div>
  )
}
