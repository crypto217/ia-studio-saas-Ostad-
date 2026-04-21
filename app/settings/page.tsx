"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { 
  User, Bell, Shield, Palette, ChevronRight, 
  ArrowLeft, LogOut, Mail, Sparkles, Check
} from "lucide-react"

type Tab = 'profile' | 'notifications' | 'appearance' | 'security'

const tabs: { id: Tab; label: string; icon: any; color: string; bg: string; desc: string }[] = [
  { id: 'profile', label: 'Profil Personnel', icon: User, color: 'text-indigo-600', bg: 'bg-indigo-100', desc: 'Informations publiques et avatar' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-pink-600', bg: 'bg-pink-100', desc: 'Gérez vos alertes et emails' },
  { id: 'appearance', label: 'Apparence', icon: Palette, color: 'text-amber-600', bg: 'bg-amber-100', desc: 'Personnalisez votre interface' },
  { id: 'security', label: 'Sécurité', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-100', desc: 'Mots de passe et connexions' },
]

const ProfileSettings = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-8">
    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">Informations Personnelles</h2>
      <p className="text-sm text-slate-500 font-medium mb-8">Mettez à jour vos informations publiques.</p>
      
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md bg-white">
          <Image 
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Marie&backgroundColor=transparent" 
            alt="Profile Avatar" 
            fill 
            className="object-cover p-1" 
            referrerPolicy="no-referrer" 
            unoptimized
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-md w-full sm:w-auto text-sm">
            Changer l&apos;avatar
          </button>
          <button className="px-6 py-3 bg-white text-slate-600 font-bold justify-center rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors flex items-center w-full sm:w-auto text-sm">
            Supprimer
          </button>
        </div>
      </div>
      
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Prénom</label>
          <input 
            type="text" 
            defaultValue="Marie" 
            className="w-full rounded-xl border-2 border-slate-100 hover:border-slate-200 bg-slate-50/50 px-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Nom</label>
          <input 
            type="text" 
            defaultValue="Dubois" 
            className="w-full rounded-xl border-2 border-slate-100 hover:border-slate-200 bg-slate-50/50 px-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Adresse Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              defaultValue="marie.dubois@ecole.edu" 
              className="w-full rounded-xl border-2 border-slate-100 hover:border-slate-200 bg-slate-50/50 pl-12 pr-4 py-3.5 text-slate-800 font-medium focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
            />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
        <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2">
          <Check className="w-5 h-5" /> Enregistrer les modifications
        </button>
      </div>
    </div>
  </motion.div>
)

const PlaceholderSettings = ({ title, desc }: { title: string, desc: string }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-8">
    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 h-[400px] flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-slate-300" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 font-medium max-w-sm">{desc}<br/><span className="text-indigo-500 font-bold mt-2 inline-block">Bientôt disponible</span></p>
    </div>
  </motion.div>
)

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [isMobileMenu, setIsMobileMenu] = useState(true)

  const handleTabClick = (id: Tab) => {
    setActiveTab(id)
    setIsMobileMenu(false)
  }

  const activeTabDetails = tabs.find(t => t.id === activeTab)

  return (
    <div className="bg-[#FFFAF3] min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] -mx-4 -mt-4 md:-mx-8 md:-mt-8 p-0 md:p-8 relative">
      
      {/* Desktop Header */}
      <div className="hidden md:block mb-10 pl-2">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Paramètres</h1>
        <p className="mt-2 text-slate-500 font-medium text-lg">Gérez votre compte et vos préférences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-0 md:gap-10 max-w-6xl md:mx-0">
        
        {/* Navigation Menu (Sidebar on Desktop, Main View on Mobile) */}
        <div className={`w-full md:w-80 shrink-0 ${!isMobileMenu ? 'hidden md:block' : 'block'}`}>
          
          {/* Mobile Menu Header */}
          <div className="md:hidden pt-8 pb-6 px-6 sticky top-0 bg-[#FFFAF3]/80 backdrop-blur-xl z-10 transition-all">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Réglages</h1>
          </div>
          
          {/* Settings Lists */}
          <div className="flex flex-col gap-6 px-4 md:px-0 pb-12 md:pb-0">
            
            {/* Apps/Tabs Group */}
            <div className="bg-white md:bg-transparent rounded-[2rem] md:rounded-none overflow-hidden shadow-sm md:shadow-none border border-slate-100 md:border-none p-2 md:p-0 flex flex-col gap-1 md:gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`group flex items-center justify-between gap-4 px-3 py-3 md:px-4 md:py-4 rounded-[1.5rem] text-left transition-all ${
                      isActive 
                        ? 'bg-slate-50/50 md:bg-white md:shadow-sm md:border md:border-slate-200/60' 
                        : 'bg-transparent hover:bg-slate-50 md:border md:border-transparent'
                    }`}
                  >
                     <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-105 ${tab.bg} ${tab.color}`}>
                           <tab.icon className="w-5 h-5 md:w-5 md:h-5" />
                        </div>
                        <div>
                           <h3 className={`font-bold text-[16px] md:text-[15px] ${isActive ? 'text-indigo-600' : 'text-slate-700'}`}>
                             {tab.label}
                           </h3>
                           <p className="hidden md:block text-xs mt-0.5 font-medium text-slate-400">
                             {tab.desc}
                           </p>
                        </div>
                     </div>
                     <ChevronRight className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'text-indigo-400 translate-x-1' : 'text-slate-300'}`} />
                  </button>
                )
              })}
            </div>

            {/* Danger Zone Group */}
            <div className="bg-white md:bg-transparent rounded-[2rem] md:rounded-none overflow-hidden shadow-sm md:shadow-none border border-slate-100 md:border-none p-2 md:p-0">
              <button className="flex items-center justify-between gap-4 px-3 py-3 md:px-4 md:py-4 rounded-[1.5rem] w-full text-left bg-transparent hover:bg-red-50 transition-colors group border border-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl shrink-0 bg-red-100 text-red-600 group-hover:scale-105 transition-transform">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[16px] md:text-[15px] text-red-600">Se déconnecter</h3>
                </div>
                <ChevronRight className="w-5 h-5 shrink-0 text-red-200" />
              </button>
            </div>

          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 min-w-0 ${isMobileMenu ? 'hidden md:block' : 'block'}`}>
          
          {/* Mobile Content Header (Back button) */}
          <div className="md:hidden sticky top-0 bg-[#FFFAF3]/90 backdrop-blur-xl z-20 px-4 pt-6 pb-4 flex items-center justify-between border-b border-slate-200/50 mb-6">
             <button 
                onClick={() => setIsMobileMenu(true)} 
                className="flex items-center text-indigo-600 font-bold active:opacity-70 transition-opacity"
             > 
                <ArrowLeft className="w-6 h-6 mr-1" /> 
                Réglages 
             </button>
             <h1 className="text-xl font-black text-slate-800 tracking-tight">{activeTabDetails?.label}</h1>
             <div className="w-20"></div> {/* Spacer for perfect centering */}
          </div>

          {/* Render Active Content */}
          <div className="px-4 md:px-0">
             {activeTab === 'profile' && <ProfileSettings />}
             {activeTab === 'notifications' && <PlaceholderSettings title="Notifications" desc="Personnalisez vos alertes." />}
             {activeTab === 'appearance' && <PlaceholderSettings title="Apparence" desc="Gérez le thème clair/sombre." />}
             {activeTab === 'security' && <PlaceholderSettings title="Sécurité" desc="Gérez vos mots de passe et connexions." />}
          </div>
        </div>

      </div>
    </div>
  )
}
