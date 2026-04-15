"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, BookOpen, UserCheck, MessageSquare, Baby, Check, Plus, Send, Target, FileText, Maximize, Printer, Loader2, ChevronDown, Sparkles } from "lucide-react"
import Link from "next/link"

// Types
type Student = {
  id: number
  name: string
  gender: "boy" | "girl"
  status: "present" | "absent" | null
  remark: string
  showRemarkInput: boolean
}

type TabId = "cours" | "appel" | "notes"

type Document = {
  id: string
  title: string
  type: string
  content: React.ReactNode
}

const MOCK_DOCS: Document[] = [
  {
    id: "1",
    title: "La Phrase Déclarative",
    type: "Grammaire",
    content: (
      <div className="space-y-6">
        <div className="border-b-2 border-slate-200 pb-4 mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-wider">Fiche Pédagogique</h2>
          <p className="text-slate-500 font-bold mt-2 text-lg">Activité : Grammaire</p>
        </div>
        
        <section>
          <h3 className="flex items-center gap-2 text-xl font-black text-sky-600 mb-3">
            <span className="bg-sky-100 p-2 rounded-xl"><Target className="w-6 h-6" /></span>
            Objectif d&apos;apprentissage
          </h3>
          <p className="text-slate-700 bg-sky-50 p-5 rounded-2xl border-2 border-sky-100 font-medium text-lg leading-relaxed">
            L&apos;élève sera capable d&apos;identifier et de produire une phrase déclarative simple, en respectant la majuscule et le point.
          </p>
        </section>

        <section>
          <h3 className="flex items-center gap-2 text-xl font-black text-amber-500 mb-3 mt-8">
            <span className="bg-amber-100 p-2 rounded-xl"><BookOpen className="w-6 h-6" /></span>
            Déroulement (Phase d&apos;imprégnation)
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-4 text-slate-700 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 text-lg">
              <span className="font-black text-amber-500 text-xl">1.</span>
              <span className="font-medium">Écrire au tableau : &quot;Le petit garçon mange une pomme.&quot;</span>
            </li>
            <li className="flex gap-4 text-slate-700 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 text-lg">
              <span className="font-black text-amber-500 text-xl">2.</span>
              <span className="font-medium">Demander aux élèves de lire la phrase à voix haute.</span>
            </li>
            <li className="flex gap-4 text-slate-700 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 text-lg">
              <span className="font-black text-amber-500 text-xl">3.</span>
              <span className="font-medium">Poser la question : &quot;Par quoi commence cette phrase ? Par quoi se termine-t-elle ?&quot;</span>
            </li>
          </ul>
        </section>
      </div>
    )
  },
  {
    id: "2",
    title: "Le Présent de l'Indicatif",
    type: "Conjugaison",
    content: (
      <div className="space-y-6">
        <div className="border-b-2 border-slate-200 pb-4 mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-wider">Fiche Pédagogique</h2>
          <p className="text-slate-500 font-bold mt-2 text-lg">Activité : Conjugaison</p>
        </div>
        <section>
          <h3 className="flex items-center gap-2 text-xl font-black text-sky-600 mb-3">
            <span className="bg-sky-100 p-2 rounded-xl"><Target className="w-6 h-6" /></span>
            Objectif d&apos;apprentissage
          </h3>
          <p className="text-slate-700 bg-sky-50 p-5 rounded-2xl border-2 border-sky-100 font-medium text-lg leading-relaxed">
            Conjuguer correctement les verbes du 1er groupe au présent de l&apos;indicatif.
          </p>
        </section>
      </div>
    )
  }
]

const TABS = [
  { id: "cours", label: "Mon Cours", icon: BookOpen },
  { id: "appel", label: "Appel", icon: UserCheck },
  { id: "notes", label: "Remarques", icon: MessageSquare },
] as const

const TAGS = [
  "Oubli de livre 📕",
  "Travail non fait ❌",
  "Participation active 🌟",
  "Bavardage 💬"
]

