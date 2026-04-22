"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { 
  ArrowLeft, 
  User,
  Star, 
  BookOpen, 
  AlertCircle,
  Sparkles,
  MessageSquarePlus,
  BrainCircuit,
  Target,
  Send,
  Clock,
  Zap,
  Flame,
  Calendar,
  Award
} from "lucide-react"

// --- MOCK DATA ---
const initialStudentData = {
  id: "s1",
  name: "Amine Benali",
  gender: "M",
  className: "3ème AP - Groupe A",
  status: "excellent",
  average: 18.5,
  absences: 3,
  totalClasses: 60,
  attendanceRate: 95,
  rank: "3ème de la classe",
  recentGrades: [
    { subject: "Lecture", score: 19, date: "12 Oct", max: 20, color: "sky" },
    { subject: "Écriture", score: 18, date: "10 Oct", max: 20, color: "pink" },
    { subject: "Poésie", score: 18.5, date: "05 Oct", max: 20, color: "amber" },
  ],
  strengths: ["Très participatif", "Excellente lecture", "Curieux", "Esprit d'équipe"],
  weaknesses: ["Écriture précipitée", "Bavardages"],
  remarks: [
    { 
      id: 1, 
      date: "08 Oct 2026", 
      text: "Très bonne participation aujourd'hui, mais a eu du mal à se concentrer en fin de journée.", 
      type: "observation" 
    },
    { 
      id: 2, 
      date: "01 Oct 2026", 
      text: "A aidé un camarade pendant l'exercice de lecture. Excellent esprit d'équipe !", 
      type: "positive" 
    }
  ],
  aiAnalysis: {
    summary: "Amine montre un excellent potentiel global. Sa dynamique d'apprentissage est très positive, portée par une forte curiosité. Les notes récentes confirment une maîtrise des fondamentaux en français.",
    actionPlan: [
      "Lui confier des rôles de 'tuteur' pour canaliser son énergie positive.",
      "Proposer des exercices d'écriture avec contrainte de temps pour améliorer le soin.",
      "Lui donner des textes légèrement plus complexes pour nourrir sa curiosité."
    ]
  }
}

type TabKey = "notes" | "observations" | "ia"

