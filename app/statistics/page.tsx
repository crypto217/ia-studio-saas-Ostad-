"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts'
import { 
  Users, Baby, School, CalendarDays, Sparkles,
  Trophy, Medal, ArrowUpRight, ArrowDownRight, Minus, BookOpen, GraduationCap, CheckCircle2, BarChart3, Star, Heart
} from "lucide-react"
import { db } from "@/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { useAuth } from "@/components/AuthProvider"

// --- THEME COLORS ---
type ThemeColor = 'indigo' | 'emerald' | 'violet' | 'amber' | 'rose' | 'sky' | 'fuchsia';

const THEME_COLORS: Record<ThemeColor, any> = {
  indigo: {
    bg: 'bg-indigo-500',
    border: 'border-indigo-600',
    borderB: 'border-indigo-700',
    text: 'text-indigo-600',
    textWhite: 'text-white',
    lightBg: 'bg-indigo-100',
    lightBorder: 'border-indigo-200',
    textLight: 'text-indigo-100',
    glow: 'bg-indigo-700/30',
    buttonActive: 'bg-indigo-500 text-white border-indigo-700 shadow-md',
    buttonHover: 'hover:text-indigo-600',
  },
  emerald: {
    bg: 'bg-emerald-500',
    border: 'border-emerald-600',
    borderB: 'border-emerald-700',
    text: 'text-emerald-600',
    textWhite: 'text-white',
    lightBg: 'bg-emerald-100',
    lightBorder: 'border-emerald-200',
    textLight: 'text-emerald-100',
    glow: 'bg-emerald-700/30',
    buttonActive: 'bg-emerald-500 text-white border-emerald-700 shadow-md',
    buttonHover: 'hover:text-emerald-600',
  },
  violet: {
    bg: 'bg-violet-500',
    border: 'border-violet-600',
    borderB: 'border-violet-700',
    text: 'text-violet-600',
    textWhite: 'text-white',
    lightBg: 'bg-violet-100',
    lightBorder: 'border-violet-200',
    textLight: 'text-violet-100',
    glow: 'bg-violet-700/30',
    buttonActive: 'bg-violet-500 text-white border-violet-700 shadow-md',
    buttonHover: 'hover:text-violet-600',
  },
  amber: {
    bg: 'bg-amber-500',
    border: 'border-amber-600',
    borderB: 'border-amber-700',
    text: 'text-amber-600',
    textWhite: 'text-white',
    lightBg: 'bg-amber-100',
    lightBorder: 'border-amber-200',
    textLight: 'text-amber-100',
    glow: 'bg-amber-700/30',
    buttonActive: 'bg-amber-500 text-white border-amber-700 shadow-md',
    buttonHover: 'hover:text-amber-600',
  },
  rose: {
    bg: 'bg-rose-500',
    border: 'border-rose-600',
    borderB: 'border-rose-700',
    text: 'text-rose-600',
    textWhite: 'text-white',
    lightBg: 'bg-rose-100',
    lightBorder: 'border-rose-200',
    textLight: 'text-rose-100',
    glow: 'bg-rose-700/30',
    buttonActive: 'bg-rose-500 text-white border-rose-700 shadow-md',
    buttonHover: 'hover:text-rose-600',
  },
  sky: {
    bg: 'bg-sky-500',
    border: 'border-sky-600',
    borderB: 'border-sky-700',
    text: 'text-sky-600',
    textWhite: 'text-white',
    lightBg: 'bg-sky-100',
    lightBorder: 'border-sky-200',
    textLight: 'text-sky-100',
    glow: 'bg-sky-700/30',
    buttonActive: 'bg-sky-500 text-white border-sky-700 shadow-md',
    buttonHover: 'hover:text-sky-600',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500',
    border: 'border-fuchsia-600',
    borderB: 'border-fuchsia-700',
    text: 'text-fuchsia-600',
    textWhite: 'text-white',
    lightBg: 'bg-fuchsia-100',
    lightBorder: 'border-fuchsia-200',
    textLight: 'text-fuchsia-100',
    glow: 'bg-fuchsia-700/30',
    buttonActive: 'bg-fuchsia-500 text-white border-fuchsia-700 shadow-md',
    buttonHover: 'hover:text-fuchsia-600',
  }
}