export default function LiveSessionPage() {
  const [activeTab, setActiveTab] = useState<TabId>("cours")
  const [direction, setDirection] = useState(0)
  
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [isLoadingDoc, setIsLoadingDoc] = useState(false)

  const handleSelectDoc = (doc: Document) => {
    setIsSelectorOpen(false)
    setIsLoadingDoc(true)
    setTimeout(() => {
      setSelectedDoc(doc)
      setIsLoadingDoc(false)
    }, 800)
  }
  
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Sami Benali", gender: "boy", status: null, remark: "", showRemarkInput: false },
    { id: 2, name: "Lina Mansouri", gender: "girl", status: null, remark: "", showRemarkInput: false },
    { id: 3, name: "Yanis Kacemi", gender: "boy", status: null, remark: "", showRemarkInput: false },
    { id: 4, name: "Ines Haddad", gender: "girl", status: null, remark: "", showRemarkInput: false },
    { id: 5, name: "Amira Touati", gender: "girl", status: null, remark: "", showRemarkInput: false },
  ])

  const handleTabChange = (newTab: TabId) => {
    if (newTab === activeTab) return
    const currentIndex = TABS.findIndex(t => t.id === activeTab)
    const newIndex = TABS.findIndex(t => t.id === newTab)
    setDirection(newIndex > currentIndex ? 1 : -1)
    setActiveTab(newTab)
  }

  const updateStudentStatus = (id: number, status: "present" | "absent") => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s))
  }

  const toggleRemarkInput = (id: number) => {
    setStudents(students.map(s => s.id === id ? { ...s, showRemarkInput: !s.showRemarkInput } : s))
  }

  const addTagToRemark = (id: number, tag: string) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        const newRemark = s.remark ? `${s.remark} ${tag}` : tag
        return { ...s, remark: newRemark }
      }
      return s
    }))
  }

  const updateRemark = (id: number, text: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, remark: text } : s))
  }

  // Derived state
  const presentCount = students.filter(s => s.status === "present").length
  const totalCount = students.length
  const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* HEADER FIXE */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">5ème AP - A</span>
            <h1 className="text-base font-black text-slate-800 leading-tight">La Phrase Déclarative</h1>
          </div>
          <Link href="/">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </motion.button>
          </Link>
        </div>

        {/* TABS */}
        <div className="flex px-2 pb-1 gap-1 overflow-x-auto hidden-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabId)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  isActive 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "bg-transparent text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative mt-[90px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 overflow-y-auto p-4 pb-24"
          >
            {/* ----------------- MODE : MON COURS ----------------- */}
            {activeTab === "cours" && (
              <div className="max-w-4xl mx-auto h-full flex flex-col">
                {/* Header with selector button */}
                <div className="flex justify-between items-center bg-white p-2 sm:p-3 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-40 mb-4">
                  <span className="font-bold text-slate-700 flex items-center gap-2 truncate">
                    <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                    <span className="truncate">{selectedDoc ? selectedDoc.title : "Aucune fiche sélectionnée"}</span>
                  </span>
                  <button
                    onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                    className="bg-slate-800 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors flex items-center gap-2 shrink-0"
                  >
                    <span className="hidden sm:inline">📂 Choisir ma fiche de cours</span>
                    <span className="sm:hidden">📂 Choisir</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isSelectorOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* Content Area */}
                <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-200 flex flex-col">
                  <AnimatePresence>
                    {isSelectorOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 p-4 sm:p-6 overflow-y-auto"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-black text-slate-800">Ma Bibliothèque</h3>
                          <button onClick={() => setIsSelectorOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid gap-3 max-w-2xl mx-auto">
                          {MOCK_DOCS.map(doc => (
                            <button
                              key={doc.id}
                              onClick={() => handleSelectDoc(doc)}
                              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-sm transition-all text-left group"
                            >
                              <div>
                                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-lg">{doc.title}</h4>
                                <span className="text-sm font-medium text-slate-500">{doc.type}</span>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0">
                                <Check className="w-4 h-4" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isLoadingDoc ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-200/80 backdrop-blur-sm">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      >
                        <Loader2 className="w-10 h-10 text-indigo-500" />
                      </motion.div>
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="mt-4 font-bold text-slate-600 text-sm uppercase tracking-wider"
                      >
                        Chargement...
                      </motion.p>
                    </div>
                  ) : selectedDoc ? (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center w-full">
                      <div className="a4-page shadow-2xl relative bg-white rounded-md">
                        {selectedDoc.content}
                      </div>
                      
                      {/* Floating Buttons */}
                      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-30">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-12 h-12 bg-white text-slate-700 rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:text-indigo-600 transition-colors">
                          <Maximize className="w-5 h-5" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors">
                          <Printer className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                      <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-4">
                        <FileText className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-black text-slate-700 mb-2">Prêt pour le cours ?</h3>
                      <p className="text-slate-500 font-medium mb-6 max-w-sm text-sm">Sélectionnez une fiche pédagogique dans votre bibliothèque pour commencer la présentation.</p>
                      <button
                        onClick={() => setIsSelectorOpen(true)}
                        className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-md"
                      >
                        <Sparkles className="w-5 h-5" />
                        Choisir une fiche ✨
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ----------------- MODE : APPEL ----------------- */}
            {activeTab === "appel" && (
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Progress Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-100 flex items-center gap-4 sticky top-0 z-10">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                      <span>Taux de présence</span>
                      <span className="text-emerald-500">{Math.round(attendanceRate)}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${attendanceRate}%` }}
                        transition={{ type: "spring" }}
                      />
                    </div>
                  </div>
                  <div className="text-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="block text-xl font-black text-slate-800">{presentCount}/{totalCount}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Présents</span>
                  </div>
                </div>

                {/* Students List */}
                <div className="space-y-3">
                  {students.map((student) => (
                    <motion.div 
                      key={student.id}
                      layout
                      className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-colors ${
                        student.status === "present" ? "bg-emerald-50 border-emerald-200" :
                        student.status === "absent" ? "bg-rose-50 border-rose-200" :
                        "bg-white border-slate-100 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${student.gender === 'boy' ? 'bg-blue-100 border-blue-200 text-blue-500' : 'bg-pink-100 border-pink-200 text-pink-500'}`}>
                          <Baby className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-slate-800 text-lg">{student.name}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateStudentStatus(student.id, "present")}
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-b-4 transition-all ${
                            student.status === "present" 
                              ? "bg-emerald-500 text-white border-emerald-700 translate-y-1 border-b-0" 
                              : "bg-white text-emerald-500 border-emerald-200 hover:bg-emerald-50"
                          }`}
                        >
                          <Check className="w-6 h-6 stroke-[3]" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateStudentStatus(student.id, "absent")}
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-b-4 transition-all ${
                            student.status === "absent" 
                              ? "bg-rose-500 text-white border-rose-700 translate-y-1 border-b-0" 
                              : "bg-white text-rose-500 border-rose-200 hover:bg-rose-50"
                          }`}
                        >
                          <X className="w-6 h-6 stroke-[3]" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------- MODE : NOTES & REMARQUES ----------------- */}
            {activeTab === "notes" && (
              <div className="max-w-2xl mx-auto space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${student.gender === 'boy' ? 'bg-blue-100 border-blue-200 text-blue-500' : 'bg-pink-100 border-pink-200 text-pink-500'}`}>
                          <Baby className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800">{student.name}</span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleRemarkInput(student.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-b-2 font-bold text-sm transition-all ${
                          student.showRemarkInput || student.remark
                            ? "bg-indigo-100 text-indigo-600 border-indigo-200"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {student.remark ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {student.remark ? "Noté" : "Remarque"}
                      </motion.button>
                    </div>

                    {/* Zone de saisie conditionnelle */}
                    <AnimatePresence>
                      {student.showRemarkInput && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 border-t-2 border-dashed border-slate-100">
                            {/* Tags rapides */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {TAGS.map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => addTagToRemark(student.id, tag)}
                                  className="text-[10px] sm:text-xs font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                            {/* Textarea */}
                            <div className="flex gap-2">
                              <textarea
                                value={student.remark}
                                onChange={(e) => updateRemark(student.id, e.target.value)}
                                placeholder="Ajouter une note personnalisée..."
                                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl p-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none h-12 hidden-scrollbar"
                              />
                              <button 
                                onClick={() => toggleRemarkInput(student.id)}
                                className="w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all shrink-0"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
