"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend
} from 'recharts';
import { UserCircle, AlertTriangle, Sparkles, Trophy, Star } from 'lucide-react';

// --- MOCK DATA DYNAMIQUE ---
const classesData: Record<string, any> = {
  '3ème AP - A': {
    competences: [
      { name: 'Comp. Orale', score: 80, color: '#10B981' },
      { name: 'Prod. Orale', score: 65, color: '#10B981' },
      { name: "Comp. de l'écrit", score: 55, color: '#F59E0B' },
      { name: 'Prod. Écrite', score: 40, color: '#EF4444' }
    ],
    evolution: [
      { month: 'Sept', value: 10.5 }, { month: 'Oct', value: 11.0 }, { month: 'Nov', value: 11.5 },
      { month: 'Déc', value: 11.2 }, { month: 'Jan', value: 12.8 }, { month: 'Fév', value: 13.5 }, { month: 'Mar', value: 14.0 }
    ],
    ages: [
      { year: '2015', Garçons: 6, Filles: 8 },
      { year: '2016', Garçons: 8, Filles: 7 }
    ],
    support: [
      { id: 101, name: 'Amine', issue: 'Difficulté en Lecture', level: 'danger' },
      { id: 102, name: 'Yanis', issue: 'Compréhension', level: 'warning' }
    ],
    top: [
      { id: 1, name: 'Lina', seed: 'Lina', homework: '9.8', exam: '9.5', overall: '9.6', rank: 1, colorHex: '#FBBF24' },
      { id: 2, name: 'Rayane', seed: 'Rayane', homework: '9.2', exam: '9.0', overall: '9.1', rank: 2, colorHex: '#94A3B8' },
      { id: 3, name: 'Inès', seed: 'Ines', homework: '8.5', exam: '8.9', overall: '8.7', rank: 3, colorHex: '#D97706' }
    ]
  },
  '4ème AP - B': {
    competences: [
      { name: 'Comp. Orale', score: 88, color: '#10B981' },
      { name: 'Prod. Orale', score: 72, color: '#10B981' },
      { name: "Comp. de l'écrit", score: 65, color: '#F59E0B' },
      { name: 'Prod. Écrite', score: 48, color: '#EF4444' }
    ],
    evolution: [
      { month: 'Sept', value: 11.2 }, { month: 'Oct', value: 11.8 }, { month: 'Nov', value: 12.5 },
      { month: 'Déc', value: 12.8 }, { month: 'Jan', value: 14.0 }, { month: 'Fév', value: 14.5 }, { month: 'Mar', value: 15.2 }
    ],
    ages: [
      { year: '2014', Garçons: 7, Filles: 5 },
      { year: '2015', Garçons: 6, Filles: 8 }
    ],
    support: [
      { id: 201, name: 'Sarah', issue: 'Production écrite', level: 'warning' }
    ],
    top: [
      { id: 4, name: 'Ayoub', seed: 'Ayoub', homework: '9.9', exam: '9.8', overall: '9.8', rank: 1, colorHex: '#FBBF24' },
      { id: 5, name: 'Kenza', seed: 'Kenza', homework: '9.5', exam: '9.2', overall: '9.3', rank: 2, colorHex: '#94A3B8' },
      { id: 6, name: 'Walid', seed: 'Walid', homework: '9.0', exam: '8.8', overall: '8.9', rank: 3, colorHex: '#D97706' }
    ]
  }
};

const MOCK_GLOBAL = {
  competences: [
    { name: 'Comp. Orale', score: 85, color: '#10B981' },
    { name: 'Prod. Orale', score: 70, color: '#10B981' },
    { name: "Comp. de l'écrit", score: 60, color: '#F59E0B' },
    { name: 'Prod. Écrite', score: 45, color: '#EF4444' }
  ],
  evolution: [
    { month: 'Sept', value: 11.0 }, { month: 'Oct', value: 11.5 }, { month: 'Nov', value: 12.2 },
    { month: 'Déc', value: 12.0 }, { month: 'Jan', value: 13.5 }, { month: 'Fév', value: 14.1 }, { month: 'Mar', value: 14.8 }
  ],
  ages: [
    { year: '2013', Garçons: 2, Filles: 3 },
    { year: '2014', Garçons: 8, Filles: 7 },
    { year: '2015', Garçons: 12, Filles: 10 },
    { year: '2016', Garçons: 4, Filles: 5 }
  ],
  support: [
    { id: 1, name: 'Amine', issue: 'Difficulté en Lecture', level: 'danger' },
    { id: 2, name: 'Sarah', issue: 'Production écrite', level: 'warning' },
    { id: 3, name: 'Yanis', issue: 'Compréhension', level: 'warning' }
  ],
  top: [
    { id: 7, name: 'Ayoub', seed: 'Ayoub', homework: '9.9', exam: '9.8', overall: '9.8', rank: 1, colorHex: '#FBBF24' },
    { id: 8, name: 'Lina', seed: 'Lina', homework: '9.8', exam: '9.5', overall: '9.6', rank: 2, colorHex: '#94A3B8' },
    { id: 9, name: 'Kenza', seed: 'Kenza', homework: '9.5', exam: '9.2', overall: '9.3', rank: 3, colorHex: '#D97706' }
  ]
};

