export function OfficialPrintHeader({ studentName, className, schoolYear }: { studentName: string; className: string; schoolYear: string }) {
  return (
    <div className="mb-8 font-serif text-black space-y-6">
      <div className="text-center space-y-1">
        <p className="font-bold text-lg">RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE</p>
        <p className="text-sm">MINISTÈRE DE L&apos;ÉDUCATION NATIONALE</p>
      </div>
      
      <div className="flex justify-between text-sm">
        <div className="space-y-1">
          <p>Wilaya : Alger</p>
          <p>École : [À configurer]</p>
        </div>
        <div className="space-y-1 text-right">
          <p>Année scolaire : {schoolYear}</p>
          <p>Classe : {className}</p>
        </div>
      </div>

      <div className="text-center pt-6 pb-4 border-b border-black/20">
        <h1 className="text-2xl font-bold">BILAN PÉDAGOGIQUE ET ÉVALUATION DES COMPÉTENCES</h1>
        <p className="text-lg mt-2 font-medium">{studentName}</p>
      </div>
    </div>
  );
}
