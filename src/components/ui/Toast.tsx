import { useIconLibraryStore } from '../../lib/stores/iconLibraryStore'
import './Toast.scss'

export function Toast() {
  const message = useIconLibraryStore((s) => s.message)
  if (!message) return null
  return (
    <div className="toast" role="status">
      {message}
    </div>
  )
}
