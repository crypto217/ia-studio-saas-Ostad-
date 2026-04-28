"use client"

import { motion } from "motion/react"
import { Check, X, Sparkles, Crown, Star, ArrowRight, Shield, Zap, Heart, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Découverte",
    description: "Pour tester l'application et gérer ses premières classes.",
    price: "0",
    currency: "DA",
    period: "/ mois",
    icon: Heart,
    color: "text-slate-500",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-200",
    buttonText: "Plan actuel",
    buttonVariant: "outline",
    isDark: false,
    features: [
      { name: "Jusqu'à 2 classes maximum", included: true },
      { name: "5 requêtes IA par mois", included: true },
      { name: "Gestion de base des élèves", included: true },
      { name: "Carnet de notes simple", included: true },
      { name: "Génération de fiches complètes", included: false },
      { name: "Export PDF personnalisé", included: false },
      { name: "Support prioritaire", included: false },
    ],
  },
  {
    name: "Pro",
    description: "L'idéal pour les enseignants à temps plein (3AP, 4AP, 5AP).",
    price: "900",
    currency: "DA",
    period: "/ mois",
    icon: Star,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    borderColor: "border-indigo-500",
    buttonText: "Passer en Pro",
    buttonVariant: "primary",
    popular: true,
    isDark: false,
    features: [
      { name: "Jusqu'à 5 classes", included: true },
      { name: "50 requêtes IA par mois", included: true },
      { name: "Gestion avancée des élèves", included: true },
      { name: "Carnet de notes & statistiques", included: true },
      { name: "Génération de fiches complètes", included: true },
      { name: "Export PDF standard", included: true },
      { name: "Support par email", included: false },
    ],
  },
  {
    name: "Ultra",
    description: "Pour les super-profs qui veulent tout automatiser.",
    price: "1900",
    currency: "DA",
    period: "/ mois",
    icon: Crown,
    color: "text-amber-400",
    bgColor: "bg-amber-400/20",
    borderColor: "border-slate-700",
    buttonText: "Devenir Ultra",
    buttonVariant: "gradient",
    isDark: true,
    features: [
      { name: "Classes illimitées", included: true },
      { name: "Requêtes IA illimitées ✨", included: true },
      { name: "Suivi psychopédagogique IA", included: true },
      { name: "Analyses statistiques poussées", included: true },
      { name: "Générateur de séquences", included: true },
      { name: "Export PDF personnalisé (Logo)", included: true },
      { name: "Support VIP WhatsApp 24/7", included: true },
    ],
  },
]

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section with Premium Background */}
      <div className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px]" />
          <div className="absolute right-0 top-20 -z-10 h-[250px] w-[250px] rounded-full bg-amber-400 opacity-20 blur-[100px]" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-white border border-indigo-100 px-4 py-2 text-sm font-bold text-indigo-600 mb-8 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Spécial Profs de Français (Primaire) en Algérie 🇩🇿</span>
            </motion.div>
            
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl mb-6 max-w-4xl">
              Gagnez du temps, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-300% animate-gradient">
                focalisez-vous sur l&apos;essentiel.
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-600 font-medium leading-relaxed">
              Fini les nuits blanches à préparer les fiches et les compositions ! 
              Choisissez le plan qui correspond à votre volume horaire et laissez l&apos;IA de Ludiclass vous assister.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 -mt-12 sm:-mt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8 items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
              className={cn(
                "relative flex flex-col rounded-[2rem] p-8 transition-all duration-300",
                plan.isDark 
                  ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20" 
                  : "bg-white text-slate-900 shadow-xl shadow-slate-200/50 border border-slate-200/60",
                plan.popular && "lg:scale-105 ring-2 ring-indigo-500 shadow-2xl shadow-indigo-200 z-10 bg-white",
                !plan.popular && "hover:-translate-y-2"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-white/40" />
                  Le plus populaire
                </div>
              )}

              <div className="mb-8 flex items-center gap-4">
                <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", plan.bgColor, plan.color)}>
                  <plan.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className={cn("text-2xl font-black", plan.isDark ? "text-white" : "text-slate-900")}>{plan.name}</h3>
                  <p className={cn("text-sm font-medium leading-tight mt-1", plan.isDark ? "text-slate-400" : "text-slate-500")}>
                    {plan.description}
                  </p>
                </div>
              </div>

              <div className="mb-8 flex items-baseline gap-2">
                <span className={cn("text-5xl font-black tracking-tight", plan.isDark ? "text-white" : "text-slate-900")}>
                  {plan.price}
                </span>
                <span className={cn("text-xl font-bold", plan.isDark ? "text-slate-400" : "text-slate-500")}>
                  {plan.currency}
                </span>
                <span className={cn("text-sm font-medium", plan.isDark ? "text-slate-400" : "text-slate-500")}>
                  {plan.period}
                </span>
              </div>

              <button
                className={cn(
                  "mb-8 w-full rounded-2xl py-4 text-base font-bold transition-all flex items-center justify-center gap-2 group",
                  plan.buttonVariant === "outline" && "bg-slate-50 text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-200",
                  plan.buttonVariant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300",
                  plan.buttonVariant === "gradient" && "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-orange-200/20"
                )}
              >
                {plan.buttonText}
                {plan.buttonVariant !== "outline" && (
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                )}
              </button>

              <div className="flex-1">
                <h4 className={cn("text-sm font-bold uppercase tracking-wider mb-6", plan.isDark ? "text-slate-400" : "text-slate-900")}>
                  Ce qui est inclus :
                </h4>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className={cn("mt-0.5 shrink-0", plan.isDark ? "text-amber-400" : "text-indigo-500")}>
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className={cn("mt-0.5 shrink-0", plan.isDark ? "text-slate-700" : "text-slate-300")}>
                          <X className="h-5 w-5" />
                        </div>
                      )}
                      <span className={cn(
                        "text-sm font-medium leading-tight pt-0.5", 
                        feature.included 
                          ? (plan.isDark ? "text-slate-200" : "text-slate-700") 
                          : (plan.isDark ? "text-slate-600" : "text-slate-400")
                      )}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust Section - Bento Style */}
      <div className="mx-auto max-w-5xl px-4 mt-24 sm:mt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 sm:p-12 text-center shadow-2xl shadow-indigo-200"
        >
          {/* Decorative background for trust section */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500 blur-3xl opacity-50" />
          
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl ring-1 ring-white/20">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Paiement 100% Sécurisé & Local</h2>
            <p className="mx-auto max-w-2xl text-indigo-100 font-medium text-lg mb-10 leading-relaxed">
              Nous avons pensé à vous ! Payez facilement avec les moyens de paiement que vous utilisez tous les jours. 
              L&apos;activation de votre compte Pro ou Ultra est rapide et garantie.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm hover:scale-105 transition-transform cursor-default">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-black text-slate-800 tracking-tight">BaridiMob</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm hover:scale-105 transition-transform cursor-default">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="font-black text-slate-800 tracking-tight">CCP</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm hover:scale-105 transition-transform cursor-default">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="font-black text-slate-800 tracking-tight">Edahabia / CIB</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
