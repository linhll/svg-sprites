import { useEffect } from 'react'
import { CollectionsSidebar } from './components/collections/CollectionsSidebar'
import { IconFilterRow } from './components/icons/IconFilterRow'
import { IconGrid } from './components/icons/IconGrid'
import { AppFooter } from './components/layout/AppFooter'
import { MainToolbar } from './components/toolbar/MainToolbar'
import { Toast } from './components/ui/Toast'
import { useIconLibraryShortcuts } from './hooks/useIconLibraryShortcuts'
import { useIconLibraryStore } from './lib/stores/iconLibraryStore'
import './AppLayout.scss'

export default function App() {
  const init = useIconLibraryStore((s) => s.init)
  useEffect(() => {
    void init()
  }, [init])

  useIconLibraryShortcuts()

  return (
    <div className="app-layout">
      <CollectionsSidebar />

      <div className="app-main">
        <div className="app-main__sticky-toolbar">
          <MainToolbar />
        </div>

        <IconFilterRow />

        <Toast />

        <IconGrid />

        <AppFooter />
      </div>
    </div>
  )
}
