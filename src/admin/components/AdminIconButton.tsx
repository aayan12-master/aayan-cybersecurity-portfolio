import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AdminIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string; // Used for aria-label and title
  size?: number;
  variant?: 'default' | 'header' | 'sidebar' | 'danger' | 'success';
  active?: boolean;
}

export const AdminIconButton: React.FC<AdminIconButtonProps> = ({
  icon: Icon,
  label,
  size = 18,
  variant = 'default',
  active = false,
  className = '',
  style,
  ...props
}) => {
  let variantClass = '';
  switch (variant) {
    case 'header':
      variantClass = 'header-icon-btn';
      break;
    case 'sidebar':
      variantClass = 'sidebar-toggle';
      break;
    case 'danger':
      variantClass = 'btn-admin-icon danger';
      break;
    case 'success':
      variantClass = 'btn-admin-icon success';
      break;
    default:
      variantClass = 'btn-admin-icon';
      break;
  }

  const combinedClassName = `${variantClass} ${active ? 'active' : ''} ${className}`.trim();

  return (
    <button
      className={combinedClassName}
      title={label}
      aria-label={label}
      style={style}
      {...props}
    >
      <Icon size={size} />
    </button>
  );
};
