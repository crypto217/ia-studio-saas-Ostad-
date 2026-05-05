"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowLeft, Save, ToggleLeft, ToggleRight, Download } from "lucide-react"
import Link from "next/link"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

interface StudentMarks {
  id: string
  name: string
  avatarColor: string
  evalContinue: number | ''
  devoir1: number | ''
  devoir2: number | ''
  composition: number | ''
}

const initialStudents: StudentMarks[] = [
  { id: "1", name: "Sami Benali", avatarColor: "bg-sky-100 text-sky-600", evalContinue: '', devoir1: '', devoir2: '', composition: '' },
  { id: "2", name: "Lina Mansouri", avatarColor: "bg-pink-100 text-pink-600", evalContinue: 8, devoir1: 7.5, devoir2: 8, composition: 8.5 },
  { id: "3", name: "Yanis Kaddour", avatarColor: "bg-amber-100 text-amber-600", evalContinue: 5, devoir1: 6, devoir2: 5.5, composition: 5.5 },
]

export default function ContinuousEvaluation({ classId, trimestre }: { classId: string, trimestre: string }) {
  const [students, setStudents] = useState<StudentMarks[]>(initialStudents)
  const [hasDevoir2, setHasDevoir2] = useState(true)

  const handleMarkChange = (studentId: string, field: keyof Omit<StudentMarks, 'id'|'name'|'avatarColor'>, value: string) => {
    let numValue: number | '' = value === '' ? '' : parseFloat(value)
    if (numValue !== '' && (numValue < 0 || numValue > 10)) return // validation
    
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, [field]: numValue } : s))
  }

  const calculateContinuousAvg = (s: StudentMarks) => {
    let sum = 0
    let count = 0
    if (s.evalContinue !== '') { sum += s.evalContinue; count++ }
    if (s.devoir1 !== '') { sum += s.devoir1; count++ }
    if (hasDevoir2 && s.devoir2 !== '') { sum += s.devoir2; count++ }
    
    if (count === 0) return null
    return sum / count
  }

  const calculateGeneralAvg = (s: StudentMarks) => {
    const contAvg = calculateContinuousAvg(s)
    if (contAvg === null && s.composition === '') return null
    if (contAvg === null && s.composition !== '') return Number(s.composition)
    if (contAvg !== null && s.composition === '') return contAvg
    return ((contAvg! + Number(s.composition)) / 2)
  }

  const formatNumber = (num: number | null) => {
    if (num === null) return "-"
    return num.toFixed(2)
  }

  const className = classId === '3ap' ? '3ème AP' : classId === '4ap' ? '4ème AP' : '5ème AP'
  const displayedTrimestre = trimestre === "1" ? "1er Trimestre" : `${trimestre}ème Trimestre`

  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('اللغة الفرنسية 1', {
      views: [{ rightToLeft: true }]
    });

    // Define columns
    const columns: Partial<ExcelJS.Column>[] = [
       { key: 'idNum', width: 22 },
       { key: 'lastName', width: 15 },
       { key: 'firstName', width: 15 },
       { key: 'dob', width: 18 },
       { key: 'oral', width: 30 },
       { key: 'reading', width: 25 },
    ];
    
    if (hasDevoir2) {
       columns.push({ key: 'written', width: 20 });
    }
    
    columns.push(
       { key: 'exam', width: 20 },
       { key: 'remarks', width: 25 },
    );
    sheet.columns = columns;

    const lastColLetter = hasDevoir2 ? 'I' : 'H';

    // Top headers
    const addHeader = (rowNum: number, text: string, align: 'center' | 'left' | 'right' = 'center', size: number = 14) => {
      sheet.mergeCells(`A${rowNum}:${lastColLetter}${rowNum}`);
      const cell = sheet.getCell(`A${rowNum}`);
      cell.value = text;
      cell.font = { name: 'Arial', size: size, bold: true };
      cell.alignment = { horizontal: align, vertical: 'middle' };
    };

    addHeader(1, 'الجمهورية الجزائرية الديمقراطية الشعبية');
    addHeader(2, 'وزارة التربية الوطنية');
    addHeader(3, 'مديرية التربية لولاية البويرة');
    addHeader(4, 'مدرسة بغدالي التواتي (الروراوة)', 'right');

    const numTrim = trimestre === "1" ? "الأول" : trimestre === "2" ? "الثاني" : "الثالث";
    const nomFouj = classId === '3ap' ? 'ثالثة إبتدائي' : classId === '4ap' ? 'رابعة إبتدائي' : 'خامسة إبتدائي';
    addHeader(5, `وثيقة حجز النقاط الخاصة بـ: الفصل ${numTrim} السنة الدراسية : 2024-2025 الفوج التربوي : ${nomFouj} مادة : اللغة الفرنسية`, 'center', 12);

    // Table Headers
    const headerRow = sheet.getRow(8);
    headerRow.height = 30;
    
    const headers = [
      'رقم التعريف',
      'اللقب',
      'الإسم',
      'تاريخ الميلاد',
      'التعبير والتواصل الشفهي /10',
      'القراءة و المحفوظات /10',
      ...(hasDevoir2 ? ['الإنتاج الكتابي /10'] : []),
      'علامة الإختبار /10',
      'الملاحظات'
    ];

    headers.forEach((headerText, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = headerText;
      cell.font = { name: 'Arial', size: 12, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'medium' },
        left: { style: 'medium' },
        bottom: { style: 'medium' },
        right: { style: 'medium' }
      };
    });

    // Populate Data
    let startRow = 9;
    students.forEach((student) => {
      const nameParts = student.name.split(' ');
      const lastName = nameParts[0] || '';
      const firstName = nameParts.slice(1).join(' ') || '';

      const rowData: Record<string, any> = {
        idNum: '',
        lastName: lastName,
        firstName: firstName,
        dob: '',
        oral: student.evalContinue === '' ? '' : student.evalContinue,
        reading: student.devoir1 === '' ? '' : student.devoir1,
        exam: student.composition === '' ? '' : student.composition,
        remarks: ''
      };

      if (hasDevoir2) {
        rowData.written = student.devoir2 === '' ? '' : student.devoir2;
      }

      const row = sheet.addRow(rowData);
      row.height = 25;
      
      row.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 11, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      startRow++;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Notes_${classId}_T${trimestre}_ALG.xlsx`);
  };

  return (
    <div className="bg-[#FFFAF3] min-h-[calc(100vh-5rem)] -mx-4 -mt-4 md:-mx-8 md:-mt-8 px-4 py-6 md:px-8 md:py-8 pb-32 relative">
      {/* Navigation */}
      <Link 
        href={`/grades/${classId}`} 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux évaluations
      </Link>

      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1 sm:mb-2 text-balance">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
              Saisie des notes
            </h1>
            <span className="hidden md:inline-block text-2xl text-slate-300 font-black">•</span>
            <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm md:text-lg font-bold self-start md:self-auto">
              {displayedTrimestre}
            </span>
          </div>
          <p className="text-slate-500 font-medium text-sm sm:text-lg mt-2 md:mt-0">
            Classe {className} - <span className="text-slate-700 font-bold">{students.length} Élèves</span>
          </p>
        </div>
        
        {/* Toggle only visible on mobile (since desktop has it in the table header) */}
        <div className={`flex md:hidden items-center gap-3 p-3 rounded-xl border shadow-sm self-start transition-colors ${hasDevoir2 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
          <span className="text-sm font-bold text-slate-600">2ème Devoir</span>
          <button 
            type="button"
            onClick={() => setHasDevoir2(!hasDevoir2)}
            className={`relative flex items-center justify-center w-12 h-6 rounded-full transition-all ring-2 ring-offset-1 ${hasDevoir2 ? 'bg-emerald-500 ring-emerald-500/50 shadow-md' : 'bg-slate-300 ring-transparent'}`}
          >
            <span className={`absolute left-0.5 w-5 h-5 rounded-full bg-white transition-transform drop-shadow-sm ${hasDevoir2 ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-xs font-black uppercase tracking-wider ${hasDevoir2 ? 'text-emerald-700' : 'text-slate-400'}`}>
            {hasDevoir2 ? 'Activé' : 'Désactivé'}
          </span>
        </div>
      </div>

      {/* Desktop View (Table) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto"
      >
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="w-32 sm:w-48 px-3 py-3 text-sm leading-tight whitespace-normal font-extrabold text-slate-700 border-r border-slate-200 sticky left-0 bg-slate-100 z-20 shadow-[1px_0_0_0_#e2e8f0]">
                Nom et prénom
              </th>
              <th className="px-2 py-3 text-sm leading-tight whitespace-normal font-extrabold text-slate-700 text-center border-r border-slate-200">
                Éval. Continue / 10
              </th>
              <th className="px-2 py-3 text-sm leading-tight whitespace-normal font-extrabold text-slate-700 text-center border-r border-slate-200">
                Devoir 1 / 10
              </th>
              <th className={`px-2 py-2 text-sm leading-tight whitespace-normal font-extrabold text-center border-r border-slate-200 transition-colors ${hasDevoir2 ? 'text-emerald-800 bg-emerald-50' : 'text-slate-400 bg-slate-50/50'}`}>
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <span>Devoir 2 / 10</span>
                  <button 
                    type="button"
                    onClick={() => setHasDevoir2(!hasDevoir2)}
                    className={`relative flex items-center justify-center w-10 h-5 rounded-full transition-all ring-2 ring-offset-1 ${hasDevoir2 ? 'bg-emerald-500 ring-emerald-500/40 shadow-sm' : 'bg-slate-300 ring-transparent'}`}
                  >
                    <span className={`absolute left-0.5 w-4 h-4 rounded-full bg-white transition-transform drop-shadow-sm ${hasDevoir2 ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </th>
              <th className="px-2 py-3 text-sm leading-tight whitespace-normal font-extrabold text-indigo-700 text-center border-r border-slate-200 bg-indigo-50/50">
                Moy. Continue
              </th>
              <th className="px-2 py-3 text-sm leading-tight whitespace-normal font-extrabold text-slate-700 text-center border-r border-slate-200">
                Composition / 10
              </th>
              <th className="px-2 py-3 text-sm leading-tight whitespace-normal font-extrabold text-indigo-700 text-center bg-indigo-50/50">
                Moy. Trimestre
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => {
              const contAvg = calculateContinuousAvg(student)
              const genAvg = calculateGeneralAvg(student)
              
              return (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-3 py-3 border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors z-10 shadow-[1px_0_0_0_#e2e8f0]">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${student.avatarColor}`}>
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800 truncate">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 border-r border-slate-200 text-center">
                    <input 
                      type="number" 
                      min="0" max="10" step="0.25"
                      value={student.evalContinue}
                      onChange={(e) => handleMarkChange(student.id, 'evalContinue', e.target.value)}
                      className="w-full max-w-[4rem] mx-auto text-center border border-slate-200 rounded-md py-1.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700"
                    />
                  </td>
                  <td className="px-2 py-3 border-r border-slate-200 text-center">
                    <input 
                      type="number" 
                      min="0" max="10" step="0.25"
                      value={student.devoir1}
                      onChange={(e) => handleMarkChange(student.id, 'devoir1', e.target.value)}
                      className="w-full max-w-[4rem] mx-auto text-center border border-slate-200 rounded-md py-1.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700"
                    />
                  </td>
                  <td className={`px-2 py-3 border-r border-slate-200 text-center ${!hasDevoir2 ? 'bg-slate-50/50' : ''}`}>
                    <input 
                      type="number" 
                      min="0" max="10" step="0.25"
                      disabled={!hasDevoir2}
                      value={student.devoir2}
                      onChange={(e) => handleMarkChange(student.id, 'devoir2', e.target.value)}
                      className="w-full max-w-[4rem] mx-auto text-center border border-slate-200 rounded-md py-1.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-2 py-3 border-r border-slate-200 text-center bg-indigo-50/30">
                    <span className="font-bold text-indigo-700 text-base sm:text-lg">{formatNumber(contAvg)}</span>
                  </td>
                  <td className="px-2 py-3 border-r border-slate-200 text-center">
                    <input 
                      type="number" 
                      min="0" max="10" step="0.25"
                      value={student.composition}
                      onChange={(e) => handleMarkChange(student.id, 'composition', e.target.value)}
                      className="w-full max-w-[4rem] mx-auto text-center border border-slate-200 rounded-md py-1.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white outline-none transition-all font-medium text-slate-700"
                    />
                  </td>
                  <td className="px-2 py-3 text-center bg-indigo-50/30">
                    <span className="font-bold text-indigo-700 text-base sm:text-lg">{formatNumber(genAvg)}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Mobile View (Cards) */}
      <div className="block md:hidden space-y-4 mt-6">
        {students.map((student) => {
          const contAvg = calculateContinuousAvg(student)
          const genAvg = calculateGeneralAvg(student)
          
          return (
            <motion.div 
              key={`mobile-${student.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[1.5rem] shadow-sm p-4 sm:p-5 border border-slate-100"
            >
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4">
                <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${student.avatarColor}`}>
                  {student.name.charAt(0)}
                </div>
                <span className="font-bold text-slate-800 text-xl tracking-tight">{student.name}</span>
              </div>

              {/* Body (Inputs) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Éval. Continue / 10</label>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    value={student.evalContinue}
                    onChange={(e) => handleMarkChange(student.id, 'evalContinue', e.target.value)}
                    className="w-full text-center border-2 border-slate-100 rounded-xl py-2.5 focus:bg-indigo-50/30 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-slate-50 hover:bg-slate-100 transition-all font-black text-slate-700 text-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Devoir 1 / 10</label>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    value={student.devoir1}
                    onChange={(e) => handleMarkChange(student.id, 'devoir1', e.target.value)}
                    className="w-full text-center border-2 border-slate-100 rounded-xl py-2.5 focus:bg-indigo-50/30 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-slate-50 hover:bg-slate-100 transition-all font-black text-slate-700 text-lg"
                  />
                </div>
                <div className={`space-y-1.5 ${!hasDevoir2 ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Devoir 2 / 10</label>
                  </div>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    disabled={!hasDevoir2}
                    value={student.devoir2}
                    onChange={(e) => handleMarkChange(student.id, 'devoir2', e.target.value)}
                    className="w-full text-center border-2 border-slate-100 rounded-xl py-2.5 focus:bg-indigo-50/30 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-slate-50 hover:bg-slate-100 transition-all font-black text-slate-700 text-lg disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide text-indigo-600">Compo / 10</label>
                  <input 
                    type="number" 
                    min="0" max="10" step="0.25"
                    value={student.composition}
                    onChange={(e) => handleMarkChange(student.id, 'composition', e.target.value)}
                    className="w-full text-center border-2 border-indigo-100 rounded-xl py-2.5 focus:bg-indigo-50/30 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 transition-all font-black text-indigo-700 text-lg"
                  />
                </div>
              </div>

              {/* Footer (Averages) */}
              <div className="bg-slate-50 rounded-xl p-4 mt-5 flex justify-between items-center border border-slate-100">
                <div className="flex flex-col items-center flex-1">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Moy. Continue</span>
                  <span className="font-black text-slate-700 text-xl">{formatNumber(contAvg)}</span>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="flex flex-col items-center flex-1">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Moy. Trimestre</span>
                  <span className="font-black text-indigo-600 text-2xl drop-shadow-sm">{formatNumber(genAvg)}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Static Footer */}
      <div className="mt-8 mb-8 flex flex-col sm:flex-row justify-end gap-4">
        <button 
          onClick={handleDownloadExcel}
          className="flex items-center justify-center gap-3 bg-white text-emerald-600 border-2 border-emerald-100 px-6 py-4 rounded-full font-black text-lg shadow-sm hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50 transition-all active:scale-[0.98] w-full sm:w-auto"
        >
          <Download className="w-5 h-5" />
          Exporter Excel
        </button>
        <button className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-black text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all active:translate-y-0 w-full sm:w-auto">
          <Save className="w-5 h-5" />
          Enregistrer les notes
        </button>
      </div>
    </div>
  )
}
