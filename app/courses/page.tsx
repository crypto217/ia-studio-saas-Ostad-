"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  BookOpen, 
  PenTool, 
  Star, 
  Download, 
  Eye, 
  Trash2, 
  Search, 
  Sparkles, 
  FileText,
  FileQuestion,
  FileEdit,
  Filter,
  Plus,
  GraduationCap,
  X,
  Printer,
  Maximize,
  Minimize
} from "lucide-react"
import { db } from "@/firebase"
import { collection, query, onSnapshot, deleteDoc, doc, where } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"
import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"
import { useIsMobile } from "@/hooks/use-mobile"

type DocType = "Cours" | "Exercice" | "Examen"

interface GeneratedDoc {
  id: string
  title: string
  type: DocType
  className: string
  term: string
  content: string
  imageUrl?: string | null
  createdAt: any
  color: string
  iconColor: string
  bgColor: string
}

const CLASSES = ["Toutes", "3ème AP", "4ème AP", "5ème AP", "1ère AM"]
const TYPES = ["Tous", "Cours", "Exercice", "Examen"]

export default function CoursesLibraryPage() {
  const { user, isAuthReady } = useAuth()
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("Toutes")
  const [selectedType, setSelectedType] = useState("Tous")
  const [docs, setDocs] = useState<GeneratedDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Viewer State
  const [viewingDoc, setViewingDoc] = useState<GeneratedDoc | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user) {
      setDocs([]);
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, "courses"), where("teacherId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GeneratedDoc[];
      
      // Sort client-side to avoid needing a composite index
      fetchedDocs.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
      
      setDocs(fetchedDocs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "courses");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = selectedClass === "Toutes" || doc.className === selectedClass
    const matchesType = selectedType === "Tous" || doc.type === selectedType
    return matchesSearch && matchesClass && matchesType
  })

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await deleteDoc(doc(db, "courses", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `courses/${id}`);
      }
    }
  }

  const getIcon = (type: DocType) => {
    switch (type) {
      case "Cours": return <BookOpen className="w-6 h-6" />
      case "Exercice": return <FileEdit className="w-6 h-6" />
      case "Examen": return <Star className="w-6 h-6" />
      default: return <FileText className="w-6 h-6" />
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Récemment";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  const exportToPDF = async (content: string, type: string) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Iframe not created");
      
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>PDF</title>
            <style>
              body { margin: 0; padding: 0; background: white; width: 210mm; }
              #content-to-print { width: 210mm; }
              .a4-page { font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.4; color: black; background: white; width: 210mm; min-height: 297mm; padding: 15mm; margin: 0; box-sizing: border-box; }
              .main-title { text-align: center; color: #2563eb; font-size: 22px; font-weight: normal; margin-bottom: 20px; }
              .info-line { margin-bottom: 4px; }
              .flex-line { display: flex; flex-direction: row; justify-content: space-between; width: 100%; gap: 0; margin-bottom: 8px; }
              .student-header { display: flex; flex-direction: row; justify-content: space-between; gap: 10px; margin-bottom: 20px; font-weight: bold; font-size: 16px; }
              .dotted-line { border-bottom: 2px dotted #94a3b8; width: 100%; display: inline-block; min-height: 20px; margin-top: 5px; }
              .label { color: #dc2626; font-weight: bold; text-decoration: underline; }
              .value { color: black; }
              .section-title { text-align: center; color: #16a34a; font-size: 18px; font-weight: bold; text-decoration: underline; margin: 20px 0 10px 0; }
              .step-title { color: #dc2626; font-weight: bold; text-decoration: underline; margin-top: 15px; margin-bottom: 5px; }
              .sub-title { color: #16a34a; font-weight: bold; text-decoration: underline; margin-top: 10px; margin-bottom: 5px; }
              .answer { color: #0d9488; }
              .consigne-box { border: 2px solid #7dd3fc; padding: 10px; margin: 15px 10%; text-align: center; font-weight: normal; border-radius: 8px; background-color: #f0f9ff; page-break-inside: avoid; break-inside: avoid; }
              .boite-mots { display: flex; gap: 10px; justify-content: center; margin: 10px 0; flex-wrap: wrap; }
              .mot { padding: 5px 20px; border: 1px solid #94a3b8; border-radius: 4px; color: black; font-weight: bold; }
              .mot:nth-child(1n) { background-color: #dcfce7; }
              .mot:nth-child(2n) { background-color: #ffedd5; }
              .mot:nth-child(3n) { background-color: #fce7f3; }
              .mot:nth-child(4n) { background-color: #f3e8ff; }
              .mot:nth-child(5n) { background-color: #ecfccb; }
              .application-box { border: 1px dashed #64748b; padding: 15px; margin-top: 10px; border-radius: 8px; background-color: #f8fafc; overflow-x: auto; page-break-inside: avoid; break-inside: avoid; }
              table, tr, td, th { page-break-inside: avoid; break-inside: avoid; }
            </style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          </head>
          <body>
            <div id="content-to-print">
              ${content}
            </div>
            <script>
              window.onload = function() {
                const element = document.getElementById('content-to-print');
                const opt = {
                  margin:       0,
                  filename:     '${type}.pdf',
                  image:        { type: 'jpeg', quality: 0.98 },
                  html2canvas:  { scale: 2, useCORS: true, windowWidth: element.scrollWidth },
                  jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                  pagebreak:    { mode: ['css', 'legacy'], avoid: ['.consigne-box', '.application-box', '.step-title', '.section-title', '.student-header', 'table', 'tr', 'li'] }
                };
                html2pdf().set(opt).from(element).save().then(() => {
                  window.parent.postMessage('pdf-done', '*');
                }).catch(err => {
                  window.parent.postMessage('pdf-error:' + err.message, '*');
                });
              };
            </script>
          </body>
        </html>
      `);
      iframeDoc.close();
      
      await new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.data === 'pdf-done') {
            window.removeEventListener('message', handleMessage);
            resolve(true);
          } else if (typeof event.data === 'string' && event.data.startsWith('pdf-error:')) {
            window.removeEventListener('message', handleMessage);
            reject(new Error(event.data.split(':')[1]));
          }
        };
        window.addEventListener('message', handleMessage);
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          reject(new Error("PDF generation timed out"));
        }, 15000);
      });
      
      document.body.removeChild(iframe);
    } catch (error) {
      console.error("Erreur PDF:", error);
      alert("Erreur lors de la génération du PDF.");
    }
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50/50">
      {/* HEADER HERO */}
      <div className={`bg-white border-b border-slate-200 ${isMobile ? 'px-4 py-6' : 'px-4 py-8 sm:px-8'} relative overflow-hidden`}>
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-fuchsia-500/30 transform -rotate-6">
                <FileText className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <h1 className="text-2xl md:text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Ma Bibliothèque</h1>
            </div>
            <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl">
              Retrouvez toutes vos fiches de cours, exercices et examens générés par l&apos;IA.
            </p>
          </div>
          
          <Link href="/ai-generator" className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 md:px-6 md:py-3.5 rounded-2xl font-bold shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 text-sm md:text-base w-full md:w-auto">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
            Générer un document
          </Link>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-0' : 'px-4 sm:px-8'} mt-8`}>
        {/* SEARCH & FILTERS */}
        <div className={`bg-white/80 backdrop-blur-xl ${isMobile ? 'p-4 rounded-[1.5rem]' : 'p-6 sm:p-8 rounded-[3rem]'} shadow-xl shadow-slate-200/40 border-4 border-white mb-12 space-y-8 relative overflow-hidden`}>
          {/* Decorative background elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Search Bar */}
          <div className="relative z-10 group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
              <Search className="h-6 w-6 text-slate-400 transition-colors group-focus-within:text-violet-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isMobile ? 'pl-12 pr-12 py-4 text-base' : 'pl-16 pr-16 py-5 text-lg'} bg-white border-4 border-slate-100 rounded-[2rem] focus:outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 font-bold text-slate-700 placeholder:text-slate-300 shadow-sm hover:shadow-md hover:border-slate-200`}
            />
            {/* Sparkle icon that appears when typing */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0, rotate: 45 }}
                  className="absolute inset-y-0 right-6 flex items-center pointer-events-none"
                >
                  <Sparkles className="h-6 w-6 text-amber-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 justify-between relative z-10">
            {/* Type Filters */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                <Filter className="w-4 h-4 text-violet-400" /> Type de document
              </label>
              <div className={`flex flex-wrap ${isMobile ? 'gap-2' : 'gap-3'}`}>
                {TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 md:px-6 md:py-3 rounded-[1rem] md:rounded-2xl font-bold text-xs md:text-sm transition-all duration-300 transform hover:-translate-y-1 ${
                      selectedType === type 
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 border-b-4 border-violet-700' 
                        : 'bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-2 border-slate-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Filters */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                 <GraduationCap className="w-4 h-4 text-amber-400" /> Classe
              </label>
              <div className={`flex flex-wrap ${isMobile ? 'gap-2' : 'gap-3'}`}>
                {CLASSES.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-4 py-2 md:px-6 md:py-3 rounded-[1rem] md:rounded-2xl font-bold text-xs md:text-sm transition-all duration-300 transform hover:-translate-y-1 ${
                      selectedClass === cls 
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30 border-b-4 border-orange-600' 
                        : 'bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-2 border-slate-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* DOCUMENTS GRID */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          </div>
        ) : filteredDocs.length > 0 ? (
          <motion.div 
            layout
            className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${isMobile ? 'gap-4 px-4' : 'gap-6'}`}
          >
            <AnimatePresence>
              {filteredDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col ${isMobile ? 'mx-0' : 'mx-0'}`}
                >
                  {/* Card Header (Colored or Image) */}
                  <div className={`h-32 ${!doc.imageUrl ? 'bg-gradient-to-r ' + (doc.color || 'from-slate-400 to-slate-500') : ''} p-6 relative overflow-hidden shrink-0`}>
                    {!doc.imageUrl && (
                      <>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                      </>
                    )}
                    {doc.imageUrl && (
                      <>
                        <img src={doc.imageUrl} alt={doc.title} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent mix-blend-multiply" />
                      </>
                    )}
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white shadow-inner border border-white/20">
                        {getIcon(doc.type)}
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-black px-3 py-1.5 rounded-xl shadow-sm border border-white/50">
                        {doc.className}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${doc.bgColor || 'bg-slate-100'} ${doc.iconColor || 'text-slate-600'}`}>
                        {doc.type}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        • {formatDate(doc.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-800 leading-tight mb-4 line-clamp-2 flex-1">
                      {doc.title}
                    </h3>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <div className="flex gap-2">
                        <button onClick={() => setViewingDoc(doc)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-violet-50 hover:text-violet-600 transition-colors" title="Aperçu">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => exportToPDF(doc.content, doc.type)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="Télécharger PDF">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="w-10 h-10 rounded-xl text-slate-300 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors" 
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* EMPTY STATE */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-[3rem] border-2 border-dashed border-slate-200 ${isMobile ? 'p-6 mx-4' : 'p-12'} text-center flex flex-col items-center justify-center min-h-[400px]`}
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">Aucun document trouvé</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8 text-sm md:text-base">
              Vous n&apos;avez pas encore généré de documents correspondant à ces critères, ou votre bibliothèque est vide.
            </p>
            <Link href="/ai-generator" className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-950 px-6 py-3 md:px-8 md:py-4 rounded-2xl font-black shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-1 text-sm md:text-base">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
              Générer mon premier cours
            </Link>
          </motion.div>
        )}
      </div>

      {/* DOCUMENT VIEWER MODAL */}
      <AnimatePresence>
        {viewingDoc && (
          <div className={`fixed inset-0 z-[100] bg-slate-800/90 backdrop-blur-md flex flex-col ${isMobile || isFullscreen ? 'p-0' : 'p-4 sm:p-8'}`}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`bg-white flex flex-col w-full h-full mx-auto overflow-hidden ${isMobile || isFullscreen ? 'max-w-none rounded-none' : 'max-w-5xl rounded-[2rem] shadow-2xl'}`}
            >
              {/* Viewer Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3 md:gap-4 max-w-[50%] md:max-w-none">
                  <button onClick={() => setViewingDoc(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-xl shadow-sm border border-slate-200 transition-colors shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="truncate">
                    <h3 className="font-black text-slate-800 truncate text-sm md:text-base">{viewingDoc.title}</h3>
                    <p className="text-[10px] md:text-xs font-medium text-slate-500 truncate">{viewingDoc.className} • {viewingDoc.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => exportToPDF(viewingDoc.content, viewingDoc.type)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-bold text-sm shadow-md">
                    <Download className="w-4 h-4" /> <span className="hidden sm:inline">Télécharger PDF</span>
                  </button>
                  <button onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>${viewingDoc.title}</title>
                            <style>
                              body { margin: 0; padding: 0; background: white; font-family: Arial, sans-serif; }
                              .a4-page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; box-sizing: border-box; page-break-after: always; }
                              .main-title { text-align: center; color: #2563eb; font-size: 22px; font-weight: normal; margin-bottom: 20px; }
                              .info-line { margin-bottom: 4px; }
                              .flex-line { display: flex; flex-direction: row; justify-content: space-between; width: 100%; gap: 0; margin-bottom: 8px; }
                              .student-header { display: flex; flex-direction: row; justify-content: space-between; gap: 10px; margin-bottom: 20px; font-weight: bold; font-size: 16px; }
                              .dotted-line { border-bottom: 2px dotted #94a3b8; width: 100%; display: inline-block; min-height: 20px; margin-top: 5px; }
                              .label { color: #dc2626; font-weight: bold; text-decoration: underline; }
                              .value { color: black; }
                              .section-title { text-align: center; color: #16a34a; font-size: 18px; font-weight: bold; text-decoration: underline; margin: 20px 0 10px 0; }
                              .step-title { color: #dc2626; font-weight: bold; text-decoration: underline; margin-top: 15px; margin-bottom: 5px; }
                              .sub-title { color: #16a34a; font-weight: bold; text-decoration: underline; margin-top: 10px; margin-bottom: 5px; }
                              .answer { color: #0d9488; }
                              .consigne-box { border: 2px solid #7dd3fc; padding: 10px; margin: 15px 10%; text-align: center; font-weight: normal; border-radius: 8px; background-color: #f0f9ff; page-break-inside: avoid; break-inside: avoid; }
                              .boite-mots { display: flex; gap: 10px; justify-content: center; margin: 10px 0; flex-wrap: wrap; }
                              .mot { padding: 5px 20px; border: 1px solid #94a3b8; border-radius: 4px; color: black; font-weight: bold; }
                              .mot:nth-child(1n) { background-color: #dcfce7; }
                              .mot:nth-child(2n) { background-color: #ffedd5; }
                              .mot:nth-child(3n) { background-color: #fce7f3; }
                              .mot:nth-child(4n) { background-color: #f3e8ff; }
                              .mot:nth-child(5n) { background-color: #ecfccb; }
                              .application-box { border: 1px dashed #64748b; padding: 15px; margin-top: 10px; border-radius: 8px; background-color: #f8fafc; overflow-x: auto; page-break-inside: avoid; break-inside: avoid; }
                              table, tr, td, th { page-break-inside: avoid; break-inside: avoid; }
                            </style>
                          </head>
                          <body>
                            ${viewingDoc.content}
                            <script>window.print(); window.close();</script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }} className="flex items-center gap-2 bg-violet-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-xl hover:bg-violet-700 transition-colors font-bold text-sm shadow-md">
                    <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Imprimer</span>
                  </button>
                  {!isMobile && (
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm border border-slate-200">
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Viewer Content */}
              <div className="flex-1 overflow-y-auto p-0 sm:p-8 bg-slate-100/50 w-full overflow-hidden">
                <div 
                  className={`bg-white shadow-sm mx-auto w-full sm:max-w-4xl rounded-sm ${isMobile ? 'p-4' : 'p-4 sm:p-8'} overflow-hidden @container [&_*]:!max-w-full [&_*]:!box-border [&_*]:![overflow-wrap:anywhere] [&_*]:![word-break:break-word] [&_img]:!max-w-full [&_img]:!w-full [&_img]:!h-auto [&_video]:!max-w-full [&_video]:!w-full [&_video]:!h-auto [&_iframe]:!max-w-full [&_iframe]:!w-full [&_iframe]:!h-auto [&_table]:!block [&_table]:!max-w-full [&_table]:!overflow-x-auto`} 
                  dangerouslySetInnerHTML={{ __html: viewingDoc.content }} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
