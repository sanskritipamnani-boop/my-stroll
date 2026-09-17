import React, { useState } from 'react';
import type { Entry } from '../../types';
import { formatDateIso, isToday } from '../../utils/dateUtils';
import { layoutDayEntries, HOURS_LIST, HOUR_HEIGHT, TOTAL_HOURS } from '../../utils/calendarUtils';
import { EntryCard, activeDraggedEntry } from './EntryCard';
import { Plus, ArrowDown } from 'lucide-react';

interface DayColumnProps {
  date: Date;
  entries: Entry[];
  onSelectEntry: (entry: Entry) => void;
  onSlotClick: (dateStr: string, timeHour: number) => void;
  onMoveEntry: (entryId: string, targetDate: string, targetStartTime: string) => void;
}

export const DayColumn: React.FC<DayColumnProps> = ({
  date,
  entries,
  onSelectEntry,
  onSlotClick,
  onMoveEntry,
}) => {
  const [dragOverSlot, setDragOverSlot] = useState<{ hour: number; isHalf: boolean } | null>(null);

  const dateStr = formatDateIso(date);
  const dayIsToday = isToday(date);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dayNumber = date.getDate();
  const monthNumber = String(date.getMonth() + 1).padStart(2, '0');
  const formattedDayDate = `${dayNumber}/${monthNumber}`;

  const positionedEntries = layoutDayEntries(entries);
  const gridHeight = TOTAL_HOURS * HOUR_HEIGHT;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, hour: number, isHalf: boolean) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlot?.hour !== hour || dragOverSlot?.isHalf !== isHalf) {
      setDragOverSlot({ hour, isHalf });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, hour: number, isHalf: boolean) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    let entryId: string | null = null;

    // 1. Primary: Use in-memory drag state
    if (activeDraggedEntry?.entryId) {
      entryId = activeDraggedEntry.entryId;
    } else {
      // 2. Fallback: Parse dataTransfer
      try {
        const rawJson = e.dataTransfer.getData('application/json');
        const rawPlain = e.dataTransfer.getData('text/plain');
        const raw = rawJson || rawPlain;

        if (raw && (raw.startsWith('{') || raw.startsWith('['))) {
          const parsed = JSON.parse(raw);
          entryId = parsed.entryId || null;
        } else if (raw && raw.trim().startsWith('entry-')) {
          entryId = raw.trim();
        }
      } catch (err) {
        console.warn('Drop payload fallback parse error', err);
      }
    }

    if (entryId) {
      const minuteStr = isHalf ? '30' : '00';
      const formattedHour = String(hour).padStart(2, '0');
      const newStartTime = `${formattedHour}:${minuteStr}`;
      onMoveEntry(entryId, dateStr, newStartTime);
    }
  };

  return (
    <div
      onDragLeave={(e) => {
        // Clear if leaving the column
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragOverSlot(null);
        }
      }}
      className={`flex-1 min-w-[150px] sm:min-w-[170px] border-r border-stone-200/60 last:border-r-0 flex flex-col bg-white/30 select-none group/col transition-colors ${
        dragOverSlot ? 'bg-amber-50/20' : ''
      }`}
    >
      {/* Sleek Compact Column Header Card */}
      <div className="sticky top-0 z-20 p-1.5 border-b border-stone-200/70 bg-[#FAF7F0]/95 backdrop-blur-md h-[54px] flex items-center">
        <div
          className={`w-full h-[40px] rounded-xl flex items-center justify-center gap-1.5 px-2 transition-all duration-200 ${
            dayIsToday
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white/90 text-stone-700 border border-stone-200/70 shadow-2xs hover:bg-white'
          }`}
        >
          <span
            className={`text-[11px] font-semibold tracking-wide uppercase ${
              dayIsToday ? 'text-stone-300' : 'text-stone-500'
            }`}
          >
            {dayName.slice(0, 3)}
          </span>
          <span className={`text-[10px] ${dayIsToday ? 'text-stone-500' : 'text-stone-300'}`}>•</span>
          <span
            className={`text-xs font-mono font-bold tracking-tight leading-none ${
              dayIsToday ? 'text-white' : 'text-stone-800'
            }`}
          >
            {formattedDayDate}
          </span>
        </div>
      </div>

      {/* Grid area with interactive hour slots */}
      <div
        className="relative flex-1"
        style={{ height: `${gridHeight}px` }}
      >
        {/* Hourly and Half-hourly Slot Grid Lines with Drop Zones */}
        {HOURS_LIST.slice(0, TOTAL_HOURS).map((hour) => {
          const isTopActive = dragOverSlot?.hour === hour && !dragOverSlot?.isHalf;
          const isBottomActive = dragOverSlot?.hour === hour && dragOverSlot?.isHalf;

          return (
            <div
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="border-b border-stone-200/40 relative group/slot flex flex-col justify-between"
            >
              {/* Top half-hour slot (e.g. 10:00 - 10:30) */}
              <div
                onClick={() => onSlotClick(dateStr, hour)}
                onDragOver={(e) => handleDragOver(e, hour, false)}
                onDrop={(e) => handleDrop(e, hour, false)}
                className={`flex-1 transition-all cursor-pointer flex items-center justify-between px-2 relative ${
                  isTopActive
                    ? 'bg-amber-100/70 ring-2 ring-amber-400 ring-inset rounded-lg z-20'
                    : 'hover:bg-amber-50/40'
                }`}
                title={`Add exploration at ${hour}:00`}
              >
                {isTopActive ? (
                  <div className="w-full flex items-center justify-center gap-1 text-[10px] font-mono font-bold text-amber-900 animate-pulse">
                    <ArrowDown className="w-3 h-3" />
                    <span>Drop at {String(hour).padStart(2, '0')}:00</span>
                  </div>
                ) : (
                  <span className="opacity-0 group-hover/slot:opacity-100 text-stone-400 p-0.5 rounded transition-opacity ml-auto">
                    <Plus className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Subtle half-hour dashed divider */}
              <div className="border-b border-dashed border-stone-200/30 w-full" />

              {/* Bottom half-hour slot (e.g. 10:30 - 11:00) */}
              <div
                onClick={() => onSlotClick(dateStr, hour)}
                onDragOver={(e) => handleDragOver(e, hour, true)}
                onDrop={(e) => handleDrop(e, hour, true)}
                className={`flex-1 transition-all cursor-pointer flex items-center justify-center px-2 relative ${
                  isBottomActive
                    ? 'bg-amber-100/70 ring-2 ring-amber-400 ring-inset rounded-lg z-20'
                    : 'hover:bg-amber-50/40'
                }`}
                title={`Add exploration at ${hour}:30`}
              >
                {isBottomActive && (
                  <div className="w-full flex items-center justify-center gap-1 text-[10px] font-mono font-bold text-amber-900 animate-pulse">
                    <ArrowDown className="w-3 h-3" />
                    <span>Drop at {String(hour).padStart(2, '0')}:30</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Positioned Entry Cards */}
        {positionedEntries.map(({ entry, top, height, colIndex, totalCols }) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            top={top}
            height={height}
            colIndex={colIndex}
            totalCols={totalCols}
            onClick={onSelectEntry}
          />
        ))}
      </div>
    </div>
  );
};
