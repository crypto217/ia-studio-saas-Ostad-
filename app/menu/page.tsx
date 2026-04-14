import Link from "next/link"
import { Users, Sparkles, BarChart2, Settings, ChevronRight, Library } from "lucide-react"

const menuItems = [
  { name: "Générateur IA", href: "/ai-generator", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-100" },
  { name: "Bibliothèque", href: "/courses", icon: Library, color: "text-violet-500", bg: "bg-violet-100" },
  { name: "Statistiques", href: "/statistics", icon: BarChart2, color: "text-emerald-500", bg: "bg-emerald-100" },
  { name: "Paramètres", href: "/settings", icon: Settings, color: "text-slate-500", bg: "bg-slate-100" },
]

export default function MenuPage() {
  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-3xl font-black text-slate-800">Menu</h1>
      
      <div className="bg-white rounded-[2rem] border-4 border-slate-100 overflow-hidden">
        {menuItems.map((item, index) => (
          <Link 
            key={item.name} 
            href={item.href}
            className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${index !== menuItems.length - 1 ? 'border-b-2 border-slate-100' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold text-slate-700">{item.name}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}
