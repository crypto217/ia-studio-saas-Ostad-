"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowRight, ArrowLeft, Check, GraduationCap, BookOpen, Layers } from "lucide-react"

import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { doc, writeBatch, collection } from "firebase/firestore"
import { OperationType, handleFirestoreError } from "@/lib/firebase-error"

interface FormData {
  civility: "Monsieur" | "Madame" | ""
  firstName: string
  lastName: string
  cycle: string
  subject: string
  levels: string[]
  schoolName: string
}

const CYCLES = [
  { id: "Primaire", label: "Primaire", icon: <BookOpen className="w-6 h-6" />, locked: false },
  { id: "Moyen", label: "Moyen", icon: <Layers className="w-6 h-6" />, locked: true },
  { id: "Secondaire", label: "Secondaire", icon: <GraduationCap className="w-6 h-6" />, locked: true },
]

const LEVELS = ["3AP", "4AP", "5AP"]

export default function Onboarding() {
  const router = useRouter()
  const { user, setOnboardingCompleted } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    civility: "",
    firstName: "",
    lastName: "",
    cycle: "Primaire",
    subject: "Français",
    levels: [],
    schoolName: "",
  })
  const [errorMsg, setErrorMsg] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleNext = () => {
    setErrorMsg("")
    // Validation
    if (step === 1) {
      if (!formData.civility) return setErrorMsg("Veuillez choisir une civilité.")
      if (!formData.firstName.trim()) return setErrorMsg("Veuillez saisir votre prénom.")
      if (!formData.lastName.trim()) return setErrorMsg("Veuillez saisir votre nom.")
    } else if (step === 2) {
      if (!formData.cycle) return setErrorMsg("Veuillez sélectionner un cycle.")
      if (!formData.subject) return setErrorMsg("Veuillez sélectionner une matière.")
    } else if (step === 3) {
      if (formData.levels.length === 0) return setErrorMsg("Veuillez sélectionner au moins un niveau.")
    }
    setStep(s => Math.min(s + 1, 4))
  }

  const handlePrev = () => {
    setStep(s => Math.max(s - 1, 1))
  }

  const toggleLevel = (level: string) => {
    setFormData(prev => {
      const isSelected = prev.levels.includes(level)
      if (isSelected) {
        return { ...prev, levels: prev.levels.filter(l => l !== level) }
      }
      return { ...prev, levels: [...prev.levels, level] }
    })
  }

  const handleFinish = async () => {
    setErrorMsg("")
    if (!formData.schoolName.trim()) {
      return setErrorMsg("Veuillez saisir le nom de votre école.")
    }

    if (!user) {
      router.push("/login")
      return
    }

    setIsSaving(true)
    try {
      const batch = writeBatch(db)

      // Update User profile
      const userRef = doc(db, "users", user.uid)
      batch.update(userRef, {
        cycle: formData.cycle,
        subject: formData.subject,
        civility: formData.civility,
        firstName: formData.firstName,
        lastName: formData.lastName,
        schoolName: formData.schoolName,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      })

      // Create a class document for each selected level
      const colors = ["sky", "rose", "emerald", "amber", "indigo"]
      formData.levels.forEach((lvl, index) => {
        const classRef = doc(collection(db, "classes"))
        const theme = colors[index % colors.length]
        batch.set(classRef, {
          id: classRef.id,
          teacherId: user.uid,
          name: `Classe ${lvl}`,
          theme: theme,
          createdAt: new Date().toISOString()
        })
      })

      await batch.commit()
      setOnboardingCompleted(true)
      router.push("/")
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, "onboarding")
      setErrorMsg("Une erreur est survenue lors de la sauvegarde.")
    } finally {
      setIsSaving(false)
    }
  }

  const progress = (step / 4) * 100

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Playful Background Blobs */}
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-sky-300/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-pink-300/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-12 relative z-10 border border-slate-100">
        
        {/* Progress Bar Container */}
        <div className="mb-10">
          <div className="h-4 rounded-full bg-slate-100 w-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
              className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-pink-400 rounded-full"
            />
          </div>
          <div className="flex flex-row justify-between mt-2 mx-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
             <span className={step >= 1 ? "text-indigo-500" : ""}>Identité</span>
             <span className={step >= 2 ? "text-indigo-500" : ""}>Profil</span>
             <span className={step >= 3 ? "text-indigo-500" : ""}>Niveaux</span>
             <span className={step >= 4 ? "text-indigo-500" : ""}>École</span>
          </div>
        </div>

        {/* Form Body with Smooth Slide Transitions */}
        <div className="min-h-[350px]">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Faisons connaissance 👋</h2>
                  <p className="text-slate-500 font-medium text-lg">Comment doit-on te nommer ?</p>
                </div>

                {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center">{errorMsg}</div>}

                <div className="flex justify-center gap-4 mb-6">
                  <button
                    onClick={() => setFormData({ ...formData, civility: "Monsieur" })}
                    className={`w-32 h-32 rounded-3xl border-2 border-b-[6px] flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 active:translate-y-[4px] active:border-b-2 ${
                      formData.civility === "Monsieur"
                        ? "bg-sky-100 border-sky-400 text-sky-800"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-4xl">👨🏻‍🏫</span>
                    <span className="font-black">Monsieur</span>
                  </button>

                  <button
                    onClick={() => setFormData({ ...formData, civility: "Madame" })}
                    className={`w-32 h-32 rounded-3xl border-2 border-b-[6px] flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 active:translate-y-[4px] active:border-b-2 ${
                      formData.civility === "Madame"
                        ? "bg-pink-100 border-pink-400 text-pink-800"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-4xl">👩🏼‍🏫</span>
                    <span className="font-black">Madame</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 pl-2">Prénom</label>
                    <input
                      type="text"
                      placeholder="Ex: Lyes"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-5 py-4 md:py-5 text-lg bg-slate-50 border-2 border-b-4 border-slate-200 rounded-2xl focus:border-b-indigo-500 focus:bg-white focus:ring-0 transition-all font-black text-slate-800 placeholder:text-slate-300 outline-none hover:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 pl-2">Nom</label>
                    <input
                      type="text"
                      placeholder="Ex: Djouadi"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-5 py-4 md:py-5 text-lg bg-slate-50 border-2 border-b-4 border-slate-200 rounded-2xl focus:border-b-indigo-500 focus:bg-white focus:ring-0 transition-all font-black text-slate-800 placeholder:text-slate-300 outline-none hover:border-slate-300"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Ton profil pédagogique 🎒</h2>
                  <p className="text-slate-500 font-medium text-lg">Sélectionne ton environnement.</p>
                </div>

                {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center">{errorMsg}</div>}

                <div>
                   <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 pl-2">Cycle d&apos;enseignement</label>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     {CYCLES.map((cycle) => (
                       <button
                         key={cycle.id}
                         disabled={cycle.locked}
                         onClick={() => setFormData({ ...formData, cycle: cycle.id })}
                         className={`relative flex flex-col items-center justify-center p-5 border-2 border-b-[6px] rounded-3xl transition-all hover:-translate-y-1 active:translate-y-[4px] active:border-b-2 ${
                            formData.cycle === cycle.id 
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                            : cycle.locked ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-80 border-b-4 hover:translate-y-0"
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                         }`}
                       >
                         {cycle.locked && (
                           <div className="absolute -top-3 text-[10px] uppercase font-black tracking-widest bg-slate-800 text-white px-3 py-1 rounded-full shadow-lg">
                             Bientôt
                           </div>
                         )}
                         <div className={`p-3 rounded-2xl mb-2 ${formData.cycle === cycle.id ? "bg-indigo-100" : "bg-slate-100"}`}>
                           {cycle.icon}
                         </div>
                         <span className="font-black text-[15px]">{cycle.label}</span>
                       </button>
                     ))}
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 pl-2">Matière enseignée</label>
                   <div className="flex items-center gap-4 bg-pink-50 border-2 border-b-[6px] border-pink-400 rounded-3xl p-5 md:p-6 shadow-sm">
                     <div className="bg-pink-100 p-3 rounded-2xl text-pink-600">
                       <Check className="w-6 h-6 stroke-[3]" />
                     </div>
                     <div className="flex-1">
                       <h3 className="font-black text-pink-800 text-lg">Français</h3>
                       <p className="text-pink-600 font-medium text-sm">Spécialité du SaaS Ludiclass</p>
                     </div>
                   </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 flex flex-col h-full justify-center"
              >
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Tes niveaux 📚</h2>
                  <p className="text-slate-500 font-medium text-lg">Quels niveaux enseignes-tu ? <br/><span className="text-sm">(Cumulables)</span></p>
                </div>
                
                {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center">{errorMsg}</div>}

                <div className="flex flex-wrap justify-center gap-6 py-4">
                  {LEVELS.map((lvl) => {
                    const isSelected = formData.levels.includes(lvl)
                    return (
                      <button
                        key={lvl}
                        onClick={() => toggleLevel(lvl)}
                        className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] border-2 border-b-[6px] flex flex-col items-center justify-center transition-all hover:-translate-y-1 active:translate-y-[4px] active:border-b-2 overflow-hidden ${
                          isSelected 
                            ? "bg-amber-100 border-amber-500 text-amber-800"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                         <span className="font-black text-4xl">{lvl}</span>
                         <AnimatePresence>
                           {isSelected && (
                             <motion.div
                               initial={{ scale: 0 }}
                               animate={{ scale: 1 }}
                               exit={{ scale: 0 }}
                               className="absolute top-3 right-3 bg-amber-500 text-white p-1 rounded-full"
                             >
                               <Check className="w-4 h-4 stroke-[4]" />
                             </motion.div>
                           )}
                         </AnimatePresence>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 py-4 flex flex-col h-full justify-center"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Ton établissement 🏫</h2>
                  <p className="text-slate-500 font-medium text-lg">Presque terminé !</p>
                </div>
                
                {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center">{errorMsg}</div>}

                <div>
                   <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 text-center">Nom de l&apos;école</label>
                   <input
                     type="text"
                     placeholder="Ex: École Primaire El Amal"
                     value={formData.schoolName}
                     onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                     className="w-full px-6 py-5 md:py-6 text-center text-xl bg-slate-50 border-2 border-b-4 border-slate-200 rounded-[2rem] focus:border-b-indigo-500 focus:bg-white focus:ring-0 transition-all font-black text-slate-800 placeholder:text-slate-300 outline-none hover:border-slate-300"
                   />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Global Navigation Controls */}
        <div className="mt-8 flex gap-4">
          {step > 1 && (
            <button
              onClick={handlePrev}
              className="flex items-center justify-center p-4 sm:px-6 bg-white hover:bg-slate-50 text-slate-600 rounded-[1.5rem] border-2 border-b-[6px] border-slate-200 active:border-b-2 active:translate-y-[4px] transition-all font-black"
            >
              <ArrowLeft className="w-5 h-5 sm:hidden" strokeWidth={3} />
              <span className="hidden sm:inline">Retour</span>
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-indigo-500 text-white rounded-[1.5rem] border-2 border-b-[6px] border-indigo-700 active:border-b-2 active:translate-y-[4px] font-black text-xl hover:bg-indigo-400 transition-all"
            >
              Continuer
              <ArrowRight className="w-6 h-6" strokeWidth={3} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white rounded-[1.5rem] border-2 border-b-[6px] border-indigo-800 active:border-b-2 active:translate-y-[4px] font-black text-xl hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-6 h-6" />
              {isSaving ? "Sauvegarde..." : "Ouvrir mon carnet de bord ✨"}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
