"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Bot, Send, ArrowLeft, Paperclip, Sparkles, MoreHorizontal } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

const QUICK_PROMPTS = [
  "🎭 Idée de jeu de rôle (Séquence 1)",
  "📝 Corriger un texte d'élève",
  "💡 Expliquer les fractions"
]

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "Bonjour ! 👋 Je suis l'Assistant Ostad. Comment puis-je vous aider aujourd'hui avec vos classes ou vos cours ?"
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

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim()
    }

    setMessages(prev => [...prev, newUserMsg])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "C'est une excellente question ! Je prépare une réponse détaillée pour vous aider avec ça. 🚀 (La vraie connexion à l'API Gemini viendra plus tard !)"
      }
      setMessages(prev => [...prev, newAiMsg])
      setIsTyping(false)
    }, 1500)
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
        Assistant Libre Ostad ✨
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
                className={`max-w-[85%] sm:max-w-[75%] ${
                  isUser 
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none p-4 md:p-5 shadow-md leading-relaxed text-[15px]' 
                    : 'bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 md:p-5 shadow-sm text-slate-700 leading-relaxed text-[15px]'
                }`}
              >
                {msg.content}
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
