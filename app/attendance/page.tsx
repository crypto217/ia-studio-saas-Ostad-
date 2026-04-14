"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Users, Calendar, CheckCircle2, XCircle, Clock, Save, AlertCircle, Sparkles, UserCheck } from "lucide-react"
import { db } from "@/firebase"
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore"
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

const MOCK_STUDENTS: Student[] = [
  { id: 'mock1', name: 'Amira Benali' },
  { id: 'mock2', name: 'Yanis Mansouri' },
  { id: 'mock3', name: 'Lina Kaddour' },
  { id: 'mock4', name: 'Sami Touati' },
  { id: 'mock5', name: 'Rania Lounis' },
  { id: 'mock6', name: 'Karim Djebbar' },
  { id: 'mock7', name: 'Aya Mahdi' },
  { id: 'mock8', name: 'Wassim Aït' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
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
      if (!isAuthReady || !user) return
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
      if (!selectedClass || !user) return
      setIsLoading(true)
      setSaveMessage({ text: "", type: "" })
      
      try {
        // 1. Fetch students
        const sq = query(collection(db, "students"), where("teacherId", "==", user.uid), where("classId", "==", selectedClass))
        const studentSnap = await getDocs(sq)
        let studentList = studentSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }))
        
        if (studentList.length === 0) {
          // Use mock data for demonstration
          studentList = MOCK_STUDENTS;
        }
        setStudents(studentList)

        // 2. Fetch existing attendance for this date
        const attendanceId = `${selectedClass}_${date}`
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
    if (!user || !selectedClass) return
    setIsSaving(true)
    setSaveMessage({ text: "", type: "" })

    try {
      // We use a composite ID to easily find/update it, or we can just query and update.
      // Let's find if it exists first.
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
        <div className="relative overflow-hidden rounded-[2rem] bg-emerald-500 px-6 py-8 md:px-10 md:py-12 text-white shadow-sm border border-emerald-600 flex items-center justify-between">
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
              className="text-emerald-100 text-base md:text-lg font-semibold max-w-2xl"
            >
              Gérez l'assiduité de vos élèves rapidement et efficacement.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        {/* CONTROLS */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 mb-8 flex flex-col sm:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-slate-700 mb-2">Classe</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            >
              {classes.length === 0 && <option value="">Aucune classe</option>}
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3 font-medium text-slate-700 focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ATTENDANCE LIST */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              Liste des élèves
            </h2>
            <div className="flex flex-wrap gap-3 text-sm font-bold">
              <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl border-b-2 border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>{stats.present} Présents</span>
              </div>
              <div className="flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-xl border-b-2 border-rose-200">
                <XCircle className="w-4 h-4" />
                <span>{stats.absent} Absents</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-xl border-b-2 border-amber-200">
                <Clock className="w-4 h-4" />
                <span>{stats.late} Retards</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              Aucun élève trouvé pour cette classe.
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-slate-100"
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
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-lg border-b-4 border-slate-200 group-hover:scale-110 transition-transform">
                        {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-700 text-lg">{student.name}</span>
                    </div>
                    
                    <div className="flex bg-slate-100/50 p-1.5 rounded-2xl gap-1.5 self-start sm:self-auto border border-slate-200/50">
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                          isPresent 
                            ? 'bg-emerald-500 text-white shadow-md border-b-4 border-emerald-600 translate-y-0' 
                            : 'bg-white text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border-b-4 border-transparent hover:border-emerald-200 translate-y-0.5'
                        }`}
                      >
                        <CheckCircle2 className={`w-5 h-5 ${isPresent ? 'text-white' : ''}`} /> 
                        <span className="hidden sm:inline">Présent</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                          isAbsent 
                            ? 'bg-rose-500 text-white shadow-md border-b-4 border-rose-600 translate-y-0' 
                            : 'bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-b-4 border-transparent hover:border-rose-200 translate-y-0.5'
                        }`}
                      >
                        <XCircle className={`w-5 h-5 ${isAbsent ? 'text-white' : ''}`} /> 
                        <span className="hidden sm:inline">Absent</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                          isLate 
                            ? 'bg-amber-500 text-white shadow-md border-b-4 border-amber-600 translate-y-0' 
                            : 'bg-white text-slate-500 hover:text-amber-600 hover:bg-amber-50 border-b-4 border-transparent hover:border-amber-200 translate-y-0.5'
                        }`}
                      >
                        <Clock className={`w-5 h-5 ${isLate ? 'text-white' : ''}`} /> 
                        <span className="hidden sm:inline">Retard</span>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
          
          {students.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div>
                {saveMessage.text && (
                  <span className={`font-bold text-sm flex items-center gap-2 ${saveMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {saveMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {saveMessage.text}
                  </span>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <><Save className="w-5 h-5" /> Enregistrer</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
