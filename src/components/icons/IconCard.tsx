import { memo } from 'react'
import { useIconLibraryStore } from '../../lib/stores/iconLibraryStore'
import {
  ALL_COLLECTIONS,
  type ActiveCollectionFilter,
  type SvgIconRecord,
} from '../../types'
import { Button } from '../ui/Button'
import './IconCard.scss'

export type IconCardProps = {
  icon: SvgIconRecord
  activeFilter: ActiveCollectionFilter
  collectionLabel: (id: string) => string
  busy: boolean
  onToggleSelect: (id: string) => void
  onSymbolIdBlur: (icon: SvgIconRecord, nextId: string) => void
  onDelete: (id: string) => void
}

function IconCardInner({
  icon,
  activeFilter,
  collectionLabel,
  busy,
  onToggleSelect,
  onSymbolIdBlur,
  onDelete,
}: IconCardProps) {
  const selected = useIconLibraryStore((s) => s.selectedIds.has(icon.id))
  return (
    <li className="icon-card">
      <label className="icon-card-select">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(icon.id)}
        />
        <span className="visually-hidden">Select {icon.name}</span>
      </label>
      <div
        className="icon-preview"
        aria-hidden
        dangerouslySetInnerHTML={{ __html: icon.svgRaw }}
      />
      <div className="icon-meta">
        <div className="icon-name" title={icon.filename}>
          {icon.filename}
        </div>
        {activeFilter === ALL_COLLECTIONS ? (
          <div className="icon-collection-tag">
            {collectionLabel(icon.collectionId)}
          </div>
        ) : null}
        <label className="symbol-field">
          <span className="symbol-label">Symbol id</span>
          <input
            type="text"
            className="symbol-input"
            defaultValue={icon.symbolId}
            disabled={busy}
            onBlur={(e) => onSymbolIdBlur(icon, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
              }
            }}
          />
        </label>
        <Button
          variant="icon-card-remove"
          disabled={busy}
          onClick={() => onDelete(icon.id)}
          aria-label={`Remove ${icon.name}`}
        >
          ×
        </Button>
      </div>
    </li>
  )
}

export const IconCard = memo(IconCardInner)
