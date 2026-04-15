"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Sparkles, 
  BarChart3, 
  Settings,
  LogOut,
  ClipboardList,
  CheckCircle2
} from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard, color: "text-sky-500", bgActive: "bg-sky-100" },
  { name: "Planning", href: "/planning", icon: Calendar, color: "text-pink-500", bgActive: "bg-pink-100" },
  { name: "Bibliothèque", href: "/courses", icon: BookOpen, color: "text-amber-500", bgActive: "bg-amber-100" },
  { name: "Classes", href: "/classes", icon: Users, color: "text-emerald-500", bgActive: "bg-emerald-100" },
  { name: "Présences", href: "/attendance", icon: CheckCircle2, color: "text-teal-500", bgActive: "bg-teal-100" },
  { name: "Carnet de notes", href: "/grades", icon: ClipboardList, color: "text-orange-500", bgActive: "bg-orange-100" },
  { name: "Générateur IA", href: "/ai-generator", icon: Sparkles, color: "text-rose-500", bgActive: "bg-rose-100" },
  { name: "Statistiques", href: "/statistics", icon: BarChart3, color: "text-cyan-500", bgActive: "bg-cyan-100" },
  { name: "Paramètres", href: "/settings", icon: Settings, color: "text-slate-500", bgActive: "bg-slate-100" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r-2 border-slate-200 bg-white">
      <div className="flex h-20 items-center px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800">OSTAD</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold transition-all duration-200",
                isActive 
                  ? "text-slate-900" 
                  : "text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className={cn("absolute inset-0 rounded-2xl", item.bgActive)}
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn("relative z-10 h-6 w-6", isActive ? item.color : "text-slate-400 group-hover:" + item.color)} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4">
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-500 hover:-translate-y-0.5">
          <LogOut className="h-6 w-6 text-slate-400" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}
