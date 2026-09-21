import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: ReactNode;
}

interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const AdminSelect: React.FC<AdminSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...',
  className = '',
  style
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      const menuHeight = Math.min(options.length * 40 + 16, 300); // Approximate menu height
      
      const openUpwards = spaceBelow < menuHeight && spaceAbove > spaceBelow;

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        top: openUpwards ? 'auto' : rect.bottom + 4,
        bottom: openUpwards ? window.innerHeight - rect.top + 4 : 'auto',
        maxHeight: '300px',
        overflowY: 'auto',
        zIndex: 99999,
        background: 'var(--a-card)',
        border: '1px solid var(--a-border)',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        padding: '0.25rem'
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, options.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        // We also need to check if they clicked inside the portal
        const target = e.target as HTMLElement;
        if (!target.closest('.admin-select-dropdown')) {
          setIsOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const target = document.querySelector('.admin-app') || document.body;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`blog-meta-input ${className}`}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
          ...style 
        }}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        <span style={{ color: selectedOption ? 'inherit' : 'var(--a-text-sec)' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} style={{ color: 'var(--a-text-sec)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && createPortal(
        <div 
          className="admin-select-dropdown"
          style={dropdownStyle}
          onMouseDown={e => e.stopPropagation()}
        >
          {options.map(option => (
            <div
              key={option.value}
              style={{
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderRadius: '4px',
                background: value === option.value ? 'var(--a-input-bg)' : 'transparent',
                color: value === option.value ? 'var(--a-accent)' : 'var(--a-text)',
                fontSize: '0.9rem'
              }}
              onMouseEnter={e => {
                if (value !== option.value) {
                  (e.target as HTMLDivElement).style.background = 'var(--a-card-hover)';
                }
              }}
              onMouseLeave={e => {
                if (value !== option.value) {
                  (e.target as HTMLDivElement).style.background = 'transparent';
                }
              }}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
              {value === option.value && <Check size={14} />}
            </div>
          ))}
        </div>,
        target
      )}
    </>
  );
};

export default AdminSelect;
