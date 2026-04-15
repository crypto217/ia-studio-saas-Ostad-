"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Bot, Send, ArrowLeft, Paperclip, Sparkles, MoreHorizontal } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

const QUICK_PROMPTS = [
  "Gérer une classe dissipée 🌪️",
  "Idée de jeu de rôle 🎭",
  "Expliquer les fractions 🍕"
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

  return (
    <div className="flex flex-col h-[calc(100dvh-11rem)] md:h-[calc(100dvh-8rem)] bg-slate-50 rounded-[2rem] border-4 border-slate-200 overflow-hidden shadow-sm">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b-4 border-slate-200 shrink-0 z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link 
            href="/" 
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-100 rounded-full flex items-center justify-center border-2 border-violet-200">
                <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-violet-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-base sm:text-lg leading-tight">Assistant Ostad</h2>
              <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                En ligne
              </p>
            </div>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-xl font-bold text-sm border-2 border-violet-100">
          <Sparkles className="w-4 h-4" />
          <span>IA Pédagogique</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-95">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.role === "user"
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.8, y: 20, originX: isUser ? 1 : 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-violet-100 rounded-full flex items-center justify-center border-2 border-violet-200 mt-1">
                    <Bot className="w-5 h-5 text-violet-600" />
                  </div>
                )}
                
                <div 
                  className={`px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base font-medium ${
                    isUser 
                      ? 'bg-indigo-500 text-white border-2 border-indigo-600 border-b-4 rounded-2xl rounded-tr-sm' 
                      : 'bg-white text-slate-700 border-2 border-slate-200 border-b-4 rounded-2xl rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            )
          })}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20, originX: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex gap-3 max-w-[80%]"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-violet-100 rounded-full flex items-center justify-center border-2 border-violet-200 mt-1">
                <Bot className="w-5 h-5 text-violet-600" />
              </div>
              <div className="px-5 py-4 bg-white text-slate-700 border-2 border-slate-200 border-b-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-slate-400 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t-4 border-slate-200 shrink-0">
        
        {/* Quick Prompts */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setInputValue(prompt)
              }}
              className="shrink-0 px-4 py-2 bg-white border-2 border-slate-200 border-b-4 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 active:border-b-2 active:translate-y-[2px] transition-all whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              placeholder="Posez votre question pédagogique..." 
              className="w-full pl-4 sm:pl-5 pr-12 py-3 sm:py-4 bg-slate-100 border-2 border-slate-200 rounded-3xl font-medium text-slate-700 focus:outline-none focus:border-violet-400 focus:bg-white transition-colors"
            />
            <button 
              type="button" 
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-violet-500 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={!inputValue.trim() || isTyping} 
            className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 border-b-4 border-violet-700 rounded-full flex items-center justify-center text-white transition-all active:border-b-0 active:translate-y-[4px]"
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6 ml-1" />
          </button>
        </form>
      </div>

    </div>
  )
}
