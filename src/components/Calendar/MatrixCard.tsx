import React, { useState } from 'react';
import type { Entry } from '../../types';
import { getCategory } from '../../data/categories';
import { ExternalLink, Tag as TagIcon, GripVertical } from 'lucide-react';

interface MatrixCardProps {
  entry: Entry;
  onSelectEntry: (entry: Entry) => void;
  scale?: 'sm' | 'md' | 'lg';
}

export const MatrixCard: React.FC<MatrixCardProps> = ({
  entry,
  onSelectEntry,
  scale = 'md',
}) => {
  const [imgError, setImgError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const category = getCategory(entry.category);

  // Derive domain from URL if available
  const domain = React.useMemo(() => {
    if (!entry.url) return null;
    try {
      const u = new URL(entry.url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return entry.url;
    }
  }, [entry.url]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);

    // Set globally for reliable cross-browser drag
    try {
      // @ts-expect-error mutating exported variable for drag tracking
      window.__activeDraggedEntry = {
        entryId: entry.id,
        oldDate: entry.date,
        oldStartTime: entry.startTime,
        oldCategory: entry.category,
      };
    } catch {
      // ignore
    }

    try {
      const payload = JSON.stringify({
        entryId: entry.id,
        oldDate: entry.date,
        oldStartTime: entry.startTime,
        oldCategory: entry.category,
      });
      e.dataTransfer.setData('text/plain', payload);
      e.dataTransfer.setData('application/json', payload);
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {
      console.warn('Matrix dragStart error', err);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Sizing styles based on zoom scale
  const widthClass =
    scale === 'sm'
      ? 'w-[140px] text-[11px]'
      : scale === 'lg'
      ? 'w-[210px] text-[13px]'
      : 'w-[172px] text-[12px]';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onSelectEntry(entry);
      }}
      className={`group shrink-0 ${widthClass} bg-white rounded-xl border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all duration-150 cursor-pointer overflow-hidden flex flex-col select-none ${
        isDragging ? 'opacity-30 scale-95 ring-2 ring-stone-900/30' : ''
      }`}
      title="Click to view details • Drag to move date or category"
    >
      {/* Thumbnail Image Header or Styled Banner */}
      {entry.image && !imgError ? (
        <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden border-b border-stone-200/70">
          <img
            src={entry.image}
            alt={entry.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-md shadow-2xs ${category.color.badgeBg} ${category.color.badgeText} bg-white/90`}
            >
              {category.craftName || category.name}
            </span>
          </div>
          {entry.url && (
            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white/90">
              <ExternalLink className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
      ) : (
        <div
          className={`px-2.5 pt-2 pb-1.5 border-b flex items-center justify-between ${category.color.bg} ${category.color.border}`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{category.icon}</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${category.color.text}`}
            >
              {category.craftName || category.name}
            </span>
          </div>
          <GripVertical className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-70 transition-opacity" />
        </div>
      )}

      {/* Content Section */}
      <div className="p-2.5 flex-1 flex flex-col justify-between gap-1.5">
        <div>
          <h4 className="font-semibold text-stone-900 leading-snug line-clamp-2 group-hover:text-amber-900 transition-colors">
            {entry.title}
          </h4>

          {entry.description && (
            <p className="text-[11px] text-stone-500 font-normal line-clamp-2 mt-1 leading-relaxed">
              {entry.description}
            </p>
          )}
        </div>

        {/* Bottom meta: domain/time/tags */}
        <div className="pt-1 mt-0.5 border-t border-stone-100 flex items-center justify-between gap-1 text-[10px] text-stone-400">
          {domain ? (
            <span className="truncate max-w-[110px] text-stone-500 font-medium hover:underline flex items-center gap-0.5">
              <span>{domain}</span>
            </span>
          ) : entry.tags && entry.tags.length > 0 ? (
            <span className="truncate max-w-[110px] text-stone-500 font-mono text-[9px] flex items-center gap-0.5">
              <TagIcon className="w-2.5 h-2.5 shrink-0 text-stone-400" />
              <span>{entry.tags[0]}</span>
              {entry.tags.length > 1 && <span>+{entry.tags.length - 1}</span>}
            </span>
          ) : (
            <span className="font-mono text-[9px] text-stone-400">
              {entry.startTime || '—'}
            </span>
          )}

          {entry.tags && entry.tags.length > 0 && domain && (
            <span className="text-[9px] font-mono text-stone-400 shrink-0">
              #{entry.tags[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
