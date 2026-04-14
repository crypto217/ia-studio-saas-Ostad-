"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { 
  ArrowLeft, 
  User,
  Star, 
  BookOpen, 
  Award, 
  AlertCircle,
  Sparkles,
  MessageSquarePlus,
  BrainCircuit,
  Target,
  Send,
  Clock,
  Zap,
  Flame
} from "lucide-react"

// --- MOCK DATA ---
const initialStudentData = {
  id: "s1",
  name: "Amine Benali",
  gender: "M",
  className: "3ème AP - Groupe A",
  status: "excellent",
  average: 18.5,
  attendance: "98%",
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

export default function StudentProfile() {
  const [remarks, setRemarks] = useState(initialStudentData.remarks)
  const [newRemark, setNewRemark] = useState("")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

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
  
  return (
    <div className="min-h-screen pb-24 bg-slate-50/50 font-sans">
      {/* HEADER - PLAYFUL & LIGHT */}
      <div className="relative pt-6 pb-20 px-4 sm:px-8 overflow-hidden bg-white">
        {/* Playful Floating Blobs Background */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-sky-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-pink-200/40 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 mix-blend-multiply" />
        <div className="absolute top-1/2 left-1/2 w-[25rem] h-[25rem] bg-amber-200/40 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 mix-blend-multiply" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/classes" className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors mb-8 font-bold bg-white/60 hover:bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl text-sm border border-white shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Retour aux classes
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white/60 backdrop-blur-2xl border border-white p-6 sm:p-8 rounded-[3rem] shadow-xl shadow-slate-200/50"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
              {/* Avatar */}
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-lg shadow-indigo-500/30 border-4 border-white shrink-0 -rotate-6 group-hover:rotate-0 transition-transform duration-300 ease-out">
                  {initialStudentData.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white ${
                  initialStudentData.gender === 'M' ? 'bg-sky-500' : 'bg-pink-500'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              
              {/* Info */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-white text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-100 shadow-sm">
                    {initialStudentData.className}
                  </span>
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${
                    initialStudentData.status === 'excellent' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                    initialStudentData.status === 'good' ? 'bg-sky-100 text-sky-700 border-sky-200' : 
                    'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    <Flame className="w-3.5 h-3.5" /> 
                    {initialStudentData.status === 'excellent' ? 'Excellent' : initialStudentData.status === 'good' ? 'Bon' : 'En difficulté'}
                  </span>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${
                    initialStudentData.gender === 'M' ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-pink-100 text-pink-700 border-pink-200'
                  }`}>
                    {initialStudentData.gender === 'M' ? 'Garçon' : 'Fille'}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2">
                  {initialStudentData.name}
                </h1>
                <p className="text-slate-500 font-bold flex items-center gap-2 text-sm">
                  ID: {initialStudentData.id} <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Profil Élève
                </p>
              </div>
            </div>
            
            {/* Stats Bubbles */}
            <div className="flex gap-3 sm:gap-4">
              <div className="bg-white px-5 py-4 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col items-center justify-center min-w-[110px] sm:min-w-[120px] hover:-translate-y-1 transition-transform">
                <span className="text-slate-400 text-xs font-black mb-1 uppercase tracking-wider">Moyenne</span>
                <span className="text-3xl sm:text-4xl font-black text-indigo-600">{initialStudentData.average}</span>
              </div>
              <div className="bg-white px-5 py-4 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col items-center justify-center min-w-[110px] sm:min-w-[120px] hover:-translate-y-1 transition-transform">
                <span className="text-slate-400 text-xs font-black mb-1 uppercase tracking-wider">Présence</span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-500">{initialStudentData.attendance}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-10 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* LEFT COLUMN (AI & Remarks) */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          
          {/* AI EXPERT ANALYSIS CARD - MAGICAL & FRIENDLY */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl shadow-fuchsia-500/20 relative overflow-hidden"
          >
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 mix-blend-overlay" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-900/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30">
                    <BrainCircuit className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                      Analyse IA <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                    </h2>
                    <p className="text-white/80 text-sm font-bold">Assistant Pédagogique</p>
                  </div>
                </div>
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="bg-white text-fuchsia-600 hover:bg-fuchsia-50 px-5 py-3 rounded-2xl text-sm font-black shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                >
                  {isGeneratingAI ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {isGeneratingAI ? "Analyse..." : "Actualiser"}
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-6 border border-white/20 shadow-inner">
                  <p className="text-white text-lg leading-relaxed font-medium">
                    {initialStudentData.aiAnalysis.summary}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-fuchsia-100">
                    <Target className="w-5 h-5" /> Plan d&apos;action recommandé
                  </h3>
                  <div className="grid gap-3">
                    {initialStudentData.aiAnalysis.actionPlan.map((action, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/20 hover:bg-white/20 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                          <span className="text-sm font-black text-white">{idx + 1}</span>
                        </div>
                        <span className="text-white font-bold leading-snug">{action}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* TEACHER REMARKS SECTION - NOTEBOOK STYLE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-[1.5rem] bg-amber-100 flex items-center justify-center text-amber-500 shadow-inner">
                <MessageSquarePlus className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Carnet de bord</h2>
                <p className="text-slate-500 text-sm font-bold">Vos observations nourrissent l&apos;IA</p>
              </div>
            </div>

            {/* Input Area */}
            <div className="mb-10">
              <div className="relative group">
                <textarea
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  placeholder="Comment s'est comporté Amine aujourd'hui ?"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-5 pr-16 min-h-[140px] resize-none focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 font-medium placeholder:text-slate-400 shadow-inner"
                />
                <button 
                  onClick={handleAddRemark}
                  disabled={!newRemark.trim()}
                  className="absolute bottom-5 right-5 w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>

            {/* Remarks Timeline */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-6">Historique</h3>
              <AnimatePresence>
                {remarks.map((remark) => (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    key={remark.id} 
                    className="flex gap-5"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-400 border-2 border-white shadow-sm flex items-center justify-center shrink-0 z-10">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="w-1 h-full bg-slate-100 rounded-full -mt-3" />
                    </div>
                    <div className="flex-1 bg-white border-2 border-slate-100 rounded-[2rem] p-5 shadow-sm hover:border-indigo-100 transition-colors">
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-black mb-3">{remark.date}</span>
                      <p className="text-slate-700 font-bold leading-relaxed">{remark.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {remarks.length === 0 && (
                <div className="text-center bg-slate-50 rounded-[2rem] py-10 border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold">Aucune observation pour le moment.</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN (Grades & Details) */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-8">
          
          {/* STRENGTHS & WEAKNESSES - PILL STYLE */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100"
          >
            <div className="space-y-8">
              {/* Strengths */}
              <div>
                <div className="flex items-center gap-3 mb-5 text-emerald-500">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-xl text-slate-800">Points Forts</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {initialStudentData.strengths.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold text-sm border border-emerald-100">
                      <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" /> {s}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="h-0.5 w-full bg-slate-100 rounded-full" />
              
              {/* Weaknesses */}
              <div>
                <div className="flex items-center gap-3 mb-5 text-rose-500">
                  <div className="p-2 bg-rose-100 rounded-xl">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-xl text-slate-800">À Améliorer</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {initialStudentData.weaknesses.map((w, i) => (
                    <span key={i} className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl font-bold text-sm border border-rose-100">
                      <Target className="w-3.5 h-3.5 text-rose-500" /> {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* RECENT GRADES - COLORFUL CARDS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4 text-slate-800">
                <div className="w-14 h-14 bg-sky-100 text-sky-500 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h2 className="font-black text-2xl">Dernières Notes</h2>
              </div>
              <Link href="/grades" className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {initialStudentData.recentGrades.map((grade, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white border-2 border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ${
                      grade.color === 'sky' ? 'bg-sky-100 text-sky-600' :
                      grade.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {grade.subject[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{grade.subject}</p>
                      <p className="text-sm font-bold text-slate-400">{grade.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-800">{grade.score}</span>
                      <span className="text-sm font-bold text-slate-400">/{grade.max}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

