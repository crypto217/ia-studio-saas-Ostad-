"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { Users, ArrowRight, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/AuthProvider"
import { createBrowserClient } from "@/lib/supabase"

const themeMapping: Record<string, { color: string, textColor: string, borderColor: string }> = {
  blue: { color: 'from-blue-100 to-indigo-100', textColor: 'text-indigo-700', borderColor: 'hover:border-indigo-200' },
  indigo: { color: 'from-blue-100 to-indigo-100', textColor: 'text-indigo-700', borderColor: 'hover:border-indigo-200' },
  emerald: { color: 'from-emerald-100 to-teal-100', textColor: 'text-teal-700', borderColor: 'hover:border-teal-200' },
  teal: { color: 'from-emerald-100 to-teal-100', textColor: 'text-teal-700', borderColor: 'hover:border-teal-200' },
  amber: { color: 'from-amber-100 to-orange-100', textColor: 'text-amber-700', borderColor: 'hover:border-amber-200' },
  yellow: { color: 'from-amber-100 to-orange-100', textColor: 'text-amber-700', borderColor: 'hover:border-amber-200' },
  orange: { color: 'from-orange-100 to-rose-100', textColor: 'text-rose-700', borderColor: 'hover:border-rose-200' },
  rose: { color: 'from-orange-100 to-rose-100', textColor: 'text-rose-700', borderColor: 'hover:border-rose-200' }
}

const defaultTheme = { color: 'from-slate-100 to-slate-200', textColor: 'text-slate-700', borderColor: 'hover:border-slate-300' }

export default function ClassesMenu() {
  const { user, isAuthReady } = useAuth()
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!isAuthReady || !user?.id) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id)

        if (classesError) throw classesError

        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, class_id')
          .eq('teacher_id', user.id)

        if (studentsError) throw studentsError

        if (classesData) {
          const mapped = classesData.map((cls: any) => {
            const count = studentsData?.filter((s: any) => s.class_id === cls.id).length || 0
            const theme = cls.theme || 'emerald'
            const mappedTheme = themeMapping[theme] || defaultTheme
            return {
              id: cls.id,
              title: cls.name,
              studentsCount: count,
              color: mappedTheme.color,
              textColor: mappedTheme.textColor,
              borderColor: mappedTheme.borderColor
            }
          })
          setClasses(mapped)
        }
      } catch (err) {
        console.error("Error loading grades menu:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, isAuthReady])

  return (
    <div className="min-h-screen pb-28 md:pb-24 bg-[#FFFAF3]">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-6 md:py-8 sm:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">Mes Classes<br className="block sm:hidden" /><span className="text-slate-400 font-bold hidden sm:inline"> - Carnet de notes</span></h1>
          </div>
          <p className="text-slate-500 font-medium text-sm sm:text-lg max-w-2xl mt-3 sm:mt-0">
            Sélectionnez une classe pour accéder à ses évaluations.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6 sm:mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-2" />
            <p className="text-slate-500 font-medium">Chargement de vos classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 text-center max-w-md mx-auto shadow-sm">
            <p className="text-slate-500 font-medium mb-4">Vous n&apos;avez pas encore créé de classes.</p>
            <Link 
              href="/classes" 
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors"
            >
              Créer une classe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {classes.map((cls) => (
              <Link key={cls.id} href={`/grades/${cls.id}`} className="block group">
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-md sm:shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all border-2 border-slate-100 ${cls.borderColor} flex flex-col h-full`}
                >
                  <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:mb-6">
                    <div className="flex items-center gap-4 sm:mb-6 w-full sm:w-auto">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-gradient-to-br ${cls.color} flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                        <Users className={`w-7 h-7 sm:w-8 sm:h-8 ${cls.textColor}`} />
                      </div>
                      <div className="flex flex-col sm:hidden">
                        <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                          {cls.title}
                        </h3>
                        <span className={`inline-flex items-center text-xs font-bold ${cls.textColor}`}>
                          {cls.studentsCount} élèves
                        </span>
                      </div>
                    </div>
                    
                    {/* Arrow for both mobile and desktop positioned correctly */}
                    <div className="w-10 h-10 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="hidden sm:block">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors mb-2 leading-tight">
                      {cls.title}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-slate-50 ${cls.textColor}`}>
                      {cls.studentsCount} élèves
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

