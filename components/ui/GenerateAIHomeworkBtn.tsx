"use client";

import { useState, useEffect } from "react";
import { Loader2, Home } from "lucide-react";
import { getComprehensiveStudentProfile } from "@/lib/services/studentData";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Markdown from "react-markdown";

interface GenerateAIHomeworkBtnProps {
  studentId: string;
  classId: string;
  studentName?: string;
}

const loadingStates = [
  "Analyse des critères C et D...",
  "Identification des axes d'amélioration...",
  "Rédaction d'exercices ludiques...",
  "Mise au propre des consignes maison..."
];

export function GenerateAIHomeworkBtn({ studentId, classId, studentName = "Eleve" }: GenerateAIHomeworkBtnProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [homework, setHomework] = useState<string | null>(null);
  
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prevIndex) => (prevIndex + 1) % loadingStates.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadingTextIndex(0);
    setHomework(null);
    setShowEmailForm(false);

    try {
      const studentData = await getComprehensiveStudentProfile(studentId, classId);
      const res = await fetch('/api/ai/homework', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentData }) 
      });
      const data = await res.json();
      if (res.ok && data.homework) {
         setHomework(data.homework);
      } else {
         console.error('Erreur API:', data.error);
         alert("Erreur lors de la génération des exercices.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors du contact avec l'IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!homework) return;
    
    const printContainer = document.getElementById("homework-pdf-print-root");
    if (!printContainer) {
      alert("Erreur de préparation du PDF.");
      return;
    }
    
    // Temporarily disable stylesheets to avoid oklab color parse errors in html2canvas
    const disabledSheets: any[] = [];
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style: any) => {
      if (!style.disabled) {
        style.disabled = true;
        disabledSheets.push(style);
      }
    });
    
    try {
      // Temporarily reveal the template in a viewport layout for screenshotting
      printContainer.style.position = "relative";
      printContainer.style.left = "0";
      
      const canvas = await html2canvas(printContainer, { 
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFDF5",
        logging: false
      });
      
      // Put it back
      printContainer.style.position = "absolute";
      printContainer.style.left = "-9999px";
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295; // A4 height is 297mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      let page = 1;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = - (page * pageHeight);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        page++;
      }
      
      pdf.save(`Exercice_Maison_${studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Erreur lors de la génération du PDF.");
    } finally {
      // Re-enable stylesheets
      disabledSheets.forEach((style) => {
        style.disabled = false;
      });
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      alert("Veuillez saisir une adresse email.");
      return;
    }
    if (!homework) return;
    
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/ai/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          studentName,
          content: homework
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        setShowEmailForm(false);
      } else {
        alert(data.error || "Erreur lors de l'envoi de l'email.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau lors de l'envoi.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 relative">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-violet-600 border-3 border-slate-900 text-white font-black rounded-2xl px-6 py-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-violet-500 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3 w-full sm:w-auto disabled:opacity-80 disabled:pointer-events-none cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Home className="w-5 h-5" />
          )}
          <span>{isLoading ? "Préparation..." : "🏠 Générer exercices maison"}</span>
        </button>

        {homework && !isLoading && (
          <div className="flex flex-wrap gap-2 animate-fadeIn">
            <button
              onClick={handleDownloadPDF}
              className="bg-emerald-500 border-3 border-slate-900 text-white font-black rounded-2xl px-5 py-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-emerald-450 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              📥 Télécharger le PDF
            </button>
            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="bg-sky-500 border-3 border-slate-900 text-white font-black rounded-2xl px-5 py-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-sky-450 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              ✉️ Envoyer par Email
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <span className="text-xs text-violet-600 font-bold animate-pulse mt-1">
          {loadingStates[loadingTextIndex]}
        </span>
      )}

      {showEmailForm && homework && (
        <div className="bg-[#FFFAF3] border-3 border-slate-900 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col gap-2 mt-2 w-full sm:w-[320px] z-50">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wide">Email du Parent :</label>
          <div className="flex gap-2">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@email.com"
              className="flex-1 bg-white border-2 border-slate-900 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button 
              onClick={handleSendEmail} 
              disabled={isSendingEmail} 
              className="bg-violet-600 border-2 border-slate-900 text-white font-black rounded-xl px-3 py-2 hover:bg-violet-500 active:scale-95 transition-all text-xs cursor-pointer flex items-center shrink-0"
            >
              {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer"}
            </button>
          </div>
        </div>
      )}

      {/* Hidden print template */}
      {homework && (
        <div style={{ position: 'absolute', left: '-9999px', top: '0', width: '794px', zIndex: -100 }}>
          <div 
            id="homework-pdf-print-root"
            style={{ 
              backgroundColor: '#FFFDF5', 
              padding: '50px', 
              fontFamily: 'system-ui, -apple-system, sans-serif',
              minHeight: '1123px',
              border: '4px solid #000000',
              borderRadius: '40px',
              color: '#000000'
            }}
          >
            {/* Header banner */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '4px solid #000000',
                paddingBottom: '16px',
                marginBottom: '32px'
              }}
            >
              <div>
                <span 
                  style={{ 
                    backgroundColor: '#DDD6FE', 
                    border: '2px solid #000000', 
                    borderRadius: '8px', 
                    padding: '4px 10px', 
                    fontWeight: '900', 
                    fontSize: '12px', 
                    textTransform: 'uppercase', 
                    color: '#4C1D95' 
                  }}
                >
                  📚 Devoirs pour la Maison
                </span>
                <h1 style={{ fontSize: '30px', fontWeight: '900', marginTop: '8px', color: '#000000' }}>Cahier d&apos;activités</h1>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '16px', fontWeight: '900', color: '#000000' }}>Nom : {studentName}</p>
                <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 'bold', marginTop: '4px' }}>Date : {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            {/* Content card */}
            <div 
              style={{ 
                backgroundColor: '#FFFFFF', 
                border: '4px solid #000000', 
                borderRadius: '32px', 
                padding: '32px', 
                boxShadow: '8px 8px 0px 0px #000000',
                marginBottom: '24px',
                marginTop: '16px'
              }}
            >
              <Markdown
                components={{
                  h1: ({node, ...props}) => (
                    <h1 
                      style={{ 
                        fontSize: '20px', 
                        fontWeight: '900', 
                        backgroundColor: '#6366F1', 
                        border: '3px solid #000000', 
                        color: '#FFFFFF', 
                        borderRadius: '16px', 
                        padding: '10px 20px', 
                        display: 'inline-block', 
                        boxShadow: '4px 4px 0px 0px #000000', 
                        marginBottom: '24px', 
                        marginTop: '8px',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }} 
                      {...props} 
                    />
                  ),
                  h2: ({node, ...props}) => (
                    <h2 
                      style={{ 
                        fontSize: '18px', 
                        fontWeight: '900', 
                        color: '#000000', 
                        marginTop: '32px', 
                        marginBottom: '16px', 
                        borderBottom: '3px solid #000000', 
                        paddingBottom: '8px', 
                        display: 'inline-block',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }} 
                      {...props} 
                    />
                  ),
                  h3: ({node, ...props}) => (
                    <h3 
                      style={{ 
                        fontSize: '14px', 
                        fontWeight: '900', 
                        backgroundColor: '#D1FAE5', 
                        border: '3px solid #000000', 
                        color: '#065F46', 
                        borderRadius: '12px', 
                        padding: '8px 16px', 
                        display: 'inline-block', 
                        boxShadow: '3px 3px 0px 0px #000000', 
                        marginTop: '16px', 
                        marginBottom: '12px',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }} 
                      {...props} 
                    />
                  ),
                  p: ({node, ...props}) => (
                    <p 
                      style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        color: '#334155', 
                        lineHeight: '1.8', 
                        marginBottom: '20px',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }} 
                      {...props} 
                    />
                  ),
                  ul: ({node, ...props}) => (
                    <ul 
                      style={{ 
                        listStyleType: 'disc', 
                        paddingLeft: '24px', 
                        marginBottom: '24px',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }} 
                      {...props} 
                    />
                  ),
                  ol: ({node, ...props}) => (
                    <ol 
                      style={{ 
                        listStyleType: 'decimal', 
                        paddingLeft: '24px', 
                        marginBottom: '24px',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }} 
                      {...props} 
                    />
                  ),
                  li: ({node, ...props}) => (
                    <li 
                      style={{ 
                        fontSize: '16px', 
                        color: '#334155', 
                        fontWeight: 'bold', 
                        marginBottom: '12px',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }} 
                      {...props} 
                    />
                  ),
                  strong: ({node, ...props}) => (
                    <strong 
                      style={{ 
                        fontWeight: '900', 
                        backgroundColor: '#FEF08A', 
                        border: '2px solid #000000', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        boxShadow: '1.5px 1.5px 0px 0px #000000', 
                        color: '#000000' 
                      }} 
                      {...props} 
                    />
                  ),
                }}
              >
                {homework}
              </Markdown>
            </div>
            
            {/* Footer decoration */}
            <div 
              style={{ 
                textAlign: 'center', 
                marginTop: '32px', 
                fontSize: '12px', 
                fontWeight: '950', 
                color: '#94A3B8', 
                textTransform: 'uppercase', 
                letterSpacing: '2px' 
              }}
            >
              ✨ Fait avec amour par Ostad IA ✨
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
