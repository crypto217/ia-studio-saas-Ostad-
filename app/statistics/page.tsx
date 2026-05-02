"use client";

import React, { useState } from "react";
import { motion, Variants } from "motion/react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  AlertCircle, 
  GraduationCap, 
  ChevronDown, 
  Activity, 
  CalendarDays,
  BellRing
} from "lucide-react";

const genderData = [
  { name: 'Filles', value: 55, color: '#f472b6' }, // pink-400
  { name: 'Garçons', value: 45, color: '#60a5fa' } // blue-400
];

const ageData = [
  { age: '9 ans', count: 4 },
  { age: '10 ans', count: 18 },
  { age: '11 ans', count: 6 }
];

const skillsData = [
  { name: 'Lecture', score: 8.5 },
  { name: 'Vocabulaire', score: 7.0 },
  { name: 'Grammaire', score: 5.5 },
  { name: 'Conjugaison', score: 6.0 },
  { name: 'Production Écrite', score: 4.5 }
];

const priorityStudents = [
  { id: 1, name: 'Amina B.', motif: 'Baisse de notes (-2.5 pts)', action: 'Entretien individuel' },
  { id: 2, name: 'Yacine K.', motif: 'Absences répétées (3 cours)', action: 'Contacter les parents' },
  { id: 3, name: 'Lyna M.', motif: 'Difficultés ciblées en Production Écrite', action: 'Atelier de remédiation' },
  { id: 4, name: 'Rayan S.', motif: 'Comportement perturbateur', action: 'Placer au premier rang' }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function StatisticsPage() {
  const [selectedClass, setSelectedClass] = useState("5ème AP - Groupe A");
  const classes = ["5ème AP - Groupe A", "5ème AP - Groupe B", "4ème AP - Groupe A"];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans pb-24">
      <motion.div 
        className="max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
         <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analyse Pédagogique</h1>
              <p className="text-slate-500 font-medium mt-1">SaaS Ostad - Vue d&apos;ensemble de la classe</p>
           </div>
           <div className="relative inline-flex shrink-0 w-full sm:w-auto shadow-sm">
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all"
              >
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
           </div>
         </motion.div>

         {/* KPIs */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50/50 p-2.5 rounded-xl">
                  <Activity className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Moyenne de la Classe</h3>
                <div className="text-3xl font-bold text-slate-800">
                  7.2<span className="text-base text-slate-400 font-medium">/10</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-emerald-50/50 p-2.5 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Taux d&apos;Acquisition</h3>
                <div className="text-3xl font-bold text-slate-800 flex items-baseline gap-2">
                  82%
                  <span className="text-xs text-slate-500 font-medium">&gt; moyenne</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50/50 p-2.5 rounded-xl">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                  <TrendingUp className="w-3 h-3" /> +2%
                </div>
              </div>
              <div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">Taux de Présence</h3>
                <div className="text-3xl font-bold text-slate-800">
                  94%
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-red-50 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="bg-red-50 p-2.5 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-slate-500 text-sm font-medium mb-1">Élèves en difficulté</h3>
                <div className="text-3xl font-bold text-red-600 flex items-baseline gap-2">
                  5
                  <span className="text-xs text-red-400 font-medium">à suivre</span>
                </div>
              </div>
            </motion.div>
         </div>

         {/* Demographics Section */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Pie Chart: Genre */}
           <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <h2 className="text-lg font-bold text-slate-800 mb-1">Répartition Filles / Garçons</h2>
             <p className="text-sm text-slate-500 mb-6">Démographie selon le genre</p>
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#334155' }}
                        itemStyle={{ fontWeight: 600 }}
                        formatter={(value: number) => [`${value}%`, 'Proportion']}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: '#64748B' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
           </motion.div>

           {/* Horizontal Bar Chart: Age */}
           <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <h2 className="text-lg font-bold text-slate-800 mb-1">Pyramide des âges</h2>
             <p className="text-sm text-slate-500 mb-6">Distribution par tranche d&apos;âge</p>
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={ageData} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="age" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 13 }} 
                      width={60}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }} 
                      contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value} élèves`, 'Effectif']}
                    />
                    <Bar dataKey="count" fill="#818cf8" radius={[0, 6, 6, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
           </motion.div>
         </div>

         {/* Skills Graph */}
         <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">Performances par Domaine</h2>
              <p className="text-sm text-slate-500 mt-0.5">Évaluation moyenne des compétences (sur 10)</p>
            </div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#334155' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {skillsData.map((entry, index) => {
                      let fillColor = '#ef4444'; // red
                      if (entry.score > 7) fillColor = '#22c55e'; // green
                      else if (entry.score >= 5) fillColor = '#f97316'; // orange
                      return <Cell key={`cell-${index}`} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
         </motion.div>

         {/* Alerts Table */}
         <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h2 className="text-lg font-bold text-slate-800">Élèves à suivre en priorité</h2>
               <p className="text-sm text-slate-500 mt-0.5">Alertes pédagogiques et administratives</p>
             </div>
             <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
               <BellRing className="w-5 h-5" />
             </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50/50">
                   <th className="py-3 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider">Nom de l&apos;élève</th>
                   <th className="py-3 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider">Motif d&apos;alerte</th>
                   <th className="py-3 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider">Action recommandée</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {priorityStudents.map((student) => (
                   <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                     <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">{student.name}</td>
                     <td className="py-4 px-6 text-sm text-slate-600">
                       <span className="inline-flex items-center gap-1.5 font-medium">
                         <div className={`w-1.5 h-1.5 rounded-full ${student.motif.includes('Baisse') || student.motif.includes('Absences') ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                         {student.motif}
                       </span>
                     </td>
                     <td className="py-4 px-6">
                       <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60 whitespace-nowrap">
                         {student.action}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </motion.div>

      </motion.div>
    </div>
  );
}
