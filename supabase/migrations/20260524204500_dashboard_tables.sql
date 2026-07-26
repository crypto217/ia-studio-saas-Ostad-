-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  deadline TEXT DEFAULT 'À définir',
  urgent BOOLEAN DEFAULT false,
  color TEXT DEFAULT 'sky',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own tasks.' AND tablename = 'tasks') THEN
        CREATE POLICY "Users can manage their own tasks." ON public.tasks FOR ALL USING (auth.uid() = teacher_id);
    END IF;
END
$$;

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  class_name TEXT,
  project_number TEXT DEFAULT '1',
  sequence_number TEXT DEFAULT '1',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own courses.' AND tablename = 'courses') THEN
        CREATE POLICY "Users can manage their own courses." ON public.courses FOR ALL USING (auth.uid() = teacher_id);
    END IF;
END
$$;

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT,
  day TEXT,
  time_slot TEXT,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own lessons.' AND tablename = 'lessons') THEN
        CREATE POLICY "Users can manage their own lessons." ON public.lessons FOR ALL USING (auth.uid() = teacher_id);
    END IF;
END
$$;

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own activities.' AND tablename = 'activities') THEN
        CREATE POLICY "Users can manage their own activities." ON public.activities FOR ALL USING (auth.uid() = teacher_id);
    END IF;
END
$$;
