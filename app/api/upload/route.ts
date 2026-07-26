import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;
    const fileType = formData.get('fileType') as string;
    const teacherId = formData.get('teacherId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration Supabase manquante sur le serveur.' }, { status: 500 });
    }

    // Initialize Supabase Client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const bucketName = 'teacher-files';
    const filePath = `${teacherId}/${Date.now()}_${file.name}`;

    // Convert file to ArrayBuffer/Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        duplex: 'half'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // Insert to teacher_files table
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FICHIER';
    const encodedName = `${folder}:::${fileType}:::${file.name}`;

    const { data: insertData, error: insertError } = await supabase
      .from('teacher_files')
      .insert([{
        name: encodedName,
        url: publicUrl,
        size: file.size,
        type: ext,
        teacher_id: teacherId
      }])
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: insertData?.[0] });
  } catch (error: any) {
    console.error('API Upload Handler error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur.' }, { status: 500 });
  }
}
