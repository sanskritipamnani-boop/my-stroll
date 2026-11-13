import React, { useState, useMemo, useRef } from 'react';
import type { Entry, CategoryId } from '../../types';
import { CATEGORY_LIST } from '../../data/categories';
import { formatWallDate, formatWallDayName, formatDateIso } from '../../utils/dateUtils';
import { WallCard } from './WallCard';
import { activeDraggedWallEntry } from '../../utils/dragState';
import { Plus } from 'lucide-react';

interface WallViewProps {
  entries: Entry[];
  onSelectEntry: (entry: Entry) => void;
  onEditEntry?: (entry: Entry) => void;
  onDeleteEntry?: (id: string) => void;
  onOpenAddEntry: (date?: string, category?: CategoryId) => void;
  onMoveEntry: (entryId: string, targetDate: string, targetCategory: CategoryId) => void;
}

export const WallView: React.FC<WallViewProps> = ({
  entries,
  onSelectEntry,
  onEditEntry,
  onDeleteEntry,
  onOpenAddEntry,
  onMoveEntry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom state: 0.6 to 1.4
  const [zoom, setZoom] = useState<number>(1);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  // Custom date picker for adding new date column
  const [isAddingDate, setIsAddingDate] = useState(false);
  const [newDateInput, setNewDateInput] = useState(formatDateIso(new Date()));
  const [customDates, setCustomDates] = useState<string[]>([]);

  // Collect and sort all distinct dates from entries + custom added dates
  const timelineDates = useMemo(() => {
    const dateSet = new Set<string>();

    entries.forEach((e) => {
      if (e.date) dateSet.add(e.date);
    });

    customDates.forEach((d) => dateSet.add(d));

    // If completely empty, add today
    if (dateSet.size === 0) {
      dateSet.add(formatDateIso(new Date()));
    }

    return Array.from(dateSet).sort();
  }, [entries, customDates]);

  // Group entries by `date` and `category`
  const entriesByCell = useMemo(() => {
    const map = new Map<string, Entry[]>();

    entries.forEach((entry) => {
      const key = `${entry.date}__${entry.category}`;
      const existing = map.get(key) || [];
      existing.push(entry);
      map.set(key, existing);
    });

    return map;
  }, [entries]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(1.4, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.6, Number((prev - 0.15).toFixed(2))));
  };

  const handleFit = () => {
    setZoom(1);
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    }
  };

  // Drag and Drop handling
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetDate: string, targetCategory: CategoryId) => {
    e.preventDefault();
    setDragOverCell(null);

    let entryId = activeDraggedWallEntry?.entryId;

    if (!entryId) {
      try {
        const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
        if (raw) {
          const parsed = JSON.parse(raw);
          entryId = parsed.entryId;
        }
      } catch {
        // fallback
      }
    }

    if (entryId) {
      onMoveEntry(entryId, targetDate, targetCategory);
    }
  };

  const handleAddCustomDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDateInput && !customDates.includes(newDateInput)) {
      setCustomDates((prev) => [...prev, newDateInput]);
    }
    setIsAddingDate(false);
  };

  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[650px] bg-[#FAF8F5] overflow-hidden flex flex-col select-none">
      
      {/* Scrollable Canvas Matrix Area */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full overflow-auto scroll-smooth relative"
        style={{
          // subtle dotted grid or plain cream backdrop matching designshaped
          backgroundColor: '#FAF8F5',
        }}
      >
        <div
          className="inline-block min-w-full transition-transform duration-150 origin-top-left"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Header Row: Sticky top with timeline dates */}
          <div className="sticky top-0 z-30 flex bg-[#FAF8F5]/98 backdrop-blur-md border-b border-[#EAE5DC]">
            
            {/* Top-Left Corner Cell: Sticky in both directions */}
            <div className="sticky left-0 z-40 w-[140px] sm:w-[170px] shrink-0 bg-[#FAF8F5] border-r border-[#EAE5DC] p-4 flex items-end">
              <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400 font-medium">
                Craft / Date
              </span>
            </div>

            {/* Date Columns Header */}
            <div className="flex">
              {timelineDates.map((dateStr) => {
                const formatted = formatWallDate(dateStr);
                const dayName = formatWallDayName(dateStr);

                return (
                  <div
                    key={dateStr}
                    className="w-[230px] sm:w-[250px] shrink-0 border-r border-[#EAE5DC] px-4 py-3.5 flex flex-col justify-end group transition-colors hover:bg-stone-100/40"
                  >
                    <div className="flex items-center gap-1.5 text-stone-500 font-mono text-xs">
                      <span className="text-amber-700/80 text-[10px]">▸</span>
                      <span className="font-medium text-stone-700 tracking-tight">
                        {formatted}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-sans mt-0.5 ml-3.5">
                      {dayName}
                    </span>
                  </div>
                );
              })}

              {/* Add New Date Column Button */}
              <div className="w-[120px] shrink-0 p-3 flex items-center border-r border-dashed border-[#EAE5DC]">
                {isAddingDate ? (
                  <form onSubmit={handleAddCustomDate} className="flex flex-col gap-1 w-full">
                    <input
                      type="date"
                      value={newDateInput}
                      onChange={(e) => setNewDateInput(e.target.value)}
                      className="text-[11px] p-1 rounded border border-stone-300 bg-white"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        type="submit"
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-900 text-white font-medium"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingDate(false)}
                        className="text-[10px] px-1.5 py-0.5 rounded text-stone-500 hover:text-stone-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingDate(true)}
                    className="text-[11px] text-stone-400 hover:text-stone-700 font-mono flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-stone-200/50 transition-colors"
                    title="Add a new timeline date column"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Date</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Swimlane Rows by Category */}
          <div className="flex flex-col">
            {CATEGORY_LIST.map((category) => {
              // Count entries in this craft row
              const totalInRow = entries.filter((e) => e.category === category.id).length;

              return (
                <div
                  key={category.id}
                  className="flex border-b border-[#EAE5DC] min-h-[260px] group/row"
                >
                  {/* Left Column: Sticky Craft / Category Name */}
                  <div className="sticky left-0 z-20 w-[140px] sm:w-[170px] shrink-0 bg-[#FAF8F5] border-r border-[#EAE5DC] p-4 flex flex-col justify-start gap-1">
                    <h3 className="font-serif text-base sm:text-lg text-stone-700 font-normal tracking-tight group-hover/row:text-stone-900 transition-colors">
                      {category.shortName || category.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-mono">
                      <span>{category.icon}</span>
                      <span>
                        {totalInRow} {totalInRow === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>

                  {/* Date Grid Cells in this row */}
                  <div className="flex">
                    {timelineDates.map((dateStr) => {
                      const cellKey = `${dateStr}__${category.id}`;
                      const cellEntries = entriesByCell.get(cellKey) || [];
                      const isOver = dragOverCell === cellKey;

                      return (
                        <div
                          key={cellKey}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            setDragOverCell(cellKey);
                          }}
                          onDragLeave={() => {
                            if (dragOverCell === cellKey) {
                              setDragOverCell(null);
                            }
                          }}
                          onDrop={(e) => handleDrop(e, dateStr, category.id)}
                          onDoubleClick={() => onOpenAddEntry(dateStr, category.id)}
                          className={`w-[230px] sm:w-[250px] shrink-0 border-r border-[#EAE5DC] p-3 sm:p-4 transition-colors flex flex-col gap-3.5 relative min-h-[260px] ${
                            isOver ? 'bg-amber-100/40 ring-1 ring-inset ring-amber-400/60' : 'hover:bg-stone-100/25'
                          }`}
                        >
                          {/* Cards Stacked Vertically in this cell */}
                          {cellEntries.map((entry) => (
                            <WallCard
                              key={entry.id}
                              entry={entry}
                              onClick={onSelectEntry}
                              onEdit={onEditEntry}
                              onDelete={onDeleteEntry}
                            />
                          ))}

                          {/* Quick Add Button at bottom of column or in empty cell */}
                          <div className={`mt-auto pt-2 ${cellEntries.length === 0 ? 'flex items-center justify-center h-full' : 'opacity-0 hover:opacity-100 transition-opacity'}`}>
                            <button
                              type="button"
                              onClick={() => onOpenAddEntry(dateStr, category.id)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-stone-400 hover:text-stone-700 px-3 py-1.5 rounded-lg border border-dashed border-stone-200 hover:border-stone-400 bg-white/40 hover:bg-white transition-all shadow-2xs"
                              title={`Add ${category.shortName || category.name} exploration on ${dateStr}`}
                            >
                              <Plus className="w-3 h-3 text-stone-500" />
                              <span>{cellEntries.length === 0 ? 'Add exploration' : 'Add card'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Spacer matching Add Date header column */}
                    <div className="w-[120px] shrink-0 border-r border-dashed border-[#EAE5DC] bg-stone-50/20" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom-Left Floating Editorial Widget (Inspired by Design Shaped) */}
      <aside className="fixed bottom-6 left-6 z-40 pointer-events-auto max-w-[320px] sm:max-w-[360px] rounded-3xl bg-[#FAF8F5]/95 backdrop-blur-md border border-stone-200/90 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] select-none">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[12px] font-extrabold tracking-wider uppercase text-amber-800 font-sans">
            DESIGN SHAPED
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-600 font-mono font-medium">
            {entries.length} explorations
          </span>
        </div>

        {/* Subtitle */}
        <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 leading-snug">
          Portfolio wall
        </h2>

        {/* Description */}
        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
          Portfolios we've reviewed live on Feedback Friday, laid out by week and by craft.
        </p>

        {/* Controls Pill: Zoom & Add */}
        <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between gap-2">
          
          {/* Zoom: − Fit + */}
          <div className="inline-flex items-center bg-white rounded-full border border-stone-200/90 p-1 shadow-2xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-7 h-7 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200 font-mono text-sm transition-colors"
              title="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              onClick={handleFit}
              className="px-2.5 h-7 rounded-full flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200 font-medium text-xs transition-colors"
              title="Reset view (Fit)"
            >
              Fit
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-7 h-7 rounded-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:bg-stone-200 font-mono text-sm transition-colors"
              title="Zoom in"
            >
              +
            </button>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => onOpenAddEntry()}
            className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full bg-stone-900 text-stone-100 text-xs font-semibold hover:bg-stone-800 shadow-xs hover:shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add Entry</span>
          </button>
        </div>
      </aside>

    </div>
  );
};
