"use client"

import { useEffect } from "react"
import { motion } from "motion/react"
import { ChevronRight, BellRing } from "lucide-react"

export function SmartTicker() {
  const openNotifications = () => {
    window.dispatchEvent(new Event('open-notifications'))
  }

  return (
    <div className="flex items-center justify-center -mt-2 mb-2 sm:mb-0 sm:mt-0 px-2">
      {/* We use CSS active states for the playful 3D squishy effect instead of motion.button to avoid conflicts */}
      <button
        onClick={openNotifications}
        className="flex items-center w-full max-w-sm h-[3.25rem] rounded-full bg-white border-2 border-slate-200 border-b-[4px] active:border-b-2 active:translate-y-[2px] transition-all cursor-pointer px-2 group"
      >
        {/* Bright Icon Container */}
        <div className="flex items-center justify-center bg-rose-100 text-rose-500 rounded-full w-9 h-9 shrink-0">
          <motion.div
            animate={{ rotate: [0, 15, -15, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 3 }}
          >
            <BellRing className="w-5 h-5" />
          </motion.div>
        </div>
        
        {/* Text & Right Side Badge */}
        <div className="flex-1 flex items-center justify-between min-w-0 pl-3">
          <p className="font-black text-slate-800 text-sm truncate pr-2 text-left">
            🎉 1 anniv. & 1 urgence
          </p>
          
          <div className="flex items-center gap-1.5 shrink-0 pr-1">
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Nouveau
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </button>
    </div>
  )
}
