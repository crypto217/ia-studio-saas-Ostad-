"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { useSearchParams, useParams } from "next/navigation"
import { GenerateAIReportBtn } from "@/components/ui/GenerateAIReportBtn"
import { GenerateAIHomeworkBtn } from "@/components/ui/GenerateAIHomeworkBtn"
import { OfficialPrintHeader } from "@/components/ui/OfficialPrintHeader"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import Markdown from "react-markdown"
import { 
  ArrowLeft, 
  Clock,
  Send,
  Calendar,
  Sparkles,
  Loader2,
  UserX,
  Download,
  Award,
  ThumbsUp,
  ThumbsDown,
  Frown
} from "lucide-react"

import { createBrowserClient } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"

const gradeFormat: Record<string, { label: string, color: string, bg: string, border: string, progress: string }> = {
  "A": { label: "Très satisfaisante", color: "text-emerald-700", bg: "bg-emerald-50/60", border: "border-emerald-100", progress: "bg-emerald-500" },
  "B": { label: "Satisfaisante", color: "text-indigo-700", bg: "bg-indigo-50/60", border: "border-indigo-100", progress: "bg-indigo-500" },
  "C": { label: "Peu satisfaisante", color: "text-amber-700", bg: "bg-amber-50/60", border: "border-amber-100", progress: "bg-amber-500" },
  "D": { label: "Non satisfaisante", color: "text-rose-700", bg: "bg-rose-50/60", border: "border-rose-100", progress: "bg-rose-500" },
}

const parseSubjectField = (rawSubject: string) => {
  if (!rawSubject) return { title: "Évaluation", label: "", type: "" };
  
  const parts = rawSubject.split('_');
  // If the first part is a UUID (class ID), remove/shift it
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(parts[0])) {
    parts.shift();
  }
  
  if (parts.length === 0) return { title: rawSubject, label: "", type: "" };
  
  const category = parts[0]; // e.g. "oral", "lecture", "ecrit", "production", "continuous"
  const subKey = parts[1] || ""; // e.g. "c1", "evalContinue", etc.
  const tri = parts[2] || ""; // e.g. "t1"
  
  const triLabel = tri ? ` (Trimestre ${tri.substring(1)})` : "";

  if (category === "continuous") {
    const fieldLabels: Record<string, string> = {
      evalContinue: "Évaluation continue",
      devoir1: "Devoir 1",
      devoir2: "Devoir 2",
      composition: "Composition"
    };
    const label = fieldLabels[subKey] || subKey;
    return {
      title: `${label}${triLabel}`,
      label: label,
      type: "continuous"
    };
  }
  
  const subjectsData: Record<string, { title: string, criteria: { id: string, label: string }[] }> = {
    oral: {
      title: "Compréhension et communication orales",
      criteria: [
        { id: 'c1', label: "Thème de la situation" },
        { id: 'c2', label: "Unités de sens" },
        { id: 'c3', label: "Expression adaptée" }
      ]
    },
    lecture: {
      title: "Lecture",
      criteria: [
        { id: 'c1', label: "Correspondance graphie/phonie" },
        { id: 'c2', label: "Fluidité (mots/min)" },
        { id: 'c3', label: "Intonation" }
      ]
    },
    ecrit: {
      title: "Compréhension de l'écrit",
      criteria: [
        { id: 'c1', label: "Thème général" },
        { id: 'c2', label: "Champ lexical" },
        { id: 'c3', label: "Repérage d'informations" }
      ]
    },
    production: {
      title: "Production écrite",
      criteria: [
        { id: 'c1', label: "Pertinence" },
        { id: 'c2', label: "Cohérence" },
        { id: 'c3', label: "Correction de la langue" },
        { id: 'c4', label: "Lisibilité" }
      ]
    }
  };
  
  const subjectInfo = subjectsData[category];
  if (subjectInfo) {
    const crit = subjectInfo.criteria.find(c => c.id === subKey);
    return {
      title: `${subjectInfo.title}${triLabel}`,
      label: crit ? crit.label : subKey,
      type: category
    };
  }
  
  return { title: rawSubject, label: "", type: category };
};

