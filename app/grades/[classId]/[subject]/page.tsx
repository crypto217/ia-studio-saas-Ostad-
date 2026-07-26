"use client"

import { useState, Fragment, use, useEffect } from "react"
import { motion } from "motion/react"
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import ContinuousEvaluation from "@/app/components/dashboard/ContinuousEvaluation"
import { useAuth } from "@/components/AuthProvider"
import { createBrowserClient } from "@/lib/supabase"

type Grade = 'A' | 'B' | 'C' | 'D' | null

interface StudentEvaluation {
  id: string
  name: string
  avatarColor: string
  grades: Record<string, Grade>
}

const subjectsData: Record<string, { title: string, criteria: { id: string, label: string }[] }> = {
  oral: {
    title: "Compréhension et communication orales",
    criteria: [
      { id: 'c1', label: "Thème de la situation" },
      { id: 'c2', label: "Unités de sens" },
      { id: 'c3', label: "Expression adaptée" }
    ]
  },
  lecture: {
    title: "Lecture",
    criteria: [
      { id: 'c1', label: "Correspondance graphie/phonie" },
      { id: 'c2', label: "Fluidité (mots/min)" },
      { id: 'c3', label: "Intonation" }
    ]
  },
  ecrit: {
    title: "Compréhension de l'écrit",
    criteria: [
      { id: 'c1', label: "Thème général" },
      { id: 'c2', label: "Champ lexical" },
      { id: 'c3', label: "Repérage d'informations" }
    ]
  },
  production: {
    title: "Production écrite",
    criteria: [
      { id: 'c1', label: "Pertinence" },
      { id: 'c2', label: "Cohérence" },
      { id: 'c3', label: "Correction de la langue" },
      { id: 'c4', label: "Lisibilité" }
    ]
  }
}

export default function SubjectEvaluationPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ classId: string, subject: string }>,
  searchParams: Promise<{ t?: string }>
}) {
  const { classId, subject } = use(params)
  const resolvedSearchParams = use(searchParams)
  const trimestre = resolvedSearchParams.t || "1"
  
  if (subject === 'continuous') {
    return <ContinuousEvaluation classId={classId} trimestre={trimestre} />
  }

  return <SubjectEvaluationGrid classId={classId} subject={subject} trimestre={trimestre} />
}

