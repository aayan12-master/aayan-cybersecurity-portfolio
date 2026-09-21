import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { Search, ArrowRight, Calendar } from 'lucide-react';
import './blog-public.css';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  category: string;
  tags: string[];
  published_at: string;
  featured: boolean;
}

const CATEGORIES = ['ALL', 'CTF', 'RESEARCH', 'TECHNICAL', 'LIFE'];

const BlogIndex: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const fetchPosts = async () => {
    setLoading(true);

    // Parallelize blog visibility and post fetching so rendering isn't blocked by serial requests
    const [configRes, postsRes] = await Promise.all([
      supabase
        .from('portfolio_configs')
        .select('value')
        .eq('key', 'sectionVisibility')
        .single(),
      supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image, category, tags, published_at, featured')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
    ]);

    const configData = configRes.data;
    if (configData?.value && configData.value.blog === false) {
      window.location.href = '/';
      return;
    }

    const { data, error } = postsRes;
    if (!error && data) {
      setPosts(data as BlogPost[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);





  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = activeCategory === 'ALL' || post.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts.find(p => p.featured) || filteredPosts[0];
  const otherPosts = featuredPost ? filteredPosts.filter(p => p.id !== featuredPost.id) : filteredPosts;

  const renderArticleCard = (post: BlogPost) => (
    <Link to={`/blog/${post.slug}`} className="article-card" key={post.id}>
      <div 
        className="article-card-image" 
        style={post.cover_image ? { backgroundImage: `url(${post.cover_image})` } : {}}
      />
      <div className="article-card-meta">
        <span>{post.category || 'ARTICLE'}</span>
        <span>•</span>
        <span>{new Date(post.published_at).toLocaleDateString()}</span>
      </div>
      <h3 className="article-card-title">{post.title}</h3>
      <p className="article-card-excerpt">{post.excerpt}</p>
    </Link>
  );

  return (
    <div className="public-blog-container">
      <div className="public-blog-header">
        <div className="public-blog-title">BLOG</div>
        <h1 className="public-blog-subtitle">
          SECURITY / RESEARCH / TECHNICAL NOTES
        </h1>
        <p className="public-blog-desc">
          A publication of experiments, writeups, vulnerabilities, and things worth understanding.
        </p>
      </div>

      <div className="public-blog-content">
        <div className="blog-search-container">
          <div className="blog-public-search">
            <Search size={20} color="var(--color-text-secondary)" />
            <input 
              type="text" 
              placeholder="Search articles, tags, or topics..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search articles"
            />
          </div>
          <div className="blog-categories">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`blog-category-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'LIFE' ? 'FIELD NOTES' : cat === 'RESEARCH' ? 'RESEARCH / POC' : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>Loading...</div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', opacity: 0.5 }}>
            <p>No articles found matching your criteria.</p>
          </div>
        ) : (
          <>
            {/* Featured Post (Only show if ALL category and no search query, or if it strictly matches) */}
            {featuredPost && (
              <div className="blog-featured">
                <div 
                  className="blog-featured-image"
                  style={featuredPost.cover_image ? { backgroundImage: `url(${featuredPost.cover_image})` } : {}}
                />
                <div className="blog-featured-content">
                  <div className="blog-featured-meta">
                    <span>{featuredPost.category || 'FEATURED'}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={12} />
                      {new Date(featuredPost.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="blog-featured-title">{featuredPost.title}</h2>
                  <p className="blog-featured-excerpt">{featuredPost.excerpt}</p>
                  <Link to={`/blog/${featuredPost.slug}`} className="blog-read-more">
                    READ ARTICLE <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}

            {/* Latest / Categorized Grid */}
            {otherPosts.length > 0 && (
              <div className="blog-section">
                <div className="blog-section-header">LATEST ARTICLES</div>
                <div className="blog-grid-3">
                  {otherPosts.map(post => renderArticleCard(post))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogIndex;
