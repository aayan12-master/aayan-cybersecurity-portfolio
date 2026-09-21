import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, Strikethrough, Code, Link as LinkIcon, 
  MoreHorizontal, Type, Heading1, Heading2, Heading3, 
  Quote, List, ListOrdered, CheckSquare, Copy, Eraser
} from 'lucide-react';
import type { SelectionPos } from '../hooks/useTextSelection';
import NoteLinkPopover from './NoteLinkPopover';

interface NoteSelectionToolbarProps {
  pos: SelectionPos;
  onFormat: (type: string, payload?: string) => void;
  onClearFormat: () => void;
  onCopyText: () => void;
  isLinkActive: boolean;
  currentUrl: string;
}

const FORMAT_TYPES = [
  { id: 'text', label: 'Text', icon: <Type size={14} /> },
  { id: 'h1', label: 'Heading 1', icon: <Heading1 size={14} /> },
  { id: 'h2', label: 'Heading 2', icon: <Heading2 size={14} /> },
  { id: 'h3', label: 'Heading 3', icon: <Heading3 size={14} /> },
  { id: 'quote', label: 'Quote', icon: <Quote size={14} /> },
  { id: 'bullet', label: 'Bulleted List', icon: <List size={14} /> },
  { id: 'number', label: 'Numbered List', icon: <ListOrdered size={14} /> },
  { id: 'todo', label: 'To-do List', icon: <CheckSquare size={14} /> },
  { id: 'codeblock', label: 'Code Block', icon: <Code size={14} /> }
];

const NoteSelectionToolbar: React.FC<NoteSelectionToolbarProps> = ({ 
  pos, onFormat, onClearFormat, onCopyText, isLinkActive, currentUrl 
}) => {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLink, setShowLink] = useState(false);
  
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [actualPos, setActualPos] = useState({ top: -9999, left: -9999 });
  const [opacity, setOpacity] = useState(0);

  // Position calculation
  useEffect(() => {
    if (!toolbarRef.current || !pos) return;
    
    const rect = toolbarRef.current.getBoundingClientRect();
    const TOOLBAR_HEIGHT = rect.height;
    const TOOLBAR_WIDTH = rect.width;
    
    // Default position: above selection
    let top = pos.top - TOOLBAR_HEIGHT - 8;
    let left = pos.left - (TOOLBAR_WIDTH / 2);

    // If not enough space above, flip below
    if (top < 60) { // arbitrary top boundary
      top = pos.top + pos.height + 8;
    }

    // Viewport clamping for horizontal
    const margin = 16;
    if (left < margin) {
      left = margin;
    } else if (left + TOOLBAR_WIDTH > window.innerWidth - margin) {
      left = window.innerWidth - TOOLBAR_WIDTH - margin;
    }

    setActualPos({ top, left });
    setOpacity(1); // fade in after positioning

  }, [pos]);

  // Click outside to close menus
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowTypeMenu(false);
        setShowMoreMenu(false);
        if (showLink) setShowLink(false); // Link popover has its own cancel, but fallback
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLink]);

  return (
    <div 
      ref={toolbarRef}
      className="note-selection-toolbar"
      style={{
        top: actualPos.top,
        left: actualPos.left,
        opacity: opacity,
        visibility: opacity ? 'visible' : 'hidden'
      }}
    >
      {/* Type Dropdown */}
      <div className="toolbar-dropdown-container">
        <button 
          className="toolbar-btn text-type-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowTypeMenu(!showTypeMenu);
            setShowMoreMenu(false);
          }}
          aria-label="Format text"
        >
          Text <span className="dropdown-arrow">▼</span>
        </button>

        {showTypeMenu && (
          <div className="toolbar-dropdown-menu">
            {FORMAT_TYPES.map(type => (
              <button 
                key={type.id}
                className="toolbar-dropdown-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onFormat(type.id);
                  setShowTypeMenu(false);
                }}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="toolbar-divider" />

      {/* Inline Formats */}
      <button className="toolbar-icon-btn" aria-label="Bold" onMouseDown={(e) => { e.preventDefault(); onFormat('bold'); }}>
        <Bold size={16} />
      </button>
      <button className="toolbar-icon-btn" aria-label="Italic" onMouseDown={(e) => { e.preventDefault(); onFormat('italic'); }}>
        <Italic size={16} />
      </button>
      <button className="toolbar-icon-btn" aria-label="Strikethrough" onMouseDown={(e) => { e.preventDefault(); onFormat('strike'); }}>
        <Strikethrough size={16} />
      </button>
      <button className="toolbar-icon-btn" aria-label="Inline code" onMouseDown={(e) => { e.preventDefault(); onFormat('code'); }}>
        <Code size={16} />
      </button>
      
      {/* Link Popover Anchor */}
      <div className="toolbar-dropdown-container">
        <button 
          className={`toolbar-icon-btn ${isLinkActive || showLink ? 'active' : ''}`} 
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
          <NoteLinkPopover 
            initialUrl={currentUrl}
            onApply={(url) => {
              onFormat('link', url);
              setShowLink(false);
            }}
            onCancel={() => setShowLink(false)}
            onRemove={() => {
              onFormat('link'); // calling without payload removes it in handleFormat
              setShowLink(false);
            }}
          />
        )}
      </div>

      <div className="toolbar-divider" />

      {/* More Menu */}
      <div className="toolbar-dropdown-container">
        <button 
          className="toolbar-icon-btn"
          aria-label="More formatting"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowMoreMenu(!showMoreMenu);
            setShowTypeMenu(false);
          }}
        >
          <MoreHorizontal size={16} />
        </button>

        {showMoreMenu && (
          <div className="toolbar-dropdown-menu right-aligned">
            <button 
              className="toolbar-dropdown-item"
              onMouseDown={(e) => {
                e.preventDefault();
                onClearFormat();
                setShowMoreMenu(false);
              }}
            >
              <Eraser size={14} /> Clear formatting
            </button>
            <button 
              className="toolbar-dropdown-item"
              onMouseDown={(e) => {
                e.preventDefault();
                onCopyText();
                setShowMoreMenu(false);
              }}
            >
              <Copy size={14} /> Copy plain text
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default NoteSelectionToolbar;
