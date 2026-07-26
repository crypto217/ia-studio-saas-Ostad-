import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] ⚠️  Variables d\'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et/ou NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
    '  → Localement : vérifiez votre fichier .env.local\n' +
    '  → Sur Vercel  : ajoutez-les dans Project Settings > Environment Variables'
  );
}

let supabaseClient: SupabaseClient | null = null;

export const createBrowserClient = (): SupabaseClient => {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        '[Supabase] Impossible de créer le client : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY est absent.\n' +
        'Ajoutez ces variables dans .env.local (local) ou dans les Environment Variables Vercel (production).'
      );
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};
