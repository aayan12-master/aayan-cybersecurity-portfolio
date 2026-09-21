-- Add moddatetime extension if not exists
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Create trigger for notes table to automatically update updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime (updated_at);
