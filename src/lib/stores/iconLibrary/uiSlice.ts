import type { StateCreator } from 'zustand'
import { ALL_COLLECTIONS } from '../../../types'
import { bindUiActions } from './actions/uiActions'
import type { IconLibraryStore } from './storeTypes'

export const createUiSlice: StateCreator<
  IconLibraryStore,
  [],
  [],
  Pick<
    IconLibraryStore,
    | 'query'
    | 'filterDraft'
    | 'activeFilter'
    | 'importTargetCollectionId'
    | 'importSymbolIdSuffix'
    | 'setFilterDraft'
    | 'commitFilterQuery'
    | 'setActiveFilter'
    | 'setImportTargetCollectionId'
    | 'setImportSymbolIdSuffix'
    | 'syncUiAfterRefresh'
  >
> = (set, get) => ({
  query: '',
  filterDraft: '',
  activeFilter: ALL_COLLECTIONS,
  importTargetCollectionId: null,
  importSymbolIdSuffix: '',
  ...bindUiActions(set, get),
})
