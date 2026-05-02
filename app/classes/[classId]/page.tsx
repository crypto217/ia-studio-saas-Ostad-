"use client"

import React, { useState, useEffect, use } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Users, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  MapPin,
  Award,
  Sparkles,
  BookOpen,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  X,
  Check,
  Plus
} from "lucide-react"

import { db } from "@/firebase"
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/components/AuthProvider"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

// --- TYPES ---
type StudentStatus = "excellent" | "good" | "needs_help"

interface Student {
  id: string
  name: string
  status: StudentStatus
  grade: number
  gender: "M" | "F"
  birthDate?: string
  photoUrl?: string
}

interface ClassData {
  id: string
  name: string
  cycle: string
  theme: "amber" | "emerald" | "violet" | "sky" | "rose"
  studentsCount: number
  average: number
  schedule: string
  room: string
  students: Student[]
}

const themeStyles = {
  amber: {
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    shadow: "shadow-amber-500/20",
    icon: Star
  },
  emerald: {
    gradient: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    shadow: "shadow-emerald-500/20",
    icon: Award
  },
  violet: {
    gradient: "from-violet-400 to-fuchsia-500",
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
    shadow: "shadow-violet-500/20",
    icon: Sparkles
  },
  sky: {
    gradient: "from-sky-400 to-blue-500",
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-200",
    shadow: "shadow-sky-500/20",
    icon: BookOpen
  },
  rose: {
    gradient: "from-rose-400 to-pink-500",
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
    shadow: "shadow-rose-500/20",
    icon: Users
  }
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export default function ClassDetailsPage({ params }: { params: Promise<{ classId: string }> }) {
  const router = useRouter()
  const { classId } = use(params)
  const { user, isAuthReady } = useAuth()
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [newStudentName, setNewStudentName] = useState("")
  const [gender, setGender] = useState<'boy' | 'girl' | null>(null)
  const [newStudentBirthDate, setNewStudentBirthDate] = useState("")
  const [newStudentPhoto, setNewStudentPhoto] = useState<File | null>(null)

  const handleAddStudent = async (closeAfter: boolean) => {
    if (!newStudentName.trim() || !newStudentBirthDate || !gender || !user?.uid || !classId) return
    
    setIsAddingStudent(true)
    try {
      // TODO: Upload newStudentPhoto to Firebase Storage here and get URL
      const photoUrl = ""
      const studentGenderArg = gender === 'boy' ? "M" : "F"

      const docRef = await addDoc(collection(db, "students"), {
        teacherId: user.uid,
        classId: classId,
        name: newStudentName,
        gender: studentGenderArg,
        birthDate: newStudentBirthDate,
        photoUrl: photoUrl,
        status: "good",
        grade: 0,
        createdAt: serverTimestamp()
      })
      
      const newStudent: Student = {
        id: docRef.id,
        name: newStudentName,
        gender: studentGenderArg,
        status: "good",
        grade: 0,
        birthDate: newStudentBirthDate,
        photoUrl: photoUrl
      }
      
      setStudents(prev => [...prev, newStudent])
      if (closeAfter) {
        setIsAddModalOpen(false)
      }
      setNewStudentName("")
      setGender(null)
      setNewStudentBirthDate("")
      setNewStudentPhoto(null)
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "students")
    } finally {
      setIsAddingStudent(false)
    }
  }

  useEffect(() => {
    const fetchClassAndStudents = async () => {
      if (!isAuthReady || !user?.uid) return
      
      try {
        const classDoc = await getDoc(doc(db, "classes", classId))
        if (classDoc.exists() && classDoc.data().teacherId === user.uid) {
          const classData = { id: classDoc.id, ...classDoc.data() } as ClassData
          setSelectedClass(classData)
          
          const studentsQ = query(collection(db, "students"), where("classId", "==", classId), where("teacherId", "==", user.uid))
          const studentsSnap = await getDocs(studentsQ)
          const studentsData = studentsSnap.docs.map(doc => ({
             id: doc.id,
             ...doc.data()
          })) as Student[]
          setStudents(studentsData)
        } else {
          setSelectedClass(null)
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `classes/${classId}`)
      } finally {
        setIsLoading(false)
      }
    }
    fetchClassAndStudents()
  }, [classId, user, isAuthReady])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <BookOpen className="w-12 h-12 text-slate-300" />
          <div className="h-4 w-32 bg-slate-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!selectedClass) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-16 h-16 text-rose-400 mb-4" />
        <h2 className="text-2xl font-black text-slate-700 mb-2">Classe introuvable</h2>
        <p className="text-slate-500 mb-6">Cette classe n&apos;existe pas ou a été supprimée.</p>
        <button 
          onClick={() => router.push('/classes')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition-colors"
        >
          Retour aux classes
        </button>
      </div>
    )
  }

  const theme = themeStyles[selectedClass.theme]
  
  return (
    <div className="bg-slate-50 min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-24">
      {/* Native Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.push('/classes')}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center min-w-0 px-2">
           <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight truncate w-full text-center">{selectedClass.name}</h1>
           <div className="bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-full text-sm flex items-center justify-center gap-2 mt-1">
             <Users className="w-4 h-4" />
             <span className="truncate">{students.length} {students.length > 1 ? 'élèves' : 'élève'}</span>
           </div>
        </div>
        <div className="w-10 h-10 shrink-0"></div> {/* Spacer for centering */}
      </div>

      {/* Main Action */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all mb-8"
      >
        <UserPlus className="w-5 h-5" />
        Ajouter un élève
      </button>

      {/* Contact List View */}
      <div className="flex flex-col gap-3">
        {students.map((student) => (
          <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/students/${student.id}?classId=${selectedClass.id}`)}
            key={student.id} 
            className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-indigo-200 transition-colors cursor-pointer group select-none [-webkit-tap-highlight-color:transparent]"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg shrink-0">
              {getInitials(student.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-slate-800 truncate">{student.name}</p>
              <p className="text-sm text-slate-400 truncate mt-0.5">
                {student.status === 'excellent' ? 'Niveau Excellent' : student.status === 'good' ? 'Bilan à jour' : 'Aide requise'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
          </motion.div>
        ))}
        {students.length === 0 && (
          <div className="text-center py-10">
             <p className="text-slate-500 font-medium">Aucun élève dans cette classe.</p>
          </div>
        )}
      </div>

      {/* ADD STUDENT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden pointer-events-auto border border-slate-100 flex flex-col max-h-[90dvh]"
            >
              <div className="bg-slate-50 border-b border-slate-100 p-4 sm:p-6 flex items-center justify-between shrink-0">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-500" />
                  Nouvel Élève
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white rounded-xl text-slate-400 hover:text-slate-600 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddStudent(true); }} className="flex-1 overflow-y-auto flex flex-col">
                <div className="p-4 sm:p-6 space-y-6 pb-8 sm:pb-12">
                  {/* Dynamic Avatar */}
                  <div className={`w-20 h-20 rounded-full mx-auto mb-2 flex items-center justify-center text-3xl font-black transition-colors duration-300 shadow-inner ${
                    gender === 'boy' ? 'bg-blue-100 text-blue-600' : 
                    gender === 'girl' ? 'bg-pink-100 text-pink-600' : 
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {newStudentName.trim() ? newStudentName.trim()[0].toUpperCase() : '?'}
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nom de l&apos;élève *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Lucas D."
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Genre *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button" 
                        onClick={() => setGender('boy')} 
                        className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${gender === 'boy' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-4 ring-blue-100' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'}`}
                      >
                        <span className="text-3xl">👦</span>
                        <span className="font-bold text-sm">Garçon</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setGender('girl')} 
                        className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${gender === 'girl' ? 'bg-pink-50 border-pink-500 text-pink-700 ring-4 ring-pink-100' : 'bg-white border-slate-200 text-slate-500 hover:border-pink-200'}`}
                      >
                        <span className="text-3xl">👧</span>
                        <span className="font-bold text-sm">Fille</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Date de naissance *</label>
                    <input 
                      type="date" 
                      required
                      value={newStudentBirthDate}
                      onChange={(e) => setNewStudentBirthDate(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Photo (Optionnelle)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setNewStudentPhoto(e.target.files?.[0] || null)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 border-t border-slate-100 z-10 flex flex-col gap-3 mt-auto">
                  <button
                    type="button"
                    onClick={() => handleAddStudent(false)}
                    disabled={isAddingStudent || !newStudentName.trim() || !newStudentBirthDate || !gender}
                    className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enregistrer & Ajouter un autre
                  </button>
                  <button 
                    type="submit" 
                    disabled={isAddingStudent || !newStudentName.trim() || !newStudentBirthDate || !gender}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-lg transition-transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 border-b-[4px] border-slate-950 active:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isAddingStudent ? (
                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Terminer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