// --- MOCK DATA ---
const MOCK_CLASSES_DATA = {
  "Global": {
    name: "Toutes les classes",
    theme: "indigo" as ThemeColor,
    ageData: [
      { year: '2012', Garçon: 1, Fille: 1 },
      { year: '2013', Garçon: 4, Fille: 2 },
      { year: '2014', Garçon: 9, Fille: 11 },
      { year: '2015', Garçon: 8, Fille: 9 },
      { year: '2016', Garçon: 14, Fille: 16 },
      { year: '2017', Garçon: 9, Fille: 7 },
      { year: '2018', Garçon: 1, Fille: 0 },
    ],
    genderData: [
      { name: 'Garçon', value: 46, percentage: '50%', color: '#38bdf8' }, // sky-400
      { name: 'Fille', value: 46, percentage: '50%', color: '#fb7185' }, // rose-400
    ],
    overview: { total: "92", boys: "46", girls: "46", majorityYear: "2016" },
    performance: {
      topStudents: [
        { name: "Amira B.", score: "19.5/20", detail: "5ème AP", trend: "+0.5", trendUp: true },
        { name: "Yanis M.", score: "18.7/20", detail: "4ème AP", trend: "+1.2", trendUp: true },
        { name: "Lina K.", score: "18.5/20", detail: "5ème AP", trend: "-0.2", trendUp: false },
        { name: "Sami T.", score: "17.8/20", detail: "3ème AP", trend: "=", trendUp: null },
      ],
      topCategories: [
        { name: "5ème AP", score: "15.2/20", subtitle: "Moyenne générale" },
        { name: "4ème AP", score: "14.5/20", subtitle: "Moyenne générale" },
        { name: "3ème AP", score: "13.8/20", subtitle: "Moyenne générale" },
      ],
      categoryTitle: "Top Classes"
    }
  },
  "3ème AP": {
    name: "3ème AP",
    theme: "emerald" as ThemeColor,
    ageData: [
      { year: '2012', Garçon: 0, Fille: 0 },
      { year: '2013', Garçon: 0, Fille: 0 },
      { year: '2014', Garçon: 2, Fille: 1 },
      { year: '2015', Garçon: 3, Fille: 4 },
      { year: '2016', Garçon: 8, Fille: 7 },
      { year: '2017', Garçon: 5, Fille: 2 },
      { year: '2018', Garçon: 1, Fille: 0 },
    ],
    genderData: [
      { name: 'Garçon', value: 19, percentage: '58%', color: '#38bdf8' },
      { name: 'Fille', value: 14, percentage: '42%', color: '#fb7185' },
    ],
    overview: { total: "33", boys: "19", girls: "14", majorityYear: "2016" },
    performance: {
      topStudents: [
        { name: "Sami T.", score: "17.8/20", detail: "Excellent", trend: "+0.5", trendUp: true },
        { name: "Rania L.", score: "16.5/20", detail: "Très bien", trend: "+1.0", trendUp: true },
        { name: "Karim D.", score: "15.9/20", detail: "Bien", trend: "-0.5", trendUp: false },
        { name: "Aya M.", score: "15.5/20", detail: "Bien", trend: "=", trendUp: null },
      ],
      topCategories: [
        { name: "Lecture", score: "15.5/20", subtitle: "Moyenne de la classe" },
        { name: "Écriture", score: "14.2/20", subtitle: "Moyenne de la classe" },
        { name: "Vocabulaire", score: "13.5/20", subtitle: "Moyenne de la classe" },
      ],
      categoryTitle: "Top Matières"
    }
  },
  "4ème AP": {
    name: "4ème AP (Quatrième 2)",
    theme: "violet" as ThemeColor,
    ageData: [
      { year: '2012', Garçon: 0, Fille: 0 },
      { year: '2013', Garçon: 1, Fille: 0 },
      { year: '2014', Garçon: 0, Fille: 2 },
      { year: '2015', Garçon: 1, Fille: 0 },
      { year: '2016', Garçon: 6, Fille: 9 },
      { year: '2017', Garçon: 4, Fille: 5 },
      { year: '2018', Garçon: 0, Fille: 0 },
    ],
    genderData: [
      { name: 'Garçon', value: 12, percentage: '43%', color: '#38bdf8' },
      { name: 'Fille', value: 16, percentage: '57%', color: '#fb7185' },
    ],
    overview: { total: "28", boys: "12", girls: "16", majorityYear: "2016" },
    performance: {
      topStudents: [
        { name: "Yanis M.", score: "18.7/20", detail: "Excellent", trend: "+1.2", trendUp: true },
        { name: "Ines R.", score: "17.9/20", detail: "Très bien", trend: "+0.8", trendUp: true },
        { name: "Anis B.", score: "17.2/20", detail: "Très bien", trend: "=", trendUp: null },
        { name: "Sarah K.", score: "16.8/20", detail: "Bien", trend: "-0.3", trendUp: false },
      ],
      topCategories: [
        { name: "Grammaire", score: "16.0/20", subtitle: "Moyenne de la classe" },
        { name: "Lecture", score: "15.8/20", subtitle: "Moyenne de la classe" },
        { name: "Conjugaison", score: "14.5/20", subtitle: "Moyenne de la classe" },
      ],
      categoryTitle: "Top Matières"
    }
  },
  "5ème AP": {
    name: "5ème AP",
    theme: "amber" as ThemeColor,
    ageData: [
      { year: '2012', Garçon: 1, Fille: 1 },
      { year: '2013', Garçon: 3, Fille: 2 },
      { year: '2014', Garçon: 7, Fille: 8 },
      { year: '2015', Garçon: 4, Fille: 5 },
      { year: '2016', Garçon: 0, Fille: 0 },
      { year: '2017', Garçon: 0, Fille: 0 },
      { year: '2018', Garçon: 0, Fille: 0 },
    ],
    genderData: [
      { name: 'Garçon', value: 15, percentage: '48%', color: '#38bdf8' },
      { name: 'Fille', value: 16, percentage: '52%', color: '#fb7185' },
    ],
    overview: { total: "31", boys: "15", girls: "16", majorityYear: "2014" },
    performance: {
      topStudents: [
        { name: "Amira B.", score: "19.5/20", detail: "Excellent", trend: "+0.5", trendUp: true },
        { name: "Lina K.", score: "18.5/20", detail: "Très bien", trend: "-0.2", trendUp: false },
        { name: "Mehdi S.", score: "18.0/20", detail: "Très bien", trend: "+0.3", trendUp: true },
        { name: "Wassim A.", score: "17.5/20", detail: "Très bien", trend: "=", trendUp: null },
      ],
      topCategories: [
        { name: "Production Écrite", score: "17.5/20", subtitle: "Moyenne de la classe" },
        { name: "Lecture", score: "16.8/20", subtitle: "Moyenne de la classe" },
        { name: "Orthographe", score: "15.5/20", subtitle: "Moyenne de la classe" },
      ],
      categoryTitle: "Top Matières"
    }
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 } 
  }
}

