"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Bot, Send, ArrowLeft, Paperclip, Sparkles, MoreHorizontal } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { GoogleGenAI } from "@google/genai"
import Markdown from "react-markdown"

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })

const SYSTEM_INSTRUCTION = `Tu es l'Assistant Ludiclass, une intelligence artificielle spécialisée pour les enseignants d'école primaire. Ton objectif est de fasciner et d'encourager les enseignants !

CRITÈRES DE RÉPONSE OBLIGATOIRES (TRÈS IMPORTANT) :
- Sois TRÈS DYNAMIQUE, CHALEUREUX et POSITIF. Donne du courage et de l'énergie à l'enseignant !
- Utilise BEAUCOUP le formatage Markdown de la manière suivante pour rendre tes réponses MAGNIFIQUES :
  - Utilise le **gras** (double astérisque) pour les termes pédagogiques clés, les concepts importants, ou les réussites. (Cela s'affichera sous forme de magnifiques badges colorés !).
  - Utilise l'*italique* (simple astérisque) pour les exemples, les citations d'élèves ou les astuces. (Cela sera souligné avec une belle vague !).
  - Utilise des titres ## pour délimiter clairement les grandes étapes ou les types d'exercices.
  - Utilise systématiquement des listes à puces pour énumérer tes idées, cela aère le texte.
  - Utilise le bloc de citation (>) pour mettre en valeur les "Règles d'or" ou les conseils très importants.
- Sois EXTRÊMEMENT CONCIS : tes réponses doivent être le plus court possible. Va directement à l'essentiel, pas de longs pavés, fais des paragraphes de 1 à 2 lignes maximum.
- Parle comme un mentor bienveillant, et utilise des emojis avec parcimonie pour égayer le tout.`

type Message = {
  id: string
  role: "user" | "model"
  content: string
}

