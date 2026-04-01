import { useEffect } from 'react'
import { extractSvgSnippets, isModA, isModC, isTextInputTarget } from '../lib/clipboardSvg'
import { useIconLibraryStore } from '../lib/stores/iconLibraryStore'

/**
 * Ctrl/Cmd+A, C, V and SVG paste — always reads latest state via getState().
 */
export function useIconLibraryShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const s = useIconLibraryStore.getState()
      if (!s.ready || s.busy) return
      if (isTextInputTarget(e.target)) return

      if (isModA(e)) {
        e.preventDefault()
        s.commitFilterQuery()
        s.selectAllVisible()
        return
      }

      if (isModC(e)) {
        if (s.selectedIds.size === 0) return
        e.preventDefault()
        const list = s.icons.filter((i) => s.selectedIds.has(i.id))
        const text = list.map((i) => i.svgRaw).join('\n\n')
        void navigator.clipboard.writeText(text).then(
          () => s.showToast(`Copied ${list.length} SVG snippet(s) to clipboard.`),
          () =>
            s.showToast(
              'Could not write to the clipboard (check browser permissions).',
            ),
        )
      }
    }

    const onPaste = (e: ClipboardEvent) => {
      const s = useIconLibraryStore.getState()
      if (!s.ready || s.busy) return
      if (isTextInputTarget(e.target)) return
      const text = e.clipboardData?.getData('text/plain') ?? ''
      const svgs = extractSvgSnippets(text)
      if (svgs.length === 0) return
      e.preventDefault()
      void s.importFromSvgTexts(svgs)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('paste', onPaste)
    }
  }, [])
}