const getNumericScoreFormat = (scoreNum: number) => {
  const pct = Math.min(Math.max(scoreNum * 10, 0), 100);
  if (scoreNum >= 8) {
    return {
      label: "Très satisfaisante",
      color: "text-emerald-700",
      bg: "bg-emerald-50/60",
      border: "border-emerald-100",
      progress: `bg-emerald-500`,
      percentage: pct
    };
  } else if (scoreNum >= 6) {
    return {
      label: "Satisfaisante",
      color: "text-indigo-700",
      bg: "bg-indigo-50/60",
      border: "border-indigo-100",
      progress: `bg-indigo-500`,
      percentage: pct
    };
  } else if (scoreNum >= 4) {
    return {
      label: "Peu satisfaisante",
      color: "text-amber-700",
      bg: "bg-amber-50/60",
      border: "border-amber-100",
      progress: `bg-amber-500`,
      percentage: pct
    };
  } else {
    return {
      label: "Non satisfaisante",
      color: "text-rose-700",
      bg: "bg-rose-50/60",
      border: "border-rose-100",
      progress: `bg-rose-500`,
      percentage: pct
    };
  }
};

const getEvaluationFormat = (grade: any) => {
  if (grade === null || grade === undefined) {
    return {
      ...gradeFormat["C"],
      percentage: 40
    };
  }
  const gradeStr = String(grade);
  const num = parseFloat(gradeStr);
  if (!isNaN(num)) {
    return getNumericScoreFormat(num);
  }
  
  const upperGrade = gradeStr.toUpperCase();
  const format = gradeFormat[upperGrade] || gradeFormat["C"];
  let pct = 50;
  if (upperGrade === "A") pct = 90;
  if (upperGrade === "B") pct = 70;
  if (upperGrade === "C") pct = 40;
  if (upperGrade === "D") pct = 15;
  
  return {
    ...format,
    percentage: pct
  };
};

