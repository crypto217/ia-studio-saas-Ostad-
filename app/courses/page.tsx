"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
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
  Minimize,
  Folder,
  ChevronRight,
  MoreVertical,
  Upload
} from "lucide-react"
import { db, storage } from "@/firebase"
import { collection, query, onSnapshot, deleteDoc, doc, where, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"
import Link from "next/link"
import Markdown from "react-markdown"
import { useAuth } from "@/components/AuthProvider"
import { useIsMobile } from "@/hooks/use-mobile"

type DocType = "Cours" | "Exercice" | "Examen" | "IA"

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

interface TeacherFile {
  id: string;
  fileName: string;
  fileUrl: string;
  size: string;
  type: string;
  folder: string;
  fileType?: string;
  teacherId: string;
  createdAt: any;
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

  const [teacherFiles, setTeacherFiles] = useState<TeacherFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // New States for Classification Modal & Toast
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string>("3ème AP")
  const [selectedFileType, setSelectedFileType] = useState<string>("Fiche de préparation")
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  }

  const [currentPath, setCurrentPath] = useState(["Mon Classeur"]);
  const folders = [
    { id: '1', name: '3ème AP', date: 'Hier', color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { id: '2', name: '4ème AP', date: 'Il y a 2 jours', color: 'text-emerald-500', bgColor: 'bg-emerald-100' },
    { id: '3', name: '5ème AP', date: "Aujourd'hui", color: 'text-orange-500', bgColor: 'bg-orange-100' },
  ];

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user) {
      setTimeout(() => {
        setDocs([]);
        setTeacherFiles([]);
        setIsLoading(false);
      }, 0);
      return;
    }

    const q = query(collection(db, "courses"), where("teacherId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GeneratedDoc[];
      
      fetchedDocs.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
      
      setDocs(fetchedDocs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "courses");
    });

    const qFiles = query(collection(db, "teacher_files"), where("teacherId", "==", user.uid));
    const unsubFiles = onSnapshot(qFiles, (snapshot) => {
      const fetchedFiles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeacherFile[];
      
      fetchedFiles.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
      
      setTeacherFiles(fetchedFiles);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "teacher_files");
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      unsubFiles();
    };
  }, [user, isAuthReady]);

  const filteredFiles = teacherFiles.filter(file => {
    return file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return;
    setPendingFile(file);
  };

  const confirmUpload = async () => {
    if (!user || !pendingFile) return;
    setIsUploading(true);
    try {
      const fileRef = ref(storage, `uploads/teachers/${user.uid}/${Date.now()}_${pendingFile.name}`);
      
      // Setup a timeout for the upload in case Firebase Storage is not enabled
      const uploadPromise = uploadBytes(fileRef, pendingFile);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("STORAGE_TIMEOUT")), 20000); // 20s timeout
      });

      await Promise.race([uploadPromise, timeoutPromise]);
      const fileUrl = await getDownloadURL(fileRef);
      const ext = pendingFile.name.split('.').pop()?.toUpperCase() || 'FICHIER';
      
      await addDoc(collection(db, 'teacher_files'), {
        fileName: pendingFile.name,
        fileUrl,
        size: formatSize(pendingFile.size),
        type: ext,
        folder: selectedFolder,
        fileType: selectedFileType,
        teacherId: user.uid,
        createdAt: serverTimestamp()
      });
      setPendingFile(null);
      showToast("Document classé avec succès !", "success");
    } catch (error: any) {
      console.error("Upload error:", error);
      if (error?.message === "STORAGE_TIMEOUT") {
        showToast("Erreur: Le stockage (Storage) n'est pas activé sur votre projet Firebase.", "error");
      } else {
        showToast("Erreur lors de l'envoi. Vérifiez que Firebase Storage est bien activé.", "error");
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDeleteFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      try {
        await deleteDoc(doc(db, "teacher_files", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `teacher_files/${id}`);
      }
    }
  }

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
    <div className="min-h-screen pb-24 bg-slate-50/50 print:bg-white print:p-0">
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-8'} py-8 print:hidden`}>
        
        {/* TOP BAR: BREADCRUMB & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-lg md:text-xl font-bold text-slate-800">
            {currentPath.map((segment, index) => (
              <div key={segment} className="flex items-center gap-2">
                <span className={index === currentPath.length - 1 ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700 cursor-pointer transition-colors'}>
                  {segment}
                </span>
                {index < currentPath.length - 1 && <ChevronRight className="w-5 h-5 text-slate-400" />}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
             <div className="relative w-full sm:w-64">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-slate-400" />
               </div>
               <input
                 type="text"
                 placeholder="Rechercher..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400 shadow-sm"
               />
             </div>
             
             <input type="file" className="hidden" ref={fileInputRef} onChange={onFileSelect} />
             <button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl font-bold transition-all hover:-translate-y-0.5 text-sm shadow-sm hover:shadow-md">
               <Plus className="w-4 h-4" />
               Ajouter
             </button>
          </div>
        </div>

        {/* DRAG & DROP AREA */}
        <div 
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mb-10 bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center hover:bg-slate-50 hover:border-violet-300 transition-colors cursor-pointer group shadow-sm"
        >
          {isUploading ? (
            <>
              <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-4">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Téléchargement en cours...</h3>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-slate-100 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Glissez-déposez vos fichiers ici</h3>
              <p className="text-sm text-slate-500">(PDF, Word, Images supportés)</p>
            </>
          )}
        </div>

        {/* FOLDERS SECTION */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Dossiers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map(folder => (
              <div key={folder.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${folder.bgColor} ${folder.color} group-hover:scale-110 transition-transform`}>
                  <Folder className="w-6 h-6 fill-current" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 truncate">{folder.name}</h4>
                  <p className="text-xs text-slate-500 truncate">Modifié · {folder.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT FILES SECTION */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Fichiers récents</h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
              </div>
            ) : filteredFiles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Taille</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFiles.map((file) => (
                      <tr 
                        key={file.id} 
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => window.open(file.fileUrl, '_blank')}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                               <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-800 truncate">{file.fileName}</p>
                              <p className="text-xs text-slate-500 truncate sm:hidden">{file.type} • {formatDate(file.createdAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-100 text-slate-600`}>
                            {file.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                           {file.size}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">
                          {formatDate(file.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => { e.stopPropagation(); window.open(file.fileUrl, '_blank'); }} className="p-2 text-slate-400 hover:text-emerald-600 bg-white hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100" title="Télécharger">
                               <Download className="w-4 h-4" />
                             </button>
                             <button onClick={(e) => handleDeleteFile(file.id, e)} className="p-2 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Supprimer">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Aucun fichier</h3>
                <p className="text-sm text-slate-500">
                  {searchQuery ? "Aucun fichier ne correspond à votre recherche." : "Générez ou déposez des fichiers pour commencer."}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 z-[200] px-6 py-3 rounded-xl shadow-lg font-medium text-white ${toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}
          >
            {toastMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CLASSIFICATION MODAL */}
      <AnimatePresence>
        {pendingFile && (
          <div className="fixed inset-0 z-[150] bg-slate-800/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative overflow-hidden"
            >
              <button 
                onClick={() => setPendingFile(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Classer ce document</h3>
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{pendingFile.name}</span>
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Niveau (Dossier)<span className="text-rose-500">*</span></label>
                  <select 
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    disabled={isUploading}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <option value="3ème AP">3ème AP</option>
                    <option value="4ème AP">4ème AP</option>
                    <option value="5ème AP">5ème AP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Type de document</label>
                  <select 
                    value={selectedFileType}
                    onChange={(e) => setSelectedFileType(e.target.value)}
                    disabled={isUploading}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <option value="Fiche de préparation">Fiche de préparation</option>
                    <option value="Exercice">Exercice</option>
                    <option value="Évaluation">Évaluation</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setPendingFile(null)}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmUpload}
                  disabled={isUploading}
                  className="flex-[2] flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>Valider et Sauvegarder</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <button onClick={() => setViewingDoc(null)} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-xl shadow-sm border border-slate-200 transition-colors shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="truncate min-w-0">
                    <h3 className="font-black text-slate-800 truncate text-sm md:text-base">{viewingDoc.title}</h3>
                    <p className="text-[10px] md:text-xs font-medium text-slate-500 truncate">{viewingDoc.className} • {viewingDoc.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {viewingDoc.type !== 'IA' && (
                    <button onClick={() => exportToPDF(viewingDoc.content, viewingDoc.type)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-bold text-sm shadow-md">
                      <Download className="w-4 h-4" /> <span className="hidden sm:inline">Télécharger PDF</span>
                    </button>
                  )}
                  <button onClick={() => {
                    if (viewingDoc.type === 'IA') {
                      window.print();
                    } else {
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
              <div className="flex-1 overflow-y-auto p-0 sm:p-8 bg-slate-100/50 w-full overflow-hidden print:bg-white print:p-0 print:overflow-visible">
                {viewingDoc.type === 'IA' ? (
                  <div className="bg-[#FFFAF3] shadow-sm mx-auto w-full sm:max-w-4xl rounded-sm p-8 md:p-12 prose print:w-full print:max-w-none print:bg-white print:text-black print:p-0 print:shadow-none print:border-none [&_tr]:break-inside-avoid [&_table]:break-inside-auto [&_h1]:break-after-avoid [&_h2]:break-after-avoid [&_h3]:break-after-avoid">
                    <Markdown
                      components={{
                        strong: ({node, ...props}) => <strong className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100 shadow-sm" {...props} />,
                        em: ({node, ...props}) => <em className="not-italic font-semibold text-rose-700 underline decoration-rose-400 decoration-wavy decoration-2 underline-offset-4" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mt-6 mb-3 inline-block border-b-2 border-indigo-100 pb-1" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base sm:text-lg font-bold text-violet-700 mt-4 mb-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="space-y-2.5 mt-3 mb-5" {...props} />,
                        ol: ({node, ...props}) => <ol className="space-y-2.5 mt-3 mb-5 list-decimal pl-5 marker:text-indigo-600 marker:font-bold" {...props} />,
                        li: ({node, className, children, ...props}: any) => (
                          <li className="flex items-start gap-3 text-slate-700 leading-relaxed" {...props}>
                            {node?.parent?.tagName === 'ol' ? (
                              <span className="shrink-0 mt-0.5 text-indigo-600 font-bold">•</span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 mt-2.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                            )}
                            <span className="flex-1">{children}</span>
                          </li>
                        ),
                        p: ({node, ...props}) => <p className="mb-4 last:mb-0 text-slate-700 leading-relaxed" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-400 bg-gradient-to-r from-amber-50 to-amber-50/10 pl-4 py-3 text-slate-700 my-4 rounded-r-xl italic shadow-sm" {...props} />,
                        a: ({node, ...props}) => <a className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 decoration-2 underline-offset-2 transition-colors font-medium" {...props} />
                      }}
                    >
                      {viewingDoc.content}
                    </Markdown>
                  </div>
                ) : (
                  <div 
                    className={`bg-white shadow-sm mx-auto w-full sm:max-w-4xl rounded-sm ${isMobile ? 'p-4' : 'p-4 sm:p-8'} overflow-hidden @container [&_*]:!max-w-full [&_*]:!box-border [&_*]:![overflow-wrap:anywhere] [&_*]:![word-break:break-word] [&_img]:!max-w-full [&_img]:!w-full [&_img]:!h-auto [&_video]:!max-w-full [&_video]:!w-full [&_video]:!h-auto [&_iframe]:!max-w-full [&_iframe]:!w-full [&_iframe]:!h-auto [&_table]:!block [&_table]:!max-w-full [&_table]:!overflow-x-auto`} 
                    dangerouslySetInnerHTML={{ __html: viewingDoc.content }} 
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
