import React, { useState, useEffect } from 'react';
import type { Entry, CategoryId } from '../../types';
import { CATEGORY_LIST, getCategory } from '../../data/categories';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Sparkles, Image as ImageIcon, Link as LinkIcon, Calendar, Clock, Tag, X } from 'lucide-react';
import { formatDateIso } from '../../utils/dateUtils';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<Entry, 'id' | 'createdAt'> & { id?: string }) => void;
  initialDate?: string;
  initialHour?: number;
  initialCategory?: CategoryId;
  editingEntry?: Entry | null;
}

const PRESET_IMAGES = [
  { label: 'Architecture', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Editorial Print', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80' },
  { label: 'Abstract Wave', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
  { label: 'Warm Gallery', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80' },
];

const SUGGESTED_TAGS = [
  'ux', 'visual-design', 'interaction', 'editorial', 'typography', 
  'product', 'research', 'spatial', 'prototype', 'local-first', 'materials'
];

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialHour,
  initialCategory,
  editingEntry,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>(initialCategory || 'visual-references');
  const [date, setDate] = useState(initialDate || formatDateIso(new Date()));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [hasDuration, setHasDuration] = useState(true);
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showImagePresets, setShowImagePresets] = useState(false);

  // Sync state when modal opens or editingEntry changes
  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title);
      setCategory(editingEntry.category);
      setDate(editingEntry.date);
      setStartTime(editingEntry.startTime);
      if (editingEntry.endTime) {
        setEndTime(editingEntry.endTime);
        setHasDuration(true);
      } else {
        setEndTime('');
        setHasDuration(false);
      }
      setDescription(editingEntry.description || '');
      setUrl(editingEntry.url || '');
      setImage(editingEntry.image || '');
      setTags(editingEntry.tags || []);
    } else {
      // Reset for new entry
      setTitle('');
      setCategory(initialCategory || 'visual-references');
      const baseDate = initialDate || formatDateIso(new Date());
      setDate(baseDate);

      const hourNum = initialHour !== undefined ? initialHour : 10;
      const formattedHour = String(hourNum).padStart(2, '0');
      const endHourNum = Math.min(23, hourNum + 1);
      const formattedEndHour = String(endHourNum).padStart(2, '0');

      setStartTime(`${formattedHour}:00`);
      setEndTime(`${formattedEndHour}:00`);
      setHasDuration(true);
      setDescription('');
      setUrl('');
      setImage('');
      setTags([]);
      setTagInput('');
    }
  }, [isOpen, editingEntry, initialDate, initialHour]);

  const handleAddTag = (tagToAdd: string) => {
    const cleaned = tagToAdd.trim().toLowerCase().replace(/^[#]/, '');
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: editingEntry ? editingEntry.id : undefined,
      title: title.trim(),
      category,
      date,
      startTime,
      endTime: hasDuration && endTime ? endTime : undefined,
      description: description.trim() || undefined,
      url: url.trim() || undefined,
      image: image.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    onClose();
  };

  const activeCategoryObj = getCategory(category);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEntry ? 'Edit Exploration' : 'Capture Discovery'}
      subtitle="Record a thought, reference, observation, or idea to your curiosity timeline."
      maxWidth="max-w-4xl xl:max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Landscape Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ================= LEFT COLUMN: DATE, TIME, CATEGORY, LINK, IMAGE ================= */}
          <div className="md:col-span-5 space-y-5 border-b md:border-b-0 md:border-r border-stone-200/70 pb-6 md:pb-0 md:pr-6">
            
            {/* 1. Date & Time Block */}
            <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-stone-200/70 space-y-3">
              {/* Date */}
              <div>
                <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 font-mono text-xs focus:outline-none focus:border-stone-800 shadow-2xs"
                />
              </div>

              {/* Start & End Time in 2 cols */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Start Time */}
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>Start Time</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 font-mono text-xs focus:outline-none focus:border-stone-800 shadow-2xs"
                  />
                </div>

                {/* End Time */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>End Time</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setHasDuration(!hasDuration)}
                      className="text-[9px] text-stone-400 hover:text-stone-700 underline"
                    >
                      {hasDuration ? 'Compact' : '+ Duration'}
                    </button>
                  </div>
                  {hasDuration ? (
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 font-mono text-xs focus:outline-none focus:border-stone-800 shadow-2xs"
                    />
                  ) : (
                    <div className="px-2 py-1.5 rounded-xl border border-stone-200/50 bg-stone-100/60 text-stone-400 text-[10px] italic">
                      Single thought
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Category Chips */}
            <div>
              <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 mb-2">
                Category <span className="text-amber-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORY_LIST.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    icon={<span className="text-xs">{cat.icon}</span>}
                    category={cat}
                    size="sm"
                    selected={category === cat.id}
                    onClick={() => setCategory(cat.id)}
                    className="w-full justify-start text-[11px]"
                  />
                ))}
              </div>
              <p className="text-[10px] text-stone-400 mt-1.5 italic">
                {activeCategoryObj.description}
              </p>
            </div>

            {/* 3. Reference Link */}
            <div>
              <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-stone-400" />
                <span>Reference Link (Optional)</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50/40 text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:border-stone-800 font-mono"
              />
            </div>

            {/* 4. Image / Visual URL & Presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-stone-400" />
                  <span>Image / Visual (Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowImagePresets(!showImagePresets)}
                  className="text-[10px] text-amber-700 hover:text-amber-800 font-medium flex items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Presets</span>
                </button>
              </div>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50/40 text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:border-stone-800 font-mono"
              />

              {/* Image Presets Picker */}
              {showImagePresets && (
                <div className="mt-2 p-2.5 bg-stone-100/70 rounded-2xl border border-stone-200/60">
                  <div className="text-[9px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    Choose a mood preset:
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setImage(preset.url);
                          setShowImagePresets(false);
                        }}
                        className="group relative rounded-lg overflow-hidden border border-stone-300/80 aspect-video focus:ring-2 focus:ring-stone-900"
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[8px] text-white font-medium px-0.5 text-center opacity-90 group-hover:opacity-100">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ================= RIGHT COLUMN: TITLE, NOTES / THINKING, KEYWORDS ================= */}
          <div className="md:col-span-7 space-y-5 flex flex-col justify-between h-full">
            
            {/* 1. Title / Essence */}
            <div>
              <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Title / Essence <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Why job cards feel overwhelming..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/40 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all text-xs font-medium"
              />
            </div>

            {/* 2. Exploration Notes / Thinking */}
            <div className="flex-1 flex flex-col">
              <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Exploration Notes / Thinking
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What triggered this thought? What nuance, interaction flow, or design pattern stood out?..."
                className="w-full flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/40 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-800 transition-all text-xs leading-relaxed min-h-[140px]"
              />
            </div>

            {/* 3. Keywords & Tags */}
            <div className="pt-2">
              <label className="block text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-stone-400" />
                <span>Keywords & Tags</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="Type keyword and press Enter (e.g. typography)..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50/40 text-stone-900 placeholder:text-stone-400 text-xs focus:outline-none focus:border-stone-800"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddTag(tagInput)}
                  className="text-xs px-3 py-1.5"
                >
                  Add
                </Button>
              </div>

              {/* Active Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-200/70 text-stone-800 text-[11px] font-mono"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-stone-400 hover:text-stone-700 ml-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Tags */}
              <div className="flex flex-wrap items-center gap-1 mt-1.5 text-[10px] text-stone-400">
                <span>Suggestions:</span>
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 6).map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => handleAddTag(suggested)}
                    className="text-stone-500 hover:text-stone-900 underline decoration-stone-300 hover:decoration-stone-600"
                  >
                    #{suggested}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="px-5 py-2 text-xs font-semibold rounded-xl">
            {editingEntry ? 'Save Changes' : 'Add to Stroll'}
          </Button>
        </div>

      </form>
    </Modal>
  );
};
