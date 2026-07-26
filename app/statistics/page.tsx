"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "motion/react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  AlertCircle, 
  GraduationCap, 
  ChevronDown, 
  Activity, 
  CalendarDays,
  BellRing,
  Loader2
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { createBrowserClient } from "@/lib/supabase";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function StatisticsPage() {
  const { user, isAuthReady } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient();

  useEffect(() => {
    if (!isAuthReady || !user?.id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id);

        if (classesError) throw classesError;
        setClasses(classesData || []);

        if (classesData && classesData.length > 0) {
          if (!selectedClassId) {
            setSelectedClassId(classesData[0].id);
          }
        }

        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('teacher_id', user.id);

        if (studentsError) throw studentsError;
        setStudents(studentsData || []);

        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select('*')
          .eq('teacher_id', user.id);

        if (gradesError) throw gradesError;
        setGrades(gradesData || []);

        const { data: attendancesData, error: attendancesError } = await supabase
          .from('attendances')
          .select('*');

        if (attendancesError) throw attendancesError;
        setAttendances(attendancesData || []);

      } catch (err) {
        console.error("Error loading statistics data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const channel = supabase
      .channel('statistics-page-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes', filter: `teacher_id=eq.${user.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students', filter: `teacher_id=eq.${user.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grades', filter: `teacher_id=eq.${user.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendances' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAuthReady, selectedClassId]);

  // Filter data based on selected class
  const classStudents = students.filter(s => s.class_id === selectedClassId);
  const studentIds = classStudents.map(s => s.id);
  const classGrades = grades.filter(g => studentIds.includes(g.student_id));
  const classAttendances = attendances.filter(a => studentIds.includes(a.student_id));

  // Helper to convert scores to numerical values (out of 10)
  const getNumericScore = (score: any) => {
    if (score === null || score === undefined) return 0;
    const scoreStr = String(score);
    const num = parseFloat(scoreStr);
    if (!isNaN(num)) return num;
    const s = scoreStr.toUpperCase();
    if (s === 'A') return 9.0;
    if (s === 'B') return 7.5;
    if (s === 'C') return 6.0;
    if (s === 'D') return 4.0;
    return 0;
  };

  // KPI 1: Class Average
  let classAverage: string | number = "--";
  let hasCalculatedGrades = false;
  if (classGrades.length > 0) {
    const totalScore = classGrades.reduce((sum, g) => sum + getNumericScore(g.score), 0);
    classAverage = parseFloat((totalScore / classGrades.length).toFixed(1));
    hasCalculatedGrades = true;
  }

  // KPI 2: Acquisition Rate
  let acquisitionRate: string | number = "--";
  if (hasCalculatedGrades && classGrades.length > 0) {
    const acquiredCount = classGrades.filter(g => {
      if (g.score === null || g.score === undefined) return false;
      const score = String(g.score).toUpperCase();
      if (score === 'A' || score === 'B' || score === 'C') return true;
      const num = parseFloat(score);
      return !isNaN(num) && num >= 5.0;
    }).length;
    acquisitionRate = Math.round((acquiredCount / classGrades.length) * 100);
  }

  // KPI 3: Attendance Rate
  let attendanceRate: string | number = "--";
  if (classAttendances.length > 0) {
    const presentOrLate = classAttendances.filter(a => a.status === 'present' || a.status === 'late').length;
    attendanceRate = Math.round((presentOrLate / classAttendances.length) * 100);
  }

  // KPI 4: Students in Difficulty
  let difficultyCount = 0;
  const studentDifficultyList: any[] = [];

  classStudents.forEach(student => {
    const studentGrades = classGrades.filter(g => g.student_id === student.id);
    let isDifficult = false;
    let reason = "";

    if (studentGrades.length > 0) {
      const countCandD = studentGrades.filter(g => {
        if (!g.score) return false;
        const s = String(g.score).toUpperCase();
        return s === 'C' || s === 'D';
      }).length;
      
      const isMajorityCandD = countCandD > studentGrades.length / 2;
      const hasD = studentGrades.some(g => g.score && String(g.score).toUpperCase() === 'D');
      
      if (isMajorityCandD) {
        isDifficult = true;
        reason = `Majorité d'acquis C/D (${countCandD}/${studentGrades.length})`;
      } else if (hasD) {
        isDifficult = true;
        reason = "Présence d'acquis non satisfaisants (D)";
      }
    }

    // Check attendance for this student
    const studentAtt = classAttendances.filter(a => a.student_id === student.id);
    if (studentAtt.length > 0) {
      const absences = studentAtt.filter(a => a.status === 'absent').length;
      if (absences >= 2) {
        isDifficult = true;
        reason = reason ? `${reason} & ${absences} absences` : `Absences répétées (${absences})`;
      }
    }

    if (isDifficult) {
      difficultyCount++;
      studentDifficultyList.push({
        id: student.id,
        name: student.name,
        motif: reason,
        action: reason.includes('absences') ? "Contacter les parents" : "Atelier de remédiation"
      });
    }
  });

  // Demographics
  const girlsCount = classStudents.filter(s => s.gender === 'F').length;
  const boysCount = classStudents.filter(s => s.gender === 'M').length;
  const totalStudents = classStudents.length;

  const genderData = totalStudents > 0 ? [
    { name: 'Filles', value: Math.round((girlsCount / totalStudents) * 100), color: '#f472b6' },
    { name: 'Garçons', value: Math.round((boysCount / totalStudents) * 100), color: '#60a5fa' }
  ] : [];

  // Age distribution
  const ageCounts: Record<string, number> = {};
  classStudents.forEach(s => {
    if (s.birth_date) {
      const birthYear = new Date(s.birth_date).getFullYear();
      if (!isNaN(birthYear)) {
        const age = new Date().getFullYear() - birthYear;
        const label = `${age} ans`;
        ageCounts[label] = (ageCounts[label] || 0) + 1;
      }
    }
  });

  const displayAgeData = Object.keys(ageCounts).map(age => ({
    age,
    count: ageCounts[age]
  })).sort((a, b) => parseInt(a.age) - parseInt(b.age));

  // Skills Domain Performance
  const subjects = ['Lecture', 'Vocabulaire', 'Grammaire', 'Conjugaison', 'Production Écrite'];
  const skillsData = subjects.map(subj => {
    const subjectGrades = classGrades.filter(g => g.subject?.toLowerCase() === subj.toLowerCase());
    const score = subjectGrades.length > 0 
      ? parseFloat((subjectGrades.reduce((sum, g) => sum + getNumericScore(g.score), 0) / subjectGrades.length).toFixed(1))
      : 0;
    return { name: subj, score };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Chargement de l&apos;analyse...</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center max-w-md w-full">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-700 mb-2">Aucune classe disponible</h2>
          <p className="text-slate-500 font-medium max-w-sm mb-6">Vous devez d&apos;abord créer des classes et inscrire des élèves.</p>
          <Link href="/classes" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm">
            Gérer mes classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans pb-24">
      <motion.div 
        className="max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
         <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analyse Pédagogique</h1>
              <p className="text-slate-500 font-medium mt-1">Vue d&apos;ensemble de la classe</p>
           </div>
           <div className="relative inline-flex shrink-0 w-full sm:w-auto shadow-sm">
              <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
           </div>
         </motion.div>

         {/* KPIs */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50/50 p-2.5 rounded-xl">
                  <Activity className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Moyenne de la Classe</h3>
                <div className="text-3xl font-bold text-slate-800">
                  {classAverage}{classAverage !== "--" && <span className="text-base text-slate-400 font-medium">/10</span>}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-emerald-50/50 p-2.5 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Taux d&apos;Acquisition</h3>
                <div className="text-3xl font-bold text-slate-800 flex items-baseline gap-2">
                  {acquisitionRate}{acquisitionRate !== "--" && "%"}
                  {acquisitionRate !== "--" && <span className="text-xs text-slate-500 font-medium">&gt; moyenne</span>}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50/50 p-2.5 rounded-xl">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                  <TrendingUp className="w-3 h-3" /> +2%
                </div>
              </div>
              <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Taux de Présence</h3>
                <div className="text-3xl font-bold text-slate-800">
                  {attendanceRate}{attendanceRate !== "--" && "%"}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-red-50 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="bg-red-50 p-2.5 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-slate-500 text-sm font-medium mb-1">Élèves en difficulté</h3>
                <div className="text-3xl font-bold text-red-600 flex items-baseline gap-2">
                  {classStudents.length > 0 && classGrades.length > 0 ? difficultyCount : 0}
                  <span className="text-xs text-red-400 font-medium">à suivre</span>
                </div>
              </div>
            </motion.div>
         </div>

         {/* Demographics Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Pie Chart: Genre */}
           <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <h2 className="text-lg font-bold text-slate-800 mb-1">Répartition Filles / Garçons</h2>
             <p className="text-sm text-slate-500 mb-6">Démographie selon le genre</p>
             <div className="h-[250px] w-full flex items-center justify-center text-slate-400 font-medium">
                {genderData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                          contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#334155' }}
                          itemStyle={{ fontWeight: 600 }}
                          formatter={(value: any) => [`${value}%`, 'Proportion']}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: '#64748B' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  "Aucun élève inscrit dans cette classe"
                )}
             </div>
           </motion.div>

           {/* Horizontal Bar Chart: Age */}
           <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <h2 className="text-lg font-bold text-slate-800 mb-1">Pyramide des âges</h2>
             <p className="text-sm text-slate-500 mb-6">Distribution par tranche d&apos;âge</p>
             <div className="h-[250px] w-full flex items-center justify-center text-slate-400 font-medium">
                {displayAgeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={displayAgeData} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="age" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748B', fontSize: 13 }} 
                        width={60}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }} 
                        contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value} élèves`, 'Effectif']}
                      />
                      <Bar dataKey="count" fill="#818cf8" radius={[0, 6, 6, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  "Aucune donnée d'âge disponible"
                )}
             </div>
           </motion.div>
         </div>

         {/* Skills Graph */}
         <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">Performances par Domaine</h2>
              <p className="text-sm text-slate-500 mt-0.5">Évaluation moyenne des compétences (sur 10)</p>
            </div>
            <div className="w-full h-[300px] flex items-center justify-center text-slate-400 font-medium">
              {classGrades.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillsData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 10]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 12 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }} 
                      contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#334155' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {skillsData.map((entry, index) => {
                        let fillColor = '#ef4444'; // red
                        if (entry.score > 7) fillColor = '#22c55e'; // green
                        else if (entry.score >= 5) fillColor = '#f97316'; // orange
                        return <Cell key={`cell-${index}`} fill={fillColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                "Aucune note enregistrée pour le moment dans cette classe"
              )}
            </div>
         </motion.div>

         {/* Alerts Table */}
         <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h2 className="text-lg font-bold text-slate-800">Élèves à suivre en priorité</h2>
               <p className="text-sm text-slate-500 mt-0.5">Alertes pédagogiques et administratives</p>
             </div>
             <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
               <BellRing className="w-5 h-5" />
             </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50/50">
                   <th className="py-3 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider">Nom de l&apos;élève</th>
                   <th className="py-3 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider">Motif d&apos;alerte</th>
                   <th className="py-3 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider">Action recommandée</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {studentDifficultyList.map((student) => (
                   <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                     <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
                       <Link href={`/students/${student.id}`} className="transition-opacity hover:opacity-75">
                         {student.name}
                       </Link>
                     </td>
                     <td className="py-4 px-6 text-sm text-slate-600">
                       <span className="inline-flex items-center gap-1.5 font-medium">
                         <div className={`w-1.5 h-1.5 rounded-full ${student.motif.includes('Baisse') || student.motif.includes('Absences') || student.motif.includes('faible') ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                         {student.motif}
                       </span>
                     </td>
                     <td className="py-4 px-6">
                       <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60 whitespace-nowrap">
                         {student.action}
                       </span>
                     </td>
                   </tr>
                 ))}
                 {studentDifficultyList.length === 0 && (
                   <tr>
                     <td colSpan={3} className="py-8 px-6 text-center text-slate-400 font-medium">
                       Aucun élève en difficulté à suivre dans cette classe.
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
         </motion.div>

      </motion.div>
    </div>
  );
}
