import { db } from "@/firebase";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

interface FormattedStudentData {
  profile: {
    name: string;
    gender?: string;
    classId: string;
  };
  performance: {
    subject?: string;
    score: number | string;
    date: string;
  }[];
  attendance: {
    totalAbsences: number;
    totalLates: number;
    dates: { status: string; date: string }[];
  };
  behavior: {
    note: string;
    date: string;
  }[];
}

/**
 * Agrège les données d'un élève réparties dans Firestore pour l'analyse IA.
 */
export async function getComprehensiveStudentProfile(
  studentId: string,
  classId: string
): Promise<FormattedStudentData> {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("User must be authenticated");
  }

  // 1. Récupération du profil de l'étudiant
  const studentDocRef = doc(db, "students", studentId);
  const studentSnap = await getDoc(studentDocRef);
  
  if (!studentSnap.exists()) {
    throw new Error("Student not found");
  }
  
  const studentData = studentSnap.data();
  
  // 2. Récupération des notes (Requête sur la collection 'grades' supposée)
  const gradesQuery = query(collection(db, "grades"), where("teacherId", "==", uid), where("studentId", "==", studentId));
  const gradesPromise = getDocs(gradesQuery);

  // 3. Récupération des présences (Requête sur 'attendances' filtrée par classId)
  const attendancesQuery = query(collection(db, "attendances"), where("teacherId", "==", uid), where("classId", "==", classId));
  const attendancesPromise = getDocs(attendancesQuery);

  // 4. Récupération des observations (Requête sur 'observations' à venir)
  const observationsQuery = query(collection(db, "observations"), where("teacherId", "==", uid), where("studentId", "==", studentId));
  const observationsPromise = getDocs(observationsQuery);

  // Exécution parallèle des requêtes pour plus de performance
  const [gradesSnap, attendancesSnap, observationsSnap] = await Promise.all([
    gradesPromise,
    attendancesPromise,
    observationsPromise
  ]);

  // --- Formatage des Performances ---
  const gradeMapping: Record<string, string> = { "A": "Maîtrise très satisfaisante", "B": "Maîtrise satisfaisante", "C": "Maîtrise peu satisfaisante", "D": "Maîtrise non satisfaisante" };

  const performance = gradesSnap.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      subject: data.subject || "Général",
      score: typeof data.score === 'string' && gradeMapping[data.score.toUpperCase()] ? gradeMapping[data.score.toUpperCase()] : (data.score || data.value),
      date: data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : "N/A"),
    };
  });

  // --- Formatage des Présences ---
  let totalAbsences = 0;
  let totalLates = 0;
  const attendanceDates: { status: string; date: string }[] = [];

  attendancesSnap.docs.forEach(docSnap => {
    const data = docSnap.data();
    // La structure est supposée être: data.records est un map { [studentId]: "present" | "absent" | "late" }
    if (data.records && data.records[studentId]) {
      const status = data.records[studentId];
      if (status === "absent") totalAbsences++;
      if (status === "late" || status === "retard") totalLates++;
      
      if (status !== "present") { // On ne garde que les anomalies pour l'IA
        attendanceDates.push({
          status,
          date: data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : "N/A"),
        });
      }
    }
  });

  // --- Formatage du Comportement / Observations ---
  const behavior = observationsSnap.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      note: data.note || data.description || "",
      date: data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : "N/A"),
    };
  });

  // --- Construction de l'objet final allégé pour l'IA ---
  return {
    profile: {
      name: studentData.name || "Élève anonyme",
      gender: studentData.gender,
      classId: studentData.classId,
    },
    performance,
    attendance: {
      totalAbsences,
      totalLates,
      dates: attendanceDates,
    },
    behavior,
  };
}
