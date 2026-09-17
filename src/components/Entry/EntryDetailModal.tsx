import React, { useState } from 'react';
import type { Entry } from '../../types';
import { getCategory } from '../../data/categories';
import { formatTimeRange, formatDateFull } from '../../utils/dateUtils';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ExternalLink, Edit3, Trash2, Calendar, Clock, Tag } from 'lucide-react';

interface EntryDetailModalProps {
  entry: Entry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!entry) return null;

  const category = getCategory(entry.category);
  const formattedDate = formatDateFull(entry.date);
  const formattedTime = formatTimeRange(entry.startTime, entry.endTime);

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(entry.id);
      setConfirmDelete(false);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmDelete(false);
        onClose();
      }}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        
        {/* Top Category Badge & Time */}
        <div className="flex items-center justify-between gap-3">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${category.color.badgeBg} ${category.color.badgeText} border ${category.color.border}`}
          >
            <span className="text-base">{category.icon}</span>
            <span>{category.name}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 serif-title leading-snug">
            {entry.title}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1 font-mono">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Visual / Screenshot (if any) */}
        {entry.image && (
          <div className="rounded-xl overflow-hidden border border-stone-200 shadow-2xs max-h-72 bg-stone-100">
            <img
              src={entry.image}
              alt={entry.title}
              className="w-full h-full object-cover max-h-72"
            />
          </div>
        )}

        {/* Description / Thought */}
        {entry.description ? (
          <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/60">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold block mb-1.5">
              EXPLORATION NOTES
            </span>
            <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
              {entry.description}
            </p>
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic">No notes attached to this exploration.</p>
        )}

        {/* Reference Links */}
        {entry.url && (
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold block mb-1.5">
              REFERENCE LINK
            </span>
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:border-stone-400 px-3 py-2 rounded-xl transition-colors group shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900" />
              <span className="truncate max-w-sm">{entry.url}</span>
            </a>
          </div>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold block mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-stone-400" />
              <span>TAGS</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200/60 text-stone-700 text-xs font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions: Edit, Delete, Close */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={handleDelete}
            >
              {confirmDelete ? 'Confirm Delete?' : 'Delete'}
            </Button>
            {confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-stone-500 hover:text-stone-800 underline ml-1"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => {
                onEdit(entry);
                onClose();
              }}
            >
              Edit
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
