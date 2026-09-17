import React from 'react';
import { HOURS_LIST, HOUR_HEIGHT } from '../../utils/calendarUtils';

export const TimeGrid: React.FC = () => {
  return (
    <div className="w-16 sm:w-20 shrink-0 border-r border-stone-200/70 bg-[#FBF9F4]/70 select-none">
      {/* Header spacer to align with Day column header cards */}
      <div className="sticky top-0 z-20 h-[54px] border-b border-stone-200/80 bg-[#FAF7F0]/95 backdrop-blur-md flex items-center justify-center">
        <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold tracking-wider">
          TIME
        </span>
      </div>

      {/* Time slots with :00 and :30 tick marks */}
      <div className="relative">
        {HOURS_LIST.map((hour) => {
          const formattedHour = String(hour).padStart(2, '0');

          return (
            <div
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="border-b border-stone-200/40 pr-2.5 pt-1.5 text-right flex flex-col justify-between items-end relative"
            >
              {/* Hour :00 */}
              <div className="text-[11px] font-mono font-medium text-stone-500">
                {formattedHour}:00
              </div>

              {/* Half-hour :30 tick */}
              <div className="text-[10px] font-mono text-stone-400/80 pb-1">
                {formattedHour}:30
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