export default function StatisticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('global');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const renderChartSkeleton = () => (
    <div className="w-full h-[250px] animate-pulse bg-gray-100 rounded-xl"></div>
  );

  // Computed data based on selection
  const activeData = selectedFilter === 'global' ? MOCK_GLOBAL : classesData[selectedFilter];
  
  // Mixed Evolution data for Chart (Class curve vs Global curve)
  const activeEvolution = MOCK_GLOBAL.evolution.map((glob, i) => {
    const dataPoint: any = { month: glob.month, globalAvg: glob.value };
    if (selectedFilter !== 'global') {
      dataPoint.classAvg = classesData[selectedFilter].evolution[i].value;
    }
    return dataPoint;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 print:block print:w-full print:m-0 print:p-0 print:bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation / Header - Hide on print */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 print:hidden">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tableau de Bord de la Classe
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Aperçu analytique pédagogique et administratif
            </p>
          </div>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl"
          >
            🖨️ Imprimer / Sauver en PDF
          </button>
        </div>

        {/* Barre de Filtre des Classes */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 print:hidden">
          <button
            onClick={() => setSelectedFilter('global')}
            className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              selectedFilter === 'global' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🌍 Global
          </button>
          {Object.keys(classesData).map((className) => (
            <button
              key={className}
              onClick={() => setSelectedFilter(className)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                selectedFilter === className 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              📚 {className}
            </button>
          ))}
        </div>

        {/* Print-only title */}
        <div className="hidden print:block mb-8 text-center border-b border-gray-300 pb-4">
          <h1 className="text-3xl font-black text-black">
            Bilan Statistique - {selectedFilter === 'global' ? 'Toutes classes' : selectedFilter}
          </h1>
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          
          {/* Carte 1 (Pleine largeur) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 mb-6">
              🎯 Maîtrise des Compétences (Oral, Lecture, Écrit)
            </h2>
            {!isMounted ? renderChartSkeleton() : (
              <div className="w-full h-[250px] min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeData.competences} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      formatter={(value: any) => [`${value}%`, 'Score']}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={80}>
                      {activeData.competences.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Carte 2 */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 mb-6">
              🆘 Radar de Soutien (Élèves prioritaires)
            </h2>
            <ul className="space-y-4">
              {activeData.support.map((student: any) => (
                <li key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 gap-4 print:bg-white print:border-gray-200">
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-10 h-10 text-slate-400" />
                    <div>
                      <p className="font-bold text-slate-800">{student.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <AlertTriangle className={`w-4 h-4 ${student.level === 'danger' ? 'text-red-500' : 'text-orange-500'}`} />
                        <span className={`text-xs sm:text-sm font-semibold ${student.level === 'danger' ? 'text-red-600 bg-red-100' : 'text-orange-600 bg-orange-100'} px-2 py-0.5 rounded-md`}>
                          {student.issue}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href="/ai-generator" className="print:hidden w-full sm:w-auto">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-sm rounded-xl transition-colors w-full">
                      <Sparkles className="w-4 h-4" />
                      Créer un exercice
                    </button>
                  </Link>
                </li>
              ))}
              {activeData.support.length === 0 && (
                 <p className="text-center text-slate-400 py-8 font-medium">Aucun élève en grande difficulté détecté.</p>
              )}
            </ul>
          </div>

          {/* Carte 3 - Évolution Adaptative */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 mb-6">
              📈 Évolution de la moyenne {selectedFilter !== 'global' && <span className="text-sm font-medium text-slate-500">({selectedFilter} vs Global)</span>}
            </h2>
            {!isMounted ? renderChartSkeleton() : (
              <div className="w-full h-[250px] min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeEvolution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    
                    {/* Courbe Globale (en grise pointillé si on filtre une classe) */}
                    {selectedFilter !== 'global' && (
                      <Line 
                        type="monotone" 
                        dataKey="globalAvg" 
                        name="Moyenne Globale" 
                        stroke="#94A3B8" 
                        strokeWidth={2} 
                        strokeDasharray="4 4" 
                        dot={false}
                        activeDot={{ r: 4 }} 
                      />
                    )}
                    
                    {/* Courbe Principale (Bleue/Indigo) */}
                    <Line 
                      type="monotone" 
                      dataKey={selectedFilter === 'global' ? "globalAvg" : "classAvg"} 
                      name={selectedFilter === 'global' ? "Moyenne" : `Moyenne ${selectedFilter}`}
                      stroke="#4F46E5" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Carte 4 - Pyramide dynamique */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 mb-6">
              📊 Pyramide des Âges
            </h2>
            {!isMounted ? renderChartSkeleton() : (
              <div className="w-full h-[250px] min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeData.ages} margin={{ top: 10, right: 0, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} angle={-45} textAnchor="end" dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Bar dataKey="Garçons" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Filles" fill="#EC4899" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Carte 5 - Classe Championne (Statique globalement) */}
          <div className="bg-[#EEF2FF] rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:bg-white print:shadow-none print:border print:border-gray-300">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-indigo-900 mb-6 flex items-center gap-3">
              🏫 Classe Championne
            </h2>
            {!isMounted ? renderChartSkeleton() : (
              <div className="flex flex-col items-center justify-center p-6 text-center h-[250px] relative bg-white/50 rounded-2xl border border-indigo-100 print:border-gray-200 print:bg-white">
                <div className="animate-bounce mb-4">
                  <Trophy className="w-16 h-16 text-indigo-600 drop-shadow-md" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-black text-indigo-950 tracking-tight">4ème AP - B</h3>
                <p className="text-indigo-700 font-medium mt-3 flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full text-sm">
                  <Star className="w-4 h-4 fill-indigo-600" /> Meilleure progression (+1.2 pts)
                </p>
              </div>
            )}
          </div>

          {/* Carte 6 - Top Élèves (Dynamique et Pleine largeur) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 mb-6 flex items-center gap-3">
              🏆 Top Élèves <span className="text-slate-400 font-medium text-lg">({selectedFilter === 'global' ? 'Toutes classes' : selectedFilter})</span>
            </h2>
            {!isMounted ? renderChartSkeleton() : (
              <div className="flex flex-col gap-4">
                {activeData.top.map((student: any) => (
                  <div key={student.id} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-slate-50/50 rounded-2xl hover:scale-[1.02] transition-transform shadow-sm border border-slate-100 group print:bg-white print:border-gray-200 print:shadow-none">
                    
                    {/* Photo de l'élève (Avatar) */}
                    <div className="relative shrink-0">
                      <div 
                        className="w-16 h-16 rounded-full overflow-hidden border-2 bg-white flex items-center justify-center shadow-sm"
                        style={{ borderColor: student.colorHex }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.seed}&backgroundColor=transparent`} 
                          alt={`Avatar de ${student.name}`} 
                          className="w-full h-full object-cover rounded-full p-1 bg-slate-50" 
                        />
                      </div>
                      {/* Badge de Rang (Or, Argent, Bronze) */}
                      <div 
                        className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md border-2 border-white"
                        style={{ backgroundColor: student.colorHex }}
                      >
                        #{student.rank}
                      </div>
                    </div>

                    {/* Vraies Métriques (Centre) */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-bold text-slate-800">{student.name}</h3>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-2">
                        <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm print:border-gray-300">
                          Devoir : <strong className="text-slate-700">{student.homework}/10</strong>
                        </span>
                        <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm print:border-gray-300">
                          Examen : <strong className="text-slate-700">{student.exam}/10</strong>
                        </span>
                      </div>
                    </div>

                    {/* Moyenne Générale (Droite) */}
                    <div className="shrink-0 text-center sm:text-right mt-2 sm:mt-0 bg-white p-3 sm:bg-transparent sm:p-0 rounded-xl sm:border-none border border-slate-100 shadow-sm sm:shadow-none min-w-[120px]">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Moyenne</p>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                        {student.overall}<span className="text-sm sm:text-lg text-emerald-400">/10</span>
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
