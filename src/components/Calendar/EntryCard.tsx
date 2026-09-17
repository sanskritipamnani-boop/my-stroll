import React, { useState } from 'react';
import { ExternalLink, Image as ImageIcon, GripVertical } from 'lucide-react';
import type { Entry } from '../../types';
import { getCategory } from '../../data/categories';
import { formatTimeRange } from '../../utils/dateUtils';

export interface DraggedEntryPayload {
  entryId: string;
  oldDate: string;
  oldStartTime: string;
}

// In-memory reference for 100% reliable drag data transfer across browsers
export let activeDraggedEntry: DraggedEntryPayload | null = null;

interface EntryCardProps {
  entry: Entry;
  top: number;
  height: number;
  colIndex: number;
  totalCols: number;
  onClick: (entry: Entry) => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  top,
  height,
  colIndex,
  totalCols,
  onClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const category = getCategory(entry.category);
  const timeFormatted = formatTimeRange(entry.startTime, entry.endTime);
  const isCompact = height < 90;

  // Calculate width and horizontal offset for overlapping columns
  const widthPercent = 100 / totalCols;
  const leftPercent = colIndex * widthPercent;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    
    activeDraggedEntry = {
      entryId: entry.id,
      oldDate: entry.date,
      oldStartTime: entry.startTime,
    };

    try {
      const payloadStr = JSON.stringify(activeDraggedEntry);
      e.dataTransfer.setData('text/plain', payloadStr);
      e.dataTransfer.setData('application/json', payloadStr);
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {
      console.warn('DataTransfer error', err);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    activeDraggedEntry = null;
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
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: totalCols > 1 ? `calc(${leftPercent}% + 2px)` : '3px',
        width: totalCols > 1 ? `calc(${widthPercent}% - 4px)` : 'calc(100% - 6px)',
      }}
      className={`absolute z-10 rounded-2xl p-2.5 transition-all duration-150 cursor-grab active:cursor-grabbing overflow-hidden flex flex-col justify-between select-none ${
        category.color.bg
      } ${category.color.border} border card-shadow hover:card-shadow-hover hover:-translate-y-0.5 group ${
        isDragging ? 'opacity-35 scale-[0.98] ring-2 ring-stone-900/40 shadow-lg' : ''
      }`}
      title="Click to view details • Drag to reschedule"
    >
      {/* Top row: Category badge & Time + Drag grip icon */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
            category.color.badgeBg
          } ${category.color.badgeText} shrink-0`}
        >
          <span>{category.icon}</span>
          <span className="truncate max-w-[100px] font-semibold">{category.name}</span>
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <span className="mono-time text-[10px] font-medium text-stone-500">
            {timeFormatted}
          </span>
          <span className="opacity-0 group-hover:opacity-60 text-stone-400 -mr-1 transition-opacity cursor-grab">
            <GripVertical className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Main Title & Content */}
      <div className="flex-1 min-h-0 flex flex-col justify-start">
        <h4 className="text-xs sm:text-[13px] font-semibold text-stone-900 leading-snug line-clamp-2 group-hover:text-stone-950">
          {entry.title}
        </h4>

        {!isCompact && entry.description && (
          <p className="text-[11px] text-stone-600 font-normal line-clamp-2 mt-1 leading-relaxed">
            {entry.description}
          </p>
        )}
      </div>

      {/* Footer: Tags, Image indicator, Link indicator */}
      {!isCompact && (
        <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 border-t border-stone-200/40 text-[10px]">
          {/* Tags */}
          <div className="flex items-center gap-1 overflow-hidden">
            {entry.tags && entry.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-stone-500 font-mono text-[9px] bg-white/70 px-1.5 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
            {entry.tags && entry.tags.length > 2 && (
              <span className="text-stone-400 font-mono text-[9px]">
                +{entry.tags.length - 2}
              </span>
            )}
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-1.5 text-stone-400">
            {entry.image && (
              <span title="Contains image" className="inline-flex items-center">
                <ImageIcon className="w-3 h-3 text-stone-500" />
              </span>
            )}
            {entry.url && (
              <span title="Contains link" className="inline-flex items-center">
                <ExternalLink className="w-3 h-3 text-stone-500" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
