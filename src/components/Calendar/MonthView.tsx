import React from 'react';
import type { Entry, CategoryId } from '../../types';
import { getMonthMatrix, type MonthDay } from '../../utils/dateUtils';
import { CATEGORIES } from '../../data/categories';

interface MonthViewProps {
  currentDate: Date;
  entries: Entry[];
  onSelectDate: (date: Date) => void;
  onSelectEntry: (entry: Entry) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  entries,
  onSelectDate,
  onSelectEntry,
}) => {
  const weeks = getMonthMatrix(currentDate);

  // Group entries by date
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

  const weekDayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="w-full bg-white/80 rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
      {/* Month Table Header */}
      <div className="grid grid-cols-7 border-b border-stone-200/80 bg-stone-50/80">
        {weekDayLabels.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-mono font-semibold tracking-wider text-stone-500 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Month Grid Matrix */}
      <div className="grid grid-cols-7 divide-x divide-y divide-stone-200/60 bg-stone-100/30">
        {weeks.flat().map((monthDay: MonthDay) => {
          const dayEntries = entriesByDate[monthDay.dateStr] || [];
          const hasEntries = dayEntries.length > 0;

          // Unique categories in this day
          const dayCategories = Array.from(new Set(dayEntries.map((e) => e.category)));

          return (
            <div
              key={monthDay.dateStr}
              onClick={() => onSelectDate(monthDay.date)}
              className={`min-h-[120px] sm:min-h-[145px] p-2 sm:p-3 flex flex-col justify-between transition-all duration-150 cursor-pointer group ${
                monthDay.isCurrentMonth
                  ? 'bg-white hover:bg-stone-50/90'
                  : 'bg-stone-50/40 text-stone-300 hover:bg-stone-100/50'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm sm:text-base font-mono font-bold leading-none px-2 py-1 rounded-lg transition-colors ${
                    monthDay.isToday
                      ? 'bg-stone-900 text-stone-50 shadow-xs'
                      : monthDay.isCurrentMonth
                      ? 'text-stone-800 group-hover:text-stone-950'
                      : 'text-stone-400'
                  }`}
                >
                  {monthDay.dayNumber}
                </span>

                {hasEntries && (
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">
                    {dayEntries.length}
                  </span>
                )}
              </div>

              {/* Minimalist Activity Indicators / Entry Pills */}
              <div className="space-y-1.5 my-1 flex-1 flex flex-col justify-start">
                {dayEntries.slice(0, 3).map((entry) => {
                  const cat = CATEGORIES[entry.category as CategoryId];
                  return (
                    <div
                      key={entry.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEntry(entry);
                      }}
                      className={`text-[11px] truncate px-2 py-1 rounded-md border font-medium transition-all ${
                        cat ? `${cat.color.bg} ${cat.color.text} ${cat.color.border}` : 'bg-stone-100 text-stone-700'
                      } hover:brightness-95 hover:shadow-2xs`}
                      title={`${entry.startTime} - ${entry.title}`}
                    >
                      <span className="mr-1">{cat?.icon}</span>
                      <span className="truncate">{entry.title}</span>
                    </div>
                  );
                })}

                {dayEntries.length > 3 && (
                  <div className="text-[10px] text-stone-400 font-mono pl-1">
                    +{dayEntries.length - 3} more
                  </div>
                )}
              </div>

              {/* Category Dots Bar */}
              {hasEntries && (
                <div className="flex items-center gap-1 pt-1.5 border-t border-stone-100">
                  {dayCategories.map((catId) => {
                    const cat = CATEGORIES[catId as CategoryId];
                    return (
                      <span
                        key={catId}
                        className={`w-1.5 h-1.5 rounded-full ${cat?.color.dot || 'bg-stone-400'}`}
                        title={cat?.name}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
