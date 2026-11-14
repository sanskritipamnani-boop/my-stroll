import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Entry, CategoryId, Category } from '../../types';
import { CATEGORY_LIST } from '../../data/categories';
import { formatMatrixColumnDate } from '../../utils/dateUtils';
import { MatrixCard } from './MatrixCard';
import { Plus, Sparkles, ZoomIn, ZoomOut, ArrowRight, Layers, Tag as TagIcon } from 'lucide-react';

interface MatrixRow {
  key: string;
  title: string;
  fullTitle: string;
  icon: string;
  category?: Category;
}

interface MatrixViewProps {
  entries: Entry[];
  onSelectEntry: (entry: Entry) => void;
  onOpenAddEntry: (presetDate?: string, presetCategory?: CategoryId) => void;
  onMoveEntry?: (entryId: string, targetDate: string, targetCategory?: CategoryId) => void;
  onLoadDemoSample?: () => void;
}

type GroupByMode = 'category' | 'tag';
type ScaleMode = 'sm' | 'md' | 'lg';

export const MatrixView: React.FC<MatrixViewProps> = ({
  entries,
  onSelectEntry,
  onOpenAddEntry,
  onMoveEntry,
  onLoadDemoSample,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [groupBy, setGroupBy] = useState<GroupByMode>('category');
  const [scale, setScale] = useState<ScaleMode>('md');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [dragOverCell, setDragOverCell] = useState<{ date: string; rowKey: string } | null>(null);

  // 1. EXTRACT UNIQUE DATES WITH ENTRIES (Chronological order)
  // "keep the date to the last date when i added a entry , only keep the dates on the timeline where a entry was added, dont keep empty dates"
  const dates = useMemo(() => {
    const set = new Set<string>();
    for (const entry of entries) {
      if (entry.date) {
        set.add(entry.date);
      }
    }
    return Array.from(set).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [entries]);

  const latestDate = dates.length > 0 ? dates[dates.length - 1] : null;

  // Auto-scroll to the latest date column on initial load or when dates change
  useEffect(() => {
    if (dates.length > 0 && containerRef.current) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            left: containerRef.current.scrollWidth,
            behavior: 'smooth',
          });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [dates.length]);

  // Scroll to latest date helper
  const handleScrollToLatest = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  };

  // Scroll to earliest date helper
  const handleScrollToStart = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  };

  // 2. DEFINE ROWS (Categories or Tags)
  // Rows by Category
  const categoryRows = useMemo(() => {
    // Collect categories that actually have entries
    const usedCategoryIds = new Set(entries.map((e) => e.category));
    
    // Ordered list prioritizing Visual, Product, Engineering (matching the user's reference)
    const baseList = CATEGORY_LIST;

    if (showAllCategories || entries.length === 0) {
      return baseList.map((cat) => ({
        key: cat.id,
        title: cat.craftName || cat.name,
        fullTitle: cat.name,
        icon: cat.icon,
        category: cat,
      }));
    }

    // Only categories with entries
    return baseList
      .filter((cat) => usedCategoryIds.has(cat.id))
      .map((cat) => ({
        key: cat.id,
        title: cat.craftName || cat.name,
        fullTitle: cat.name,
        icon: cat.icon,
        category: cat,
      }));
  }, [entries, showAllCategories]);

  // Rows by Tag
  const tagRows = useMemo(() => {
    const tagCountMap = new Map<string, number>();
    let untaggedCount = 0;

    for (const entry of entries) {
      if (entry.tags && entry.tags.length > 0) {
        for (const t of entry.tags) {
          tagCountMap.set(t, (tagCountMap.get(t) || 0) + 1);
        }
      } else {
        untaggedCount++;
      }
    }

    const sortedTags: MatrixRow[] = Array.from(tagCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tagName]) => ({
        key: tagName,
        title: `#${tagName}`,
        fullTitle: tagName,
        icon: '🏷️',
      }));

    if (untaggedCount > 0) {
      sortedTags.push({
        key: '__untagged__',
        title: 'Untagged',
        fullTitle: 'Untagged Entries',
        icon: '📄',
      });
    }

    return sortedTags;
  }, [entries]);

  const activeRows: MatrixRow[] = groupBy === 'category' ? categoryRows : tagRows;

  // 3. FAST ENTRY LOOKUP MAP: `date_rowKey` -> Entry[]
  const cellEntriesMap = useMemo(() => {
    const map = new Map<string, Entry[]>();

    for (const entry of entries) {
      if (groupBy === 'category') {
        const cellKey = `${entry.date}__${entry.category}`;
        if (!map.has(cellKey)) {
          map.set(cellKey, []);
        }
        map.get(cellKey)!.push(entry);
      } else {
        // By Tag
        if (entry.tags && entry.tags.length > 0) {
          for (const t of entry.tags) {
            const cellKey = `${entry.date}__${t}`;
            if (!map.has(cellKey)) {
              map.set(cellKey, []);
            }
            map.get(cellKey)!.push(entry);
          }
        } else {
          const cellKey = `${entry.date}____untagged__`;
          if (!map.has(cellKey)) {
            map.set(cellKey, []);
          }
          map.get(cellKey)!.push(entry);
        }
      }
    }

    return map;
  }, [entries, groupBy]);

  // Count entries by date
  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      map.set(e.date, (map.get(e.date) || 0) + 1);
    }
    return map;
  }, [entries]);

  // Count entries by row
  const countByRow = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      if (groupBy === 'category') {
        map.set(e.category, (map.get(e.category) || 0) + 1);
      } else {
        if (e.tags && e.tags.length > 0) {
          for (const t of e.tags) {
            map.set(t, (map.get(t) || 0) + 1);
          }
        } else {
          map.set('__untagged__', (map.get('__untagged__') || 0) + 1);
        }
      }
    }
    return map;
  }, [entries, groupBy]);

  // Drag and drop handlers
  const handleCellDragOver = (e: React.DragEvent<HTMLDivElement>, date: string, rowKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCell?.date !== date || dragOverCell?.rowKey !== rowKey) {
      setDragOverCell({ date, rowKey });
    }
  };

  const handleCellDrop = (e: React.DragEvent<HTMLDivElement>, date: string, rowKey: string) => {
    e.preventDefault();
    setDragOverCell(null);

    let entryId: string | null = null;
    try {
      const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
      if (raw) {
        const parsed = JSON.parse(raw);
        entryId = parsed.entryId;
      }
    } catch {
      // fallback
    }

    if (!entryId) {
      // @ts-expect-error global fallback
      entryId = window.__activeDraggedEntry?.entryId || null;
    }

    if (entryId && onMoveEntry) {
      const targetCat = groupBy === 'category' ? (rowKey as CategoryId) : undefined;
      onMoveEntry(entryId, date, targetCat);
    }
  };

  // Zoom scale cycling
  const handleZoomIn = () => {
    if (scale === 'sm') setScale('md');
    else if (scale === 'md') setScale('lg');
  };

  const handleZoomOut = () => {
    if (scale === 'lg') setScale('md');
    else if (scale === 'md') setScale('sm');
  };

  // Dimensions based on zoom scale
  const colWidthClass =
    scale === 'sm'
      ? 'min-w-[280px] w-[280px]'
      : scale === 'lg'
      ? 'min-w-[420px] w-[420px]'
      : 'min-w-[350px] w-[350px]';

  const rowHeaderWidthClass = 'w-[140px] sm:w-[170px] min-w-[140px] sm:min-w-[170px]';

  return (
    <div className="relative w-full h-[calc(100vh-160px)] min-h-[580px] flex flex-col bg-[#FAF7F0] rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden select-none">
      
      {/* SCROLLABLE MATRIX CANVAS */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full overflow-auto relative scroll-smooth focus:outline-none"
        tabIndex={0}
      >
        <div className="inline-block min-w-full relative">
          
          {/* ========================================================================= */}
          {/* TOP DATE HEADER ROW (Sticky Top) */}
          {/* ========================================================================= */}
          <div className="sticky top-0 z-30 flex bg-[#FAF7F0]/98 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
            
            {/* Top-Left Corner Box (Sticky Top & Left) */}
            <div
              className={`sticky left-0 z-40 ${rowHeaderWidthClass} p-3.5 bg-[#FAF7F0] border-r border-stone-200/90 flex flex-col justify-between shrink-0 shadow-2xs`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-widest text-stone-600 font-bold">
                  {groupBy === 'category' ? 'Craft / Topic' : 'Tags'}
                </span>
                <span className="text-[10px] font-mono text-stone-500 bg-stone-200/70 px-1.5 py-0.5 rounded-full">
                  {activeRows.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1 font-mono">
                <span>Timeline</span>
                <span className="text-amber-800 font-semibold">{dates.length} dates</span>
              </div>
            </div>

            {/* Date Columns across top */}
            {dates.length > 0 ? (
              dates.map((dateStr) => {
                const formattedDate = formatMatrixColumnDate(dateStr);
                const count = countByDate.get(dateStr) || 0;
                const isLatest = dateStr === latestDate;

                return (
                  <div
                    key={dateStr}
                    className={`${colWidthClass} shrink-0 px-3 py-2.5 border-r border-stone-200/80 flex items-center justify-between group/col transition-colors hover:bg-stone-100/50`}
                  >
                    <div className="flex items-center gap-1.5">
                      {/* Playhead / Bullet icon as in the screenshot */}
                      <span className="text-amber-700/80 text-[10px] select-none font-bold">
                        ▶
                      </span>
                      <span className="font-mono text-xs sm:text-[13px] font-semibold text-stone-800 tracking-tight">
                        {formattedDate}
                      </span>
                      {isLatest && (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200/80 px-1.5 py-0.2 rounded-full">
                          Latest
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-stone-500 bg-white/80 border border-stone-200/60 px-1.5 py-0.5 rounded-md">
                        {count} {count === 1 ? 'card' : 'cards'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenAddEntry(dateStr)}
                        title={`Add entry on ${formattedDate}`}
                        className="opacity-0 group-hover/col:opacity-100 w-5 h-5 rounded-md bg-stone-900 text-white flex items-center justify-center transition-all hover:scale-105"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              /* If no entries exist yet */
              <div className="flex-1 px-6 py-3 flex items-center justify-between text-xs text-stone-500 font-mono">
                <span>No dates recorded yet. Add an exploration to build your timeline matrix.</span>
                {onLoadDemoSample && (
                  <button
                    type="button"
                    onClick={onLoadDemoSample}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 text-stone-950 font-semibold text-xs hover:bg-amber-400 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load Sample Data</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick "+ Add Date" Column at the right end with spacing for top-right controls */}
            <div className="w-[360px] shrink-0 p-2 flex items-center justify-start pl-3">
              <button
                type="button"
                onClick={() => onOpenAddEntry()}
                className="py-1.5 px-3 text-[11px] font-mono text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 rounded-lg border border-dashed border-stone-300 transition-colors flex items-center justify-center gap-1"
                title="Add exploration on a new date"
              >
                <Plus className="w-3 h-3" />
                <span>New Date</span>
              </button>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* ROWS (Craft / Topics / Tags) & GRID CELLS */}
          {/* ========================================================================= */}
          <div className="flex flex-col divide-y divide-stone-200/70">
            {activeRows.length > 0 ? (
              activeRows.map((row) => {
                const rowCount = countByRow.get(row.key) || 0;
                const catObj = row.category;

                return (
                  <div key={row.key} className="flex min-h-[140px] relative group/row">
                    
                    {/* Sticky Left Row Label */}
                    <div
                      className={`sticky left-0 z-20 ${rowHeaderWidthClass} shrink-0 p-3.5 bg-[#FAF7F0]/95 backdrop-blur-md border-r border-stone-200/90 flex flex-col justify-between shadow-2xs`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          {catObj ? (
                            <span
                              className={`w-2 h-2 rounded-full ${catObj.color.dot} shrink-0`}
                            />
                          ) : (
                            <TagIcon className="w-3 h-3 text-stone-400 shrink-0" />
                          )}
                          <h3 className="serif-title font-medium text-stone-800 text-sm sm:text-base tracking-tight leading-snug">
                            {row.title}
                          </h3>
                        </div>

                        {row.fullTitle && row.fullTitle !== row.title && (
                          <p className="text-[10px] text-stone-500 font-sans mt-0.5 truncate pl-4">
                            {row.fullTitle}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] font-mono text-stone-500">
                          {rowCount} {rowCount === 1 ? 'item' : 'items'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const initialCat =
                              groupBy === 'category' ? (row.key as CategoryId) : undefined;
                            onOpenAddEntry(undefined, initialCat);
                          }}
                          title={`Add entry in ${row.title}`}
                          className="opacity-0 group-hover/row:opacity-100 p-1 text-stone-400 hover:text-stone-900 rounded-md hover:bg-stone-200/60 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Cells for each date under this row */}
                    {dates.length > 0 ? (
                      dates.map((dateStr) => {
                        const cellKey = `${dateStr}__${row.key}`;
                        const cellEntries = cellEntriesMap.get(cellKey) || [];
                        const isOver =
                          dragOverCell?.date === dateStr && dragOverCell?.rowKey === row.key;

                        return (
                          <div
                            key={cellKey}
                            onDragOver={(e) => handleCellDragOver(e, dateStr, row.key)}
                            onDrop={(e) => handleCellDrop(e, dateStr, row.key)}
                            className={`${colWidthClass} shrink-0 p-2.5 border-r border-stone-200/70 transition-colors relative flex flex-wrap gap-2.5 items-start content-start group/cell ${
                              isOver
                                ? 'bg-amber-100/40 ring-2 ring-inset ring-amber-400/60'
                                : cellEntries.length > 0
                                ? 'bg-transparent'
                                : 'hover:bg-stone-100/30'
                            }`}
                          >
                            {/* Render matching entries */}
                            {cellEntries.map((entry) => (
                              <MatrixCard
                                key={entry.id}
                                entry={entry}
                                onSelectEntry={onSelectEntry}
                                scale={scale}
                              />
                            ))}

                            {/* Hover Quick Add inside cell */}
                            {cellEntries.length === 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const initialCat =
                                    groupBy === 'category' ? (row.key as CategoryId) : undefined;
                                  onOpenAddEntry(dateStr, initialCat);
                                }}
                                className="w-full h-full min-h-[90px] rounded-xl border border-dashed border-stone-300/40 hover:border-stone-400/80 hover:bg-white/50 flex flex-col items-center justify-center gap-1 text-stone-400 hover:text-stone-700 transition-all opacity-0 group-hover/cell:opacity-100"
                              >
                                <Plus className="w-4 h-4" />
                                <span className="text-[10px] font-mono">Add exploration</span>
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      /* Empty row when 0 dates exist */
                      <div className="flex-1 p-6 flex items-center justify-center text-xs text-stone-400 font-mono">
                        No entries in this topic yet
                      </div>
                    )}

                    {/* Right spacer cell matching top controls clearance */}
                    <div className="w-[360px] shrink-0 border-r border-transparent" />

                  </div>
                );
              })
            ) : (
              /* No rows to show */
              <div className="p-12 text-center text-stone-400 font-mono text-xs">
                No topics matching current filters.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONTROLS PILL (Moved to Top-Right) */}
      {/* ========================================================================= */}
      <div className="absolute top-2.5 sm:top-3 right-3 sm:right-4 z-40 pointer-events-auto inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-md text-stone-700">
        
        {/* Zoom Out [-] */}
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={scale === 'sm'}
          className="w-7 h-7 rounded-xl flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Fit / Reset */}
        <button
          type="button"
          onClick={() => {
            setScale('md');
            handleScrollToStart();
          }}
          className="px-2.5 py-1 text-xs font-mono font-semibold rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
          title="Reset to initial view"
        >
          Fit
        </button>

        {/* Zoom In [+] */}
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={scale === 'lg'}
          className="w-7 h-7 rounded-xl flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-stone-200 mx-0.5" />

        {/* Jump to Latest Date */}
        {latestDate && (
          <button
            type="button"
            onClick={handleScrollToLatest}
            className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 transition-colors flex items-center gap-1 shadow-2xs"
            title={`Jump to latest date: ${formatMatrixColumnDate(latestDate)}`}
          >
            <span>Latest</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        )}

        {/* Grouping Toggle: Category vs Tag */}
        <div className="w-[1px] h-4 bg-stone-200 mx-0.5" />
        
        <button
          type="button"
          onClick={() => setGroupBy(groupBy === 'category' ? 'tag' : 'category')}
          className="px-2 py-1 text-[10px] font-mono rounded-xl hover:bg-stone-100 text-stone-600 flex items-center gap-1 transition-colors"
          title="Toggle grouping between Category and Tags"
        >
          <Layers className="w-3 h-3 text-stone-500" />
          <span className="capitalize">{groupBy}</span>
        </button>

        {groupBy === 'category' && (
          <button
            type="button"
            onClick={() => setShowAllCategories(!showAllCategories)}
            className={`px-1.5 py-1 text-[10px] font-mono rounded-xl transition-colors ${
              showAllCategories
                ? 'bg-amber-100 text-amber-900 font-bold'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
            title="Show all 6 categories or only active ones"
          >
            {showAllCategories ? 'All rows' : 'Active'}
          </button>
        )}

      </div>

    </div>
  );
};
