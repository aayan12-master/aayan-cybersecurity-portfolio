import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import CodeWindow from './CodeWindow';
import './blog-components.css';

interface ContentRendererProps {
  content: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content }) => {
  return (
    <div className="content-renderer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          pre(props) {
            const { children, ...rest } = props;
            if (React.isValidElement(children) && children.type === 'code') {
              const codeProps = children.props as any;
              const match = /language-(\w+)/.exec(codeProps.className || '');
              return (
                <CodeWindow
                  code={String(codeProps.children).replace(/\n$/, '')}
                  language={match ? match[1] : ''}
                />
              );
            }
            return <pre {...rest}>{children}</pre>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ContentRenderer;
