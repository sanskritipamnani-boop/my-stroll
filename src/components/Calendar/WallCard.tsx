import React, { useState } from 'react';
import { ExternalLink, Edit3, Trash2, GripVertical } from 'lucide-react';
import type { Entry } from '../../types';
import { getCategory } from '../../data/categories';
import { formatTime } from '../../utils/dateUtils';
import { setActiveDraggedWallEntry } from '../../utils/dragState';

interface WallCardProps {
  entry: Entry;
  onClick: (entry: Entry) => void;
  onEdit?: (entry: Entry) => void;
  onDelete?: (id: string) => void;
}

export const WallCard: React.FC<WallCardProps> = ({
  entry,
  onClick,
  onEdit,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const category = getCategory(entry.category);
  const formattedTime = formatTime(entry.startTime);

  // Extract simple domain name if url exists
  let domain = '';
  if (entry.url) {
    try {
      const u = new URL(entry.url);
      domain = u.hostname.replace('www.', '');
    } catch {
      domain = entry.url;
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);

    const payload = {
      entryId: entry.id,
      oldDate: entry.date,
      oldCategory: entry.category,
    };
    setActiveDraggedWallEntry(payload);

    try {
      const payloadStr = JSON.stringify(payload);
      e.dataTransfer.setData('text/plain', payloadStr);
      e.dataTransfer.setData('application/json', payloadStr);
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {
      console.warn('Drag data transfer error', err);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setActiveDraggedWallEntry(null);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onClick(entry);
      }}
      className={`group relative w-[190px] sm:w-[205px] bg-white rounded-xl border border-stone-200/90 hover:border-stone-400/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-200 cursor-grab active:cursor-grabbing select-none overflow-hidden flex flex-col shrink-0 ${
        isDragging ? 'opacity-30 scale-95 ring-2 ring-stone-900/30' : ''
      }`}
      title="Click to view details • Drag to move date or category"
    >
      {/* Visual Preview / Thumbnail Banner */}
      <div className="relative w-full h-[115px] sm:h-[122px] bg-stone-100 overflow-hidden shrink-0 border-b border-stone-100">
        {entry.image ? (
          <img
            src={entry.image}
            alt={entry.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col justify-between p-3 ${category.color.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">{category.icon}</span>
              <span className={`text-[9px] uppercase tracking-wider font-mono font-bold ${category.color.text}`}>
                {category.shortName || category.name}
              </span>
            </div>
            <p className="text-[11px] font-serif italic text-stone-600 line-clamp-2 leading-snug">
              {entry.description || entry.title}
            </p>
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 bg-stone-900/80 backdrop-blur-xs rounded-md p-1 shadow-xs">
          {entry.url && (
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-stone-300 hover:text-white p-0.5 rounded transition-colors"
              title="Open link"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(entry);
              }}
              className="text-stone-300 hover:text-white p-0.5 rounded transition-colors"
              title="Edit entry"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${entry.title}"?`)) {
                  onDelete(entry.id);
                }
              }}
              className="text-stone-300 hover:text-rose-400 p-0.5 rounded transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Drag handle subtle indicator */}
        <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-70 transition-opacity text-stone-500 bg-white/70 backdrop-blur-xs rounded p-0.5 pointer-events-none">
          <GripVertical className="w-3 h-3" />
        </div>
      </div>

      {/* Card Content Footer */}
      <div className="p-2.5 flex flex-col justify-between flex-1 gap-1.5 bg-white">
        <h4 className="text-[12px] font-semibold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1 leading-snug">
          {entry.title}
        </h4>

        {/* Domain / Subtitle & Tags */}
        <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono gap-1">
          <span className="truncate max-w-[120px] text-stone-500">
            {domain || formattedTime || category.shortName || category.name}
          </span>
          <span className="shrink-0 flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: category.color.accent }}
            />
          </span>
        </div>
      </div>
    </div>
  );
};
