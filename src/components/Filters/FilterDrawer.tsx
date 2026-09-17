import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, RotateCcw, Filter, Check } from 'lucide-react';
import type { CategoryId, FilterState, Entry } from '../../types';
import { CATEGORY_LIST } from '../../data/categories';
import { Chip } from '../ui/Chip';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  entries: Entry[];
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  entries,
}) => {
  // Extract all unique tags from current entries and sort alphabetically
  const availableTags = React.useMemo(() => {
    const tagCountMap: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.tags) {
        for (const tag of entry.tags) {
          tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
        }
      }
    }
    return Object.entries(tagCountMap)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [entries]);

  // Count entries per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      counts[entry.category] = (counts[entry.category] || 0) + 1;
    }
    return counts;
  }, [entries]);

  const handleToggleCategory = (catId: CategoryId) => {
    const exists = filters.selectedCategories.includes(catId);
    let updated: CategoryId[];
    if (exists) {
      updated = filters.selectedCategories.filter((id) => id !== catId);
    } else {
      updated = [...filters.selectedCategories, catId];
    }
    onFilterChange({ ...filters, selectedCategories: updated });
  };

  const handleSelectAllCategories = () => {
    onFilterChange({ ...filters, selectedCategories: [] });
  };

  const handleToggleTag = (tag: string) => {
    const exists = filters.selectedTags.includes(tag);
    let updated: string[];
    if (exists) {
      updated = filters.selectedTags.filter((t) => t !== tag);
    } else {
      updated = [...filters.selectedTags, tag];
    }
    onFilterChange({ ...filters, selectedTags: updated });
  };

  const handleClearAll = () => {
    onFilterChange({
      searchQuery: '',
      selectedCategories: [],
      selectedTags: [],
    });
  };

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.selectedCategories.length > 0 ||
    filters.selectedTags.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay for small screens */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-2xs z-40 lg:hidden"
          />

          {/* Right Sliding Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 bg-[#FCFBF8] border-l border-stone-200/90 shadow-xl z-50 flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-stone-200/70 flex items-center justify-between bg-white/60">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-semibold tracking-wide text-stone-900 uppercase font-mono">
                  Filter Curiosity
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[11px] font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-stone-200/50 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1">
              
              {/* Search Bar */}
              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  Search Topics & Notes
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                    placeholder="Type words, themes, names..."
                    className="w-full pl-8 pr-8 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all font-medium"
                  />
                  {filters.searchQuery && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400">
                    Categories
                  </label>
                  {filters.selectedCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllCategories}
                      className="text-[10px] text-stone-500 hover:text-stone-900 underline"
                    >
                      Reset Categories
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {/* All option */}
                  <button
                    type="button"
                    onClick={handleSelectAllCategories}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                      filters.selectedCategories.length === 0
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs font-semibold'
                        : 'bg-white text-stone-700 border-stone-200/80 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✨</span>
                      <span>All Categories</span>
                    </div>
                    {filters.selectedCategories.length === 0 && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>

                  {/* Individual Categories */}
                  {CATEGORY_LIST.map((cat) => {
                    const isSelected = filters.selectedCategories.includes(cat.id);
                    const count = categoryCounts[cat.id] || 0;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                          isSelected
                            ? `${cat.color.badgeBg} ${cat.color.text} border-current ring-1 ring-current font-semibold shadow-2xs`
                            : `${cat.color.bg} ${cat.color.text} ${cat.color.border} hover:brightness-95 opacity-90 hover:opacity-100`
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="text-sm shrink-0">{cat.icon}</span>
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/10 text-current">
                            {count}
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-current" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags Cloud */}
              {availableTags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400">
                      Explore by Tags
                    </label>
                    {filters.selectedTags.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onFilterChange({ ...filters, selectedTags: [] })}
                        className="text-[10px] text-stone-500 hover:text-stone-900 underline"
                      >
                        Reset Tags
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map(({ tag, count }) => {
                      const isSelected = filters.selectedTags.includes(tag);
                      return (
                        <Chip
                          key={tag}
                          label={`#${tag}`}
                          size="sm"
                          selected={isSelected}
                          badge={count}
                          onClick={() => handleToggleTag(tag)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-stone-200/70 bg-white/70 flex items-center justify-between text-xs text-stone-500">
              <span>Immediate live filtering</span>
              <button
                type="button"
                onClick={onClose}
                className="font-medium text-stone-900 hover:underline"
              >
                Done
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
