"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { doc, writeBatch, collection } from "firebase/firestore"
import { OperationType, handleFirestoreError } from "@/lib/firebase-error"
import { Check, Lock, Plus, Trash2, ChevronDown, LogOut } from "lucide-react"

type Gender = "M." | "Mme." | null
type ClassItem = { name: string; level: string; theme: string }

const THEMES = [
  { id: "rose", bg: "bg-rose-500" },
  { id: "blue", bg: "bg-blue-500" },
  { id: "emerald", bg: "bg-emerald-500" },
  { id: "amber", bg: "bg-amber-500" },
  { id: "purple", bg: "bg-purple-500" },
  { id: "cyan", bg: "bg-cyan-500" }
]

const WILAYAS = [
  "1 - Adrar", "2 - Chlef", "3 - Laghouat", "4 - Oum El Bouaghi", "5 - Batna", "6 - Béjaïa", "7 - Biskra", "8 - Béchar", "9 - Blida", "10 - Bouira",
  "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arreridj", "35 - Boumerdès", "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - El M'Ghair", "50 - El Meniaa",
  "51 - Ouled Djellal", "52 - Bordj Baji Mokhtar", "53 - Béni Abbès", "54 - Timimoun", "55 - Touggourt", "56 - Djanet", "57 - In Salah", "58 - In Guezzam"
]

