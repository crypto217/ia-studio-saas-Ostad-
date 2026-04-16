"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  TrendingUp, Target, BookOpen, AlertTriangle, 
  ChevronDown, FileText, MessageSquare, Sparkles,
  GraduationCap, Printer, Check
} from "lucide-react"
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, LabelList, CartesianGrid, Legend
} from "recharts"

// --- NEW MOCK DATA ---
const THEME_COLORS = {
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50 text-indigo-600' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50 text-emerald-600' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50 text-amber-600' },
  violet: { bg: 'bg-violet-600', text: 'text-violet-600', light: 'bg-violet-50 text-violet-600' }
}

const MOCK_CLASSES_DATA = {
  "Global": {
    theme: "indigo" as const,
    overview: {
      total: 120,
      average: 7.5,
      successRate: 82,
      strongSubject: "Lecture",
      weakSubject: "Production"
    },
    performance: [
      { name: 'Oral', score: 7.8 },
      { name: 'Lecture', score: 8.2 },
      { name: 'Écrit', score: 7.0 },
      { name: 'Production', score: 6.8 }
    ],
    ageData: [
      { year: '2013', Garçon: 5, Fille: 4 },
      { year: '2014', Garçon: 15, Fille: 12 },
      { year: '2015', Garçon: 20, Fille: 22 },
      { year: '2016', Garçon: 12, Fille: 14 },
      { year: '2017', Garçon: 8, Fille: 8 }
    ],
    genderData: [
      { name: 'GARÇON', value: 60, percentage: '50%', color: '#00b0f0' },
      { name: 'FILLE', value: 60, percentage: '50%', color: '#ff00ff' }
    ]
  },
  "3ème AP": {
    theme: "emerald" as const,
    overview: {
      total: 35,
      average: 8.1,
      successRate: 88,
      strongSubject: "Oral",
      weakSubject: "Lecture"
    },
    performance: [
      { name: 'Oral', score: 8.5 },
      { name: 'Lecture', score: 7.2 },
      { name: 'Écrit', score: 7.9 },
      { name: 'Production', score: 8.0 }
    ],
    ageData: [
      { year: '2015', Garçon: 5, Fille: 6 },
      { year: '2016', Garçon: 7, Fille: 10 },
      { year: '2017', Garçon: 3, Fille: 4 }
    ],
    genderData: [
      { name: 'GARÇON', value: 15, percentage: '43%', color: '#00b0f0' },
      { name: 'FILLE', value: 20, percentage: '57%', color: '#ff00ff' }
    ]
  },
  "4ème AP": {
    theme: "amber" as const,
    overview: {
      total: 42,
      average: 7.2,
      successRate: 75,
      strongSubject: "Écrit",
      weakSubject: "Oral"
    },
    performance: [
      { name: 'Oral', score: 6.5 },
      { name: 'Lecture', score: 7.0 },
      { name: 'Écrit', score: 8.2 },
      { name: 'Production', score: 6.9 }
    ],
    ageData: [
      { year: '2014', Garçon: 6, Fille: 5 },
      { year: '2015', Garçon: 12, Fille: 10 },
      { year: '2016', Garçon: 4, Fille: 5 }
    ],
    genderData: [
      { name: 'GARÇON', value: 22, percentage: '52%', color: '#00b0f0' },
      { name: 'FILLE', value: 20, percentage: '48%', color: '#ff00ff' }
    ]
  },
  "5ème AP": {
    theme: "violet" as const,
    overview: {
      total: 43,
      average: 7.8,
      successRate: 85,
      strongSubject: "Production",
      weakSubject: "Lecture"
    },
    performance: [
      { name: 'Oral', score: 7.6 },
      { name: 'Lecture', score: 6.8 },
      { name: 'Écrit', score: 7.5 },
      { name: 'Production', score: 8.5 }
    ],
    ageData: [
      { year: '2013', Garçon: 5, Fille: 4 },
      { year: '2014', Garçon: 15, Fille: 12 },
      { year: '2015', Garçon: 3, Fille: 4 }
    ],
    genderData: [
      { name: 'GARÇON', value: 23, percentage: '53%', color: '#00b0f0' },
      { name: 'FILLE', value: 20, percentage: '47%', color: '#ff00ff' }
    ]
  }
}

