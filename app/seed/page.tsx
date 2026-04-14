"use client"

import { useState } from "react"
import { useAuth } from "@/components/AuthProvider"
import { db } from "@/firebase"
import { collection, doc, setDoc, writeBatch } from "firebase/firestore"
import { Button } from "@/components/ui/button"

export default function SeedPage() {
  const { user, isAuthReady } = useAuth()
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const generateData = async () => {
    if (!user) {
      setStatus("Veuillez vous connecter d'abord.")
      return
    }

    setLoading(true)
    setStatus("Génération en cours...")

    try {
      const batch = writeBatch(db)
      const teacherId = user.uid
      const now = new Date().toISOString()

      // 1. Create Classes
      const class1Ref = doc(collection(db, "classes"))
      const class2Ref = doc(collection(db, "classes"))
      
      batch.set(class1Ref, {
        id: class1Ref.id,
        teacherId,
        name: "3ème AP - Groupe A",
        cycle: "Primaire",
        theme: "amber",
        createdAt: now
      })

      batch.set(class2Ref, {
        id: class2Ref.id,
        teacherId,
        name: "4ème AP - Groupe B",
        cycle: "Primaire",
        theme: "emerald",
        createdAt: now
      })

      // 2. Create Students for Class 1
      const studentsC1 = ["Amine Benali", "Lina Merzoug", "Yanis Kadi", "Ines Saidi", "Rayane Toumi", "Sarah Djouadi"]
      const studentRefsC1: any[] = []
      studentsC1.forEach(name => {
        const sRef = doc(collection(db, "students"))
        studentRefsC1.push(sRef)
        batch.set(sRef, {
          id: sRef.id,
          teacherId,
          classId: class1Ref.id,
          name,
          gender: Math.random() > 0.5 ? "M" : "F",
          score: Math.floor(Math.random() * 10) + 10, // 10 to 19
          createdAt: now
        })
      })

      // Create Students for Class 2
      const studentsC2 = ["Mehdi L.", "Aya B.", "Wassim C.", "Kenza D.", "Samy E.", "Nour F."]
      const studentRefsC2: any[] = []
      studentsC2.forEach(name => {
        const sRef = doc(collection(db, "students"))
        studentRefsC2.push(sRef)
        batch.set(sRef, {
          id: sRef.id,
          teacherId,
          classId: class2Ref.id,
          name,
          gender: Math.random() > 0.5 ? "M" : "F",
          score: Math.floor(Math.random() * 10) + 10,
          createdAt: now
        })
      })

      // 3. Create Lessons (Schedule)
      const lessons = [
        { title: "Lecture", taskType: "Cours", day: 1, start: 8, duration: 2, classId: class1Ref.id },
        { title: "Mathématiques", taskType: "Exercices", day: 1, start: 10, duration: 2, classId: class2Ref.id },
        { title: "Écriture", taskType: "Cours", day: 2, start: 9, duration: 1, classId: class1Ref.id },
        { title: "Histoire", taskType: "Cours", day: 3, start: 13, duration: 2, classId: class2Ref.id },
      ]

      lessons.forEach(l => {
        const lRef = doc(collection(db, "lessons"))
        batch.set(lRef, {
          id: lRef.id,
          teacherId,
          classId: l.classId,
          taskType: l.taskType,
          title: l.title,
          day: l.day,
          start: l.start,
          duration: l.duration,
          createdAt: now
        })
      })

      // 4. Create Tasks
      const tasks = [
        { title: "Corriger les copies de 3ème AP", deadline: "Demain", urgent: true, color: "rose", completed: false },
        { title: "Préparer le cours d'histoire", deadline: "Mercredi", urgent: false, color: "sky", completed: false },
        { title: "Réunion parents d'élèves", deadline: "Vendredi", urgent: false, color: "amber", completed: false },
      ]

      tasks.forEach(t => {
        const tRef = doc(collection(db, "tasks"))
        batch.set(tRef, {
          id: tRef.id,
          teacherId,
          title: t.title,
          deadline: t.deadline,
          urgent: t.urgent,
          color: t.color,
          completed: t.completed,
          createdAt: now
        })
      })

      // 4.5 Create Courses
      const courses = [
        { title: "Les verbes du 1er groupe", type: "Cours", className: "3ème AP - Groupe A", term: "Trimestre 1", content: "Introduction aux verbes en -er." },
        { title: "Exercices de conjugaison", type: "Exercice", className: "3ème AP - Groupe A", term: "Trimestre 1", content: "Série d'exercices sur les verbes du 1er groupe." },
        { title: "Évaluation de lecture", type: "Examen", className: "4ème AP - Groupe B", term: "Trimestre 1", content: "Lecture à voix haute et compréhension." },
      ]

      courses.forEach(c => {
        const cRef = doc(collection(db, "courses"))
        batch.set(cRef, {
          teacherId,
          title: c.title,
          type: c.type,
          className: c.className,
          term: c.term,
          content: c.content,
          createdAt: now
        })
      })

      // 5. Create Activities
      const activities = [
        { title: "Notes ajoutées", description: "Vous avez ajouté 24 notes pour la 3ème AP", type: "grade" },
        { title: "Nouveau document", description: "Support de cours 'Grammaire' partagé", type: "document" },
        { title: "Emploi du temps", description: "Modification de la séance de mardi", type: "schedule" },
      ]

      activities.forEach(a => {
        const aRef = doc(collection(db, "activities"))
        batch.set(aRef, {
          id: aRef.id,
          teacherId,
          title: a.title,
          description: a.description,
          type: a.type,
          createdAt: now
        })
      })

      // 6. Create Attendances
      const today = new Date().toISOString().split('T')[0]
      const recordsC1: Record<string, string> = {}
      studentRefsC1.forEach(ref => {
        const statuses = ['present', 'present', 'present', 'absent', 'late']
        recordsC1[ref.id] = statuses[Math.floor(Math.random() * statuses.length)]
      })

      const attRef = doc(collection(db, "attendances"))
      batch.set(attRef, {
        teacherId,
        classId: class1Ref.id,
        date: today,
        records: recordsC1,
        createdAt: now
      })

      // Commit all
      await batch.commit()

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
