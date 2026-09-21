import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import Link from '@tiptap/extension-link';
import BlogBubbleMenu from './BlogBubbleMenu';

export interface BlogDocumentEditorRef {
  getMarkdown: () => string;
}

interface BlogDocumentEditorProps {
  initialContent: string;
}

const BlogDocumentEditor = forwardRef<BlogDocumentEditorRef, BlogDocumentEditorProps>(
  ({ initialContent }, ref) => {
    const isHydratingRef = useRef(false);
    const hasHydratedRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'blog-tiptap-document',
      },
      handleKeyDown: (_view, event) => {
        // Prevent global search hijacking Cmd/Ctrl + K
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
          event.stopPropagation();
          // Let tiptap's default keymap handle the toggleLink (if selected)
        }
        return false;
      }
    },
  });

  useImperativeHandle(ref, () => ({
    getMarkdown: () => {
      return editor ? editor.getMarkdown() : '';
    }
  }));

  // Explicit Hydration Lifecycle
  useEffect(() => {
    if (editor && initialContent !== undefined && !hasHydratedRef.current) {
      isHydratingRef.current = true;
      editor.commands.setContent(initialContent, {
        emitUpdate: false,
        contentType: 'markdown',
      });
      isHydratingRef.current = false;
      hasHydratedRef.current = true;
    }
  }, [editor, initialContent]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <BlogBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </>
  );
});

BlogDocumentEditor.displayName = 'BlogDocumentEditor';

export default BlogDocumentEditor;
