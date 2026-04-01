import type { SvgIconRecord } from '../types'

const SVG_NS = 'http://www.w3.org/2000/svg'

export function slugifySymbolId(name: string): string {
  let s = name
    .trim()
    .toLowerCase()
    .replace(/\.svg$/i, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (!s) s = 'icon'
  if (/^[0-9-]/.test(s)) s = `icon-${s}`
  return s
}

function parseLength(val: string | null): number | null {
  if (!val) return null
  const n = parseFloat(val.replace(/px$/i, '').trim())
  return Number.isFinite(n) ? n : null
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

export function extractSymbolParts(svgText: string): {
  viewBox: string
  innerXml: string
} {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')
  const parseErr = doc.querySelector('parsererror')
  if (parseErr) {
    throw new Error('Invalid SVG or could not parse document')
  }
  const svg = doc.querySelector('svg')
  if (!svg) {
    throw new Error('Could not find root <svg> element')
  }

  let viewBox = svg.getAttribute('viewBox')?.trim() ?? ''
  if (!viewBox) {
    const w = parseLength(svg.getAttribute('width'))
    const h = parseLength(svg.getAttribute('height'))
    if (w != null && h != null) {
      viewBox = `0 0 ${w} ${h}`
    } else {
      viewBox = '0 0 24 24'
    }
  }

  const serializer = new XMLSerializer()
  let innerXml = ''
  for (const node of Array.from(svg.childNodes)) {
    innerXml += serializer.serializeToString(node)
  }

  return { viewBox, innerXml }
}

function allocateUniqueSymbolId(base: string, used: Set<string>): string {
  let id = slugifySymbolId(base)
  if (!id) id = 'icon'
  let candidate = id
  let n = 2
  while (used.has(candidate)) {
    candidate = `${id}-${n++}`
  }
  used.add(candidate)
  return candidate
}

export function buildSpriteSvg(icons: SvgIconRecord[]): string {
  const used = new Set<string>()
  const parts: string[] = []

  for (const icon of icons) {
    const { viewBox, innerXml } = extractSymbolParts(icon.svgRaw)
    const symId = allocateUniqueSymbolId(icon.symbolId || icon.name, used)
    parts.push(
      `<symbol id="${escapeAttr(symId)}" viewBox="${escapeAttr(viewBox)}">${innerXml}</symbol>`,
    )
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="${SVG_NS}" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none" aria-hidden="true">`,
    '<defs>',
    ...parts,
    '</defs>',
    '</svg>',
  ].join('\n')
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