const supportStudents = [
  { 
    id: 1, 
    name: 'Yanis Kaddour', 
    avatar: 'Y', 
    color: 'bg-amber-100 text-amber-600', 
    reason: 'Baisse de note en Production Écrite (D)', 
    action: 'Préparer exercice', 
    ActionIcon: FileText,
    actionColor: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
  },
  { 
    id: 2, 
    name: 'Sami Benali', 
    avatar: 'S', 
    color: 'bg-sky-100 text-sky-600', 
    reason: 'Difficulté persistante en Graphie/phonie', 
    action: 'Contacter parents', 
    ActionIcon: MessageSquare,
    actionColor: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
  }
]

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value, percentage }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central" className="font-bold text-[10px] sm:text-xs">
      <tspan x={x} dy="-1em">{name}</tspan>
      <tspan x={x} dy="1.2em">{value}</tspan>
      <tspan x={x} dy="1.2em">{percentage}</tspan>
    </text>
  );
};

// Custom Tooltip for Recharts to match our theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
        <p className="font-bold text-slate-800 mb-1">{label || payload[0].name}</p>
        <p className="text-indigo-600 font-bold">
          {payload[0].value}{payload[0].name === 'score' ? ' / 10' : '%'}
        </p>
      </div>
    )
  }
  return null
}

const mockClasses = [
  "3ème AP",
  "4ème AP",
  "5ème AP",
]

