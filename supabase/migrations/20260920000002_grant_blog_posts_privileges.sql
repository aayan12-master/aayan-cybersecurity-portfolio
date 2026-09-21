-- Grant standard table privileges to authenticated users for blog_posts
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
