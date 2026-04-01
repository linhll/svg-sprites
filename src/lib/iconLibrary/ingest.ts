import { slugifySymbolId } from '../svgSprite'
import type { SvgIconRecord } from '../../types'

export type FileIngestOptions = {
  /** Appended to the filename stem before slugifying (file & folder import only). */
  symbolIdSuffix?: string
  /** Called before each file is read (`current` is 1-based). */
  onProgress?: (info: {
    current: number
    total: number
    fileName: string
  }) => void
}

function symbolIdFromBaseName(base: string, suffix?: string): string {
  const s = suffix?.trim() ?? ''
  if (!s) return slugifySymbolId(base)
  return slugifySymbolId(`${base}-${s}`)
}

export async function recordsFromFileList(
  fileList: FileList | null,
  collectionId: string,
  options?: FileIngestOptions,
): Promise<SvgIconRecord[]> {
  if (!fileList?.length) return []
  const files = Array.from(fileList).filter((f) =>
    f.name.toLowerCase().endsWith('.svg'),
  )
  if (files.length === 0) return []
  const now = Date.now()
  const out: SvgIconRecord[] = []
  const suf = options?.symbolIdSuffix
  const onProgress = options?.onProgress
  const total = files.length
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    onProgress?.({
      current: i + 1,
      total,
      fileName: file.name,
    })
    const svgRaw = await file.text()
    const base = file.name.replace(/\.svg$/i, '')
    out.push({
      id: crypto.randomUUID(),
      collectionId,
      filename: file.name,
      name: base,
      symbolId: symbolIdFromBaseName(base, suf),
      svgRaw,
      importedAt: now,
    })
  }
  return out
}

export function recordsFromSvgTexts(
  svgRaws: string[],
  collectionId: string,
): SvgIconRecord[] {
  const baseTs = Date.now()
  return svgRaws.map((svgRaw, i) => {
    const stem = `paste-${baseTs}-${i + 1}`
    return {
      id: crypto.randomUUID(),
      collectionId,
      filename: `${stem}.svg`,
      name: stem,
      symbolId: slugifySymbolId(stem),
      svgRaw,
      importedAt: Date.now(),
    }
  })
}
