import { useVirtualizer } from '@tanstack/react-virtual'
import {
  memo,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import {
  makeCollectionLabel,
  selectFilteredIcons,
  selectScopedIcons,
} from '../../lib/iconLibrary/selectors'
import { useIconLibraryStore } from '../../lib/stores/iconLibraryStore'
import { ALL_COLLECTIONS } from '../../types'
import { IconCard } from './IconCard'
import './IconGrid.scss'

/** Min column width matches previous `minmax(200px, 1fr)` grid. */
const COLUMN_MIN_PX = 200
/** Gap between columns and between virtual rows (matches 1rem). */
const GAP_PX = 16
/** Initial row height guess; rows are measured for real height. */
const ROW_ESTIMATE_PX = 260

export const IconGrid = memo(function IconGrid() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualInnerRef = useRef<HTMLDivElement>(null)
  const [listWidth, setListWidth] = useState(0)

  const ready = useIconLibraryStore((s) => s.ready)
  const busy = useIconLibraryStore((s) => s.busy)
  const icons = useIconLibraryStore((s) => s.icons)
  const collections = useIconLibraryStore((s) => s.collections)
  const query = useIconLibraryStore((s) => s.query)
  const activeFilter = useIconLibraryStore((s) => s.activeFilter)
  const toggleSelect = useIconLibraryStore((s) => s.toggleSelect)
  const applySymbolId = useIconLibraryStore((s) => s.applySymbolId)
  const deleteIconById = useIconLibraryStore((s) => s.deleteIconById)

  const collectionLabel = useMemo(
    () => makeCollectionLabel(collections),
    [collections],
  )

  const scopedIcons = useMemo(
    () => selectScopedIcons(icons, activeFilter),
    [icons, activeFilter],
  )

  const filteredIcons = useMemo(
    () => selectFilteredIcons(scopedIcons, query, collectionLabel),
    [scopedIcons, query, collectionLabel],
  )

  const hasGrid = ready && filteredIcons.length > 0

  const columnCount = useMemo(() => {
    if (!hasGrid || listWidth <= 0) return 1
    return Math.max(
      1,
      Math.floor((listWidth + GAP_PX) / (COLUMN_MIN_PX + GAP_PX)),
    )
  }, [hasGrid, listWidth])

  const rowCount = hasGrid
    ? Math.ceil(filteredIcons.length / columnCount)
    : 0

  /* TanStack Virtual: intentional; row range updates from count/column changes. */
  // eslint-disable-next-line react-hooks/incompatible-library -- virtualizer API not memoizable by React Compiler
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_ESTIMATE_PX,
    overscan: 4,
    gap: GAP_PX,
    enabled: rowCount > 0,
  })

  useLayoutEffect(() => {
    const el = virtualInnerRef.current
    if (!el || !hasGrid) return
    const apply = (entry: ResizeObserverEntry) => {
      const w =
        entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
      if (w > 0) setListWidth(w)
    }
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) apply(e)
    })
    ro.observe(el, { box: 'content-box' })
    return () => ro.disconnect()
  }, [hasGrid])

  if (!ready) {
    return (
      <div className="icon-grid-panel icon-grid-panel--placeholder">
        <p className="icon-grid-panel__status">Opening library…</p>
      </div>
    )
  }

  if (filteredIcons.length === 0) {
    return (
      <div className="icon-grid-panel icon-grid-panel--placeholder">
        <p className="icon-grid-panel__status">
          {scopedIcons.length === 0
            ? activeFilter === ALL_COLLECTIONS
              ? 'No icons yet. Import into a collection.'
              : `Collection "${collectionLabel(activeFilter)}" has no icons.`
            : 'No icons match the filter.'}
        </p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className="icon-grid-panel icon-grid-panel--scroll"
    >
      <div
        ref={virtualInnerRef}
        className="icon-grid-panel__virtual"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((vRow) => {
          const start = vRow.index * columnCount
          const rowIcons = filteredIcons.slice(start, start + columnCount)
          return (
            <div
              key={vRow.key}
              data-index={vRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${vRow.start}px)`,
              }}
            >
              <ul
                className="icon-grid-panel__row"
                style={
                  {
                    '--icon-grid-cols': columnCount,
                  } as CSSProperties
                }
              >
                {rowIcons.map((icon) => (
                  <IconCard
                    key={icon.id}
                    icon={icon}
                    activeFilter={activeFilter}
                    collectionLabel={collectionLabel}
                    busy={busy}
                    onToggleSelect={toggleSelect}
                    onSymbolIdBlur={applySymbolId}
                    onDelete={(id) => void deleteIconById(id)}
                  />
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
})
