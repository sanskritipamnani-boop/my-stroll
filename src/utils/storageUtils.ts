import { getDemoEntries } from '../data/sampleEntries';
import type { Entry } from '../types';

const STORAGE_KEYS = [
  'stroll_exploration_entries_v2',
  'stroll_exploration_entries_v3',
  'stroll_exploration_entries',
  'exploration_calendar_entries',
];

const PRIMARY_KEY = 'stroll_exploration_entries_v2';

export function loadStoredEntries(): Entry[] {
  try {
    for (const key of STORAGE_KEYS) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // continue
        }
      }
    }
    return [];
  } catch (err) {
    console.error('Failed to load entries from localStorage', err);
    return [];
  }
}

export function saveStoredEntries(entries: Entry[]): void {
  try {
    const serialized = JSON.stringify(entries);
    // Save to primary key and mirror to other keys to protect user data
    localStorage.setItem(PRIMARY_KEY, serialized);
    localStorage.setItem('stroll_exploration_entries_v3', serialized);
  } catch (err) {
    console.error('Failed to save entries to localStorage', err);
  }
}

export function clearAllEntries(): Entry[] {
  try {
    for (const key of STORAGE_KEYS) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  } catch (err) {
    console.error('Failed to clear entries', err);
  }
  return [];
}

export function loadDemoSampleEntries(): Entry[] {
  const freshDemo = getDemoEntries();
  try {
    const serialized = JSON.stringify(freshDemo);
    for (const key of STORAGE_KEYS) {
      localStorage.setItem(key, serialized);
    }
  } catch (err) {
    console.error('Failed to load demo entries', err);
  }
  return freshDemo;
}
