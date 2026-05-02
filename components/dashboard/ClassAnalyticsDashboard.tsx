'use client';

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, Pencil, BookOpen, PenTool, AlertCircle, RefreshCw } from "lucide-react"
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db, auth } from "@/firebase"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

export function ClassAnalyticsDashboard() {
  const [progression, setProgression] = useState({ activeProject: 1, activeSequence: 1 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, "courses"),
          where("teacherId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        
        const unsubscribeDocs = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const latestCourse = snapshot.docs[0].data();
            let pNum = 1;
            let sNum = 1;
            
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
            
            setProgression({ activeProject: pNum, activeSequence: sNum });
          } else {
            setProgression({ activeProject: 1, activeSequence: 1 });
          }
          setIsLoading(false);
        }, (error) => {
          setIsLoading(false);
          handleFirestoreError(error, OperationType.LIST, "courses");
        });
        
        return () => unsubscribeDocs();
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Progression du Programme
          </h3>
          {isLoading && (
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Calcul en cours...
            </span>
          )}
        </div>
        
        {/* Progress Circle & List */}
        <div className="flex flex-col items-center flex-1">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
              <circle 
                className="text-indigo-600 transition-all duration-1000 ease-out" 
                strokeWidth="8" 
                strokeLinecap="round" 
                stroke="currentColor" 
                fill="transparent" 
                r="42" 
                cx="50" 
                cy="50" 
                strokeDasharray="263.89" 
                strokeDashoffset={263.89 - (263.89 * Math.min(Math.max(globalPercentage, 0), 100)) / 100} 
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-800">{Math.min(Math.max(globalPercentage, 0), 100)}%</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mt-8">
          {projects.map((p) => {
            const isCompleted = p.id < progression.activeProject || (p.id === progression.activeProject && progression.activeSequence > 3);
            const isCurrent = p.id === progression.activeProject && progression.activeSequence <= 3;
            const isUpcoming = p.id > progression.activeProject;

            return (
              <div key={p.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${isCompleted ? 'bg-emerald-50 border-emerald-100' : isCurrent ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-emerald-100 text-emerald-600' : isCurrent ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                  {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                  {isCurrent && <RefreshCw className="w-5 h-5 animate-spin-slow" />}
                  {isUpcoming && <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-indigo-700' : 'text-slate-500'}`}>Projet {p.id}</p>
                  <p className={`text-xs ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>{p.title}</p>
                </div>
                {isCurrent && !isLoading && (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-md whitespace-nowrap animate-in fade-in zoom-in duration-300">
                    Séquence {progression.activeSequence}
                  </span>
                )}
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
