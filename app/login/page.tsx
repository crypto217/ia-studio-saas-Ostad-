"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { Sparkles, CheckCircle2 } from "lucide-react"
import { motion } from "motion/react"

export default function LoginPage() {
  const { user, isAuthReady, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthReady && user) {
      router.push("/")
    }
  }, [user, isAuthReady, router])

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight">OSTAD</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight leading-[1.15]">
            Le système d&apos;exploitation des professeurs modernes.
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Générez vos cours avec l&apos;IA, gérez vos classes et gagnez des heures de préparation chaque semaine.
          </p>
          
          <div className="space-y-4 pt-8">
            {[
              "Générateur de fiches et d'exercices IA",
              "Planning et emploi du temps intelligent",
              "Suivi des élèves et carnets de notes"
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                key={i} 
                className="flex items-center gap-3 text-slate-300 font-medium"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-slate-400 font-medium">© 2026 OSTAD. Conçu pour l&apos;éducation.</p>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative bg-white">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-white shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-3xl font-black tracking-tight text-slate-900">OSTAD</span>
          </div>

          <div className="text-center lg:text-left space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bienvenue</h2>
            <p className="text-slate-500 font-medium">Connectez-vous ou créez un compte pour continuer.</p>
          </div>

          <div className="pt-4">
            <button
              onClick={signIn}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 active:scale-[0.98]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuer avec Google
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 pt-6">
            En continuant, vous acceptez nos{" "}
            <a href="#" className="font-medium text-slate-900 hover:underline">Conditions d&apos;utilisation</a>
            {" "}et notre{" "}
            <a href="#" className="font-medium text-slate-900 hover:underline">Politique de confidentialité</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
