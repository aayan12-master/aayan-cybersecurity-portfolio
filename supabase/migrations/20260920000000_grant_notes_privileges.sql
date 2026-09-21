-- Grant standard table privileges to authenticated and service_role users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO service_role;
