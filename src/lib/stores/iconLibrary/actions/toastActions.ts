import type { IconLibraryStore } from '../storeTypes'
import type { IconLibrarySet } from './storeActionTypes'

const TOAST_DURATION_MS = 3200

export function bindToastActions(
  set: IconLibrarySet,
): Pick<IconLibraryStore, 'showToast' | 'dismissToast'> {
  return {
    showToast: (text: string) => {
      set({ message: text })
      window.setTimeout(() => set({ message: null }), TOAST_DURATION_MS)
    },

    dismissToast: () => set({ message: null }),
  }
}
