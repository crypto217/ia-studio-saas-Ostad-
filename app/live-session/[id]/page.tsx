"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, FileText, Upload, CheckCircle, XCircle, BookOpen, MessageSquare, Clock, Users } from "lucide-react"
import Link from "next/link"

type Student = {
  id: number
  name: string
  status: "present" | "absent" | null
  remark?: string
}

const initialStudents: Student[] = [
  { id: 1, name: "Amine K.", status: "present" },
  { id: 2, name: "Lina M.", status: "absent" },
  { id: 3, name: "Sami R.", status: "present" },
  { id: 4, name: "Ines H.", status: null },
  { id: 5, name: "Yanis B.", status: null },
]

const QUICK_TAGS = [
  "📚 Oubli de livre",
  "✍️ Pas d'exercice",
  "🗣️ Bavardage",
  "⭐ Excellente participation"
]

export default function LiveSessionPage() {
  const [hasFile, setHasFile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [mobileView, setMobileView] = useState<"eleves" | "cours">("eleves")
  const [activeRightTab, setActiveRightTab] = useState<"appel" | "remarques">("appel")
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null)

  const updateStatus = (id: number, status: "present" | "absent") => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s))
  }

  const addTag = (id: number, tag: string) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        return { ...s, remark: s.remark ? `${s.remark} ${tag}` : tag }
      }
      return s
    }))
  }

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      {/* 1. HEADER GLASSMORPHISM */}
      <header className="relative z-50 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm shrink-0">
        
        {/* Chrono Centré */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-inner">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-sm md:text-base font-bold text-slate-700 tracking-wider">09:41</span>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {/* Badge LIVE moderne */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-full shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-black text-rose-600 uppercase tracking-widest">En direct</span>
          </div>
          
          {/* Titre du cours */}
          <div className="hidden sm:flex flex-col">
            <h1 className="text-base md:text-lg font-black text-slate-800 leading-tight">5ème AP</h1>
            <span className="text-xs md:text-sm font-medium text-slate-500">La Phrase Déclarative</span>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {/* Bouton Tiroir */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span className="hidden lg:inline">{isSidebarOpen ? "Cacher les élèves" : "Voir les élèves"}</span>
          </button>

          {/* Bouton Terminer */}
          <Link href="/">
            <button className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-500/20 font-bold text-sm">
              <span className="hidden sm:inline">Terminer</span>
              <XCircle className="w-4 h-4 sm:hidden" />
            </button>
          </Link>
        </div>
      </header>

      {/* SÉLECTEUR MOBILE */}
      <div className="px-4 mt-2 md:hidden shrink-0">
        <div className="flex bg-slate-100/80 backdrop-blur-md p-1 rounded-xl shadow-inner border border-slate-200">
          <button 
            onClick={() => setMobileView("cours")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${mobileView === "cours" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-200/50"}`}
          >
            <FileText className="w-4 h-4" /> La Fiche
          </button>
          <button 
            onClick={() => setMobileView("eleves")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${mobileView === "eleves" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-200/50"}`}
          >
            <Users className="w-4 h-4" /> La Classe
          </button>
        </div>
      </div>

      {/* 2. LE SPLIT-SCREEN */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 3. PANNEAU GAUCHE : LE COURS (70%) */}
        <div className={`${mobileView === "cours" ? "flex" : "hidden"} md:flex flex-1 flex-col p-4 md:p-6 bg-slate-100/50 overflow-hidden relative`}>
          {!hasFile ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl bg-white/50 m-4">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-xl font-black text-slate-700 mb-2">Aucune fiche active</h2>
              <p className="text-slate-500 mb-6 font-medium text-center max-w-sm">Déposez un document PDF ici ou choisissez une fiche de préparation existante.</p>
              <button 
                onClick={() => setHasFile(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors"
              >
                Choisir une fiche existante
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-xl flex-1 flex flex-col overflow-hidden border border-slate-200">
              {/* Fake PDF Toolbar */}
              <div className="h-12 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                  <FileText className="w-4 h-4" />
                  <span className="truncate max-w-[150px] sm:max-w-[250px]">fiche_grammaire_phrase_declarative.pdf</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold">Page 1 / 2</span>
                  <button 
                    onClick={() => setHasFile(false)}
                    className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold transition-colors"
                  >
                    Changer de fiche
                  </button>
                </div>
              </div>
              {/* Fake PDF Content Area */}
              <div className="flex-1 bg-slate-200/50 overflow-y-auto p-4 md:p-8 flex justify-center">
                <div className="bg-white w-full max-w-3xl aspect-[1/1.4] shadow-md rounded-sm p-8 sm:p-12 border border-slate-200">
                  {/* Faux contenu de la fiche */}
                  <h1 className="text-3xl font-black text-center text-slate-800 mb-8 border-b-2 border-slate-100 pb-4">La Phrase Déclarative</h1>
                  <h2 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">1</span>
                    Phase de découverte
                  </h2>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                    <p className="text-lg font-medium text-slate-700 mb-4">Écrire au tableau :</p>
                    <p className="text-2xl font-serif text-slate-900 font-bold bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                      Le chat dort sur le canapé.
                    </p>
                  </div>
                  <h2 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">2</span>
                    Je retiens
                  </h2>
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                    <p className="text-lg font-medium text-slate-800 leading-relaxed">
                      La phrase déclarative sert à raconter, expliquer ou donner une information.
                      <br /><br />
                      Elle commence toujours par une <strong>majuscule</strong> et se termine par un <strong>point</strong> (.).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. PANNEAU DROIT : GESTION DES ÉLÈVES (30%) */}
        <AnimatePresence initial={false}>
          {(isSidebarOpen || mobileView === "eleves") && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "auto" }}
              exit={{ width: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`${mobileView === "eleves" ? "flex" : "hidden"} md:flex h-full flex-col shadow-2xl z-10 shrink-0 overflow-hidden md:border-l border-slate-200 w-full md:w-auto`}
            >
              <div className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-white">
                {/* Tabs header */}
                <div className="flex p-2 gap-1 bg-slate-50 border-b border-slate-200 shrink-0">
                  <button
                    onClick={() => setActiveRightTab("appel")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                      activeRightTab === "appel" 
                        ? "bg-white text-slate-800 shadow-sm border border-slate-200" 
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Appel
                  </button>
                  <button
                    onClick={() => setActiveRightTab("remarques")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                      activeRightTab === "remarques" 
                        ? "bg-white text-slate-800 shadow-sm border border-slate-200" 
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Remarques
                  </button>
                </div>

                {/* Tab Content Area (Scrollable independently) */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 custom-scrollbar">
                  
                  <AnimatePresence mode="wait">
              {/* --- VUE APPEL --- */}
              {activeRightTab === "appel" && (
                <motion.div 
                  key="appel" 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Liste des élèves ({students.length})</p>
                  {students.map((student) => {
                    const isPresent = student.status === "present"
                    const isAbsent = student.status === "absent"
                    return (
                      <div key={student.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isPresent ? 'bg-emerald-50 border-emerald-100' : 
                        isAbsent ? 'bg-rose-50 border-rose-100' : 
                        'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <span className={`font-bold text-sm ${
                          isPresent ? 'text-emerald-900' :
                          isAbsent ? 'text-rose-900' :
                          'text-slate-700'
                        }`}>
                          {student.name}
                        </span>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => updateStatus(student.id, "present")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                              isPresent 
                                ? 'bg-emerald-500 text-white shadow-sm' 
                                : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700'
                            }`}
                          >
                            <CheckCircle className={`w-3.5 h-3.5 ${isPresent ? 'text-white' : 'text-slate-400'}`} />
                            Présent
                          </button>
                          <button 
                            onClick={() => updateStatus(student.id, "absent")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                              isAbsent 
                                ? 'bg-rose-500 text-white shadow-sm' 
                                : 'bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-700'
                            }`}
                          >
                            <XCircle className={`w-3.5 h-3.5 ${isAbsent ? 'text-white' : 'text-slate-400'}`} />
                            Absent
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </motion.div>
              )}

              {/* --- VUE REMARQUES --- */}
              {activeRightTab === "remarques" && (
                <motion.div 
                  key="remarques" 
                  initial={{ opacity: 0, x: 10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-3"
                >
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Observations rapides</p>
                  {students.map((student) => {
                    const isExpanded = expandedStudentId === student.id
                    return (
                      <div key={student.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300">
                        <button 
                          onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors"
                        >
                          <span className="font-bold text-slate-700">{student.name}</span>
                          <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md max-w-[120px] truncate ${
                            student.remark ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'
                          }`}>
                            {student.remark ? "📝 Noté" : "Ajouter +"}
                          </span>
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0 }} 
                              animate={{ height: "auto" }} 
                              exit={{ height: 0 }}
                              className="overflow-hidden bg-slate-50 border-t border-slate-100"
                            >
                              <div className="p-3">
                                {student.remark && (
                                  <p className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-200 mb-3 italic">
                                    {student.remark}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  {QUICK_TAGS.map(tag => (
                                    <button
                                      key={tag}
                                      onClick={() => addTag(student.id, tag)}
                                      className="text-xs font-medium bg-white text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors shadow-sm"
                                    >
                                      {tag}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  )
}
