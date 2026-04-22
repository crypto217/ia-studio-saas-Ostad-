"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence, Variants } from "motion/react"
import { Sparkles, FileText, MessageSquareHeart, Camera, X } from "lucide-react"

export function AIMagicHub() {
  const [isOpen, setIsOpen] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("Image uploadée pour analyse :", file.name)
      // TODO: Connect to Vision API later
      setIsOpen(false)
    }
  }

  const menuVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 25,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      transition: { duration: 0.2 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[35] bg-slate-900/20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div className="fixed z-40 flex flex-col items-center md:items-end bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] left-1/2 -translate-x-1/2 md:bottom-10 md:left-auto md:right-10 md:translate-x-0">
        
        {/* Menu Options */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mb-6 flex flex-col gap-4 w-[90vw] max-w-[320px] origin-bottom md:origin-bottom-right"
            >
              {/* Option 1 */}
              <motion.div variants={itemVariants}>
                <Link 
                  href="/ai-generator"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-4 p-4 bg-white rounded-3xl border-2 border-slate-200 border-b-4 active:border-b-2 active:translate-y-[2px] hover:border-pink-200 hover:bg-pink-50 transition-all group shadow-xl shadow-slate-200/50"
                >
                  <div className="p-3 bg-pink-100 text-pink-500 rounded-2xl group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Générer un Support</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Créer des fiches, QCM ou cours.</p>
                  </div>
                </Link>
              </motion.div>

              {/* Option 2 */}
              <motion.div variants={itemVariants}>
                <Link 
                  href="/ai-generator/chat"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-4 p-4 bg-white rounded-3xl border-2 border-slate-200 border-b-4 active:border-b-2 active:translate-y-[2px] hover:border-indigo-200 hover:bg-indigo-50 transition-all group shadow-xl shadow-slate-200/50"
                >
                  <div className="p-3 bg-indigo-100 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform">
                    <MessageSquareHeart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Assistant Chat</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Posez vos questions pédagogiques.</p>
                  </div>
                </Link>
              </motion.div>

              {/* Option 3 */}
              <motion.div variants={itemVariants}>
                <label className="flex items-start gap-4 p-4 bg-white rounded-3xl border-2 border-slate-200 border-b-4 active:border-b-2 active:translate-y-[2px] hover:border-amber-200 hover:bg-amber-50 transition-all group cursor-pointer shadow-xl shadow-slate-200/50">
                  <div className="p-3 bg-amber-100 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Scanner & Analyser</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Prenez en photo un document ou une copie.</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    onChange={handleImageUpload} 
                  />
                </label>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center justify-center w-[4.5rem] h-[4.5rem] rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-orange-500 text-white shadow-xl shadow-fuchsia-500/40 border-4 border-white z-10"
        >
          {/* Animated noise background for premium feel */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute inset-0 rounded-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"
          />

          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative z-10"
          >
            {isOpen ? <X className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
          </motion.div>
          
          {/* PRO Badge */}
          <div className="absolute -top-1 -right-2 bg-slate-900 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm z-20">
            PRO ✦
          </div>

          {/* Sparkle effects when closed */}
          {!isOpen && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -left-1 z-20"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
            </motion.div>
          )}
        </motion.button>
      </div>
    </>
  )
}