function SubjectEvaluationGrid({ classId, subject, trimestre }: { classId: string, subject: string, trimestre: string }) {
  const data = subjectsData[subject]

  if (!data) {
    notFound()
  }

  const { user, isAuthReady } = useAuth()
  const [students, setStudents] = useState<StudentEvaluation[]>([])
  const [className, setClassName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [wordCounts, setWordCounts] = useState<Record<string, string>>({})
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!isAuthReady || !user?.id || !classId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // 1. Fetch class details to get className
        const { data: classDoc } = await supabase
          .from('classes')
          .select('name')
          .eq('id', classId)
          .eq('teacher_id', user.id)
          .single()
        
        if (classDoc) {
          setClassName(classDoc.name)
        }

        // 2. Fetch students for this class
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', classId)
          .eq('teacher_id', user.id)

        if (studentsError) throw studentsError

        if (studentsData) {
          // 3. Fetch existing grades for this subject/trimester/students
          const { data: gradesData, error: gradesError } = await supabase
            .from('grades')
            .select('*')
            .eq('teacher_id', user.id)
            .in('student_id', studentsData.map(s => s.id))
            .like('subject', `${classId}_${subject}_%_t${trimestre}`)

          if (gradesError) throw gradesError

          const initialGrades: Record<string, Record<string, Grade>> = {}
          studentsData.forEach(s => {
            initialGrades[s.id] = {}
          })

          gradesData?.forEach(g => {
            const parts = g.subject.split('_')
            if (parts.length >= 3) {
              const criterionId = parts[2]
              if (initialGrades[g.student_id]) {
                initialGrades[g.student_id][criterionId] = g.score as Grade
              }
            }
          })

          const mapped = studentsData.map(s => ({
            id: s.id,
            name: s.name,
            avatarColor: s.gender === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-sky-100 text-sky-600',
            grades: initialGrades[s.id] || {}
          }))
          setStudents(mapped)
        }
      } catch (err) {
        console.error("Error loading evaluations:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, isAuthReady, classId, subject, trimestre])

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

  const handleSave = async () => {
    if (!user?.id || students.length === 0) return
    setIsSaving(true)
    try {
      // 1. Delete existing grades for this subject/trimester/students
      const { error: deleteError } = await supabase
        .from('grades')
        .delete()
        .eq('teacher_id', user.id)
        .in('student_id', students.map(s => s.id))
        .like('subject', `${classId}_${subject}_%_t${trimestre}`)

      if (deleteError) throw deleteError

      // 2. Prepare new rows to insert
      const rowsToInsert: any[] = []
      students.forEach(student => {
        data.criteria.forEach(criterion => {
          const score = student.grades[criterion.id]
          if (score !== null) {
            rowsToInsert.push({
              student_id: student.id,
              teacher_id: user.id,
              subject: `${classId}_${subject}_${criterion.id}_t${trimestre}`,
              score: score
            })
          }
        })
      })

      if (rowsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('grades')
          .insert(rowsToInsert)

        if (insertError) throw insertError
      }

      alert("Évaluation enregistrée avec succès ! 🚀")
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'enregistrement de l'évaluation.")
    } finally {
      setIsSaving(false)
    }
  }

  const displayedTrimestre = trimestre === "1" ? "1er Trimestre" : `${trimestre}ème Trimestre`

  if (loading) {
    return (
      <div className="bg-[#FFFAF3] min-h-[calc(100vh-5rem)] -mx-4 -mt-4 md:-mx-8 md:-mt-8 flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-2" />
        <p className="text-slate-500 font-medium">Chargement des élèves et des notes...</p>
      </div>
    )
  }


  return (
    <div className="bg-[#FFFAF3] min-h-[calc(100vh-5rem)] -mx-4 -mt-4 md:-mx-8 md:-mt-8 px-4 py-6 md:px-8 md:py-8 pb-32 relative">
      {/* Navigation */}
      <Link 
        href={`/grades/${classId}`} 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux évaluations
      </Link>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1 sm:mb-2 text-balance">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
            Évaluation : {data.title}
          </h1>
          <span className="hidden md:inline-block text-2xl text-slate-300 font-black">•</span>
          <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm md:text-lg font-bold self-start md:self-auto">
            {displayedTrimestre}
          </span>
        </div>
        <p className="text-slate-500 font-medium text-sm sm:text-lg mb-4 sm:mb-6 mt-2 md:mt-0">
          Classe {className} - <span className="text-slate-700 font-bold">{students.length} Élèves</span>
        </p>
      </div>

      {/* Official Table Grid (Desktop) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto"
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
                    <div className="flex flex-col">
                      <Link href={`/students/${student.id}`} className="font-bold text-slate-800 whitespace-nowrap transition-opacity hover:opacity-75">
                        {student.name}
                      </Link>
                      {subject === 'lecture' && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400">Mots/min :</span>
                          <input
                            type="number"
                            placeholder="0"
                            className="w-12 px-1 py-0.2 text-[10px] font-black border border-slate-300 focus:border-indigo-500 rounded outline-none"
                            value={wordCounts[student.id] || ''}
                            onChange={(e) => {
                              const valStr = e.target.value;
                              setWordCounts(prev => ({ ...prev, [student.id]: valStr }));
                              if (valStr !== '') {
                                const val = parseInt(valStr);
                                let grade: 'A' | 'B' | 'C' | 'D' = 'D';
                                if (val >= 40) grade = 'A';
                                else if (val >= 30) grade = 'B';
                                else if (val >= 20) grade = 'C';
                                handleGradeChange(student.id, 'c2', grade);
                              } else {
                                handleGradeChange(student.id, 'c2', null);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
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

      {/* Mobile View (Cards) */}
      <div className="block md:hidden space-y-4">
        {students.map((student) => (
          <motion.div 
            key={`mobile-${student.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[1.5rem] shadow-sm p-4 sm:p-5 border border-slate-100"
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4">
              <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${student.avatarColor}`}>
                {student.name.charAt(0)}
              </div>
              <Link href={`/students/${student.id}`} className="font-bold text-slate-800 text-xl tracking-tight transition-opacity hover:opacity-75">
                {student.name}
              </Link>
            </div>

            {/* Criteria List */}
            <div className="space-y-6">
              {data.criteria.map((criterion) => (
                <div key={`${student.id}-${criterion.id}`} className="space-y-3">
                  <p className="text-sm font-bold text-slate-700 leading-tight">{criterion.label}</p>
                  
                  {criterion.id === 'c2' && subject === 'lecture' && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-500">Calculateur :</span>
                      <input
                        type="number"
                        placeholder="Mots lus"
                        className="w-20 px-2 py-1 text-xs font-black border border-slate-300 focus:border-indigo-500 rounded-lg outline-none bg-white"
                        value={wordCounts[student.id] || ''}
                        onChange={(e) => {
                          const valStr = e.target.value;
                          setWordCounts(prev => ({ ...prev, [student.id]: valStr }));
                          if (valStr !== '') {
                            const val = parseInt(valStr);
                            let grade: 'A' | 'B' | 'C' | 'D' = 'D';
                            if (val >= 40) grade = 'A';
                            else if (val >= 30) grade = 'B';
                            else if (val >= 20) grade = 'C';
                            handleGradeChange(student.id, 'c2', grade);
                          } else {
                            handleGradeChange(student.id, 'c2', null);
                          }
                        }}
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase">mots/min</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {(['A', 'B', 'C', 'D'] as Grade[]).map((grade) => {
                      if (!grade) return null
                      const isSelected = student.grades[criterion.id] === grade
                      
                      let btnClass = 'bg-slate-50 text-slate-400 border-slate-200'
                      if (isSelected) {
                        if (grade === 'A') btnClass = 'bg-green-500 text-white border-green-600 shadow-md ring-2 ring-green-500/20'
                        if (grade === 'B') btnClass = 'bg-lime-500 text-white border-lime-600 shadow-md ring-2 ring-lime-500/20'
                        if (grade === 'C') btnClass = 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20'
                        if (grade === 'D') btnClass = 'bg-red-500 text-white border-red-600 shadow-md ring-2 ring-red-500/20'
                      }
                      
                      return (
                        <button
                          key={grade}
                          onClick={() => handleGradeChange(student.id, criterion.id, grade)}
                          className={`flex-1 py-3 rounded-xl font-black text-lg border transition-all active:scale-95 touch-manipulation ${btnClass}`}
                        >
                          {grade}
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

      {/* Static Footer */}
      <div className="mt-8 mb-8 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-full font-black text-base sm:text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all active:translate-y-0 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Enregistrement en cours... ⏳" : "Enregistrer l'évaluation 🚀"}
        </button>
      </div>
    </div>
  )
}
