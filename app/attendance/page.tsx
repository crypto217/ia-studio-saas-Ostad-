"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, Variants } from "motion/react"
import { Users, Calendar, CheckCircle2, XCircle, Clock, Save, AlertCircle, Sparkles, UserCheck } from "lucide-react"
import { db } from "@/firebase"
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore"
import { useAuth } from "@/components/AuthProvider"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

interface ClassData {
  id: string
  name: string
}

interface Student {
  id: string
  name: string
}

type AttendanceStatus = 'present' | 'absent' | 'late'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function AttendancePage() {
  const { user, isAuthReady } = useAuth()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState({ text: "", type: "" })

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!isAuthReady || !user?.uid) return
      try {
        const q = query(collection(db, "classes"), where("teacherId", "==", user.uid))
        const snapshot = await getDocs(q)
        const classList = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }))
        setClasses(classList)
        if (classList.length > 0) {
          setSelectedClass(classList[0].id)
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "classes")
      } finally {
        setIsLoading(false)
      }
    }
    fetchClasses()
  }, [user, isAuthReady])

  // Fetch students and existing attendance when class or date changes
  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedClass || !user?.uid) return
      setIsLoading(true)
      setSaveMessage({ text: "", type: "" })
      
      try {
        // 1. Fetch students
        const sq = query(collection(db, "students"), where("teacherId", "==", user.uid), where("classId", "==", selectedClass))
        const studentSnap = await getDocs(sq)
        let studentList = studentSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }))
        
        setStudents(studentList)

        // 2. Fetch existing attendance for this date
        // On utilise la collection "attendances" définie dans firestore.rules
        const aq = query(collection(db, "attendances"), where("teacherId", "==", user.uid), where("classId", "==", selectedClass), where("date", "==", date))
        const attendanceSnap = await getDocs(aq)
        
        if (!attendanceSnap.empty) {
          const existingData = attendanceSnap.docs[0].data()
          setAttendance(existingData.records || {})
        } else {
          // Initialize all to present by default
          const initialAttendance: Record<string, AttendanceStatus> = {}
          studentList.forEach(s => {
            initialAttendance[s.id] = 'present'
          })
          setAttendance(initialAttendance)
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "students/attendances")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudentsAndAttendance()
  }, [selectedClass, date, user])

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSave = async () => {
    if (!user?.uid || !selectedClass) return
    setIsSaving(true)
    setSaveMessage({ text: "", type: "" })

    try {
      const aq = query(collection(db, "attendances"), where("teacherId", "==", user.uid), where("classId", "==", selectedClass), where("date", "==", date))
      const attendanceSnap = await getDocs(aq)
      
      let docId = ""
      if (!attendanceSnap.empty) {
        docId = attendanceSnap.docs[0].id
      } else {
        docId = `${selectedClass}_${date}_${Date.now()}` // Unique enough
      }

      await setDoc(doc(db, "attendances", docId), {
        teacherId: user.uid,
        classId: selectedClass,
        date: date,
        records: attendance,
        createdAt: new Date().toISOString()
      }, { merge: true })

      setSaveMessage({ text: "Présences enregistrées avec succès !", type: "success" })
      setTimeout(() => setSaveMessage({ text: "", type: "" }), 3000)
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "attendances")
      setSaveMessage({ text: "Erreur lors de l'enregistrement.", type: "error" })
    } finally {
      setIsSaving(false)
    }
  }

  const stats = {
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent: Object.values(attendance).filter(s => s === 'absent').length,
    late: Object.values(attendance).filter(s => s === 'late').length,
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50/50">
      {/* HERO SECTION */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 mb-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-emerald-500 px-6 py-8 md:px-10 md:py-12 text-white shadow-sm border-b-8 border-emerald-600 flex items-center justify-between">
          {/* Background decorative blobs */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-emerald-700/30 blur-3xl" />

          <div className="relative z-10 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm mb-6 shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              Appel Journalier
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 flex items-center gap-3"
            >
              Présences
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-emerald-100 text-base md:text-lg font-bold max-w-2xl"
            >
              Gérez l&apos;assiduité de vos élèves rapidement et efficacement.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        {/* CONTROLS */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-slate-200 border-b-4 mb-8 flex flex-col sm:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Classe</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
            >
              {classes.length === 0 && <option value="">Aucune classe</option>}
              {classes.map(c => (
               <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ATTENDANCE LIST */}
        <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 border-b-8 overflow-hidden">
          <div className="p-6 border-b-2 border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-500" />
              Liste des élèves
            </h2>
            <div className="flex flex-wrap gap-3 text-sm font-black uppercase tracking-wide">
              <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl border-b-4 border-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
                <span>{stats.present} Présents</span>
              </div>
              <div className="flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-2xl border-b-4 border-rose-200">
                <XCircle className="w-5 h-5" />
                <span>{stats.absent} Absents</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-2xl border-b-4 border-amber-200">
                <Clock className="w-5 h-5" />
                <span>{stats.late} Retards</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
              <p className="text-slate-400 font-bold">Chargement des élèves...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-4 rotate-12">
                <Users className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-700 mb-2">Classe vide !</h3>
              <p className="text-slate-500 font-medium max-w-[300px]">
                Vous n&apos;avez ajouté aucun élève dans cette classe. Allez dans la section Étudiants pour commencer.
              </p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="p-4 sm:p-6 grid gap-4"
            >
              {students.map(student => {
                const status = attendance[student.id];
                const isPresent = status === 'present';
                const isAbsent = status === 'absent';
                const isLate = status === 'late';

                return (
                  <motion.div 
                    key={student.id} 
                    variants={itemVariants}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-slate-200 border-b-4 rounded-[1.5rem] hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-[1rem] bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl border-b-4 border-indigo-200 group-hover:scale-110 transition-transform">
                        {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-black text-slate-700 text-xl">{student.name}</span>
                    </div>
                    
                    <div className="flex gap-2 self-start sm:self-auto">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all duration-200 ${
                          isPresent 
                            ? 'bg-emerald-500 text-white shadow-lg border-b-4 border-emerald-600 translate-y-0' 
                            : 'bg-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border-b-4 border-slate-200 hover:border-emerald-200 translate-y-0.5'
                        }`}
                      >
                        <CheckCircle2 className={`w-6 h-6 ${isPresent ? 'text-white' : ''}`} /> 
                        <span className="hidden sm:inline uppercase">Présent</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all duration-200 ${
                          isAbsent 
                            ? 'bg-rose-500 text-white shadow-lg border-b-4 border-rose-600 translate-y-0' 
                            : 'bg-slate-100 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-b-4 border-slate-200 hover:border-rose-200 translate-y-0.5'
                        }`}
                      >
                        <XCircle className={`w-6 h-6 ${isAbsent ? 'text-white' : ''}`} /> 
                        <span className="hidden sm:inline uppercase">Absent</span>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all duration-200 ${
                          isLate 
                            ? 'bg-amber-500 text-white shadow-lg border-b-4 border-amber-600 translate-y-0' 
                            : 'bg-slate-100 text-slate-500 hover:text-amber-600 hover:bg-amber-50 border-b-4 border-slate-200 hover:border-amber-200 translate-y-0.5'
                        }`}
                      >
                        <Clock className={`w-6 h-6 ${isLate ? 'text-white' : ''}`} /> 
                        <span className="hidden sm:inline uppercase">Retard</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
          
          {students.length > 0 && (
            <div className="p-6 sm:px-8 sm:py-6 bg-slate-50 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto text-center sm:text-left">
                <AnimatePresence mode="wait">
                  {saveMessage.text && (
                    <motion.span 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`font-black uppercase tracking-wide text-sm flex items-center justify-center sm:justify-start gap-2 ${saveMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}
                    >
                      {saveMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      {saveMessage.text}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto flex flex-row items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-600 border-b-4 border-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-wide shadow-xl shadow-indigo-500/20 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <><Save className="w-6 h-6" /> Valider l&apos;appel</>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
