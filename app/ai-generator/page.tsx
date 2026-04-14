"use client"

import { useState } from "react"
import { Sparkles, FileText, PenTool, BookOpen, Loader2, Wand2, Star, Circle, Triangle, Zap, Lightbulb, Search, Eye, CheckCircle, Info, Target, Flag, Printer, Maximize, Minimize, Send, ArrowLeft, Download, Save, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GoogleGenAI } from "@google/genai"
import { db, auth } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

const contentTypes = [
  { id: "lesson", name: "Fiche de cours", icon: BookOpen, description: "Contenu structuré et clair", color: "from-sky-400 to-blue-500", shadow: "shadow-blue-500/30" },
  { id: "exercise", name: "Exercices", icon: PenTool, description: "Pratique et évaluation", color: "from-pink-400 to-rose-500", shadow: "shadow-pink-500/30" },
  { id: "exam", name: "Examen", icon: FileText, description: "Sujet complet avec barème", color: "from-amber-400 to-orange-500", shadow: "shadow-orange-500/30" },
]

export default function AIGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState("lesson")
  const [topic, setTopic] = useState("")
  const [classLevel, setClassLevel] = useState("3AP")
  const [activityType, setActivityType] = useState("Compréhension de l'oral")
  const [examType, setExamType] = useState("Devoir")
  const [term, setTerm] = useState("1er trimestre")
  const [exerciseType, setExerciseType] = useState("Grammaire")
  const [exerciseCount, setExerciseCount] = useState("3")
  const [difficulty, setDifficulty] = useState("Intermédiaire")
  const [pageCount, setPageCount] = useState("auto")
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [modificationPrompt, setModificationPrompt] = useState("")
  const [isModifying, setIsModifying] = useState(false)

  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [saveTitle, setSaveTitle] = useState("")
  const [saveType, setSaveType] = useState("Cours")
  const [saveClass, setSaveClass] = useState("3ème AP")
  const [saveTerm, setSaveTerm] = useState("1er trimestre")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleOpenSaveModal = () => {
    setSaveTitle(topic || "Nouveau document")
    setSaveType(selectedType === 'lesson' ? 'Cours' : selectedType === 'exercise' ? 'Exercice' : 'Examen')
    setSaveClass(classLevel === '3AP' ? '3ème AP' : classLevel === '4AP' ? '4ème AP' : classLevel === '5AP' ? '5ème AP' : '1ère AM')
    setSaveTerm(term)
    setIsSaveModalOpen(true)
    setSaveSuccess(false)
  }

  const handleSaveToDatabase = async () => {
    if (!saveTitle.trim()) return;
    const user = auth.currentUser;
    if (!user) {
      setError("Vous devez être connecté pour sauvegarder.");
      return;
    }

    setIsSaving(true);
    setError("");
    
    try {
      let color = "from-blue-500 to-cyan-400";
      let iconColor = "text-blue-500";
      let bgColor = "bg-blue-50";
      
      if (saveType === "Exercice") {
        color = "from-emerald-500 to-teal-400";
        iconColor = "text-emerald-500";
        bgColor = "bg-emerald-50";
      } else if (saveType === "Examen") {
        color = "from-orange-500 to-amber-400";
        iconColor = "text-orange-500";
        bgColor = "bg-orange-50";
      }

      await addDoc(collection(db, "courses"), {
        teacherId: user.uid,
        title: saveTitle,
        type: saveType,
        className: saveClass,
        term: saveTerm,
        content: generatedContent,
        createdAt: serverTimestamp(),
        color,
        iconColor,
        bgColor
      });
      
      setSaveSuccess(true);
      setTimeout(() => {
        setIsSaveModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, "courses");
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  }

  const handleGenerate = async () => {
    if (selectedType === 'lesson' && !topic.trim()) {
      setError("Veuillez entrer un sujet pour la leçon.")
      return
    }
    if (selectedType === 'exercise' && !topic.trim()) {
      setError("Veuillez préciser le thème ou la leçon pour les exercices.")
      return
    }
    setError("")
    setIsGenerating(true)
    setGeneratedContent(null)

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      let paramsText = `- Niveau : ${classLevel}\n`;
      if (pageCount !== "auto") {
        paramsText += `- Nombre de pages exigé : EXACTEMENT ${pageCount} page(s) A4.\n`;
      }
      if (selectedType === 'lesson') {
        paramsText += `- Type de document : Fiche de préparation de cours (pour l'enseignant)\n`;
        paramsText += `- Activité : ${activityType}\n`;
        paramsText += `- Sujet/Thème : ${topic}\n`;
      } else if (selectedType === 'exercise') {
        paramsText += `- Type de document : Feuille d'exercices (pour l'élève)\n`;
        paramsText += `- Domaine : ${exerciseType}\n`;
        paramsText += `- Nombre d'exercices : ${exerciseCount}\n`;
        paramsText += `- Niveau de difficulté : ${difficulty}\n`;
        if (topic.trim()) paramsText += `- Sujet/Thème : ${topic}\n`;
      } else if (selectedType === 'exam') {
        paramsText += `- Type de document : Sujet d'évaluation / Examen (pour l'élève)\n`;
        paramsText += `- Type d'épreuve : ${examType}\n`;
        paramsText += `- Période : ${term}\n`;
        paramsText += `- Niveau de difficulté : ${difficulty}\n`;
        if (topic.trim()) paramsText += `- Thème général : ${topic}\n`;
      }

      const basePrompt = `Tu es un Inspecteur de l'Éducation Nationale en Algérie et un expert en conception pédagogique. Tu maîtrises parfaitement les programmes officiels du Ministère de l'Éducation Nationale algérien pour le cycle Primaire (AP).

MISSION :
Ta mission est d'assister les enseignants algériens en générant du contenu pédagogique sur mesure. Ton contenu doit respecter rigoureusement l'Approche Par Compétences (APC), les progressions annuelles officielles, et s'adapter au contexte culturel et scolaire algérien.
Génère le contenu en français.

RÈGLES DE CONTENU (Ciblage Enseignant Algérien) :
- Vocabulaire précis : Utilise le jargon officiel algérien.
- Contextualisation : Les exemples, les prénoms et les situations doivent refléter l'environnement algérien.
- Adaptation au niveau : Ajuste la complexité selon le palier (3AP, 4AP, 5AP).
- EXHAUSTIVITÉ : Ne limite PAS la longueur du contenu. Génère l'intégralité du document (toutes les phases de la leçon, tous les exercices demandés, le texte complet, etc.) sans rien couper ni résumer, sauf si l'enseignant a explicitement demandé une limite.

SI C'EST UNE FICHE DE COURS (POUR LE PROF) :
- INCLURE LES RÉPONSES ATTENDUES : Pour chaque question posée aux élèves, tu DOIS fournir la réponse attendue par les élèves.
- DÉTAILLER TOUTES LES PHASES : Phase d'imprégnation, compréhension globale, compréhension détaillée, réinvestissement, etc.

SI C'EST UN EXAMEN OU UNE FEUILLE D'EXERCICES (POUR L'ÉLÈVE) :
- Tu dois générer un sujet PRÊT À IMPRIMER ET À DISTRIBUER AUX ÉLÈVES.
- IMPORTANT : Ne mets PAS les réponses directement dans le sujet de l'élève ! Le sujet doit être vierge avec des pointillés pour répondre.
- Structure obligatoire d'un sujet d'examen algérien (Primaire) :
  1. En-tête : Nom, Prénom, Classe, Date (avec des pointillés pour que l'élève écrive).
  2. Un texte court et adapté à l'âge et au thème.
  3. I. Compréhension de l'écrit : Questions sur le texte (choix multiple, vrai/faux, relève du texte, synonymes/antonymes). Laisse des pointillés pour les réponses.
  4. II. Fonctionnement de la langue : Exercices de grammaire, conjugaison, orthographe. Laisse des pointillés.
  5. III. Production écrite : Une consigne claire avec une boîte à outils (noms, verbes, adjectifs) pour aider l'élève à rédiger un court paragraphe. Laisse des lignes pointillées pour la rédaction.
- Tu peux générer un "Corrigé et Barème" sur une DEUXIÈME page A4 à la fin (en utilisant une nouvelle div class="a4-page").

RÈGLES VISUELLES ET FORMAT DE SORTIE (STYLE FICHE ALGÉRIENNE) :
Tu dois générer un code HTML complet qui s'inspire fortement du style visuel classique des fiches algériennes (code couleur, soulignements, encadrés), tout en t'autorisant un peu de créativité pour rendre le document encore plus clair et agréable (tu peux ajouter des icônes émojis, des encadrés "Astuce", améliorer l'espacement, etc.).
- Format strict : Génère UNIQUEMENT du code HTML avec le CSS intégré dans une balise <style>. Aucun texte brut en dehors. Ne mets pas de balises markdown autour de ta réponse.
- PAGINATION A4 : Enveloppe tout le contenu dans une ou plusieurs \`<div class="a4-page">\`.
- GESTION DES PAGES : Si un nombre de pages est exigé, tu dois générer exactement ce nombre de \`<div class="a4-page">\`. Répartis le contenu intelligemment pour remplir l'espace de manière harmonieuse. Ne coupe jamais un exercice, une phrase ou un tableau au milieu.

Voici une base CSS que tu dois utiliser pour garantir le format A4 à l'impression tout en restant lisible sur mobile :
@media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
.a4-page { font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.4; color: black; background: white; width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto 20px auto; box-sizing: border-box; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); page-break-after: always; }
@media screen and (max-width: 794px) { .a4-page { width: 100%; min-height: auto; padding: 15px; margin-bottom: 15px; } }
@media print { .a4-page { width: 210mm; min-height: 297mm; margin: 0; padding: 20mm; box-shadow: none; page-break-after: always; } }
.main-title { text-align: center; color: #2563eb; font-size: 22px; font-weight: normal; margin-bottom: 20px; }
.info-line { margin-bottom: 4px; }
.flex-line { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
@media (min-width: 600px) { .flex-line { flex-direction: row; justify-content: space-between; width: 100%; gap: 0; } }
.student-header { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; font-weight: bold; font-size: 16px; }
@media (min-width: 600px) { .student-header { flex-direction: row; justify-content: space-between; } }
.dotted-line { border-bottom: 2px dotted #94a3b8; width: 100%; display: inline-block; min-height: 20px; margin-top: 5px; }
.label { color: #dc2626; font-weight: bold; text-decoration: underline; }
.value { color: black; }
.section-title { text-align: center; color: #16a34a; font-size: 18px; font-weight: bold; text-decoration: underline; margin: 20px 0 10px 0; }
.step-title { color: #dc2626; font-weight: bold; text-decoration: underline; margin-top: 15px; margin-bottom: 5px; }
.sub-title { color: #16a34a; font-weight: bold; text-decoration: underline; margin-top: 10px; margin-bottom: 5px; }
.answer { color: #0d9488; }
.consigne-box { border: 2px solid #7dd3fc; padding: 10px; margin: 15px 0; text-align: center; font-weight: normal; border-radius: 8px; background-color: #f0f9ff; page-break-inside: avoid; break-inside: avoid; }
@media (min-width: 600px) { .consigne-box { margin: 15px 10%; } }
.boite-mots { display: flex; gap: 10px; justify-content: center; margin: 10px 0; flex-wrap: wrap; }
.mot { padding: 5px 20px; border: 1px solid #94a3b8; border-radius: 4px; color: black; font-weight: bold; }
.mot:nth-child(1n) { background-color: #dcfce7; }
.mot:nth-child(2n) { background-color: #ffedd5; }
.mot:nth-child(3n) { background-color: #fce7f3; }
.mot:nth-child(4n) { background-color: #f3e8ff; }
.mot:nth-child(5n) { background-color: #ecfccb; }
.application-box { border: 1px dashed #64748b; padding: 15px; margin-top: 10px; border-radius: 8px; background-color: #f8fafc; overflow-x: auto; page-break-inside: avoid; break-inside: avoid; }
table, tr, td, th { page-break-inside: avoid; break-inside: avoid; }

Voici les paramètres du document à générer :
${paramsText}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: basePrompt,
        config: {
          maxOutputTokens: 8192,
        }
      });

      // Nettoyer la réponse au cas où l'IA ajouterait des balises markdown ```html
      let htmlContent = response.text || "";
      htmlContent = htmlContent.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

      setGeneratedContent(htmlContent);
    } catch (err) {
      console.error(err);
      setError("Une erreur s'est produite lors de la génération du contenu. Veuillez réessayer.");
    } finally {
      setIsGenerating(false)
    }
  }

  const handleModify = async () => {
    if (!modificationPrompt.trim() || !generatedContent) return;
    setError("");
    setIsModifying(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const prompt = `Tu es un Inspecteur de l'Éducation Nationale en Algérie.
      Voici une fiche pédagogique que tu as générée précédemment au format HTML :
      
      ${generatedContent}
      
      L'enseignant demande la modification suivante : "${modificationPrompt}"
      
      Mets à jour le code HTML en appliquant cette modification. 
      RÈGLES STRICTES :
      - Conserve le style général (fiche algérienne) et conserve ABSOLUMENT le CSS lié au format A4 et à l'impression (@media print, .a4-page). Tu peux adapter la mise en page ou ajouter des éléments visuels si la modification le nécessite.
      - Renvoie UNIQUEMENT le code HTML complet mis à jour. Aucun texte brut avant ou après. Ne mets pas de balises markdown \`\`\`html.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          maxOutputTokens: 8192,
        }
      });

      let htmlContent = response.text || "";
      htmlContent = htmlContent.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

      setGeneratedContent(htmlContent);
      setModificationPrompt("");
    } catch (err) {
      console.error(err);
      setError("Une erreur s'est produite lors de la modification. Veuillez réessayer.");
    } finally {
      setIsModifying(false);
    }
  }

  const exportToPDF = async () => {
    if (!generatedContent) return;
    
    try {
      // Create a hidden iframe to isolate the content from Tailwind's oklch colors
      // which cause html2canvas to crash when parsing stylesheets.
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
              .consigne-box { border: 2px solid #7dd3fc; padding: 10px; margin: 15px 10%; text-align: center; font-weight: normal; border-radius: 8px; background-color: #f0f9ff; }
              .boite-mots { display: flex; gap: 10px; justify-content: center; margin: 10px 0; flex-wrap: wrap; }
              .mot { padding: 5px 20px; border: 1px solid #94a3b8; border-radius: 4px; color: black; font-weight: bold; }
              .mot:nth-child(1n) { background-color: #dcfce7; }
              .mot:nth-child(2n) { background-color: #ffedd5; }
              .mot:nth-child(3n) { background-color: #fce7f3; }
              .mot:nth-child(4n) { background-color: #f3e8ff; }
              .mot:nth-child(5n) { background-color: #ecfccb; }
              .application-box { border: 1px dashed #64748b; padding: 15px; margin-top: 10px; border-radius: 8px; background-color: #f8fafc; overflow-x: auto; }
            </style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          </head>
          <body>
            <div id="content-to-print">
              ${generatedContent}
            </div>
            <script>
              window.onload = function() {
                const element = document.getElementById('content-to-print');
                const opt = {
                  margin:       0,
                  filename:     '${selectedType === 'lesson' ? 'Fiche_de_cours' : selectedType === 'exercise' ? 'Exercices' : 'Examen'}.pdf',
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
      
      // Wait for the iframe to finish generating the PDF
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
        
        // Timeout after 15 seconds
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          reject(new Error("PDF generation timed out"));
        }, 15000);
      });
      
      document.body.removeChild(iframe);
    } catch (error) {
      console.error("Erreur PDF:", error);
      setError("Erreur lors de la génération du PDF. Essayez d'utiliser le bouton Imprimer.");
    }
  }

  const exportToWord = () => {
    if (!generatedContent) return;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Document</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + generatedContent + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${selectedType === 'lesson' ? 'Fiche_de_cours' : selectedType === 'exercise' ? 'Exercices' : 'Examen'}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

  return (
    <div className="min-h-screen pb-24 print:pb-0 print:bg-white">
      {/* STATE 1: FORM */}
      {!isGenerating && !generatedContent && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Playful Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl shadow-fuchsia-500/20 border-0">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            
            <motion.div animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute -right-8 -top-8 text-white/10 blur-[2px]">
              <Star className="h-48 w-48 fill-current" />
            </motion.div>
            <motion.div animate={{ y: [0, 30, 0], x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }} className="absolute -bottom-12 -left-12 text-white/10 blur-[1px]">
              <Circle className="h-56 w-56 fill-current" />
            </motion.div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/30 shadow-xl mb-6">
                <Wand2 className="h-10 w-10 text-amber-300" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-lg mb-4">
                Assistant IA Magique
              </h1>
              <p className="text-lg sm:text-xl text-white/80 font-medium">
                Générez du contenu pédagogique sur mesure en quelques secondes.
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
              <CardTitle className="text-xl font-black text-slate-800">Que voulez-vous créer ?</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {contentTypes.map((type) => {
                  const isSelected = selectedType === type.id
                  return (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedType(type.id)}
                      className={`relative flex flex-col items-center text-center gap-3 rounded-2xl p-4 transition-all duration-300 overflow-hidden ${
                        isSelected ? "bg-white shadow-lg ring-2 ring-violet-500 border-0" : "bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md"
                      }`}
                    >
                      {isSelected && <motion.div layoutId="active-bg" className="absolute inset-0 bg-gradient-to-b from-violet-50 to-fuchsia-50 opacity-50" />}
                      <div className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${isSelected ? `bg-gradient-to-br ${type.color} text-white shadow-lg ${type.shadow}` : "bg-white text-slate-400 shadow-sm"}`}>
                        <type.icon className="h-6 w-6" />
                      </div>
                      <div className="relative z-10">
                        <h4 className={`font-black text-base ${isSelected ? "text-slate-900" : "text-slate-700"}`}>{type.name}</h4>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <div className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Niveau de la classe</label>
                    <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all appearance-none">
                      <option>3AP</option>
                      <option>4AP</option>
                      <option>5AP</option>
                    </select>
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nombre de pages</label>
                    <select value={pageCount} onChange={(e) => setPageCount(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all appearance-none">
                      <option value="auto">Automatique</option>
                      <option value="1">1 page</option>
                      <option value="2">2 pages</option>
                      <option value="3">3 pages</option>
                      <option value="4">4 pages</option>
                    </select>
                  </div>

                  {selectedType === 'lesson' && (
                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">Type d&apos;activité</label>
                      <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all appearance-none">
                        <option value="Compréhension de l'oral">Compréhension de l&apos;oral</option>
                        <option value="Production de l'oral">Production de l&apos;oral</option>
                        <option value="Compréhension de l'écrit (Lecture)">Compréhension de l&apos;écrit (Lecture)</option>
                        <option value="Vocabulaire">Vocabulaire</option>
                        <option value="Grammaire">Grammaire</option>
                        <option value="Conjugaison">Conjugaison</option>
                        <option value="Orthographe">Orthographe</option>
                        <option value="Dictée">Dictée</option>
                        <option value="Production écrite">Production écrite</option>
                        <option value="Comptine / Chant">Comptine / Chant</option>
                        <option value="Tâche / Projet">Tâche / Projet</option>
                      </select>
                    </div>
                  )}

                  {selectedType === 'exam' && (
                    <>
                      <div className="space-y-2.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Type d&apos;évaluation</label>
                        <select value={examType} onChange={(e) => setExamType(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all appearance-none">
                          <option value="Devoir">Devoir</option>
                          <option value="Évaluation diagnostique">Évaluation diagnostique</option>
                          <option value="Composition">Composition</option>
                        </select>
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Période</label>
                        <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all appearance-none">
                          <option value="1er trimestre">1er trimestre</option>
                          <option value="2ème trimestre">2ème trimestre</option>
                          <option value="3ème trimestre">3ème trimestre</option>
                        </select>
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Difficulté</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all appearance-none">
                          <option value="Facile">Facile</option>
                          <option value="Intermédiaire">Intermédiaire</option>
                          <option value="Difficile">Difficile</option>
                        </select>
                      </div>
                    </>
                  )}

                  {selectedType === 'exercise' && (
                    <>
                      <div className="space-y-2.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Domaine</label>
                        <select value={exerciseType} onChange={(e) => setExerciseType(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all appearance-none">
                          <option value="Grammaire">Grammaire</option>
                          <option value="Conjugaison">Conjugaison</option>
                          <option value="Orthographe">Orthographe</option>
                          <option value="Vocabulaire">Vocabulaire</option>
                          <option value="Compréhension de l'écrit">Compréhension de l&apos;écrit</option>
                        </select>
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Nombre d&apos;exercices</label>
                        <select value={exerciseCount} onChange={(e) => setExerciseCount(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all appearance-none">
                          <option value="1">1 exercice</option>
                          <option value="2">2 exercices</option>
                          <option value="3">3 exercices</option>
                          <option value="4">4 exercices</option>
                          <option value="5">5 exercices</option>
                        </select>
                      </div>
                      <div className="space-y-2.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Difficulté</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all appearance-none">
                          <option value="Facile">Facile</option>
                          <option value="Intermédiaire">Intermédiaire</option>
                          <option value="Difficile">Difficile</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    {selectedType === 'lesson' ? "Sujet de la leçon" : selectedType === 'exercise' ? "Thème des exercices" : "Thème général (Optionnel)"}
                  </label>
                  <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={selectedType === 'exam' ? "ex: L'environnement, Les métiers..." : "ex: La Révolution Française"} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all" />
                </div>
              </div>
              
              {error && <p className="text-red-500 text-sm font-medium mt-4 text-center">{error}</p>}
              
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-8 relative group overflow-hidden rounded-2xl" onClick={handleGenerate} disabled={isGenerating}>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 transition-all duration-500 group-hover:scale-110" />
                <div className="relative flex items-center justify-center gap-2 px-6 py-5 text-white font-black text-xl">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                  Générer la fiche
                </div>
              </motion.button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STATE 2: LOADING */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="relative flex items-center justify-center w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-violet-500 to-fuchsia-500 mb-8 shadow-2xl shadow-fuchsia-500/30">
            <Wand2 className="h-16 w-16 text-white" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 text-center">Création en cours...</h2>
          <p className="text-lg text-slate-500 font-medium text-center max-w-md">
            L&apos;IA analyse le programme algérien et prépare les meilleures activités pour vos élèves.
          </p>
        </div>
      )}

      {/* STATE 3: RESULT */}
      {!isGenerating && generatedContent && (
        <div className={isFullscreen ? "fixed inset-0 z-50 bg-slate-800/90 backdrop-blur-md p-4 sm:p-8 overflow-y-auto print:p-0 print:bg-white print:static" : "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full"}>
          
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <button onClick={() => setGeneratedContent(null)} className="flex items-center gap-2 text-slate-600 hover:text-violet-600 font-bold transition-colors">
              <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Nouvelle fiche</span>
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={handleOpenSaveModal} className="flex items-center gap-2 bg-emerald-600 text-white px-3 sm:px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-bold text-sm shadow-md">
                <Save className="w-4 h-4" /> <span className="hidden sm:inline">Sauvegarder</span>
              </button>
              <button onClick={exportToPDF} className="flex items-center gap-2 bg-red-600 text-white px-3 sm:px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors font-bold text-sm shadow-md">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">Télécharger PDF</span>
              </button>
              <button onClick={exportToWord} className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm shadow-md">
                <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Télécharger Word</span>
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-violet-600 text-white px-3 sm:px-4 py-2.5 rounded-xl hover:bg-violet-700 transition-colors font-bold text-sm shadow-md">
                <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Imprimer</span>
              </button>
              <button onClick={() => setIsFullscreen(!isFullscreen)} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 sm:px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm">
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                <span className="hidden sm:inline">{isFullscreen ? "Réduire" : "Plein écran"}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative w-full">
            {isModifying && (
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
                <p className="text-lg font-bold text-slate-800">Application des modifications...</p>
              </div>
            )}
            <div id="printable-content" className="font-sans print:p-0 print:m-0 print:w-full print:overflow-visible w-full overflow-x-auto" dangerouslySetInnerHTML={{ __html: generatedContent }} />
          </div>

          {/* Modification Bar */}
          <div className="mt-8 bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200 print:hidden sticky bottom-4 z-40">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Améliorer ou modifier cette fiche
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={modificationPrompt}
                onChange={(e) => setModificationPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleModify()}
                placeholder="Ex: Raccourcis la durée, ajoute un exercice, simplifie la consigne..."
                className="flex-1 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
              <button
                onClick={handleModify}
                disabled={!modificationPrompt.trim() || isModifying}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-all active:scale-95 whitespace-nowrap"
              >
                {isModifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Appliquer
              </button>
            </div>
            {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
          </div>

        </div>
      )}

      {/* SAVE MODAL */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Save className="w-5 h-5 text-emerald-500" />
                  Sauvegarder
                </h3>
                <button onClick={() => setIsSaveModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                {saveSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Sauvegardé avec succès !</h4>
                    <p className="text-slate-500">Vous pouvez le retrouver dans votre bibliothèque.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Titre du document</label>
                      <input 
                        type="text" 
                        value={saveTitle} 
                        onChange={(e) => setSaveTitle(e.target.value)} 
                        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        placeholder="Ex: Leçon sur les synonymes..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Type</label>
                        <select value={saveType} onChange={(e) => setSaveType(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none">
                          <option value="Cours">Cours</option>
                          <option value="Exercice">Exercice</option>
                          <option value="Examen">Examen</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Classe</label>
                        <select value={saveClass} onChange={(e) => setSaveClass(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none">
                          <option value="3ème AP">3ème AP</option>
                          <option value="4ème AP">4ème AP</option>
                          <option value="5ème AP">5ème AP</option>
                          <option value="1ère AM">1ère AM</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Trimestre</label>
                      <select value={saveTerm} onChange={(e) => setSaveTerm(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none">
                        <option value="1er trimestre">1er trimestre</option>
                        <option value="2ème trimestre">2ème trimestre</option>
                        <option value="3ème trimestre">3ème trimestre</option>
                      </select>
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <button 
                      onClick={handleSaveToDatabase} 
                      disabled={isSaving || !saveTitle.trim()}
                      className="w-full mt-4 bg-emerald-600 text-white px-6 py-3.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 font-bold shadow-md transition-all active:scale-95"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Confirmer la sauvegarde
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
