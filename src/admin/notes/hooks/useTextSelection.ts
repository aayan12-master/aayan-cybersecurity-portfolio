import { useState, useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/react';

export interface SelectionPos {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface SelectionState {
  isActive: boolean;
  text: string;
  pos: SelectionPos | null;
}

export const useTextSelection = (editor: Editor | null) => {
  const [selection, setSelection] = useState<SelectionState>({
    isActive: false,
    text: '',
    pos: null
  });

  const updateSelection = useCallback(() => {
    if (!editor || editor.isDestroyed) return;

    const { state, view } = editor;
    const { selection: editorSelection } = state;

    const { from, to, empty } = editorSelection;
    const text = state.doc.textBetween(from, to, ' ');

    const startCoords = view.coordsAtPos(from);
    const endCoords = empty ? startCoords : view.coordsAtPos(to);
    
    const top = startCoords.top;
    const left = (startCoords.left + endCoords.left) / 2;
    const width = empty ? 0 : Math.abs(endCoords.left - startCoords.left);
    const height = startCoords.bottom - startCoords.top;

    const isActive = !empty && text.trim().length > 0;

    setSelection({
      isActive,
      text,
      pos: { top, left, width, height }
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    editor.on('selectionUpdate', updateSelection);
    
    // Also update on scroll for positioning
    const handleScroll = () => updateSelection();
    window.addEventListener('scroll', handleScroll, true);

    const handleGlobalMouseDown = (e: MouseEvent) => {
      const isEditorClick = editor.view.dom.contains(e.target as Node);
      const isToolbarClick = (e.target as Element).closest?.('.note-selection-toolbar');
      
      if (!isEditorClick && !isToolbarClick) {
        setSelection(prev => prev.isActive ? { ...prev, isActive: false } : prev);
      }
    };
    document.addEventListener('mousedown', handleGlobalMouseDown);

    return () => {
      editor.off('selectionUpdate', updateSelection);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleGlobalMouseDown);
    };
  }, [editor, updateSelection]);

  const hideSelection = useCallback(() => {
    setSelection(prev => ({ ...prev, isActive: false }));
  }, []);

  return { selection, updateSelection, hideSelection };
};
