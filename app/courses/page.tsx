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
  Upload,
  Check,
  ChevronDown,
  Calendar,
  ChevronLeft,
  RefreshCw,
  TrendingUp
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"
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
  trimestre?: string;
  teacherId: string;
  createdAt: any;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Octets';
  const k = 1024;
  const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function CoursesLibraryPage() {
  const { user, isAuthReady } = useAuth()
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("Toutes")
  const [docs, setDocs] = useState<GeneratedDoc[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"programme" | "files">("programme")
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
  const [selectedFileType, setSelectedFileType] = useState<string>("Leçon")
  const [selectedTrimestre, setSelectedTrimestre] = useState<string>("T1")
  const [filterType, setFilterType] = useState<string>("Toutes")
  const [filterNiveau, setFilterNiveau] = useState<string>("Toutes")
  const [filterTrimestre, setFilterTrimestre] = useState<string>("Toutes")
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  }

  const [currentPath, setCurrentPath] = useState(["Mon Classeur"]);

  const supabase = createBrowserClient()

  // Safely encodes a file URL to handle spaces and parenthesises correctly
  const encodeFileUrl = (url: string) => {
    if (!url) return "";
    try {
      // Decode first to prevent double-encoding issues
      const decoded = decodeURI(url);
      // encodeURI handles spaces and standard special characters but leaves : / ? & = intact
      let encoded = encodeURI(decoded);
      // Manually encode parenthesises as encodeURI does not touch them
      encoded = encoded.replace(/\(/g, '%28').replace(/\)/g, '%29');
      return encoded;
    } catch (e) {
      return url;
    }
  };

  // Retrieve the official public URL using Supabase Storage client
  const getFilePublicUrl = (fileUrl: string) => {
    if (!fileUrl) return "";
    try {
      const marker = '/storage/v1/object/public/teacher-files/';
      const index = fileUrl.indexOf(marker);
      if (index !== -1) {
        const filePath = fileUrl.substring(index + marker.length);
        const decodedPath = decodeURIComponent(filePath);
        
        const { data } = supabase.storage
          .from('teacher-files')
          .getPublicUrl(decodedPath);
          
        return data?.publicUrl || fileUrl;
      }
      
      // Fallback if marker not found
      return decodeURIComponent(fileUrl);
    } catch (e) {
      console.error("Error generating public URL:", e);
      return fileUrl;
    }
  };

  // Render document lists inside Neo-brutalist distinct panels
  const renderFileSections = (filesList: TeacherFile[]) => {
    const listLecons = filesList.filter(f => f.fileType === "Leçon" || f.fileType === "Fiche de préparation" || f.fileType === "Cours");
    const listExercices = filesList.filter(f => f.fileType === "Exercice");
    const listExamens = filesList.filter(f => f.fileType === "Examen");
    const listRessources = filesList.filter(f => 
      f.fileType !== "Leçon" && 
      f.fileType !== "Fiche de préparation" && 
      f.fileType !== "Cours" && 
      f.fileType !== "Exercice" && 
      f.fileType !== "Examen"
    );

    const hasAnyFiles = filesList.length > 0;

    if (!hasAnyFiles) {
      return (
        <div className="p-12 text-center border-4 border-slate-900 rounded-3xl bg-white flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-16 h-16 bg-slate-50 border-2 border-slate-900 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-1">Aucun document trouvé</h3>
          <p className="text-sm font-bold text-slate-500">
            Modifiez vos filtres ou ajoutez des fichiers pour commencer.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-10">
        {/* Leçons & Fiches */}
        {listLecons.length > 0 && (
          <div className="bg-sky-50/50 border-3 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-sky-400 border-2 border-slate-900"></span>
              📘 Cours & Leçons ({listLecons.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listLecons.map(file => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          </div>
        )}

        {/* Exercices */}
        {listExercices.length > 0 && (
          <div className="bg-emerald-50/50 border-3 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
              🟢 Exercices ({listExercices.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listExercices.map(file => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          </div>
        )}

        {/* Examens */}
        {listExamens.length > 0 && (
          <div className="bg-rose-50/50 border-3 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-rose-400 border-2 border-slate-900"></span>
              🔴 Examens & Évaluations ({listExamens.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listExamens.map(file => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          </div>
        )}

        {/* Autres ressources */}
        {listRessources.length > 0 && (
          <div className="bg-purple-50/50 border-3 border-slate-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-400 border-2 border-slate-900"></span>
              🟣 Ressources complémentaires ({listRessources.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listRessources.map(file => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Define database fetching functions at the component level
  const fetchClasses = async () => {
    if (!user?.id) return
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', user.id)
    
    if (!error && data) {
      setClasses(data)
      if (data.length > 0 && !selectedFolder) {
        const firstLevel = data[0].level || data[0].name;
        setSelectedFolder(firstLevel);
      }
    }
  }

  const fetchCourses = async () => {
    if (!user?.id) return
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', user.id)
    
    if (!error && data) {
      const sorted = data.map((d: any) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        className: d.class_name,
        term: d.term,
        content: d.content,
        imageUrl: d.image_url,
        createdAt: d.created_at,
        color: d.color || "from-blue-500 to-cyan-400",
        iconColor: d.icon_color || "text-blue-500",
        bgColor: d.bg_color || "bg-blue-50"
      })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setDocs(sorted)
    }
  }

  const fetchFiles = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`/api/files?teacherId=${user.id}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Erreur de chargement des fichiers.");
      }

      const data = result.files || [];
      const sorted = data.map((f: any) => {
        let displayName = f.name || "";
        let fileClass = f.niveau || "Toutes";
        let fileCategory = f.document_type || "Ressources complémentaires";
        let fileTrimestre = f.trimestre || "T1";

        if (f.name && f.name.includes(":::")) {
          const parts = f.name.split(":::");
          if (parts.length >= 3) {
            fileClass = parts[0];
            fileCategory = parts[1];
            if (parts.length === 4) {
              fileTrimestre = parts[2];
              displayName = parts[3];
            } else {
              displayName = parts[2];
            }
          }
        }

        return {
          id: f.id,
          fileName: displayName,
          fileUrl: f.url,
          size: formatSize(Number(f.size) || 0),
          type: f.type,
          folder: fileClass,
          fileType: fileCategory,
          trimestre: fileTrimestre,
          teacherId: f.teacher_id,
          createdAt: f.created_at
        };
      }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setTeacherFiles(sorted)
    } catch (err: any) {
      console.error("fetchFiles error:", err);
      showToast("Impossible de lire les fichiers de la base.", "error");
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user?.id) {
      setTimeout(() => {
        setDocs([]);
        setTeacherFiles([]);
        setClasses([]);
        setIsLoading(false);
      }, 0);
      return;
    }

    const init = async () => {
      await Promise.resolve();
      fetchClasses();
      fetchCourses();
      fetchFiles();
    };
    init();

    const coursesChannel = supabase
      .channel('courses-page-courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses', filter: `teacher_id=eq.${user.id}` }, () => fetchCourses())
      .subscribe()

    const filesChannel = supabase
      .channel('courses-page-files')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teacher_files', filter: `teacher_id=eq.${user.id}` }, () => fetchFiles())
      .subscribe()

    return () => {
      supabase.removeChannel(coursesChannel)
      supabase.removeChannel(filesChannel)
    }
  }, [user, isAuthReady])

  // Get unique class levels dynamically
  const uniqueClassLevels = Array.from(new Set(classes.map(c => c.level || c.name))).filter(Boolean);

  const dynamicFolders = uniqueClassLevels.map((level, idx) => {
    const colors = [
      { color: 'text-blue-500', bgColor: 'bg-blue-100 hover:bg-blue-200' },
      { color: 'text-emerald-500', bgColor: 'bg-emerald-100 hover:bg-emerald-200' },
      { color: 'text-orange-500', bgColor: 'bg-orange-100 hover:bg-orange-200' },
      { color: 'text-pink-500', bgColor: 'bg-pink-100 hover:bg-pink-200' },
    ];
    return {
      id: String(idx + 1),
      name: level,
      ...colors[idx % colors.length]
    };
  });

  const filteredFiles = teacherFiles.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = filterNiveau === "Toutes"
      ? (selectedClass === "Toutes" || file.folder === selectedClass)
      : (file.folder === filterNiveau);

    const matchesType = filterType === "Toutes" || file.fileType === filterType;
    const matchesTrimestre = filterTrimestre === "Toutes" || file.trimestre === filterTrimestre;

    return matchesSearch && matchesClass && matchesType && matchesTrimestre;
  });

  const classCourses = docs.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "Toutes" || course.className?.toLowerCase().includes(selectedClass.toLowerCase());
    return matchesSearch && matchesClass;
  });

  const completedCourses = classCourses.filter(c => {
    try {
      if (c.bgColor && c.bgColor.startsWith("{")) {
        return JSON.parse(c.bgColor).status === "Terminé";
      }
    } catch(e) {}
    return false;
  });
  
  const programProgress = classCourses.length === 0 ? 0 : Math.round((completedCourses.length / classCourses.length) * 100);

  const handleSelectFolder = (name: string) => {
    setSelectedClass(name);
    setCurrentPath(["Mon Classeur", name]);
  };

  const handleResetPath = () => {
    setSelectedClass("Toutes");
    setCurrentPath(["Mon Classeur"]);
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return;
    if (selectedClass !== "Toutes") {
      setSelectedFolder(selectedClass);
    }
    setPendingFile(file);
  };

  const confirmUpload = async () => {
    if (!user?.id || !pendingFile) return;
    setIsUploading(true);
    try {
      const bucketName = 'teacher-files';
      const filePath = `${user.id}/${Date.now()}_${pendingFile.name}`;
      
      // 1. Upload to storage bucket using direct browser SDK
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, pendingFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const safePublicUrl = data.publicUrl;

      const ext = pendingFile.name.split('.').pop()?.toUpperCase() || 'FICHIER';
      const encodedName = `${selectedFolder}:::${selectedFileType}:::${pendingFile.name}`;

      // 2. Call server-side API endpoint to insert database record (bypasses RLS)
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: pendingFile.name,
          url: safePublicUrl,
          size: pendingFile.size,
          type: ext,
          teacherId: user.id,
          documentType: selectedFileType,
          niveau: selectedFolder,
          trimestre: selectedTrimestre
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur d'insertion en base de données.");
      }

      // Explicitly trigger manual reload of list
      await fetchFiles();

      // Automatically switch to files tab to show the upload result
      if (selectedClass !== "Toutes") {
        setActiveTab("files");
      }

      setPendingFile(null);
      showToast("Document classé avec succès !", "success");
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast("Erreur lors de l'envoi : " + (error.message || error), "error");
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

  const handleDeleteFile = async (id: string, fileUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) {
      try {
        // 1. Delete from storage bucket using direct browser SDK
        const marker = '/storage/v1/object/public/teacher-files/';
        const index = fileUrl.indexOf(marker);
        if (index !== -1) {
          const filePath = fileUrl.substring(index + marker.length);
          // decodeURIComponent handles any %20 or %28 in the URL so that the raw storage path is clean
          const decodedPath = decodeURIComponent(filePath);
          const { error: storageError } = await supabase.storage
            .from('teacher-files')
            .remove([decodedPath]);
          
          if (storageError) {
            console.error("Storage delete error:", storageError);
          }
        }

        // 2. Call server-side API endpoint to delete database record (bypasses RLS)
        const response = await fetch(`/api/files?id=${id}&teacherId=${user.id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Erreur de suppression en base de données.");
        }

        // Explicitly trigger manual reload of list
        await fetchFiles();
        
        showToast("Fichier supprimé avec succès", "success")
      } catch (error: any) {
        console.error("Error deleting file:", error)
        showToast("Erreur lors de la suppression : " + (error.message || error), "error")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', id)
          .eq('teacher_id', user.id)
        if (error) throw error
        
        // Explicitly trigger manual reload of list
        await fetchCourses();
        
        showToast("Cours supprimé avec succès", "success")
      } catch (error) {
        console.error("Error deleting course:", error)
        showToast("Erreur lors de la suppression", "error")
      }
    }
  }

  const handleUpdateStatus = async (courseId: string, currentBgColor: string, newStatus: string) => {
    if (!user?.id) return;
    
    let originalBg = currentBgColor || "bg-blue-50";
    try {
      if (currentBgColor && currentBgColor.startsWith("{")) {
        const meta = JSON.parse(currentBgColor);
        originalBg = meta.originalBg || "bg-blue-50";
      }
    } catch (e) {}

    const metaData = {
      status: newStatus,
      completedAt: newStatus === "Terminé" ? new Date().toISOString().split('T')[0] : null,
      originalBg: originalBg
    };

    const { error } = await supabase
      .from('courses')
      .update({ bg_color: JSON.stringify(metaData) })
      .eq('id', courseId)
      .eq('teacher_id', user.id);

    if (error) {
      console.error("Error updating course status:", error);
      showToast("Erreur lors de la mise à jour", "error");
    } else {
      showToast(`Statut mis à jour : ${newStatus}`, "success");
      setDocs(prev => prev.map(d => {
        if (d.id === courseId) {
          return {
            ...d,
            bgColor: JSON.stringify(metaData)
          };
        }
        return d;
      }));
    }
  };

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
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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

  // Nested Components for cleaner structure
  const FileCard = ({ file }: { file: TeacherFile }) => {
    const getExtBg = (ext: string) => {
      switch (ext?.toUpperCase()) {
        case 'PDF': return 'bg-rose-50 text-rose-600 border-rose-100';
        case 'DOC':
        case 'DOCX': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'PNG':
        case 'JPG':
        case 'JPEG': return 'bg-purple-50 text-purple-600 border-purple-100';
        default: return 'bg-slate-50 text-slate-600 border-slate-100';
      }
    };

    return (
      <div 
        className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
        onClick={() => window.open(getFilePublicUrl(file.fileUrl), '_blank')}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getExtBg(file.type)}`}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate text-sm">{file.fileName}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{file.type} • {file.size}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <button 
            onClick={() => window.open(getFilePublicUrl(file.fileUrl), '_blank')} 
            className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-transparent"
            title="Télécharger"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => handleDeleteFile(file.id, file.fileUrl, e)} 
            className="p-2 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg transition-colors border border-transparent"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const CourseCard = ({ course }: { course: GeneratedDoc }) => {
    let status = "À faire";
    let completedAt = null;
    let originalBg = course.bgColor || "bg-blue-50";

    try {
      if (course.bgColor && course.bgColor.startsWith("{")) {
        const meta = JSON.parse(course.bgColor);
        status = meta.status || "À faire";
        completedAt = meta.completedAt || null;
        originalBg = meta.originalBg || "bg-blue-50";
      }
    } catch (e) {}

    const getStatusBadge = (s: string) => {
      switch (s) {
        case 'Terminé': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'En cours': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    };

    const isCompleted = status === "Terminé";

    const toggleComplete = () => {
      const newStatus = isCompleted ? "À faire" : "Terminé";
      handleUpdateStatus(course.id, course.bgColor, newStatus);
    };

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button 
            onClick={toggleComplete}
            className={`w-6 h-6 rounded-lg border-2 border-slate-300 flex items-center justify-center shrink-0 transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white hover:border-slate-400'}`}
          >
            {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusBadge(status)}`}>
                {status}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                {course.type}
              </span>
              {completedAt && (
                <span className="text-[10px] font-semibold text-slate-400">
                  Fait le {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(completedAt))}
                </span>
              )}
            </div>
            <h4 className={`font-bold text-slate-800 text-base truncate ${isCompleted ? 'line-through text-slate-400' : ''}`}>
              {course.title}
            </h4>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">{course.className} • {course.term}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 justify-end shrink-0">
          <select 
            value={status}
            onChange={(e) => handleUpdateStatus(course.id, course.bgColor, e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold shadow-sm cursor-pointer focus:outline-none hover:bg-slate-50"
          >
            <option value="À faire">À faire</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
          </select>

          <button 
            onClick={() => setViewingDoc(course)} 
            className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm hover:bg-slate-50 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Voir</span>
          </button>

          <button 
            onClick={() => handleDelete(course.id)} 
            className="p-2 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl transition-all"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50/50 print:bg-white print:p-0">
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4' : 'px-8'} py-8 print:hidden`}>
        
        {/* TOP BAR: BREADCRUMB & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-lg md:text-xl font-bold text-slate-800">
            {currentPath.map((segment, index) => (
              <div key={segment} className="flex items-center gap-2">
                <span 
                  onClick={() => {
                    if (index === 0) {
                      handleResetPath();
                    } else {
                      handleSelectFolder(segment);
                    }
                  }}
                  className={index === currentPath.length - 1 ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700 cursor-pointer transition-colors'}
                >
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
               Ajouter un document
             </button>
          </div>
        </div>

        {/* PROGRAM PROGRESS BAR */}
        {selectedClass !== "Toutes" && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
            <div className="flex flex-col gap-1 w-full md:w-auto">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Progression du Programme
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                Classe : {selectedClass}
              </p>
            </div>
            <div className="w-full md:w-2/3 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative shadow-inner">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 ease-in-out" 
                  style={{ width: `${programProgress}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl shrink-0">
                {programProgress}% du programme annuel complété
              </span>
            </div>
          </div>
        )}

        {/* DRAG & DROP AREA */}
        <div 
          onDragOver={onDragOver}
          onDrop={onDrop}
          className="mb-10 bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center hover:bg-slate-50 hover:border-violet-300 transition-all cursor-pointer group shadow-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-4">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Téléchargement en cours...</h3>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-slate-100 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Glissez-déposez vos fichiers ici</h3>
              <p className="text-sm font-semibold text-slate-500">(PDF, Word, Images supportés)</p>
            </>
          )}
        </div>

        {/* TAB SWITCHER */}
        {selectedClass !== "Toutes" && (
          <div className="flex border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm mb-8 max-w-md">
            <button 
              onClick={() => setActiveTab("programme")} 
              className={`flex-1 py-3 text-center text-sm font-bold transition-all border-r border-slate-200 ${activeTab === "programme" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              Suivi du Programme ({classCourses.length})
            </button>
            <button 
              onClick={() => setActiveTab("files")} 
              className={`flex-1 py-3 text-center text-sm font-bold transition-all ${activeTab === "files" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              Documents ({filteredFiles.length})
            </button>
          </div>
        )}

        {/* ALL CLASSES VIEW */}
        {selectedClass === "Toutes" && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5 text-slate-500" />
              Classes & Niveaux
            </h2>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            ) : dynamicFolders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {dynamicFolders.map(folder => (
                  <div 
                    key={folder.name} 
                    onClick={() => handleSelectFolder(folder.name)}
                    className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${folder.bgColor} ${folder.color} group-hover:scale-110 transition-transform`}>
                      <Folder className="w-6 h-6 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 truncate text-sm sm:text-base">{folder.name}</h4>
                      <p className="text-xs text-slate-500 truncate">Voir la progression</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-500">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Aucune classe configurée</h3>
                <p className="text-sm font-semibold text-slate-500 max-w-md mb-6">
                  Créez des classes et ajoutez des élèves pour commencer à organiser vos cours.
                </p>
                <Link href="/classes" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-sm">
                  <Plus className="w-4 h-4" />
                  Créer ma première classe
                </Link>
              </div>
            )}
          </div>
        )}

        {/* PLAYFUL FILTER BAR */}
        <div className="bg-amber-50 border-4 border-slate-900 rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] mb-8 print:hidden">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎯</span>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Filtres de Tri</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filter by Level */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">🎓 Classe / Niveau</label>
              <div className="flex flex-wrap gap-2">
                {["Toutes", "1AP", "2AP", "3AP", "4AP", "5AP"].map((level) => {
                  const isActive = filterNiveau === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setFilterNiveau(level)}
                      className={`px-3 py-1.5 text-xs font-black rounded-lg border-2 border-slate-900 transition-all ${
                        isActive 
                          ? "bg-sky-400 text-slate-900 translate-x-[2px] translate-y-[2px] shadow-none" 
                          : "bg-white text-slate-700 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter by Type */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">📂 Type de document</label>
              <div className="flex flex-wrap gap-2">
                {["Toutes", "Cours", "Exercice", "Examen", "Ressources complémentaires"].map((type) => {
                  const isActive = filterType === type;
                  const typeColors: Record<string, string> = {
                    "Cours": "bg-blue-300",
                    "Exercice": "bg-emerald-300",
                    "Examen": "bg-rose-300",
                    "Ressources complémentaires": "bg-purple-300",
                    "Toutes": "bg-yellow-300"
                  };
                  return (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 text-xs font-black rounded-lg border-2 border-slate-900 transition-all ${
                        isActive 
                          ? `${typeColors[type] || "bg-slate-400"} text-slate-900 translate-x-[2px] translate-y-[2px] shadow-none` 
                          : "bg-white text-slate-700 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter by Trimestre */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">📅 Trimestre</label>
              <div className="flex flex-wrap gap-2">
                {["Toutes", "T1", "T2", "T3"].map((tri) => {
                  const isActive = filterTrimestre === tri;
                  return (
                    <button
                      key={tri}
                      onClick={() => setFilterTrimestre(tri)}
                      className={`px-3 py-1.5 text-xs font-black rounded-lg border-2 border-slate-900 transition-all ${
                        isActive 
                          ? "bg-amber-400 text-slate-900 translate-x-[2px] translate-y-[2px] shadow-none" 
                          : "bg-white text-slate-700 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                      }`}
                    >
                      {tri}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT DISPLAY SECTION */}
        {selectedClass === "Toutes" ? (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              Tous les documents récents
            </h2>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            ) : (
              renderFileSections(filteredFiles)
            )}
          </div>
        ) : (
          <div>
            {activeTab === "programme" ? (
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-slate-500" />
                  Suivi du Programme Annuel
                </h2>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                  </div>
                ) : classCourses.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {classCourses.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-500">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Aucun cours dans le programme</h3>
                    <p className="text-sm font-semibold text-slate-500 max-w-md mb-6">
                      Vous n&apos;avez pas encore généré ou ajouté de cours pour cette classe. Utilisez notre assistant IA pour générer instantanément vos fiches de cours, exercices et évaluations.
                    </p>
                    <Link href="/ai-generator" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-sm">
                      <Sparkles className="w-4 h-4" />
                      Générer un cours avec l&apos;IA
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              renderFileSections(filteredFiles)
            )}
          </div>
        )}

      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 z-[200] px-6 py-3 rounded-xl shadow-lg border font-bold text-white ${toastMessage.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-rose-600 border-rose-500'}`}
          >
            {toastMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CLASSIFICATION MODAL */}
      <AnimatePresence>
        {pendingFile && (
          <div className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 w-full max-w-lg relative overflow-hidden"
            >
              <button 
                onClick={() => setPendingFile(null)}
                className="absolute top-4 right-4 p-2 text-slate-700 hover:text-slate-900 border-2 border-transparent hover:border-slate-900 rounded-xl transition-all"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <div className="inline-block bg-yellow-300 border-2 border-slate-900 rounded-lg px-3 py-1 font-black text-xs uppercase tracking-wider mb-2">
                  Nouveau Fichier
                </div>
                <h3 className="text-2xl font-black text-slate-900">Classer le document</h3>
                <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mt-1 truncate">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>{pendingFile.name}</span>
                </p>
              </div>

              <div className="space-y-6 mb-8">
                {/* Document Type Section */}
                <div>
                  <label className="block text-sm font-black text-slate-900 uppercase tracking-wider mb-2.5">
                    📂 Type de Document
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "Cours", label: "Cours", color: "bg-blue-200 border-blue-900 hover:bg-blue-300 text-blue-950" },
                      { key: "Exercice", label: "Exercice", color: "bg-emerald-200 border-emerald-900 hover:bg-emerald-300 text-emerald-950" },
                      { key: "Examen", label: "Examen", color: "bg-rose-200 border-rose-900 hover:bg-rose-300 text-rose-950" }
                    ].map(item => {
                      const isActive = selectedFileType === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedFileType(item.key)}
                          className={`py-3 px-2 text-center rounded-xl border-3 border-slate-900 font-extrabold text-sm transition-all flex flex-col items-center gap-1 ${
                            isActive 
                              ? `${item.color} translate-x-[2px] translate-y-[2px] shadow-none` 
                              : "bg-white text-slate-700 hover:bg-slate-50 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                          }`}
                        >
                          <span className="text-lg">
                            {item.key === "Cours" ? "📘" : item.key === "Exercice" ? "📝" : "🏆"}
                          </span>
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Niveau / Classe Section */}
                <div>
                  <label className="block text-sm font-black text-slate-900 uppercase tracking-wider mb-2.5">
                    🎓 Niveau / Classe
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {["1AP", "2AP", "3AP", "4AP", "5AP"].map((level) => {
                      const isActive = selectedFolder === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSelectedFolder(level)}
                          className={`px-4 py-2 text-xs font-black rounded-xl border-3 border-slate-900 transition-all ${
                            isActive 
                              ? "bg-sky-300 text-slate-900 translate-x-[2px] translate-y-[2px] shadow-none" 
                              : "bg-white text-slate-700 hover:bg-slate-50 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trimestre Section */}
                <div>
                  <label className="block text-sm font-black text-slate-900 uppercase tracking-wider mb-2.5">
                    📅 Trimestre
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["T1", "T2", "T3"].map((tri) => {
                      const isActive = selectedTrimestre === tri;
                      return (
                        <button
                          key={tri}
                          type="button"
                          onClick={() => setSelectedTrimestre(tri)}
                          className={`py-2 px-4 rounded-xl border-3 border-slate-900 font-extrabold text-sm text-center transition-all ${
                            isActive 
                              ? "bg-amber-300 text-slate-900 translate-x-[2px] translate-y-[2px] shadow-none" 
                              : "bg-white text-slate-700 hover:bg-slate-50 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                          }`}
                        >
                          Trimestre {tri === "T1" ? "1" : tri === "T2" ? "2" : "3"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={() => setPendingFile(null)}
                  disabled={isUploading}
                  className="flex-1 px-4 py-3 rounded-xl border-3 border-slate-900 font-extrabold text-slate-700 bg-white hover:bg-slate-50 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmUpload}
                  disabled={isUploading}
                  className="flex-[2] flex justify-center items-center gap-2 px-4 py-3 rounded-xl border-3 border-slate-900 font-extrabold text-white bg-slate-900 hover:bg-slate-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.25)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>💾 Sauvegarder</>
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
                    <h3 className="font-bold text-slate-800 truncate text-sm md:text-base">{viewingDoc.title}</h3>
                    <p className="text-[10px] md:text-xs font-semibold text-slate-500 truncate">{viewingDoc.className} • {viewingDoc.type}</p>
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
                    className="bg-white shadow-sm mx-auto w-full sm:max-w-4xl rounded-sm p-4 sm:p-8 overflow-hidden @container [&_*]:!max-w-full [&_*]:!box-border [&_*]:![overflow-wrap:anywhere] [&_*]:![word-break:break-word] [&_img]:!max-w-full [&_img]:!w-full [&_img]:!h-auto [&_video]:!max-w-full [&_video]:!w-full [&_video]:!h-auto [&_iframe]:!max-w-full [&_iframe]:!w-full [&_iframe]:!h-auto [&_table]:!block [&_table]:!max-w-full [&_table]:!overflow-x-auto" 
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
