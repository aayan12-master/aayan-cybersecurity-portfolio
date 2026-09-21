import React, { useLayoutEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface FloatingDropdownProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
}

const FloatingDropdown: React.FC<FloatingDropdownProps> = ({ anchorRef, children, align = 'left' }) => {
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!anchorRef.current || !menuRef.current) return;

    const updatePosition = () => {
      if (!anchorRef.current || !menuRef.current) return;
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;
      
      const openUpwards = spaceBelow < menuRect.height + 10 && spaceAbove > spaceBelow;

      let top, bottom;
      if (openUpwards) {
        bottom = window.innerHeight - anchorRect.top + 4;
      } else {
        top = anchorRect.bottom + 4;
      }

      let left;
      if (align === 'right') {
        left = anchorRect.right - menuRect.width;
      } else if (align === 'center') {
        left = anchorRect.left + (anchorRect.width / 2) - (menuRect.width / 2);
      } else {
        left = anchorRect.left;
      }

      // Constrain left to viewport
      if (left < 10) left = 10;
      if (left + menuRect.width > window.innerWidth - 10) {
        left = window.innerWidth - menuRect.width - 10;
      }

      setStyle({
        position: 'fixed',
        top: top !== undefined ? `${top}px` : 'auto',
        bottom: bottom !== undefined ? `${bottom}px` : 'auto',
        left: `${left}px`,
        zIndex: 9999,
        opacity: 1
      });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [align]);

  const target = document.querySelector('.admin-app') || document.body;

  return createPortal(
    <div 
      ref={menuRef} 
      style={{ ...style, position: 'fixed' }} 
      onMouseDown={(e) => {
        // Stop clicks from blurring the editor if they land on padding/background of the menu,
        // but DO allow focus if clicking on an actual input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault(); 
        }
        e.stopPropagation();
      }}
    >
      {children}
    </div>,
    target
  );
};

export default FloatingDropdown;
