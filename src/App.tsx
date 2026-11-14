import { useState, useEffect, useMemo } from 'react';
import type { Entry, ViewMode, FilterState, CategoryId } from './types';
import { loadStoredEntries, saveStoredEntries, clearAllEntries, loadDemoSampleEntries } from './utils/storageUtils';
import { formatHeaderDateRange, addWeeks, addMonths, formatDateIso } from './utils/dateUtils';
import { shiftEntryTime } from './utils/calendarUtils';
import { TopHeader } from './components/Header/TopHeader';
import { MatrixView } from './components/Calendar/MatrixView';
import { WeekView } from './components/Calendar/WeekView';
import { MonthView } from './components/Calendar/MonthView';
import { EntryModal } from './components/Entry/EntryModal';
import { EntryDetailModal } from './components/Entry/EntryDetailModal';
import { FilterDrawer } from './components/Filters/FilterDrawer';
import { Sparkles, Info } from 'lucide-react';

export function App() {
  // Center dynamically on the current date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  // Default to the new Wall / Matrix view layout
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [entries, setEntries] = useState<Entry[]>(() => loadStoredEntries());

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    selectedTags: [],
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [slotQuickAdd, setSlotQuickAdd] = useState<{ dateStr: string; hour: number } | null>(null);
  const [presetAdd, setPresetAdd] = useState<{ dateStr?: string; categoryId?: CategoryId } | null>(null);
  const [inspectingEntry, setInspectingEntry] = useState<Entry | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  // Sync entries to LocalStorage
  useEffect(() => {
    saveStoredEntries(entries);
  }, [entries]);

  // Compute active filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Category filter
      if (
        filters.selectedCategories.length > 0 &&
        !filters.selectedCategories.includes(entry.category)
      ) {
        return false;
      }

      // 2. Tag filter
      if (filters.selectedTags.length > 0) {
        if (!entry.tags || !entry.tags.some((t) => filters.selectedTags.includes(t))) {
          return false;
        }
      }

      // 3. Search query
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase();
        const titleMatch = entry.title.toLowerCase().includes(q);
        const descMatch = entry.description?.toLowerCase().includes(q) || false;
        const tagMatch = entry.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        const urlMatch = entry.url?.toLowerCase().includes(q) || false;
        if (!titleMatch && !descMatch && !tagMatch && !urlMatch) {
          return false;
        }
      }

      return true;
    });
  }, [entries, filters]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    count += filters.selectedCategories.length;
    count += filters.selectedTags.length;
    return count;
  }, [filters]);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => addWeeks(prev, -1));
    } else {
      setCurrentDate((prev) => addMonths(prev, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => addMonths(prev, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // CRUD Handlers
  const handleSaveEntry = (entryData: Omit<Entry, 'id' | 'createdAt'> & { id?: string }) => {
    if (entryData.id) {
      // Edit existing
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryData.id
            ? {
                ...e,
                ...entryData,
                updatedAt: new Date().toISOString(),
              }
            : e
        )
      );
    } else {
      // Create new
      const newEntry: Entry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: entryData.title,
        category: entryData.category,
        date: entryData.date,
        startTime: entryData.startTime,
        endTime: entryData.endTime,
        description: entryData.description,
        url: entryData.url,
        image: entryData.image,
        tags: entryData.tags,
        createdAt: new Date().toISOString(),
      };
      setEntries((prev) => [newEntry, ...prev]);
    }
    setEditingEntry(null);
    setSlotQuickAdd(null);
    setPresetAdd(null);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (inspectingEntry?.id === id) {
      setInspectingEntry(null);
    }
  };

  // Drag and Drop rescheduling handler for Week view
  const handleMoveEntry = (entryId: string, targetDate: string, targetStartTime: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === entryId) {
          return shiftEntryTime(entry, targetDate, targetStartTime);
        }
        return entry;
      })
    );
  };

  // Drag and Drop handler for Matrix Wall view (moving date & category)
  const handleMoveMatrixEntry = (
    entryId: string,
    targetDate: string,
    targetCategory?: CategoryId
  ) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === entryId) {
          return {
            ...entry,
            date: targetDate,
            category: targetCategory || entry.category,
            updatedAt: new Date().toISOString(),
          };
        }
        return entry;
      })
    );
  };

  const handleClearAll = () => {
    if (window.confirm('Remove all discoveries and reset to an empty calendar?')) {
      const empty = clearAllEntries();
      setEntries(empty);
    }
  };

  const handleLoadDemoSample = () => {
    const demo = loadDemoSampleEntries();
    setEntries(demo);
    setCurrentDate(new Date());
  };

  // Quick slot click in week calendar
  const handleSlotClick = (dateStr: string, timeHour: number) => {
    setEditingEntry(null);
    setPresetAdd(null);
    setSlotQuickAdd({ dateStr, hour: timeHour });
    setIsAddModalOpen(true);
  };

  // Quick add from Matrix Wall view
  const handleMatrixQuickAdd = (presetDate?: string, presetCategory?: CategoryId) => {
    setEditingEntry(null);
    setSlotQuickAdd(null);
    setPresetAdd({ dateStr: presetDate, categoryId: presetCategory });
    setIsAddModalOpen(true);
  };

  // Month date selection jumps to week
  const handleMonthDateSelect = (date: Date) => {
    setCurrentDate(date);
    setViewMode('week');
  };

  // Matrix Date Range for top header
  const matrixDateRange = useMemo(() => {
    if (filteredEntries.length === 0) return undefined;
    const sortedDates = Array.from(new Set(filteredEntries.map((e) => e.date))).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    if (sortedDates.length === 0) return undefined;
    return {
      start: sortedDates[0],
      end: sortedDates[sortedDates.length - 1],
      count: sortedDates.length,
    };
  }, [filteredEntries]);

  const headerDateRange = formatHeaderDateRange(currentDate, viewMode, matrixDateRange);

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-stone-800 flex flex-col font-sans">
      
      {/* Top Header */}
      <TopHeader
        currentDate={currentDate}
        dateRangeText={headerDateRange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onOpenAddEntry={() => {
          setEditingEntry(null);
          setSlotQuickAdd(null);
          setPresetAdd(null);
          setIsAddModalOpen(true);
        }}
        onToggleFilters={() => setIsFilterOpen(!isFilterOpen)}
        isFilterOpen={isFilterOpen}
        activeFilterCount={activeFilterCount}
        totalEntriesCount={entries.length}
        onClearAll={handleClearAll}
        onLoadDemoSample={handleLoadDemoSample}
      />

      {/* Main Calendar Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col">
        
        {/* Active Filter Notification Pill (if filtering) */}
        {activeFilterCount > 0 && (
          <div className="mb-3 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>
                Showing <strong>{filteredEntries.length}</strong> of {entries.length} explorations matching your filters
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  selectedCategories: [],
                  selectedTags: [],
                })
              }
              className="font-semibold underline hover:text-amber-950"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* View Component */}
        <div className="flex-1">
          {viewMode === 'matrix' ? (
            <MatrixView
              entries={filteredEntries}
              onSelectEntry={(entry) => setInspectingEntry(entry)}
              onOpenAddEntry={handleMatrixQuickAdd}
              onMoveEntry={handleMoveMatrixEntry}
              onLoadDemoSample={handleLoadDemoSample}
            />
          ) : viewMode === 'week' ? (
            <WeekView
              currentDate={currentDate}
              entries={filteredEntries}
              onSelectEntry={(entry) => setInspectingEntry(entry)}
              onSlotClick={handleSlotClick}
              onOpenAddEntry={() => {
                setEditingEntry(null);
                setSlotQuickAdd(null);
                setPresetAdd(null);
                setIsAddModalOpen(true);
              }}
              onMoveEntry={handleMoveEntry}
            />
          ) : (
            <MonthView
              currentDate={currentDate}
              entries={filteredEntries}
              onSelectDate={handleMonthDateSelect}
              onSelectEntry={(entry) => setInspectingEntry(entry)}
            />
          )}
        </div>

        {/* Footer Editorial Subtext */}
        <footer className="mt-4 pt-3 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5" />
            <span>
              {viewMode === 'matrix'
                ? 'Timeline Wall: Dates are sorted horizontally, topics vertically. Click cards to view, drag to move.'
                : 'Click any slot to add. Drag & drop cards anywhere to reschedule.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="serif-title italic">Personal Map of Curiosity</span>
            <span>•</span>
            <span className="font-mono">{entries.length} discoveries</span>
          </div>
        </footer>

      </main>

      {/* Add / Edit Entry Modal */}
      <EntryModal
        isOpen={isAddModalOpen || editingEntry !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEntry(null);
          setSlotQuickAdd(null);
          setPresetAdd(null);
        }}
        onSave={handleSaveEntry}
        initialDate={presetAdd?.dateStr || slotQuickAdd?.dateStr || formatDateIso(currentDate)}
        initialHour={slotQuickAdd?.hour}
        initialCategory={presetAdd?.categoryId}
        editingEntry={editingEntry}
      />

      {/* Entry Detail Inspection Modal */}
      <EntryDetailModal
        entry={inspectingEntry}
        isOpen={inspectingEntry !== null}
        onClose={() => setInspectingEntry(null)}
        onEdit={(entry) => {
          setEditingEntry(entry);
        }}
        onDelete={handleDeleteEntry}
      />

      {/* Right Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        entries={entries}
      />

    </div>
  );
}

export default App;
