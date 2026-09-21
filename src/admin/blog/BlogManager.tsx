import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { Plus, Search, Edit2, Trash2, ExternalLink } from 'lucide-react';
import './blog.css';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: 'published' | 'draft';
  published_at: string;
}

const BlogManager: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, category, status, published_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data as BlogPost[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);



  const handleCreateNew = async () => {
    setCreateError(null);
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        title: 'New Post',
        slug: 'new-post-' + Date.now(),
        status: 'draft'
      }])
      .select()
      .single();

    if (error) {
      setCreateError(JSON.stringify(error));
    } else if (data) {
      navigate(`/admin/blog/${data.id}`);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    setIsDeleting(false);
    
    if (error) {
      setDeleteError('Failed to delete: ' + error.message);
      return;
    }
    
    setPostToDelete(null);
    fetchPosts();
  };

  const filteredPosts = posts.filter(post => {
    if (filter !== 'all' && post.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return post.title.toLowerCase().includes(q) || 
             (post.category && post.category.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="blog-workspace">
      <div className="blog-top-nav">
        <div className="blog-nav-left">
          <h1 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--a-text)', margin: 0 }}>Blog Posts</h1>
          <div className="blog-search-bar">
            <Search size={16} style={{ color: 'var(--a-text-sec)' }} />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="blog-nav-right">
          <button className="blog-btn primary" onClick={handleCreateNew}>
            <Plus size={16} /> New Post
          </button>
        </div>
      </div>
      
      {createError && (
        <div style={{ background: 'rgba(255,50,50,0.1)', color: '#ff4444', padding: '1rem', borderBottom: '1px solid rgba(255,50,50,0.2)', fontSize: '0.9rem' }}>
          Failed to create post: {createError}
        </div>
      )}

      <div className="blog-content">
        <aside className="blog-sidebar">
          <div className="blog-filter-section">
            <h3>Status</h3>
            <div className="blog-filter-list">
              <div 
                className={`blog-filter-item ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Posts
              </div>
              <div 
                className={`blog-filter-item ${filter === 'published' ? 'active' : ''}`}
                onClick={() => setFilter('published')}
              >
                Published
              </div>
              <div 
                className={`blog-filter-item ${filter === 'draft' ? 'active' : ''}`}
                onClick={() => setFilter('draft')}
              >
                Drafts
              </div>
            </div>
          </div>
        </aside>

        <main className="blog-main">
          {loading ? (
            <div className="blog-empty-state">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="blog-empty-state">
              <div style={{ marginBottom: '1rem', opacity: 0.5 }}>
                <Search size={48} />
              </div>
              <h2>No posts found</h2>
              <p>Create a new post to get started.</p>
            </div>
          ) : (
            <div className="blog-grid">
              {filteredPosts.map(post => (
                <div key={post.id} className="blog-card" onClick={() => navigate(`/admin/blog/${post.id}`)}>
                  <div className="blog-card-header">
                    <span className={`blog-badge ${post.status}`}>
                      {post.status}
                    </span>
                    {post.category && (
                      <span className="blog-badge" style={{ background: 'var(--a-input-bg)', color: 'var(--a-text)' }}>
                        {post.category}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt || 'No excerpt provided.'}</p>
                  
                  <div className="blog-card-footer">
                    <span>
                      {post.published_at 
                        ? new Date(post.published_at).toLocaleDateString() 
                        : 'Not published'}
                    </span>
                    <div className="blog-card-actions">
                      <button className="blog-action-btn" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      {post.status === 'published' && (
                        <button 
                          className="blog-action-btn" 
                          title="View on site"
                          onClick={(e) => { e.stopPropagation(); window.open(`/blog/${post.slug}`, '_blank'); }}
                        >
                          <ExternalLink size={14} />
                        </button>
                      )}
                      <button 
                        className="blog-action-btn danger" 
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); setPostToDelete(post.id); }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {postToDelete && createPortal(
        <div className="admin-modal-overlay" onClick={() => !isDeleting && setPostToDelete(null)}>
          <div 
            className="admin-modal" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="delete-modal-title"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '420px', padding: '1.5rem' }}
          >
            <div className="modal-header" style={{ marginBottom: '1rem' }}>
              <h2 id="delete-modal-title" style={{ color: 'var(--a-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={18} style={{ color: 'var(--a-danger)' }} /> 
                Delete Article
              </h2>
            </div>
            
            <p style={{ color: 'var(--a-text-sec)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            
            {deleteError && (
              <div style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--a-danger)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid rgba(248,113,113,0.2)' }}>
                {deleteError}
              </div>
            )}
            
            <div className="modal-footer" style={{ marginTop: '0', paddingTop: '0', border: 'none' }}>
              <button 
                className="btn-admin-secondary" 
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn-admin-danger" 
                onClick={() => handleDelete(postToDelete)}
                disabled={isDeleting}
                style={{ minWidth: '90px', justifyContent: 'center' }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.querySelector('.admin-app') || document.body
      )}
    </div>
  );
};

export default BlogManager;
