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
    <div className="min-h-screen pb-24 bg-[#FFFAF3]">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-8 sm:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <Link 
            href="/grades" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux classes
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Évaluations - {className}</h1>
          </div>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">
            Sélectionnez le domaine d&apos;apprentissage pour saisir les évaluations de la classe.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {evaluationTypes.map((type) => (
            <Link key={type.id} href={`/grades/${classId}/${type.id}`} className="block group">
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all border-2 border-slate-100 ${type.borderColor} flex flex-col sm:flex-row sm:items-center justify-between gap-6 h-full`}
              >
                <div className="flex items-center gap-5 sm:gap-6">
                  <div className={`w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    {type.icon}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-2 leading-tight">
                      {type.title}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-slate-50 ${type.textColor}`}>
                      {type.criteriaCount === 'Notes' ? 'Notes sur 10' : `${type.criteriaCount} critères`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <ArrowRight className="w-6 h-6" />
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
