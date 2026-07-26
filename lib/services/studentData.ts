import { createBrowserClient } from '@/lib/supabase'
import { FrenchActivity } from "@/lib/types";

export const createClient = () => {
  return createBrowserClient()
}


interface FormattedStudentData {
  profile: {
    name: string;
    gender?: string;
    classId: string;
  };
  performance: {
    subject?: FrenchActivity | string;
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

// --- Fonctions de lecture ---

export async function getClasses() {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', userData.user.id);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

export async function getStudents() {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('teacher_id', userData.user.id);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function getStudentsByClass(classId: string) {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('teacher_id', userData.user.id)
      .eq('class_id', classId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching students by class:", error);
    return [];
  }
}

// --- Fonctions d'écriture (ajout, édition, suppression) ---

export async function addStudent(studentData: any) {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('students')
      .insert([{ ...studentData, teacher_id: userData.user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding student:", error);
    return null;
  }
}

export async function updateStudent(studentId: string, updates: any) {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', studentId)
      .eq('teacher_id', userData.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating student:", error);
    return null;
  }
}

export async function deleteStudent(studentId: string) {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId)
      .eq('teacher_id', userData.user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting student:", error);
    return false;
  }
}

const parseSubjectField = (rawSubject: string) => {
  if (!rawSubject) return { title: "Évaluation", label: "", type: "" };
  
  const parts = rawSubject.split('_');
  // If the first part is a UUID (class ID), remove/shift it
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(parts[0])) {
    parts.shift();
  }
  
  if (parts.length === 0) return { title: rawSubject, label: "", type: "" };
  
  const category = parts[0]; // e.g. "oral", "lecture", "ecrit", "production", "continuous"
  const subKey = parts[1] || ""; // e.g. "c1", "evalContinue", etc.
  const tri = parts[2] || ""; // e.g. "t1"
  
  const triLabel = tri ? ` (Trimestre ${tri.substring(1)})` : "";

  if (category === "continuous") {
    const fieldLabels: Record<string, string> = {
      evalContinue: "Évaluation continue",
      devoir1: "Devoir 1",
      devoir2: "Devoir 2",
      composition: "Composition"
    };
    const label = fieldLabels[subKey] || subKey;
    return {
      title: `${label}${triLabel}`,
      label: label,
      type: "continuous"
    };
  }
  
  const subjectsData: Record<string, { title: string, criteria: { id: string, label: string }[] }> = {
    oral: {
      title: "Compréhension et communication orales",
      criteria: [
        { id: 'c1', label: "Thème de la situation" },
        { id: 'c2', label: "Unités de sens" },
        { id: 'c3', label: "Expression adaptée" }
      ]
    },
    lecture: {
      title: "Lecture",
      criteria: [
        { id: 'c1', label: "Correspondance graphie/phonie" },
        { id: 'c2', label: "Fluidité (mots/min)" },
        { id: 'c3', label: "Intonation" }
      ]
    },
    ecrit: {
      title: "Compréhension de l'écrit",
      criteria: [
        { id: 'c1', label: "Thème général" },
        { id: 'c2', label: "Champ lexical" },
        { id: 'c3', label: "Repérage d'informations" }
      ]
    },
    production: {
      title: "Production écrite",
      criteria: [
        { id: 'c1', label: "Pertinence" },
        { id: 'c2', label: "Cohérence" },
        { id: 'c3', label: "Correction de la langue" },
        { id: 'c4', label: "Lisibilité" }
      ]
    }
  };
  
  const subjectInfo = subjectsData[category];
  if (subjectInfo) {
    const crit = subjectInfo.criteria.find(c => c.id === subKey);
    return {
      title: `${subjectInfo.title}${triLabel}`,
      label: crit ? crit.label : subKey,
      type: category
    };
  }
  
  return { title: rawSubject, label: "", type: category };
};

/**
 * Agrège les données d'un élève réparties dans Supabase pour l'analyse IA.
 */
export async function getComprehensiveStudentProfile(
  studentId: string,
  classId: string
): Promise<FormattedStudentData | null> {
  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error("User must be authenticated");
      return null;
    }

    // 1. Récupération du profil de l'étudiant
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError || !studentData) throw studentError || new Error("Student not found");

    // 2. Récupération des évaluations depuis la table 'grades'
    const gradesPromise = supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId);

    // 3. Récupération des présences
    const attendancesPromise = supabase
      .from('attendances')
      .select('*')
      .eq('student_id', studentId)
      .eq('class_id', classId);

    // 4. Récupération des observations
    const observationsPromise = supabase
      .from('observations')
      .select('*')
      .eq('student_id', studentId);

    const [gradesSnap, attendancesSnap, observationsSnap] = await Promise.all([
      gradesPromise,
      attendancesPromise,
      observationsPromise
    ]);

    // --- Formatage des Performances ---
    const gradeMapping: Record<string, string> = { 
      "A": "Très satisfaisante", 
      "B": "Satisfaisante", 
      "C": "Peu satisfaisante", 
      "D": "Non satisfaisante"
    };

    const performance: { subject: string; score: string; date: string; }[] = [];
    (gradesSnap.data || []).forEach((g: any) => {
      const parsed = parseSubjectField(g.subject);
      const scoreStr = String(g.score || "").toUpperCase();
      const scoreLabel = gradeMapping[scoreStr] || (scoreStr ? `${scoreStr}/10` : "Non Évalué");
      performance.push({
        subject: `${parsed.title} - ${parsed.label}`,
        score: scoreLabel,
        date: g.date ? new Date(g.date).toLocaleDateString('fr-FR') : (g.created_at ? new Date(g.created_at).toLocaleDateString('fr-FR') : "N/A")
      });
    });

    // --- Formatage des Présences ---
    let totalAbsences = 0;
    let totalLates = 0;
    const attendanceDates: { status: string; date: string }[] = [];

    (attendancesSnap.data || []).forEach((attendance: any) => {
      const status = attendance.status;
      if (status === "absent") totalAbsences++;
      if (status === "late" || status === "retard") totalLates++;
      
      if (status !== "present") {
        attendanceDates.push({
          status,
          date: attendance.date || attendance.created_at || "N/A",
        });
      }
    });

    // --- Formatage du Comportement / Observations ---
    const behavior = (observationsSnap.data || []).map((obs: any) => ({
      note: obs.note || obs.description || "",
      date: obs.date || obs.created_at || "N/A",
    }));

    return {
      profile: {
        name: studentData.name || "Élève anonyme",
        gender: studentData.gender,
        classId: studentData.class_id,
      },
      performance,
      attendance: {
        totalAbsences,
        totalLates,
        dates: attendanceDates,
      },
      behavior,
    };
  } catch (error) {
    console.error("Error in getComprehensiveStudentProfile:", error);
    return null; // Tolérance aux pannes
  }
}
