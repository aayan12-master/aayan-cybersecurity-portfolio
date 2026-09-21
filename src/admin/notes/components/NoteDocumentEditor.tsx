import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';

import { useTextSelection } from '../hooks/useTextSelection';
import NoteSelectionToolbar from './NoteSelectionToolbar';
import NoteSlashMenu from './NoteSlashMenu';

interface NoteDocumentEditorProps {
  initialContent: string;
  onChange: (markdown: string) => void;
}

const NoteDocumentEditor: React.FC<NoteDocumentEditorProps> = ({ initialContent, onChange }) => {
  const [slashQuery, setSlashQuery] = useState<{ active: boolean; text: string; startPos: number }>({ 
    active: false, text: '', startPos: -1 
  });
  
  const isHydratingRef = useRef(false);
  const hasHydratedRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    // Initialize empty, we will hydrate manually
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-document',
      },
      handleKeyDown: (view, event) => {
        // Slash commands logic
        if (event.key === '/') {
          const { state } = view;
          const { $from } = state.selection;
          // Only trigger if at start of line or after space
          const before = $from.nodeBefore;
          if (!before || before.text?.endsWith(' ')) {
            setSlashQuery({ active: true, text: '', startPos: $from.pos });
          }
        } else if (slashQuery.active) {
          if (event.key === 'Escape') {
            setSlashQuery({ active: false, text: '', startPos: -1 });
            return true;
          } else if (event.key === 'Backspace') {
            const { state } = view;
            if (state.selection.$from.pos <= slashQuery.startPos) {
              setSlashQuery({ active: false, text: '', startPos: -1 });
            }
          } else if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
            // Prevent default so the slash menu can handle Arrow/Enter cleanly
            event.preventDefault();
            return true;
          } else {
            // Update slash query text
            setTimeout(() => {
              const { state } = view;
              const currentPos = state.selection.$from.pos;
              if (currentPos > slashQuery.startPos) {
                const text = state.doc.textBetween(slashQuery.startPos, currentPos, ' ');
                setSlashQuery(prev => ({ ...prev, text }));
              } else {
                setSlashQuery({ active: false, text: '', startPos: -1 });
              }
            }, 10);
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      // Guard against autosaving during hydration
      if (isHydratingRef.current) return;
      
      // Serialize back to Markdown
      const markdown = editor.getMarkdown();
      onChange(markdown);
    },
  });

  // Explicit Hydration Lifecycle
  useEffect(() => {
    if (editor && initialContent !== undefined && !hasHydratedRef.current) {
      console.log(`[NOTE DEBUG] HYDRATION: Starting hydration. Content length: ${initialContent.length}`);
      
      isHydratingRef.current = true;
      
      editor.commands.setContent(initialContent, {
        emitUpdate: false,
        contentType: 'markdown',
      });
      
      isHydratingRef.current = false;
      hasHydratedRef.current = true;
      console.log(`[NOTE DEBUG] HYDRATION: Completed.`);
    }
  }, [editor, initialContent]);

  const { selection, hideSelection } = useTextSelection(editor);

  const getSmartSelectionRange = (editor: any) => {
    const { state } = editor;
    const { $from, $to, empty } = state.selection;

    // Do not expand if selection is empty (caret) or spans multiple blocks
    if (empty || $from.parent !== $to.parent) {
      return { from: $from.pos, to: $to.pos };
    }

    const text = $from.parent.textContent;
    const startIndex = $from.parentOffset;
    const endIndex = $to.parentOffset;

    const isWordChar = (char: string) => /[\p{L}\p{N}_]/u.test(char);

    let expandedStart = startIndex;
    // Only expand left if the first selected character is a word character
    if (expandedStart < text.length && isWordChar(text[expandedStart])) {
      while (expandedStart > 0 && isWordChar(text[expandedStart - 1])) {
        expandedStart--;
      }
    }

    let expandedEnd = endIndex;
    // Only expand right if the last selected character is a word character
    if (expandedEnd > 0 && isWordChar(text[expandedEnd - 1])) {
      while (expandedEnd < text.length && isWordChar(text[expandedEnd])) {
        expandedEnd++;
      }
    }

    return {
      from: $from.start() + expandedStart,
      to: $from.start() + expandedEnd,
    };
  };

  const handleFormat = (type: string, payload?: string) => {
    if (!editor) return;
    let chain = editor.chain().focus();
    
    // Smart word expansion for inline marks
    const inlineMarks = ['bold', 'italic', 'strike', 'code', 'link'];
    if (inlineMarks.includes(type)) {
      const { from, to } = getSmartSelectionRange(editor);
      chain = chain.setTextSelection({ from, to });
    }
    
    switch (type) {
      case 'text': chain.setParagraph().run(); break;
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
      case 'bullet': chain.toggleBulletList().run(); break;
      case 'number': chain.toggleOrderedList().run(); break;
      case 'todo': chain.toggleTaskList().run(); break;
      case 'codeblock': chain.toggleCodeBlock().run(); break;
    }
    // We let Tiptap handle its own selection, but hide the React selection state if we want
    // Actually, formatting usually preserves selection in Tiptap, so it's fine.
  };

  const handleClearFormat = () => {
    if (!editor) return;
    const { from, to } = getSmartSelectionRange(editor);
    editor.chain().focus().setTextSelection({ from, to }).unsetAllMarks().clearNodes().run();
    hideSelection();
  };

  const handleCopyText = () => {
    if (!editor) return;
    const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');
    navigator.clipboard.writeText(text);
    hideSelection();
  };

  const handleSlashSelect = (commandId: string) => {
    if (!editor) return;
    
    // Delete the slash query text
    editor.chain().focus().deleteRange({ from: slashQuery.startPos - 1, to: editor.state.selection.from }).run();
    
    setSlashQuery({ active: false, text: '', startPos: -1 });

    // Apply the format
    handleFormat(commandId);
  };

  // If editor isn't ready, don't render content
  if (!editor) {
    return null;
  }

  return (
    <>
      {selection.isActive && selection.pos && (
        <NoteSelectionToolbar 
          pos={selection.pos}
          onFormat={handleFormat}
          onClearFormat={handleClearFormat}
          onCopyText={handleCopyText}
          isLinkActive={editor.isActive('link')}
          currentUrl={editor.isActive('link') ? editor.getAttributes('link').href : ''}
        />
      )}

      {slashQuery.active && selection.pos && (
        <NoteSlashMenu 
          pos={selection.pos}
          query={slashQuery.text}
          onSelect={handleSlashSelect}
          onClose={() => setSlashQuery({ active: false, text: '', startPos: -1 })}
        />
      )}

      <EditorContent editor={editor} />
    </>
  );
};

export default NoteDocumentEditor;
