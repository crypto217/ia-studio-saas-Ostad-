'use client';

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, Check, Pencil, BookOpen, PenTool, AlertCircle, RefreshCw, Palmtree, GraduationCap, Briefcase, LucideIcon, TrendingUp, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"
import { createBrowserClient } from "@/lib/supabase"
import Link from "next/link"

export function ClassAnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  const [selectedClassName, setSelectedClassName] = useState<string>("all");
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [lectureStats, setLectureStats] = useState({ acquis: 0, enCours: 0, aAider: 0 });
  const [ecritStats, setEcritStats] = useState({ acquis: 0, enCours: 0, aAider: 0 });
  const [langueStats, setLangueStats] = useState({ acquis: 0, enCours: 0, aAider: 0 });
  const [hasGrades, setHasGrades] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthReady } = useAuth();
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!isAuthReady || !user?.id) return;

    const fetchData = async () => {
      setError(null);
      
      try {
        // 1. Fetch classes
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name')
          .eq('teacher_id', user.id);

        if (classesError) throw classesError;
        if (classesData) setClasses(classesData);

        // 2. Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });

        if (coursesError) throw coursesError;
        if (coursesData) {
          const mappedCourses = coursesData.map(c => ({
            id: c.id,
            title: c.title,
            className: c.class_name,
            projectNumber: c.project_number,
            sequenceNumber: c.sequence_number,
            createdAt: c.created_at
          }));
          setAllCourses(mappedCourses);
        }

        // 3. Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('teacher_id', user.id);

        if (studentsError) throw studentsError;

        // 4. Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('teacher_id', user.id);

        if (tasksError) throw tasksError;

        // 5. Fetch grades
        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select('*')
          .eq('teacher_id', user.id);

        if (gradesError) throw gradesError;

        // --- Calculate Competency Stats ---
        let finalLecture = { acquis: 0, enCours: 0, aAider: 0 };
        let finalEcrit = { acquis: 0, enCours: 0, aAider: 0 };
        let finalLangue = { acquis: 0, enCours: 0, aAider: 0 };
        let anyGrades = false;

        if (gradesData && gradesData.length > 0) {
          // Filter grades based on selected class
          const targetClassId = selectedClassName !== "all" ? classesData.find(c => c.name === selectedClassName)?.id : null;
          const filteredGrades = targetClassId 
            ? gradesData.filter((g: any) => g.subject.startsWith(`${targetClassId}_`)) 
            : gradesData;

          if (filteredGrades.length > 0) {
            anyGrades = true;
            let lectureCounts = { A: 0, B: 0, C: 0, D: 0, total: 0 };
            let ecritCounts = { A: 0, B: 0, C: 0, D: 0, total: 0 };
            let langueCounts = { A: 0, B: 0, C: 0, D: 0, total: 0 };

            const classifyScore = (score: any) => {
              if (!score) return 'D';
              const scoreStr = String(score);
              const num = parseFloat(scoreStr);
              if (!isNaN(num)) {
                if (num >= 7.5) return 'A';
                if (num >= 5) return 'B';
                return 'D';
              }
              const s = scoreStr.toUpperCase();
              if (s === 'A') return 'A';
              if (s === 'B' || s === 'C') return 'B';
              return 'D';
            };

            filteredGrades.forEach((g: any) => {
              const category = classifyScore(g.score);
              const subjectKey = g.subject.toLowerCase();

              if (subjectKey.includes('_lecture_')) {
                lectureCounts[category]++;
                lectureCounts.total++;
              } else if (subjectKey.includes('_ecrit_') || subjectKey.includes('_production_')) {
                ecritCounts[category]++;
                ecritCounts.total++;
              } else if (subjectKey.includes('_oral_') || subjectKey.includes('_continuous_')) {
                langueCounts[category]++;
                langueCounts.total++;
              }
            });

            if (lectureCounts.total > 0) {
              finalLecture = {
                acquis: Math.round((lectureCounts.A / lectureCounts.total) * 100),
                enCours: Math.round((lectureCounts.B / lectureCounts.total) * 100),
                aAider: Math.round((lectureCounts.D / lectureCounts.total) * 100)
              };
            }
            if (ecritCounts.total > 0) {
              finalEcrit = {
                acquis: Math.round((ecritCounts.A / ecritCounts.total) * 100),
                enCours: Math.round((ecritCounts.B / ecritCounts.total) * 105) % 100, // Safe boundings
                aAider: Math.round((ecritCounts.D / ecritCounts.total) * 100)
              };
              // Normalize to sum up nicely
              const totalSum = finalEcrit.acquis + finalEcrit.enCours + finalEcrit.aAider;
              if (totalSum > 100) finalEcrit.enCours -= (totalSum - 100);
            }
            if (langueCounts.total > 0) {
              finalLangue = {
                acquis: Math.round((langueCounts.A / langueCounts.total) * 100),
                enCours: Math.round((langueCounts.B / langueCounts.total) * 100),
                aAider: Math.round((langueCounts.D / langueCounts.total) * 100)
              };
            }
          }
        }

        setLectureStats(finalLecture);
        setEcritStats(finalEcrit);
        setLangueStats(finalLangue);
        setHasGrades(anyGrades);

        // --- Calculate Administrative Alerts ---
        const activeAlerts = [];
        
        // 1. Pending / Urgent tasks alert
        const urgentTasksCount = tasksData?.filter((t: any) => t.urgent && !t.completed).length || 0;
        const totalPendingTasks = tasksData?.filter((t: any) => !t.completed).length || 0;
        
        if (urgentTasksCount > 0) {
          activeAlerts.push({
            id: 'urgent-tasks',
            title: `${urgentTasksCount} tâche${urgentTasksCount > 1 ? 's' : ''} urgente${urgentTasksCount > 1 ? 's' : ''} en attente`,
            desc: "À traiter en priorité aujourd'hui",
            type: "danger"
          });
        } else if (totalPendingTasks > 0) {
          activeAlerts.push({
            id: 'pending-tasks',
            title: `${totalPendingTasks} tâche${totalPendingTasks > 1 ? 's' : ''} en suspens`,
            desc: "Consultez votre liste de priorités",
            type: "warning"
          });
        }

        // 2. Students in difficulty alert
        const lowGradeStudents = studentsData?.filter((s: any) => s.grade < 10).length || 0;
        if (lowGradeStudents > 0) {
          activeAlerts.push({
            id: 'low-grades',
            title: `${lowGradeStudents} élève${lowGradeStudents > 1 ? 's' : ''} en difficulté`,
            desc: "Moyenne générale inférieure à 10/20",
            type: "warning"
          });
        }

        if (activeAlerts.length === 0) {
          activeAlerts.push({
            id: 'all-clear',
            title: "Aucune alerte administrative",
            desc: "Tout est en ordre !",
            type: "success"
          });
        }

        setAlerts(activeAlerts);

      } catch (err: any) {
        console.error("Dashboard data load error:", err);
        setError(err.message || "Erreur lors du chargement des statistiques.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscriptions
    const classesChannel = supabase
      .channel('dashboard-classes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes', filter: `teacher_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    const coursesChannel = supabase
      .channel('dashboard-courses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses', filter: `teacher_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    const tasksChannel = supabase
      .channel('dashboard-tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `teacher_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    const studentsChannel = supabase
      .channel('dashboard-students-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students', filter: `teacher_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    const gradesChannel = supabase
      .channel('dashboard-grades-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grades', filter: `teacher_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(classesChannel);
      supabase.removeChannel(coursesChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(gradesChannel);
    };
  }, [user, isAuthReady, selectedClassName]);

  let latestCourse;
  if (selectedClassName === "all") {
    latestCourse = allCourses[0];
  } else {
    latestCourse = allCourses.find(c => c.className === selectedClassName);
  }

  let pNum = 1;
  let sNum = 1;
  
  if (latestCourse) {
    if (latestCourse.projectNumber !== undefined && latestCourse.sequenceNumber !== undefined) {
      pNum = Number(latestCourse.projectNumber);
      sNum = Number(latestCourse.sequenceNumber);
    } else if (latestCourse.title || latestCourse.term) {
        // Try to parse from title or term if not explicitly set
        const textToSearch = `${latestCourse.title || ""} ${latestCourse.term || ""}`;
        const pMatch = textToSearch.match(/Projet\s*(\d)/i);
        const sMatch = textToSearch.match(/S[eé]quence\s*(\d)/i);
        if (pMatch) pNum = parseInt(pMatch[1], 10);
        if (sMatch) sNum = parseInt(sMatch[1], 10);
    }
  }

  const progression = { activeProject: pNum, activeSequence: sNum };

  const totalProjects = 3;
  const globalPercentage = Math.round(((progression.activeProject - 1 + (progression.activeSequence - 1) / 3) / totalProjects) * 100);

  const projects = [
    { id: 1, title: "Vive l'école", defaultSeqs: 3 },
    { id: 2, title: "C'est un lieu exceptionnel", defaultSeqs: 3 },
    { id: 3, title: "Quels métiers !", defaultSeqs: 3 },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">Erreur de connexion au backend</h4>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}
      {/* Widget 1: Progression du Programme */}
      <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8 relative flex flex-col overflow-hidden group/widget">
        
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl opacity-60 pointer-events-none transition-opacity duration-700 group-hover/widget:opacity-100"></div>
        <div className="absolute top-1/3 -left-12 w-32 h-32 bg-purple-50/50 rounded-full blur-2xl opacity-40 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
               <TrendingUp className="w-5 h-5 text-indigo-500 shrink-0" />
             </div>
             <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-900">
               Avancement Annuel
             </h3>
          </div>
          <div className="flex items-center gap-3">
            {classes.length > 0 && (
              <div className="relative group">
                <select 
                  value={selectedClassName} 
                  onChange={(e) => setSelectedClassName(e.target.value)}
                  className="appearance-none text-sm font-medium border border-slate-200/60 rounded-xl bg-white/60 backdrop-blur-sm px-4 py-2 pr-10 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 hover:bg-white transition-all shadow-sm cursor-pointer"
                >
                  <option value="all" className="py-2">Toutes les classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name} className="py-2">{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            )}
            {isLoading && (
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Calcul en cours...
              </span>
            )}
          </div>
        </div>
        
        {/* Progress Circle & List */}
        <div className="flex flex-col items-center flex-1 py-8 relative z-10">
          <div className="relative w-40 h-40 flex items-center justify-center group/circle cursor-pointer">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-2xl transition-all duration-700 group-hover/circle:bg-indigo-500/10 group-hover/circle:scale-110"></div>
            
            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" /> {/* Indigo 500 */}
                  <stop offset="100%" stopColor="#a855f7" /> {/* Purple 500 */}
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle className="text-slate-100/80" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
              <circle 
                className="transition-all duration-1500 ease-out" 
                strokeWidth="8" 
                strokeLinecap="round" 
                stroke="url(#progressGradient)" 
                fill="transparent" 
                r="42" 
                cx="50" 
                cy="50" 
                filter="url(#glow)"
                strokeDasharray="263.89" 
                strokeDashoffset={263.89 - (263.89 * Math.min(Math.max(globalPercentage, 0), 100)) / 100} 
              />
            </svg>
            
            <div className="absolute inset-4 bg-white rounded-full shadow-[inset_0px_2px_8px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center transition-transform duration-500 group-hover/circle:scale-[0.98]">
              <span className="text-4xl font-black text-slate-800 tracking-tight">
                {Math.min(Math.max(globalPercentage, 0), 100)}<span className="text-2xl text-slate-400 font-bold ml-0.5">%</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Complété</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mt-2 relative z-10">
          {projects.map((p) => {
            const isCompleted = p.id < progression.activeProject || (p.id === progression.activeProject && progression.activeSequence > 3);
            const isCurrent = p.id === progression.activeProject && progression.activeSequence <= 3;
            const isUpcoming = p.id > progression.activeProject;

            const themeMap: Record<number, {
              Icon: LucideIcon, 
              gradient: string, 
              iconBg: string, 
              completedBg: string, 
              titleColor: string, 
              badgeGradient: string,
              progressColor: string
            }> = {
              1: { 
                Icon: GraduationCap, 
                gradient: "from-blue-50 to-indigo-50/50",
                iconBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
                completedBg: "bg-blue-50/50",
                titleColor: "text-blue-950",
                badgeGradient: "bg-gradient-to-r from-blue-500 to-indigo-500",
                progressColor: "bg-blue-500"
              },
              2: { 
                Icon: Palmtree, 
                gradient: "from-emerald-50 to-teal-50/50",
                iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
                completedBg: "bg-emerald-50/50",
                titleColor: "text-emerald-950",
                badgeGradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
                progressColor: "bg-emerald-500"
              },
              3: { 
                Icon: Briefcase, 
                gradient: "from-orange-50 to-amber-50/50",
                iconBg: "bg-gradient-to-br from-orange-400 to-amber-500",
                completedBg: "bg-orange-50/50",
                titleColor: "text-orange-950",
                badgeGradient: "bg-gradient-to-r from-orange-500 to-amber-500",
                progressColor: "bg-orange-500"
              }
            };

            const theme = themeMap[p.id as keyof typeof themeMap] || themeMap[1];
            const targetSequence = isCompleted ? p.defaultSeqs : (isCurrent ? progression.activeSequence : 0);
            const progressPercent = Math.round((targetSequence / p.defaultSeqs) * 100);

            return (
              <div 
                key={p.id} 
                className={`group relative p-4 rounded-2xl border transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] overflow-hidden cursor-default
                  ${isCurrent 
                    ? `bg-gradient-to-br ${theme.gradient} border-transparent shadow-sm ring-1 ring-black/5` 
                    : isCompleted 
                      ? `${theme.completedBg} border-slate-100/60 opacity-80 hover:opacity-100` 
                      : 'bg-white border-slate-100 opacity-60 hover:opacity-90 grayscale-[0.2]'
                  }
                `}
              >
                {/* Background Pattern / Decoration on Hover */}
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl ${theme.progressColor}`}></div>

                <div className="flex items-center gap-4 relative z-10 w-full">
                  {/* Icon Wrapper */}
                  <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner
                    ${isCurrent || isCompleted ? `${theme.iconBg} text-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)]` : 'bg-slate-100 text-slate-400'}
                  `}>
                      <div className="absolute inset-0 bg-white/20 z-0 rounded-2xl -rotate-45 scale-150 transform transition-transform group-hover:rotate-[135deg] duration-1000 pointer-events-none opacity-0 group-hover:opacity-100"></div>
                      <theme.Icon className={`w-7 h-7 relative z-10 ${isCompleted && !isCurrent ? 'opacity-80' : ''}`} strokeWidth={isCurrent ? 2 : 1.5} />
                      {isCompleted && (
                        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center z-20 shadow-sm transition-transform group-hover:scale-110">
                           <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-bold truncate ${isCurrent ? theme.titleColor : isCompleted ? 'text-slate-600' : 'text-slate-500'}`}>
                        Projet {p.id}
                      </p>
                      {isCurrent && !isLoading && (
                        <span className={`text-[10px] uppercase tracking-widest font-black text-white ${theme.badgeGradient} px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap animate-in slide-in-from-right-2 fade-in duration-500`}>
                          Sèq. {progression.activeSequence}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate font-medium mt-0.5 ${isCurrent ? 'text-slate-600' : 'text-slate-400'}`}>
                      {p.title}
                    </p>

                    {/* Mini progress bar per project */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200/60 shadow-inner">
                         {isUpcoming ? null : (
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${isCurrent ? theme.progressColor : 'bg-emerald-400'}`} 
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                         )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 min-w-6 text-right">
                         {progressPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget 2: Santé de la classe */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              État des compétences
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Acquis</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> En cours</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Élèves à aider</span>
            </div>
          </div>
 
          <div className="space-y-5">
            {/* Lecture */}
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Lecture globale</span>
                </div>
                {hasGrades && (
                  <span className="text-xs font-bold text-slate-400">
                    {lectureStats.acquis}% Acquis
                  </span>
                )}
              </div>
              <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5 bg-slate-100">
                {lectureStats.acquis > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${lectureStats.acquis}%` }}></div>}
                {lectureStats.enCours > 0 && <div className="bg-amber-400 h-full" style={{ width: `${lectureStats.enCours}%` }}></div>}
                {lectureStats.aAider > 0 && <div className="bg-rose-500 h-full" style={{ width: `${lectureStats.aAider}%` }}></div>}
                {!hasGrades && <div className="bg-slate-200 h-full w-full"></div>}
              </div>
            </div>
 
            {/* Écrit */}
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-slate-400" />
                  <span>Production écrite</span>
                </div>
                {hasGrades && (
                  <span className="text-xs font-bold text-slate-400">
                    {ecritStats.acquis}% Acquis
                  </span>
                )}
              </div>
              <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5 bg-slate-100">
                {ecritStats.acquis > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${ecritStats.acquis}%` }}></div>}
                {ecritStats.enCours > 0 && <div className="bg-amber-400 h-full" style={{ width: `${ecritStats.enCours}%` }}></div>}
                {ecritStats.aAider > 0 && <div className="bg-rose-500 h-full" style={{ width: `${ecritStats.aAider}%` }}></div>}
                {!hasGrades && <div className="bg-slate-200 h-full w-full"></div>}
              </div>
            </div>
 
            {/* Langue */}
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Grammaire & Vocabulaire</span>
                </div>
                {hasGrades && (
                  <span className="text-xs font-bold text-slate-400">
                    {langueStats.acquis}% Acquis
                  </span>
                )}
              </div>
              <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5 bg-slate-100">
                {langueStats.acquis > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${langueStats.acquis}%` }}></div>}
                {langueStats.enCours > 0 && <div className="bg-amber-400 h-full" style={{ width: `${langueStats.enCours}%` }}></div>}
                {langueStats.aAider > 0 && <div className="bg-rose-500 h-full" style={{ width: `${langueStats.aAider}%` }}></div>}
                {!hasGrades && <div className="bg-slate-200 h-full w-full"></div>}
              </div>
            </div>
          </div>
        </div>
 
        {/* Widget 3: Alerte Administrative */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Alertes administratives
            </h3>
            
            <ul className="space-y-4">
              {alerts.map((alert) => {
                const bulletColor = alert.type === 'danger' ? 'bg-rose-500' : alert.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
                return (
                  <li key={alert.id} className="flex gap-3">
                    <div className={`mt-1.5 w-2 h-2 rounded-full ${bulletColor} flex-shrink-0`}></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{alert.title}</p>
                      <p className="text-xs text-slate-500">{alert.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <Link href="/planning" className="mt-6 w-full text-center text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2.5 rounded-lg transition-colors block">
            Voir l&apos;emploi du temps
          </Link>
        </div>
      </div>
    </div>
  )
}
