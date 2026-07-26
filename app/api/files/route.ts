import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET: fetch files for a teacher
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ error: 'Identifiant enseignant manquant.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('teacher_files')
      .select('*')
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('Error fetching files:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ files: data });
  } catch (error: any) {
    console.error('API GET files error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
}

// POST: register a file in database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, size, type, teacherId, documentType, niveau, trimestre } = body;

    if (!name || !url || !teacherId) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try inserting into separate columns first
    let result = await supabase
      .from('teacher_files')
      .insert([{
        name,
        url,
        size: Number(size) || 0,
        type,
        teacher_id: teacherId,
        document_type: documentType,
        niveau,
        trimestre
      }])
      .select();

    // Fallback if metadata columns do not exist in database yet
    if (result.error && (result.error.message.includes('column') || result.error.code === '42703')) {
      console.log('Columns do not exist in the database yet. Falling back to colon-separated name schema.');
      const fallbackName = `${niveau || 'Toutes'}:::${documentType || 'Ressources complémentaires'}:::${trimestre || 'T1'}:::${name}`;
      result = await supabase
        .from('teacher_files')
        .insert([{
          name: fallbackName,
          url,
          size: Number(size) || 0,
          type,
          teacher_id: teacherId
        }])
        .select();
    }

    if (result.error) {
      console.error('Error registering file:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data?.[0] });
  } catch (error: any) {
    console.error('API POST files error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
}

// DELETE: delete a file from database
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const teacherId = searchParams.get('teacherId');

    if (!id || !teacherId) {
      return NextResponse.json({ error: 'Identifiants de suppression manquants.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration Supabase manquante.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('teacher_files')
      .delete()
      .eq('id', id)
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('Error deleting file row:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API DELETE files error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne.' }, { status: 500 });
  }
}
