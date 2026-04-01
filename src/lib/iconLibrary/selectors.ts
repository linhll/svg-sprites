import {
  ALL_COLLECTIONS,
  type ActiveCollectionFilter,
  type CollectionRecord,
  type SvgIconRecord,
} from '../../types'

export function collectionNameMap(
  collections: CollectionRecord[],
): Map<string, string> {
  return new Map(collections.map((c) => [c.id, c.name]))
}

export function makeCollectionLabel(collections: CollectionRecord[]) {
  const m = collectionNameMap(collections)
  return (id: string) => m.get(id) ?? id
}

export function countsByCollectionId(
  collections: CollectionRecord[],
  icons: SvgIconRecord[],
): Map<string, number> {
  const map = new Map<string, number>()
  for (const c of collections) map.set(c.id, 0)
  for (const i of icons) {
    map.set(i.collectionId, (map.get(i.collectionId) ?? 0) + 1)
  }
  return map
}

export function selectScopedIcons(
  icons: SvgIconRecord[],
  activeFilter: ActiveCollectionFilter,
): SvgIconRecord[] {
  if (activeFilter === ALL_COLLECTIONS) return icons
  return icons.filter((i) => i.collectionId === activeFilter)
}

export function selectFilteredIcons(
  scoped: SvgIconRecord[],
  query: string,
  nameOfCollection: (collectionId: string) => string,
): SvgIconRecord[] {
  const q = query.trim().toLowerCase()
  if (q === '') return scoped
  return scoped.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.filename.toLowerCase().includes(q) ||
      i.symbolId.toLowerCase().includes(q) ||
      nameOfCollection(i.collectionId).toLowerCase().includes(q),
  )
}
