"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Cake, TrendingUp, AlertCircle, X, Sparkles, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const newsData = [
  {
    id: "1",
    studentName: "Lina M.",
    studentId: "101",
    seed: "lina",
    text: "C'est l'anniversaire de Lina aujourd'hui ! 🎂",
    icon: Cake,
    color: "amber",
    urgent: false,
  },
  {
    id: "2",
    studentName: "Amine K.",
    studentId: "s1", // Linked to mocked profile in [id] component
    seed: "amine",
    text: "Amine a augmenté sa moyenne de 2 points en Français ! 📈",
    icon: TrendingUp,
    color: "emerald",
    urgent: false,
  },
  {
    id: "3",
    studentName: "Sarah B.",
    studentId: "103",
    seed: "sarah",
    text: "Rappel : Sarah n'a pas rendu son dernier devoir.",
    icon: AlertCircle,
    color: "rose",
    urgent: true,
  }
]

type ColorKey = "amber" | "emerald" | "rose"

const colorClasses: Record<ColorKey, { border: string, badgeBg: string }> = {
  amber: {
    border: "border-amber-400",
    badgeBg: "bg-amber-500",
  },
  emerald: {
    border: "border-emerald-400",
    badgeBg: "bg-emerald-500",
  },
  rose: {
    border: "border-rose-500",
    badgeBg: "bg-rose-500",
  }
}

export function StudentNewsRadar() {
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<typeof newsData[0] | null>(null);
  const urgentCount = newsData.filter(item => item.urgent).length;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4 px-1">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Radar de soutien</h3>
        {urgentCount > 0 && (
          <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            {urgentCount}
          </span>
        )}
      </div>

      <div className="flex flex-row items-start gap-4 overflow-x-auto pt-3 pb-4 snap-x scrollbar-hide w-full md:flex-wrap">
        {newsData.map((item, index) => {
          const colors = colorClasses[item.color as ColorKey]
          const Icon = item.icon

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="snap-start"
            >
              <div
                onClick={() => setSelectedStudentForModal(item)}
                className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer"
              >
                <div className="relative">
                  {/* Pulsation si urgent */}
                  {item.urgent && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.badgeBg}`}></span>
                      <span className={`relative inline-flex rounded-full w-3 h-3 m-0.5 border-2 border-white ${colors.badgeBg}`}></span>
                    </span>
                  )}
                  
                  {/* Avatar de l'élève */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-4 ${colors.border} shadow-sm group-hover:scale-105 transition-transform relative z-10 bg-slate-100`}>
                    <Image 
                      src={`https://picsum.photos/seed/${item.seed}/100/100`} 
                      alt={item.studentName}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Petit badge Icon qui chevauche au centre-bas de l'avatar */}
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-20 shadow-sm ${colors.badgeBg} group-hover:scale-110 transition-transform`}>
                     <Icon className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                </div>

                {/* Prénom compact */}
                <span className="text-xs font-bold text-slate-700 truncate w-full text-center group-hover:text-slate-900 transition-colors">
                  {item.studentName.split(' ')[0]}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Modal Popup */}
      <AnimatePresence>
        {selectedStudentForModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudentForModal(null)}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 15, stiffness: 150 }}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-lg w-full relative pointer-events-auto flex flex-col"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedStudentForModal(null)}
                  className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-full transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header: Photo and Name */}
                <div className="flex flex-col items-center mb-6 mt-2">
                  <div className={`w-20 h-20 rounded-full overflow-hidden border-4 shadow-md bg-slate-100 mb-3 relative ${colorClasses[selectedStudentForModal.color as ColorKey].border}`}>
                    <Image
                      src={`https://picsum.photos/seed/${selectedStudentForModal.seed}/200/200`}
                      alt={selectedStudentForModal.studentName}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-800">{selectedStudentForModal.studentName}</h2>
                  <Link 
                    href={`/students/${selectedStudentForModal.studentId}`} 
                    className="text-indigo-500 hover:text-indigo-600 font-bold text-sm flex items-center gap-1 mt-1 transition-colors"
                  >
                    Voir le profil complet <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Body: Alert Block */}
                <div className={`rounded-2xl p-4 sm:p-5 flex items-start gap-4 mb-8 border ${
                  selectedStudentForModal.color === 'emerald' ? 'bg-emerald-50 border-emerald-100/50' :
                  selectedStudentForModal.color === 'amber' ? 'bg-amber-50 border-amber-100/50' :
                  'bg-rose-50 border-rose-100/50'
                }`}>
                  <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${colorClasses[selectedStudentForModal.color as ColorKey].badgeBg}`}>
                    {(() => {
                      const ModalIcon = selectedStudentForModal.icon;
                      return <ModalIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    })()}
                  </div>
                  <div className="flex-1 pt-1 text-slate-700 font-medium leading-relaxed">
                    {selectedStudentForModal.text}
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white px-6 py-4 rounded-xl text-base font-black shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                  <Sparkles className="w-5 h-5" />
                  Générer soutien IA ciblé
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
