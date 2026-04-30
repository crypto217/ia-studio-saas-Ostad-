"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import { getComprehensiveStudentProfile } from "@/lib/services/studentData";

interface GenerateAIReportBtnProps {
  studentId: string;
  classId: string;
  onReportReady?: (report: string) => void;
}

const loadingStates = [
  "Collecte de l'historique...",
  "Analyse des compétences...",
  "Croisement des données...",
  "Rédaction du bilan expert..."
];

export function GenerateAIReportBtn({ studentId, classId, onReportReady }: GenerateAIReportBtnProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [report, setReport] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prevIndex) => (prevIndex + 1) % loadingStates.length);
      }, 2000);
    } else {
      setLoadingTextIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setReport(null);

    try {
      const studentData = await getComprehensiveStudentProfile(studentId, classId);
      const res = await fetch('/api/ai/student-report', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentData }) 
      });
      const data = await res.json();
      if (res.ok && data.report) {
         setReport(data.report);
         if (onReportReady) onReportReady(data.report);
      } else {
         console.error('Erreur API:', data.error);
         alert("Erreur lors de la génération du bilan.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors du contact avec l'IA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full sm:w-auto relative">
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black rounded-[1.5rem] px-6 py-4 shadow-sm hover:-translate-y-1 hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-3 w-full sm:w-auto disabled:opacity-80 disabled:pointer-events-none"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
        <span>{isLoading ? "Génération..." : "✨ Générer le Bilan IA"}</span>
      </button>
      
      {isLoading && (
        <span className="text-sm text-indigo-600 font-medium animate-pulse text-center">
          {loadingStates[loadingTextIndex]}
        </span>
      )}
    </div>
  );
}
