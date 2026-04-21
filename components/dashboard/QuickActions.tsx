"use client"

import { GraduationCap, UserCheck, Sparkles, BarChart3, Presentation } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    name: "Vision classe",
    icon: Presentation,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-blue-500 to-indigo-600",
    shadow: "shadow-indigo-500/30",
    href: "/live-session/1",
    hideOnMobile: true,
  },
  {
    name: "Évaluer une classe",
    icon: GraduationCap,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    href: "/grades",
  },
  {
    name: "Faire l'appel",
    icon: UserCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    href: "/attendance",
  },
  {
    name: "Préparer un cours (IA)",
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    href: "/ai-generator",
  },
  {
    name: "Bilan trimestriel",
    icon: BarChart3,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    href: "/statistics",
  },
]

export function QuickActions() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Accès Rapide</h3>
      </div>
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex flex-row overflow-x-auto lg:grid lg:grid-cols-5 gap-4 pb-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {actions.map((action) => (
          <Link 
            key={action.name} 
            href={action.href} 
            className={`shrink-0 w-36 lg:w-auto snap-start bg-white rounded-[1.5rem] sm:rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 group ${action.hideOnMobile ? 'hidden lg:flex' : ''}`}
          >
            <div className={`w-14 h-14 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${action.bgColor} ${action.color} group-hover:scale-110 transition-transform duration-300 ${action.shadow ? 'shadow-lg ' + action.shadow : ''}`}>
              <action.icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-700 text-[13px] sm:text-base leading-tight group-hover:text-slate-900 transition-colors">
              {action.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