export default function StatisticsPage() {
  const { user, isAuthReady } = useAuth()
  const [selectedClass, setSelectedClass] = useState<keyof typeof MOCK_CLASSES_DATA>("Global")
  const [attendanceRate, setAttendanceRate] = useState<string>("N/A")
  const [attendanceData, setAttendanceData] = useState<{name: string, value: number, color: string}[]>([])
  
  const currentData = MOCK_CLASSES_DATA[selectedClass]
  const { ageData, genderData, overview, performance, theme } = currentData
  const t = THEME_COLORS[theme] || THEME_COLORS.indigo;

  useEffect(() => {
    const fetchAttendanceStats = async () => {
      if (!isAuthReady || !user) return
      
      try {
        let q;
        if (selectedClass === "Global") {
          q = query(collection(db, "attendances"), where("teacherId", "==", user.uid))
        } else {
          q = query(collection(db, "attendances"), where("teacherId", "==", user.uid))
        }
        
        const snapshot = await getDocs(q)
        if (snapshot.empty) {
          setAttendanceRate("N/A")
          setAttendanceData([])
          return
        }

        let totalStudents = 0
        let totalPresent = 0
        let totalAbsent = 0
        let totalLate = 0

        snapshot.docs.forEach(doc => {
          const records = doc.data().records || {}
          Object.values(records).forEach(status => {
            totalStudents++
            if (status === 'present') {
              totalPresent++
            } else if (status === 'late') {
              totalLate++
            } else if (status === 'absent') {
              totalAbsent++
            }
          })
        })

        if (totalStudents === 0) {
          setAttendanceRate("N/A")
          setAttendanceData([])
        } else {
          const rate = Math.round(((totalPresent + totalLate) / totalStudents) * 100)
          setAttendanceRate(`${rate}%`)
          setAttendanceData([
            { name: 'Présent', value: totalPresent, color: '#34d399' }, // emerald-400
            { name: 'En retard', value: totalLate, color: '#fbbf24' }, // amber-400
            { name: 'Absent', value: totalAbsent, color: '#fb7185' }, // rose-400
          ])
        }
      } catch (error) {
        console.error("Error fetching attendance stats", error)
      }
    }

    fetchAttendanceStats()
  }, [user, isAuthReady, selectedClass])

  const overviewStats = [
    { title: "Total Élèves", value: overview.total, icon: Users, color: t.text, bg: t.lightBg, borderColor: t.lightBorder, iconBorder: t.lightBorder },
    { title: "Garçons", value: overview.boys, icon: Baby, color: "text-sky-600", bg: "bg-sky-100", borderColor: "border-sky-200", iconBorder: "border-sky-200" },
    { title: "Filles", value: overview.girls, icon: Baby, color: "text-rose-600", bg: "bg-rose-100", borderColor: "border-rose-200", iconBorder: "border-rose-200" },
    { title: "Taux de présence", value: attendanceRate, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", borderColor: "border-emerald-200", iconBorder: "border-emerald-200" },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-100">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        {/* HERO SECTION */}
        <div className={`relative overflow-hidden rounded-[2rem] ${t.bg} px-6 py-8 md:px-10 md:py-12 text-white shadow-sm border ${t.border} mb-8 flex items-center justify-between transition-colors duration-500`}>
          {/* Background decorative blobs */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className={`absolute right-0 bottom-0 h-64 w-64 rounded-full ${t.glow} blur-3xl transition-colors duration-500`} />

          <div className="relative z-10 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm mb-6 shadow-sm"
            >
              <School className="w-4 h-4" />
              Année scolaire : 2025/2026
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4 flex items-center gap-3"
            >
              Statistiques
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${t.textLight} text-base md:text-lg font-semibold max-w-2xl transition-colors duration-500`}
            >
              Analysez les performances et la démographie de vos classes avec style.
            </motion.p>
          </div>

          {/* Floating Elements for Hero */}
          <div className="absolute right-10 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center pointer-events-none">
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [-10, 10, -10] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute right-12 top-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 shadow-lg border-b-4 border-yellow-500"
            >
              <BarChart3 className="h-8 w-8 text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0], rotate: [10, -5, 10] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
              className="absolute left-10 bottom-12 flex h-14 w-14 items-center justify-center rounded-full bg-rose-400 shadow-lg border-b-4 border-rose-500"
            >
              <Heart className="h-7 w-7 fill-white text-white" />
            </motion.div>
          </div>
        </div>

        {/* Class Selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {Object.keys(MOCK_CLASSES_DATA).map(cls => {
            const isSelected = selectedClass === cls;
            const clsTheme = THEME_COLORS[MOCK_CLASSES_DATA[cls as keyof typeof MOCK_CLASSES_DATA].theme];
            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls as any)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:translate-y-1 ${
                  isSelected 
                    ? clsTheme.buttonActive
                    : `bg-white text-slate-600 border-slate-200 hover:bg-slate-50 ${clsTheme.buttonHover} shadow-sm`
                }`}
              >
                {cls === "Global" ? "🌍 Globale" : `🏫 ${cls}`}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedClass}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            
            {/* OVERVIEW STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {overviewStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div 
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className={`bg-white rounded-[2rem] p-6 border-2 ${stat.borderColor} border-b-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} relative z-10 group-hover:scale-110 transition-transform duration-300 border-b-4 ${stat.iconBorder}`}>
                      <Icon className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div className="relative z-10">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</p>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* CHARTS ROW 1: Pie & Line */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* PIE CHART */}
              <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 border-b-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-[400px] group">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900">Répartition par genre</h2>
                  <div className="p-3 bg-sky-100 rounded-2xl text-sky-600 border-b-4 border-sky-200 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="90%"
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        cursor={false}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-black text-slate-900">{overview.total}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Élèves</span>
                  </div>
                </div>
                <div className="flex justify-center gap-6 mt-6">
                  {genderData.map(g => (
                    <div key={g.name} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: g.color }} />
                      <span className="text-sm font-bold text-slate-700">{g.name} <span className="text-slate-400 ml-1">{g.percentage}</span></span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ATTENDANCE PIE CHART */}
              <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 border-b-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-[400px] group">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900">Taux de présence</h2>
                  <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 border-b-4 border-emerald-200 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                {attendanceData.length > 0 ? (
                  <>
                    <div className="flex-1 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={attendanceData}
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="90%"
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {attendanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            cursor={false}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-black text-slate-900">{attendanceRate}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Présents</span>
                      </div>
                    </div>
                    <div className="flex justify-center flex-wrap gap-4 mt-6">
                      {attendanceData.map(g => (
                        <div key={g.name} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: g.color }} />
                          <span className="text-sm font-bold text-slate-700">{g.name} <span className="text-slate-400 ml-1">{g.value}</span></span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">Aucune donnée d&apos;appel disponible pour cette classe.</p>
                  </div>
                )}
              </motion.div>

              {/* AREA CHART */}
              <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 border-b-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-[400px] group">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-slate-900">Tendance des naissances</h2>
                  <div className={`p-3 ${t.lightBg} rounded-2xl ${t.text} border-b-4 ${t.lightBorder} group-hover:scale-110 transition-transform`}>
                    <CalendarDays className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGarcon" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorFille" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold', padding: '12px 16px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="Garçon" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorGarcon)" activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="Fille" stroke="#fb7185" strokeWidth={3} fillOpacity={1} fill="url(#colorFille)" activeDot={{ r: 6, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

            </div>

            {/* CHARTS ROW 2: Bar Chart & Table */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-slate-100 border-b-8 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pyramide détaillée</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Répartition des effectifs par année et par genre.</p>
                </div>
                <div className={`p-3 ${t.lightBg} rounded-2xl ${t.text} border-b-4 ${t.lightBorder} group-hover:scale-110 transition-transform`}>
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
              
              <div className="h-[350px] w-full mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600, fontSize: 13 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '14px', paddingTop: '20px' }} />
                    <Bar dataKey="Garçon" fill="#38bdf8" radius={[8, 8, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="Fille" fill="#fb7185" radius={[8, 8, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto rounded-2xl border-2 border-slate-100 shadow-inner bg-slate-50/50">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="text-slate-400 font-bold text-xs uppercase tracking-widest border-b-2 border-slate-100">
                    <tr>
                      <th className="px-6 py-5">Genre</th>
                      {ageData.map(d => <th key={d.year} className="px-6 py-5 text-center">{d.year}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-100">
                    <motion.tr whileHover={{ backgroundColor: 'rgba(248, 250, 252, 1)' }} className="transition-colors cursor-default">
                      <td className="px-6 py-5 font-black text-sky-500 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)]" /> Garçon
                      </td>
                      {ageData.map(d => <td key={d.year} className="px-6 py-5 text-center font-bold text-slate-700">{d.Garçon}</td>)}
                    </motion.tr>
                    <motion.tr whileHover={{ backgroundColor: 'rgba(248, 250, 252, 1)' }} className="transition-colors cursor-default">
                      <td className="px-6 py-5 font-black text-rose-500 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.4)]" /> Fille
                      </td>
                      {ageData.map(d => <td key={d.year} className="px-6 py-5 text-center font-bold text-slate-700">{d.Fille}</td>)}
                    </motion.tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* PERFORMANCES ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              
              {/* Top Students */}
              <motion.div variants={itemVariants} className={`relative overflow-hidden ${t.bg} rounded-[2rem] p-6 sm:p-8 border-b-8 ${t.borderB} shadow-sm transition-colors duration-500`}>
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className={`p-3 bg-white ${t.text} rounded-2xl shadow-sm border-b-4 ${t.lightBorder}`}>
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Palmarès des Élèves</h2>
                </div>
                
                <div className="space-y-4 relative z-10">
                  {performance.topStudents.map((student, i) => {
                    const isGold = i === 0;
                    const isSilver = i === 1;
                    const isBronze = i === 2;
                    
                    let bgClass = "bg-white/20 border-white/30 text-white";
                    let rankClass = `bg-white ${t.text} border-b-4 ${t.lightBorder}`;
                    let scoreClass = "text-white";
                    
                    if (isGold) {
                      bgClass = "bg-white border-white text-slate-900 shadow-md";
                      rankClass = `${t.bg} text-white border-b-4 ${t.borderB}`;
                      scoreClass = t.text;
                    }

                    // Calculate score percentage for the bar
                    const scoreNum = parseFloat(student.score.split('/')[0]);
                    const scorePct = (scoreNum / 20) * 100;

                    return (
                      <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.02, x: 5 }}
                        className={`relative overflow-hidden flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${bgClass}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${rankClass}`}>
                            #{i + 1}
                          </div>
                          <div>
                            <p className="font-bold text-lg">{student.name}</p>
                            <p className="text-sm font-semibold opacity-80">{student.detail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-xl ${scoreClass}`}>{student.score}</p>
                          <div className={`flex items-center justify-end gap-1 text-sm font-bold mt-1 ${
                            student.trendUp === true ? (isGold ? 'text-emerald-500' : 'text-emerald-300') : 
                            student.trendUp === false ? (isGold ? 'text-rose-500' : 'text-rose-300') : (isGold ? 'text-slate-400' : 'text-white/50')
                          }`}>
                            {student.trendUp === true && <ArrowUpRight className="w-4 h-4" />}
                            {student.trendUp === false && <ArrowDownRight className="w-4 h-4" />}
                            {student.trendUp === null && <Minus className="w-4 h-4" />}
                            {student.trend}
                          </div>
                        </div>
                        
                        {/* Score Progress Bar */}
                        <div className="absolute bottom-0 left-0 h-1.5 bg-black/10 w-full">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${scorePct}%` }}
                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                            className={`h-full ${isGold ? t.bg : 'bg-white'}`}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Top Categories */}
              <motion.div variants={itemVariants} className={`relative overflow-hidden ${t.bg} rounded-[2rem] p-6 sm:p-8 border-b-8 ${t.borderB} shadow-sm transition-colors duration-500`}>
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className={`p-3 bg-white ${t.text} rounded-2xl shadow-sm border-b-4 ${t.lightBorder}`}>
                    <Medal className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{performance.categoryTitle}</h2>
                </div>
                
                <div className="space-y-4 relative z-10">
                  {performance.topCategories.map((cat, i) => {
                    // Calculate score percentage for the bar
                    const scoreNum = parseFloat(cat.score.split('/')[0]);
                    const scorePct = (scoreNum / 20) * 100;

                    return (
                      <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-white/20 border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl bg-white ${t.text} flex items-center justify-center border-b-4 ${t.lightBorder} shadow-sm`}>
                            {selectedClass === "Global" ? <GraduationCap className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">{cat.name}</p>
                            <p className="text-sm font-semibold text-white opacity-80">{cat.subtitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-xl text-white">{cat.score}</p>
                        </div>

                        {/* Score Progress Bar */}
                        <div className="absolute bottom-0 left-0 h-1.5 bg-black/10 w-full">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${scorePct}%` }}
                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                            className="h-full bg-white"
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
