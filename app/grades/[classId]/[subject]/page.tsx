"use client"

import { useState, Fragment, use } from "react"
import { motion } from "motion/react"
import { Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import ContinuousEvaluation from "@/app/components/dashboard/ContinuousEvaluation"

type Grade = 'A' | 'B' | 'C' | 'D' | null

interface StudentEvaluation {
  id: string
  name: string
  avatarColor: string
  grades: Record<string, Grade>
}

const initialStudents: StudentEvaluation[] = [
  { id: "1", name: "Sami Benali", avatarColor: "bg-sky-100 text-sky-600", grades: {} },
  { id: "2", name: "Lina Mansouri", avatarColor: "bg-pink-100 text-pink-600", grades: {} },
  { id: "3", name: "Yanis Kaddour", avatarColor: "bg-amber-100 text-amber-600", grades: {} },
  { id: "4", name: "Inès Merah", avatarColor: "bg-emerald-100 text-emerald-600", grades: {} }
]

const subjectsData: Record<string, { title: string, criteria: { id: string, label: string }[] }> = {
  oral: {
    title: "Compréhension et communication orales",
    criteria: [
      { id: 'c1', label: "Identifier le thème de la situation de communication" },
      { id: 'c2', label: "Identifier les unités de sens" },
      { id: 'c3', label: "S'exprimer en fonction de la situation de communication" }
    ]
  },
  lecture: {
    title: "Lecture",
    criteria: [
      { id: 'c1', label: "Activer la correspondance graphie/phonie" },
      { id: 'c2', label: "Réaliser une lecture fluide" },
      { id: 'c3', label: "Respecter l'intonation" }
    ]
  },
  ecrit: {
    title: "Compréhension de l'écrit",
    criteria: [
      { id: 'c1', label: "Identifier le thème général du texte" },
      { id: 'c2', label: "Identifier le champ lexical relatif au thème" },
      { id: 'c3', label: "Repérer des informations" }
    ]
  },
  production: {
    title: "Production écrite",
    criteria: [
      { id: 'c1', label: "Pertinence du texte produit" },
      { id: 'c2', label: "Cohérence du texte produit" },
      { id: 'c3', label: "Correction de la langue" },
      { id: 'c4', label: "Lisibilité de l'écrit" }
    ]
  }
}

export default function SubjectEvaluationPage({ params }: { params: Promise<{ classId: string, subject: string }> }) {
  const { classId, subject } = use(params)
  
  if (subject === 'continuous') {
    return <ContinuousEvaluation classId={classId} />
  }

  return <SubjectEvaluationGrid classId={classId} subject={subject} />
}

function SubjectEvaluationGrid({ classId, subject }: { classId: string, subject: string }) {
  const data = subjectsData[subject]

  if (!data) {
    notFound()
  }

  const [students, setStudents] = useState<StudentEvaluation[]>(initialStudents)

  const handleGradeChange = (studentId: string, criterionId: string, grade: Grade) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const currentGrade = student.grades[criterionId]
        const newGrade = currentGrade === grade ? null : grade
        return { ...student, grades: { ...student.grades, [criterionId]: newGrade } }
      }
      return student
    }))
  }

  const setAllToB = () => {
    setStudents(prev => prev.map(student => {
      const newGrades: Record<string, Grade> = {}
      data.criteria.forEach(c => newGrades[c.id] = 'B')
      return { ...student, grades: newGrades }
    }))
  }

  const className = classId === '3ap' ? '3ème AP' : classId === '4ap' ? '4ème AP' : '5ème AP'

  return (
    <div className="bg-[#FFFAF3] min-h-[calc(100vh-5rem)] -m-4 md:-m-8 p-4 md:p-8 pb-32 relative">
      {/* Navigation */}
      <Link 
        href={`/grades/${classId}`} 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux évaluations
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
          Évaluation : {data.title}
        </h1>
        <p className="text-slate-500 font-medium text-lg mb-6">
          Classe {className} - 28 Élèves
        </p>
      </div>

      {/* Official Table Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto"
      >
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th rowSpan={2} className="p-4 font-extrabold text-slate-700 border-r border-slate-200 sticky left-0 bg-slate-50 z-20 shadow-[1px_0_0_0_#e2e8f0] align-bottom">
                Nom et prénom
              </th>
              {data.criteria.map((criterion, index) => {
                const isZebra = index % 2 === 1;
                return (
                  <th key={criterion.id} colSpan={4} className={`p-4 font-extrabold text-slate-700 text-center border-r border-slate-200 last:border-r-0 ${isZebra ? 'bg-slate-50' : 'bg-white'}`}>
                    {criterion.label}
                  </th>
                )
              })}
            </tr>
            <tr className="border-b border-slate-200">
              {data.criteria.map((criterion) => (
                <Fragment key={`sub-${criterion.id}`}>
                  {(['A', 'B', 'C', 'D'] as const).map((grade) => {
                    const bgClasses = {
                      A: 'bg-green-600',
                      B: 'bg-lime-400',
                      C: 'bg-amber-400',
                      D: 'bg-red-600'
                    };
                    
                    return (
                      <th key={`${criterion.id}-${grade}`} className={`p-2 text-center w-12 text-black font-extrabold ${bgClasses[grade]} border-r border-slate-300 last:border-r-0`}>
                        {grade}
                      </th>
                    );
                  })}
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-3 border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors z-10 shadow-[1px_0_0_0_#e2e8f0]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${student.avatarColor}`}>
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800 whitespace-nowrap">{student.name}</span>
                  </div>
                </td>
                {data.criteria.map((criterion, index) => (
                  <Fragment key={`cells-${student.id}-${criterion.id}`}>
                    {(['A', 'B', 'C', 'D'] as Grade[]).map((grade) => {
                      if (!grade) return null;
                      const isSelected = student.grades[criterion.id] === grade;
                      const isZebra = index % 2 === 1;
                      
                      let bgClass = '';
                      if (isSelected) {
                        bgClass = isZebra ? 'bg-slate-100' : 'bg-slate-50';
                      } else {
                        bgClass = isZebra ? 'bg-slate-50 hover:bg-slate-100' : 'bg-white hover:bg-slate-50';
                      }
                      
                      return (
                        <td 
                          key={`${student.id}-${criterion.id}-${grade}`}
                          onClick={() => handleGradeChange(student.id, criterion.id, grade)}
                          className={`border-r border-slate-200 p-0 cursor-pointer transition-colors last:border-r-0 relative ${bgClass}`}
                        >
                          <div className="flex items-center justify-center h-12 w-full select-none relative">
                            {isSelected ? (
                              <span className="text-red-600 font-black text-3xl leading-none">X</span>
                            ) : (
                              <span className="text-slate-300 font-bold">{grade}</span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Static Footer */}
      <div className="mt-8 mb-8 flex justify-end">
        <button className="flex items-center justify-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-full font-black text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all active:translate-y-0 w-full sm:w-auto">
          Enregistrer l&apos;évaluation 🚀
        </button>
      </div>
    </div>
  )
}
