"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, CheckCircle2, ChevronRight, AlertCircle, Cake, TrendingUp, Sparkles, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOpenNotifs = () => setIsOpen(true);
    window.addEventListener('open-notifications', handleOpenNotifs);
    return () => window.removeEventListener('open-notifications', handleOpenNotifs);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Don't close if it's full screen (mobile) and we click inside
      // Actually handled by full screen covering everything, but if we click the button we handle it
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const dummyNotifications = [
    { id: 1, type: "alert", text: "Sarah B. : Devoir non rendu (Maths)", time: "08:15", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-100" },
    { id: 2, type: "birthday", text: "Anniversaire de Lina M. 🎂", time: "Hier", icon: Cake, color: "text-amber-500", bg: "bg-amber-100" },
    { id: 3, type: "success", text: "Amine K. : +2 pts de moyenne", time: "Hier", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-100" },
    { id: 4, type: "system", text: "Nouveau module IA activé", time: "Lun.", icon: Sparkles, color: "text-indigo-500", bg: "bg-indigo-100" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="fixed inset-0 z-[100] w-full h-[100dvh] rounded-none bg-white flex flex-col sm:absolute sm:inset-auto sm:right-0 sm:mt-3 sm:w-80 sm:h-auto sm:rounded-3xl sm:border sm:border-slate-100 sm:shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 pb-3 pt-6 sm:pt-4 border-b border-slate-100 mb-2 shrink-0">
              <div className="flex items-center gap-3">
                <h4 className="font-black text-slate-800 text-lg tracking-tight flex items-center gap-2">
                  <Bell className="w-5 h-5 text-slate-400" />
                  Notifications
                </h4>
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  2 nvx
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="sm:hidden p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                aria-label="Fermer les notifications"
              >
                 <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1 overflow-y-auto px-2 pb-2 flex-1 sm:max-h-[320px] sm:flex-none">
              {dummyNotifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", n.bg, n.color)}>
                    <n.icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-slate-900 transition-colors">
                      {n.text}
                    </p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      {n.time}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0" />
                </div>
              ))}
            </div>
            
            <div className="p-4 sm:p-2 border-t border-slate-100 mt-auto sm:mt-1 shrink-0 pb-8 sm:pb-2">
              <button className="w-full py-3 sm:py-2 flex items-center justify-center gap-2 text-sm font-bold text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                <CheckCircle2 className="w-4 h-4" />
                Tout marquer comme lu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
