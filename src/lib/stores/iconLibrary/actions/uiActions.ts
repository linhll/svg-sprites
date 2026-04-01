import { ALL_COLLECTIONS } from '../../../../types'
import type { IconLibraryStore } from '../storeTypes'
import type { IconLibraryGet, IconLibrarySet } from './storeActionTypes'

const FILTER_QUERY_DEBOUNCE_MS = 220

let filterQueryCommitTimer: ReturnType<typeof setTimeout> | null = null

function scheduleDebouncedQueryCommit(
  set: IconLibrarySet,
  get: IconLibraryGet,
) {
  if (filterQueryCommitTimer) clearTimeout(filterQueryCommitTimer)
  filterQueryCommitTimer = setTimeout(() => {
    filterQueryCommitTimer = null
    set({ query: get().filterDraft })
  }, FILTER_QUERY_DEBOUNCE_MS)
}

function commitFilterQueryNow(set: IconLibrarySet, get: IconLibraryGet) {
  if (filterQueryCommitTimer) clearTimeout(filterQueryCommitTimer)
  filterQueryCommitTimer = null
  set({ query: get().filterDraft })
}

export function bindUiActions(
  set: IconLibrarySet,
  get: IconLibraryGet,
): Pick<
  IconLibraryStore,
  | 'setFilterDraft'
  | 'commitFilterQuery'
  | 'setActiveFilter'
  | 'setImportTargetCollectionId'
  | 'setImportSymbolIdSuffix'
  | 'syncUiAfterRefresh'
> {
  return {
    setFilterDraft: (q) => {
      set({ filterDraft: q })
      scheduleDebouncedQueryCommit(set, get)
    },

    commitFilterQuery: () => commitFilterQueryNow(set, get),

    setActiveFilter: (f) => {
      set({
        activeFilter: f,
        ...(f !== ALL_COLLECTIONS ? { importTargetCollectionId: f } : {}),
      })
    },

    setImportTargetCollectionId: (id) =>
      set({ importTargetCollectionId: id }),

    setImportSymbolIdSuffix: (suffix) =>
      set({ importSymbolIdSuffix: suffix }),

    syncUiAfterRefresh: () => {
      const { collections, activeFilter, importTargetCollectionId } = get()
      let nextImport = importTargetCollectionId
      if (nextImport == null && collections.length > 0) {
        nextImport = collections[0].id
      }
      let nextFilter = activeFilter
      if (
        activeFilter !== ALL_COLLECTIONS &&
        collections.length > 0 &&
        !collections.some((c) => c.id === activeFilter)
      ) {
        nextFilter = ALL_COLLECTIONS
      }
      const patch: Partial<
        Pick<
          IconLibraryStore,
          'importTargetCollectionId' | 'activeFilter'
        >
      > = {}
      if (nextImport !== importTargetCollectionId) {
        patch.importTargetCollectionId = nextImport
      }
      if (nextFilter !== activeFilter) {
        patch.activeFilter = nextFilter
      }
      if (Object.keys(patch).length > 0) set(patch)
    },
  }
}
