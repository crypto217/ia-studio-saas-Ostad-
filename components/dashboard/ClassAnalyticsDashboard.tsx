'use client';

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, Check, Pencil, BookOpen, PenTool, AlertCircle, RefreshCw, Palmtree, GraduationCap, Briefcase, LucideIcon, Sparkles, ChevronDown } from "lucide-react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db, auth } from "@/firebase"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

export function ClassAnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  const [selectedClassName, setSelectedClassName] = useState<string>("all");
  const [allCourses, setAllCourses] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Fetch classes
        const classesQ = query(collection(db, "classes"), where("teacherId", "==", user.uid));
        const unsubClasses = onSnapshot(classesQ, (snapshot) => {
          const fetchedClasses = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
          setClasses(fetchedClasses);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, "classes");
        });

        // Fetch courses for the teacher
        const q = query(
          collection(db, "courses"),
          where("teacherId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        
        const unsubscribeDocs = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            setAllCourses(snapshot.docs.map(doc => doc.data()));
          } else {
            setAllCourses([]);
          }
          setIsLoading(false);
        }, (error) => {
          setIsLoading(false);
          handleFirestoreError(error, OperationType.LIST, "courses");
        });
        
        return () => {
          unsubscribeDocs();
          unsubClasses();
        };
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

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
      {/* Widget 1: Progression du Programme */}
      <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8 relative flex flex-col overflow-hidden group/widget">
        
        {/* Subtle background decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl opacity-60 pointer-events-none transition-opacity duration-700 group-hover/widget:opacity-100"></div>
        <div className="absolute top-1/3 -left-12 w-32 h-32 bg-purple-50/50 rounded-full blur-2xl opacity-40 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
               <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />
             </div>
             <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-900">
               Progression globale
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
              </div>
              <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5 bg-slate-100">
                <div className="bg-emerald-500 h-full" style={{ width: '60%' }}></div>
                <div className="bg-amber-400 h-full" style={{ width: '25%' }}></div>
                <div className="bg-rose-500 h-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            {/* Écrit */}
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-slate-400" />
                  <span>Production écrite</span>
                </div>
              </div>
              <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5 bg-slate-100">
                <div className="bg-emerald-500 h-full" style={{ width: '40%' }}></div>
                <div className="bg-amber-400 h-full" style={{ width: '40%' }}></div>
                <div className="bg-rose-500 h-full" style={{ width: '20%' }}></div>
              </div>
            </div>

            {/* Langue */}
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Grammaire & Vocabulaire</span>
                </div>
              </div>
              <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5 bg-slate-100">
                <div className="bg-emerald-500 h-full" style={{ width: '75%' }}></div>
                <div className="bg-amber-400 h-full" style={{ width: '15%' }}></div>
                <div className="bg-rose-500 h-full" style={{ width: '10%' }}></div>
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
              <li className="flex gap-3">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Cahier journal non rempli</p>
                  <p className="text-xs text-slate-500">Pour la journée de demain</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">3 élèves sans notes en dictée</p>
                  <p className="text-xs text-slate-500">Séquence précédente</p>
                </div>
              </li>
            </ul>
          </div>
          
          <button className="mt-6 w-full text-center text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2.5 rounded-lg transition-colors">
            Voir les dossiers
          </button>
        </div>
      </div>
    </div>
  )
}
