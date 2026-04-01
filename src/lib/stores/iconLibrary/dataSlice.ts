import type { StateCreator } from 'zustand'
import {
  clearIcons,
  clearIconsInCollection,
  deleteCollectionAndReassign,
  deleteIcon,
  deleteIcons,
  ensureDefaultCollection,
  getAllCollections,
  getAllIcons,
  putCollection,
  putIcons,
} from '../../idb'
import { recordsFromFileList, recordsFromSvgTexts } from '../../iconLibrary/ingest'
import {
  makeCollectionLabel,
  selectScopedIcons,
} from '../../iconLibrary/selectors'
import {
  buildSpriteSvg,
  downloadTextFile,
  slugifySymbolId,
} from '../../svgSprite'
import { byCreatedAsc, byImportedDesc } from '../../../utils/recordSort'
import { ALL_COLLECTIONS, type CollectionRecord } from '../../../types'
import type { IconLibraryStore } from './storeTypes'

export const createDataSlice: StateCreator<
  IconLibraryStore,
  [],
  [],
  Pick<
    IconLibraryStore,
    | 'icons'
    | 'collections'
    | 'ready'
    | 'busy'
    | 'importProgress'
    | 'init'
    | 'refresh'
    | 'importFromFiles'
    | 'importFromSvgTexts'
    | 'deleteIconById'
    | 'deleteSelectedIcons'
    | 'clearAllIcons'
    | 'clearIconsInActiveCollection'
    | 'exportSprite'
    | 'applySymbolId'
    | 'addCollectionWithPrompt'
    | 'renameCollection'
    | 'deleteCollection'
    | 'moveSelectedToCollection'
  >
