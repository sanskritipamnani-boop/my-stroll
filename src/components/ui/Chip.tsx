import React from 'react';
import type { Category } from '../../types';

interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  category?: Category;
  size?: 'sm' | 'md';
  className?: string;
  badge?: number | string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  selected = false,
  onClick,
  category,
  size = 'md',
  className = '',
  badge,
}) => {
  const isInteractive = !!onClick;
  
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2.5 py-1 gap-1.5 rounded-full' 
    : 'text-xs md:text-sm px-3 py-1.5 gap-2 rounded-xl';

  let dynamicStyle = 'bg-stone-100/80 text-stone-700 border-stone-200/60 hover:bg-stone-200/70';

  if (category) {
    if (selected) {
      dynamicStyle = `${category.color.badgeBg} ${category.color.text} border-current ring-1 ring-current shadow-xs font-semibold`;
    } else {
      dynamicStyle = `${category.color.bg} ${category.color.text} ${category.color.border} hover:brightness-95 opacity-90 hover:opacity-100`;
    }
  } else if (selected) {
    dynamicStyle = 'bg-stone-900 text-stone-50 border-stone-900 shadow-xs font-medium';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className={`inline-flex items-center border transition-all duration-150 select-none ${sizeClasses} ${dynamicStyle} ${
        isInteractive ? 'cursor-pointer active:scale-95' : 'cursor-default'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
      {badge !== undefined && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
          selected ? 'bg-black/15 text-current' : 'bg-stone-200/80 text-stone-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
};
