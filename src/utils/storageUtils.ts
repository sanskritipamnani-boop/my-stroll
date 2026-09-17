import { DEMO_ENTRIES } from '../data/sampleEntries';
import type { Entry } from '../types';

const STORAGE_KEY = 'stroll_exploration_entries_v2';

export function loadStoredEntries(): Entry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load entries from localStorage', err);
    return [];
  }
}

export function saveStoredEntries(entries: Entry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save entries to localStorage', err);
  }
}

export function clearAllEntries(): Entry[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to clear entries', err);
  }
  return [];
}

export function loadDemoSampleEntries(): Entry[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_ENTRIES));
  } catch (err) {
    console.error('Failed to load demo entries', err);
  }
  return DEMO_ENTRIES;
}
