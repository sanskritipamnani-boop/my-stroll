import type { Entry } from '../types';

export const START_HOUR = 7; // 7 AM
export const END_HOUR = 23; // 11 PM
export const TOTAL_HOURS = END_HOUR - START_HOUR;
export const HOUR_HEIGHT = 84; // px per hour for generous editorial spacing

export const HOURS_LIST = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return START_HOUR * 60;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (isNaN(hours) ? START_HOUR : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
}

export function formatMinutesToTime(totalMinutes: number): string {
  const clamped = Math.max(START_HOUR * 60, Math.min(END_HOUR * 60, totalMinutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function minutesToPixels(minutes: number): number {
  const startMinutes = START_HOUR * 60;
  const clampedMinutes = Math.max(startMinutes, Math.min(END_HOUR * 60, minutes));
  const diffHours = (clampedMinutes - startMinutes) / 60;
  return diffHours * HOUR_HEIGHT;
}

export function shiftEntryTime(entry: Entry, newDate: string, newStartTime: string): Entry {
  const oldStartMinutes = timeToMinutes(entry.startTime);
  let newEndTime: string | undefined = undefined;

  if (entry.endTime) {
    const oldEndMinutes = timeToMinutes(entry.endTime);
    const duration = Math.max(15, oldEndMinutes - oldStartMinutes);
    const newStartMinutes = timeToMinutes(newStartTime);
    const newEndMinutes = Math.min(END_HOUR * 60, newStartMinutes + duration);
    newEndTime = formatMinutesToTime(newEndMinutes);
  }

  return {
    ...entry,
    date: newDate,
    startTime: newStartTime,
    endTime: newEndTime,
    updatedAt: new Date().toISOString(),
  };
}

export interface PositionedEntry {
  entry: Entry;
  top: number;
  height: number;
  colIndex: number;
  totalCols: number;
}

export function layoutDayEntries(entries: Entry[]): PositionedEntry[] {
  if (!entries || entries.length === 0) return [];

  // Sort by start time, then duration descending
  const sorted = [...entries].sort((a, b) => {
    const aStart = timeToMinutes(a.startTime);
    const bStart = timeToMinutes(b.startTime);
    if (aStart !== bStart) return aStart - bStart;
    const aEnd = a.endTime ? timeToMinutes(a.endTime) : aStart + 45;
    const bEnd = b.endTime ? timeToMinutes(b.endTime) : bStart + 45;
    return (bEnd - bStart) - (aEnd - aStart);
  });

  // Calculate raw top and height
  const items = sorted.map((entry) => {
    const startMins = timeToMinutes(entry.startTime);
    const endMins = entry.endTime ? timeToMinutes(entry.endTime) : startMins + 45; // Default 45m
    const durationMins = Math.max(35, endMins - startMins);
    
    const top = minutesToPixels(startMins);
    const height = Math.max(68, (durationMins / 60) * HOUR_HEIGHT - 6); // slight margin

    return {
      entry,
      startMins,
      endMins,
      top,
      height,
      colIndex: 0,
      totalCols: 1,
    };
  });

  // Group overlapping entries into clusters
  const clusters: typeof items[] = [];
  let currentCluster: typeof items = [];
  let clusterEnd = -1;

  for (const item of items) {
    if (currentCluster.length === 0) {
      currentCluster.push(item);
      clusterEnd = item.endMins;
    } else {
      if (item.startMins < clusterEnd) {
        // Overlaps with current cluster
        currentCluster.push(item);
        clusterEnd = Math.max(clusterEnd, item.endMins);
      } else {
        // New cluster
        clusters.push(currentCluster);
        currentCluster = [item];
        clusterEnd = item.endMins;
      }
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // Assign columns within each cluster
  const result: PositionedEntry[] = [];

  for (const cluster of clusters) {
    const columns: typeof items[] = [];

    for (const item of cluster) {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const lastInCol = columns[i][columns[i].length - 1];
        if (lastInCol.endMins <= item.startMins) {
          columns[i].push(item);
          item.colIndex = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([item]);
        item.colIndex = columns.length - 1;
      }
    }

    const totalCols = columns.length;
    for (const item of cluster) {
      item.totalCols = totalCols;
      result.push({
        entry: item.entry,
        top: item.top,
        height: item.height,
        colIndex: item.colIndex,
        totalCols: item.totalCols,
      });
    }
  }

  return result;
}

export function getCurrentTimePosition(): number | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = START_HOUR * 60;
  const endMinutes = END_HOUR * 60;

  if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
    return null;
  }

  return minutesToPixels(currentMinutes);
}