export default function Onboarding() {
  const router = useRouter()
  const { user, setOnboardingCompleted, logOut } = useAuth()
  const [step, setStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)

  // Step 1
  const [gender, setGender] = useState<Gender>(null)
  const [lastName, setLastName] = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [selectedWilaya, setSelectedWilaya] = useState("")
  const [isWilayaOpen, setIsWilayaOpen] = useState(false)

  // Step 2 & 3: Locked choices so hardcode selection
  // step 2 cycle defaults to Primaire
  const [cycle, setCycle] = useState("Primaire")
  const [subject, setSubject] = useState<string | null>(null)

  // Step 4
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>("5ème AP")
  const [groupInput, setGroupInput] = useState("")
  const [selectedTheme, setSelectedTheme] = useState<string>("")

  const handleNext = () => setStep(s => Math.min(s + 1, 4))
  const handlePrev = () => setStep(s => Math.max(s - 1, 1))

  const handleAddClass = () => {
    const trimmedGroup = groupInput.trim()
    if (!trimmedGroup || !selectedTheme || !selectedLevel) return

    const fullClassName = `${selectedLevel} - ${trimmedGroup}`

    // Validation names checking case insensitive within the full class name
    const nameExists = classes.some(c => c.name.toLowerCase() === fullClassName.toLowerCase())
    if (nameExists) {
      alert(`La classe "${fullClassName}" existe déjà.`)
      return
    }

    setClasses([...classes, { name: fullClassName, level: selectedLevel, theme: selectedTheme }])
    setGroupInput("")
    setSelectedTheme("")
  }

  const handleRemoveClass = (index: number) => {
    setClasses(classes.filter((_, i) => i !== index))
  }

  const handleFinish = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsSaving(true)
    try {
      const batch = writeBatch(db)

      const displayName = gender ? `${gender} ${lastName.trim()}` : lastName.trim()

      // Update User
      const userRef = doc(db, "users", user.uid)
      batch.update(userRef, {
        displayName,
        firstName: lastName.trim(), // keeping signature if used elsewhere
        schoolName: schoolName.trim(),
        wilaya: selectedWilaya,
        cycle,
        subject,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      })

      // Add classes
      classes.forEach((cls) => {
        const classRef = doc(collection(db, "classes"))
        batch.set(classRef, {
          id: classRef.id,
          teacherId: user.uid,
          name: cls.name,
          level: cls.level,
          cycle: cycle,
          subject: subject,
          theme: cls.theme,
          schoolYear: "2025-2026",
          createdAt: new Date().toISOString()
        })
      })

      await batch.commit()
      setOnboardingCompleted(true)
      router.push("/")
    } catch (error: boolean | Error | unknown) {
      console.error(error)
      handleFirestoreError(error, OperationType.WRITE, "onboarding")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logOut()
      router.push("/login")
    } catch(err) {
      console.error(err)
    }
  }

  const slideVariants = {
    enter: { x: 20, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans text-slate-800">
      <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-2xl p-6 sm:p-10 relative overflow-hidden border border-slate-100">
        
        {/* Progress Bar */}
        <div className="mb-8 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="bg-indigo-600 h-full rounded-full"
            initial={{ width: `${((step - 1) / 4) * 100}%` }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        <div className="min-h-[440px] relative">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6 flex flex-col h-full"
              >
                <div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Bienvenue ! Qui êtes-vous ? 👋</h2>
                  <p className="text-slate-500 font-medium">Commençons par faire connaissance.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {(["M.", "Mme."] as const).map(g => (
                    <motion.button
                      key={g}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGender(g)}
                      className={`py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                        gender === g 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-200 hover:border-indigo-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl">{g === "M." ? "👨‍🏫" : "👩‍🏫"}</span> {g === "M." ? "Monsieur (M.)" : "Madame (Mme)"}
                    </motion.button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Votre nom de famille <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="ex: Dupont"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Établissement (Optionnel)</label>
                      <input 
                        type="text" 
                        placeholder="École Les Iris"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Wilaya (Optionnel)</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsWilayaOpen(!isWilayaOpen)}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 flex justify-between items-center text-slate-700 hover:border-indigo-300 transition-colors font-medium text-left"
                        >
                          {selectedWilaya || <span className="text-slate-400">Sélectionnez une wilaya</span>}
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isWilayaOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isWilayaOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto p-2 custom-scrollbar"
                            >
                              {WILAYAS.map(w => (
                                <div
                                  key={w}
                                  onClick={() => {
                                    setSelectedWilaya(w)
                                    setIsWilayaOpen(false)
                                  }}
                                  className="hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer p-3 rounded-xl transition-colors font-medium text-slate-700"
                                >
                                  {w}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <button 
                    onClick={handleNext}
                    disabled={!gender || !lastName.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-2xl py-4 transition-colors active:scale-[0.98]"
                  >
                    Continuer
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6 flex flex-col h-full"
              >
                <div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Quel cycle enseignez-vous ? 📚</h2>
                  <p className="text-slate-500 font-medium">Sélectionnez le cycle dans lequel vous exercez.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Primaire */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCycle("Primaire")}
                    className={`relative py-6 px-4 rounded-2xl font-bold border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                      cycle === "Primaire"
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 hover:border-indigo-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-3xl mb-1">🎒</span>
                    Primaire
                  </motion.button>

                  {/* Moyen */}
                  <motion.div
                    className="relative py-6 px-4 rounded-2xl font-bold border-2 border-slate-100 bg-slate-50 text-slate-400 opacity-80 cursor-not-allowed flex flex-col items-center justify-center gap-3"
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-slate-500 bg-slate-200 px-2 py-1 rounded-md">
                      <Lock className="w-3 h-3" />
                      Bientôt
                    </div>
                    <span className="text-3xl mb-1">📐</span>
                    Moyen
                  </motion.div>

                  {/* Lycée */}
                  <motion.div
                    className="relative py-6 px-4 rounded-2xl font-bold border-2 border-slate-100 bg-slate-50 text-slate-400 opacity-80 cursor-not-allowed flex flex-col items-center justify-center gap-3"
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-slate-500 bg-slate-200 px-2 py-1 rounded-md">
                      <Lock className="w-3 h-3" />
                      Bientôt
                    </div>
                    <span className="text-3xl mb-1">🎓</span>
                    Lycée
                  </motion.div>
                </div>

                <div className="flex gap-4 mt-auto pt-6">
                  <button 
                    onClick={handlePrev}
                    className="px-6 py-4 text-slate-500 font-bold hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors"
                  >
                    Retour
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={cycle !== "Primaire"}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-2xl py-4 transition-colors active:scale-[0.98]"
                  >
                    Continuer
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6 flex flex-col h-full"
              >
                <div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Quelle est votre matière ? ✏️</h2>
                  <p className="text-slate-500 font-medium">D&apos;autres matières seront bientôt débloquées.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Français */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSubject("Français")}
                    className={`relative p-5 rounded-2xl font-bold border-2 transition-all flex items-center gap-4 ${
                      subject === "Français"
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-800 ring-4 ring-indigo-100'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
                    }`}
                  >
                    <span className="text-3xl">🇫🇷</span>
                    <span className="text-lg">Français</span>
                  </motion.button>

                  {/* Arabe */}
                  <motion.div
                    className="relative p-5 rounded-2xl font-bold border-2 border-slate-100 bg-slate-50 text-slate-400 opacity-80 cursor-not-allowed flex items-center gap-4"
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] uppercase font-black tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                      <Lock className="w-3 h-3" />
                      Bientôt
                    </div>
                    <span className="text-3xl">🇩🇿</span>
                    <span className="text-sm sm:text-base">Arabe (Généraliste)</span>
                  </motion.div>

                  {/* Anglais */}
                  <motion.div
                    className="relative p-5 rounded-2xl font-bold border-2 border-slate-100 bg-slate-50 text-slate-400 opacity-80 cursor-not-allowed flex items-center gap-4"
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] uppercase font-black tracking-wider bg-rose-100 text-rose-700 px-2 py-1 rounded-md">
                      <Lock className="w-3 h-3" />
                      Bientôt
                    </div>
                    <span className="text-3xl">🇬🇧</span>
                    <span className="text-sm sm:text-base">Anglais</span>
                  </motion.div>

                  {/* Tamazight */}
                  <motion.div
                    className="relative p-5 rounded-2xl font-bold border-2 border-slate-100 bg-slate-50 text-slate-400 opacity-80 cursor-not-allowed flex items-center gap-4"
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] uppercase font-black tracking-wider bg-gradient-to-r from-blue-100 via-emerald-100 to-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-md">
                      <Lock className="w-3 h-3" />
                      Bientôt
                    </div>
                    <span className="text-3xl">ⵣ</span>
                    <span className="text-sm sm:text-base">Tamazight</span>
                  </motion.div>

                  {/* Sport */}
                  <motion.div
                    className="relative p-5 rounded-2xl font-bold border-2 border-slate-100 bg-slate-50 text-slate-400 opacity-80 cursor-not-allowed flex items-center gap-4 sm:col-span-2 md:col-span-1"
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] uppercase font-black tracking-wider bg-orange-100 text-orange-700 px-2 py-1 rounded-md">
                      <Lock className="w-3 h-3" />
                      Bientôt
                    </div>
                    <span className="text-3xl">⚽</span>
                    <span className="text-sm sm:text-base">Éducation Physique</span>
                  </motion.div>
                </div>

                <div className="flex gap-4 mt-auto pt-6">
                  <button 
                    onClick={handlePrev}
                    className="px-6 py-4 text-slate-500 font-bold hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors"
                  >
                    Retour
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!subject}
                    className={`flex-1 font-bold rounded-2xl py-4 transition-colors ${
                      subject
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Continuer
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6 flex flex-col h-full"
              >
                <div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Créez vos classes de Français 📋</h2>
                  <p className="text-slate-500 font-medium">Ajoutez au moins une classe pour commencer.</p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  {/* Niveau selector */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Niveau</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["3ème AP", "4ème AP", "5ème AP"]).map((level) => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 ${
                            selectedLevel === level
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          {level}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nom du groupe</label>
                      <input 
                        type="text" 
                        placeholder="ex: A, Excellence..."
                        value={groupInput}
                        onChange={(e) => setGroupInput(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Couleur thématique</label>
                      <div className="flex flex-wrap gap-2 sm:gap-3 py-1">
                        {THEMES.map((theme) => {
                          const isUsed = classes.some(c => c.theme === theme.id)
                          const isSelected = selectedTheme === theme.id
                          
                          return (
                            <button
                              key={theme.id}
                              onClick={() => !isUsed && setSelectedTheme(theme.id)}
                              disabled={isUsed}
                              className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${theme.bg} ${
                                isUsed 
                                  ? 'opacity-20 cursor-not-allowed scale-90' 
                                  : isSelected
                                  ? 'ring-4 ring-indigo-200 scale-110 shadow-md'
                                  : 'hover:scale-110 hover:shadow-md cursor-pointer'
                              }`}
                              title={isUsed ? 'Déjà utilisée' : ''}
                            >
                              {isSelected && <Check className="w-5 h-5 text-white" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleAddClass}
                    disabled={!groupInput.trim() || !selectedTheme || !selectedLevel}
                    className="w-full py-3 mt-2 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold flex-1 rounded-xl transition-colors active:scale-[0.98]"
                  >
                    <Plus className="w-5 h-5" />
                    Ajouter la classe {selectedLevel && groupInput ? `"${selectedLevel} - ${groupInput}"` : ""}
                  </button>
                </div>

                {classes.length > 0 && (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Vos classes :</h3>
                    <div className="grid gap-2">
                      {classes.map((cls, idx) => {
                        const themeColor = THEMES.find(t => t.id === cls.theme)?.bg || "bg-slate-500"
                        return (
                          <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full ${themeColor}`} />
                              <span className="font-bold text-slate-800">{cls.name}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveClass(idx)}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-auto pt-4">
                  <button 
                    onClick={handlePrev}
                    className="px-6 py-4 text-slate-500 font-bold hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors"
                  >
                    Retour
                  </button>
                  <button 
                    onClick={handleFinish}
                    disabled={isSaving || classes.length === 0}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-2xl py-4 transition-colors active:scale-[0.98] flex items-center justify-center shadow-lg shadow-indigo-200 disabled:shadow-none"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "🚀 Terminer et accéder à mon espace"
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Me déconnecter et retourner à l&apos;accueil
      </button>
    </div>
  )
}