export default function StatisticsPage() {
  const [selectedClass, setSelectedClass] = useState<keyof typeof MOCK_CLASSES_DATA>("Global")

  // Current class data
  const currentData = MOCK_CLASSES_DATA[selectedClass]
  const { theme, overview, performance, ageData, genderData } = currentData

  // Generate pieData dynamically based on success rate
  const pieData = [
    { name: 'A (Très bien)', value: Math.round(overview.successRate * 0.55), color: '#16a34a' },
    { name: 'B (Bien)', value: overview.successRate - Math.round(overview.successRate * 0.55), color: '#a3e635' },
    { name: 'C (Moyen)', value: Math.round((100 - overview.successRate) * 0.7), color: '#fbbf24' },
    { name: 'D (Insuffisant)', value: 100 - overview.successRate - Math.round((100 - overview.successRate) * 0.7), color: '#dc2626' }
  ]

  return (
    <div className="min-h-screen bg-[#FFFAF3] pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-8 sm:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Statistiques & Suivi</h1>
              <p className="text-slate-500 font-medium mt-1">Tableau de bord analytique de la classe</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3 print:hidden">
            <button 
              onClick={() => window.print()}
              className="hidden md:inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
            >
              <Printer className="w-5 h-5" />
              <span className="hidden sm:inline">Imprimer le rapport officiel</span>
              <span className="sm:hidden">Imprimer</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        
        {/* CLASSE SELECTOR PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar print:hidden">
          {Object.keys(MOCK_CLASSES_DATA).map((className) => {
            const isSelected = selectedClass === className;
            const themeInfo = THEME_COLORS[MOCK_CLASSES_DATA[className as keyof typeof MOCK_CLASSES_DATA].theme];
            
            return (
              <button
                key={className}
                onClick={() => setSelectedClass(className as keyof typeof MOCK_CLASSES_DATA)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                  isSelected 
                    ? `${themeInfo.bg} text-white shadow-md scale-105` 
                    : `bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:scale-105 shadow-sm`
                }`}
              >
                {className === "Global" ? "🌍 Vue Globale" : `📚 ${className}`}
              </button>
            )
          })}
        </div>

        <div className="space-y-8 print:hidden">
          {/* 1. KPIs (Le pouls de la classe) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-500">Moyenne Générale</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-xl md:text-3xl font-black text-slate-800">{overview.average}</span>
              <span className="text-sm md:text-lg font-bold text-slate-400">/ 10</span>
            </div>
            <p className="text-sm font-semibold text-emerald-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +0.4 pts ce mois
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-500">Taux de réussite</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-xl md:text-3xl font-black text-slate-800">{overview.successRate}</span>
              <span className="text-sm md:text-lg font-bold text-slate-400">%</span>
            </div>
            <p className="text-sm font-medium text-slate-400 mt-2">
              Élèves avec A ou B
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-500">Matière forte</h3>
            </div>
            <div className="mt-auto">
              <span className="text-lg md:text-2xl font-black text-slate-800 line-clamp-1">{overview.strongSubject}</span>
            </div>
            <p className="text-sm font-medium text-slate-400 mt-2">
              Moyenne au-dessus de 8/10
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col border-l-4 border-l-red-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-500">Soutien requis</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-xl md:text-3xl font-black text-red-600">3</span>
              <span className="text-sm md:text-lg font-bold text-slate-400">élèves</span>
            </div>
            <p className="text-sm font-medium text-slate-400 mt-2">
              En difficulté (D)
            </p>
          </motion.div>
        </div>

        {/* 2. Charts Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-800">Performance par Compétence</h2>
              <p className="text-sm font-medium text-slate-400">Moyenne de la classe sur 10</p>
            </div>
            <div className="h-64 md:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  />
                  <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                  <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-800">Répartition des Acquis</h2>
              <p className="text-sm font-medium text-slate-400">Pourcentage global (A, B, C, D)</p>
            </div>
            <div className="h-64 md:h-80 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text for Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">{overview.successRate}%</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">A & B</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* 3. Support Radar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Radar &quot;Soutien Scolaire&quot;</h2>
              <p className="text-sm font-medium text-slate-500">Élèves détectés par l&apos;IA nécessitant une attention particulière</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportStudents.map((student) => (
              <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-lg font-black ${student.color}`}>
                    {student.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{student.name}</h4>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      {student.reason}
                    </p>
                  </div>
                </div>
                <button className={`shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors ${student.actionColor}`}>
                  <student.ActionIcon className="w-4 h-4" />
                  {student.action}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
        </div>

        {/* 4. Official Report Table (Printable) */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0 print:mt-0 print:block">
          <div className="mb-6 flex items-center gap-3 print:mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 print:hidden">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 print:text-black print:text-2xl">Bilan Pédagogique de la Classe (Aperçu Inspecteur)</h2>
              <p className="text-sm font-medium text-slate-500 print:text-black">Répartition par genre - {selectedClass}</p>
            </div>
          </div>

          <span className="block md:hidden text-xs text-slate-400 mb-2 mt-4 italic">👉 Faites glisser le tableau pour tout voir</span>
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200 mt-6 print:shadow-none print:border-none print:mt-0 print:overflow-visible">
            <table className="w-full text-left text-sm print:border-collapse print:border print:border-black print:text-black min-w-[600px]">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 print:bg-transparent print:border-black print:text-black">
                <tr>
                  <th className="px-6 py-4 font-medium print:border print:border-black print:font-bold">Catégorie</th>
                  <th className="px-6 py-4 font-medium text-center print:border print:border-black print:font-bold">Effectif Total</th>
                  <th className="px-6 py-4 font-medium text-center print:border print:border-black print:font-bold">Ont obtenu la moyenne (&ge; 5/10)</th>
                  <th className="px-6 py-4 font-medium text-center print:border print:border-black print:font-bold">N&apos;ont pas obtenu la moyenne (&lt; 5/10)</th>
                  <th className="px-6 py-4 font-medium text-center print:border print:border-black print:font-bold">Taux de réussite (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-none">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700 print:border print:border-black print:text-black">Garçons</td>
                  <td className="px-6 py-4 text-center text-slate-600 print:border print:border-black print:text-black">{genderData[0].value}</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-semibold print:border print:border-black print:text-black print:font-normal">{Math.round(genderData[0].value * (overview.successRate/100))}</td>
                  <td className="px-6 py-4 text-center text-rose-600 font-semibold print:border print:border-black print:text-black print:font-normal">{genderData[0].value - Math.round(genderData[0].value * (overview.successRate/100))}</td>
                  <td className="px-6 py-4 text-center text-indigo-600 font-bold print:border print:border-black print:text-black print:font-normal">{overview.successRate}%</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700 print:border print:border-black print:text-black">Filles</td>
                  <td className="px-6 py-4 text-center text-slate-600 print:border print:border-black print:text-black">{genderData[1].value}</td>
                  <td className="px-6 py-4 text-center text-emerald-600 font-semibold print:border print:border-black print:text-black print:font-normal">{Math.round(genderData[1].value * (overview.successRate/100))}</td>
                  <td className="px-6 py-4 text-center text-rose-600 font-semibold print:border print:border-black print:text-black print:font-normal">{genderData[1].value - Math.round(genderData[1].value * (overview.successRate/100))}</td>
                  <td className="px-6 py-4 text-center text-indigo-600 font-bold print:border print:border-black print:text-black print:font-normal">{overview.successRate}%</td>
                </tr>
                <tr className="bg-indigo-50/50 border-t-2 border-indigo-100 font-bold text-indigo-950 print:bg-gray-100 print:border-black print:text-black">
                  <td className="px-6 py-4 print:border print:border-black">TOTAL</td>
                  <td className="px-6 py-4 text-center print:border print:border-black">{overview.total}</td>
                  <td className="px-6 py-4 text-center text-emerald-700 font-semibold print:border print:border-black print:text-black print:font-normal">{Math.round(overview.total * (overview.successRate/100))}</td>
                  <td className="px-6 py-4 text-center text-rose-700 font-semibold print:border print:border-black print:text-black print:font-normal">{overview.total - Math.round(overview.total * (overview.successRate/100))}</td>
                  <td className="px-6 py-4 text-center text-indigo-700 font-bold print:border print:border-black print:text-black print:font-normal">{overview.successRate}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Pyramide des âges (Printable Report) */}
        <div className="mt-8 bg-white rounded-2xl p-8 shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0 print:mt-0 print:block print:break-before-page">
          
          <div className="flex justify-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-serif text-red-600 font-bold text-center">Pyramide des âges</h2>
          </div>

          {/* Grid Layout matching the image */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border border-slate-300 print:border-black p-2">
            
            {/* Left Column (Line & Pie) */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              {/* Line Chart */}
              <div className="border border-slate-300 print:border-black h-[250px] p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'black' }} angle={-45} textAnchor="end" height={40} />
                    <YAxis tick={{ fontSize: 10, fill: 'black' }} domain={[0, 'dataMax + 2']} />
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Line type="linear" dataKey="Garçon" name="GARÇON" stroke="#00b0f0" strokeWidth={2} dot={{ r: 4, fill: '#00b0f0' }} />
                    <Line type="linear" dataKey="Fille" name="FILLE" stroke="#ff00ff" strokeWidth={2} dot={{ r: 4, fill: '#ff00ff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Pie Chart */}
              <div className="border border-slate-300 print:border-black h-[250px] p-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      outerRadius="90%"
                      dataKey="value"
                      stroke="white"
                      strokeWidth={2}
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend iconType="square" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Column (Bar & Table) */}
            <div className="lg:col-span-2 border border-slate-300 print:border-black p-4 flex flex-col">
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'black' }} axisLine={true} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'black' }} domain={[0, 'dataMax + 2']} />
                    <Tooltip />
                    <Bar dataKey="Garçon" name="GARÇON" fill="#00b0f0" barSize={30}>
                      <LabelList dataKey="Garçon" position="top" style={{ fontSize: '12px', fontWeight: 'bold', fill: 'black' }} />
                    </Bar>
                    <Bar dataKey="Fille" name="FILLE" fill="#ff00ff" barSize={30}>
                      <LabelList dataKey="Fille" position="top" style={{ fontSize: '12px', fontWeight: 'bold', fill: 'black' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Data Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-center border-collapse border border-black text-xs print:text-black">
                  <thead>
                    <tr>
                      <th className="border border-black p-2 w-24"></th>
                      {ageData.map(d => <th key={d.year} className="border border-black p-2 font-normal">{d.year}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 font-bold flex items-center gap-2 justify-start">
                        <div className="w-3 h-3 bg-[#00b0f0] print:bg-[#00b0f0]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div> GARÇON
                      </td>
                      {ageData.map(d => <td key={d.year} className="border border-black p-2">{d.Garçon}</td>)}
                    </tr>
                    <tr>
                      <td className="border border-black p-2 font-bold flex items-center gap-2 justify-start">
                        <div className="w-3 h-3 bg-[#ff00ff] print:bg-[#ff00ff]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div> FILLE
                      </td>
                      {ageData.map(d => <td key={d.year} className="border border-black p-2">{d.Fille}</td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-xs font-bold print:text-black">
                  <div className="w-3 h-3 bg-[#00b0f0] print:bg-[#00b0f0]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div> GARÇON
                </div>
                <div className="flex items-center gap-2 text-xs font-bold print:text-black">
                  <div className="w-3 h-3 bg-[#ff00ff] print:bg-[#ff00ff]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div> FILLE
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
