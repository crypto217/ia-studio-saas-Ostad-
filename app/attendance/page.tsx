"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, ChevronLeft, ChevronRight, ChevronDown, Check, Calendar, Users, Sparkles, UserCheck, School } from "lucide-react"
import { db } from "@/firebase"
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore"
import { useAuth } from "@/components/AuthProvider"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"
import Link from 'next/link'

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
  const dt = new Date(d.getTime() + d.getTimezoneOffset() * 60000)
  return dt.toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long' })
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const changeDate = (days: number) => {
    if (hasUnsavedChanges) {
      if (!window.confirm("Vous avez des modifications non sauvegardées. Voulez-vous vraiment changer de date ?")) {
        return
      }
      setHasUnsavedChanges(false)
    }
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
        if (classList.length > 0 && !selectedClass) {
          setSelectedClass(classList[0].id)
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "classes")
      } finally {
        setIsLoading(false)
      }
    }
    fetchClasses()
  }, [user, isAuthReady, selectedClass])

  // Fetch students and existing attendance when class or date changes
  useEffect(() => {
    let isCurrent = true;
    const fetchStudentsAndAttendance = async () => {
      if (!selectedClass || !user?.uid) return
      setIsLoading(true)
      setSaveMessage({ text: "", type: "" })
      
      try {
        const sq = query(collection(db, "students"), where("teacherId", "==", user.uid), where("classId", "==", selectedClass))
        const studentSnap = await getDocs(sq)
        let studentList = studentSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }))
        
        // Trier par nom de famille (ou prénom si un seul mot)
        studentList.sort((a, b) => a.name.localeCompare(b.name))
        
        if (isCurrent) setStudents(studentList)

        const aq = query(collection(db, "attendances"), where("teacherId", "==", user.uid), where("classId", "==", selectedClass), where("date", "==", date))
        const attendanceSnap = await getDocs(aq)
        
        if (isCurrent) {
          if (!attendanceSnap.empty) {
            const existingData = attendanceSnap.docs[0].data()
            setAttendance(existingData.records || {})
          } else {
            setAttendance({})
          }
        }
      } catch (error) {
        if (isCurrent) handleFirestoreError(error, OperationType.GET, "students/attendances")
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    fetchStudentsAndAttendance()
    return () => { isCurrent = false }
  }, [selectedClass, date, user])

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
    setHasUnsavedChanges(true)
  }
  
  const markAllPresent = () => {
    const newAttendance: Record<string, AttendanceStatus> = {}
    students.forEach(s => {
      newAttendance[s.id] = 'present'
    })
    setAttendance(newAttendance)
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!user?.uid || !selectedClass) return
    setIsSaving(true)
    setSaveMessage({ text: "", type: "" })

    try {
      const docId = `${selectedClass}_${date}`

      await setDoc(doc(db, "attendances", docId), {
        teacherId: user.uid,
        classId: selectedClass,
        date: date,
        records: attendance,
        createdAt: new Date().toISOString()
      }, { merge: true })

      setHasUnsavedChanges(false)
      setSaveMessage({ text: "Appel enregistré avec succès !", type: "success" })
      setTimeout(() => setSaveMessage({ text: "", type: "" }), 4000)
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "attendances")
      setSaveMessage({ text: "Erreur lors de l'enregistrement", type: "error" })
      setTimeout(() => setSaveMessage({ text: "", type: "" }), 4000)
    } finally {
      setIsSaving(false)
    }
  }

  const markedCount = Object.keys(attendance).length
  const totalCount = students.length
  const progressPercent = totalCount === 0 ? 0 : Math.round((markedCount / totalCount) * 100)

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 mt-8 pb-8">
        {/* NEW HEADER */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-8 mt-4">
          <div className="flex flex-col gap-4 w-full sm:w-auto">
             <div className="flex items-center gap-4">
                <div className="relative w-full sm:w-64">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg cursor-pointer appearance-none shadow-sm transition-all pr-12 hover:bg-slate-100 hover:border-slate-300"
                  >
                    {classes.length === 0 && <option value="">Aucune classe</option>}
                    {classes.map(c => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 bg-slate-200/50 p-1 rounded-md">
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
             </div>

             <div className="flex items-center justify-between gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-max">
               <button onClick={() => changeDate(-1)} className="p-3 text-slate-500 hover:text-slate-700 hover:bg-white active:scale-95 transition-all rounded-xl shadow-sm border border-transparent hover:border-slate-200">
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <div className="flex flex-col items-center justify-center px-2 flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center"><Calendar className="w-3 h-3 inline mr-1" /> Date</span>
                  <span className="font-bold text-sm text-slate-700 capitalize truncate w-full text-center">{formatDate(date)}</span>
               </div>
               <button onClick={() => changeDate(1)} className="p-3 text-slate-500 hover:text-slate-700 hover:bg-white active:scale-95 transition-all rounded-xl shadow-sm border border-transparent hover:border-slate-200">
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
             <span className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border border-slate-200 shadow-sm">
               <Users className="w-4 h-4" /> {totalCount} Élèves
             </span>
             <span className="bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-emerald-200">
               {Object.values(attendance).filter(s => s === 'present').length} Présents
             </span>
             <span className="bg-rose-100 text-rose-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-rose-200">
               {Object.values(attendance).filter(s => s === 'absent').length} Absents
             </span>
             <span className="bg-amber-100 text-amber-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-amber-200">
               {Object.values(attendance).filter(s => s === 'late').length} Retards
             </span>
          </div>
        </div>
        
        {/* Raccourci UX: Tout Présent */}
        {students.length > 0 && selectedClass && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-6 flex justify-between items-center bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100"
           >
             <div className="flex items-center gap-3 pl-2">
               <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                 <Sparkles className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="font-bold text-slate-800">Astuce Rapidité</h3>
                  <p className="text-xs text-slate-500">Marquez tout le monde présent, puis ajustez les absents.</p>
               </div>
             </div>
             <button 
               onClick={markAllPresent}
               className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 active:scale-95 text-indigo-700 font-bold py-2.5 px-5 rounded-2xl transition-all"
             >
               <UserCheck className="w-4 h-4" />
               <span className="hidden sm:inline">Tous Présents</span>
             </button>
           </motion.div>
        )}

        {/* LISTE DES ÉLÈVES */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 shadow-xl"></div>
            <p className="mt-4 text-slate-500 font-medium animate-pulse">Chargement de la classe...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
             <div className="bg-indigo-100 text-indigo-500 p-6 rounded-full mb-4">
               <School className="w-12 h-12" />
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">Aucun élève dans cette classe</h2>
             <p className="text-slate-500 text-center max-w-md mb-6">
               Votre liste d&apos;appel est vide. Ajoutez des élèves à cette classe pour commencer à faire l&apos;appel.
             </p>
             <Link href={`/classes/${selectedClass}`} className="bg-indigo-600 text-white rounded-2xl py-3 px-6 font-bold hover:scale-105 transition-transform inline-block">
               Ajouter des élèves
             </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {students.map((student) => {
                const status = attendance[student.id];

                // Playful clean design for student rows
                let rowBorder = status ? "border-slate-200 bg-white" : "border-slate-100 bg-white";
                
                return (
                  <motion.div 
                    layout
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 border rounded-2xl shadow-sm hover:shadow-md ${rowBorder}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="shrink-0 w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-lg border border-slate-200">
                        {student.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-slate-800 text-lg truncate pr-4">{student.name}</h3>
                      </div>
                    </div>
                    
                    {/* Segmented Controls - Playful Notionesque */}
                    <div className="flex bg-slate-50 rounded-[1.25rem] p-1.5 gap-1.5 shrink-0 ml-auto w-full sm:w-auto border border-slate-200 mt-2 sm:mt-0">
                      <button 
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`flex-1 sm:w-24 py-3 sm:py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'present' ? 'bg-emerald-500 text-white shadow-inner font-extrabold shadow-emerald-700/50' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 font-bold border border-slate-200/50'}`}
                      >
                        <span className="text-sm font-bold">Présent</span>
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`flex-1 sm:w-24 py-3 sm:py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'late' ? 'bg-amber-500 text-white shadow-inner font-extrabold shadow-amber-700/50' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 font-bold border border-slate-200/50'}`}
                      >
                        <span className="text-sm font-bold">Retard</span>
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`flex-1 sm:w-24 py-3 sm:py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'absent' ? 'bg-rose-500 text-white shadow-inner font-extrabold shadow-rose-700/50' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 font-bold border border-slate-200/50'}`}
                      >
                        <span className="text-sm font-bold">Absent</span>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FLOAT SAVE BAR - Sticky Bottom */}
      {students.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 sm:relative sm:bg-transparent sm:border-none sm:p-0 z-40">
          <div className="max-w-4xl mx-auto relative flex justify-center sm:justify-end">
            <AnimatePresence>
               {saveMessage.text && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute -top-16 flex justify-center pointer-events-none"
                  >
                    <div className={`px-6 py-3 rounded-full font-black text-sm shadow-xl flex items-center gap-3 ${saveMessage.type === 'success' ? 'bg-indigo-600 text-white shadow-indigo-600/30 ring-4 ring-indigo-50' : 'bg-rose-500 text-white shadow-rose-500/30'}`}>
                      {saveMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-indigo-200" /> : null}
                      {saveMessage.text}
                    </div>
                  </motion.div>
               )}
            </AnimatePresence>
  
            <button
              onClick={handleSave}
              disabled={isSaving || students.length === 0}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg px-8 py-4 rounded-xl sm:rounded-2xl shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:border-transparent disabled:bg-slate-400 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                   <span className="text-xl">💾</span>
                   Enregistrer l&apos;appel
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


