"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, BookOpen, Pencil, Star, Calendar as CalendarIcon, Clock, Sparkles, X, Coffee, Trash2, CheckCircle2, Circle, AlertCircle, Flag, Check, ListTodo } from "lucide-react"
import { format, addDays, startOfWeek, subDays } from "date-fns"
import { fr } from "date-fns/locale"
import { motion, AnimatePresence } from "motion/react"

import { Button } from "@/components/ui/button"

const CLASSES = [
  { id: "c1", name: "5ème AP - A", color: "bg-sky-400", border: "border-sky-500", text: "text-sky-950", lightBg: "bg-sky-100", lightText: "text-sky-700" },
  { id: "c2", name: "4ème AP - B", color: "bg-rose-400", border: "border-rose-500", text: "text-rose-950", lightBg: "bg-rose-100", lightText: "text-rose-700" },
  { id: "c3", name: "3ème AP - C", color: "bg-emerald-400", border: "border-emerald-500", text: "text-emerald-950", lightBg: "bg-emerald-100", lightText: "text-emerald-700" },
]

const TASK_TYPES = {
  cours: { label: 'Cours', icon: BookOpen },
  exercice: { label: 'Exercice', icon: Pencil },
  examen: { label: 'Examen', icon: Star },
}

type TaskPriority = 'high' | 'medium' | 'low';

interface TodoTask {
  id: number;
  title: string;
  priority: TaskPriority;
  completed: boolean;
  dueDate?: string;
}

const initialTasks: TodoTask[] = [
  { id: 1, title: "Corriger les copies de 5ème AP", priority: 'high', completed: false, dueDate: "Aujourd'hui" },
  { id: 2, title: "Préparer l'examen de mathématiques", priority: 'medium', completed: false, dueDate: "Demain" },
  { id: 3, title: "Acheter des craies de couleur", priority: 'low', completed: true },
];

const hours = Array.from({ length: 9 }, (_, i) => i + 8) // 8:00 to 16:00

