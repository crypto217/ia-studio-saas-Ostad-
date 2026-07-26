-- Add metadata columns to teacher_files table
ALTER TABLE public.teacher_files 
  ADD COLUMN IF NOT EXISTS document_type TEXT,
  ADD COLUMN IF NOT EXISTS niveau TEXT,
  ADD COLUMN IF NOT EXISTS trimestre TEXT;
