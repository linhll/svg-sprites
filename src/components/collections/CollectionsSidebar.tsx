import { useMemo } from 'react'
import { ALL_COLLECTIONS, type CollectionRecord } from '../../types'
import { countsByCollectionId } from '../../lib/iconLibrary/selectors'
import { useIconLibraryStore } from '../../lib/stores/iconLibraryStore'
import { Button } from '../ui/Button'
import './CollectionsSidebar.scss'

export function CollectionsSidebar() {
  const ready = useIconLibraryStore((s) => s.ready)
  const busy = useIconLibraryStore((s) => s.busy)
  const collections = useIconLibraryStore((s) => s.collections)
  const icons = useIconLibraryStore((s) => s.icons)
  const activeFilter = useIconLibraryStore((s) => s.activeFilter)
  const setActiveFilter = useIconLibraryStore((s) => s.setActiveFilter)
  const addCollectionWithPrompt = useIconLibraryStore(
    (s) => s.addCollectionWithPrompt,
  )
  const renameCollection = useIconLibraryStore((s) => s.renameCollection)
  const deleteCollection = useIconLibraryStore((s) => s.deleteCollection)

  const countsByCollection = useMemo(
    () => countsByCollectionId(collections, icons),
    [collections, icons],
  )

  const requestRenameCollection = (col: CollectionRecord) => {
    const name = window.prompt('Collection name', col.name)?.trim()
    if (name) void renameCollection(col, name)
  }

  return (
    <aside className="collections-sidebar" aria-label="Collections">
      <div className="collections-sidebar-head">
        <h2 className="collections-title">Collection</h2>
        <Button
          variant="primary"
          size="small"
          disabled={!ready || busy}
          onClick={() => void addCollectionWithPrompt()}
        >
          + New
        </Button>
      </div>
      <ul className="collections-list">
        <li>
          <button
            type="button"
            className={`collections-item ${activeFilter === ALL_COLLECTIONS ? 'is-active' : ''}`}
            disabled={!ready}
            onClick={() => setActiveFilter(ALL_COLLECTIONS)}
          >
            <span className="collections-item-name">All</span>
            <span className="collections-item-count">{icons.length}</span>
          </button>
        </li>
        {collections.map((col) => (
          <li key={col.id}>
            <div
              className={`collections-item-wrap ${activeFilter === col.id ? 'is-active' : ''}`}
            >
              <button
                type="button"
                className="collections-item"
                disabled={!ready}
                onClick={() => setActiveFilter(col.id)}
              >
                <span className="collections-item-name" title={col.name}>
                  {col.name}
                </span>
                <span className="collections-item-count">
                  {countsByCollection.get(col.id) ?? 0}
                </span>
              </button>
              <Button
                surface="bare"
                className="collections-rename-btn"
                disabled={busy}
                title="Rename"
                aria-label={`Rename ${col.name}`}
                onClick={() => requestRenameCollection(col)}
              >
                ✎
              </Button>
              {collections.length > 1 ? (
                <Button
                  surface="bare"
                  className="collections-delete"
                  disabled={busy}
                  onClick={() => void deleteCollection(col)}
                  aria-label={`Delete collection ${col.name}`}
                >
                  ×
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
