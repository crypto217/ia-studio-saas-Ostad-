import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

const supabaseUrl = 'https://kdtkbqrwcuigskrwkwjr.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdGticXJ3Y3VpZ3Nrcndrd2pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQxMjg4MywiZXhwIjoyMDkzOTg4ODgzfQ.CBvm1KsJ1VqzWPWrx3tFHcioiuGwUXvAFd2Kc8k2Txo';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Initialize Supabase
const supabase = createClient(supabaseUrl, serviceRoleKey);

const OLD_TEACHER_ID = 'dev_teacher_id';
const NEW_TEACHER_ID = 'd3b07384-d113-4956-809e-206af520d0e2';

async function migrate() {
  console.log('Starting migration...');

  try {
    // 1. Fetch classes from Firestore
    console.log('Fetching classes...');
    const classesRef = collection(db, 'classes');
    const classesQuery = query(classesRef, where('teacherId', '==', OLD_TEACHER_ID));
    const classesSnapshot = await getDocs(classesQuery);
    
    const classIdMap = new Map(); // Firestore Class ID -> Supabase Class UUID
    const classesList = [];

    classesSnapshot.forEach((doc) => {
      const data = doc.data();
      const newClassId = randomUUID();
      classIdMap.set(doc.id, newClassId);
      classesList.push({
        id: newClassId,
        teacher_id: NEW_TEACHER_ID,
        name: data.name,
        cycle: data.cycle || 'Primaire',
        theme: data.theme || 'emerald',
        level: data.level || data.cycle || 'Primaire',
        school_year: data.school_year || '2025-2026'
      });
    });

    if (classesList.length > 0) {
      console.log(`Inserting ${classesList.length} classes into Supabase...`);
      const { error: cErr } = await supabase.from('classes').insert(classesList);
      if (cErr) throw cErr;
    } else {
      console.log('No classes found to migrate.');
    }

    // 2. Fetch students from Firestore
    console.log('Fetching students...');
    const studentsRef = collection(db, 'students');
    const studentsQuery = query(studentsRef, where('teacherId', '==', OLD_TEACHER_ID));
    const studentsSnapshot = await getDocs(studentsQuery);

    const studentIdMap = new Map(); // Firestore Student ID -> Supabase Student UUID
    const studentsList = [];

    studentsSnapshot.forEach((doc) => {
      const data = doc.data();
      const newStudentId = randomUUID();
      studentIdMap.set(doc.id, newStudentId);

      // Map classId if exists in our map
      const mappedClassId = classIdMap.get(data.classId);
      if (mappedClassId) {
        studentsList.push({
          id: newStudentId,
          teacher_id: NEW_TEACHER_ID,
          class_id: mappedClassId,
          name: data.name,
          gender: data.gender || 'M',
          grade: Number(data.score) || 0,
          status: data.status || 'good'
        });
      } else {
        console.warn(`Warning: Student ${data.name} has classId ${data.classId} which was not migrated.`);
      }
    });

    if (studentsList.length > 0) {
      console.log(`Inserting ${studentsList.length} students into Supabase...`);
      const { error: sErr } = await supabase.from('students').insert(studentsList);
      if (sErr) throw sErr;
    } else {
      console.log('No students found to migrate.');
    }

    // 3. Fetch lessons from Firestore
    console.log('Fetching lessons...');
    const lessonsRef = collection(db, 'lessons');
    const lessonsQuery = query(lessonsRef, where('teacherId', '==', OLD_TEACHER_ID));
    const lessonsSnapshot = await getDocs(lessonsQuery);

    const lessonsList = [];
    lessonsSnapshot.forEach((doc) => {
      const data = doc.data();
      const mappedClassId = classIdMap.get(data.classId);
      lessonsList.push({
        teacher_id: NEW_TEACHER_ID,
        class_id: mappedClassId || null,
        title: data.title,
        task_type: data.taskType || 'cours',
        day_number: Number(data.day) || 1,
        start_hour: Number(data.start) || 8,
        duration_hours: Number(data.duration) || 1,
        day: String(data.day || '1'),
        room: data.room || 'Salle 01',
        duration: data.duration ? `${data.duration}h` : '1h',
        time_slot: data.time_slot || '08:00 - 09:00'
      });
    });

    if (lessonsList.length > 0) {
      console.log(`Inserting ${lessonsList.length} lessons into Supabase...`);
      const { error: lErr } = await supabase.from('lessons').insert(lessonsList);
      if (lErr) throw lErr;
    }

    // 4. Fetch tasks from Firestore
    console.log('Fetching tasks...');
    const tasksRef = collection(db, 'tasks');
    const tasksQuery = query(tasksRef, where('teacherId', '==', OLD_TEACHER_ID));
    const tasksSnapshot = await getDocs(tasksQuery);

    const tasksList = [];
    tasksSnapshot.forEach((doc) => {
      const data = doc.data();
      tasksList.push({
        teacher_id: NEW_TEACHER_ID,
        title: data.title,
        deadline: data.deadline || 'Aujourd\'hui',
        urgent: !!data.urgent,
        color: data.color || 'sky',
        completed: !!data.completed
      });
    });

    if (tasksList.length > 0) {
      console.log(`Inserting ${tasksList.length} tasks into Supabase...`);
      const { error: tErr } = await supabase.from('tasks').insert(tasksList);
      if (tErr) throw tErr;
    }

    // 5. Fetch courses from Firestore
    console.log('Fetching courses...');
    const coursesRef = collection(db, 'courses');
    const coursesQuery = query(coursesRef, where('teacherId', '==', OLD_TEACHER_ID));
    const coursesSnapshot = await getDocs(coursesQuery);

    const coursesList = [];
    coursesSnapshot.forEach((doc) => {
      const data = doc.data();
      coursesList.push({
        teacher_id: NEW_TEACHER_ID,
        title: data.title,
        type: data.type || 'Cours',
        class_name: data.className,
        term: data.term || 'Trimestre 1',
        content: data.content || '',
        image_url: data.imageUrl || null,
        color: data.color || 'from-blue-500 to-cyan-400',
        icon_color: data.iconColor || 'text-blue-500',
        bg_color: data.bgColor || 'bg-blue-50'
      });
    });

    if (coursesList.length > 0) {
      console.log(`Inserting ${coursesList.length} courses into Supabase...`);
      const { error: coErr } = await supabase.from('courses').insert(coursesList);
      if (coErr) throw coErr;
    }

    // 6. Fetch activities from Firestore
    console.log('Fetching activities...');
    const activitiesRef = collection(db, 'activities');
    const activitiesQuery = query(activitiesRef, where('teacherId', '==', OLD_TEACHER_ID));
    const activitiesSnapshot = await getDocs(activitiesQuery);

    const activitiesList = [];
    activitiesSnapshot.forEach((doc) => {
      const data = doc.data();
      activitiesList.push({
        teacher_id: NEW_TEACHER_ID,
        title: data.title,
        description: data.description,
        type: data.type || 'grade'
      });
    });

    if (activitiesList.length > 0) {
      console.log(`Inserting ${activitiesList.length} activities into Supabase...`);
      const { error: aErr } = await supabase.from('activities').insert(activitiesList);
      if (aErr) throw aErr;
    }

    // 7. Fetch attendances from Firestore
    console.log('Fetching attendances...');
    const attendancesRef = collection(db, 'attendances');
    const attendancesQuery = query(attendancesRef, where('teacherId', '==', OLD_TEACHER_ID));
    const attendancesSnapshot = await getDocs(attendancesQuery);

    const attendancesList = [];
    attendancesSnapshot.forEach((doc) => {
      const data = doc.data();
      const mappedClassId = classIdMap.get(data.classId);
      const records = data.records || {};

      if (mappedClassId) {
        Object.entries(records).forEach(([firestoreStudentId, status]) => {
          const mappedStudentId = studentIdMap.get(firestoreStudentId);
          if (mappedStudentId) {
            attendancesList.push({
              teacher_id: NEW_TEACHER_ID,
              class_id: mappedClassId,
              student_id: mappedStudentId,
              date: data.date || new Date().toISOString().split('T')[0],
              status: status || 'present'
            });
          }
        });
      }
    });

    if (attendancesList.length > 0) {
      console.log(`Inserting ${attendancesList.length} attendances into Supabase...`);
      const { error: attErr } = await supabase.from('attendances').insert(attendancesList);
      if (attErr) throw attErr;
    }

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

migrate();
