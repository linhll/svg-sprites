import { useIconLibraryStore } from '../../lib/stores/iconLibraryStore'
import './AppFooter.scss'

export function AppFooter() {
  const icons = useIconLibraryStore((s) => s.icons)
  const collections = useIconLibraryStore((s) => s.collections)
  return (
    <footer className="app-footer">
      {icons.length} icons · {collections.length} collections · Data stays in
      this browser only
    </footer>
  )
}
