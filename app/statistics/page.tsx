"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "motion/react";
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from "recharts";
import { Trophy, CheckCircle, Feather, Sparkles, TrendingUp, FileBarChart } from "lucide-react";

// --- MOCK DATA ---
const sparklineMoyenne = [{ v: 6 }, { v: 6.5 }, { v: 7 }, { v: 7.2 }, { v: 8.0 }, { v: 8.5 }, { v: 9.1 }];
const sparklinePresence = [{ v: 85 }, { v: 88 }, { v: 82 }, { v: 90 }, { v: 95 }, { v: 97 }, { v: 95.8 }];
const sparklineDevoirs = [{ v: 20 }, { v: 25 }, { v: 22 }, { v: 30 }, { v: 35 }, { v: 40 }, { v: 42 }];

const podiumData = [
  { rank: 2, name: 'Rayane', score: 9.1, colorHex: '#94A3B8', height: '60%', seed: 'Rayane' },
  { rank: 1, name: 'Lina', score: 9.6, colorHex: '#FBBF24', height: '80%', seed: 'Lina' },
  { rank: 3, name: 'Inès', score: 8.7, colorHex: '#D97706', height: '50%', seed: 'Ines' }
];

const aiInsights = [
  "La lecture est en progrès constant (+15% ce mois-ci). Bonne dynamique !",
  "La conjugaison nécessite une révision collective (notamment les verbes du 3ème groupe).",
  "L'assiduité est excellente dans la classe A, un bel engagement des élèves !"
];

const ringData1 = [{ name: 'Fait', value: 78, color: '#8B5CF6' }, { name: 'Reste', value: 22, color: '#EDE9FE' }];
const ringData2 = [{ name: 'Fait', value: 92, color: '#10B981' }, { name: 'Reste', value: 8, color: '#D1FAE5' }];

const ageData = [
  { age: '8 ans', garcons: 12, filles: 15 },
  { age: '9 ans', garcons: 25, filles: 22 },
  { age: '10 ans', garcons: 18, filles: 20 },
  { age: '11 ans', garcons: 5, filles: 4 },
];

const absenceData = [
  { month: 'Sep', absences: 12 },
  { month: 'Oct', absences: 8 },
  { month: 'Nov', absences: 15 },
  { month: 'Déc', absences: 20 },
  { month: 'Jan', absences: 5 },
  { month: 'Fév', absences: 10 },
];

const totalGarcons = ageData.reduce((sum, item) => sum + item.garcons, 0);
const totalFilles = ageData.reduce((sum, item) => sum + item.filles, 0);
const totalEffectif = totalGarcons + totalFilles;
const pariteData = [
  { name: 'Garçons', value: totalGarcons, fill: '#3B82F6' },
  { name: 'Filles', value: totalFilles, fill: '#EC4899' }
];

