import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { ArrowLeft, Clock, Calendar, Share2, ChevronRight, ChevronDown, ChevronUp, Check } from 'lucide-react';
import ContentRenderer from '../../components/blog/ContentRenderer';
import { useData } from '../../contexts/DataContext';
import { Helmet } from 'react-helmet-async';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import Slugger from 'github-slugger';
import './blog-public.css';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string[];
  published_at: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}


const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isInitialized } = useData();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeTocId, setActiveTocId] = useState<string>('');
  const [isTocExpanded, setIsTocExpanded] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/blog/${slug}`;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        document.body.prepend(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopyStatus('success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyStatus('error');
    } finally {
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const fetchPostAndRelated = async () => {
    setLoading(true);
    const { data: postData, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .single();

    if (!error && postData) {
      setPost(postData as BlogPost);
      
      // Extract TOC using unified and remark-parse
      const tocItems: TocItem[] = [];
      const slugger = new Slugger();
      const processor = unified().use(remarkParse);
      
      try {
        const tree = processor.parse(postData.content || '');
        visit(tree, 'heading', (node: any) => {
          if (node.depth === 2 || node.depth === 3) {
            const text = toString(node);
            const id = slugger.slug(text);
            tocItems.push({ id, text, level: node.depth });
          }
        });
      } catch (err) {
        console.error('Error parsing TOC from markdown:', err);
      }
      
      setToc(tocItems);

      // Fetch related posts (same category, excluding current)
      if (postData.category) {
        const { data: relatedData } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, cover_image, category, tags, published_at')
          .eq('status', 'published')
          .eq('category', postData.category)
          .neq('id', postData.id)
          .lte('published_at', new Date().toISOString())
          .limit(3);
        
        if (relatedData) setRelatedPosts(relatedData as BlogPost[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (slug) {
      fetchPostAndRelated();
      if (!window.location.hash) {
        window.scrollTo(0, 0);
      }
    }
  }, [slug]);

  // Handle URL hash on load
  useEffect(() => {
    if (post && window.location.hash) {
      setTimeout(() => {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [post]);

  // Reading progress and active TOC intersection observer
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (toc.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveTocId(entry.target.id);
        }
      });
    }, { rootMargin: '-100px 0px -60% 0px' });

    toc.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [toc, post]);

  if (!isInitialized) {
    return (
      <div className="public-blog-container">
        <div style={{ textAlign: 'center', padding: '10rem 2rem', opacity: 0.5 }}>Loading...</div>
      </div>
    );
  }

  if (!data.sectionVisibility.blog) {
    return <Navigate to="/" replace />;
  }

  const calculateReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  if (loading) {
    return (
      <div className="public-blog-container">
        <div style={{ textAlign: 'center', padding: '10rem 2rem', opacity: 0.5 }}>Loading article...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="public-blog-container">
        <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
          <h2>Article Not Found</h2>
          <p style={{ opacity: 0.5, marginTop: '1rem' }}>The article you are looking for does not exist or has been removed.</p>
          <Link to="/blog" className="blog-read-more" style={{ marginTop: '2rem' }}>
            <ArrowLeft size={16} /> BACK TO BLOG
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-blog-container">
      {/* Reading Progress Bar */}
      <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }} />
      
      <Helmet>
        <title>{post.title} | Aayan Cybersecurity</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        {post.cover_image && <meta property="og:image" content={post.cover_image} />}
      </Helmet>

      <div className="post-editorial-layout">
        <div className="post-breadcrumbs">
          <Link to="/blog">BLOG</Link>
          <ChevronRight size={14} />
          <span style={{ textTransform: 'uppercase' }}>{post.category || 'ARTICLE'}</span>
        </div>

        <div className="post-editorial-grid">
          {/* Center: Article Content */}
          <main>
            <header className="post-header">
              <h1 className="post-title">{post.title}</h1>
              <p className="post-excerpt">{post.excerpt}</p>
              
              <div className="post-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} />
                  {new Date(post.published_at).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} />
                  {calculateReadingTime(post.content)} MIN READ
                </span>
                {post.tags && post.tags.length > 0 && (
                  <span style={{ color: 'var(--color-border)' }}>|</span>
                )}
                {post.tags?.map(tag => (
                  <span key={tag} style={{ color: 'var(--color-accent)' }}>#{tag}</span>
                ))}
              </div>
            </header>

            {post.cover_image && (
              <div 
                className="post-cover"
                style={{ backgroundImage: `url(${post.cover_image})` }}
              />
            )}

            <article>
              <ContentRenderer content={post.content || ''} />
            </article>

            {/* Subtle Share / Back */}
            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
              <Link to="/blog" className="blog-read-more">
                <ArrowLeft size={16} /> BACK TO BLOG
              </Link>
              <button 
                onClick={handleCopyLink}
                className="author-social-btn" 
                style={{ width: 'auto', padding: '0 1rem', borderRadius: '20px', gap: '0.5rem', fontSize: '0.85rem' }}
                aria-label="Copy article link"
              >
                {copyStatus === 'success' ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
                {copyStatus === 'success' ? 'Copied!' : copyStatus === 'error' ? 'Unable to copy' : 'Copy Link'}
              </button>
            </div>
            
            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div className="related-articles-section">
                <div className="blog-section-header">RELATED READING</div>
                <div className="blog-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                  {relatedPosts.map(rp => (
                    <Link to={`/blog/${rp.slug}`} className="article-card" key={rp.id}>
                      <div 
                        className="article-card-image" 
                        style={rp.cover_image ? { backgroundImage: `url(${rp.cover_image})` } : { aspectRatio: '16/9', display: 'none' }}
                      />
                      <div className="article-card-meta">
                        <span>{rp.category || 'ARTICLE'}</span>
                        <span>•</span>
                        <span>{new Date(rp.published_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="article-card-title" style={{ fontSize: '1.2rem' }}>{rp.title}</h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Right: TOC */}
          <aside className={`toc-rail ${isTocExpanded ? 'expanded' : ''}`}>
            {toc.length > 0 && (
              <>
                <div 
                  className="toc-rail-title" 
                  onClick={() => setIsTocExpanded(!isTocExpanded)}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>Contents</span>
                  <div className="toc-mobile-toggle">
                    {isTocExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                <ul className="toc-list">
                  {toc.map((item, idx) => (
                    <li key={idx} className={`depth-${item.level}`}>
                      <a 
                        href={`#${item.id}`}
                        className={activeTocId === item.id ? 'active' : ''}
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                            history.pushState(null, '', `#${item.id}`);
                          }
                          setActiveTocId(item.id);
                          setIsTocExpanded(false); // Close mobile menu after click
                        }}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
