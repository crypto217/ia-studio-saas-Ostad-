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
          Évaluation Continue (Notes sur 10) 📊
        </h1>
        <p className="text-slate-500 font-medium text-lg mb-6">
          Classe {className} - 28 Élèves
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
                    <div className="flex items-center gap-2 sm:gap-3">
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
      <div className="block md:hidden space-y-4">
        {students.map((student) => {
          const contAvg = calculateContinuousAvg(student)
          const genAvg = calculateGeneralAvg(student)
          
          return (
            <motion.div 
              key={`mobile-${student.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-4 border border-slate-100"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 border-b border-slate-50 pb-3">
                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${student.avatarColor}`}>
                  {student.name.charAt(0)}
                </div>
                <span className="font-bold text-slate-800 text-lg">{student.name}</span>
              </div>

              {/* Body (Inputs) */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Oral (Prod.) / 10</label>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    value={student.oral}
                    onChange={(e) => handleMarkChange(student.id, 'oral', e.target.value)}
                    className="w-full text-center border border-slate-200 rounded-md py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Lecture Comptine / 10</label>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    value={student.lecture}
                    onChange={(e) => handleMarkChange(student.id, 'lecture', e.target.value)}
                    className="w-full text-center border border-slate-200 rounded-md py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Copie Dictée / 10</label>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    value={student.copie}
                    onChange={(e) => handleMarkChange(student.id, 'copie', e.target.value)}
                    className="w-full text-center border border-slate-200 rounded-md py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Composition / 10</label>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    value={student.composition}
                    onChange={(e) => handleMarkChange(student.id, 'composition', e.target.value)}
                    className="w-full text-center border border-slate-200 rounded-md py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              {/* Footer (Averages) */}
              <div className="bg-slate-50 rounded-lg p-3 mt-4 flex justify-between items-center border border-slate-100">
                <div className="text-center">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Moy. Éval. Continue</span>
                  <span className="font-black text-indigo-700 text-lg">{formatNumber(contAvg)}</span>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="text-center">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Moy. Générale</span>
                  <span className="font-black text-indigo-700 text-lg">{formatNumber(genAvg)}</span>
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
