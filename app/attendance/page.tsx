"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, ChevronLeft, ChevronRight, Check } from "lucide-react"
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

// Helpers
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  // Fix timezone offset issues so it matches the string
  const dt = new Date(d.getTime() + d.getTimezoneOffset() * 60000)
  return dt.toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'short' })
}

const getLocalISODate = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]
}

export default function AttendancePage() {
  const { user, isAuthReady } = useAuth()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [date, setDate] = useState<string>(getLocalISODate())
  
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState({ text: "", type: "" })

  const changeDate = (days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    setDate(d.toISOString().split('T')[0])
  }

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
        const aq = query(collection(db, "attendances"), where("teacherId", "==", user.uid), where("classId", "==", selectedClass), where("date", "==", date))
        const attendanceSnap = await getDocs(aq)
        
        if (!attendanceSnap.empty) {
          const existingData = attendanceSnap.docs[0].data()
          setAttendance(existingData.records || {})
        } else {
          // Initialize empty so progress bar works (0/X)
          setAttendance({})
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
        docId = `${selectedClass}_${date}_${Date.now()}`
      }

      await setDoc(doc(db, "attendances", docId), {
        teacherId: user.uid,
        classId: selectedClass,
        date: date,
        records: attendance,
        createdAt: new Date().toISOString()
      }, { merge: true })

      setSaveMessage({ text: "Présences enregistrées !", type: "success" })
      setTimeout(() => setSaveMessage({ text: "", type: "" }), 3000)
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "attendances")
      setSaveMessage({ text: "Erreur !", type: "error" })
      setTimeout(() => setSaveMessage({ text: "", type: "" }), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const markedCount = Object.keys(attendance).length
  const totalCount = students.length
  const progressPercent = totalCount === 0 ? 0 : Math.round((markedCount / totalCount) * 100)

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-3">
          {/* Top Row: Title & Class Select */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-teal-500" />
              Présences
            </h1>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-100 border-none rounded-xl px-4 py-2 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-sm cursor-pointer appearance-none outline-none"
            >
              {classes.length === 0 && <option value="">-</option>}
              {classes.map(c => (
               <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Nav Date Row */}
          <div className="flex items-center justify-between bg-slate-100/80 rounded-2xl p-1 mb-5">
            <button onClick={() => changeDate(-1)} className="p-3 text-slate-500 hover:text-slate-800 transition-colors rounded-xl hover:bg-white shadow-sm active:scale-95">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-slate-700 capitalize text-sm sm:text-base">{formatDate(date)}</span>
            <button onClick={() => changeDate(1)} className="p-3 text-slate-500 hover:text-slate-800 transition-colors rounded-xl hover:bg-white shadow-sm active:scale-95">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs font-black text-slate-500 mb-2 px-1 text-[11px] uppercase tracking-widest">
              <span>Progression</span>
              <span>{markedCount}/{totalCount} marqués</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full"
                animate={{ width: `${progressPercent}%` }}
                initial={{ width: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* STUDENT LIST */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 border-transparent">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-teal-500"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold">
            Aucun élève trouvé.
          </div>
        ) : (
          students.map((student) => {
            const status = attendance[student.id];
            
            let ringColor = "ring-slate-200";
            let bgColor = "bg-white";
            
            if (status === 'present') {
              ringColor = "ring-emerald-500";
              bgColor = "bg-emerald-50/40 border-emerald-100";
            } else if (status === 'absent') {
              ringColor = "ring-rose-500";
              bgColor = "bg-rose-50/40 border-rose-100";
            } else if (status === 'late') {
              ringColor = "ring-amber-500";
              bgColor = "bg-amber-50/40 border-amber-100";
            }

            return (
              <motion.div 
                layout
                key={student.id} 
                className={`relative p-5 flex flex-col justify-between gap-5 bg-white border-2 border-b-4 rounded-[1.5rem] shadow-sm transition-colors duration-300 group hover:border-teal-200 hover:bg-slate-50/50 ${bgColor}`}
              >
                <div className="flex items-center gap-4 overflow-hidden w-full">
                  <div className={`relative shrink-0 w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xl ring-2 ring-offset-2 ring-offset-white ${ringColor} transition-colors duration-300`}>
                    {student.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()}
                    <AnimatePresence>
                      {status === 'present' && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white z-10 shadow-sm"
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="font-bold text-slate-700 text-lg truncate pr-2">{student.name}</span>
                </div>
                
                {/* Segmented Controls - Subgrid */}
                <div className="grid grid-cols-3 gap-2 w-full bg-slate-50 rounded-2xl p-1.5 shadow-inner border border-slate-100/50">
                  <button 
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`flex flex-col items-center justify-center p-2 sm:py-3 rounded-xl transition-all active:scale-95 ${status === 'present' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-500 hover:bg-white border border-transparent'}`}
                  >
                    <span className="font-black text-[15px]">P</span>
                    <span className="text-[10px] sm:text-xs font-black uppercase mt-0.5 tracking-wide">Présent</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`flex flex-col items-center justify-center p-2 sm:py-3 rounded-xl transition-all active:scale-95 ${status === 'absent' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'text-slate-400 hover:text-rose-500 hover:bg-white border border-transparent'}`}
                  >
                    <span className="font-black text-[15px]">A</span>
                    <span className="text-[10px] sm:text-xs font-black uppercase mt-0.5 tracking-wide">Absent</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`flex flex-col items-center justify-center p-2 sm:py-3 rounded-xl transition-all active:scale-95 ${status === 'late' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-amber-500 hover:bg-white border border-transparent'}`}
                  >
                    <span className="font-black text-[15px]">R</span>
                    <span className="text-[10px] sm:text-xs font-black uppercase mt-0.5 tracking-wide">Retard</span>
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </main>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-white via-white/95 to-transparent pb-6 z-50 pointer-events-none">
        <div className="max-w-3xl mx-auto relative pointer-events-auto">
          <AnimatePresence>
             {saveMessage.text && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute -top-14 left-0 right-0 flex justify-center pointer-events-none"
                >
                  <div className={`px-5 py-2.5 rounded-full font-black text-sm shadow-xl flex items-center gap-2 ${saveMessage.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-rose-500 text-white shadow-rose-500/30'}`}>
                    {saveMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : null}
                    {saveMessage.text}
                  </div>
                </motion.div>
             )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={isSaving || students.length === 0}
            className="w-full bg-gradient-to-b from-teal-400 to-emerald-500 text-white py-4 sm:py-5 rounded-2xl text-[17px] font-black shadow-[0_12px_24px_-8px_rgba(20,184,166,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity active:shadow-none"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>✅ Enregistrer l&apos;appel</>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