> = (set, get) => ({
  icons: [],
  collections: [],
  ready: false,
  busy: false,
  importProgress: null,

  refresh: async () => {
    await ensureDefaultCollection()
    const [list, cols] = await Promise.all([getAllIcons(), getAllCollections()])
    set({
      collections: cols.sort(byCreatedAsc),
      icons: list.sort(byImportedDesc),
    })
    get().syncUiAfterRefresh()
  },

  init: async () => {
    try {
      await get().refresh()
    } catch (e) {
      set({
        message:
          e instanceof Error ? e.message : 'Could not read IndexedDB.',
      })
    } finally {
      set({ ready: true })
    }
  },

  importFromFiles: async (fileList) => {
    const {
      importTargetCollectionId,
      importSymbolIdSuffix,
      collections,
      showToast,
      refresh,
    } = get()
    const collId =
      importTargetCollectionId ?? collections[0]?.id ?? null
    if (!collId) {
      showToast('No collection available to import icons.')
      return false
    }
    if (!fileList?.length) return false
    set({ busy: true, importProgress: null })
    try {
      const records = await recordsFromFileList(fileList, collId, {
        symbolIdSuffix: importSymbolIdSuffix,
        onProgress: ({ current, total, fileName }) => {
          set({
            importProgress: {
              stage: 'reading',
              current,
              total,
              fileName,
            },
          })
        },
      })
      if (records.length === 0) {
        showToast('No valid .svg files in the selection.')
        return false
      }
      set({ importProgress: { stage: 'saving' } })
      await putIcons(records)
      await refresh()
      const label = makeCollectionLabel(get().collections)
      showToast(
        `Imported ${records.length} icon(s) into "${label(collId)}".`,
      )
      return true
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Import failed.')
      return false
    } finally {
      set({ busy: false, importProgress: null })
    }
  },

  importFromSvgTexts: async (svgRaws) => {
    if (svgRaws.length === 0) return
    const { importTargetCollectionId, collections, showToast, refresh } = get()
    const collId =
      importTargetCollectionId ?? collections[0]?.id ?? null
    if (!collId) {
      showToast('Choose a target collection (Into) before pasting SVG.')
      return
    }
    set({ busy: true })
    try {
      const records = recordsFromSvgTexts(svgRaws, collId)
      await putIcons(records)
      await refresh()
      const label = makeCollectionLabel(get().collections)
      showToast(`Pasted ${records.length} icon(s) into "${label(collId)}".`)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Paste failed.')
    } finally {
      set({ busy: false })
    }
  },

  deleteIconById: async (id) => {
    set({ busy: true })
    try {
      await deleteIcon(id)
      const { selectedIds } = get()
      const nextSel = new Set(selectedIds)
      nextSel.delete(id)
      set({ selectedIds: nextSel })
      await get().refresh()
    } finally {
      set({ busy: false })
    }
  },

  deleteSelectedIcons: async () => {
    const { selectedIds, showToast, refresh } = get()
    if (selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} selected icon(s)?`))
      return
    set({ busy: true })
    try {
      await deleteIcons([...selectedIds])
      set({ selectedIds: new Set() })
      await refresh()
      showToast('Deleted selected icons.')
    } finally {
      set({ busy: false })
    }
  },

  clearAllIcons: async () => {
    const { icons, showToast, refresh } = get()
    if (icons.length === 0) return
    if (
      !window.confirm(
        'Delete all icons in every collection? This cannot be undone.',
      )
    )
      return
    set({ busy: true })
    try {
      await clearIcons()
      set({ selectedIds: new Set() })
      await refresh()
      showToast('Deleted all icons.')
    } finally {
      set({ busy: false })
    }
  },

  clearIconsInActiveCollection: async () => {
    const {
      activeFilter,
      collections,
      icons,
      showToast,
      refresh,
    } = get()
    if (activeFilter === ALL_COLLECTIONS) return
    const map = new Map<string, number>()
    for (const c of collections) map.set(c.id, 0)
    for (const i of icons) {
      map.set(i.collectionId, (map.get(i.collectionId) ?? 0) + 1)
    }
    const n = map.get(activeFilter) ?? 0
    if (n === 0) return
    const label = makeCollectionLabel(collections)
    if (
      !window.confirm(`Delete ${n} icon(s) in "${label(activeFilter)}"?`)
    )
      return
    set({ busy: true })
    try {
      await clearIconsInCollection(activeFilter)
      set({ selectedIds: new Set() })
      await refresh()
      showToast('Deleted icons in collection.')
    } finally {
      set({ busy: false })
    }
  },

  exportSprite: () => {
    const {
      icons,
      activeFilter,
      collections,
      showToast,
    } = get()
    const label = makeCollectionLabel(collections)
    const scoped = selectScopedIcons(icons, activeFilter)
    const toExport =
      activeFilter === ALL_COLLECTIONS ? icons : scoped
    if (toExport.length === 0) {
      showToast('No icons to export for the current scope.')
      return
    }
    try {
      const suffix =
        activeFilter === ALL_COLLECTIONS
          ? 'sprite'
          : slugifySymbolId(label(activeFilter))
      const xml = buildSpriteSvg(toExport)
      downloadTextFile(`${suffix || 'sprite'}.svg`, xml, 'image/svg+xml')
      showToast(
        `Downloaded ${suffix || 'sprite'}.svg (${toExport.length} icons).`,
      )
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Export failed.')
    }
  },

  applySymbolId: async (icon, nextId) => {
    const slug = slugifySymbolId(nextId)
    if (!slug || slug === icon.symbolId) return
    set({ busy: true })
    try {
      await putIcons([{ ...icon, symbolId: slug }])
      await get().refresh()
    } finally {
      set({ busy: false })
    }
  },

  addCollectionWithPrompt: async () => {
    const name = window.prompt('New collection name?', 'New set')?.trim()
    if (!name) return
    set({ busy: true })
    try {
      const rec: CollectionRecord = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
      }
      await putCollection(rec)
      await get().refresh()
      set({
        activeFilter: rec.id,
        importTargetCollectionId: rec.id,
      })
      get().showToast(`Created "${name}".`)
    } catch (e) {
      get().showToast(
        e instanceof Error ? e.message : 'Could not create collection.',
      )
    } finally {
      set({ busy: false })
    }
  },

  renameCollection: async (col, nextName) => {
    const name = nextName.trim()
    if (!name || name === col.name) return
    set({ busy: true })
    try {
      await putCollection({ ...col, name })
      await get().refresh()
    } finally {
      set({ busy: false })
    }
  },

  deleteCollection: async (col) => {
    const { collections, icons, activeFilter, importTargetCollectionId } = get()
    if (collections.length <= 1) {
      get().showToast('You must keep at least one collection.')
      return
    }
    const others = collections.filter((c) => c.id !== col.id)
    const fallback = others[0]
    const map = new Map<string, number>()
    for (const c of collections) map.set(c.id, 0)
    for (const i of icons) {
      map.set(i.collectionId, (map.get(i.collectionId) ?? 0) + 1)
    }
    const n = map.get(col.id) ?? 0
    if (
      !window.confirm(
        n > 0
          ? `Delete "${col.name}"? ${n} icon(s) will move to "${fallback.name}".`
          : `Delete empty collection "${col.name}"?`,
      )
    )
      return
    set({ busy: true })
    try {
      await deleteCollectionAndReassign(col.id, fallback.id)
      const patch: Partial<
        Pick<IconLibraryStore, 'selectedIds' | 'activeFilter' | 'importTargetCollectionId'>
      > = {
        selectedIds: new Set(),
      }
      if (activeFilter === col.id) patch.activeFilter = fallback.id
      let nextImport = importTargetCollectionId
      if (importTargetCollectionId === col.id) {
        nextImport = fallback.id
      }
      if (nextImport !== importTargetCollectionId) {
        patch.importTargetCollectionId = nextImport
      }
      set(patch)
      await get().refresh()
      get().showToast('Collection deleted.')
    } catch (e) {
      get().showToast(e instanceof Error ? e.message : 'Could not delete.')
    } finally {
      set({ busy: false })
    }
  },

  moveSelectedToCollection: async (targetId) => {
    const { selectedIds, icons, showToast, refresh } = get()
    if (selectedIds.size === 0) return
    set({ busy: true })
    try {
      const toUpdate = icons.filter((i) => selectedIds.has(i.id))
      await putIcons(toUpdate.map((i) => ({ ...i, collectionId: targetId })))
      set({ selectedIds: new Set() })
      await refresh()
      const label = makeCollectionLabel(get().collections)
      showToast(
        `Moved ${toUpdate.length} icon(s) to "${label(targetId)}".`,
      )
    } finally {
      set({ busy: false })
    }
  },
})
