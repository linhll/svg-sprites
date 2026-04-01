import { useMemo } from 'react'
import {
  makeCollectionLabel,
  selectFilteredIcons,
  selectScopedIcons,
} from '../../lib/iconLibrary/selectors'
import { useIconLibraryStore } from '../../lib/stores/iconLibraryStore'
import { Button } from '../ui/Button'
import './IconFilterRow.scss'

export function IconFilterRow() {
  const filterDraft = useIconLibraryStore((s) => s.filterDraft)
  const setFilterDraft = useIconLibraryStore((s) => s.setFilterDraft)
  const commitFilterQuery = useIconLibraryStore((s) => s.commitFilterQuery)
  const selectedCount = useIconLibraryStore((s) => s.selectedIds.size)
  const icons = useIconLibraryStore((s) => s.icons)
  const collections = useIconLibraryStore((s) => s.collections)
  const query = useIconLibraryStore((s) => s.query)
  const activeFilter = useIconLibraryStore((s) => s.activeFilter)
  const selectAllVisible = useIconLibraryStore((s) => s.selectAllVisible)
  const clearSelection = useIconLibraryStore((s) => s.clearSelection)

  const collectionLabel = useMemo(
    () => makeCollectionLabel(collections),
    [collections],
  )

  const scopedIcons = useMemo(
    () => selectScopedIcons(icons, activeFilter),
    [icons, activeFilter],
  )

  const visibleCount = useMemo(
    () => selectFilteredIcons(scopedIcons, query, collectionLabel).length,
    [scopedIcons, query, collectionLabel],
  )

  return (
    <section className="filter-row">
      <label className="search-label">
        <span className="visually-hidden">Search</span>
        <input
          type="search"
          className="search-input"
          placeholder="Filter by name, symbol id, collection…"
          value={filterDraft}
          onChange={(e) => setFilterDraft(e.target.value)}
          onBlur={() => commitFilterQuery()}
        />
      </label>
      <div className="filter-actions">
        <Button
          variant="ghost"
          disabled={visibleCount === 0}
          onClick={() => {
            commitFilterQuery()
            selectAllVisible()
          }}
        >
          Select visible
        </Button>
        <Button
          variant="ghost"
          disabled={selectedCount === 0}
          onClick={clearSelection}
        >
          Clear selection
        </Button>
      </div>
    </section>
  )
}
