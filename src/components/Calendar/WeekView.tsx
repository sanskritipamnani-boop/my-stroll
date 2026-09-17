import React from 'react';
import type { Entry } from '../../types';
import { getWeekDays, formatDateIso, isToday } from '../../utils/dateUtils';
import { TimeGrid } from './TimeGrid';
import { DayColumn } from './DayColumn';
import { getCurrentTimePosition } from '../../utils/calendarUtils';
import { Sparkles, Plus } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  entries: Entry[];
  onSelectEntry: (entry: Entry) => void;
  onSlotClick: (dateStr: string, timeHour: number) => void;
  onOpenAddEntry: () => void;
  onMoveEntry: (entryId: string, targetDate: string, targetStartTime: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  entries,
  onSelectEntry,
  onSlotClick,
  onOpenAddEntry,
  onMoveEntry,
}) => {
  const weekDays = getWeekDays(currentDate);
  const currentTimeTop = getCurrentTimePosition();
  const hasTodayInWeek = weekDays.some((d) => isToday(d));

  // Current time string for the indicator badge (e.g. "07:21")
  const currentTimeString = React.useMemo(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }, []);

  // Filter entries map by date string for efficiency
  const entriesByDate = React.useMemo(() => {
    const map: Record<string, Entry[]> = {};
    for (const entry of entries) {
      if (!map[entry.date]) {
        map[entry.date] = [];
      }
      map[entry.date].push(entry);
    }
    return map;
  }, [entries]);

  const isEmpty = entries.length === 0;

  return (
    <div className="w-full h-full overflow-x-auto pb-8">
      <div className="min-w-[1020px] xl:min-w-full bg-[#FCFAF6]/90 rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden flex relative">
        
        {/* Left Vertical Time Axis */}
        <TimeGrid />

        {/* 7 Horizontal Day Columns */}
        <div className="flex-1 flex relative">
          {weekDays.map((day) => {
            const dateStr = formatDateIso(day);
            const dayEntries = entriesByDate[dateStr] || [];

            return (
              <DayColumn
                key={dateStr}
                date={day}
                entries={dayEntries}
                onSelectEntry={onSelectEntry}
                onSlotClick={onSlotClick}
                onMoveEntry={onMoveEntry}
              />
            );
          })}

          {/* Current Time Indicator: Soft Rose Badge with Dashed Line across the grid */}
          {hasTodayInWeek && currentTimeTop !== null && (
            <div
              style={{ top: `${currentTimeTop + 54}px` }}
              className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            >
              {/* Pink time badge on the left edge */}
              <div className="bg-[#F43F5E] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md -ml-2 shadow-xs ring-2 ring-white">
                {currentTimeString}
              </div>
              <div className="flex-1 border-t border-[#F43F5E]/70 border-dashed" />
            </div>
          )}

          {/* Subtle Empty State Banner when 0 entries */}
          {isEmpty && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="pointer-events-auto max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-stone-200/80 shadow-sm text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 mx-auto flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-stone-900 serif-title">
                  Your Exploration Timeline is Clear
                </h3>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  Click on any time slot across the days or click <strong>+ Add Entry</strong> to capture your first thought, visual reference, or curiosity note.
                </p>
                <button
                  type="button"
                  onClick={onOpenAddEntry}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Entry</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
