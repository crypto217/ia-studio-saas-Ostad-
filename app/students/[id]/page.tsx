"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { useSearchParams, useParams } from "next/navigation"
import { GenerateAIReportBtn } from "@/components/ui/GenerateAIReportBtn"
import { OfficialPrintHeader } from "@/components/ui/OfficialPrintHeader"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import Markdown from "react-markdown"
import { 
  ArrowLeft, 
  Clock,
  Send,
  Calendar,
  AlertCircle,
  BrainCircuit,
  Target,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
  UserX,
  Download
} from "lucide-react"

import { db, auth } from "@/firebase"
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"

const gradeFormat: Record<string, { label: string, color: string, bg: string, border: string, progress: string }> = {
  "A": { label: "Très satisfaisant", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200", progress: "w-[90%] bg-emerald-500" },
  "B": { label: "Satisfaisant", color: "text-indigo-700", bg: "bg-indigo-100", border: "border-indigo-200", progress: "w-[70%] bg-indigo-500" },
  "C": { label: "Peu satisfaisant", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200", progress: "w-[40%] bg-amber-500" },
  "D": { label: "Non satisfaisant", color: "text-rose-700", bg: "bg-rose-100", border: "border-rose-200", progress: "w-[15%] bg-rose-500" },
}

export default function StudentProfile() {
  const params = useParams()
  const studentId = params.id as string
  const searchParams = useSearchParams()
  // Try to get classId from search params; otherwise we'll fall back to student's classId later
  const initialClassId = searchParams.get("classId")

  const [user, loadingUser] = useAuthState(auth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [studentData, setStudentData] = useState<any>(null)
  const [classData, setClassData] = useState<any>(null)
  const [competencies, setCompetencies] = useState<any[]>([])
  const [remarks, setRemarks] = useState<any[]>([])
  const [absences, setAbsences] = useState(0)

  const [newRemark, setNewRemark] = useState("")
  const [activeTab, setActiveTab] = useState<"competencies" | "observations" | "ia">("competencies")
  const [aiReport, setAiReport] = useState<string | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleDownloadPDF = async () => {
    const element = document.getElementById('pdf-report-content');
    if (!element) return;
    
    setIsGeneratingPDF(true);
    // Petit délai pour laisser le DOM se mettre à jour
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bilan_${studentData?.name}.pdf`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      try {
        setLoading(true)

        // 1. Fetch Student
        const studentDoc = await getDoc(doc(db, "students", studentId))
        if (!studentDoc.exists()) {
          console.error("Student not found")
          setError(true)
          setLoading(false)
          return
        }
        const student = studentDoc.data()
        setStudentData(student)

        const resolvedClassId = initialClassId || student.classId

        // 2. Fetch Class
        let className = "Classe inconnue"
        if (resolvedClassId) {
           const classDoc = await getDoc(doc(db, "classes", resolvedClassId))
           if (classDoc.exists()) {
             className = classDoc.data().name
             setClassData(classDoc.data())
           }
        }
        setStudentData((prev: any) => ({ ...prev, className }))

        // 3. Fetch Grades (Competencies)
        const gradesQ = query(
          collection(db, "grades"),
          where("teacherId", "==", user.uid),
          where("studentId", "==", studentId)
        )
        const gradesSnap = await getDocs(gradesQ)
        const fetchedCompetencies = gradesSnap.docs.map(gDoc => {
          const d = gDoc.data()
          return {
            id: gDoc.id,
            subject: d.subject,
            grade: typeof d.score === 'string' && gradeFormat[d.score.toUpperCase()] ? d.score.toUpperCase() : (d.score || "C"),
            date: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString('fr-FR') : (d.date || "N/A"),
            details: d.details || "Pas de détails"
          }
        })
        setCompetencies(fetchedCompetencies)

        // 4. Fetch Observations (Remarks)
        const obsQ = query(
          collection(db, "observations"),
          where("teacherId", "==", user.uid),
          where("studentId", "==", studentId)
        )
        const obsSnap = await getDocs(obsQ)
        const fetchedRemarks = obsSnap.docs.map(oDoc => {
           const d = oDoc.data()
           return {
             id: oDoc.id,
             date: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString('fr-FR') : (d.date || "N/A"),
             text: d.note || d.text,
             type: "observation"
           }
        })
        setRemarks(fetchedRemarks)

        // 5. Fetch Attendances
        let totalAbsences = 0
        if (resolvedClassId) {
          const attQ = query(
            collection(db, "attendances"),
            where("teacherId", "==", user.uid),
            where("classId", "==", resolvedClassId)
          )
          const attSnap = await getDocs(attQ)
          attSnap.docs.forEach(aDoc => {
            const data = aDoc.data()
            if (data.records && data.records[studentId]) {
              const status = data.records[studentId]
              if (status === "absent") totalAbsences++
            }
          })
        }
        setAbsences(totalAbsences)

      } catch (err) {
        console.error("Error fetching student profile data", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, studentId, initialClassId])

  const handleAddRemark = async () => {
    if (!newRemark.trim() || !user) return
    try {
      const payload = {
        teacherId: user.uid,
        studentId: studentId,
        text: newRemark, // keeping it as text here, but observations in db use 'text' or 'note'
        note: newRemark, // saving both for compatibility
        createdAt: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, "observations"), payload)
      const remark = {
        id: docRef.id,
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        text: newRemark,
        type: "observation"
      }
      setRemarks([remark, ...remarks])
      setNewRemark("")
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'ajout de la remarque.")
    }
  }

  if (loadingUser || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center max-w-md w-full">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <UserX className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Élève introuvable</h2>
          <p className="text-slate-500 font-medium mb-8">
            Ce profil a été supprimé ou n&apos;existe pas.
          </p>
          <Link 
            href="/classes" 
            className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition active:scale-95 shadow-md shadow-indigo-200"
          >
            Retour aux classes
          </Link>
        </div>
      </div>
    )
  }

  // Calculate stats
  // Let's assume total classes are 60 for the sake of presentation if classData doesn't have it
  const totalClasses = classData?.totalSessions || 60
  const attendanceRate = totalClasses > 0 ? Math.round(((totalClasses - absences) / totalClasses) * 100) : 100
  const isAttendanceExcellent = attendanceRate >= 90
  const isAttendanceWarning = attendanceRate < 80
  const attBg = isAttendanceExcellent ? 'bg-emerald-50' : isAttendanceWarning ? 'bg-rose-50' : 'bg-amber-50'
  const attText = isAttendanceExcellent ? 'text-emerald-700' : isAttendanceWarning ? 'text-rose-700' : 'text-amber-700'
  const attIconBg = isAttendanceExcellent ? 'bg-emerald-100' : isAttendanceWarning ? 'bg-rose-100' : 'bg-amber-100'

  // Extract strengths/weaknesses from some logic (or keep static if not available)
  const strengths = studentData.strengths || ["Participatif"]
  const weaknesses = studentData.weaknesses || ["Bavardages"]

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* COVER BANNER */}
      <div className="h-48 w-full bg-indigo-50/80 relative flex items-start px-4 pt-4 sm:px-8 border-b border-indigo-100/50">
        <Link href={`/classes/${initialClassId || studentData.classId || ''}`} className="inline-flex items-center gap-2 text-indigo-900/60 hover:text-indigo-900 transition-colors bg-white/50 hover:bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl font-bold text-sm z-20 relative">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        {/* Decorative elements */}
        <div className="absolute right-10 bottom-0 top-0 w-64 bg-gradient-to-l from-indigo-200/40 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* PROFILE HEADER OVERLAPPING */}
        <div className="-mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10 mb-8 sm:mb-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-8">
            <div className="w-32 h-32 rounded-full bg-white ring-8 ring-slate-50 flex items-center justify-center text-4xl font-black shadow-lg overflow-hidden shrink-0">
              {studentData.gender === 'F' ? (
                <div className="w-full h-full flex items-center justify-center bg-pink-100 text-pink-600">
                  {studentData.name.substring(0, 2).toUpperCase()}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-sky-100 text-sky-600">
                  {studentData.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800 mb-2">
                {studentData.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black tracking-widest uppercase shadow-sm">
                  {studentData.className}
                </span>
              </div>
            </div>
          </div>

          <div className="pb-2">
            <GenerateAIReportBtn 
              studentId={studentId} 
              classId={initialClassId || studentData.classId || ''} 
              onReportReady={(report) => {
                setAiReport(report);
                setActiveTab('ia');
              }}
            />
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: STATS & BADGES */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Attendance Card */}
            <div className={`p-6 rounded-[2rem] border shadow-sm ${attBg} border-white/60 relative overflow-hidden`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${attIconBg} ${attText}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className={`font-black uppercase tracking-widest text-xs ${attText} opacity-80`}>Assiduité</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-5xl font-black tracking-tighter ${attText}`}>{attendanceRate}%</span>
                {isAttendanceWarning && <AlertCircle className={`w-6 h-6 ${attText}`} />}
              </div>
              <p className={`${attText} opacity-70 font-bold text-sm mt-2`}>
                {absences} absence{absences > 1 ? 's' : ''} signalée{absences > 1 ? 's' : ''}
              </p>
            </div>

            {/* Observations Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Points Clés
              </h3>
              
              <div className="mb-5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                  <ThumbsUp className="w-3 h-3 text-emerald-500" /> Qualités
                </h4>
                <div className="flex flex-wrap gap-2">
                  {strengths.map((str: string, i: number) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      {str}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                  <ThumbsDown className="w-3 h-3 text-rose-500" /> Axes d&apos;amélioration
                </h4>
                <div className="flex flex-wrap gap-2">
                  {weaknesses.map((wk: string, i: number) => (
                    <span key={i} className="bg-rose-50 text-rose-700 border border-rose-100/50 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      {wk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: BOOK OF COMPETENCIES & TABS */}
          <div className="lg:col-span-2 flex flex-col min-w-0">
            
            {/* Styled Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 p-1 bg-slate-200/50 rounded-[1.5rem] self-start max-w-full">
              <button 
                onClick={() => setActiveTab('competencies')}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'competencies' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Évaluation
              </button>
              <button 
                onClick={() => setActiveTab('observations')}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'observations' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Carnet de bord
              </button>
              {aiReport && (
                <button 
                  onClick={() => setActiveTab('ia')}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ia' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Sparkles className="w-4 h-4 inline-block mr-1" />
                  Bilan IA
                </button>
              )}
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {/* COMPETENCIES TAB */}
                {activeTab === 'competencies' && (
                  <motion.div
                    key="competencies"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-black text-slate-800 mb-4 px-2">Carnet de Compétences</h2>
                    
                    {competencies.length === 0 ? (
                      <div className="bg-white p-8 rounded-[2rem] text-center border border-slate-100 shadow-sm">
                        <p className="text-slate-500 font-medium">Aucune évaluation enregistrée pour cet élève.</p>
                      </div>
                    ) : (
                      competencies.map((comp, i) => {
                        const format = gradeFormat[comp.grade] || gradeFormat["C"]
                        
                        return (
                          <div key={i} className="bg-white p-5 sm:p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:shadow-md transition-shadow">
                            
                            {/* Huge Letter Macaron */}
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl font-black shadow-inner border-2 ${format.bg} ${format.color} ${format.border}`}>
                              {comp.grade}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-black text-slate-800 text-lg sm:text-xl truncate pr-4">{comp.subject}</h3>
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">{comp.date}</span>
                              </div>
                              
                              <p className="text-sm font-medium text-slate-500 mb-4 leading-relaxed">
                                {comp.details}
                              </p>
                              
                              {/* Progress bar visual */}
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all duration-1000 ${format.progress}`} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${format.color}`}>
                                  {format.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </motion.div>
                )}

                {activeTab === 'observations' && (
                  <motion.div
                      key="observations"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                  >
                      <div className="bg-white rounded-[2rem] p-4 sm:p-6 border border-slate-100 shadow-sm relative focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                        <textarea
                          value={newRemark}
                          onChange={(e) => setNewRemark(e.target.value)}
                          placeholder="Ajouter une note ou une observation..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-4 pr-16 min-h-[120px] resize-none focus:outline-none focus:border-indigo-300 transition-all text-slate-700 font-medium placeholder:text-slate-400"
                        />
                        <button 
                          onClick={handleAddRemark}
                          disabled={!newRemark.trim()}
                          className="absolute bottom-8 right-8 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
                        >
                          <Send className="w-5 h-5 ml-1" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <AnimatePresence>
                          {remarks.map((remark) => (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              key={remark.id} 
                              className="bg-white border border-slate-100 rounded-[2rem] p-5 sm:p-6 shadow-sm overflow-hidden"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{remark.date}</span>
                              </div>
                              <p className="text-slate-700 font-medium leading-relaxed sm:text-lg pl-10">{remark.text}</p>
                            </motion.div>
                          ))}
                          
                          {remarks.length === 0 && (
                            <div className="text-center p-8 text-slate-400 font-medium">
                              Aucune observation pour l&apos;instant.
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                  </motion.div>
                )}

                {activeTab === 'ia' && aiReport && (
                  <motion.div
                    key="ia"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4 mb-6 px-2">
                      <h2 className="text-xl font-black text-slate-800">Bilan Pédagogique</h2>
                      <button 
                        onClick={handleDownloadPDF} 
                        disabled={isGeneratingPDF}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all focus:ring-4 focus:ring-slate-900/10 active:scale-95 disabled:opacity-50"
                      >
                        {isGeneratingPDF ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Télécharger en PDF
                      </button>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 sm:p-10 border border-slate-100 shadow-sm overflow-hidden relative">
                      <div id="pdf-report-content" className={`bg-white text-slate-800 ${isGeneratingPDF ? 'px-12 py-10' : ''}`}>
                        {isGeneratingPDF && (
                           <div className="mb-10">
                              <OfficialPrintHeader 
                                studentName={studentData.name} 
                                className={studentData.className} 
                                schoolYear="2025/2026" 
                              />
                           </div>
                        )}
                        <div className="prose prose-indigo max-w-none text-slate-700">
                          <Markdown
                            components={{
                              h2: ({node, ...props}) => <h2 className="text-xl font-black text-indigo-900 mt-8 mb-4 border-b border-indigo-100 pb-2" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-bold text-indigo-800 mt-6 mb-3" {...props} />,
                              p: ({node, ...props}) => <p className="mb-4 leading-relaxed font-medium" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-indigo-400" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2 marker:text-indigo-400 font-bold" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-indigo-900" {...props} />,
                            }}
                          >
                            {aiReport}
                          </Markdown>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

