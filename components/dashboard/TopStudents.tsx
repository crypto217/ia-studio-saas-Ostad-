"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Trophy, Medal, Star, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/AuthProvider"
import { createBrowserClient } from "@/lib/supabase"

type Student = {
  id: string
  name: string
  score?: number
}

const rankStyles = [
  { color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-200", icon: Trophy },
  { color: "text-slate-400", bg: "bg-slate-100", border: "border-slate-200", icon: Medal },
  { color: "text-orange-400", bg: "bg-orange-100", border: "border-orange-200", icon: Medal },
  { color: "text-sky-500", bg: "bg-sky-100", border: "border-sky-200", icon: Star },
]

export function TopStudents() {
  const [topStudents, setTopStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthReady } = useAuth()
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchTopStudents = async () => {
      if (!isAuthReady || !user?.id) return

      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, name')
          .eq('teacher_id', user.id)

        if (studentsError) throw studentsError

        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select('*')
          .eq('teacher_id', user.id)

        if (gradesError) throw gradesError

        if (studentsData) {
          const getNumericScore = (score: string) => {
            const num = parseFloat(score);
            if (!isNaN(num)) return num;
            const s = score.toUpperCase();
            if (s === 'A') return 9.0;
            if (s === 'B') return 7.5;
            if (s === 'C') return 6.0;
            if (s === 'D') return 4.0;
            return 0;
          };

          const listWithScores = studentsData.map(s => {
            const studentGrades = gradesData?.filter(g => g.student_id === s.id) || [];
            if (studentGrades.length === 0) return { ...s, score: undefined };
            
            const total = studentGrades.reduce((sum, g) => sum + getNumericScore(g.score), 0);
            const avgOutOf10 = total / studentGrades.length;
            const scoreOutOf20 = parseFloat((avgOutOf10 * 2).toFixed(1));
            return {
              id: s.id,
              name: s.name,
              score: scoreOutOf20
            };
          }).filter(s => s.score !== undefined) as Student[];

          listWithScores.sort((a, b) => (b.score || 0) - (a.score || 0));
          setTopStudents(listWithScores.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching top students:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopStudents()
  }, [user, isAuthReady])

  if (isLoading) {
    return (
      <Card className="border border-slate-200 bg-white h-[350px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </Card>
    )
  }

  return (
    <Card className="border border-slate-200 bg-white h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-slate-100 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-500">
            <Trophy className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-black text-slate-800">Meilleurs Élèves</CardTitle>
            <p className="text-xs sm:text-sm font-bold text-slate-400">Meilleures notes globales</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6 flex-1 flex flex-col">
        {topStudents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-600">Aucune note enregistrée</p>
            <p className="text-xs text-slate-400 mt-1">Ajoutez des élèves et des notes pour voir le classement.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {topStudents.map((student, index) => {
              const style = rankStyles[index] || rankStyles[3]
              const Icon = style.icon
              return (
                <Link key={student.id} href={`/students/${student.id}`} className="contents">
                  <div className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer hover:-translate-y-1">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border ${style.bg} ${style.color} ${style.border} group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <p className="text-base sm:text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                    </div>
                    <div className="text-right bg-white px-2.5 sm:px-3 py-1 rounded-xl border border-slate-100 shadow-sm">
                      <p className="text-base sm:text-lg font-black text-indigo-600 leading-none">{student.score}</p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">sur 20</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
