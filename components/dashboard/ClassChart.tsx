"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"
import { Users, ArrowLeft, BookOpen, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { handleFirestoreError, OperationType } from "@/lib/firebase-error"

type ClassData = {
  id: string
  name: string
  theme: string
  studentCount: number
  color: string
}

const colors = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"]

export function ClassChart() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [classesData, setClassesData] = useState<ClassData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthReady } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthReady || !user) return

      try {
        // Fetch classes
        const classesQuery = query(collection(db, "classes"), where("teacherId", "==", user.uid))
        const classesSnapshot = await getDocs(classesQuery)
        
        // Fetch students to count them per class
        const studentsQuery = query(collection(db, "students"), where("teacherId", "==", user.uid))
        const studentsSnapshot = await getDocs(studentsQuery)
        
        const studentCounts: Record<string, number> = {}
        studentsSnapshot.forEach(doc => {
          const student = doc.data()
          studentCounts[student.classId] = (studentCounts[student.classId] || 0) + 1
        })

        const formattedData: ClassData[] = classesSnapshot.docs.map((doc, index) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name,
            theme: data.theme,
            studentCount: studentCounts[doc.id] || 0,
            color: colors[index % colors.length]
          }
        })

        setClassesData(formattedData)
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "classes/students")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, isAuthReady])

  const activeClassData = classesData.find(d => d.name === selectedClass)

  if (isLoading) {
    return (
      <Card className="border border-slate-200 bg-white h-[350px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </Card>
    )
  }

  if (classesData.length === 0) {
    return (
      <Card className="border border-slate-200 bg-white h-[350px] flex flex-col items-center justify-center text-center p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl font-black text-slate-800 mb-2">Aucune classe</CardTitle>
        <p className="text-sm font-medium text-slate-500 max-w-[250px]">
          Ajoutez vos classes pour voir les statistiques s&apos;afficher ici.
        </p>
      </Card>
    )
  }

  if (selectedClass && activeClassData) {
    return (
      <Card className="border border-slate-200 bg-white flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSelectedClass(null)} 
            className="h-10 w-10 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <CardTitle className="text-2xl font-black text-slate-800">Classe : {activeClassData.name}</CardTitle>
            <p className="text-sm font-bold text-slate-400">Thème : {activeClassData.theme}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className={`p-4 rounded-2xl border bg-opacity-10 border-opacity-30`} style={{ backgroundColor: `${activeClassData.color}15`, borderColor: activeClassData.color }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: activeClassData.color }}>
                <Users className="h-5 w-5" />
                <span className="font-bold text-sm">Effectif</span>
              </div>
              <p className="text-3xl font-black text-slate-800">{activeClassData.studentCount}<span className="text-lg text-slate-400"> élèves</span></p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 mb-2 text-slate-600">
                <GraduationCap className="h-5 w-5" />
                <span className="font-bold text-sm">Niveau</span>
              </div>
              <p className="text-xl font-black text-slate-800">{activeClassData.theme}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-xl sm:text-2xl font-black text-slate-800">Effectifs par Classe</CardTitle>
        <p className="text-xs sm:text-sm font-bold text-slate-400">Cliquez sur une barre pour voir les détails</p>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="h-[200px] sm:h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classesData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '4px solid #f1f5f9', 
                  fontWeight: '900', 
                  color: '#1e293b', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }}
                formatter={(value: any) => [`${value} élèves`, 'Effectif']}
              />
              <Bar 
                dataKey="studentCount" 
                radius={[8, 8, 0, 0]} 
                barSize={48}
                onClick={(data: any) => setSelectedClass(data.name)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {classesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
