import { useMemo, useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { ImportModal } from '../import/ImportModal'
import { selectScopedIcons } from '../../lib/iconLibrary/selectors'
import { useIconLibraryStore } from '../../lib/stores/iconLibraryStore'
import { ALL_COLLECTIONS } from '../../types'
import { Button } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'
import './MainToolbar.scss'

export function MainToolbar() {
  const [importOpen, setImportOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const ready = useIconLibraryStore((s) => s.ready)
  const busy = useIconLibraryStore((s) => s.busy)
  const collections = useIconLibraryStore((s) => s.collections)
  const icons = useIconLibraryStore((s) => s.icons)
  const activeFilter = useIconLibraryStore((s) => s.activeFilter)
  const selectedCount = useIconLibraryStore((s) => s.selectedIds.size)

  const exportSprite = useIconLibraryStore((s) => s.exportSprite)
  const deleteSelectedIcons = useIconLibraryStore((s) => s.deleteSelectedIcons)
  const clearIconsInActiveCollection = useIconLibraryStore(
    (s) => s.clearIconsInActiveCollection,
  )
  const clearAllIcons = useIconLibraryStore((s) => s.clearAllIcons)
  const moveSelectedToCollection = useIconLibraryStore(
    (s) => s.moveSelectedToCollection,
  )

  const scopedIcons = useMemo(
    () => selectScopedIcons(icons, activeFilter),
    [icons, activeFilter],
  )

  const exportableCount = scopedIcons.length

  const activeCollectionIconCount =
    activeFilter === ALL_COLLECTIONS ? 0 : scopedIcons.length

  return (
    <>
      <section className="toolbar" aria-label="Actions">
        <Button
          variant="primary"
          disabled={!ready || busy}
          onClick={() => setImportOpen(true)}
        >
          Import…
        </Button>

        <Button
          variant="accent"
          disabled={!ready || busy || exportableCount === 0}
          onClick={exportSprite}
        >
          Export sprite
        </Button>
        <span className="toolbar-gap" />
        <label className="move-target" htmlFor="move-collection">
          <span className="visually-hidden">Move selected icons</span>
          <select
            id="move-collection"
            className="import-target-select"
            disabled={
              !ready || busy || selectedCount === 0 || collections.length < 2
            }
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value
              e.target.value = ''
              if (v) void moveSelectedToCollection(v)
            }}
          >
            <option value="">Move selection →</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="danger-outline"
          disabled={!ready || busy || selectedCount === 0}
          onClick={() => void deleteSelectedIcons()}
        >
          Delete selected ({selectedCount})
        </Button>
        <Button
          variant="danger-outline"
          disabled={
            !ready ||
            busy ||
            activeFilter === ALL_COLLECTIONS ||
            activeCollectionIconCount === 0
          }
          onClick={() => void clearIconsInActiveCollection()}
        >
          Clear icons in collection
        </Button>
        <Button
          variant="danger-outline"
          disabled={!ready || busy || icons.length === 0}
          onClick={() => void clearAllIcons()}
        >
          Delete all icons
        </Button>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </section>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  )
}
