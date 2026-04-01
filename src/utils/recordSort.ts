import type { CollectionRecord, SvgIconRecord } from '../types'

export function byImportedDesc(a: SvgIconRecord, b: SvgIconRecord): number {
  return b.importedAt - a.importedAt
}

export function byCreatedAsc(a: CollectionRecord, b: CollectionRecord): number {
  return a.createdAt - b.createdAt
}
