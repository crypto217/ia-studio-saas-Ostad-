"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, ChevronLeft, ChevronRight, Check, Calendar, Users, Sparkles, UserCheck } from "lucide-react"
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
        const sq = query(collection(db, "students"), where("teacherId", "==", user.uid), where("classId", "==", selectedClass))
        const studentSnap = await getDocs(sq)
        let studentList = studentSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }))
        
        // Trier par nom de famille (ou prénom si un seul mot)
        studentList.sort((a, b) => a.name.localeCompare(b.name))
        
        setStudents(studentList)

        const aq = query(collection(db, "attendances"), where("teacherId", "==", user.uid), where("classId", "==", selectedClass), where("date", "==", date))
        const attendanceSnap = await getDocs(aq)
        
        if (!attendanceSnap.empty) {
          const existingData = attendanceSnap.docs[0].data()
          setAttendance(existingData.records || {})
        } else {
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
  
  const markAllPresent = () => {
    const newAttendance: Record<string, AttendanceStatus> = {}
    students.forEach(s => {
      newAttendance[s.id] = 'present'
    })
    setAttendance(newAttendance)
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
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      {/* MAGICAL HEADER (Inspiré des recettes "Editorial" & "Clean Utility") */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 rounded-b-[2.5rem] p-6 sm:p-10 shadow-xl shadow-indigo-200/50 text-white relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 opacity-80" />
                L&apos;Appel du Jour
              </h1>
              <p className="text-indigo-100 font-medium">Gérez rapidement les présences de votre classe.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner w-full sm:w-auto">
               <button onClick={() => changeDate(-1)} className="p-3 text-white hover:bg-white/20 active:scale-95 transition-all rounded-xl">
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <div className="flex flex-col items-center justify-center min-w-[140px]">
                  <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-0.5"><Calendar className="w-3 h-3 inline mr-1 -mt-0.5" /> Date</span>
                  <span className="font-bold text-[15px] capitalize">{formatDate(date)}</span>
               </div>
               <button onClick={() => changeDate(1)} className="p-3 text-white hover:bg-white/20 active:scale-95 transition-all rounded-xl">
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/10 p-5 rounded-3xl backdrop-blur-sm border border-white/20 shadow-sm">
             <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2 pl-2">Classe Sélectionnée</label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-white text-indigo-900 border-none rounded-2xl px-5 py-4 font-black focus:outline-none focus:ring-4 focus:ring-fuchsia-300/30 text-lg cursor-pointer appearance-none shadow-sm transition-all"
                  >
                    {classes.length === 0 && <option value="">Aucune classe</option>}
                    {classes.map(c => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
             </div>

             <div className="flex items-center gap-6 px-4">
                <div className="text-center">
                   <div className="text-4xl font-black">{totalCount}</div>
                   <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Élèves</div>
                </div>
                <div className="h-10 w-px bg-white/20 rounded-full" />
                <div className="text-center">
                   <div className="text-4xl font-black">{markedCount}</div>
                   <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Marqués</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Raccourci UX: Tout Présent */}
        {students.length > 0 && selectedClass && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-8 flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100"
           >
             <div className="flex items-center gap-3 pl-2">
               <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                 <Sparkles className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="font-bold text-slate-800">Astuce Rapidité</h3>
                  <p className="text-xs text-slate-500">Marquez tout le monde présent, puis ajustez les absents.</p>
               </div>
             </div>
             <button 
               onClick={markAllPresent}
               className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2.5 px-5 rounded-2xl transition-all shadow-md shadow-indigo-200"
             >
               <UserCheck className="w-4 h-4" />
               <span className="hidden sm:inline">Tous Présents</span>
             </button>
           </motion.div>
        )}

        {/* LISTE DES ÉLÈVES (Clean Grid Layout) */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 shadow-xl"></div>
            <p className="mt-4 text-slate-500 font-medium animate-pulse">Chargement de la classe...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center gap-4">
            <Users className="w-12 h-12 text-slate-300" />
            <p className="text-slate-500 font-bold text-lg">Aucun élève trouvé dans cette classe.</p>
            <p className="text-slate-400 text-sm">Ajoutez des élèves depuis la section Élèves.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-slate-100">
              {students.map((student) => {
                const status = attendance[student.id];
                
                let avatarColor = "bg-slate-100 text-slate-600";
                let rowBg = "bg-white hover:bg-slate-50/50";
                
                if (status === 'present') {
                  avatarColor = "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-2";
                  rowBg = "bg-emerald-50/30";
                } else if (status === 'absent') {
                  avatarColor = "bg-rose-100 text-rose-700 ring-2 ring-rose-500 ring-offset-2";
                  rowBg = "bg-rose-50/30";
                } else if (status === 'late') {
                  avatarColor = "bg-amber-100 text-amber-700 ring-2 ring-amber-500 ring-offset-2";
                  rowBg = "bg-amber-50/30";
                }

                return (
                  <motion.div 
                    layout
                    key={student.id} 
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300 ${rowBg}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all ${avatarColor}`}>
                        {student.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <h3 className="font-bold text-slate-800 text-lg truncate pr-4">{student.name}</h3>
                        {status && (
                           <span className={`text-xs font-bold uppercase tracking-wider ${status === 'present' ? 'text-emerald-600' : status === 'absent' ? 'text-rose-600' : 'text-amber-600'}`}>
                             {status === 'present' ? 'Présent' : status === 'absent' ? 'Absent(e)' : 'En Retard'}
                           </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Minimalist Segmented Controls */}
                    <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 shrink-0 ml-auto w-full sm:w-auto">
                      <button 
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`flex-1 sm:w-20 py-2 sm:py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'present' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-black' : 'text-slate-500 hover:text-emerald-600 hover:bg-white font-semibold'}`}
                      >
                        <span className="text-[15px]">P</span>
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`flex-1 sm:w-20 py-2 sm:py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'absent' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-black' : 'text-slate-500 hover:text-rose-600 hover:bg-white font-semibold'}`}
                      >
                        <span className="text-[15px]">A</span>
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`flex-1 sm:w-20 py-2 sm:py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${status === 'late' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 font-black' : 'text-slate-500 hover:text-amber-600 hover:bg-white font-semibold'}`}
                      >
                        <span className="text-[15px]">R</span>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* FLOAT SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pb-6 z-50 pointer-events-none">
        <div className="max-w-4xl mx-auto relative pointer-events-auto">
          <AnimatePresence>
             {saveMessage.text && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute -top-16 left-0 right-0 flex justify-center pointer-events-none"
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
            className="w-full bg-slate-900 border-4 border-slate-900 text-white py-4 sm:py-5 rounded-3xl text-lg font-black shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:border-slate-400 disabled:bg-slate-400 transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                 <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                 Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}


