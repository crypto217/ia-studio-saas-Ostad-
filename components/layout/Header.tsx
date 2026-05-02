"use client"

import { useState, useEffect } from "react"
import { Bell, Search, Info, Rocket, Sparkles, Menu, X, LayoutDashboard, Calendar, BookOpen, Users, GraduationCap, BarChart3, Settings, LogOut, ClipboardList, User, CreditCard, HelpCircle, Keyboard, LogIn, AlertCircle, Cake, TrendingUp, CheckCircle2, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/AuthProvider"
import { NotificationMenu } from "./NotificationMenu"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, color: "text-sky-500", bgActive: "bg-sky-100" },
  { name: "Planning", href: "/planning", icon: Calendar, color: "text-pink-500", bgActive: "bg-pink-100" },
  { name: "Courses", href: "/courses", icon: BookOpen, color: "text-amber-500", bgActive: "bg-amber-100" },
  { name: "Classes", href: "/classes", icon: Users, color: "text-emerald-500", bgActive: "bg-emerald-100" },
  { name: "Carnet de notes", href: "/grades", icon: ClipboardList, color: "text-orange-500", bgActive: "bg-orange-100" },
  { name: "AI Generator", href: "/ai-generator", icon: Sparkles, color: "text-rose-500", bgActive: "bg-rose-100" },
  { name: "Statistics", href: "/statistics", icon: BarChart3, color: "text-cyan-500", bgActive: "bg-cyan-100" },
  { name: "Settings", href: "/settings", icon: Settings, color: "text-slate-500", bgActive: "bg-slate-100" },
]

export function Header() {
  const [showNotification, setShowNotification] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const pathname = usePathname()
  const { user, isAuthReady, onboardingCompleted, signIn, logOut } = useAuth()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isAuthReady && user && !onboardingCompleted) {
      // Use a small timeout to avoid synchronous setState during render
      timeoutId = setTimeout(() => {
        setShowOnboarding(true)
      }, 0);
    }
    return () => clearTimeout(timeoutId);
  }, [isAuthReady, user, onboardingCompleted])

  useEffect(() => {
    const handleOpenNotifs = () => setShowNotification(true);
    window.addEventListener('open-notifications', handleOpenNotifs);
    return () => window.removeEventListener('open-notifications', handleOpenNotifs);
  }, []);

  const dummyNotifications = [
    { id: 1, type: "alert", text: "Sarah B. : Devoir non rendu (Maths)", time: "08:15", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-100" },
    { id: 2, type: "birthday", text: "Anniversaire de Lina M. 🎂", time: "Hier", icon: Cake, color: "text-amber-500", bg: "bg-amber-100" },
    { id: 3, type: "success", text: "Amine K. : +2 pts de moyenne", time: "Hier", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-100" },
    { id: 4, type: "system", text: "Nouveau module IA activé", time: "Lun.", icon: Sparkles, color: "text-indigo-500", bg: "bg-indigo-100" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex shrink-0 w-full h-20 items-center justify-between border-b border-indigo-50 bg-white/80 md:px-8 backdrop-blur-xl print:hidden">
        {/* Desktop Left side */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students, classes, courses..." 
              className="h-11 w-80 rounded-2xl border-none bg-slate-100/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        {/* Mobile Header elements container */}
        <div className="flex items-center justify-between w-full md:hidden px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">LUDICLASS</span>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationMenu />
            <button 
              onClick={() => setShowMobileMenu(true)}
              className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-6">
            <NotificationMenu />
          </div>
          
          <div className="relative flex items-center gap-3 md:border-l md:border-slate-200 md:pl-6">
            {user ? (
              <>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-slate-900">{user.displayName || "Professeur"}</p>
                  <p className="text-xs text-slate-500">Teacher</p>
                </div>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="relative rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <Avatar className="h-10 w-10 md:h-11 md:w-11">
                    <AvatarImage src={user.photoURL || "https://picsum.photos/seed/teacher/200/200"} alt="Teacher" />
                    <AvatarFallback>{user.displayName?.charAt(0) || "P"}</AvatarFallback>
                  </Avatar>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowProfileMenu(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95, rotate: 2 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95, rotate: -2 }}
                        transition={{ type: "spring", bounce: 0.5, duration: 0.5 }}
                        className="absolute right-0 top-full mt-4 w-64 rounded-2xl bg-white p-2 shadow-2xl z-50 origin-top-right border border-slate-100"
                      >
                        <div className="flex flex-col">
                          {/* User Info (Visible on all screens in dropdown) */}
                          <div className="px-4 py-3 border-b border-slate-100 mb-1">
                            <p className="text-sm font-bold text-slate-900">{user.displayName || "Professeur"}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                          
                          <div className="py-1 px-1">
                            <Link 
                              href="/profile"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <User className="h-4 w-4" />
                              <span>Mon profil</span>
                            </Link>
                            
                            <Link 
                              href="/settings"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <Settings className="h-4 w-4" />
                              <span>Paramètres</span>
                            </Link>

                            <Link 
                              href="/billing"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <CreditCard className="h-4 w-4" />
                              <span>Abonnement</span>
                            </Link>
                          </div>

                          <div className="h-px bg-slate-100 my-1 mx-2" />

                          <div className="py-1 px-1">
                            <Link 
                              href="/help"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <div className="flex items-center gap-3">
                                <HelpCircle className="h-4 w-4" />
                                <span>Centre d&apos;aide</span>
                              </div>
                            </Link>

                            <button 
                              onClick={() => setShowProfileMenu(false)}
                              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
                            >
                              <div className="flex items-center gap-3">
                                <Keyboard className="h-4 w-4" />
                                <span>Raccourcis clavier</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">⌘K</span>
                            </button>
                          </div>

                          <div className="h-px bg-slate-100 my-1 mx-2" />
                          
                          <div className="py-1 px-1">
                            <button 
                              onClick={() => {
                                setShowProfileMenu(false)
                                logOut()
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-rose-50 hover:text-rose-600"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Déconnexion</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <button 
                onClick={signIn}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" /> Connexion
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
    <AnimatePresence>
      {showMobileMenu && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm md:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 z-[101] w-72 bg-white shadow-2xl md:hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-white shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-800">LUDICLASS</span>
              </div>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-4">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold transition-all",
                        isActive 
                          ? cn("bg-slate-50 text-slate-900", item.color)
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon className={cn("h-6 w-6", isActive ? item.color : "text-slate-400")} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-slate-100">
              {user ? (
                <button onClick={logOut} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-500">
                  <LogOut className="h-6 w-6 text-slate-400" />
                  <span>Log out</span>
                </button>
              ) : (
                <button onClick={signIn} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900">
                  <LogIn className="h-6 w-6 text-slate-400" />
                  <span>Log in</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  )
}
