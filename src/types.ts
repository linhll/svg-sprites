export type CollectionRecord = {
  id: string
  name: string
  createdAt: number
}

export type SvgIconRecord = {
  id: string
  collectionId: string
  filename: string
  name: string
  symbolId: string
  svgRaw: string
  importedAt: number
}

export const ALL_COLLECTIONS = '__all__' as const
export type ActiveCollectionFilter =
  | typeof ALL_COLLECTIONS
  | string
