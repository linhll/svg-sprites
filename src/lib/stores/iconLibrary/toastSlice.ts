import type { StateCreator } from 'zustand'
import { bindToastActions } from './actions/toastActions'
import type { IconLibraryStore } from './storeTypes'

export const createToastSlice: StateCreator<
  IconLibraryStore,
  [],
  [],
  Pick<IconLibraryStore, 'message' | 'showToast' | 'dismissToast'>
> = (set) => ({
  message: null,
  ...bindToastActions(set),
})