const QUICK_PROMPTS = [
  "🎭 Idée de jeu éducatif",
  "📝 Rendre un exercice plus ludique",
  "💡 Expliquer la grammaire simplement",
  "✨ Activité de 5 minutes"
]

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "model",
  content: "Bonjour ! 👋 Je suis l'Assistant Ludiclass. Prêt(e) à préparer une leçon extraordinaire aujourd'hui ? Je suis là pour vous donner des idées créatives, corriger vos textes ou simplifier les notions complexes. Comment puis-je vous aider ?"
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const isMobile = useIsMobile()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim() || isTyping) return

    const userText = inputValue.trim()
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText
    }

    setMessages(prev => [...prev, newUserMsg])
    setInputValue("")
    setIsTyping(true)

    try {
      // Build history for Gemini
      const historyForGemini = messages.filter(m => m.id !== "1").map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }))

      // Append current message
      historyForGemini.push({
        role: "user",
        parts: [{ text: userText }]
      })

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: historyForGemini,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      })

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: response.text || "Désolé, je n'ai pas pu formuler de réponse."
      }
      setMessages(prev => [...prev, newAiMsg])
    } catch (error: any) {
       let errorContent = "Oups... Il semblerait que j'aie rencontré un problème avec ma connexion. Veuillez réessayer."
       if (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("exceeded your current quota")) {
         console.warn("Gemini Rate Limit (429) hit in chat.");
         errorContent = "Limite d'utilisation de l'intelligence artificielle atteinte. Veuillez patienter un peu avant de réessayer."
       } else {
         console.error("Erreur Gemini API:", error)
       }

       const errorMsg: Message = {
         id: (Date.now() + 1).toString(),
         role: "model",
         content: errorContent
       }
       setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const renderHeader = () => (
    <header className="flex items-center p-4 bg-white shadow-sm shrink-0 w-full z-10 sticky top-0 relative">
      <Link 
        href="/ai-generator" 
        className="p-2 sm:p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all mr-2 flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium hidden sm:inline">Retour</span>
      </Link>
      <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-2">
        Assistant Libre Ludiclass ✨
      </h1>
    </header>
  )

  const renderMessages = () => (
    <>
      <AnimatePresence initial={false}>
        {messages.map((msg) => {
          const isUser = msg.role === "user"
          
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95, y: 15, originX: isUser ? 1 : 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
              )}
              
              <div 
                className={`max-w-[90%] sm:max-w-[75%] overflow-hidden ${
                  isUser 
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none p-4 md:p-5 shadow-md leading-relaxed text-[15px]' 
                    : 'bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 md:p-5 shadow-sm leading-relaxed text-[15px]'
                }`}
              >
                {isUser ? msg.content : (
                  <Markdown
                    components={{
                      strong: ({node, ...props}) => <strong className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100 shadow-sm" {...props} />,
                      em: ({node, ...props}) => <em className="not-italic font-semibold text-rose-700 underline decoration-rose-400 decoration-wavy decoration-2 underline-offset-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mt-6 mb-3 inline-block border-b-2 border-indigo-100 pb-1" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base sm:text-lg font-bold text-violet-700 mt-4 mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="space-y-2.5 mt-3 mb-5" {...props} />,
                      ol: ({node, ...props}) => <ol className="space-y-2.5 mt-3 mb-5 list-decimal pl-5 marker:text-indigo-600 marker:font-bold" {...props} />,
                      li: ({node, className, children, ...props}: any) => {
                        // On vérifie si par hasard on est dans un composant "ol" ou si ça se comporte comme tel
                        // On prend une option safe pour les listes non ordonnées:
                        return (
                          <li className="flex items-start gap-3 text-slate-700 leading-relaxed" {...props}>
                            {node?.parent?.tagName === 'ol' ? (
                              <span className="shrink-0 mt-0.5 text-indigo-600 font-bold">•</span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 mt-2.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                            )}
                            <span className="flex-1">{children}</span>
                          </li>
                        )
                      },
                      p: ({node, ...props}) => <p className="mb-4 last:mb-0 text-slate-700 leading-relaxed" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-400 bg-gradient-to-r from-amber-50 to-amber-50/10 pl-4 py-3 text-slate-700 my-4 rounded-r-xl italic shadow-sm" {...props} />,
                      a: ({node, ...props}) => <a className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 decoration-2 underline-offset-2 transition-colors font-medium" {...props} />
                    }}
                  >
                    {msg.content}
                  </Markdown>
                )}
              </div>
            </motion.div>
          )
        })}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15, originX: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex gap-3 justify-start w-full"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-purple-100 rounded-full flex items-center justify-center mt-1">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="px-5 py-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-slate-400 rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-slate-400 rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-slate-400 rounded-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} className="h-1" />
    </>
  )

  const renderInputArea = () => (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar mb-2">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button 
            key={idx}
            onClick={() => setInputValue(prompt)}
            className="bg-white text-indigo-700 text-sm font-medium px-4 py-2 rounded-full border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={handleSend} className="bg-white rounded-[2rem] md:rounded-full shadow-lg border border-slate-200 flex items-center p-2">
        <input 
          type="text" 
          value={inputValue} 
          onChange={e => setInputValue(e.target.value)} 
          placeholder="Posez votre question pédagogique..." 
          className="flex-1 bg-transparent border-none outline-none px-4 md:px-6 text-slate-700 placeholder:text-slate-400"
        />
        <button 
          type="submit" 
          disabled={!inputValue.trim() || isTyping} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 md:p-4 transition-transform hover:scale-105 shadow-md flex items-center justify-center shrink-0 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </>
  )

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col h-[100dvh] w-full bg-[#FFFAF3] overflow-hidden">
        {renderHeader()}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {renderMessages()}
        </div>
        <div className="w-full p-4 pb-6 bg-[#FFFAF3] border-t border-slate-100 shrink-0">
          {renderInputArea()}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-11rem)] md:h-[calc(100dvh-6rem)] max-w-5xl mx-auto bg-[#FFFAF3] rounded-2xl shadow-sm overflow-hidden border border-slate-100 mt-4">
      {renderHeader()}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {renderMessages()}
      </div>
      <div className="w-full p-4 pb-6 md:pb-8 shrink-0 bg-[#FFFAF3]">
        {renderInputArea()}
      </div>
    </div>
  )
}