export default function StudentProfile() {
  const [remarks, setRemarks] = useState(initialStudentData.remarks)
  const [newRemark, setNewRemark] = useState("")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("notes")

  const handleAddRemark = () => {
    if (!newRemark.trim()) return
    
    const remark = {
      id: Date.now(),
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      text: newRemark,
      type: "observation"
    }
    
    setRemarks([remark, ...remarks])
    setNewRemark("")
  }

  const handleGenerateAI = () => {
    setIsGeneratingAI(true)
    setTimeout(() => {
      setIsGeneratingAI(false)
    }, 2000)
  }

  // Theme based on student status
  const isExcellent = initialStudentData.status === 'excellent'
  const isGood = initialStudentData.status === 'good'
  const themeColor = isExcellent ? 'emerald' : isGood ? 'sky' : 'amber'
  const themeBorder = isExcellent ? 'border-emerald-500' : isGood ? 'border-sky-500' : 'border-amber-500'
  const themeBg = isExcellent ? 'bg-emerald-50' : isGood ? 'bg-sky-50' : 'bg-amber-50'
  const themeText = isExcellent ? 'text-emerald-600' : isGood ? 'text-sky-600' : 'text-amber-600'

  // Dynamic Theme for Attendance
  const { attendanceRate, absences } = initialStudentData;
  const isAttendanceExcellent = attendanceRate >= 90;
  const isAttendanceWarning = attendanceRate < 80;
  const attBg = isAttendanceExcellent ? 'bg-emerald-50' : isAttendanceWarning ? 'bg-rose-50' : 'bg-amber-50';
  const attBorder = isAttendanceExcellent ? 'border-emerald-100/50' : isAttendanceWarning ? 'border-rose-100/50' : 'border-amber-100/50';
  const attIconBg = isAttendanceExcellent ? 'bg-emerald-100' : isAttendanceWarning ? 'bg-rose-100' : 'bg-amber-100';
  const attText = isAttendanceExcellent ? 'text-emerald-700' : isAttendanceWarning ? 'text-rose-700' : 'text-amber-700';
  const attLabelText = isAttendanceExcellent ? 'text-emerald-700/60' : isAttendanceWarning ? 'text-rose-700/60' : 'text-amber-700/60';

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      
      {/* HEADER & BACK BUTTON */}
      <div className="bg-slate-50 px-4 pt-4 pb-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/classes" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-bold text-sm">
            <ArrowLeft className="w-5 h-5" /> Retour
          </Link>
          
          <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
            
            {/* LIGNE INFO / PC LEFT COL */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-8">
              
              {/* Carte d'Identité */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col pb-6">
                {/* Cover Rectangle */}
                <div className="h-32 md:h-48 w-full rounded-t-[2.5rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative mb-12">
                  <div className="absolute -bottom-10 left-6">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-black border-4 border-white shadow-md overflow-hidden">
                      {initialStudentData.gender === 'M' ? (
                        <div className="w-full h-full flex items-center justify-center bg-sky-100 text-sky-600">AB</div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-pink-100 text-pink-600">AB</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="px-6">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 leading-tight mb-1">
                    {initialStudentData.name}
                  </h1>
                  <p className="text-slate-500 font-bold text-sm flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-amber-500" />
                    {initialStudentData.rank}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {initialStudentData.className}
                    </span>
                  </div>
                </div>
              </div>

              {/* BENTO STATS (Visible on mobile directly under header, on PC on the left) */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {/* Moyenne */}
                <div className="bg-emerald-50 border border-emerald-100/50 p-4 rounded-3xl shadow-sm flex flex-col justify-center items-start relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-emerald-700/80 text-[10px] font-black uppercase tracking-widest mb-0.5">Moyenne</span>
                  <span className="text-3xl font-black tracking-tighter text-emerald-700 leading-none">
                    {initialStudentData.average}
                  </span>
                </div>
                
                {/* Assiduité */}
                <div className={`${attBg} border ${attBorder} p-4 rounded-3xl shadow-sm flex flex-col justify-center items-start relative overflow-hidden`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full ${attIconBg} flex items-center justify-center ${attText}`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <span className={`${attText} opacity-80 text-[10px] font-black uppercase tracking-widest mb-0.5`}>Assiduité</span>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-3xl font-black tracking-tighter ${attText} leading-none`}>
                      {attendanceRate}%
                    </span>
                    {isAttendanceWarning && <AlertCircle className={`w-5 h-5 ${attText}`} />}
                  </div>
                  <span className={`${attText} opacity-70 text-xs font-bold`}>
                    {absences} absence{absences > 1 ? 's' : ''} ce trimestre
                  </span>
                </div>

                {/* Comportement */}
                <div className={`${themeBg} border border-slate-100/50 p-4 rounded-3xl shadow-sm flex flex-col justify-center items-start`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${themeText} shadow-sm`}>
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <span className={`${themeText} opacity-80 text-[10px] font-black uppercase tracking-widest mb-0.5`}>Statut</span>
                  <span className={`text-lg font-black ${themeText}`}>
                    {isExcellent ? 'Excellent' : isGood ? 'Bon' : 'Fragile'}
                  </span>
                </div>

                {/* Point Fort */}
                <div className="bg-indigo-50 border border-indigo-100/50 p-4 rounded-3xl shadow-sm flex flex-col justify-center items-start">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="text-indigo-700/80 text-[10px] font-black uppercase tracking-widest mb-1">Point Fort</span>
                  <span className="text-sm font-black text-indigo-700 leading-tight">
                    {initialStudentData.strengths[0]}
                  </span>
                </div>
              </div>

            </div>

            {/* TABS & DETAILS / PC RIGHT COL */}
            <div className="lg:col-span-8 mt-6 lg:mt-0 flex flex-col">
              
              {/* STICKY TABS AREA */}
              <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md pt-2 pb-3 mb-4 sm:mb-6 border-b border-slate-200/50">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  <button 
                    onClick={() => setActiveTab('notes')}
                    className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'notes' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    📊 Notes
                  </button>
                  <button 
                    onClick={() => setActiveTab('observations')}
                    className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'observations' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    📝 Observations
                  </button>
                  <button 
                    onClick={() => setActiveTab('ia')}
                    className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'ia' ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md shadow-fuchsia-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    🤖 Analyse IA
                  </button>
                </div>
              </div>

              {/* TAB CONTENT PORTALS */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  
                  {/* TAB: NOTES */}
                  {activeTab === 'notes' && (
                    <motion.div
                      key="notes"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {initialStudentData.recentGrades.map((grade, i) => (
                        <div key={i} className="flex items-center justify-between p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                              grade.color === 'sky' ? 'bg-sky-100 text-sky-600' :
                              grade.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>
                              {grade.subject[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 lg:text-lg group-hover:text-indigo-600 transition-colors">{grade.subject}</p>
                              <p className="text-xs sm:text-sm font-medium text-slate-400">{grade.date}</p>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <span className="text-xl sm:text-2xl font-black text-slate-800">{grade.score}</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-400">/{grade.max}</span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Weaknesses / Strengths minified section at bottom of notes */}
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 rounded-3xl p-4 border border-emerald-100">
                          <div className="flex items-center gap-2 mb-3 text-emerald-700 font-black">
                            <Star className="w-4 h-4" /> Qualités
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {initialStudentData.strengths.slice(0,3).map((s,i) => (
                              <span key={i} className="text-xs font-bold bg-white text-emerald-600 px-2 py-1 rounded-lg shadow-sm border border-emerald-100/50">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-rose-50 rounded-3xl p-4 border border-rose-100">
                          <div className="flex items-center gap-2 mb-3 text-rose-700 font-black">
                            <AlertCircle className="w-4 h-4" /> Lacunes
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {initialStudentData.weaknesses.map((w,i) => (
                              <span key={i} className="text-xs font-bold bg-white text-rose-600 px-2 py-1 rounded-lg shadow-sm border border-rose-100/50">{w}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: OBSERVATIONS */}
                  {activeTab === 'observations' && (
                    <motion.div
                      key="observations"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                       {/* Input Area */}
                      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm relative">
                        <textarea
                          value={newRemark}
                          onChange={(e) => setNewRemark(e.target.value)}
                          placeholder="Une remarque sur l'élève ?"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-14 min-h-[120px] resize-none focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 font-medium placeholder:text-slate-400"
                        />
                        <button 
                          onClick={handleAddRemark}
                          disabled={!newRemark.trim()}
                          className="absolute bottom-6 right-6 w-10 h-10 sm:w-12 sm:h-12 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
                        >
                          <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                        </button>
                      </div>

                      {/* Remarks Timeline */}
                      <div className="space-y-4">
                        <AnimatePresence>
                          {remarks.map((remark) => (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              key={remark.id} 
                              className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 shadow-sm overflow-hidden"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-slate-300" />
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{remark.date}</span>
                              </div>
                              <p className="text-slate-700 font-medium leading-relaxed text-sm sm:text-base">{remark.text}</p>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {remarks.length === 0 && (
                          <div className="text-center bg-transparent py-8">
                            <p className="text-slate-400 font-bold text-sm">Aucune observation.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: IA */}
                  {activeTab === 'ia' && (
                    <motion.div
                      key="ia"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="bg-gradient-to-br from-indigo-900 via-fuchsia-900 to-rose-900 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-fuchsia-900/20 relative overflow-hidden">
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-4 shadow-2xl">
                            <BrainCircuit className="w-8 h-8 text-fuchsia-300" />
                          </div>
                          <h2 className="text-2xl font-black mb-2 select-none tracking-tight">Rapport d&apos;Évolution IA</h2>
                          <p className="text-fuchsia-200/80 text-sm font-medium mb-8 max-w-sm">
                            Une synthèse prédictive basée sur les notes, l&apos;assiduité et vos observations.
                          </p>
                          
                          <button 
                            onClick={handleGenerateAI}
                            disabled={isGeneratingAI}
                            className="w-full sm:w-auto bg-gradient-to-r from-rose-400 to-pink-500 text-white px-8 py-4 rounded-full text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-80 disabled:hover:scale-100"
                          >
                            {isGeneratingAI ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                <Sparkles className="w-5 h-5" />
                              </motion.div>
                            ) : (
                              <Sparkles className="w-5 h-5" />
                            )}
                            {isGeneratingAI ? "Génération en cours..." : "Générer un Rapport Premium"}
                          </button>
                        </div>
                      </div>

                      {/* Display analysis if generated or mock */}
                      <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                          <Target className="w-5 h-5 text-indigo-500" />
                          <h3 className="font-bold tracking-tight text-slate-800">Synthèse actuelle</h3>
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base mb-6">
                          {initialStudentData.aiAnalysis.summary}
                        </p>
                        
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recommandations</h4>
                        <div className="space-y-2">
                          {initialStudentData.aiAnalysis.actionPlan.map((action, idx) => (
                            <div key={idx} className="flex gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3 items-start">
                              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">{idx + 1}</span>
                              <span className="text-sm font-medium text-slate-700 leading-snug">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}