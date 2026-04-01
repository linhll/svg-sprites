import type { StateCreator } from 'zustand'
import { bindSelectionActions } from './actions/selectionActions'
import type { IconLibraryStore } from './storeTypes'

export const createSelectionSlice: StateCreator<
  IconLibraryStore,
  [],
  [],
  Pick<
    IconLibraryStore,
    'selectedIds' | 'toggleSelect' | 'selectAllVisible' | 'clearSelection'
  >
> = (set, get) => ({
  selectedIds: new Set(),
  ...bindSelectionActions(set, get),
})
