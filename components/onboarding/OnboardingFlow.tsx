"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  Backpack, Book, GraduationCap, Lock, BookOpen, 
  Languages, Globe, Activity, Plus, Trash2, 
  UserPlus, Camera, FileSpreadsheet, Sparkles, 
  Calendar, Check, ChevronRight, ChevronLeft, X,
  Pencil, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { doc, setDoc, writeBatch, collection } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

const CLASS_COLORS = [
  { id: "sky", bg: "bg-sky-400", border: "border-sky-500", text: "text-sky-950" },
  { id: "rose", bg: "bg-rose-400", border: "border-rose-500", text: "text-rose-950" },
  { id: "emerald", bg: "bg-emerald-400", border: "border-emerald-500", text: "text-emerald-950" },
  { id: "amber", bg: "bg-amber-400", border: "border-amber-500", text: "text-amber-950" },
  { id: "indigo", bg: "bg-indigo-400", border: "border-indigo-500", text: "text-indigo-950" },
]

const TASK_TYPES = [
  { id: 'cours', label: 'Cours', icon: BookOpen },
  { id: 'exercice', label: 'Exercice', icon: Pencil },
  { id: 'examen', label: 'Examen', icon: Star },
]

export function OnboardingFlow({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1)
  const { user, setOnboardingCompleted } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  
  // Form State
  const [cycle, setCycle] = useState<string | null>(null)
  const [subject, setSubject] = useState<string | null>(null)
  const [classes, setClasses] = useState<{id: string, name: string, color: any}[]>([])
  const [newClassName, setNewClassName] = useState("")
  const [newClassColor, setNewClassColor] = useState(CLASS_COLORS[0])
  const [studentMethod, setStudentMethod] = useState<string | null>(null)

  // Planning State
  const [schedule, setSchedule] = useState<Record<string, { classId: string, taskType: string }>>({})
  const [activeSlot, setActiveSlot] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)

  const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi']
  const SLOTS = [
    { id: 0, label: "08h00 - 10h00" },
    { id: 1, label: "10h00 - 12h00" },
    { id: 2, label: "13h00 - 15h00" },
    { id: 3, label: "15h00 - 17h00" },
  ]

  const handleSaveSlot = () => {
    if (activeSlot && selectedClassId && selectedTaskType) {
      setSchedule({ ...schedule, [activeSlot]: { classId: selectedClassId, taskType: selectedTaskType } })
      setActiveSlot(null)
      setSelectedClassId(null)
      setSelectedTaskType(null)
    }
  }

  const handleRemoveSlot = () => {
    if (activeSlot) {
      const newSchedule = { ...schedule }
      delete newSchedule[activeSlot]
      setSchedule(newSchedule)
      setActiveSlot(null)
    }
  }

  const openSlot = (slotKey: string) => {
    setActiveSlot(slotKey)
    if (schedule[slotKey]) {
      setSelectedClassId(schedule[slotKey].classId)
      setSelectedTaskType(schedule[slotKey].taskType)
    } else {
      setSelectedClassId(classes.length > 0 ? classes[0].id : null)
      setSelectedTaskType('cours')
    }
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 5))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const addClass = () => {
    if (newClassName.trim()) {
      setClasses([...classes, { id: Date.now().toString(), name: newClassName, color: newClassColor }])
      setNewClassName("")
    }
  }

  const removeClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id))
  }

  const handleComplete = async () => {
    if (!user) {
      onClose()
      return
    }

    setIsSaving(true)
    try {
      const batch = writeBatch(db)

      // Update user profile
      const userRef = doc(db, "users", user.uid)
      batch.update(userRef, {
        cycle,
        subject,
        onboardingCompleted: true
      })

      // Create classes
      classes.forEach(c => {
        const classRef = doc(collection(db, "classes"))
        batch.set(classRef, {
          id: classRef.id,
          teacherId: user.uid,
          name: c.name,
          theme: c.color.id,
          createdAt: new Date().toISOString()
        })

        // Map old class ID to new class ID for schedule
        const newClassId = classRef.id
        Object.keys(schedule).forEach(slotKey => {
          if (schedule[slotKey].classId === c.id) {
            schedule[slotKey].classId = newClassId
          }
        })
      })

      // Create lessons
      Object.entries(schedule).forEach(([slotKey, data]) => {
        const [dayStr, slotIdStr] = slotKey.split('-')
        const day = parseInt(dayStr)
        const slotId = parseInt(slotIdStr)
        
        // Map slotId to start hour and duration
        let start = 8
        let duration = 2
        if (slotId === 0) { start = 8; duration = 2; }
        if (slotId === 1) { start = 10; duration = 2; }
        if (slotId === 2) { start = 13; duration = 2; }
        if (slotId === 3) { start = 15; duration = 2; }

        const lessonRef = doc(collection(db, "lessons"))
        batch.set(lessonRef, {
          id: lessonRef.id,
          teacherId: user.uid,
          classId: data.classId,
          taskType: data.taskType,
          title: `${TASK_TYPES.find(t => t.id === data.taskType)?.label || 'Cours'}`,
          day,
          start,
          duration,
          createdAt: new Date().toISOString()
        })
      })

      await batch.commit()
      setOnboardingCompleted(true)
      onClose()
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "onboarding")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl overflow-hidden p-0 md:p-6 lg:p-8"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          className="relative w-full h-[100dvh] md:h-auto md:max-h-[85vh] max-w-5xl bg-white md:rounded-[2.5rem] shadow-2xl border-0 md:border-4 border-white/20 overflow-hidden flex flex-col"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2.5 rounded-full bg-slate-100/80 backdrop-blur-sm text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all hover:scale-105 hover:rotate-90"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 md:h-3 bg-slate-100">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-r-full"
              initial={{ width: "20%" }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 pt-12 md:p-8 md:pt-12 flex flex-col overflow-y-auto min-h-0">
            <AnimatePresence mode="wait">
              {/* STEP 1: CYCLE */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <div className="mb-4 md:mb-6 text-center shrink-0">
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                      className="w-12 h-12 md:w-16 md:h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4"
                    >
                      <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">Bienvenue ! Quel cycle enseignez-vous ? 🎒</h2>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto">Commençons par configurer votre espace de travail pour qu&apos;il vous ressemble.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-auto mb-auto max-w-4xl mx-auto w-full overflow-y-auto min-h-0 pb-4">
                    {/* Primaire - Selectable */}
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCycle("primaire")}
                      className={`relative cursor-pointer rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border-b-8 transition-all flex flex-col items-center text-center ${cycle === "primaire" ? "bg-sky-400 border-sky-600 shadow-xl" : "bg-white border-slate-200 shadow-sm hover:border-sky-200"}`}
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 ${cycle === "primaire" ? "bg-white text-sky-500" : "bg-sky-100 text-sky-500"}`}>
                        <Backpack className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                      <h3 className={`text-xl md:text-2xl font-black mb-1 md:mb-2 ${cycle === "primaire" ? "text-white" : "text-slate-800"}`}>Primaire</h3>
                      <p className={`font-medium text-xs md:text-sm ${cycle === "primaire" ? "text-sky-100" : "text-slate-500"}`}>Le début de la grande aventure !</p>
                      {cycle === "primaire" && <div className="absolute top-4 right-4 bg-white rounded-full p-1"><Check className="w-4 h-4 md:w-5 md:h-5 text-sky-500" /></div>}
                    </motion.div>

                    {/* Moyen - Locked */}
                    <div className="relative rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border-b-8 bg-slate-50 border-slate-200 opacity-70 grayscale cursor-not-allowed flex flex-col items-center text-center">
                      <div className="absolute top-4 right-4 bg-slate-200 rounded-full p-1.5 md:p-2"><Lock className="w-3 h-3 md:w-4 md:h-4 text-slate-500" /></div>
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 bg-slate-200 text-slate-400"><Book className="w-6 h-6 md:w-7 md:h-7" /></div>
                      <h3 className="text-xl md:text-2xl font-black mb-1 md:mb-2 text-slate-600">Moyen</h3>
                      <p className="font-medium text-xs md:text-sm text-slate-400">Bientôt disponible (Beta)</p>
                    </div>

                    {/* Lycée - Locked */}
                    <div className="relative rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border-b-8 bg-slate-50 border-slate-200 opacity-70 grayscale cursor-not-allowed flex flex-col items-center text-center">
                      <div className="absolute top-4 right-4 bg-slate-200 rounded-full p-1.5 md:p-2"><Lock className="w-3 h-3 md:w-4 md:h-4 text-slate-500" /></div>
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 bg-slate-200 text-slate-400"><GraduationCap className="w-6 h-6 md:w-7 md:h-7" /></div>
                      <h3 className="text-xl md:text-2xl font-black mb-1 md:mb-2 text-slate-600">Lycée</h3>
                      <p className="font-medium text-xs md:text-sm text-slate-400">Bientôt disponible (Beta)</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: MATIÈRE */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <div className="mb-4 md:mb-6 text-center shrink-0">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">Quelle matière enseignez-vous ? 📚</h2>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto">Personnalisons vos outils selon votre spécialité pour plus d&apos;efficacité.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 mt-auto mb-auto max-w-5xl mx-auto w-full overflow-y-auto min-h-0 pb-4">
                    {/* Français - Selectable */}
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSubject("francais")}
                      className={`relative cursor-pointer rounded-2xl md:rounded-3xl p-4 md:p-6 border-b-8 transition-all flex flex-col items-center text-center ${subject === "francais" ? "bg-rose-400 border-rose-600 shadow-xl" : "bg-white border-slate-200 shadow-sm hover:border-rose-200"}`}
                    >
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 ${subject === "francais" ? "bg-white text-rose-500" : "bg-rose-100 text-rose-500"}`}>
                        <BookOpen className="w-5 h-5 md:w-7 md:h-7" />
                      </div>
                      <h3 className={`text-lg md:text-xl font-black ${subject === "francais" ? "text-white" : "text-slate-800"}`}>Français</h3>
                      {subject === "francais" && <div className="absolute top-3 right-3 bg-white rounded-full p-1"><Check className="w-3 h-3 md:w-4 md:h-4 text-rose-500" /></div>}
                    </motion.div>

                    {/* Locked Subjects */}
                    {[
                      { name: "Arabe", icon: Languages },
                      { name: "Tamazight", icon: Globe },
                      { name: "Anglais", icon: Languages },
                      { name: "Sport", icon: Activity }
                    ].map((sub) => (
                      <div key={sub.name} className="relative rounded-2xl md:rounded-3xl p-4 md:p-6 border-b-8 bg-slate-50 border-slate-200 opacity-70 grayscale cursor-not-allowed flex flex-col items-center text-center">
                        <div className="absolute top-3 right-3 bg-slate-200 rounded-full p-1 md:p-1.5"><Lock className="w-3 h-3 text-slate-500" /></div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 bg-slate-200 text-slate-400"><sub.icon className="w-5 h-5 md:w-7 md:h-7" /></div>
                        <h3 className="text-lg md:text-xl font-black text-slate-600">{sub.name}</h3>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CLASSES */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <div className="mb-4 md:mb-6 text-center shrink-0">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">Créons vos classes ! 🎨</h2>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto">Donnez un nom et une couleur à chaque classe pour les identifier facilement.</p>
                  </div>
                  
                  <div className="max-w-3xl w-full mx-auto bg-white border-2 md:border-4 border-slate-100 rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-6 shadow-xl shadow-slate-200/50 flex flex-col min-h-0 flex-1">
                    {/* Add Class Form */}
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4 md:mb-6 shrink-0">
                      <input 
                        type="text" 
                        placeholder="Ex: 5ème AP - A" 
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addClass()}
                        className="flex-1 h-12 md:h-14 bg-slate-50 border-2 border-slate-200 rounded-xl md:rounded-2xl px-4 font-bold text-slate-700 text-base md:text-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white transition-all placeholder:text-slate-400"
                      />
                      <div className="flex gap-1.5 md:gap-2 items-center justify-center bg-slate-50 p-1.5 md:p-2 rounded-xl md:rounded-2xl border-2 border-slate-200 overflow-x-auto">
                        {CLASS_COLORS.map(color => (
                          <button
                            key={color.id}
                            onClick={() => setNewClassColor(color)}
                            className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-lg md:rounded-xl ${color.bg} border-b-4 ${color.border} transition-all hover:scale-110 hover:-translate-y-1 ${newClassColor.id === color.id ? 'ring-4 ring-slate-300 scale-110 -translate-y-1' : ''}`}
                          />
                        ))}
                      </div>
                      <Button onClick={addClass} disabled={!newClassName.trim()} className="h-12 md:h-14 px-4 md:px-8 rounded-xl md:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base md:text-lg border-b-4 border-indigo-800 transition-all hover:-translate-y-1 active:translate-y-0 active:border-b-0">
                        <Plus className="w-5 h-5 md:w-6 md:h-6 md:mr-2" /> <span className="hidden md:inline">Ajouter</span>
                      </Button>
                    </div>

                    {/* Classes List */}
                    <div className="flex-1 overflow-y-auto min-h-[100px] pr-2 space-y-2 md:space-y-3">
                      <AnimatePresence>
                        {classes.length === 0 ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 md:py-8 text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-xl md:rounded-2xl">
                            Aucune classe ajoutée pour le moment.
                          </motion.div>
                        ) : (
                          classes.map(c => (
                            <motion.div 
                              key={c.id}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9, x: -20 }}
                              className={`flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl ${c.color.bg} border-b-4 ${c.color.border} text-white`}
                            >
                              <span className="font-black text-base md:text-lg">{c.name}</span>
                              <button onClick={() => removeClass(c.id)} className="p-1.5 md:p-2 bg-white/20 hover:bg-white/30 rounded-lg md:rounded-xl transition-colors">
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: ÉLÈVES */}
              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <div className="mb-4 md:mb-6 text-center shrink-0">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">Comment ajouter vos élèves ? 🧑‍🎓</h2>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto">Choisissez la méthode qui vous convient le mieux pour importer vos listes.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full mt-auto mb-auto overflow-y-auto min-h-0 pb-4">
                    {/* Manuel */}
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStudentMethod("manuel")}
                      className={`relative cursor-pointer rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border-b-8 transition-all flex flex-col items-center text-center ${studentMethod === "manuel" ? "bg-slate-800 border-slate-900 shadow-xl" : "bg-white border-slate-200 shadow-sm hover:border-slate-300"}`}
                    >
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-6 ${studentMethod === "manuel" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <UserPlus className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <h3 className={`text-xl md:text-2xl font-black mb-2 md:mb-3 ${studentMethod === "manuel" ? "text-white" : "text-slate-800"}`}>Saisie Manuelle</h3>
                      <p className={`font-medium text-sm md:text-base ${studentMethod === "manuel" ? "text-slate-300" : "text-slate-500"}`}>Ajoutez les noms un par un. Idéal pour les petites classes.</p>
                      {studentMethod === "manuel" && <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-white rounded-full p-1"><Check className="w-4 h-4 md:w-5 md:h-5 text-slate-800" /></div>}
                    </motion.div>

                    {/* Premium (Magique) */}
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStudentMethod("premium")}
                      className={`relative cursor-pointer rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border-b-8 transition-all flex flex-col items-center text-center overflow-hidden ${studentMethod === "premium" ? "bg-amber-400 border-amber-600 shadow-xl" : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm hover:border-amber-300"}`}
                    >
                      {/* Premium Badge */}
                      <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] md:text-xs font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-2 h-2 md:w-3 md:h-3" /> PREMIUM
                      </div>
                      {studentMethod === "premium" && <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-white rounded-full p-1"><Check className="w-4 h-4 md:w-5 md:h-5 text-amber-500" /></div>}

                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-6 mt-4 ${studentMethod === "premium" ? "bg-white text-amber-500" : "bg-amber-100 text-amber-600"}`}>
                        <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <h3 className={`text-xl md:text-2xl font-black mb-2 md:mb-3 ${studentMethod === "premium" ? "text-amber-950" : "text-amber-900"}`}>Import Magique</h3>
                      <p className={`font-medium text-sm md:text-base mb-4 md:mb-6 ${studentMethod === "premium" ? "text-amber-900/80" : "text-amber-700/80"}`}>L&apos;IA fait le travail pour vous !</p>
                      
                      <div className="flex gap-2 md:gap-3 w-full">
                        <div className={`flex-1 py-2 md:py-3 rounded-xl flex flex-col items-center justify-center gap-1 md:gap-2 ${studentMethod === "premium" ? "bg-amber-300/50 text-amber-950" : "bg-white text-amber-800"}`}>
                          <Camera className="w-5 h-5 md:w-6 md:h-6" />
                          <span className="text-[10px] md:text-xs font-bold">Photo de la liste</span>
                        </div>
                        <div className={`flex-1 py-2 md:py-3 rounded-xl flex flex-col items-center justify-center gap-1 md:gap-2 ${studentMethod === "premium" ? "bg-amber-300/50 text-amber-950" : "bg-white text-amber-800"}`}>
                          <FileSpreadsheet className="w-5 h-5 md:w-6 md:h-6" />
                          <span className="text-[10px] md:text-xs font-bold">Fichier Excel</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: PLANNING */}
              {step === 5 && (
                <motion.div 
                  key="step5"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <div className="mb-4 md:mb-6 text-center shrink-0">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight">Votre emploi du temps 📅</h2>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto">Organisez vos journées simplement. Sélectionnez un jour et ajoutez vos cours.</p>
                  </div>
                  
                  <div className="max-w-3xl w-full mx-auto bg-white border-2 md:border-4 border-slate-100 rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-6 shadow-xl shadow-slate-200/50 relative flex flex-col flex-1 min-h-0">
                    
                    {/* Day Selector */}
                    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-4 pt-2 px-1 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {DAYS.map((day, dayIndex) => {
                        const isSelected = selectedDay === dayIndex;
                        return (
                          <button 
                            key={dayIndex}
                            onClick={() => setSelectedDay(dayIndex)}
                            className={`snap-center shrink-0 flex flex-col items-center justify-center w-[4.5rem] h-16 md:w-24 md:h-20 rounded-[1rem] md:rounded-[1.5rem] border-b-4 transition-all relative ${
                              isSelected 
                                ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 border-indigo-800 text-white shadow-lg shadow-indigo-500/30 scale-105 z-10' 
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${isSelected ? 'text-indigo-100' : ''}`}>
                              {day.substring(0, 3)}
                            </span>
                            <span className="text-sm md:text-base font-bold mt-1 hidden md:block">{day}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Timeline for Selected Day */}
                    <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-4">
                      {SLOTS.map(slot => {
                        const slotKey = `${selectedDay}-${slot.id}`
                        const assignment = schedule[slotKey]
                        const classInfo = assignment ? classes.find(c => c.id === assignment.classId) : null
                        const taskInfo = assignment ? TASK_TYPES.find(t => t.id === assignment.taskType) : null

                        return (
                          <div key={slotKey} className="flex gap-3 md:gap-4 items-center">
                            {/* Time */}
                            <div className="w-20 md:w-24 shrink-0 text-right">
                              <span className="text-xs md:text-sm font-black text-slate-400 block">{slot.label.split(' - ')[0]}</span>
                              <span className="text-[10px] md:text-xs font-bold text-slate-300 block">{slot.label.split(' - ')[1]}</span>
                            </div>
                            
                            {/* Dot */}
                            <div className="relative flex items-center justify-center">
                              <div className="absolute top-[-2rem] bottom-[-2rem] w-0.5 bg-slate-100 -z-10" />
                              <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-4 border-white shadow-sm ${assignment && classInfo ? classInfo.color.bg : 'bg-slate-200'}`} />
                            </div>

                            {/* Card */}
                            <motion.div 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => openSlot(slotKey)}
                              className={`flex-1 rounded-2xl md:rounded-3xl p-3 md:p-4 cursor-pointer transition-all border-b-4 ${
                                assignment && classInfo && taskInfo
                                ? `${classInfo.color.bg} ${classInfo.color.border} text-white shadow-md`
                                : 'bg-slate-50 border-slate-200 border-dashed hover:bg-indigo-50 hover:border-indigo-300 text-slate-400 flex items-center justify-center min-h-[4rem] md:min-h-[5rem]'
                              }`}
                            >
                              {assignment && classInfo && taskInfo ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                      <taskInfo.icon className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                      <div className="font-black text-sm md:text-base leading-tight drop-shadow-sm">{classInfo.name}</div>
                                      <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-90 mt-0.5">{taskInfo.label}</div>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveSlot(slotKey); handleRemoveSlot(); }}
                                    className="bg-white/20 hover:bg-rose-500/80 p-2 rounded-xl backdrop-blur-sm transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 font-bold">
                                  <Plus className="w-5 h-5" />
                                  <span>Ajouter un cours</span>
                                </div>
                              )}
                            </motion.div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Slot Assignment Modal */}
                    <AnimatePresence>
                      {activeSlot && (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center rounded-[1.5rem]"
                        >
                          <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2rem] p-6 shadow-2xl border-4 border-slate-100 w-full max-w-md m-4"
                          >
                            <h3 className="text-2xl font-black text-slate-800 mb-6">Ajouter une activité</h3>
                            
                            {/* Class Selection */}
                            <div className="mb-6">
                              <label className="block text-sm font-bold text-slate-500 mb-3">1. Choisissez la classe</label>
                              <div className="flex flex-wrap gap-2">
                                {classes.map(c => (
                                  <button 
                                    key={c.id}
                                    onClick={() => setSelectedClassId(c.id)}
                                    className={`px-4 py-2 rounded-xl font-bold border-b-4 transition-all ${
                                      selectedClassId === c.id 
                                      ? `${c.color.bg} ${c.color.border} text-white scale-105` 
                                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {c.name}
                                  </button>
                                ))}
                                {classes.length === 0 && <span className="text-sm text-rose-500 font-bold bg-rose-50 px-3 py-1 rounded-lg">Aucune classe créée ! Retournez à l&apos;étape 3.</span>}
                              </div>
                            </div>

                            {/* Task Selection */}
                            <div className="mb-8">
                              <label className="block text-sm font-bold text-slate-500 mb-3">2. Type d&apos;activité</label>
                              <div className="grid grid-cols-3 gap-3">
                                {TASK_TYPES.map(t => (
                                  <button 
                                    key={t.id}
                                    onClick={() => setSelectedTaskType(t.id)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-b-4 transition-all ${
                                      selectedTaskType === t.id 
                                      ? 'bg-indigo-500 border-indigo-600 text-white scale-105' 
                                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    <t.icon className="w-6 h-6 mb-2" />
                                    <span className="font-bold text-xs">{t.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-end gap-3">
                              {schedule[activeSlot] && (
                                <Button variant="ghost" onClick={handleRemoveSlot} className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold rounded-xl mr-auto">
                                  <Trash2 className="w-5 h-5 mr-2" /> Vider
                                </Button>
                              )}
                              <Button variant="ghost" onClick={() => setActiveSlot(null)} className="font-bold text-slate-500 rounded-xl">Annuler</Button>
                              <Button 
                                onClick={handleSaveSlot}
                                disabled={!selectedClassId || !selectedTaskType}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl px-6 border-b-4 border-emerald-600"
                              >
                                Valider <Check className="w-5 h-5 ml-2" />
                              </Button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="p-3 md:p-4 bg-slate-50/80 backdrop-blur-md border-t-2 border-slate-100 flex justify-between items-center md:rounded-b-[2.5rem] shrink-0">
            <Button 
              variant="ghost" 
              onClick={prevStep}
              disabled={step === 1}
              className={`font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl px-4 md:px-6 h-10 md:h-12 transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <ChevronLeft className="w-5 h-5 md:mr-1" /> <span className="hidden md:inline">Retour</span>
            </Button>
            
            <div className="flex gap-1.5 md:gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-2 md:h-2.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 md:w-8 bg-indigo-500' : i < step ? 'w-2 md:w-2.5 bg-indigo-200' : 'w-2 md:w-2.5 bg-slate-200'}`} />
              ))}
            </div>

            <Button 
              onClick={step === 5 ? handleComplete : nextStep}
              disabled={
                isSaving ||
                (step === 1 && !cycle) || 
                (step === 2 && !subject) || 
                (step === 3 && classes.length === 0) ||
                (step === 4 && !studentMethod)
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl px-6 md:px-8 h-10 md:h-12 border-b-4 border-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 active:translate-y-0 active:border-b-0"
            >
              {step === 5 ? (isSaving ? "Sauvegarde..." : "Terminer 🎉") : <><span className="hidden md:inline">Continuer</span> <ChevronRight className="w-5 h-5 md:ml-1" /></>}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
