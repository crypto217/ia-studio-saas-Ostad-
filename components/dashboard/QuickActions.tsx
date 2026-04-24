"use client"

import { GraduationCap, UserCheck, Sparkles, BarChart3, Presentation } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    name: "Vision classe",
    icon: Presentation,
    color: "text-amber-600",
    bgColor: "bg-white",
    cardBg: "bg-amber-50",
    borderColor: "border-amber-100",
    textColor: "text-amber-900",
    hoverColor: "group-hover:text-amber-700",
    shadow: "shadow-sm",
    href: "/live-session/1",
    hideOnMobile: true,
  },
  {
    name: "Évaluer classe",
    icon: GraduationCap,
    color: "text-emerald-600",
    bgColor: "bg-white",
    cardBg: "bg-emerald-50",
    borderColor: "border-emerald-100",
    textColor: "text-emerald-900",
    hoverColor: "group-hover:text-emerald-700",
    shadow: "shadow-sm",
    href: "/grades",
  },
  {
    name: "Faire l'appel",
    icon: UserCheck,
    color: "text-orange-600",
    bgColor: "bg-white",
    cardBg: "bg-orange-50",
    borderColor: "border-orange-100",
    textColor: "text-orange-900",
    hoverColor: "group-hover:text-orange-700",
    shadow: "shadow-sm",
    href: "/attendance",
  },
  {
    name: "Préparer cours",
    icon: Sparkles,
    color: "text-violet-600",
    bgColor: "bg-white",
    cardBg: "bg-violet-50",
    borderColor: "border-violet-100",
    textColor: "text-violet-900",
    hoverColor: "group-hover:text-violet-700",
    shadow: "shadow-sm",
    href: "/ai-generator",
  },
  {
    name: "Bilan complet",
    icon: BarChart3,
    color: "text-blue-600",
    bgColor: "bg-white",
    cardBg: "bg-blue-50",
    borderColor: "border-blue-100",
    textColor: "text-blue-900",
    hoverColor: "group-hover:text-blue-700",
    shadow: "shadow-sm",
    href: "/statistics",
  },
]

export function QuickActions() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Accès Rapide</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {actions.map((action) => (
          <Link 
            key={action.name} 
            href={action.href} 
            className={`${action.cardBg} ${action.borderColor} border rounded-2xl min-h-24 p-3 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 group ${action.hideOnMobile ? 'hidden lg:flex' : 'flex'}`}
          >
            <div className={`w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-2xl flex items-center justify-center ${action.bgColor} ${action.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <action.icon className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <span className={`font-bold ${action.textColor} text-xs sm:text-sm leading-tight ${action.hoverColor} transition-colors`}>
              {action.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
