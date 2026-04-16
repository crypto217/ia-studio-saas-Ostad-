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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {actions.map((action) => (
          <Link 
            key={action.name} 
            href={action.href} 
            className={`bg-white rounded-xl p-4 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-3 group ${action.hideOnMobile ? 'hidden md:flex' : ''}`}
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${action.bgColor} ${action.color} group-hover:scale-110 transition-transform duration-300 ${action.shadow ? 'shadow-lg ' + action.shadow : ''}`}>
              <action.icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-700 text-sm sm:text-base group-hover:text-slate-900 transition-colors">
              {action.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
