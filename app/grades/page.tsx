"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { Users, ArrowRight } from "lucide-react"

const classesList = [
  { id: '3ap', title: '3ème AP', studentsCount: 25, color: 'from-blue-100 to-indigo-100', textColor: 'text-indigo-700', borderColor: 'hover:border-indigo-200' },
  { id: '4ap', title: '4ème AP', studentsCount: 28, color: 'from-emerald-100 to-teal-100', textColor: 'text-teal-700', borderColor: 'hover:border-teal-200' },
  { id: '5ap', title: '5ème AP', studentsCount: 26, color: 'from-orange-100 to-rose-100', textColor: 'text-rose-700', borderColor: 'hover:border-rose-200' }
]

export default function ClassesMenu() {
  return (
    <div className="min-h-screen pb-28 md:pb-24 bg-[#FFFAF3]">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-6 md:py-8 sm:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">Mes Classes<br className="block sm:hidden" /><span className="text-slate-400 font-bold hidden sm:inline"> - Carnet de notes</span></h1>
          </div>
          <p className="text-slate-500 font-medium text-sm sm:text-lg max-w-2xl mt-3 sm:mt-0">
            Sélectionnez une classe pour accéder à ses évaluations.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6 sm:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {classesList.map((cls) => (
            <Link key={cls.id} href={`/grades/${cls.id}`} className="block group">
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-md sm:shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all border-2 border-slate-100 ${cls.borderColor} flex flex-col h-full`}
              >
                <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:mb-6">
                  <div className="flex items-center gap-4 sm:mb-6 w-full sm:w-auto">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-gradient-to-br ${cls.color} flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      <Users className={`w-7 h-7 sm:w-8 sm:h-8 ${cls.textColor}`} />
                    </div>
                    <div className="flex flex-col sm:hidden">
                      <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                        {cls.title}
                      </h3>
                      <span className={`inline-flex items-center text-xs font-bold ${cls.textColor}`}>
                        {cls.studentsCount} élèves
                      </span>
                    </div>
                  </div>
                  
                  {/* Arrow for both mobile and desktop positioned correctly */}
                  <div className="w-10 h-10 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="hidden sm:block">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-2 leading-tight">
                    {cls.title}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-slate-50 ${cls.textColor}`}>
                    {cls.studentsCount} élèves
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