export default function StudentProfile() {
  const params = useParams()
  const studentId = params.id as string
  const searchParams = useSearchParams()
  const initialClassId = searchParams.get("classId")

  const { user, isAuthReady } = useAuth()
  const loadingUser = !isAuthReady
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

  const supabase = createBrowserClient()

  const handleDownloadPDF = async () => {
    const element = document.getElementById('pdf-report-content');
    if (!element) return;
    
    setIsGeneratingPDF(true);
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
      if (!user?.id) return
      try {
        setLoading(true)

        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .single()

        if (studentError || !student) {
          console.error("Student not found", studentError)
          setError(true)
          setLoading(false)
          return
        }
        setStudentData(student)

        const resolvedClassId = initialClassId || student.class_id

        let className = "Classe inconnue"
        if (resolvedClassId) {
           const { data: classDoc } = await supabase
             .from('classes')
             .select('*')
             .eq('id', resolvedClassId)
             .single()

           if (classDoc) {
             className = classDoc.name
             setClassData(classDoc)
           }
        }
        setStudentData((prev: any) => ({ ...prev, className }))

        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select('*')
          .eq('teacher_id', user.id)
          .eq('student_id', studentId)

        if (!gradesError && gradesData) {
          const fetchedCompetencies = gradesData.map((d: any) => {
            const parsed = parseSubjectField(d.subject);
            return {
              id: d.id,
              subject: parsed.title,
              grade: d.score || "C",
              date: d.date ? new Date(d.date).toLocaleDateString('fr-FR') : "N/A",
              details: d.details || (parsed.type === 'continuous' ? "Note saisie dans le carnet de notes." : `Compétence : ${parsed.label}`)
            };
          });
          setCompetencies(fetchedCompetencies)
        }

        const { data: obsData, error: obsError } = await supabase
          .from('observations')
          .select('*')
          .eq('teacher_id', user.id)
          .eq('student_id', studentId)

        if (!obsError && obsData) {
          const fetchedRemarks = obsData.map((d: any) => ({
            id: d.id,
            date: d.date ? new Date(d.date).toLocaleDateString('fr-FR') : "N/A",
            text: d.note,
            type: "observation"
          }))
          setRemarks(fetchedRemarks)
        }

        let totalAbsences = 0
        if (resolvedClassId) {
          const { count, error: attError } = await supabase
            .from('attendances')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', studentId)
            .eq('status', 'absent')

          if (!attError && count !== null) {
            totalAbsences = count
          }
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
    if (!newRemark.trim() || !user?.id) return
    try {
      const { data, error } = await supabase
        .from('observations')
        .insert([{
          teacher_id: user.id,
          student_id: studentId,
          note: newRemark,
          date: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      const remark = {
        id: data.id,
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-2" />
        <p className="text-slate-500 font-medium animate-pulse">Chargement du profil...</p>
      </div>
    )
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center max-w-md w-full">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <UserX className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Élève introuvable</h2>
          <p className="text-slate-500 font-medium mb-8">
            Ce profil a été supprimé ou n&apos;existe pas.
          </p>
          <Link 
            href="/classes" 
            className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition active:scale-95 shadow-md shadow-indigo-100"
          >
            Retour aux classes
          </Link>
        </div>
      </div>
    )
  }

  // Attendance stats
  const totalClasses = classData?.totalSessions || 60
  const attendanceRate = totalClasses > 0 ? Math.round(((totalClasses - absences) / totalClasses) * 100) : 100
  const isAttendanceExcellent = attendanceRate >= 90
  const isAttendanceWarning = attendanceRate < 80

  // Calculate overall average out of 10
  const getNumericScore = (score: string) => {
    const num = parseFloat(score);
    if (!isNaN(num)) return num;
    const s = score.toUpperCase();
    if (s === 'A') return 9.0;
    if (s === 'B') return 7.5;
    if (s === 'C') return 6.0;
    if (s === 'D') return 4.0;
    return 0;
  };
  
  const overallAverage = competencies.length > 0
    ? (competencies.reduce((sum, c) => sum + getNumericScore(c.grade), 0) / competencies.length).toFixed(1)
    : null;

  // Breakdown counts of competencies
  const countA = competencies.filter(c => c.grade === 'A').length
  const countB = competencies.filter(c => c.grade === 'B').length
  const countC = competencies.filter(c => c.grade === 'C').length
  const countD = competencies.filter(c => c.grade === 'D').length

  const dominantGrade: string = (() => {
    if (competencies.length === 0) return "--";
    const counts = { A: countA, B: countB, C: countC, D: countD };
    let maxGrade: 'A' | 'B' | 'C' | 'D' = 'B';
    let maxVal = -1;
    (Object.keys(counts) as Array<'A' | 'B' | 'C' | 'D'>).forEach(k => {
      if (counts[k] > maxVal) {
        maxVal = counts[k];
        maxGrade = k;
      }
    });
    return maxGrade as 'A' | 'B' | 'C' | 'D';
  })();

  const strengths = studentData.strengths || (overallAverage && parseFloat(overallAverage) >= 7.5 ? ["Participatif", "Travailleur"] : ["Volontaire"])
  const weaknesses = studentData.weaknesses || (overallAverage && parseFloat(overallAverage) < 6.0 ? ["Concentration à renforcer"] : ["Participation à encourager"])

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans antialiased text-slate-800">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-8 relative overflow-hidden">
        <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <Link href={`/classes/${initialClassId || studentData.class_id || ''}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-colors text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4" /> Retour à la classe
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 pb-2 w-full sm:w-auto">
            <GenerateAIHomeworkBtn
              studentId={studentId}
              classId={initialClassId || studentData.class_id || ''}
              studentName={studentData?.name}
            />
            <GenerateAIReportBtn 
              studentId={studentId} 
              classId={initialClassId || studentData.class_id || ''} 
              onReportReady={(report) => {
                setAiReport(report);
                setActiveTab('ia');
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-8">
        
        {/* Profile Card */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* AVATAR */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shadow-inner shrink-0 ${
              studentData.gender === 'F' ? 'bg-pink-50 text-pink-700' : 'bg-indigo-50 text-indigo-700'
            }`}>
              {studentData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>

            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {studentData.className}
                </span>
                <span className="text-slate-400 text-sm font-semibold">
                  • {studentData.gender === 'F' ? '👧 Fille' : '👦 Garçon'}
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                {studentData.name}
              </h1>
              <p className="text-slate-400 text-xs font-bold mt-1">
                Né(e) le {studentData.birth_date ? new Date(studentData.birth_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date inconnue'}
              </p>
            </div>
          </div>

          {/* KEY INDICATORS */}
          <div className="flex gap-6 justify-center sm:justify-end border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Acquis Dominant</p>
              <p className={`text-xl font-black mt-0.5 ${dominantGrade === 'A' ? 'text-emerald-600' : dominantGrade === 'B' ? 'text-indigo-600' : dominantGrade === 'C' ? 'text-amber-500' : dominantGrade === 'D' ? 'text-rose-600' : 'text-slate-800'}`}>{dominantGrade}</p>
            </div>
            <div className="border-l border-slate-100 h-10 self-center"></div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assiduité</p>
              <p className="text-xl font-black text-slate-850 mt-0.5">{attendanceRate}%</p>
            </div>
            <div className="border-l border-slate-100 h-10 self-center"></div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Évaluations</p>
              <p className="text-xl font-black text-slate-850 mt-0.5">{competencies.length}</p>
            </div>
          </div>
        </div>

        {/* SIDE BAR / MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Suivi d'Assiduité */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-slate-800">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-700 text-sm tracking-wide">Suivi d&apos;Assiduité</h3>
              </div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black tracking-tight text-slate-800">{attendanceRate}%</span>
                <span className="text-xs font-semibold text-slate-400">présence générale</span>
              </div>
              
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mt-3 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    isAttendanceExcellent ? 'bg-emerald-500' : isAttendanceWarning ? 'bg-rose-500' : 'bg-amber-500'
                  }`} 
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>

              <p className="text-xs font-bold mt-4 text-slate-500 leading-normal">
                {absences === 0 ? "Aucune absence signalée." : `${absences} absence${absences > 1 ? 's' : ''} enregistrée${absences > 1 ? 's' : ''} ce trimestre.`}
              </p>
            </div>

            {/* Répartition des Niveaux */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> Répartition des Niveaux
              </h3>
              
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                  <span className="font-bold text-xs text-emerald-800">Très satisfaisant (A)</span>
                  <span className="bg-emerald-500 text-white font-black text-xs px-2.5 py-0.5 rounded-lg">{countA}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                  <span className="font-bold text-xs text-indigo-800">Satisfaisant (B)</span>
                  <span className="bg-indigo-500 text-white font-black text-xs px-2.5 py-0.5 rounded-lg">{countB}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/50 border border-amber-100/50">
                  <span className="font-bold text-xs text-amber-800">Peu satisfaisant (C)</span>
                  <span className="bg-amber-500 text-white font-black text-xs px-2.5 py-0.5 rounded-lg">{countC}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/50 border border-rose-100/50">
                  <span className="font-bold text-xs text-rose-800">Non satisfaisant (D)</span>
                  <span className="bg-rose-500 text-white font-black text-xs px-2.5 py-0.5 rounded-lg">{countD}</span>
                </div>
              </div>
            </div>

            {/* Forces & Faiblesses */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Profil d&apos;apprentissage
              </h3>
              
              <div className="mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /> Forces
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {strengths.map((str: string, i: number) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-xl text-xs font-bold">
                      {str}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                  <ThumbsDown className="w-3.5 h-3.5 text-rose-500" /> Axes de Progrès
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {weaknesses.map((wk: string, i: number) => (
                    <span key={i} className="bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-xl text-xs font-bold">
                      {wk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* MAIN TABS AREA */}
          <div className="lg:col-span-2 flex flex-col min-w-0">
            
            {/* TAB SELECTOR */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar mb-6 p-1 bg-slate-200/50 rounded-2xl self-start max-w-full">
              <button 
                onClick={() => setActiveTab('competencies')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'competencies' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Évaluation
              </button>
              <button 
                onClick={() => setActiveTab('observations')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'observations' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Carnet de bord
              </button>
              {aiReport && (
                <button 
                  onClick={() => setActiveTab('ia')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'ia' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-600 hover:bg-indigo-50/50'
                  }`}
                >
                  Bilan IA
                </button>
              )}
            </div>

            {/* TAB CONTAINER */}
            <div className="relative">
              <AnimatePresence mode="wait">
                
                {/* EVALUATIONS */}
                {activeTab === 'competencies' && (
                  <motion.div
                    key="competencies"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {competencies.length === 0 ? (
                      <div className="bg-white p-10 rounded-[2rem] text-center border border-slate-100 shadow-sm">
                        <Frown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Aucune évaluation</h3>
                        <p className="text-slate-500 font-medium text-sm">Cet élève n&apos;a pas encore reçu de notes ou d&apos;acquis ce trimestre.</p>
                      </div>
                    ) : (
                      competencies.map((comp, i) => {
                        const format = getEvaluationFormat(comp.grade)
                        const isNumeric = !isNaN(parseFloat(comp.grade))
                        
                        return (
                          <div key={i} className="bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:shadow-md transition-shadow">
                            
                            {/* GRADE AVATAR */}
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl flex items-center justify-center border border-slate-100 ${format.bg} ${format.color}`}>
                              {isNumeric ? (
                                <div className="flex flex-col items-center justify-center leading-none">
                                  <span className="text-xl sm:text-2xl font-black">{comp.grade}</span>
                                  <span className="text-[9px] sm:text-[10px] opacity-70 font-bold border-t border-current px-1 mt-0.5">/10</span>
                                </div>
                              ) : (
                                <span className="text-2xl sm:text-3xl font-black">{comp.grade}</span>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1.5">
                                <h3 className="font-bold text-slate-800 text-lg truncate pr-4">{comp.subject}</h3>
                                <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 shrink-0">{comp.date}</span>
                              </div>
                              
                              <p className="text-sm text-slate-500 font-medium mb-3 leading-relaxed">
                                {comp.details}
                              </p>
                              
                              {/* progress bar */}
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${format.progress}`} 
                                    style={{ width: `${format.percentage}%` }}
                                  />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${format.color}`}>
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

                {/* OBSERVATIONS (CARNET DE BORD) */}
                {activeTab === 'observations' && (
                  <motion.div
                      key="observations"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                  >
                      {/* ADD REMARK */}
                      <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm relative">
                        <textarea
                          value={newRemark}
                          onChange={(e) => setNewRemark(e.target.value)}
                          placeholder="Ajouter une note de suivi ou une observation sur l'élève..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-16 min-h-[100px] resize-none focus:outline-none focus:border-indigo-300 transition-colors text-slate-700 font-medium placeholder:text-slate-400"
                        />
                        <button 
                          onClick={handleAddRemark}
                          disabled={!newRemark.trim()}
                          className="absolute bottom-9 right-8 w-10 h-10 bg-indigo-650 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm shadow-indigo-100"
                        >
                          <Send className="w-4 h-4 ml-0.5" />
                        </button>
                      </div>

                      {/* REMARKS LIST */}
                      <div className="space-y-4">
                        <AnimatePresence>
                          {remarks.map((remark) => (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              key={remark.id} 
                              className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{remark.date}</span>
                              </div>
                              <p className="text-slate-700 font-medium leading-relaxed sm:text-lg pl-9">{remark.text}</p>
                            </motion.div>
                          ))}
                          
                          {remarks.length === 0 && (
                            <div className="text-center py-10 text-slate-400 font-medium">
                              Aucune observation pour le moment.
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                  </motion.div>
                )}

                {/* AI PEDAGOGICAL REPORT */}
                {activeTab === 'ia' && aiReport && (
                  <motion.div
                    key="ia"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-4 mb-6 px-2">
                      <h2 className="text-xl font-bold text-slate-800">Bilan pédagogique</h2>
                      <button 
                        onClick={handleDownloadPDF} 
                        disabled={isGeneratingPDF}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-2 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {isGeneratingPDF ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Télécharger PDF
                      </button>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm overflow-hidden relative">
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
                              h2: ({node, ...props}) => <h2 className="text-lg font-bold text-indigo-900 mt-6 mb-3 border-b border-indigo-50 pb-1.5" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-base font-bold text-indigo-800 mt-4 mb-2" {...props} />,
                              p: ({node, ...props}) => <p className="mb-3.5 leading-relaxed text-sm font-medium text-slate-600" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3.5 space-y-1.5 marker:text-indigo-400 font-medium text-sm text-slate-650" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3.5 space-y-1.5 marker:text-indigo-400 font-bold text-sm text-slate-650" {...props} />,
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