const initialLessons = [
  { id: 1, classId: "c1", taskType: "cours", title: "Conjugaison : Le présent", day: 0, start: 8, duration: 1.5 },
  { id: 2, classId: "c2", taskType: "exercice", title: "Lecture expliquée", day: 0, start: 10, duration: 2 },
  { id: 3, classId: "c3", taskType: "cours", title: "Vocabulaire", day: 1, start: 9, duration: 1.5 },
  { id: 4, classId: "c1", taskType: "examen", title: "Évaluation", day: 2, start: 8, duration: 2 },
  { id: 5, classId: "c2", taskType: "cours", title: "Expression écrite", day: 3, start: 13, duration: 2 },
  { id: 6, classId: "c3", taskType: "exercice", title: "Dictée préparée", day: 4, start: 10, duration: 1.5 },
]

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [lessons, setLessons] = useState(initialLessons)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newActivity, setNewActivity] = useState({
    title: "",
    classId: CLASSES[0].id,
    taskType: "cours",
    day: 0,
    start: 8,
    duration: 1
  })

  // Task State
  const [tasks, setTasks] = useState<TodoTask[]>(initialTasks)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [newTask, setNewTask] = useState<Partial<TodoTask>>({
    title: "",
    priority: "medium",
    completed: false,
    dueDate: "Aujourd'hui"
  })
  
  // Mobile selected day state
  const [selectedMobileDay, setSelectedMobileDay] = useState<number>(() => {
    const today = new Date().getDay()
    // If today is Friday (5) or Saturday (6), default to Sunday (0)
    return (today === 5 || today === 6) ? 0 : today
  })

  // Sunday is 0
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 })

  // Sunday to Thursday (5 days)
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(startDate, i))

  const handleAddActivity = () => {
    if (!newActivity.title.trim()) return
    const newLesson = {
      id: Date.now(),
      ...newActivity
    }
    setLessons([...lessons, newLesson])
    setIsAddModalOpen(false)
    setNewActivity({
      title: "",
      classId: CLASSES[0].id,
      taskType: "cours",
      day: 0,
      start: 8,
      duration: 1
    })
  }

  const handleDeleteActivity = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setLessons(lessons.filter(l => l.id !== id))
  }

  const handleEmptySlotClick = (dayIndex: number, hour: number) => {
    setNewActivity({
      title: "",
      classId: CLASSES[0].id,
      taskType: "cours",
      day: dayIndex,
      start: hour,
      duration: 1
    })
    setIsAddModalOpen(true)
  }

  const handleAddTask = () => {
    if (!newTask.title?.trim()) return
    const task: TodoTask = {
      id: Date.now(),
      title: newTask.title,
      priority: newTask.priority as TaskPriority,
      completed: false,
      dueDate: newTask.dueDate
    }
    setTasks([...tasks, task])
    setIsAddTaskModalOpen(false)
    setNewTask({
      title: "",
      priority: "medium",
      completed: false,
      dueDate: "Aujourd'hui"
    })
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const toggleTaskCompletion = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-24 md:pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 p-5 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl relative overflow-hidden text-white">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-400 opacity-20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 mix-blend-overlay" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-[10px] sm:text-sm mb-3 md:mb-6 border border-white/30 shadow-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300" />
            <span>Emploi du temps hebdomadaire</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight drop-shadow-sm mb-2 md:mb-3">
            Mon Super Planning <span className="inline-block hover:animate-bounce cursor-default origin-bottom">📅</span>
          </h1>
          <p className="text-indigo-100 font-medium text-xs sm:text-base md:text-lg max-w-xl leading-relaxed">
            Organisez vos cours, exercices et examens. Chaque classe a sa propre couleur pour s&apos;y retrouver en un clin d&apos;œil !
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 relative z-10">
          <Button onClick={() => setIsAddModalOpen(true)} className="h-10 sm:h-[52px] px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black border-b-4 border-amber-600 shadow-lg hover:-translate-y-1 transition-all w-full sm:w-auto text-sm sm:text-base">
            <Plus className="w-4 h-4 sm:w-6 sm:h-6 mr-1.5 sm:mr-2" /> Ajouter un cours
          </Button>
        </div>
      </div>

      {/* Classes Legend */}
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center px-4 sm:px-6 py-3 sm:py-4 bg-white rounded-[1.5rem] sm:rounded-[2rem] border-2 sm:border-4 border-slate-100 shadow-sm w-fit mx-auto md:mx-0">
        <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-wider mr-1 sm:mr-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-300"/> Vos Classes
        </span>
        {CLASSES.map(c => (
          <div key={c.id} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl ${c.lightBg} ${c.lightText} font-bold text-xs sm:text-sm border-2 border-transparent hover:border-current cursor-pointer transition-all hover:scale-105 hover:-rotate-1`}>
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${c.color} shadow-sm`} />
            {c.name}
          </div>
        ))}
      </div>

      {/* Mobile View (Visible only on small screens) */}
      <div className="block lg:hidden space-y-6">
        {/* Day Selector */}
        <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-1 snap-x no-scrollbar">
          {weekDays.map((day, dayIndex) => {
            const isSelected = selectedMobileDay === dayIndex;
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <button 
                key={dayIndex}
                onClick={() => setSelectedMobileDay(dayIndex)}
                className={`snap-center shrink-0 flex flex-col items-center justify-center w-[4.5rem] h-20 sm:w-20 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] border-b-4 transition-all relative ${
                  isSelected 
                    ? 'bg-gradient-to-b from-orange-400 to-orange-500 border-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105 z-10' 
                    : isToday 
                      ? 'bg-orange-50 border-orange-200 text-orange-600'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {isSelected && isToday && (
                  <div className="absolute -top-2 bg-white text-orange-500 text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm border border-orange-100 flex items-center gap-0.5">
                    <Sparkles className="w-2 h-2" /> AUJ
                  </div>
                )}
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest mb-0.5 sm:mb-1 ${isSelected ? 'text-orange-100' : ''}`}>
                  {format(day, "EEE", { locale: fr })}
                </span>
                <span className="text-2xl sm:text-3xl font-black">{format(day, "d")}</span>
              </button>
            )
          })}
        </div>

        {/* Timeline for Selected Day */}
        <div className="bg-white border-4 border-slate-100 rounded-[2rem] p-4 sm:p-5 shadow-xl relative min-h-[300px]">
          <div className="absolute left-[4.5rem] sm:left-[5.5rem] top-8 bottom-8 w-1 bg-slate-100 rounded-full" />
          
          <div className="space-y-6 relative z-10">
            {(() => {
              const todaysLessons = lessons.filter(l => l.day === selectedMobileDay);
              const todaysEvents = [
                ...todaysLessons.map(l => ({ ...l, isLunch: false })),
                { id: 'lunch', isLunch: true, start: 12, duration: 1 }
              ].sort((a, b) => a.start - b.start);

              return (
                <>
                  {todaysLessons.length === 0 && (
                    <div className="py-8 text-center flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border-2 border-slate-100">
                        <Sparkles className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold">Aucune activité prévue ce jour.</p>
                      <p className="text-slate-400 text-sm mt-1">Profitez de votre temps libre !</p>
                    </div>
                  )}
                  {todaysEvents.map(event => {
                    if (event.isLunch) {
                      return (
                        <div key="lunch" className="flex gap-3 sm:gap-4 items-start">
                          <div className="w-12 sm:w-16 shrink-0 text-right pt-3">
                            <span className="text-sm sm:text-base font-black text-slate-400 block">12h00</span>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-300 block">13h00</span>
                          </div>
                          <div className="relative mt-4">
                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-200 border-4 border-white shadow-sm relative z-10" />
                          </div>
                          <div className="flex-1 rounded-2xl sm:rounded-3xl p-3 border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center gap-2 text-slate-400 mt-1">
                            <Coffee className="w-5 h-5" />
                            <span className="font-black uppercase tracking-widest text-sm">Déjeuner</span>
                          </div>
                        </div>
                      )
                    }

                    const lesson = event as typeof lessons[0];
                    const classInfo = CLASSES.find(c => c.id === lesson.classId)!
                    const taskInfo = TASK_TYPES[lesson.taskType as keyof typeof TASK_TYPES]
                    const TaskIcon = taskInfo.icon
                    
                    // Format time
                    const startTime = `${Math.floor(lesson.start)}h${(lesson.start % 1) * 60 === 0 ? '00' : (lesson.start % 1) * 60}`
                    const endTimeNum = lesson.start + lesson.duration
                    const endTime = `${Math.floor(endTimeNum)}h${(endTimeNum % 1) * 60 === 0 ? '00' : (endTimeNum % 1) * 60}`

                    return (
                      <div key={lesson.id} className="flex gap-3 sm:gap-4 items-start">
                        {/* Time Indicator */}
                        <div className="w-12 sm:w-16 shrink-0 text-right pt-2">
                          <span className="text-sm sm:text-base font-black text-slate-800 block">{startTime}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 block">{endTime}</span>
                        </div>
                        
                        {/* Timeline Dot */}
                        <div className="relative mt-3">
                          <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${classInfo.color} border-4 border-white shadow-sm relative z-10`} />
                        </div>

                        {/* Card */}
                        <motion.div 
                          whileTap={{ scale: 0.98 }}
                          className={`flex-1 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm border-b-4 ${classInfo.color} ${classInfo.border} text-white`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                            <h3 className="font-black text-base sm:text-lg leading-tight drop-shadow-sm">{lesson.title}</h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button 
                                onClick={(e) => handleDeleteActivity(e, lesson.id)}
                                className="bg-white/20 hover:bg-rose-500/80 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm">
                                <TaskIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold bg-black/20 backdrop-blur-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl shadow-inner">
                              {classInfo.name}
                            </span>
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider opacity-90 drop-shadow-sm">
                              {taskInfo.label}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    )
                  })}
                </>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Desktop Calendar Grid (Visible only on large screens) */}
      <div className="hidden lg:block bg-slate-50/80 border-4 border-slate-200/60 rounded-[3rem] p-8 shadow-xl relative overflow-x-auto">
        <div className="min-w-[900px] flex">
          {/* Time Column */}
          <div className="w-24 shrink-0 pt-[124px] pr-2">
            {hours.map((hour) => (
              <div key={hour} className="h-24 relative">
                <div className="absolute top-0 right-2 flex items-center gap-2 z-20 -translate-y-1/2">
                  <span className="text-sm font-black text-slate-700 bg-white px-3 py-1.5 rounded-xl shadow-sm border-2 border-slate-200">{hour}h00</span>
                  <div className="w-2 h-0.5 bg-slate-400 rounded-full" />
                </div>
              </div>
            ))}
            {/* 17h00 label */}
            <div className="relative">
              <div className="absolute top-0 right-2 flex items-center gap-2 z-20 -translate-y-1/2">
                <span className="text-sm font-black text-slate-700 bg-white px-3 py-1.5 rounded-xl shadow-sm border-2 border-slate-200">17h00</span>
                <div className="w-2 h-0.5 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>

          {/* Days Columns */}
          <div className="flex-1 grid grid-cols-5 gap-6">
            {weekDays.map((day, dayIndex) => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              
              return (
                <div key={day.toISOString()} className="flex flex-col">
                  {/* Day Header */}
                  <div className={`h-24 flex flex-col items-center justify-center mb-6 rounded-[2rem] border-b-4 transition-all relative ${
                    isToday
                    ? 'bg-gradient-to-b from-orange-400 to-orange-500 border-orange-600 text-white shadow-xl shadow-orange-500/30 scale-110 origin-bottom z-10'
                    : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                  }`}>
                    {isToday && (
                      <div className="absolute -top-3 bg-white text-orange-500 text-[10px] font-black px-3 py-1 rounded-full shadow-md border border-orange-100 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AUJOURD&apos;HUI
                      </div>
                    )}
                    <span className={`text-xs font-black uppercase tracking-widest mb-1 ${isToday ? 'text-orange-100' : 'text-slate-400'}`}>
                      {format(day, "EEEE", { locale: fr })}
                    </span>
                    <span className="text-3xl font-black">{format(day, "d")}</span>
                  </div>

                  {/* Day Grid */}
                  <div className={`relative flex-1 rounded-[2rem] border-4 overflow-hidden transition-all duration-500 ${
                    isToday 
                      ? 'bg-orange-50/60 border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.15)] ring-4 ring-orange-400/20 transform scale-[1.02] z-10' 
                      : 'bg-white border-slate-200/60 shadow-sm'
                  }`}>
                    {/* Horizontal Grid Lines */}
                    {hours.map((hour, i) => (
                      <div 
                        key={hour} 
                        onClick={() => handleEmptySlotClick(dayIndex, hour)}
                        className={`h-24 border-t-2 border-dashed ${isToday ? 'border-orange-400/60' : 'border-slate-300'} relative ${i === 0 ? 'border-t-0' : ''} cursor-pointer hover:bg-slate-500/5 transition-colors group`}
                      >
                        {/* Ligne de la demi-heure (30 min) */}
                        <div className={`absolute top-1/2 left-0 right-0 border-t border-dotted ${isToday ? 'border-orange-300/50' : 'border-slate-200'} pointer-events-none`} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                          <div className="bg-white/90 text-slate-400 rounded-full p-1.5 shadow-sm border border-slate-200">
                            <Plus className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Déjeuner Block */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute left-0 right-0 flex items-center justify-center border-y-2 border-dashed z-0 ${isToday ? 'bg-orange-100/50 border-orange-200' : 'bg-slate-100/50 border-slate-200'}`}
                      style={{ top: `${(12 - 8) * 96}px`, height: `${96}px` }}
                    >
                      <div className={`flex items-center gap-2 font-bold tracking-widest uppercase text-sm ${isToday ? 'text-orange-400' : 'text-slate-400'}`}>
                        <Coffee className="w-5 h-5" />
                        <span>Déjeuner</span>
                      </div>
                    </div>

                    {/* Lessons */}
                    {lessons
                      .filter((lesson) => lesson.day === dayIndex)
                      .map((lesson) => {
                        const classInfo = CLASSES.find(c => c.id === lesson.classId)!
                        const taskInfo = TASK_TYPES[lesson.taskType as keyof typeof TASK_TYPES]
                        const TaskIcon = taskInfo.icon

                        return (
                          <motion.div
                            key={lesson.id}
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.04, zIndex: 50, rotate: 1 }}
                            className={`group absolute left-2 right-2 rounded-2xl p-3 shadow-md border-b-4 cursor-pointer flex flex-col gap-1 ${classInfo.color} ${classInfo.border} text-white transition-shadow hover:shadow-xl`}
                            style={{
                              top: `${(lesson.start - 8) * 96 + 8}px`, // 96px per hour (h-24), +8px padding
                              height: `${lesson.duration * 96 - 16}px`, // -16px for padding
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-black text-sm leading-tight line-clamp-2 drop-shadow-sm">{lesson.title}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button 
                                  onClick={(e) => handleDeleteActivity(e, lesson.id)}
                                  className="bg-white/20 hover:bg-rose-500/90 p-1.5 rounded-xl backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-sm">
                                  <TaskIcon className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-auto flex items-center justify-between">
                              <span className="text-xs font-bold bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg truncate max-w-[60%] shadow-inner">
                                {classInfo.name}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-wider opacity-90 drop-shadow-sm">
                                {taskInfo.label}
                              </span>
                            </div>
                          </motion.div>
                        )
                      })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Task Management Section */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-10 shadow-xl border-4 border-slate-100 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 opacity-50 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-50 opacity-50 rounded-full blur-2xl -translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs sm:text-sm mb-3 border border-indigo-200 shadow-sm">
              <ListTodo className="w-4 h-4" />
              <span>Gestion des tâches</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Ma To-Do List <span className="inline-block hover:animate-bounce cursor-default origin-bottom">📝</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">Organisez vos priorités et ne rien oublier !</p>
          </div>
          <Button 
            onClick={() => setIsAddTaskModalOpen(true)}
            className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black border-b-4 border-indigo-800 shadow-lg hover:-translate-y-1 transition-all w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> Nouvelle tâche
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                className={`relative p-5 rounded-[1.5rem] border-2 transition-all ${
                  task.completed 
                    ? 'bg-slate-50 border-slate-200 opacity-75' 
                    : task.priority === 'high'
                      ? 'bg-rose-50 border-rose-200 shadow-sm'
                      : task.priority === 'medium'
                        ? 'bg-amber-50 border-amber-200 shadow-sm'
                        : 'bg-sky-50 border-sky-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      task.completed 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white border-2 border-slate-300 hover:border-indigo-500 text-transparent hover:text-indigo-200'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-base sm:text-lg leading-tight mb-1 ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {!task.completed && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          task.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-sky-100 text-sky-700'
                        }`}>
                          <Flag className="w-3 h-3" />
                          {task.priority === 'high' ? 'Urgent' : task.priority === 'medium' ? 'Normal' : 'Basse'}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 text-[10px] font-bold">
                          <CalendarIcon className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="shrink-0 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {tasks.length === 0 && (
            <div className="col-span-full py-12 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border-4 border-slate-100">
                <CheckCircle2 className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-700 mb-1">Toutes les tâches sont terminées !</h3>
              <p className="text-slate-500 font-medium">Vous pouvez vous détendre ou ajouter de nouvelles tâches.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 pointer-events-none">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto max-h-[90vh]"
              >
                <div className="p-6 sm:p-8 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-slate-800">Ajouter un cours</h3>
                    <button 
                      onClick={() => setIsAddModalOpen(false)}
                      className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Titre</label>
                      <input 
                        type="text" 
                        value={newActivity.title}
                        onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                        placeholder="Ex: Conjugaison : Le présent"
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors"
                      />
                    </div>

                    {/* Class Selection */}
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Classe</label>
                      <select 
                        value={newActivity.classId}
                        onChange={(e) => setNewActivity({...newActivity, classId: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors appearance-none"
                      >
                        {CLASSES.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Task Type */}
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(TASK_TYPES) as Array<keyof typeof TASK_TYPES>).map(type => {
                          const info = TASK_TYPES[type]
                          const Icon = info.icon
                          const isSelected = newActivity.taskType === type
                          return (
                            <button
                              key={type}
                              onClick={() => setNewActivity({...newActivity, taskType: type})}
                              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all ${
                                isSelected 
                                  ? "border-indigo-500 bg-indigo-50 text-indigo-600" 
                                  : "border-slate-100 hover:border-slate-200 bg-white text-slate-500"
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                              <span className="text-xs font-bold">{info.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Day & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Jour</label>
                        <select 
                          value={newActivity.day}
                          onChange={(e) => setNewActivity({...newActivity, day: parseInt(e.target.value)})}
                          className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors appearance-none"
                        >
                          <option value={0}>Dimanche</option>
                          <option value={1}>Lundi</option>
                          <option value={2}>Mardi</option>
                          <option value={3}>Mercredi</option>
                          <option value={4}>Jeudi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Heure</label>
                        <select 
                          value={newActivity.start}
                          onChange={(e) => setNewActivity({...newActivity, start: parseFloat(e.target.value)})}
                          className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors appearance-none"
                        >
                          {hours.map(h => (
                            <option key={h} value={h}>{h}h00</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Durée (heures)</label>
                      <input 
                        type="number" 
                        min="0.5"
                        step="0.5"
                        value={newActivity.duration}
                        onChange={(e) => setNewActivity({...newActivity, duration: parseFloat(e.target.value)})}
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleAddActivity}
                      disabled={!newActivity.title.trim()}
                      className="w-full py-4 bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-amber-950 rounded-xl font-black text-lg transition-colors shadow-lg shadow-amber-500/30 disabled:shadow-none mt-4 border-b-4 border-amber-600 disabled:border-slate-300"
                    >
                      Ajouter au planning
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddTaskModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddTaskModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 pointer-events-none">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto max-h-[90vh]"
              >
                <div className="p-6 sm:p-8 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-slate-800">Nouvelle tâche</h3>
                    <button 
                      onClick={() => setIsAddTaskModalOpen(false)}
                      className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Titre de la tâche</label>
                      <input 
                        type="text" 
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        placeholder="Ex: Préparer le contrôle de maths"
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors"
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Priorité</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['low', 'medium', 'high'] as TaskPriority[]).map(priority => {
                          const isSelected = newTask.priority === priority
                          const labels = { low: 'Basse', medium: 'Normale', high: 'Urgente' }
                          const colors = { 
                            low: 'border-sky-500 bg-sky-50 text-sky-600', 
                            medium: 'border-amber-500 bg-amber-50 text-amber-600', 
                            high: 'border-rose-500 bg-rose-50 text-rose-600' 
                          }
                          return (
                            <button
                              key={priority}
                              onClick={() => setNewTask({...newTask, priority})}
                              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all ${
                                isSelected 
                                  ? colors[priority]
                                  : "border-slate-100 hover:border-slate-200 bg-white text-slate-500"
                              }`}
                            >
                              <Flag className={`w-5 h-5 ${isSelected ? '' : 'text-slate-400'}`} />
                              <span className="text-xs font-bold">{labels[priority]}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Pour quand ?</label>
                      <input 
                        type="text" 
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                        placeholder="Ex: Demain, Lundi prochain..."
                        className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleAddTask}
                      disabled={!newTask.title?.trim()}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-black text-lg transition-colors shadow-lg shadow-indigo-500/30 disabled:shadow-none mt-4 border-b-4 border-indigo-800 disabled:border-slate-300"
                    >
                      Ajouter la tâche
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
