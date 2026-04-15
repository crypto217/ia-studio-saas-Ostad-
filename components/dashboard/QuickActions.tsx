"use client"

import { motion } from "motion/react"
import { Plus, CheckSquare, Sparkles, BarChart3, BookOpen } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    name: "Nouveau Cours",
    icon: Plus,
    color: "from-sky-400 to-blue-600",
    shadow: "shadow-blue-500/30",
    href: "/courses/new",
  },
  {
    name: "Appel",
    icon: CheckSquare,
    color: "from-emerald-400 to-teal-600",
    shadow: "shadow-teal-500/30",
    href: "/classes/attendance",
  },
  {
    name: "Générer Quiz",
    icon: Sparkles,
    color: "from-violet-400 to-purple-600",
    shadow: "shadow-purple-500/30",
    href: "/ai-generator",
  },
  {
    name: "Statistiques",
    icon: BarChart3,
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-500/30",
    href: "/statistics",
  },
  {
    name: "Liste des cours",
    icon: BookOpen,
    color: "from-pink-400 to-rose-500",
    shadow: "shadow-rose-500/30",
    href: "/courses",
  },
]

export function QuickActions() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Accès Rapide</h3>
      </div>
      <div className="flex flex-row overflow-x-auto gap-4 md:gap-6 pb-4 px-1 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {actions.map((action, index) => (
          <Link key={action.name} href={action.href} className="outline-none shrink-0 snap-start w-24 sm:w-28 md:w-32">
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-3 group cursor-pointer w-full"
            >
              <div className={`flex h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20 md:h-22 md:w-22 items-center justify-center rounded-[1.25rem] sm:rounded-[1.5rem] text-white shadow-lg group-hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${action.color} ${action.shadow} border border-white/40 relative overflow-hidden`}>
                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_forwards] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                
                {/* Inner glow */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                
                <action.icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
              </div>
              <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors text-center leading-tight px-1 whitespace-nowrap">
                {action.name}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
