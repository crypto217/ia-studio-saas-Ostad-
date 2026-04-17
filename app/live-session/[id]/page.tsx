"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, XCircle, Clock, MessageSquare, ShieldAlert, Star, BookX, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const mockStudents = [
  { id: 1, name: "Amine K.", avatar: "bg-blue-100 text-blue-600" },
  { id: 2, name: "Lina M.", avatar: "bg-rose-100 text-rose-600" },
  { id: 3, name: "Sami R.", avatar: "bg-emerald-100 text-emerald-600" },
  { id: 4, name: "Ines H.", avatar: "bg-amber-100 text-amber-600" },
  { id: 5, name: "Yanis B.", avatar: "bg-purple-100 text-purple-600" },
]

export default function LiveSessionPage() {
  const router = useRouter()
  const [attendances, setAttendances] = useState<Record<number, "present" | "absent">>({})
  const [remarks, setRemarks] = useState<Record<number, string[]>>({})
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [customRemarks, setCustomRemarks] = useState<Record<number, string>>({})
  
  const [isEnding, setIsEnding] = useState(false)
  const [saveStep, setSaveStep] = useState<"confirm" | "saving" | "success">("confirm")

  const handleEndSession = () => {
    setSaveStep("saving");
    // Simule le délai réseau vers Firebase
    setTimeout(() => {
      setSaveStep("success");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }, 2000);
  };

  const toggleAttendance = (id: number, status: "present" | "absent") => {
    setAttendances(prev => ({ ...prev, [id]: status }))
  }

  const toggleRemark = (id: number, remark: string) => {
    setRemarks(prev => {
      const studentRemarks = prev[id] || []
      if (studentRemarks.includes(remark)) {
        return { ...prev, [id]: studentRemarks.filter(r => r !== remark) }
      } else {
        return { ...prev, [id]: [...studentRemarks, remark] }
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="relative z-50 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
            <span className="text-xs font-black text-rose-600 tracking-wider uppercase">Live</span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-slate-800 line-clamp-1">CE2 - Mathématiques</h1>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-inner">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-base font-bold text-slate-700 tracking-wider">09:41</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setIsEnding(true); setSaveStep("confirm"); }}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-500/20 font-bold text-sm"
          >
            <span className="hidden sm:inline">Terminer</span>
            <XCircle className="w-4 h-4 sm:hidden" />
          </button>
        </div>
      </header>

      {/* BODY */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">Appel & Comportement</h2>
            <p className="text-slate-500 font-medium text-sm md:text-base">Gérez la présence et attribuez des remarques rapides.</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 inline-flex shrink-0">
            <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center gap-2">
               <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500"></span>
               <span className="font-bold text-slate-700 text-sm">{Object.values(attendances).filter(a => a === 'present').length} Présents</span>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center gap-2">
               <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-rose-500"></span>
               <span className="font-bold text-slate-700 text-sm">{Object.values(attendances).filter(a => a === 'absent').length} Absents</span>
            </div>
          </div>
        </div>

        {/* GRID ELEVES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {mockStudents.map(student => {
            const isPresent = attendances[student.id] === "present"
            const isAbsent = attendances[student.id] === "absent"
            const studentRemarks = remarks[student.id] || []
            const isExpanded = expandedId === student.id

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                key={student.id} 
                className={`bg-white rounded-[2rem] border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${
                  isExpanded ? 'border-indigo-200' : 'border-slate-100'
                }`}
              >
                {/* Haut de la carte : Cliquable pour ouvrir/fermer les remarques */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : student.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${student.avatar}`}>
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800 text-lg">{student.name}</span>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>

                {/* Ligne d'actions rapides : Toujours visible (Présences) */}
                <div className="px-4 pb-4">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleAttendance(student.id, "present") }}
                      className={`flex-1 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${isPresent ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-200"}`}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Présent
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleAttendance(student.id, "absent") }}
                      className={`flex-1 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${isAbsent ? "bg-rose-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-200"}`}
                    >
                      <XCircle className="w-4 h-4" /> Absent
                    </button>
                  </div>
                </div>

                {/* Tiroir d'Observations */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-indigo-50/50 border-t border-indigo-100"
                    >
                      <div className="p-4 space-y-4">
                        {/* Tags rapides */}
                        <div>
                          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">Tags rapides</span>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => toggleRemark(student.id, "sans_livre")} className={`border text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${studentRemarks.includes("sans_livre") ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50"}`}>📚 Sans livre</button>
                            <button onClick={() => toggleRemark(student.id, "pas_exercice")} className={`border text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${studentRemarks.includes("pas_exercice") ? "bg-blue-100 border-blue-300 text-blue-800" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`}>✍️ Pas d&apos;exercice</button>
                            <button onClick={() => toggleRemark(student.id, "bavardage")} className={`border text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${studentRemarks.includes("bavardage") ? "bg-purple-100 border-purple-300 text-purple-800" : "bg-white border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-purple-50"}`}>🗣️ Bavardage</button>
                            <button onClick={() => toggleRemark(student.id, "participation")} className={`border text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${studentRemarks.includes("participation") ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"}`}>⭐ Excellente participation</button>
                          </div>
                        </div>

                        {/* Remarque personnalisée */}
                        <div>
                          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">Remarque personnalisée</span>
                          <textarea
                            value={customRemarks[student.id] || ""}
                            onChange={(e) => setCustomRemarks({ ...customRemarks, [student.id]: e.target.value })}
                            placeholder="Tapez ici pour ajouter un commentaire spécifique..."
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none h-20"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </main>

      {/* MODAL FIN DE SESSION */}
      <AnimatePresence>
        {isEnding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl max-w-md w-full border border-slate-100 flex flex-col items-center text-center overflow-hidden relative"
            >
              {saveStep === "confirm" && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full flex flex-col items-center">
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">Terminer le cours ?</h3>
                  <p className="text-slate-500 mb-8 font-medium text-sm md:text-base">Les présences et les remarques seront enregistrées de manière permanente dans le dossier des élèves.</p>
                  <div className="flex gap-3 w-full">
                    <button onClick={() => setIsEnding(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Annuler</button>
                    <button onClick={handleEndSession} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 shadow-lg shadow-rose-500/30 transition-all active:scale-95">Oui, terminer</button>
                  </div>
                </motion.div>
              )}

              {saveStep === "saving" && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-8 flex flex-col items-center w-full">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                  <h3 className="text-xl font-black text-slate-800 mb-2">Sauvegarde en cours...</h3>
                  <p className="text-sm text-slate-500">Synchronisation avec les profils des élèves</p>
                </motion.div>
              )}

              {saveStep === "success" && (
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }} className="py-4 flex flex-col items-center w-full">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Cours terminé !</h3>
                  <p className="text-slate-500 mb-8 font-medium">Toutes les données ont été sauvegardées avec succès.</p>
                  {/* Remarque: La redirection est déjà gérée dans handleEndSession, 
                      mais si le Link est demandé, le voici : */}
                  <Link href="/" className="w-full py-3 md:py-4 rounded-xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all block active:scale-95">
                    Retour au tableau de bord
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
