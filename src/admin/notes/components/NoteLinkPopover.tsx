import React, { useState, useEffect, useRef } from 'react';

interface NoteLinkPopoverProps {
  initialUrl?: string;
  onApply: (url: string) => void;
  onCancel: () => void;
  onRemove?: () => void;
}

const NoteLinkPopover: React.FC<NoteLinkPopoverProps> = ({ initialUrl = '', onApply, onCancel, onRemove }) => {
  const [url, setUrl] = useState(initialUrl || 'https://');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
      // Select the "https://" so it's easy to overwrite
      inputRef.current.setSelectionRange(0, 8);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = url.trim();
      if (trimmed && trimmed !== 'https://') {
        const finalUrl = (!trimmed.startsWith('http') && !trimmed.startsWith('mailto:')) 
          ? `https://${trimmed}` 
          : trimmed;
        onApply(finalUrl);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="note-link-popover" onClick={(e) => e.stopPropagation()}>
      <div className="link-popover-input-group">
        <input 
          ref={inputRef}
          type="url" 
          className="link-popover-input" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste or type URL..."
        />
      </div>
      <div className="link-popover-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', width: '100%' }}>
        {initialUrl && onRemove ? (
          <button className="btn-admin-secondary btn-small" onClick={(e) => { e.preventDefault(); onRemove(); }} style={{ color: 'var(--a-danger)', borderColor: 'var(--a-danger)' }}>Remove</button>
        ) : (
          <div /> // Spacer
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-admin-secondary btn-small" onClick={(e) => { e.preventDefault(); onCancel(); }}>Cancel</button>
          <button 
            className="btn-admin-primary btn-small" 
            onClick={(e) => { 
              e.preventDefault(); 
              const trimmed = url.trim();
              if (trimmed && trimmed !== 'https://') {
                const finalUrl = (!trimmed.startsWith('http') && !trimmed.startsWith('mailto:')) 
                  ? `https://${trimmed}` 
                  : trimmed;
                onApply(finalUrl);
              } 
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteLinkPopover;
