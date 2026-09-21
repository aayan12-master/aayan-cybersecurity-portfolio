import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import './blog-components.css';

interface CodeWindowProps {
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  python: 'Python',
  sh: 'Bash',
  shell: 'Bash',
  bash: 'Bash',
  zsh: 'Zsh',
  yml: 'YAML',
  yaml: 'YAML',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  sql: 'SQL'
};

const guessLanguageDisplay = (code: string, explicitLang: string) => {
  if (explicitLang && LANGUAGE_MAP[explicitLang.toLowerCase()]) {
    return LANGUAGE_MAP[explicitLang.toLowerCase()];
  }
  if (explicitLang) {
    return explicitLang.toUpperCase();
  }
  
  const sample = code.trim().substring(0, 50);
  if (sample.startsWith('SELECT ') || sample.startsWith('select ')) return 'SQL';
  if (sample.startsWith('#!/bin/bash') || sample.startsWith('#!/bin/sh')) return 'Bash';
  if (sample.includes('import ') && sample.includes('from ')) return 'JavaScript';
  if (sample.startsWith('import ') || sample.startsWith('def ')) return 'Python';
  if (sample.includes('const ') || sample.includes('let ')) return 'JavaScript';

  return 'CODE';
};

const CodeWindow: React.FC<CodeWindowProps> = ({ 
  code, 
  language, 
  filename,
  showLineNumbers = false 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = guessLanguageDisplay(code, language);

  return (
    <div className="code-window">
      <div className="code-window-header">
        <div className="code-window-left">
          <div className="code-window-dots">
            <span className="dot dot-close" />
            <span className="dot dot-minimize" />
            <span className="dot dot-maximize" />
          </div>
          {filename ? (
            <span className="code-window-filename">{filename}</span>
          ) : null}
        </div>
        <div className="code-window-right">
          {!filename && <span className="code-window-language">{displayLang}</span>}
          <button 
            className="code-window-copy-btn" 
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <div className="code-window-body">
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: 'transparent',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}
          codeTagProps={{
            style: { fontFamily: 'JetBrains Mono, Fira Code, monospace' }
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeWindow;
