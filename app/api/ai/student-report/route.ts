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

    const systemInstruction = `Tu es un Inspecteur de l'Éducation Nationale en Algérie et un psychopédagogue expert. Rédige un bilan officiel basé STRICTEMENT sur ces données de compétences (A=Très satisfaisant, B=Satisfaisant, C=Peu satisfaisant, D=Non satisfaisant) :
${JSON.stringify(studentData, null, 2)}

Structure OBLIGATOIRE (en Markdown) :
## 📊 Synthèse Globale
## 🎯 Bilan par Compétences (Analyse l'oral, la lecture et l'écrit selon les lettres obtenues)
## 🚦 Comportement & Assiduité
## 💡 Plan d'Action Personnalisé (3 conseils concrets)

Ton bienveillant, clinique et professionnel.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: "Rédige le bilan pour cet élève d'après les données fournies et la structure demandée." }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ report: response.text });
  } catch (error) {
    console.error("AI report generation error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
