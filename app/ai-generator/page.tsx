"use client"

import { useState } from "react"
import { Sparkles, FileText, PenTool, BookOpen, Loader2, Wand2, Star, Circle, Triangle, Zap, Lightbulb, Search, Eye, CheckCircle, Info, Target, Flag, Printer, Maximize, Minimize, Send, ArrowLeft, Download, Save, X, LayoutTemplate, MessageSquare, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GoogleGenAI } from "@google/genai"
import { db, auth } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"
import Link from "next/link"

const magicTools = [
  { id: "exam", name: "📝 Sujets de Composition (Trimestrielle)", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50", ring: "ring-indigo-500", description: "Créez des sujets de composition complets adaptés au programme algérien." },
  { id: "text", name: "📖 Textes de Lecture Sur-Mesure", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-500", description: "Générez des textes ciblant des sons spécifiques (graphie/phonie) pour vos élèves." },
  { id: "dictation", name: "✍️ Dictées Adaptées", icon: PenTool, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-500", description: "Obtenez instantanément des dictées adaptées au niveau exact de votre classe." },
  { id: "lesson", name: "📋 Fiches Pédagogiques Express", icon: LayoutTemplate, color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-500", description: "Structurez vos séances (déroulement, objectifs, matériel) en quelques secondes." },
]

export default function AIGeneratorPage() {
  const [selectedType, setSelectedType] = useState('lesson')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  
  // Nouveaux états UX (Étape 1 & 2)
  const [step, setStep] = useState<1 | 2>(1)
  
  // Paramètres du form (Système Algérien)
  const [classLevel, setClassLevel] = useState("3ème AP")
  const [term, setTerm] = useState("1er Trimestre")
  const [projet, setProjet] = useState("Projet 1")
  const [sequence, setSequence] = useState("Séquence 1")
  const [topic, setTopic] = useState("")
  const [isEcoMode, setIsEcoMode] = useState(false)

  // Gardés pour rétrocompatibilité
  const [activityType, setActivityType] = useState("Compréhension de l'oral")
  const [examType, setExamType] = useState("Devoir")
  const [exerciseType, setExerciseType] = useState("Grammaire")
  const [exerciseCount, setExerciseCount] = useState("3")
  const [difficulty, setDifficulty] = useState("Intermédiaire")
  const [pageCount, setPageCount] = useState("auto")
  
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
    setSaveType(selectedType === 'lesson' ? 'Cours' : selectedType === 'exam' ? 'Examen' : 'Exercice')
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
        imageUrl: generatedImage,
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
    // Topic is now optional, removing strict checks.
    setError("")
    setIsGenerating(true)
    setGeneratedContent(null)
    setGeneratedImage(null)

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      let paramsText = `- Niveau / Cycle : ${classLevel}\n`;
      paramsText += `- Période : ${term}\n`;
      paramsText += `- Progression : ${projet}\n`;
      paramsText += `- Séquence : ${sequence}\n`;

      if (selectedType === 'lesson') {
        paramsText += `- Type de document : Fiche de préparation de cours (pour l'enseignant)\n`;
      } else if (selectedType === 'text') {
        paramsText += `- Type de document : Texte de lecture (pour l'élève)\n`;
        paramsText += `- RÈGLE STRICTE SUR LE CONTENU : Tu dois générer UNIQUEMENT un titre (dans une balise <h1>) et le texte de lecture (dans une ou plusieurs balises <p>). IL EST STRICTEMENT INTERDIT de générer des questions de compréhension, du vocabulaire, ou des champs Nom/Prénom/Date. SEUL LE TEXTE PUR EST ATTENDU.\n`;
      } else if (selectedType === 'dictation') {
        paramsText += `- Type de document : Dictée prête à l'emploi (pour l'enseignant)\n`;
        paramsText += `- RÈGLE STRICTE SUR LE CONTENU : Limite-toi à la dictée pure sans longues informations superflues.\n`;
      } else if (selectedType === 'exam') {
        paramsText += `- Type de document : Sujet de composition / Évaluation (pour l'élève)\n`;
      }

      if (topic.trim()) {
        paramsText += `- Thème spécifique ou mots à inclure : ${topic}\n`;
      }

      if (isEcoMode) {
        paramsText += `- FORMAT SPÉCIAL : MODE ÉCONOMIQUE. Ne génère ABSOLUMENT AUCUN en-tête (pas d'école, pas de nom, prénom ou date). Tu ne dois générer QUE LE TEXTE BRUT directement (le texte de lecture, la liste de mots, ou le paragraphe central). Aucune mise en page A4, aucune classe 'a4-page', aucun style global CSS ou div englobante compliquée. Utilise très peu ou pas de style. Le résultat sera dupliqué dans une mise en page d'impression 4 par page, donne l'essentiel.\n`;
      }

      let styleInstructions = "";
      if (isEcoMode) {
        styleInstructions = `
RÈGLES VISUELLES ET FORMAT DE SORTIE :
- Format strict : Génère UNIQUEMENT du code HTML très simple avec des balises sémantiques (<h1>, <p>, <ul>).
- INTERDICTION D'UTILISER DES BALISES <style> ou du CSS intégré.
- N'inclus aucun en-tête (Nom, Prénom, Date). Ne mets pas de conteneur global du type <div class="a4-page">.
- Concentre-toi EXCLUSIVEMENT sur le contenu pur.`;
      } else {
        styleInstructions = `
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
table, tr, td, th { page-break-inside: avoid; break-inside: avoid; }`;
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

${styleInstructions}

Voici les paramètres du document à générer :
${paramsText}
`;

      const imagePromptText = `Course Theme: ${topic || selectedType}. Class level: ${classLevel}.
REQUIREMENTS:
- Style visuel : Playful 3D UI, bright and cheerful, highly inspired by Duolingo aesthetic, NOT too childish.
- Personnage : If a teacher is present, they MUST wear a white professional lab coat (like a doctor's coat), NEVER a cooking apron.
- Texte : DO NOT generate any text, words, or letters inside the image. Leave empty space.`;

      const [textResponse, imageResponse] = await Promise.all([
        ai.models.generateContent({
          model: "gemini-3.1-flash-lite-preview",
          contents: basePrompt,
          config: {
            maxOutputTokens: 8192,
          }
        }),
        ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: imagePromptText,
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        }).catch(err => {
          console.error("Erreur génération image:", err);
          return null;
        })
      ]);

      // Nettoyer la réponse au cas où l'IA ajouterait des balises markdown ```html
      let htmlContent = textResponse.text || "";
      htmlContent = htmlContent.replace(/```html/gi, "").replace(/```/gi, "").trim();

      setGeneratedContent(htmlContent);

      if (imageResponse && imageResponse.candidates && imageResponse.candidates.length > 0) {
        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
             const base64 = part.inlineData.data;
             setGeneratedImage(`data:image/jpeg;base64,${base64}`);
             break;
          }
        }
      }

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
      let styleInstructions = "";
      if (isEcoMode) {
        styleInstructions = `- FORMAT SPÉCIAL : MODE ÉCONOMIQUE. Génère UNIQUEMENT du code HTML très simple avec des balises sémantiques (<h1>, <p>, <ul>). N'utilise AUCUN CSS intégré ou balise <style>. Ne mets pas de conteneur global du type <div class="a4-page">.`;
      } else {
        styleInstructions = `- Conserve le style général (fiche algérienne) et conserve ABSOLUMENT le CSS lié au format A4 et à l'impression (@media print, .a4-page). Tu peux adapter la mise en page ou ajouter des éléments visuels si la modification le nécessite.`;
      }

      const prompt = `Tu es un Inspecteur de l'Éducation Nationale en Algérie.
      Voici une fiche pédagogique que tu as générée précédemment au format HTML :
      
      ${generatedContent}
      
      L'enseignant demande la modification suivante : "${modificationPrompt}"
      
      Mets à jour le code HTML en appliquant cette modification. 
      RÈGLES STRICTES :
      ${styleInstructions}
      - Renvoie UNIQUEMENT le code HTML complet mis à jour. Aucun texte brut avant ou après. Ne mets pas de balises markdown \`\`\`html.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt,
        config: {
          maxOutputTokens: 8192,
        }
      });

      let htmlContent = response.text || "";
      htmlContent = htmlContent.replace(/```html/gi, "").replace(/```/gi, "").trim();

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
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
              /* On force le conteneur à faire la taille d'une page A4 exacte */
              body { margin: 0; padding: 0; background: white; width: 210mm; min-height: 297mm; }
              #content-to-print { width: 210mm; height: 297mm; overflow: hidden; }
              /* On efface les ombres pour le PDF */
              * { box-shadow: none !important; }
            </style>
          </head>
          <body>
            <div id="content-to-print">
              ${document.getElementById('printable-wrapper')?.outerHTML || generatedContent}
            </div>
            <script>
              window.onload = function() {
                // Petit délai pour laisser Tailwind CDN appliquer les classes
                setTimeout(() => {
                  const element = document.getElementById('content-to-print');
                  const opt = {
                    margin:       0,
                    filename:     '${selectedType === 'lesson' ? 'Fiche_de_cours' : selectedType === 'exam' ? 'Examen' : 'Document'}.pdf',
                    image:        { type: 'jpeg', quality: 1 },
                    html2canvas:  { scale: 2, useCORS: true, logging: false },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                  };
                  html2pdf().set(opt).from(element).save().then(() => {
                    window.parent.postMessage('pdf-done', '*');
                  }).catch(err => {
                    window.parent.postMessage('pdf-error:' + err.message, '*');
                  });
                }, 800);
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
    fileDownload.download = `${selectedType === 'lesson' ? 'Fiche_de_cours' : selectedType === 'exam' ? 'Examen' : 'Document'}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

  return (
    <div className="min-h-screen pb-24 print:pb-0 print:bg-white">
      {/* STATE 1 & 2: HUB AND CONFIGURATOR */}
      {!isGenerating && !generatedContent && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
          
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
              {/* Nouveau En-tête Premium */}
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Assistant Pédagogique IA ✨
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-500 font-medium">
                  Le compagnon intelligent des enseignants algériens. Que voulez-vous créer aujourd&apos;hui ?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {magicTools.map((tool) => {
                  return (
                    <motion.div
                      key={tool.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedType(tool.id)
                        setStep(2)
                      }}
                      className="cursor-pointer transition-transform shadow-sm border border-slate-100 hover:shadow-md rounded-2xl p-6 bg-white flex items-start gap-4"
                    >
                      <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${tool.bg} ${tool.color}`}>
                        <tool.icon className="w-7 h-7" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg text-slate-800">
                          {tool.name}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="flex justify-center pt-4">
                <Link 
                  href="/ai-generator/chat" 
                  className="flex items-center gap-3 px-8 py-4 bg-slate-100/80 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all hover:scale-105"
                >
                  <MessageSquare className="w-5 h-5 text-slate-500" />
                  💬 Démarrer une conversation libre avec l&apos;assistant
                </Link>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto space-y-8">
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux outils
              </button>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${magicTools.find(t => t.id === selectedType)?.bg} ${magicTools.find(t => t.id === selectedType)?.color}`}>
                    {(() => {
                      const Icon = magicTools.find(t => t.id === selectedType)?.icon || Sparkles
                      return <Icon className="w-6 h-6" />
                    })()}
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 line-clamp-1">
                    {magicTools.find(t => t.id === selectedType)?.name.replace(/📝 |📖 |✍️ |📋 /g, '')}
                  </h2>
                </div>

                <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">Cycle & Niveau</label>
                      <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 cursor-pointer text-slate-700">
                        <option>3ème AP</option>
                        <option>4ème AP</option>
                        <option>5ème AP</option>
                        <option>1ère AM</option>
                        <option>2ème AM</option>
                        <option>3ème AM</option>
                        <option>4ème AM</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">Période</label>
                      <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 cursor-pointer text-slate-700">
                        <option>1er Trimestre</option>
                        <option>2ème Trimestre</option>
                        <option>3ème Trimestre</option>
                      </select>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">Progression</label>
                      <select value={projet} onChange={(e) => setProjet(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 cursor-pointer text-slate-700">
                        <option>Projet 1</option>
                        <option>Projet 2</option>
                        <option>Projet 3</option>
                      </select>
                    </div>

                    <div className="space-y-2.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">Séquence</label>
                      <select value={sequence} onChange={(e) => setSequence(e.target.value)} className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 cursor-pointer text-slate-700">
                        <option>Séquence 1</option>
                        <option>Séquence 2</option>
                        <option>Séquence 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Thème spécifique ou mots à inclure (Optionnel)</label>
                    <textarea 
                      value={topic} 
                      onChange={(e) => setTopic(e.target.value)} 
                      placeholder="ex: La famille, les animaux de la ferme..." 
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-medium focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 h-24 resize-none text-slate-700 disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col gap-4">
                  <label className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded" checked={isEcoMode} onChange={(e) => setIsEcoMode(e.target.checked)} />
                    <span>✂️ Mode Économique : Imprimer en 4 exemplaires par page (Prêt à découper)</span>
                  </label>
                </div>

                {error && <p className="text-red-500 text-sm font-medium mt-4 text-center">{error}</p>}
                
                <motion.button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-xl rounded-2xl shadow-lg ring-1 ring-black/10 transition-all disabled:opacity-50"
                >
                  <Sparkles className="h-6 w-6 text-amber-300" />
                  ✨ Générer le contenu avec l&apos;IA
                </motion.button>

              </div>
            </motion.div>
          )}

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
          <div className="relative w-full flex flex-col gap-6">
            
            {/* Affiche de cours générée par l'IA */}
            {generatedImage && !isEcoMode && (
              <div className="w-full h-48 sm:h-64 md:h-80 relative rounded-2xl overflow-hidden shadow-md border border-slate-200 print:hidden shrink-0 mt-2">
                <img 
                  src={generatedImage} 
                  alt="Affiche du cours" 
                  className="object-cover w-full h-full rounded-2xl"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl">
                  <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md tracking-tight">
                    {topic || magicTools.find(t => t.id === selectedType)?.name.replace(/📝 |📖 |✍️ |📋 /g, '')}
                  </h2>
                  <p className="text-white/90 font-medium mt-1 drop-shadow-sm">
                    {classLevel} • {term}
                  </p>
                </div>
              </div>
            )}

            {isModifying && (
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
                <p className="text-lg font-bold text-slate-800">Application des modifications...</p>
              </div>
            )}
            
            {isEcoMode && generatedContent && generatedContent.length > 600 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 print:hidden shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-amber-800 text-sm leading-relaxed">
                  <p className="font-semibold mb-1">Attention : Ce texte est assez long.</p>
                  <p>En &quot;Mode Éco&quot; (4 par page), il risque de déborder et d&apos;être coupé lors de l&apos;impression. Nous vous conseillons de demander à l&apos;assistant de le <strong>&quot;raccourcir&quot;</strong>, ou d&apos;imprimer en mode normal.</p>
                </div>
              </div>
            )}

            {isEcoMode ? (
              <div className="flex justify-center print:bg-white print:p-0">
                <div id="printable-wrapper" className="grid grid-cols-2 grid-rows-2 w-full max-w-[210mm] mx-auto min-h-[297mm] bg-white border border-slate-200 print:w-[210mm] print:h-[297mm] print:border-none print:m-0">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-[1.5px] border-dashed border-slate-400 p-6 md:p-8 flex flex-col justify-center">
                      <div className="font-sans [&_h1]:text-lg [&_h1]:md:text-xl [&_h1]:font-bold [&_h1]:text-center [&_h1]:text-indigo-950 [&_h1]:mb-3 [&_h1]:md:mb-4 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-slate-800 [&_p]:text-justify [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-indigo-900 [&_h2]:mt-4 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mt-2 [&_ul]:space-y-1 [&_ul]:text-base [&_ul]:text-slate-800 [&_li]:leading-normal" dangerouslySetInnerHTML={{ __html: generatedContent }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center print:bg-white print:p-0">
                <div id="printable-wrapper" className="font-sans bg-white p-10 md:p-16 max-w-3xl w-full mx-auto shadow-sm rounded-xl print:shadow-none print:p-0 print:m-0 print:w-full print:overflow-visible overflow-x-auto [&_h1]:text-xl [&_h1]:md:text-2xl [&_h1]:font-bold [&_h1]:text-center [&_h1]:text-indigo-950 [&_h1]:mb-4 [&_h1]:md:mb-6 [&_p]:text-lg [&_p]:md:text-xl [&_p]:leading-loose [&_p]:text-slate-800 [&_p]:text-justify [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-indigo-900 [&_h2]:mt-6 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:text-lg [&_ul]:md:text-xl [&_ul]:text-slate-800 [&_li]:leading-loose">
                  <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-8 print:hidden">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-900 transition-colors font-bold shadow-md">
              <Printer className="w-5 h-5" /> 🖨️ Lancer l&apos;impression
            </button>
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