// --- VARIANTS FRAMER MOTION ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.5 } }
};

  export default function StatisticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Global");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getDynamicMessage = () => {
    if (selectedClass === "Global") return "Bravo ! Le niveau général a augmenté de 8% ce mois-ci !";
    return `Bravo ! Le niveau de la ${selectedClass} est en excellente progression !`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isMounted) return <div className="min-h-screen bg-slate-50 p-4" />;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans pb-24">
      
      {/* VUE IMPRESSION : Le Rapport Officiel rendu hors-champ pour le PDF export */}
      <div id="rapport-inspecteur" className="hidden print:block print:w-full print:bg-white text-black a4-page w-full max-w-[210mm] mx-auto p-12 border border-slate-200">
        <div className="text-center mb-10 border-b-2 border-slate-800 pb-6">
          <p className="font-bold text-sm tracking-widest uppercase mb-1">République Algérienne Démocratique et Populaire</p>
          <p className="font-bold text-sm uppercase mb-6">Ministère de l&apos;Éducation Nationale</p>
          <h1 className="text-3xl font-black uppercase tracking-tight">Fiche Statistique de la Classe</h1>
          <p className="text-lg font-medium text-slate-600 mt-2">Année Scolaire 2025/2026</p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* Graphique 1: Pyramide des Âges */}
          <div>
             <h2 className="text-xl font-bold border-b border-slate-300 border-dotted pb-2 mb-6">1. Pyramide des Âges</h2>
             <div className="h-64 flex justify-center">
                  <BarChart style={{ outline: 'none' }} width={700} height={256} data={ageData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 600 }} />
                    <YAxis dataKey="age" type="category" axisLine={false} tickLine={false} tick={{ fill: '#0F172A', fontWeight: 700 }} width={60} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="garcons" name="Garçons" fill="#3B82F6" isAnimationActive={false} barSize={20} />
                    <Bar dataKey="filles" name="Filles" fill="#EC4899" isAnimationActive={false} barSize={20} />
                  </BarChart>
             </div>
          </div>

          {/* Graphique 2: Répartition Filles/Garçons */}
          <div>
             <h2 className="text-xl font-bold border-b border-slate-300 border-dotted pb-2 mb-6">2. Parité Filles / Garçons</h2>
             <div className="flex items-center justify-around h-64 gap-8">
                <div className="flex-1 flex justify-center h-full">
                    <PieChart style={{ outline: 'none' }} width={300} height={256}>
                      <Pie 
                        data={pariteData}
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80} 
                        label 
                        isAnimationActive={false}
                      >
                        {pariteData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Legend iconType="circle" />
                    </PieChart>
                </div>
                
                {/* Tableau récapitulatif */}
                <div className="flex-1 max-w-sm border border-slate-300 rounded-lg overflow-hidden">
                   <table className="w-full text-left text-sm">
                     <thead className="bg-slate-100 border-b border-slate-300">
                       <tr><th className="p-3 font-bold">Catégorie</th><th className="p-3 font-bold text-right">Effectif</th><th className="p-3 font-bold text-right">%</th></tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                       <tr><td className="p-3 font-medium text-slate-800">Garçons</td><td className="p-3 text-right">{totalGarcons}</td><td className="p-3 text-right">{((totalGarcons / totalEffectif) * 100).toFixed(1)}%</td></tr>
                       <tr><td className="p-3 font-medium text-slate-800">Filles</td><td className="p-3 text-right">{totalFilles}</td><td className="p-3 text-right">{((totalFilles / totalEffectif) * 100).toFixed(1)}%</td></tr>
                       <tr className="bg-slate-50"><td className="p-3 font-bold text-slate-900">Total</td><td className="p-3 font-bold text-right">{totalEffectif}</td><td className="p-3 font-bold text-right">100%</td></tr>
                     </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-16 pt-8 border-t-2 border-slate-800 flex justify-between text-sm font-bold text-slate-500">
           <p>Généré par Ludiclass © {new Date().getFullYear()}</p>
           <p>Cachet et Signature de l&apos;Inspecteur</p>
        </div>
      </div>

      <motion.div 
        className="max-w-6xl mx-auto space-y-6 sm:space-y-8 print:hidden"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* Header Magique */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-indigo-200/50 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h1 className="font-black text-3xl sm:text-5xl mb-4 tracking-tight">
              L&apos;Observatoire de mes Classes ✨
            </h1>
            <div className="inline-flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30">
              <span className="font-medium text-lg text-indigo-50">{getDynamicMessage()}</span>
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          {/* Filter */}
          <motion.div variants={itemVariants} className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-w-full snap-x snap-mandatory">
            {['Global', '3ème AP - A', '4ème AP - B', '5ème AP - C'].map(cls => (
              <motion.button 
                key={cls}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedClass(cls)}
                className={`shrink-0 snap-start px-6 py-3 rounded-full font-bold transition-all border-2 ${selectedClass === cls ? 'bg-slate-900 border-slate-900 text-white scale-105 shadow-md' : 'bg-white border-transparent text-slate-600 hover:border-slate-200'}`}
              >
                {cls}
              </motion.button>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="shrink-0 w-full sm:w-auto">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handlePrint}
              className="w-full sm:w-auto flex shrink-0 justify-center items-center gap-2 bg-rose-500 text-white border-2 border-rose-600 border-b-[4px] hover:bg-rose-400 hover:border-rose-500 active:border-b-2 active:translate-y-[2px] rounded-[1.5rem] px-5 py-3 font-black text-sm sm:text-base transition-all shadow-md"
            >
              <FileBarChart className="w-5 h-5" />
              Générer le Rapport Inspecteur (PDF) ✨
            </motion.button>
          </motion.div>
        </div>

        {/* Cartes de Performance (Bento 3D) */}
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full">
          
          {/* Carte 1 : Moyenne (Rose) */}
          <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="w-[85vw] md:w-auto shrink-0 snap-center bg-white border-2 border-slate-200 border-b-[6px] rounded-[2.5rem] p-4 sm:p-6 flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-pink-100 p-3 rounded-2xl w-14 h-14 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-pink-500" />
              </div>
              <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg text-sm font-bold border border-green-100">
                <TrendingUp className="w-4 h-4" /> +1.2
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-bold mb-1">Moyenne Générale</h3>
              <div className="text-4xl font-black text-slate-800">8.5<span className="text-xl text-slate-400">/10</span></div>
            </div>
            <div className="h-16 mt-4 -mx-2 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
                <LineChart style={{ outline: 'none' }} data={sparklineMoyenne}>
                  <Line type="monotone" dataKey="v" stroke="#EC4899" strokeWidth={4} dot={false} strokeLinecap="round" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Carte 2 : Présence (Vert) */}
          <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="w-[85vw] md:w-auto shrink-0 snap-center bg-white border-2 border-slate-200 border-b-[6px] rounded-[2.5rem] p-4 sm:p-6 flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-emerald-100 p-3 rounded-2xl w-14 h-14 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg text-sm font-bold border border-green-100">
                <TrendingUp className="w-4 h-4" /> +4%
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-bold mb-1">Taux de Présence</h3>
              <div className="text-4xl font-black text-slate-800">95.8<span className="text-xl text-slate-400">%</span></div>
            </div>
            <div className="h-16 mt-4 -mx-2 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
                <LineChart style={{ outline: 'none' }} data={sparklinePresence}>
                  <Line type="monotone" dataKey="v" stroke="#10B981" strokeWidth={4} dot={false} strokeLinecap="round" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Carte 3 : Devoirs (Orange) */}
          <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="w-[85vw] md:w-auto shrink-0 snap-center bg-white border-2 border-slate-200 border-b-[6px] rounded-[2.5rem] p-4 sm:p-6 flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-orange-100 p-3 rounded-2xl w-14 h-14 flex items-center justify-center">
                <Feather className="w-8 h-8 text-orange-500" />
              </div>
              <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg text-sm font-bold border border-green-100">
                <TrendingUp className="w-4 h-4" /> +12
              </div>
            </div>
            <div>
              <h3 className="text-slate-500 font-bold mb-1">Devoirs Terminés</h3>
              <div className="text-4xl font-black text-slate-800">42<span className="text-xl text-slate-400">/45</span></div>
            </div>
            <div className="h-16 mt-4 -mx-2 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
                <LineChart style={{ outline: 'none' }} data={sparklineDevoirs}>
                  <Line type="monotone" dataKey="v" stroke="#F97316" strokeWidth={4} dot={false} strokeLinecap="round" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* Row 2 : Nouvelles Statistiques (Pyramide & Absences) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pyramide des Âges */}
          <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="bg-white border-2 border-slate-200 border-b-[6px] rounded-[2.5rem] p-6 lg:p-8 flex flex-col h-[400px]">
            <h3 className="text-xl font-black text-slate-800 mb-6">Répartition par Âge et Sexe</h3>
            <div className="h-[300px] w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
                <BarChart style={{ outline: 'none' }} data={ageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  {!isMobile && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />}
                  <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748B', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748B', fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontWeight: 'bold' }} />
                  <Bar dataKey="garcons" name="Garçons" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={24} />
                  <Bar dataKey="filles" name="Filles" fill="#EC4899" radius={[8, 8, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Historique des Absences */}
          <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="bg-white border-2 border-slate-200 border-b-[6px] rounded-[2.5rem] p-6 lg:p-8 flex flex-col h-[400px]">
            <h3 className="text-xl font-black text-slate-800 mb-6">Historique des Absences</h3>
            <div className="h-[300px] w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
                <AreaChart style={{ outline: 'none' }} data={absenceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAbsences" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  {!isMobile && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />}
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748B', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748B', fontWeight: 600 }} />
                  <Tooltip cursor={{ stroke: '#EF4444', strokeWidth: 2, strokeDasharray: '5 5' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="absences" name="Absences Mensuelles" stroke="#EF4444" strokeWidth={4} fillOpacity={1} fill="url(#colorAbsences)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* Row 3 : Progress Rings & Podium */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Progress Rings Géants */}
          <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="bg-white border-2 border-slate-200 border-b-[6px] rounded-[2.5rem] p-6 lg:p-8 flex flex-col items-center">
            <h3 className="w-full text-left text-xl font-black text-slate-800 mb-8">Objectifs Trimestriels</h3>
            <div className="flex flex-col sm:flex-row w-full justify-around items-center gap-8">
              
              {/* Ring 1 */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
                  <PieChart style={{ outline: 'none' }}>
                    <Pie data={ringData1} innerRadius={55} outerRadius={75} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                      {ringData1.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800">78%</span>
                </div>
                <div className="absolute -bottom-8 text-center text-sm font-bold text-slate-500 w-full">Prog. couvert</div>
              </div>

              {/* Ring 2 */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
                  <PieChart style={{ outline: 'none' }}>
                    <Pie data={ringData2} innerRadius={55} outerRadius={75} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                      {ringData2.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800">92%</span>
                </div>
                <div className="absolute -bottom-8 text-center text-sm font-bold text-slate-500 w-full">Objectifs atteints</div>
              </div>

            </div>
          </motion.div>

          {/* Podium des Meilleurs Élèves */}
          <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="bg-white border-2 border-slate-200 border-b-[6px] rounded-[2.5rem] p-6 lg:p-8 flex flex-col h-full overflow-hidden">
            <h3 className="text-xl font-black text-slate-800 mb-8">Podium des Meilleurs Élèves</h3>
            
            <div className="h-48 flex items-end justify-center w-full gap-2 sm:gap-6 pt-10">
              {podiumData.map((student) => (
                <motion.div 
                  key={student.rank}
                  whileHover={{ y: -10 }}
                  className="flex flex-col items-center relative w-1/3"
                >
                  {/* Badge / Couronne */}
                  <div 
                    className="absolute -top-6 sm:-top-8 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-black shadow-lg border-2 border-white"
                    style={{ backgroundColor: student.colorHex }}
                  >
                    #{student.rank}
                  </div>
                  {/* Avatar */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 bg-white z-10 shadow-md relative -mb-4 sm:-mb-6" style={{ borderColor: student.colorHex }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.seed}&backgroundColor=transparent`} 
                      alt={student.name}
                      className="w-full h-full object-cover bg-slate-50"
                    />
                  </div>
                  {/* Colonne Podium */}
                  <div 
                    className="w-full rounded-t-2xl shadow-inner flex flex-col items-center justify-end pb-3 sm:pb-6 relative overflow-hidden"
                    style={{ height: student.height, backgroundColor: `${student.colorHex}22` }} 
                  >
                    <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: student.colorHex }} />
                    <span className="font-bold text-slate-800 truncate px-1 text-sm sm:text-base">{student.name}</span>
                    <span className="font-black text-lg sm:text-2xl mt-1" style={{ color: student.colorHex }}>{student.score}</span>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>

        </div>

        {/* Insight IA (Sensation) */}
        <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className="bg-fuchsia-50 border-2 border-fuchsia-100 border-b-[6px] rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10">
             <Sparkles className="w-64 h-64 text-fuchsia-400" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }} 
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="bg-fuchsia-200 p-3 rounded-2xl"
            >
              <Sparkles className="w-8 h-8 text-fuchsia-600" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-black text-fuchsia-900">L&apos;Analyse de l&apos;IA</h2>
          </div>
          
          <ul className="space-y-4 relative z-10">
            {aiInsights.map((insight, i) => (
              <motion.li 
                key={i} 
                className="flex gap-4 items-start bg-white/60 p-4 rounded-2xl border border-fuchsia-100/50"
                whileHover={{ scale: 1.01 }}
              >
                <div className="bg-fuchsia-500 rounded-full p-1.5 shrink-0 mt-0.5 shadow-sm shadow-fuchsia-300">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <p className="text-fuchsia-900 font-bold text-base sm:text-lg leading-snug">{insight}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>

      </motion.div>
    </div>
  );
}
