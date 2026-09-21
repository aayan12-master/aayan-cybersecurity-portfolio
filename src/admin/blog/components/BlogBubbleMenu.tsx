import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { 
  Bold, Italic, Strikethrough, Code, Link as LinkIcon, 
  MoreHorizontal, Type, Heading1, Heading2, Heading3, 
  Quote, Eraser, Copy 
} from 'lucide-react';
import NoteLinkPopover from '../../notes/components/NoteLinkPopover';
import FloatingDropdown from './FloatingDropdown';

interface BlogBubbleMenuProps {
  editor: Editor;
}

const FORMAT_TYPES = [
  { id: 'paragraph', label: 'Paragraph', icon: <Type size={14} /> },
  { id: 'h1', label: 'Heading 1', icon: <Heading1 size={14} /> },
  { id: 'h2', label: 'Heading 2', icon: <Heading2 size={14} /> },
  { id: 'h3', label: 'Heading 3', icon: <Heading3 size={14} /> },
  { id: 'quote', label: 'Quote', icon: <Quote size={14} /> },
  { id: 'codeblock', label: 'Code Block', icon: <Code size={14} /> }
];

const BlogBubbleMenu: React.FC<BlogBubbleMenuProps> = ({ editor }) => {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLink, setShowLink] = useState(false);
  
  const textBtnRef = useRef<HTMLButtonElement>(null);
  const linkBtnRef = useRef<HTMLButtonElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowTypeMenu(false);
        setShowMoreMenu(false);
        if (showLink) setShowLink(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLink]);

  const handleFormat = (type: string, payload?: string) => {
    const chain = editor.chain().focus();
    
    switch (type) {
      case 'paragraph': chain.setParagraph().run(); break;
      case 'bold': chain.toggleBold().run(); break;
      case 'italic': chain.toggleItalic().run(); break;
      case 'strike': chain.toggleStrike().run(); break;
      case 'code': chain.toggleCode().run(); break;
      case 'link': 
        if (payload) {
          chain.extendMarkRange('link').setLink({ href: payload }).run();
        } else {
          chain.unsetLink().run();
        }
        break;
      case 'h1': chain.toggleHeading({ level: 1 }).run(); break;
      case 'h2': chain.toggleHeading({ level: 2 }).run(); break;
      case 'h3': chain.toggleHeading({ level: 3 }).run(); break;
      case 'quote': chain.toggleBlockquote().run(); break;
      case 'codeblock': chain.toggleCodeBlock().run(); break;
      case 'clear': chain.unsetAllMarks().clearNodes().run(); break;
      case 'copy': {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');
        navigator.clipboard.writeText(text);
        break;
      }
    }
  };

  const getActiveTypeLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('blockquote')) return 'Quote';
    if (editor.isActive('codeBlock')) return 'Code Block';
    return 'Text';
  };

  const isLinkActive = editor.isActive('link');
  const currentUrl = isLinkActive ? editor.getAttributes('link').href : '';

  return (
    <BubbleMenu 
      editor={editor} 
      {...({ tippyOptions: { placement: 'top', offset: [0, 16], appendTo: () => document.querySelector('.admin-app') || document.body } } as any)}
      className="blog-bubble-menu-wrapper"
    >
      <div className="blog-bubble-toolbar" ref={containerRef}>
        
        {/* Type Dropdown */}
        <div className="blog-toolbar-dropdown-container">
          <button 
            ref={textBtnRef}
            className={`blog-toolbar-btn text-type-btn ${showTypeMenu ? 'active' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTypeMenu(!showTypeMenu);
              setShowMoreMenu(false);
              setShowLink(false);
            }}
          >
            {getActiveTypeLabel()} <span className="dropdown-arrow">▼</span>
          </button>

          {showTypeMenu && (
            <FloatingDropdown anchorRef={textBtnRef} align="left">
              <div className="blog-toolbar-dropdown-menu" style={{ position: 'static' }}>
                {FORMAT_TYPES.map(type => (
                  <button 
                    key={type.id}
                    className={`blog-toolbar-dropdown-item ${editor.isActive(type.id === 'paragraph' ? 'paragraph' : type.id.startsWith('h') ? 'heading' : type.id, type.id.startsWith('h') ? { level: parseInt(type.id[1]) } : {}) ? 'active' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleFormat(type.id);
                      setShowTypeMenu(false);
                    }}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </FloatingDropdown>
          )}
        </div>

        <div className="blog-toolbar-divider" />

        {/* Inline Formats */}
        <button 
          className={`blog-toolbar-icon-btn ${editor.isActive('bold') ? 'active' : ''}`} 
          aria-label="Bold" 
          onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }}
        >
          <Bold size={16} />
        </button>
        <button 
          className={`blog-toolbar-icon-btn ${editor.isActive('italic') ? 'active' : ''}`} 
          aria-label="Italic" 
          onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }}
        >
          <Italic size={16} />
        </button>
        <button 
          className={`blog-toolbar-icon-btn ${editor.isActive('strike') ? 'active' : ''}`} 
          aria-label="Strikethrough" 
          onMouseDown={(e) => { e.preventDefault(); handleFormat('strike'); }}
        >
          <Strikethrough size={16} />
        </button>
        <button 
          className={`blog-toolbar-icon-btn ${editor.isActive('code') ? 'active' : ''}`} 
          aria-label="Inline code" 
          onMouseDown={(e) => { e.preventDefault(); handleFormat('code'); }}
        >
          <Code size={16} />
        </button>
        
        {/* Link Popover Anchor */}
        <div className="blog-toolbar-dropdown-container">
          <button 
            ref={linkBtnRef}
            className={`blog-toolbar-icon-btn ${isLinkActive || showLink ? 'active' : ''}`} 
            aria-label="Insert link" 
            onMouseDown={(e) => { 
              e.preventDefault(); 
              setShowLink(!showLink);
              setShowTypeMenu(false);
              setShowMoreMenu(false);
            }}
          >
            <LinkIcon size={16} />
          </button>
          
          {showLink && (
            <FloatingDropdown anchorRef={linkBtnRef} align="center">
              <div className="blog-link-popover-wrapper" style={{ position: 'static' }}>
                <NoteLinkPopover 
                  initialUrl={currentUrl}
                  onApply={(url) => {
                    handleFormat('link', url);
                    setShowLink(false);
                  }}
                  onCancel={() => {
                    setShowLink(false);
                    editor.commands.focus();
                  }}
                  onRemove={() => {
                    handleFormat('link'); 
                    setShowLink(false);
                  }}
                />
              </div>
            </FloatingDropdown>
          )}
        </div>

        <div className="blog-toolbar-divider" />

        {/* More Menu */}
        <div className="blog-toolbar-dropdown-container">
          <button 
            ref={moreBtnRef}
            className={`blog-toolbar-icon-btn ${showMoreMenu ? 'active' : ''}`}
            aria-label="More formatting"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowMoreMenu(!showMoreMenu);
              setShowTypeMenu(false);
              setShowLink(false);
            }}
          >
            <MoreHorizontal size={16} />
          </button>

          {showMoreMenu && (
            <FloatingDropdown anchorRef={moreBtnRef} align="right">
              <div className="blog-toolbar-dropdown-menu" style={{ position: 'static' }}>
                <button 
                  className="blog-toolbar-dropdown-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFormat('clear');
                    setShowMoreMenu(false);
                  }}
                >
                  <Eraser size={14} /> Clear formatting
                </button>
                <button 
                  className="blog-toolbar-dropdown-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFormat('copy');
                    setShowMoreMenu(false);
                  }}
                >
                  <Copy size={14} /> Copy plain text
                </button>
              </div>
            </FloatingDropdown>
          )}
        </div>

      </div>
    </BubbleMenu>
  );
};

export default BlogBubbleMenu;
