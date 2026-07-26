import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentData } = body;

    if (!studentData) {
      return NextResponse.json({ error: "Missing studentData" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

    const systemInstruction = `Tu es un expert en pédagogie du primaire en Algérie. Analyse les critères en 'C' ou 'D' (non acquis ou peu acquis) de cet élève d'après son profil et génère une fiche d'exercices d'accompagnement ludique et ciblée pour la maison.
L'élève doit pouvoir s'entraîner spécifiquement sur ses difficultés.

Structure obligatoire de la fiche d'exercice :
- Un titre accrocheur et ludique
- Un court rappel de la règle ou de la consigne (de manière simplifiée et imagée)
- 2 ou 3 petits exercices progressifs et très clairs
- Une zone "Message d'encouragement" chaleureuse à l'attention de l'élève

Format de sortie : Rédige le document directement en Markdown simple et propre (sans blocs HTML complexes, sans CSS en ligne, sans en-têtes officiels de l'établissement).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `Voici les données de l'élève :\n${JSON.stringify(studentData, null, 2)}\nGénère la fiche d'exercices d'accompagnement pour la maison.` }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ homework: response.text });
  } catch (error) {
    console.error("AI homework generation error:", error);
    return NextResponse.json({ error: "Failed to generate homework" }, { status: 500 });
  }
}
