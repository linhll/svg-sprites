import type {
  ActiveCollectionFilter,
  CollectionRecord,
  SvgIconRecord,
} from '../../../types'

export type ImportProgress =
  | {
      stage: 'reading'
      current: number
      total: number
      fileName: string
    }
  | { stage: 'saving' }

/** Full Zustand shape: state + actions (slices compose into this). */
export type IconLibraryStore = {
  icons: SvgIconRecord[]
  collections: CollectionRecord[]
  ready: boolean
  busy: boolean
  /** Shown during file/folder import (Import modal). */
  importProgress: ImportProgress | null
  message: string | null
  query: string
  filterDraft: string
  selectedIds: Set<string>
  activeFilter: ActiveCollectionFilter
  importTargetCollectionId: string | null
  importSymbolIdSuffix: string

  init: () => Promise<void>
  refresh: () => Promise<void>
  showToast: (text: string) => void
  dismissToast: () => void
  setFilterDraft: (q: string) => void
  commitFilterQuery: () => void
  setActiveFilter: (f: ActiveCollectionFilter) => void
  setImportTargetCollectionId: (id: string | null) => void
  setImportSymbolIdSuffix: (suffix: string) => void
  toggleSelect: (id: string) => void
  selectAllVisible: () => void
  clearSelection: () => void
  importFromFiles: (files: FileList | null) => Promise<boolean>
  importFromSvgTexts: (texts: string[]) => Promise<void>
  deleteIconById: (id: string) => Promise<void>
  deleteSelectedIcons: () => Promise<void>
  clearAllIcons: () => Promise<void>
  clearIconsInActiveCollection: () => Promise<void>
  exportSprite: () => void
  applySymbolId: (icon: SvgIconRecord, nextId: string) => Promise<void>
  addCollectionWithPrompt: () => Promise<void>
  renameCollection: (col: CollectionRecord, nextName: string) => Promise<void>
  deleteCollection: (col: CollectionRecord) => Promise<void>
  moveSelectedToCollection: (targetId: string) => Promise<void>
  syncUiAfterRefresh: () => void
}
