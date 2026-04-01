import {
  type InputHTMLAttributes,
  useEffect,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import { useIconLibraryStore } from '../../lib/stores/iconLibraryStore'
import { Button } from '../ui/Button'
import './ImportModal.scss'

type ImportModalProps = {
  open: boolean
  onClose: () => void
}

export function ImportModal({ open, onClose }: ImportModalProps) {
  const filesInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const ready = useIconLibraryStore((s) => s.ready)
  const busy = useIconLibraryStore((s) => s.busy)
  const importProgress = useIconLibraryStore((s) => s.importProgress)
  const collections = useIconLibraryStore((s) => s.collections)
  const importTargetCollectionId = useIconLibraryStore(
    (s) => s.importTargetCollectionId,
  )
  const importSymbolIdSuffix = useIconLibraryStore(
    (s) => s.importSymbolIdSuffix,
  )
  const setImportTargetCollectionId = useIconLibraryStore(
    (s) => s.setImportTargetCollectionId,
  )
  const setImportSymbolIdSuffix = useIconLibraryStore(
    (s) => s.setImportSymbolIdSuffix,
  )
  const importFromFiles = useIconLibraryStore((s) => s.importFromFiles)

  const targetCollectionForImport =
    importTargetCollectionId ?? collections[0]?.id ?? null

  const importing = importProgress != null

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (importing) return
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, importing])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const handleFiles = async (list: FileList | null) => {
    const ok = await importFromFiles(list)
    if (ok) onClose()
  }

  if (!open) return null

  return createPortal(
    <div
      className="import-modal-overlay"
      role="presentation"
      onClick={() => {
        if (!importing) onClose()
      }}
    >
      <div
        className="import-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
        aria-busy={importing}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="import-modal-title" className="import-modal__title">
          Import SVG icons
        </h2>

        {importProgress && (
          <div
            className="import-modal__progress"
            role="status"
            aria-live="polite"
          >
            {importProgress.stage === 'reading' ? (
              <>
                <p className="import-modal__progress-title">Reading icons</p>
                <p className="import-modal__progress-file">
                  <span className="import-modal__progress-name">
                    {importProgress.fileName}
                  </span>
                  <span className="import-modal__progress-count">
                    {' '}
                    ({importProgress.current} / {importProgress.total})
                  </span>
                </p>
                <progress
                  className="import-modal__meter"
                  max={importProgress.total}
                  value={importProgress.current}
                />
              </>
            ) : (
              <>
                <p className="import-modal__progress-title">Saving to library</p>
                <p className="import-modal__progress-hint">
                  Writing icons to storage…
                </p>
                <div
                  className="import-modal__meter import-modal__meter--indeterminate"
                  role="progressbar"
                  aria-busy="true"
                />
              </>
            )}
          </div>
        )}

        <div className="import-modal__field">
          <label className="import-modal__label" htmlFor="import-modal-into">
            Into collection
          </label>
          <select
            id="import-modal-into"
            className="import-modal__select"
            value={targetCollectionForImport ?? ''}
            disabled={!ready || busy || importing || collections.length === 0}
            onChange={(e) => setImportTargetCollectionId(e.target.value || null)}
          >
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="import-modal__field">
          <label className="import-modal__label" htmlFor="import-modal-suffix">
            Symbol ID suffix (optional)
          </label>
          <input
            id="import-modal-suffix"
            type="text"
            className="import-modal__input"
            placeholder="e.g. v2"
            value={importSymbolIdSuffix}
            disabled={!ready || busy || importing}
            onChange={(e) => setImportSymbolIdSuffix(e.target.value)}
            aria-describedby="import-modal-suffix-hint"
          />
          <p id="import-modal-suffix-hint" className="import-modal__hint">
            Appended to each filename stem before generating the symbol id (file
            &amp; folder import only).
          </p>
        </div>

        <input
          ref={filesInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          multiple
          className="visually-hidden"
          onChange={(e) => {
            void handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          multiple
          className="visually-hidden"
          {...({ webkitdirectory: '' } as InputHTMLAttributes<HTMLInputElement>)}
          onChange={(e) => {
            void handleFiles(e.target.files)
            e.target.value = ''
          }}
        />

        <div className="import-modal__actions">
          <div className="import-modal__actions-row">
            <Button
              variant="primary"
              disabled={!ready || busy || importing || !targetCollectionForImport}
              onClick={() => filesInputRef.current?.click()}
            >
              Choose .svg files
            </Button>
            <Button
              disabled={!ready || busy || importing || !targetCollectionForImport}
              onClick={() => folderInputRef.current?.click()}
            >
              Choose folder
            </Button>
          </div>
          <Button
            variant="ghost"
            type="button"
            disabled={importing}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
