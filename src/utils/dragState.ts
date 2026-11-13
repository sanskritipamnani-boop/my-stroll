export interface DraggedWallEntryPayload {
  entryId: string;
  oldDate: string;
  oldCategory: string;
}

export let activeDraggedWallEntry: DraggedWallEntryPayload | null = null;

export function setActiveDraggedWallEntry(payload: DraggedWallEntryPayload | null) {
  activeDraggedWallEntry = payload;
}
