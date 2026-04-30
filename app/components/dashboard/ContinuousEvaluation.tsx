"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface StudentMarks {
  id: string
  name: string
  avatarColor: string
  oral: number | ''
  lecture: number | ''
  copie: number | ''
  composition: number | ''
}

const initialStudents: StudentMarks[] = [
  { id: "1", name: "Sami Benali", avatarColor: "bg-sky-100 text-sky-600", oral: '', lecture: '', copie: '', composition: '' },
  { id: "2", name: "Lina Mansouri", avatarColor: "bg-pink-100 text-pink-600", oral: 8, lecture: 7.5, copie: 9, composition: 8.5 },
  { id: "3", name: "Yanis Kaddour", avatarColor: "bg-amber-100 text-amber-600", oral: 5, lecture: 6, copie: 4.5, composition: 5.5 },
]

export default function ContinuousEvaluation({ classId }: { classId: string }) {
  const [students, setStudents] = useState<StudentMarks[]>(initialStudents)

  const handleMarkChange = (studentId: string, field: keyof Omit<StudentMarks, 'id'|'name'|'avatarColor'>, value: string) => {
    let numValue: number | '' = value === '' ? '' : parseFloat(value)
    if (numValue !== '' && (numValue < 0 || numValue > 10)) return // validation
    
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, [field]: numValue } : s))
  }

  const calculateContinuousAvg = (s: StudentMarks) => {
    if (s.oral === '' || s.lecture === '' || s.copie === '') return null
    return ((s.oral + s.lecture + s.copie) / 3)
  }

  const calculateGeneralAvg = (s: StudentMarks) => {
    const contAvg = calculateContinuousAvg(s)
    if (contAvg === null || s.composition === '') return null
    return ((contAvg + s.composition) / 2)
  }

  const formatNumber = (num: number | null) => {
    if (num === null) return "-"
    return num.toFixed(2)
  }

  const className = classId === '3ap' ? '3ème AP' : classId === '4ap' ? '4ème AP' : '5ème AP'

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
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight mb-1 sm:mb-2 text-balance">
          Évaluation Continue (Notes sur 10) 📊
        </h1>
        <p className="text-slate-500 font-medium text-sm sm:text-lg mb-4 sm:mb-6">
          Classe {className} - <span className="text-slate-700 font-bold">{students.length} Élèves</span>
        </p>
      </div>

      {/* Desktop View (Table) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto"
      >
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="w-32 sm:w-48 px-3 py-3 text-sm leading-tight whitespace-normal font-extrabold text-slate-700 border-r border-slate-200 sticky left-0 bg-slate-100 z-20 shadow-[1px_0_0_0_#e2e8f0]">
                Nom et prénom
              </th>
              <th className="px-2 py-3 text-sm leading-tight whitespace-normal font-extrabold text-slate-700 text-center border-r border-slate-200">
                Oral (Prod.) / 10
              </th>
              <th className="px-2 py-3 text-sm leading-tight whitespace-normal font-extrabold text-slate-700 text-center border-r border-slate-200">
                Lecture Comptine / 10
              </th>
              <th className="px-2 py-3 text-sm leading-tight whitespace-normal font-extrabold text-slate-700 text-center border-r border-slate-200">
                Copie Dictée / 10
              </th>
              <th className="px-2 py-3 text-sm leading-tight whitespace-normal font-extrabold text-indigo-700 text-center border-r border-slate-200 bg-indigo-50/50">
                Moy. Éval. Continue
              </th>
              <th className="px-2 py-3 text-sm leading-tight whitespace-normal font-extrabold text-slate-700 text-center border-r border-slate-200">
                Composition / 10
              </th>
              <th className="px-2 py-3 text-sm leading-tight whitespace-normal font-extrabold text-indigo-700 text-center bg-indigo-50/50">
                Moy. Générale
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => {
              const contAvg = calculateContinuousAvg(student)
              const genAvg = calculateGeneralAvg(student)
              
              return (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-3 py-3 border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors z-10 shadow-[1px_0_0_0_#e2e8f0]">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${student.avatarColor}`}>
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800 truncate">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 border-r border-slate-200 text-center">
                    <input 
                      type="number" 
                      min="0" max="10" step="0.25"
                      value={student.oral}
                      onChange={(e) => handleMarkChange(student.id, 'oral', e.target.value)}
                      className="w-full max-w-[4rem] mx-auto text-center border border-slate-200 rounded-md py-1.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700"
                    />
                  </td>
                  <td className="px-2 py-3 border-r border-slate-200 text-center">
                    <input 
                      type="number" 
                      min="0" max="10" step="0.25"
                      value={student.lecture}
                      onChange={(e) => handleMarkChange(student.id, 'lecture', e.target.value)}
                      className="w-full max-w-[4rem] mx-auto text-center border border-slate-200 rounded-md py-1.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700"
                    />
                  </td>
                  <td className="px-2 py-3 border-r border-slate-200 text-center">
                    <input 
                      type="number" 
                      min="0" max="10" step="0.25"
                      value={student.copie}
                      onChange={(e) => handleMarkChange(student.id, 'copie', e.target.value)}
                      className="w-full max-w-[4rem] mx-auto text-center border border-slate-200 rounded-md py-1.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700"
                    />
                  </td>
                  <td className="px-2 py-3 border-r border-slate-200 text-center bg-indigo-50/30">
                    <span className="font-bold text-indigo-700 text-base sm:text-lg">{formatNumber(contAvg)}</span>
                  </td>
                  <td className="px-2 py-3 border-r border-slate-200 text-center">
                    <input 
                      type="number" 
                      min="0" max="10" step="0.25"
                      value={student.composition}
                      onChange={(e) => handleMarkChange(student.id, 'composition', e.target.value)}
                      className="w-full max-w-[4rem] mx-auto text-center border border-slate-200 rounded-md py-1.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700"
                    />
                  </td>
                  <td className="px-2 py-3 text-center bg-indigo-50/30">
                    <span className="font-bold text-indigo-700 text-base sm:text-lg">{formatNumber(genAvg)}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Mobile View (Cards) */}
      <div className="block md:hidden space-y-4 mt-6">
        {students.map((student) => {
          const contAvg = calculateContinuousAvg(student)
          const genAvg = calculateGeneralAvg(student)
          
          return (
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
                <span className="font-bold text-slate-800 text-xl tracking-tight">{student.name}</span>
              </div>

              {/* Body (Inputs) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Oral / 10</label>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    value={student.oral}
                    onChange={(e) => handleMarkChange(student.id, 'oral', e.target.value)}
                    className="w-full text-center border-2 border-slate-100 rounded-xl py-2.5 focus:bg-indigo-50/30 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-slate-50 hover:bg-slate-100 transition-all font-black text-slate-700 text-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lecture / 10</label>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    value={student.lecture}
                    onChange={(e) => handleMarkChange(student.id, 'lecture', e.target.value)}
                    className="w-full text-center border-2 border-slate-100 rounded-xl py-2.5 focus:bg-indigo-50/30 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-slate-50 hover:bg-slate-100 transition-all font-black text-slate-700 text-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Copie / 10</label>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    value={student.copie}
                    onChange={(e) => handleMarkChange(student.id, 'copie', e.target.value)}
                    className="w-full text-center border-2 border-slate-100 rounded-xl py-2.5 focus:bg-indigo-50/30 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-slate-50 hover:bg-slate-100 transition-all font-black text-slate-700 text-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide text-indigo-600">Compo / 10</label>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    value={student.composition}
                    onChange={(e) => handleMarkChange(student.id, 'composition', e.target.value)}
                    className="w-full text-center border-2 border-indigo-100 rounded-xl py-2.5 focus:bg-indigo-50/30 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 transition-all font-black text-indigo-700 text-lg"
                  />
                </div>
              </div>

              {/* Footer (Averages) */}
              <div className="bg-slate-50 rounded-xl p-4 mt-5 flex justify-between items-center border border-slate-100">
                <div className="flex flex-col items-center flex-1">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Moy. Continue</span>
                  <span className="font-black text-slate-700 text-xl">{formatNumber(contAvg)}</span>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="flex flex-col items-center flex-1">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Moy. Générale</span>
                  <span className="font-black text-indigo-600 text-2xl drop-shadow-sm">{formatNumber(genAvg)}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Static Footer */}
      <div className="mt-8 mb-8 flex justify-end">
        <button className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-black text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all active:translate-y-0 w-full sm:w-auto">
          <Save className="w-5 h-5" />
          Enregistrer les notes
        </button>
      </div>
    </div>
  )
}
