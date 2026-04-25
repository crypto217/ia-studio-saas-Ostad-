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
  const [grammarRule, setGrammarRule] = useState("")
  const [isEcoMode, setIsEcoMode] = useState(false)

  // Gardés pour rétrocompatibilité
  const [courseType, setCourseType] = useState("Grammaire")
  const [courseName, setCourseName] = useState("")
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
      if (selectedType !== 'dictation') {
        paramsText += `- Période : ${term}\n`;
      }
      if (selectedType === 'lesson' || selectedType === 'text') {
        paramsText += `- Progression : ${projet}\n`;
        paramsText += `- Séquence : ${sequence}\n`;
      }

      if (selectedType === 'lesson') {
        paramsText += `- Matière/Domaine visé : ${courseType}\n`;
        if (courseName) {
          paramsText += `- Titre exact du cours : ${courseName}\n`;
        }
        paramsText += `- Type de document : Fiche de préparation de cours (pour l'enseignant)\n`;
      } else if (selectedType === 'text') {
        paramsText += `- Type de document : Texte de lecture (pour l'élève)\n`;
        paramsText += `- RÈGLE STRICTE SUR LE CONTENU : Tu dois générer UNIQUEMENT un titre (dans une balise <h1>) et le texte de lecture (dans une ou plusieurs balises <p>). IL EST STRICTEMENT INTERDIT de générer des questions de compréhension, du vocabulaire, ou des champs Nom/Prénom/Date. SEUL LE TEXTE PUR EST ATTENDU.\n`;
      } else if (selectedType === 'dictation') {
        paramsText += `- Type de document : Dictée prête à l'emploi (pour l'enseignant)\n`;
        paramsText += `- RÈGLE STRICTE SUR LE CONTENU : Limite-toi à la dictée pure sans longues informations superflues.\n`;
      } else if (selectedType === 'exam') {
        paramsText += `- Type de document : Sujet de composition / Évaluation (pour l'élève)\n`;
        paramsText += `- Niveau de difficulté : ${difficulty}\n`;
      }

      if (topic.trim()) {
        if (selectedType === 'exam') {
          paramsText += `- Instructions / Suggestions générales : ${topic}\n`;
        } else {
          paramsText += `- Thème spécifique ou mots à inclure : ${topic}\n`;
        }
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
Tu dois générer un code HTML complet qui reproduit EXACTEMENT la mise en page standard, professionnelle et dense des fiches de préparation algériennes.
- Format strict : Génère UNIQUEMENT du code HTML avec le CSS intégré dans une balise <style>. Aucun texte brut en dehors. Ne mets pas de balises markdown autour de ta réponse.
- PAGINATION OBLIGATOIRE : Tu dois tout faire tenir dans UNE SEULE ET UNIQUE \`<div class="a4-page">\`.
- STYLE DENSE ET COMPACT : Utilise la police Arial ou Times New Roman en petite taille (12px - 14px maximum). Réduis les marges et les paddings au minimum pour que tout rentre sur la page sans gaspiller d'espace.
- EN-TÊTE HORIZONTALE : Utilise une <div class="header-grid"> pour l'en-tête principal de la fiche (Niveau, Projet, Séquence, etc.). Présente-les sous forme de couples (label/valeur).
- TABLEAUX RESPONSIVE : Si tu génères un tableau, tu DOIS obligatoirement l'englober dans une <div class="table-container"> et lui donner la classe <table class="fiche-table">.
- COULEURS ET STRUCTURE (TRÈS IMPORTANT) :
  1. Titre principal : En Bleu (ou Bleu foncé), centré avec une taille correcte.
  2. En-tête de la fiche (Cours, Projet, Séquence, etc.) : Présente ça sous forme de texte avec les étiquettes en Rouge et soulignées ("Cours :", "Durée :", "Objectifs :"), suivies immédiatement des valeurs en texte normal noir, le tout bien aligné avec des petits espaces.
  3. Grandes étapes de la leçon (Ex: "I. Moment de découverte", "II. Moment d'application") : DOIVENT être en Rouge (ou Vert), en gras, soulignées et sans trop d'espacement avec les paragraphes suivants.
  4. Interactions prof/élève : Formate les listes avec de simples tirets (-), pas de gros ronds noirs épais.
  5. Réponses attendues ou éléments clés : Mets-les dans un vert clair, cyan ou bleu turquoise (ex: couleur #0284c7 ou #0d9488) pour imiter l'écriture au stylo.
  6. Tableaux et Boîtes : Utilise des cadres simples (bordures fines, sans fond criard). Les tableaux d'évolution (Niveaux de râtise) doivent être compacts.

Voici la base CSS modifiée et optimisée pour ce style professionnel dense :
@media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .a4-page { margin: 0; border: none; box-shadow: none; page-break-after: auto; } }
.a4-page { font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.3; color: black; background: white; width: 210mm; min-height: 297mm; padding: 15mm; margin: 0 auto; position: relative; box-sizing: border-box; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); page-break-after: auto; }
@media screen and (max-width: 794px) { .a4-page { width: 100%; min-height: auto; padding: 15px; margin-bottom: 15px; } }
.main-title { text-align: center; color: #1e40af; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
.header-container { display: flex; flex-direction: column; gap: 2px; margin-bottom: 10px; font-size: 13px; }
.flex-line { display: flex; gap: 15px; flex-wrap: wrap; }
.label { color: #dc2626; font-weight: bold; text-decoration: underline; margin-right: 4px; }
.value { color: black; font-weight: normal; }
.section-title { color: #dc2626; font-size: 14px; font-weight: bold; text-decoration: underline; margin: 12px 0 4px 0; }
.sub-title { color: #16a34a; font-size: 13px; font-weight: bold; text-decoration: underline; margin: 8px 0 4px 0; display: block; }
.answer { color: #0891b2; font-style: italic; }
.consigne-box { border: 1.5px solid #0891b2; padding: 6px; margin: 8px 0; text-align: center; font-weight: normal; border-radius: 4px; page-break-inside: avoid; }
.boite-mots { display: flex; gap: 6px; justify-content: center; margin: 6px 0; flex-wrap: wrap; }
.mot { padding: 3px 12px; border: 1px solid #cbd5e1; border-radius: 3px; color: black; background-color: #f8fafc; font-size: 12px; }
.mot:nth-child(even) { background-color: #f1f5f9; }
.application-box { border: 1px dashed #64748b; padding: 10px; margin-top: 8px; border-radius: 4px; background-color: white; page-break-inside: avoid; }
ul, ol { margin: 4px 0; padding-left: 15px; list-style-type: none; }
li { margin-bottom: 2px; position: relative; }
li::before { content: "-"; position: absolute; left: -10px; color: #333; }
p { margin: 2px 0; }
.header-grid { display: grid; grid-template-columns: 1fr; gap: 8px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px; margin-bottom: 12px; }
@media (min-width: 768px) { .header-grid { grid-template-columns: 1fr 1fr; } }
.table-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 10px 0; border: 1px solid #e2e8f0; border-radius: 4px; }
.fiche-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 15px; font-size: 13px; word-wrap: break-word; }
.fiche-table th, .fiche-table td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; overflow-wrap: break-word; }
.fiche-table th:nth-child(1), .fiche-table td:nth-child(1) { width: 15%; }
.fiche-table th:nth-child(2), .fiche-table td:nth-child(2) { width: 40%; }
.fiche-table th:nth-child(3), .fiche-table td:nth-child(3) { width: 35%; }
.fiche-table th:nth-child(4), .fiche-table td:nth-child(4) { width: 10%; text-align: center; }
.fiche-table th { background-color: #f8fafc; font-weight: bold; }`;
      }

      let finalPrompt = "";
      let targetModel = "gemini-3.1-pro-preview";

      if (selectedType === 'dictation') {
        finalPrompt = `Tu es un inspecteur de l'éducation nationale en Algérie. Rédige un texte de dictée très court (3 à 4 phrases maximum) pour des élèves de primaire. 
Niveau : ${classLevel}
Thème : ${topic}
Règle de grammaire/conjugaison à évaluer : ${grammarRule}
Consignes : Le vocabulaire doit être simple, adapté au contexte algérien, et sans aucun jargon complexe. Mets en évidence (en Markdown gras) les mots liés à la règle demandée.

FORMAT DE SORTIE :
Génère le texte final dans une balise <div> avec de simples paragraphes <p>. Le texte mis en évidence doit utiliser la balise HTML <strong> au lieu de Markdown. N'ajoute pas de CSS externe ni de balise <style>. Ne mets pas de balises markdown englobantes (\`\`\`html).
`;
        targetModel = "gemini-3.1-flash-lite-preview";
      } else {
        finalPrompt = `Tu es un Inspecteur de l'Éducation Nationale en Algérie et un expert en conception pédagogique. Tu maîtrises parfaitement les programmes officiels du Ministère de l'Éducation Nationale algérien pour le cycle Primaire (AP).

MISSION :
Ta mission est d'assister les enseignants algériens en générant du contenu pédagogique sur mesure. Ton contenu doit respecter rigoureusement l'Approche Par Compétences (APC), les progressions annuelles officielles, et s'adapter au contexte culturel et scolaire algérien.
Génère le contenu en français.

RÈGLES DE CONTENU (Ciblage Enseignant Algérien) :
- Vocabulaire précis : Utilise le jargon officiel algérien.
- Contextualisation : Les exemples, les prénoms et les situations doivent refléter l'environnement algérien.
- Adaptation au niveau : Ajuste la complexité selon le palier (3AP, 4AP, 5AP).
- CONCISION STRICTE : Va à l'essentiel. Ne génère que les phases principales de la leçon de manière très synthétique (sous forme de tirets ou tableaux courts). L'enseignant n'a besoin que du squelette du cours.
- AUCUNE IMAGE : Ne génère aucun espace réservé pour des images (comme [Image 1], [Image 2]). Génère uniquement du texte utile.

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
      }

      const imagePromptText = `Course Theme: ${topic || selectedType}. Class level: ${classLevel}.
REQUIREMENTS:
- Style visuel : Playful 3D UI, bright and cheerful, highly inspired by Duolingo aesthetic, NOT too childish.
- Personnage : If a teacher is present, they MUST wear a white professional lab coat (like a doctor's coat), NEVER a cooking apron.
- Texte : DO NOT generate any text, words, or letters inside the image. Leave empty space.`;

      const [textResponse, imageResponse] = await Promise.all([
        ai.models.generateContent({
          model: targetModel,
          contents: finalPrompt,
        }),
        ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: imagePromptText,
          config: {
            imageConfig: {
              aspectRatio: "16:9",
              imageSize: "1K"
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

      // Convertir le markdown gras en HTML fort 
      htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      setGeneratedContent(htmlContent);

      if (imageResponse && imageResponse.candidates && imageResponse.candidates.length > 0) {
        const parts = imageResponse.candidates[0].content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
             const base64 = part.inlineData.data;
             setGeneratedImage(`data:image/jpeg;base64,${base64}`);
             break;
          }
        }
      }

    } catch (err: any) {
      if (err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED") || err?.message?.includes("exceeded your current quota")) {
        console.warn("Gemini Rate Limit (429) hit.");
        setError("Limite d'utilisation de l'intelligence artificielle atteinte. Veuillez patienter un peu avant de réessayer.");
      } else {
        console.error(err);
        setError(`Une erreur s'est produite: ${err?.message || "Erreur inconnue"}. Veuillez réessayer.`);
      }
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
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      let htmlContent = response.text || "";
      htmlContent = htmlContent.replace(/```html/gi, "").replace(/```/gi, "").trim();

      setGeneratedContent(htmlContent);
      setModificationPrompt("");
    } catch (err: any) {
      if (err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED") || err?.message?.includes("exceeded your current quota")) {
        console.warn("Gemini Rate Limit (429) hit during modification.");
        setError("Limite d'utilisation de l'intelligence artificielle atteinte. Veuillez patienter un peu avant de réessayer.");
      } else {
        console.error(err);
        setError(`Une erreur s'est produite lors de la modification: ${err?.message || "Erreur inconnue"}`);
      }
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
              body, html { margin: 0; padding: 0; background: white; width: 210mm; height: auto; }
              #content-to-print { width: 210mm; height: auto; overflow: visible; }
              /* On efface les contraintes de hauteur qui forcent des pages vides et on auto-ajuste les sauts de page */
              .a4-page { min-height: auto !important; height: auto !important; page-break-after: auto !important; }
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
                    html2canvas:  { scale: 2, useCORS: true, logging: false, letterRendering: true, windowWidth: 794 },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                    pagebreak:    { mode: ['css', 'legacy'], avoid: ['p', 'h1', 'h2', 'h3', 'h4', 'li', 'tr', 'table', '.consigne-box', '.application-box', '.mot'] }
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
    <div className="min-h-screen pb-24 print:pb-0 print:bg-slate-50">
      {/* STATE 1 & 2: HUB AND CONFIGURATOR */}
      {!isGenerating && !generatedContent && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 space-y-8 sm:space-y-12">
          
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 sm:space-y-12">
              {/* Nouveau En-tête Premium */}
              <div className="text-left sm:text-center space-y-2 sm:space-y-4 max-w-3xl mx-auto px-1 sm:px-0">
                <h1 className="text-[2rem] leading-tight sm:text-5xl md:text-6xl font-black tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Assistant Pédagogique IA ✨
                  </span>
                </h1>
                <p className="text-sm sm:text-xl text-slate-500 font-medium">
                  Le compagnon intelligent des enseignants algériens. Que voulez-vous créer aujourd&apos;hui ?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-8">
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
                      className="cursor-pointer transition-transform shadow-sm border border-slate-100 hover:shadow-md rounded-2xl md:rounded-[2rem] p-4 sm:p-6 bg-white flex items-center sm:items-start gap-4"
                    >
                      <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center ${tool.bg} ${tool.color}`}>
                        <tool.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div className="space-y-0.5 sm:space-y-2 flex-1">
                        <h3 className="font-bold text-base sm:text-lg text-slate-800 line-clamp-1">
                          {tool.name}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed sm:line-clamp-none line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                      <div className="sm:hidden text-slate-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="flex justify-center pt-2 sm:pt-4">
                <Link 
                  href="/ai-generator/chat" 
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all hover:scale-105"
                >
                  <MessageSquare className="w-5 h-5 text-slate-500" />
                  <span className="truncate">Démarrer une conversation libre</span>
                </Link>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto space-y-4 sm:space-y-8">
              
              <div className="flex items-center justify-between sm:justify-start px-2 sm:px-0">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white sm:bg-transparent px-4 py-2 sm:p-0 rounded-full shadow-sm sm:shadow-none border sm:border-transparent border-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Retour aux outils</span>
                  <span className="sm:hidden">Retour</span>
                </button>
                <div className="sm:hidden flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{magicTools.find(t => t.id === selectedType)?.name.replace(/📝 |📖 |✍️ |📋 /g, '')}</span>
                </div>
              </div>

              {/* Edge-to-edge style on mobile, rounded container on desktop */}
              <div className="bg-white px-4 sm:rounded-[2rem] sm:px-8 sm:py-8 sm:border sm:border-slate-200 sm:shadow-sm overflow-hidden py-5 -mx-4 sm:mx-0">
                <div className="hidden sm:flex items-center gap-4 mb-8">
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

                <div className="space-y-4 sm:space-y-6 sm:bg-slate-50/50 p-0 sm:p-6 rounded-2xl sm:border border-slate-100">
                  <div className="grid grid-cols-2 gap-3 sm:gap-5">
                    <div className="space-y-1.5 sm:space-y-2.5 col-span-2 sm:col-span-1">
                      <label className="text-xs sm:text-sm font-bold text-slate-700 sm:ml-1">Cycle & Niveau</label>
                      <select value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className="w-full rounded-xl sm:rounded-2xl border sm:border-2 border-slate-200 bg-slate-50 sm:bg-white px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-semibold sm:font-medium focus:border-violet-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-violet-500/10 cursor-pointer text-slate-800 transition-all">
                        <option>3ème AP</option>
                        <option>4ème AP</option>
                        <option>5ème AP</option>
                        <option>1ère AM</option>
                        <option>2ème AM</option>
                        <option>3ème AM</option>
                        <option>4ème AM</option>
                      </select>
                    </div>
                    
                    {selectedType !== 'dictation' && (
                      <>
                        <div className="space-y-1.5 sm:space-y-2.5 col-span-2 sm:col-span-1">
                          <label className="text-xs sm:text-sm font-bold text-slate-700 sm:ml-1">Période</label>
                          <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full rounded-xl sm:rounded-2xl border sm:border-2 border-slate-200 bg-slate-50 sm:bg-white px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-semibold sm:font-medium focus:border-violet-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-violet-500/10 cursor-pointer text-slate-800 transition-all">
                            <option>1er Trimestre</option>
                            <option>2ème Trimestre</option>
                            <option>3ème Trimestre</option>
                          </select>
                        </div>

                        {(selectedType === 'lesson' || selectedType === 'text') && (
                          <>
                            <div className="space-y-1.5 sm:space-y-2.5">
                              <label className="text-xs sm:text-sm font-bold text-slate-700 sm:ml-1">Progression</label>
                              <select value={projet} onChange={(e) => setProjet(e.target.value)} className="w-full rounded-xl sm:rounded-2xl border sm:border-2 border-slate-200 bg-slate-50 sm:bg-white px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-semibold sm:font-medium focus:border-violet-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-violet-500/10 cursor-pointer text-slate-800 transition-all">
                                <option>Projet 1</option>
                                <option>Projet 2</option>
                                <option>Projet 3</option>
                              </select>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2.5">
                              <label className="text-xs sm:text-sm font-bold text-slate-700 sm:ml-1">Séquence</label>
                              <select value={sequence} onChange={(e) => setSequence(e.target.value)} className="w-full rounded-xl sm:rounded-2xl border sm:border-2 border-slate-200 bg-slate-50 sm:bg-white px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-semibold sm:font-medium focus:border-violet-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-violet-500/10 cursor-pointer text-slate-800 transition-all">
                                <option>Séquence 1</option>
                                <option>Séquence 2</option>
                                <option>Séquence 3</option>
                              </select>
                            </div>
                          </>
                        )}
                        
                        {selectedType === 'exam' && (
                          <div className="space-y-1.5 sm:space-y-2.5 col-span-2 sm:col-span-1">
                            <label className="text-xs sm:text-sm font-bold text-slate-700 sm:ml-1">Difficulté du sujet</label>
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-xl sm:rounded-2xl border sm:border-2 border-slate-200 bg-slate-50 sm:bg-white px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-semibold sm:font-medium focus:border-violet-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-violet-500/10 cursor-pointer text-slate-800 transition-all">
                              <option>Facile</option>
                              <option>Intermédiaire</option>
                              <option>Difficile</option>
                            </select>
                          </div>
                        )}
                        
                        {selectedType === 'lesson' && (
                          <>
                            <div className="space-y-1.5 sm:space-y-2.5 col-span-2 sm:col-span-1">
                              <label className="text-xs sm:text-sm font-bold text-slate-700 sm:ml-1">Domaine / Matière</label>
                              <select value={courseType} onChange={(e) => setCourseType(e.target.value)} className="w-full rounded-xl sm:rounded-2xl border sm:border-2 border-slate-200 bg-slate-50 sm:bg-white px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-semibold sm:font-medium focus:border-violet-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-violet-500/10 cursor-pointer text-slate-800 transition-all">
                                <option>Grammaire</option>
                                <option>Conjugaison</option>
                                <option>Orthographe</option>
                                <option>Vocabulaire</option>
                                <option>Compréhension de l&apos;écrit</option>
                                <option>Production écrite</option>
                                <option>Compréhension de l&apos;oral</option>
                                <option>Production orale</option>
                              </select>
                            </div>
                            <div className="space-y-1.5 sm:space-y-2.5 col-span-2 sm:col-span-1">
                              <label className="text-xs sm:text-sm font-bold text-slate-700 sm:ml-1">Titre du cours (Optionnel)</label>
                              <input 
                                type="text"
                                value={courseName} 
                                onChange={(e) => setCourseName(e.target.value)} 
                                placeholder="Ex: Le pluriel en -s" 
                                className="w-full rounded-xl sm:rounded-2xl border sm:border-2 border-slate-200 bg-slate-50 sm:bg-white px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-semibold sm:font-medium focus:border-violet-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-violet-500/10 text-slate-800 transition-all"
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 sm:ml-1">
                      {selectedType === 'exam' ? 'Suggestion ou instruction pour l\'IA' : 'Thème ou mots clés'} <span className="text-slate-400 font-normal">(Optionnel)</span>
                    </label>
                    <textarea 
                      value={topic} 
                      onChange={(e) => setTopic(e.target.value)} 
                      placeholder={selectedType === 'exam' ? 'ex: Un texte sur la nature avec 2 questions de grammaire...' : 'ex: La famille, les animaux de la ferme...'} 
                      className="w-full rounded-xl sm:rounded-2xl border sm:border-2 border-slate-200 bg-slate-50 sm:bg-white px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-semibold sm:font-medium focus:border-violet-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-violet-500/10 h-20 sm:h-24 resize-none text-slate-800 disabled:opacity-50 transition-all"
                    />
                  </div>

                  {selectedType === 'dictation' && (
                    <div className="space-y-1.5 sm:space-y-2.5">
                      <label className="text-xs sm:text-sm font-bold text-slate-700 sm:ml-1">Règle de grammaire/conjugaison à évaluer</label>
                      <input 
                        type="text"
                        value={grammarRule} 
                        onChange={(e) => setGrammarRule(e.target.value)} 
                        placeholder="Ex: pluriel en -s, verbes du 1er groupe au présent..." 
                        className="w-full rounded-xl sm:rounded-2xl border sm:border-2 border-slate-200 bg-slate-50 sm:bg-white px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-semibold sm:font-medium focus:border-violet-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-violet-500/10 text-slate-800 transition-all"
                      />
                    </div>
                  )}
                </div>
                
                {selectedType === 'text' && (
                  <div className="mt-5 sm:mt-6 flex flex-col gap-4">
                    <label className="relative flex items-center p-4 sm:p-4 rounded-xl sm:rounded-lg border sm:border-slate-200 bg-amber-50/50 sm:bg-slate-50 cursor-pointer border-amber-200/50">
                      <div className="flex items-center h-5">
                        <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" checked={isEcoMode} onChange={(e) => setIsEcoMode(e.target.checked)} />
                      </div>
                      <div className="ml-3 text-xs sm:text-sm leading-tight text-slate-700 flex-1">
                        <span className="font-bold text-slate-800 block sm:inline">Mode Économique ✂️</span>
                        <span className="block text-slate-500 mt-1 sm:ml-1 sm:mt-0 sm:inline">Imprimer 4 exemplaires par page</span>
                      </div>
                    </label>
                  </div>
                )}

                {error && <p className="text-red-500 text-sm font-medium mt-4 text-center pb-2">{error}</p>}
                
                <motion.button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  className="w-full mt-6 sm:mt-8 flex items-center justify-center gap-2 px-6 py-4 sm:py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-lg sm:text-xl rounded-2xl shadow-lg ring-1 ring-black/10 transition-all disabled:opacity-50 active:scale-95"
                >
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-300" />
                  <span className="truncate">Générer le contenu</span>
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
              <button onClick={handleOpenSaveModal} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-full sm:rounded-3xl hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 font-bold text-sm shadow-sm">
                <Save className="w-5 h-5" /> <span className="hidden sm:inline">Sauvegarder</span>
              </button>
              <button onClick={exportToPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-full sm:rounded-3xl hover:bg-red-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 font-bold text-sm shadow-sm">
                <Download className="w-5 h-5" /> <span className="hidden sm:inline">Télécharger PDF</span>
              </button>
              <button onClick={exportToWord} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full sm:rounded-3xl hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 font-bold text-sm shadow-sm">
                <FileText className="w-5 h-5" /> <span className="hidden sm:inline">Télécharger Word</span>
              </button>
              <button onClick={() => setIsFullscreen(!isFullscreen)} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-3 rounded-full sm:rounded-3xl hover:bg-slate-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-bold text-sm">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                <span className="hidden sm:inline">{isFullscreen ? "Réduire" : "Plein écran"}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative w-full flex flex-col gap-6">
            
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
              <div className="flex justify-center print:bg-white print:p-0 overflow-hidden">
                <div id="printable-wrapper" className="grid grid-cols-2 grid-rows-2 w-full max-w-[210mm] mx-auto min-h-[297mm] bg-white border border-slate-200 print:w-[210mm] print:h-[297mm] print:border-none print:m-0">
                  <style>{`
                    .fiche-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 15px; font-size: 13px; word-wrap: break-word; }
                    .fiche-table th, .fiche-table td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; overflow-wrap: break-word; }
                    .fiche-table th:nth-child(1), .fiche-table td:nth-child(1) { width: 15%; }
                    .fiche-table th:nth-child(2), .fiche-table td:nth-child(2) { width: 40%; }
                    .fiche-table th:nth-child(3), .fiche-table td:nth-child(3) { width: 35%; }
                    .fiche-table th:nth-child(4), .fiche-table td:nth-child(4) { width: 10%; text-align: center; }
                    .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border: 2px solid #000; padding: 10px; margin-bottom: 15px; font-size: 14px; }
                    @media (max-width: 768px) { .header-grid { grid-template-columns: 1fr; } }
                  `}</style>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-[1.5px] border-dashed border-slate-400 p-6 md:p-8 flex flex-col justify-center overflow-hidden">
                      <div className="font-sans w-full max-w-full overflow-hidden [&_*]:!max-w-full [&_*]:!box-border [&_*]:![overflow-wrap:anywhere] [&_*]:![word-break:break-word] [&_img]:!max-w-full [&_img]:!w-full [&_img]:!h-auto [&_video]:!max-w-full [&_video]:!w-full [&_video]:!h-auto [&_iframe]:!max-w-full [&_iframe]:!w-full [&_iframe]:!h-auto [&_table]:!block [&_table]:!max-w-full [&_table]:!overflow-x-auto [&_h1]:text-lg [&_h1]:md:text-xl [&_h1]:font-bold [&_h1]:text-center [&_h1]:text-indigo-950 [&_h1]:mb-3 [&_h1]:md:mb-4 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-slate-800 [&_p]:text-justify [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-indigo-900 [&_h2]:mt-4 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mt-2 [&_ul]:space-y-1 [&_ul]:text-base [&_ul]:text-slate-800 [&_li]:leading-normal" dangerouslySetInnerHTML={{ __html: generatedContent }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center print:bg-white print:p-0 w-full overflow-hidden">
                {/* On force une largeur A4 fixe mais on scale sur mobile pour éviter les débordements (Container Queries ou scale) */}
                <div 
                  id="printable-wrapper" 
                  className="font-sans bg-white w-full sm:w-[210mm] max-w-full shrink-0 mx-auto shadow-sm md:rounded-xl overflow-hidden print:shadow-none print:m-0 print:w-full origin-top transform-gpu @container transition-transform"
                >
                  <style>{`
                    .fiche-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 15px; font-size: 13px; word-wrap: break-word; }
                    .fiche-table th, .fiche-table td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; overflow-wrap: break-word; }
                    .fiche-table th:nth-child(1), .fiche-table td:nth-child(1) { width: 15%; }
                    .fiche-table th:nth-child(2), .fiche-table td:nth-child(2) { width: 40%; }
                    .fiche-table th:nth-child(3), .fiche-table td:nth-child(3) { width: 35%; }
                    .fiche-table th:nth-child(4), .fiche-table td:nth-child(4) { width: 10%; text-align: center; }
                    .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border: 2px solid #000; padding: 10px; margin-bottom: 15px; font-size: 14px; }
                    @media (max-width: 768px) { .header-grid { grid-template-columns: 1fr; } }
                  `}</style>
                  
                  {/* BULLETPROOF WRAPPER POUR LE CONTENU IA */}
                  <div 
                    className="p-4 sm:p-8 w-full max-w-full overflow-x-hidden [&_*]:!max-w-full [&_*]:!box-border [&_*]:![overflow-wrap:anywhere] [&_*]:![word-break:break-word] [&_img]:!max-w-full [&_img]:!w-full [&_img]:!h-auto [&_video]:!max-w-full [&_video]:!w-full [&_video]:!h-auto [&_iframe]:!max-w-full [&_iframe]:!w-full [&_iframe]:!h-auto [&_table]:!block [&_table]:!max-w-full [&_table]:!overflow-x-auto" 
                    dangerouslySetInnerHTML={{ __html: generatedContent }} 
                  />
                  
                </div>
              </div>
            )}
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
