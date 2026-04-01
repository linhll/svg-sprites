import {
  makeCollectionLabel,
  selectFilteredIcons,
  selectScopedIcons,
} from '../../../iconLibrary/selectors'
import type { IconLibraryStore } from '../storeTypes'
import type { IconLibraryGet, IconLibrarySet } from './storeActionTypes'

export function bindSelectionActions(
  set: IconLibrarySet,
  get: IconLibraryGet,
): Pick<
  IconLibraryStore,
  'toggleSelect' | 'selectAllVisible' | 'clearSelection'
> {
  return {
    toggleSelect: (id) => {
      const { selectedIds } = get()
      const next = new Set(selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      set({ selectedIds: next })
    },

    selectAllVisible: () => {
      const { icons, collections, activeFilter, filterDraft } = get()
      const label = makeCollectionLabel(collections)
      const scoped = selectScopedIcons(icons, activeFilter)
      const filtered = selectFilteredIcons(scoped, filterDraft, label)
      set({ selectedIds: new Set(filtered.map((i) => i.id)) })
    },

    clearSelection: () => set({ selectedIds: new Set() }),
  }
}
