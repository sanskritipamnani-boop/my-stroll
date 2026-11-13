import { getDemoEntries } from '../data/sampleEntries';
import type { Entry } from '../types';

const STORAGE_KEY = 'stroll_exploration_entries_v3';

export function loadStoredEntries(): Entry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const demo = getDemoEntries();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      return demo;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getDemoEntries();
  } catch (err) {
    console.error('Failed to load entries from localStorage', err);
    return getDemoEntries();
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
  const freshDemo = getDemoEntries();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshDemo));
  } catch (err) {
    console.error('Failed to load demo entries', err);
  }
  return freshDemo;
}
