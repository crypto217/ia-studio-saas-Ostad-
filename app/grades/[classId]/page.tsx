"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ClipboardList, ArrowRight, ArrowLeft } from "lucide-react"
import { use } from "react"

const evaluationTypes = [
  { id: 'oral', title: 'Compréhension et communication orales', icon: '🗣️', criteriaCount: 3, color: 'from-sky-100 to-blue-100', textColor: 'text-blue-700', borderColor: 'hover:border-blue-200' },
  { id: 'lecture', title: 'Lecture', icon: '📖', criteriaCount: 3, color: 'from-orange-100 to-rose-100', textColor: 'text-rose-700', borderColor: 'hover:border-rose-200' },
  { id: 'ecrit', title: "Compréhension de l'écrit", icon: '🧠', criteriaCount: 3, color: 'from-emerald-100 to-teal-100', textColor: 'text-teal-700', borderColor: 'hover:border-teal-200' },
  { id: 'production', title: 'Production écrite', icon: '✍️', criteriaCount: 4, color: 'from-purple-100 to-fuchsia-100', textColor: 'text-purple-700', borderColor: 'hover:border-purple-200' },
  { id: 'continuous', title: 'Évaluation Continue (Notes sur 10)', icon: '📊', criteriaCount: 'Notes', color: 'from-indigo-100 to-violet-100', textColor: 'text-indigo-700', borderColor: 'hover:border-indigo-200' }
]

export default function ClassEvaluationsMenu({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = use(params)
  const className = classId === '3ap' ? '3ème AP' : classId === '4ap' ? '4ème AP' : '5ème AP'

  return (
    <div className="min-h-screen pb-28 md:pb-24 bg-[#FFFAF3]">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-6 md:py-8 sm:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <Link 
            href="/grades" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux classes
          </Link>

          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">Évaluations <br className="block sm:hidden" /> <span className="text-indigo-600">- {className}</span></h1>
          </div>
          <p className="text-slate-500 font-medium text-sm sm:text-lg max-w-2xl mt-3 sm:mt-0">
            Sélectionnez le domaine d&apos;apprentissage pour saisir les évaluations.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6 sm:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {evaluationTypes.map((type) => (
            <Link key={type.id} href={`/grades/${classId}/${type.id}`} className="block group">
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-md sm:shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all border-2 border-slate-100 ${type.borderColor} flex flex-row items-center justify-between gap-4 sm:gap-6 h-full`}
              >
                <div className="flex flex-row items-center gap-4 sm:gap-6 w-full">
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl sm:text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-1 sm:mb-2 leading-tight">
                      {type.title}
                    </h3>
                    <span className={`inline-flex items-center text-xs sm:px-3 sm:py-1 sm:rounded-lg sm:text-sm font-bold sm:bg-slate-50 ${type.textColor}`}>
                      {type.criteriaCount === 'Notes' ? 'Notes sur 10' : `${type.criteriaCount} critères`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end shrink-0">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
