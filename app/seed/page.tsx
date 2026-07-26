"use client"

import { useState } from "react"
import { useAuth } from "@/components/AuthProvider"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function SeedPage() {
  const { user, isAuthReady } = useAuth()
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()

  const generateData = async () => {
    if (!user?.id) {
      setStatus("Veuillez vous connecter d'abord.")
      return
    }

    setLoading(true)
    setStatus("Génération en cours...")

    try {
      const teacherId = user.id

      // 1. Create Classes
      const { data: class1Data, error: c1Error } = await supabase
        .from('classes')
        .insert([{
          teacher_id: teacherId,
          name: "3ème AP - Groupe A",
          cycle: "Primaire",
          theme: "amber",
          level: "3AP",
          school_year: "2025-2026"
        }])
        .select()
        .single()

      const { data: class2Data, error: c2Error } = await supabase
        .from('classes')
        .insert([{
          teacher_id: teacherId,
          name: "4ème AP - Groupe B",
          cycle: "Primaire",
          theme: "emerald",
          level: "4AP",
          school_year: "2025-2026"
        }])
        .select()
        .single()

      if (c1Error || c2Error) {
        console.error("c1Error:", c1Error, "c2Error:", c2Error)
        throw new Error("Erreur lors de la création des classes : " + JSON.stringify(c1Error || c2Error))
      }
      const class1Id = class1Data.id
      const class2Id = class2Data.id

      // 2. Create Students for Class 1
      const studentsC1 = ["Amine Benali", "Lina Merzoug", "Yanis Kadi", "Ines Saidi", "Rayane Toumi", "Sarah Djouadi"]
      const studentPayloadC1 = studentsC1.map(name => ({
        teacher_id: teacherId,
        class_id: class1Id,
        name,
        gender: Math.random() > 0.5 ? "M" : "F",
        grade: Math.floor(Math.random() * 10) + 10, // 10 to 19
        status: "good"
      }))

      const { data: insertedStudentsC1, error: s1Error } = await supabase
        .from('students')
        .insert(studentPayloadC1)
        .select()

      if (s1Error) throw s1Error

      // Create Students for Class 2
      const studentsC2 = ["Mehdi L.", "Aya B.", "Wassim C.", "Kenza D.", "Samy E.", "Nour F."]
      const studentPayloadC2 = studentsC2.map(name => ({
        teacher_id: teacherId,
        class_id: class2Id,
        name,
        gender: Math.random() > 0.5 ? "M" : "F",
        grade: Math.floor(Math.random() * 10) + 10,
        status: "good"
      }))

      const { error: s2Error } = await supabase
        .from('students')
        .insert(studentPayloadC2)

      if (s2Error) throw s2Error

      // 3. Create Lessons (Schedule)
      const lessonsPayload = [
        { title: "Lecture", task_type: "cours", day_number: 1, start_hour: 8, duration_hours: 2, class_id: class1Id, teacher_id: teacherId, day: "1", room: "Salle 01", duration: "2h", time_slot: "08:00 - 10:00" },
        { title: "Mathématiques", task_type: "exercice", day_number: 1, start_hour: 10, duration_hours: 2, class_id: class2Id, teacher_id: teacherId, day: "1", room: "Salle 02", duration: "2h", time_slot: "10:00 - 12:00" },
        { title: "Écriture", task_type: "cours", day_number: 2, start_hour: 9, duration_hours: 1, class_id: class1Id, teacher_id: teacherId, day: "2", room: "Salle 01", duration: "1h", time_slot: "09:00 - 10:00" },
        { title: "Histoire", task_type: "cours", day_number: 3, start_hour: 13, duration_hours: 2, class_id: class2Id, teacher_id: teacherId, day: "3", room: "Salle 02", duration: "2h", time_slot: "13:00 - 15:00" },
      ]

      const { error: lesError } = await supabase
        .from('lessons')
        .insert(lessonsPayload)

      if (lesError) throw lesError

      // 4. Create Tasks
      const tasksPayload = [
        { title: "Corriger les copies de 3ème AP", deadline: "Demain", urgent: true, color: "rose", completed: false, teacher_id: teacherId },
        { title: "Préparer le cours d'histoire", deadline: "Mercredi", urgent: false, color: "sky", completed: false, teacher_id: teacherId },
        { title: "Réunion parents d'élèves", deadline: "Vendredi", urgent: false, color: "amber", completed: false, teacher_id: teacherId },
      ]

      const { error: tskError } = await supabase
        .from('tasks')
        .insert(tasksPayload)

      if (tskError) throw tskError

      // 4.5 Create Courses
      const coursesPayload = [
        { title: "Les verbes du 1er groupe", type: "Cours", class_name: "3ème AP - Groupe A", term: "Trimestre 1", content: "Introduction aux verbes en -er.", teacher_id: teacherId },
        { title: "Exercices de conjugaison", type: "Exercice", class_name: "3ème AP - Groupe A", term: "Trimestre 1", content: "Série d'exercices sur les verbes du 1er groupe.", teacher_id: teacherId },
        { title: "Évaluation de lecture", type: "Examen", class_name: "4ème AP - Groupe B", term: "Trimestre 1", content: "Lecture à voix haute et compréhension.", teacher_id: teacherId },
      ]

      const { error: crsError } = await supabase
        .from('courses')
        .insert(coursesPayload)

      if (crsError) throw crsError

      // 5. Create Activities
      const activitiesPayload = [
        { title: "Notes ajoutées", description: "Vous avez ajouté 24 notes pour la 3ème AP", type: "grade", teacher_id: teacherId },
        { title: "Nouveau document", description: "Support de cours 'Grammaire' partagé", type: "document", teacher_id: teacherId },
        { title: "Emploi du temps", description: "Modification de la séance de mardi", type: "schedule", teacher_id: teacherId },
      ]

      const { error: actError } = await supabase
        .from('activities')
        .insert(activitiesPayload)

      if (actError) throw actError

      // 6. Create Attendances
      const todayDate = new Date().toISOString().split('T')[0]
      const attPayloadC1 = (insertedStudentsC1 || []).map(s => {
        const statuses = ['present', 'present', 'present', 'absent', 'late']
        return {
          teacher_id: teacherId,
          student_id: s.id,
          class_id: class1Id,
          date: todayDate,
          status: statuses[Math.floor(Math.random() * statuses.length)]
        }
      })

      const { error: attError } = await supabase
        .from('attendances')
        .insert(attPayloadC1)

      if (attError) throw attError

      setStatus("✅ Données générées avec succès ! Vous pouvez maintenant explorer l'application.")
    } catch (error: any) {
      console.error(error)
      setStatus("❌ Erreur: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthReady) return <div className="p-8">Chargement...</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Générateur de données de test</h1>
      <p className="mb-6 text-slate-600">
        Cliquez sur le bouton ci-dessous pour générer des classes, des élèves, des cours, des tâches et des présences pour votre compte.
        Cela vous permettra de tester toutes les fonctionnalités du SaaS.
      </p>
      
      <Button 
        onClick={generateData} 
        disabled={loading || !user}
        className="mb-4"
      >
        {loading ? "Génération..." : "Générer les données"}
      </Button>

      {status && (
        <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
          {status}
        </div>
      )}
    </div>
  )
}
