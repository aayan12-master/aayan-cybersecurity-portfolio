import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { ArrowLeft, Save, Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import BlogDocumentEditor from './components/BlogDocumentEditor';
import type { BlogDocumentEditorRef } from './components/BlogDocumentEditor';
import AdminSelect from '../components/AdminSelect';
import './blog.css';

interface BlogPostFull {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft';
  featured: boolean;
  published_at: string | null;
}

const BlogEditor: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const editorRef = useRef<BlogDocumentEditorRef>(null);
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(() => {
    return localStorage.getItem('aayan_blog_settings_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('aayan_blog_settings_collapsed', isSettingsCollapsed.toString());
  }, [isSettingsCollapsed]);

  const fetchPost = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (data) setPost(data as BlogPostFull);
    setLoading(false);
  };

  useEffect(() => {
    if (postId) fetchPost();
  }, [postId]);



  const handleSave = async () => {
    if (!post) return;
    
    // Get the fresh content from the editor instance
    const currentContent = editorRef.current?.getMarkdown() || '';
    
    // Validation
    if (!post.title.trim()) {
      setSaveError("Title cannot be empty.");
      return;
    }
    if (!post.slug.trim()) {
      setSaveError("Slug cannot be empty.");
      return;
    }
    if (post.status === 'published' && (!currentContent || !currentContent.trim())) {
      setSaveError("Cannot publish an article with empty content.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    
    // Automatically set published_at if publishing for the first time
    const updatedPost = { ...post, content: currentContent };
    if (updatedPost.status === 'published' && !updatedPost.published_at) {
      updatedPost.published_at = new Date().toISOString();
    }
    
    // Check for duplicate slug
    const { data: existingSlug } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', updatedPost.slug)
      .neq('id', post.id)
      .single();
      
    if (existingSlug) {
      setSaveError("This slug is already in use by another article. Please change it.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('blog_posts')
      .update({
        title: updatedPost.title,
        slug: updatedPost.slug,
        excerpt: updatedPost.excerpt,
        content: updatedPost.content,
        cover_image: updatedPost.cover_image,
        category: updatedPost.category,
        tags: updatedPost.tags,
        status: updatedPost.status,
        featured: updatedPost.featured,
        published_at: updatedPost.published_at
      })
      .eq('id', post.id);

    if (error) {
      setSaveError('Error saving post: ' + error.message);
    } else {
      setPost(updatedPost);
    }
    setSaving(false);
  };

  if (loading) return <div className="blog-workspace"><div className="blog-empty-state">Loading...</div></div>;
  if (!post) return <div className="blog-workspace"><div className="blog-empty-state">Post not found.</div></div>;

  return (
    <div className="blog-editor-layout">
      <div className="blog-editor-header">
        <div className="blog-nav-left">
          <button className="blog-btn" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft size={16} /> Back
          </button>
          <span style={{ fontSize: '0.9rem', color: 'var(--a-text-sec)', fontWeight: 500 }}>
            {post.status === 'draft' ? 'Draft' : 'Published'}
          </span>
        </div>
        <div className="blog-nav-right">
          {post.status === 'published' && (
            <button className="blog-btn" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
              <Eye size={16} /> View Post
            </button>
          )}
          <button className="blog-btn primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            className="blog-btn" 
            onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
            title={isSettingsCollapsed ? "Expand Settings" : "Collapse Settings"}
            style={{ padding: '0.5rem' }}
          >
            {isSettingsCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      <div className="blog-editor-main">
        {saveError && (
          <div style={{ background: 'rgba(255,50,50,0.1)', color: '#ff4444', padding: '1rem', borderBottom: '1px solid rgba(255,50,50,0.2)', fontSize: '0.9rem' }}>
            {saveError}
          </div>
        )}
        <div className="blog-editor-content">
          <div style={{ maxWidth: '800px', margin: '0 auto', height: '100%' }}>
            <input 
              type="text"
              value={post.title}
              onChange={e => setPost({ ...post, title: e.target.value })}
              style={{
                width: '100%', background: 'transparent', border: 'none', 
                fontSize: '2.5rem', fontWeight: 700, color: 'var(--a-text)',
                marginBottom: '2rem', outline: 'none'
              }}
              placeholder="Post Title..."
            />
            
            <div style={{ height: 'calc(100% - 100px)' }}>
              <BlogDocumentEditor 
                ref={editorRef}
                initialContent={post.content || ''}
              />
            </div>
          </div>
        </div>

        <aside className={`blog-editor-sidebar ${isSettingsCollapsed ? 'collapsed' : ''}`}>
          <div className="blog-sidebar-inner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Post Settings</h3>
            </div>
            <div style={{ height: '1px', background: 'var(--a-border)', margin: '1rem 0 1.5rem' }}></div>
          
          <div className="blog-meta-group">
            <label>Status</label>
            <AdminSelect 
              value={post.status}
              onChange={value => setPost({ ...post, status: value as 'draft' | 'published' })}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' }
              ]}
            />
          </div>

          <div className="blog-meta-group">
            <label>Slug (URL)</label>
            <input 
              type="text" 
              className="blog-meta-input"
              value={post.slug}
              onChange={e => setPost({ ...post, slug: e.target.value })}
            />
          </div>

          <div className="blog-meta-group">
            <label>Category</label>
            <AdminSelect 
              value={post.category || ''}
              onChange={value => setPost({ ...post, category: value })}
              placeholder="Select category..."
              options={[
                { value: 'CTF', label: 'CTF / Writeups' },
                { value: 'RESEARCH', label: 'Research / POC' },
                { value: 'TECHNICAL', label: 'Technical Knowledge' },
                { value: 'LIFE', label: 'Field Notes (Life)' }
              ]}
            />
          </div>
          
          <div className="blog-meta-group">
            <label>Tags (comma separated)</label>
            <input 
              type="text" 
              className="blog-meta-input"
              value={post.tags?.join(', ') || ''}
              onChange={e => setPost({ ...post, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              placeholder="web-security, linux, research"
            />
          </div>

          <div className="blog-meta-group">
            <label>Cover Image URL</label>
            <input 
              type="text" 
              className="blog-meta-input"
              value={post.cover_image || ''}
              onChange={e => setPost({ ...post, cover_image: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="blog-meta-group">
            <label>Excerpt (Summary)</label>
            <textarea 
              className="blog-meta-input"
              value={post.excerpt || ''}
              onChange={e => setPost({ ...post, excerpt: e.target.value })}
              placeholder="A brief description of this post..."
            />
          </div>
          
          <div className="blog-meta-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input 
              type="checkbox" 
              id="featured"
              checked={post.featured}
              onChange={e => setPost({ ...post, featured: e.target.checked })}
            />
            <label htmlFor="featured" style={{ margin: 0, cursor: 'pointer' }}>Feature this post</label>
          </div>
          
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogEditor;
