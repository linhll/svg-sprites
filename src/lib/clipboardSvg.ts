function isTextLikeInput(el: HTMLInputElement): boolean {
  const type = el.type
  if (
    type === 'checkbox' ||
    type === 'radio' ||
    type === 'button' ||
    type === 'submit' ||
    type === 'reset' ||
    type === 'file' ||
    type === 'range' ||
    type === 'color' ||
    type === 'image' ||
    type === 'hidden'
  ) {
    return false
  }
  return true
}

/** Avoid hijacking Ctrl/Cmd+A,C,V while editing text fields. */
export function isTextInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (
    target.isContentEditable ||
    target.closest('[contenteditable="true"]')
  ) {
    return true
  }
  if (target instanceof HTMLInputElement) return isTextLikeInput(target)
  const t = target.tagName
  return t === 'TEXTAREA' || t === 'SELECT'
}

function normalizeMod(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.metaKey
}

export function isModA(e: KeyboardEvent): boolean {
  return normalizeMod(e) && e.key === 'a' && !e.shiftKey && !e.altKey
}

export function isModC(e: KeyboardEvent): boolean {
  return normalizeMod(e) && e.key === 'c' && !e.shiftKey && !e.altKey
}

/**
 * Split <svg>...</svg> blocks from pasted text (nested SVG is not handled).
 */
export function extractSvgSnippets(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  const re = /<svg\b[^>]*>[\s\S]*?<\/svg>/gi
  const found = trimmed.match(re)
  if (found?.length) return found
  if (/<svg\b/i.test(trimmed)) return [trimmed]
  return []
}
