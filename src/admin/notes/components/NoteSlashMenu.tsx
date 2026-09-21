import React, { useEffect, useRef } from 'react';
import { 
  Type, Heading1, Heading2, Heading3, 
  Quote, List, ListOrdered, CheckSquare, Code, Minus
} from 'lucide-react';
import type { SelectionPos } from '../hooks/useTextSelection';

interface NoteSlashMenuProps {
  pos: SelectionPos;
  query: string;
  onSelect: (commandId: string) => void;
  onClose: () => void;
}

export const SLASH_COMMANDS = [
  { id: 'text', label: 'Text', description: 'Just start writing with plain text.', icon: <Type size={16} /> },
  { id: 'h1', label: 'Heading 1', description: 'Big section heading.', icon: <Heading1 size={16} /> },
  { id: 'h2', label: 'Heading 2', description: 'Medium section heading.', icon: <Heading2 size={16} /> },
  { id: 'h3', label: 'Heading 3', description: 'Small section heading.', icon: <Heading3 size={16} /> },
  { id: 'bullet', label: 'Bullet list', description: 'Create a simple bulleted list.', icon: <List size={16} /> },
  { id: 'number', label: 'Numbered list', description: 'Create a list with numbering.', icon: <ListOrdered size={16} /> },
  { id: 'todo', label: 'To-do list', description: 'Track tasks with a to-do list.', icon: <CheckSquare size={16} /> },
  { id: 'quote', label: 'Quote', description: 'Capture a quote.', icon: <Quote size={16} /> },
  { id: 'codeblock', label: 'Code block', description: 'Write or paste code snippets.', icon: <Code size={16} /> },
  { id: 'divider', label: 'Divider', description: 'Visually divide blocks.', icon: <Minus size={16} /> }
];

const NoteSlashMenu: React.FC<NoteSlashMenuProps> = ({ pos, query, onSelect, onClose }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const [actualPos, setActualPos] = React.useState({ top: -9999, left: -9999 });

  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Position calculation
  useEffect(() => {
    if (!menuRef.current || !pos) return;
    
    const rect = menuRef.current.getBoundingClientRect();
    const MENU_HEIGHT = rect.height;
    
    // Default position: below caret
    let top = pos.top + pos.height + 4;
    let left = pos.left;

    // Viewport clamping
    if (top + MENU_HEIGHT > window.innerHeight - 20) {
      top = pos.top - MENU_HEIGHT - 4; // flip above
    }

    if (left + 250 > window.innerWidth - 20) {
      left = window.innerWidth - 270;
    }

    setActualPos({ top, left });
  }, [pos, filteredCommands.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          onSelect(filteredCommands[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  if (filteredCommands.length === 0) return null;

  return (
    <div 
      ref={menuRef}
      className="note-slash-menu"
      style={{
        top: actualPos.top,
        left: actualPos.left,
        visibility: actualPos.top !== -9999 ? 'visible' : 'hidden'
      }}
    >
      <div className="slash-menu-header">Basic blocks</div>
      <div className="slash-menu-list">
        {filteredCommands.map((cmd, index) => (
          <button
            key={cmd.id}
            className={`slash-menu-item ${index === selectedIndex ? 'selected' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(cmd.id);
            }}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="slash-menu-icon">{cmd.icon}</div>
            <div className="slash-menu-content">
              <div className="slash-menu-title">{cmd.label}</div>
              <div className="slash-menu-desc">{cmd.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NoteSlashMenu;
