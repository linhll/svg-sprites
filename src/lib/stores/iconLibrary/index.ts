import { create } from 'zustand'
import { createDataSlice } from './dataSlice'
import { createSelectionSlice } from './selectionSlice'
import { createToastSlice } from './toastSlice'
import type { IconLibraryStore } from './storeTypes'
import { createUiSlice } from './uiSlice'

export type { IconLibraryStore, ImportProgress } from './storeTypes'

export const useIconLibraryStore = create<IconLibraryStore>()(
  (...args) => ({
    ...createToastSlice(...args),
    ...createUiSlice(...args),
    ...createSelectionSlice(...args),
    ...createDataSlice(...args),
  }),
)
