import React from 'react';
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal, Compass, Sparkles, Trash2 } from 'lucide-react';
import type { ViewMode } from '../../types';
import { Button } from '../ui/Button';

interface TopHeaderProps {
  currentDate: Date;
  dateRangeText: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenAddEntry: () => void;
  onToggleFilters: () => void;
  isFilterOpen: boolean;
  activeFilterCount: number;
  totalEntriesCount: number;
  onClearAll: () => void;
  onLoadDemoSample: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  dateRangeText,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  onOpenAddEntry,
  onToggleFilters,
  isFilterOpen,
  activeFilterCount,
  totalEntriesCount,
  onClearAll,
  onLoadDemoSample,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 text-amber-300 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-stone-900 serif-title">
                  My Stroll
                </h1>
                <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-stone-200/70 text-stone-600 font-semibold tracking-wide">
                  Curiosity Map
                </span>
              </div>
              <p className="text-xs text-stone-500 font-normal hidden sm:block">
                {totalEntriesCount === 0 ? '0 discoveries recorded' : `${totalEntriesCount} discoveries recorded`}
              </p>
            </div>
          </div>

          {/* Load Sample / Clear All utility */}
          <div className="flex items-center gap-1">
            {totalEntriesCount === 0 ? (
              <button
                type="button"
                onClick={onLoadDemoSample}
                title="Load sample exploration entries"
                className="text-stone-500 hover:text-stone-900 px-2 py-1 rounded-lg hover:bg-stone-200/60 transition-colors text-xs flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden xl:inline text-[11px]">Load Sample</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClearAll}
                title="Remove all discoveries"
                className="text-stone-400 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors text-xs flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Date Range & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Previous */}
          <button
            type="button"
            onClick={onPrev}
            className="p-1.5 rounded-xl hover:bg-stone-200/60 text-stone-600 hover:text-stone-900 transition-colors"
            title="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Today */}
          <button
            type="button"
            onClick={onToday}
            className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700 hover:text-stone-900 hover:bg-white rounded-xl transition-colors border border-stone-200/70 bg-white/70 shadow-2xs"
          >
            Today
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={onNext}
            className="p-1.5 rounded-xl hover:bg-stone-200/60 text-stone-600 hover:text-stone-900 transition-colors"
            title="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Range text */}
          <div className="ml-2 font-mono text-xs sm:text-sm font-bold tracking-wider text-stone-800 uppercase px-3.5 py-1.5 rounded-xl bg-white/80 border border-stone-200/70 shadow-2xs">
            {dateRangeText}
          </div>
        </div>

        {/* Right: View Toggle, Filter & Add Entry */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* View Mode Toggle */}
          <div className="inline-flex p-1 rounded-2xl bg-stone-200/50 border border-stone-200/80">
            <button
              type="button"
              onClick={() => onViewModeChange('matrix')}
              className={`px-3.5 py-1 text-xs font-medium rounded-xl transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Wall
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('week')}
              className={`px-3.5 py-1 text-xs font-medium rounded-xl transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('month')}
              className={`px-3.5 py-1 text-xs font-medium rounded-xl transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Month
            </button>
          </div>

          {/* Filter Drawer Toggle */}
          <button
            type="button"
            onClick={onToggleFilters}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-2xl border transition-all ${
              isFilterOpen || activeFilterCount > 0
                ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200/80 hover:bg-stone-50 hover:border-stone-300 shadow-2xs'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                isFilterOpen ? 'bg-amber-400 text-stone-950' : 'bg-stone-900 text-white'
              }`}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Add Entry Button */}
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={onOpenAddEntry}
            className="rounded-2xl shadow-xs font-semibold px-4"
          >
            <span>Add Entry</span>
          </Button>
        </div>

      </div>
    </header>
  );
};
