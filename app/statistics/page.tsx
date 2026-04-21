"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend
} from 'recharts';
import { UserCircle, AlertTriangle, Sparkles, Trophy, Star, Calendar } from 'lucide-react';

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
    ],
    totalStudents: 29
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
    ],
    totalStudents: 26
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
  ],
  totalStudents: 55
};

export default function StatisticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('global');
  
  // Date range state for Attendance
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

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

  // Calculate Mock Attendance Data based on Dates and Filter
  const calculateAttendance = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Simulate data: A few absences per class per month
    const totalPossibleSessions = activeData.totalStudents * totalDays;
    
    // Seed absences loosely based on dates so it changes when user changes dates
    const absenceSeedFactor = (start.getDate() + end.getDate()) % 5 + 1;
    let totalAbsences = Math.floor((activeData.totalStudents * totalDays * absenceSeedFactor) / 100); 
    
    // Avoid having more absences than total sessions
    if (totalAbsences > totalPossibleSessions) totalAbsences = Math.floor(totalPossibleSessions * 0.2);

    const totalPresents = totalPossibleSessions - totalAbsences;
    const rate = totalPossibleSessions > 0 ? ((totalPresents / totalPossibleSessions) * 100).toFixed(1) : "0.0";
    
    return {
      totalPossibleSessions,
      totalPresents,
      totalAbsences,
      rate
    };
  };

  const attendanceData = calculateAttendance();

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:p-6 md:p-12 print:block print:w-full print:m-0 print:p-0 print:bg-white">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation / Header - Hide on print */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:mb-8 print:hidden">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Tableau de Bord<br className="sm:hidden" /> de la Classe
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              Aperçu analytique pédagogique et administratif
            </p>
          </div>
          
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl sm:rounded-full hover:bg-blue-700 sm:hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 sm:active:scale-100"
          >
            🖨️ Sauver en PDF
          </button>
        </div>

        {/* Barre de Filtre des Classes */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-4 sm:mb-8 print:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
          <button
            onClick={() => setSelectedFilter('global')}
            className={`shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
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
              className={`shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                selectedFilter === className 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
               {className}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 md:gap-12">
          
          {/* Carte 0 - Assiduité (Pleine largeur) */}
          <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                Assiduité & Présences
              </h2>

              {/* Sélecteur de Date */}
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-200 print:hidden overflow-x-auto w-full sm:w-auto">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-auto"
                />
                <span className="text-slate-400 font-medium text-xs sm:text-sm">à</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-auto"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Taux global */}
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Star className="w-16 h-16 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-emerald-800 mb-1 uppercase tracking-wider relative z-10">Taux de présence</p>
                <div className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tighter relative z-10">
                  {attendanceData.rate}<span className="text-xl sm:text-2xl">%</span>
                </div>
              </div>

              {/* Présents */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-center items-center">
                <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Cumul Présents</p>
                <div className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                  {attendanceData.totalPresents}
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium bg-white px-2 py-1 rounded border border-slate-200">
                  Sur {attendanceData.totalPossibleSessions} sessions
                </p>
              </div>

              {/* Absents */}
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100 flex flex-col justify-center items-center">
                <p className="text-sm font-bold text-red-800 mb-1 uppercase tracking-wider">Cumul Absences</p>
                <div className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight">
                  {attendanceData.totalAbsences}
                </div>
                <p className="text-xs text-red-500 mt-2 font-medium">Jours cumulés</p>
              </div>
            </div>
          </div>

          {/* Carte 1 (Pleine largeur) */}
          <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-800 mb-4 sm:mb-6 leading-tight">
              🎯 Maîtrise des Compétences
            </h2>
            {!isMounted ? renderChartSkeleton() : (
              <div className="w-full h-[200px] sm:h-[250px] min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeData.competences} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} interval={0} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      formatter={(value: any) => [`${value}%`, 'Score']}
                      wrapperStyle={{ zIndex: 100 }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={60}>
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
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-800 mb-4 sm:mb-6">
              🆘 Radar de Soutien
            </h2>
            <ul className="space-y-3 sm:space-y-4">
              {activeData.support.map((student: any) => (
                <li key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 gap-3 sm:gap-4 print:bg-white print:border-gray-200">
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-10 h-10 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm sm:text-base">{student.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                        <AlertTriangle className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${student.level === 'danger' ? 'text-red-500' : 'text-orange-500'}`} />
                        <span className={`text-[10px] sm:text-xs font-semibold ${student.level === 'danger' ? 'text-red-600 bg-red-100' : 'text-orange-600 bg-orange-100'} px-2 py-0.5 rounded-md`}>
                          {student.issue}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href="/ai-generator" className="print:hidden w-full sm:w-auto mt-1 sm:mt-0">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 font-bold text-xs sm:text-sm rounded-lg sm:rounded-xl transition-colors w-full">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                      Créer exo
                    </button>
                  </Link>
                </li>
              ))}
              {activeData.support.length === 0 && (
                 <p className="text-center text-slate-400 py-6 sm:py-8 text-sm sm:text-base font-medium">Aucun élève en grande difficulté détecté.</p>
              )}
            </ul>
          </div>

          {/* Carte 3 - Évolution Adaptative */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-800 mb-4 sm:mb-6">
              📈 Évolution
            </h2>
            {!isMounted ? renderChartSkeleton() : (
              <div className="w-full h-[200px] sm:h-[250px] min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeEvolution} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      wrapperStyle={{ zIndex: 100 }}
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
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Carte 4 - Pyramide dynamique */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-800 mb-4 sm:mb-6">
              📊 Pyramide des Âges
            </h2>
            {!isMounted ? renderChartSkeleton() : (
              <div className="w-full h-[200px] sm:h-[250px] min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeData.ages} margin={{ top: 10, right: 0, left: -25, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} angle={-45} textAnchor="end" dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }} 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      wrapperStyle={{ zIndex: 100 }} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} iconType="circle" />
                    <Bar dataKey="Garçons" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="Filles" fill="#EC4899" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Carte 5 - Classe Championne (Statique globalement) */}
          <div className="bg-[#EEF2FF] rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:bg-white print:shadow-none print:border print:border-gray-300">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-indigo-900 mb-4 flex items-center gap-2">
              🏫 Classe Championne
            </h2>
            {!isMounted ? renderChartSkeleton() : (
              <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center h-[180px] sm:h-[250px] relative bg-white/50 rounded-xl sm:rounded-2xl border border-indigo-100 print:border-gray-200 print:bg-white">
                <div className="animate-bounce mb-2 sm:mb-4">
                  <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-600 drop-shadow-md" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">4ème AP - B</h3>
                <p className="text-indigo-700 font-medium mt-2 flex items-center gap-1.5 bg-indigo-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-indigo-600" /> Meilleure progression
                </p>
              </div>
            )}
          </div>

          {/* Carte 6 - Top Élèves (Dynamique et Pleine largeur) */}
          <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-300">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
              🏆 Top Élèves <span className="text-slate-400 font-medium text-sm sm:text-lg">({selectedFilter === 'global' ? 'Toutes classes' : selectedFilter})</span>
            </h2>
            {!isMounted ? renderChartSkeleton() : (
              <div className="flex flex-col gap-3 sm:gap-4">
                {activeData.top.map((student: any) => (
                  <div key={student.id} className="flex flex-row items-center gap-3 sm:gap-6 p-3 sm:p-5 bg-slate-50/50 rounded-xl sm:rounded-2xl hover:scale-[1.02] transition-transform shadow-sm border border-slate-100 group print:bg-white print:border-gray-200 print:shadow-none">
                    
                    {/* Photo de l'élève (Avatar) */}
                    <div className="relative shrink-0">
                      <div 
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 bg-white flex items-center justify-center shadow-sm"
                        style={{ borderColor: student.colorHex }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${student.seed}&backgroundColor=transparent`} 
                          alt={`Avatar de ${student.name}`} 
                          className="w-full h-full object-cover rounded-full p-0.5 sm:p-1 bg-slate-50" 
                        />
                      </div>
                      {/* Badge de Rang (Or, Argent, Bronze) */}
                      <div 
                        className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-1 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-black shadow-md border-[1.5px] sm:border-2 border-white"
                        style={{ backgroundColor: student.colorHex }}
                      >
                        #{student.rank}
                      </div>
                    </div>

                    {/* Vraies Métriques (Centre) */}
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="text-base sm:text-xl font-bold text-slate-800 truncate">{student.name}</h3>
                      <div className="flex flex-wrap items-center justify-start gap-1.5 sm:gap-3 mt-1 sm:mt-2 hidden sm:flex">
                        <span className="text-xs sm:text-sm font-medium text-slate-500 bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg border border-slate-200 shadow-sm print:border-gray-300">
                          Devoir: <strong className="text-slate-700">{student.homework}</strong>
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-slate-500 bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg border border-slate-200 shadow-sm print:border-gray-300">
                          Examen: <strong className="text-slate-700">{student.exam}</strong>
                        </span>
                      </div>
                      {/* Mobile minimal text limits */}
                      <div className="flex sm:hidden items-center gap-2 mt-0.5 whitespace-nowrap overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                         <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
                           Dev: <strong className="text-slate-700">{student.homework}</strong>
                         </span>
                         <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
                           Ex: <strong className="text-slate-700">{student.exam}</strong>
                         </span>
                      </div>
                    </div>

                    {/* Moyenne Générale (Droite) */}
                    <div className="shrink-0 text-right sm:bg-transparent rounded-xl sm:border-none min-w-[60px] sm:min-w-[120px] flex sm:block flex-col justify-center items-end">
                      <p className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest sm:mb-1 hidden sm:block">Moyenne</p>
                      <div className="text-lg sm:text-3xl font-black text-emerald-600 tracking-tight leading-none">
                        {student.overall}<span className="text-[10px] sm:text-lg text-emerald-400">/10</span>
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
