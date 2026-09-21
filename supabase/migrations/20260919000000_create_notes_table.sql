-- Migration: Create Notes Table
-- Description: Adds the secure Notes workspace table with RLS for the admin portfolio.

CREATE TABLE public.notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  title text,
  content text,
  color text DEFAULT 'slate',
  pinned boolean DEFAULT false,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notes
CREATE POLICY "Users can view own notes"
ON public.notes FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own notes
CREATE POLICY "Users can insert own notes"
ON public.notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own notes
CREATE POLICY "Users can update own notes"
ON public.notes FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own notes
CREATE POLICY "Users can delete own notes"
ON public.notes FOR DELETE
USING (auth.uid() = user_id);

-- Optional: Auto-update `updated_at` trigger (if the trigger function exists in the schema)
-- Note: Supabase projects often have a `moddatetime` extension or a shared trigger function.
-- If not, `updated_at` will be handled by the client application on save.

-- Indexes for performance
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);
