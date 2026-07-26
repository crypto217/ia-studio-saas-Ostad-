import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, studentName, content } = body;
    
    if (!email || !content) {
      return NextResponse.json({ error: "Email et contenu requis" }, { status: 400 });
    }

    console.log(`[Email Service] Envoi de l'exercice pour ${studentName} à ${email}`);
    
    // Simuler l'envoi d'email
    return NextResponse.json({ 
      success: true, 
      message: `L'exercice a été envoyé avec succès à l'adresse ${email}` 
    });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }
}
