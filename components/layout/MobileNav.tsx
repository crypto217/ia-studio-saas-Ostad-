"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Users, 
  Sparkles,
  ClipboardList
} from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { name: "Accueil", href: "/", icon: LayoutDashboard, color: "text-sky-500", bgActive: "bg-sky-100" },
  { name: "Planning", href: "/planning", icon: Calendar, color: "text-pink-500", bgActive: "bg-pink-100" },
  { name: "IA", href: "/ai-generator", icon: Sparkles, isPremium: true },
  { name: "Bibliothèque", href: "/courses", icon: BookOpen, color: "text-amber-500", bgActive: "bg-amber-100" },
  { name: "Classes", href: "/classes", icon: Users, color: "text-emerald-500", bgActive: "bg-emerald-100" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-100 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          if (item.isPremium) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex flex-col items-center justify-center -mt-6"
              >
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-orange-500 shadow-lg shadow-fuchsia-500/40 text-white border-4 border-white z-20"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="absolute inset-0 rounded-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"
                  />
                  <item.icon className="h-6 w-6 relative z-10" />
                  
                  {/* Sparkle effects */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="h-3 w-3 text-amber-300" />
                  </motion.div>
                </motion.div>
                <span className="mt-1 text-[10px] font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  {item.name}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-14"
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
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
