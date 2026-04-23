"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CheckCircle2
} from "lucide-react"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  color: string
  bgActive: string
}

const leftItems: NavItem[] = [
  { name: "Accueil", href: "/", icon: LayoutDashboard, color: "text-sky-500", bgActive: "bg-sky-100" },
  { name: "Planning", href: "/planning", icon: Calendar, color: "text-pink-500", bgActive: "bg-pink-100" },
]

const rightItems: NavItem[] = [
  { name: "Classes", href: "/classes", icon: Users, color: "text-emerald-500", bgActive: "bg-emerald-100" },
  { name: "Présences", href: "/attendance", icon: CheckCircle2, color: "text-teal-500", bgActive: "bg-teal-100" },
]

export function MobileNav() {
  const pathname = usePathname()
  const isDashboard = pathname === "/"

  const renderItem = (item: NavItem) => {
    const isActive = pathname === item.href
    return (
      <Link
        key={item.name}
        href={item.href}
        className="relative flex flex-col items-center justify-center w-16 h-14"
      >
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="relative flex flex-col items-center justify-center w-full h-full"
        >
          {isActive && (
            <motion.div
              layoutId="mobilenav-active"
              className={cn("absolute inset-0 rounded-2xl opacity-50", item.bgActive)}
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <item.icon className={cn("relative z-10 h-6 w-6 mb-1 transition-transform", isActive ? cn(item.color, "scale-110") : "text-slate-400")} />
          <span className={cn("relative z-10 text-[10px] font-bold transition-colors", isActive ? "text-slate-900" : "text-slate-500")}>
            {item.name}
          </span>
        </motion.div>
      </Link>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 md:hidden">
      {/* Optional Notched Effect Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 w-full h-full bg-white/90 backdrop-blur-md border-t border-slate-200" />
      </div>

      <div className="relative z-10 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <nav className="flex items-center justify-between">
          <div className="flex flex-1 justify-around">
            {leftItems.map(renderItem)}
          </div>
          
          {/* Center Spacer for AIMagicHub */}
          {isDashboard && <div className="w-[5.5rem] h-14 shrink-0" />}
          
          <div className="flex flex-1 justify-around">
            {rightItems.map(renderItem)}
          </div>
        </nav>
      </div>
    </div>
  )
}
