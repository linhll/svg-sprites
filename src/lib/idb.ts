import type { CollectionRecord, SvgIconRecord } from '../types'

const DB_NAME = 'svg-icon-manager'
const DB_VERSION = 2
const STORE_ICONS = 'icons'
const STORE_COLLECTIONS = 'collections'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (event) => {
      const db = req.result
      const from = event.oldVersion

      if (!db.objectStoreNames.contains(STORE_ICONS)) {
        db.createObjectStore(STORE_ICONS, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_COLLECTIONS)) {
        db.createObjectStore(STORE_COLLECTIONS, { keyPath: 'id' })
      }

      if (from < 2 && from >= 1) {
        const tx = (event.target as IDBOpenDBRequest).transaction!
        const colStore = tx.objectStore(STORE_COLLECTIONS)
        const iconStore = tx.objectStore(STORE_ICONS)
        const defId = crypto.randomUUID()
        const def: CollectionRecord = {
          id: defId,
          name: 'Default',
          createdAt: Date.now(),
        }
        colStore.add(def)

        const curReq = iconStore.openCursor()
        curReq.onsuccess = () => {
          const cursor = curReq.result
          if (cursor) {
            const v = cursor.value as SvgIconRecord & { collectionId?: string }
            if (v.collectionId == null) {
              cursor.update({ ...v, collectionId: defId })
            }
            cursor.continue()
          }
        }
      }
    }
  })
}

export async function getAllCollections(): Promise<CollectionRecord[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_COLLECTIONS, 'readonly')
    const r = tx.objectStore(STORE_COLLECTIONS).getAll()
    r.onsuccess = () => resolve((r.result as CollectionRecord[]) ?? [])
    r.onerror = () => reject(r.error ?? new Error('getAll collections failed'))
  })
}

export async function putCollection(record: CollectionRecord): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_COLLECTIONS, 'readwrite')
    tx.objectStore(STORE_COLLECTIONS).put(record)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('putCollection failed'))
  })
}

export async function deleteCollectionRecord(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_COLLECTIONS, 'readwrite')
    tx.objectStore(STORE_COLLECTIONS).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('deleteCollection failed'))
  })
}

/** Ensure at least one collection exists (brand-new DB). */
export async function ensureDefaultCollection(): Promise<CollectionRecord> {
  const existing = await getAllCollections()
  if (existing.length > 0) {
    return existing.sort((a, b) => a.createdAt - b.createdAt)[0]
  }
  const def: CollectionRecord = {
    id: crypto.randomUUID(),
    name: 'Default',
    createdAt: Date.now(),
  }
  await putCollection(def)
  return def
}

export async function getAllIcons(): Promise<SvgIconRecord[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ICONS, 'readonly')
    const r = tx.objectStore(STORE_ICONS).getAll()
    r.onsuccess = () => resolve((r.result as SvgIconRecord[]) ?? [])
    r.onerror = () => reject(r.error ?? new Error('getAll failed'))
  })
}

export async function putIcons(records: SvgIconRecord[]): Promise<void> {
  if (records.length === 0) return
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ICONS, 'readwrite')
    const store = tx.objectStore(STORE_ICONS)
    for (const rec of records) store.put(rec)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('put failed'))
  })
}

export async function putIcon(record: SvgIconRecord): Promise<void> {
  return putIcons([record])
}

export async function deleteIcon(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ICONS, 'readwrite')
    tx.objectStore(STORE_ICONS).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('delete failed'))
  })
}

export async function deleteIcons(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ICONS, 'readwrite')
    const store = tx.objectStore(STORE_ICONS)
    for (const id of ids) store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('deleteMany failed'))
  })
}

export async function clearIcons(): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ICONS, 'readwrite')
    tx.objectStore(STORE_ICONS).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('clear failed'))
  })
}

export async function clearIconsInCollection(collectionId: string): Promise<void> {
  const icons = await getAllIcons()
  const ids = icons.filter((i) => i.collectionId === collectionId).map((i) => i.id)
  await deleteIcons(ids)
}

/**
 * Delete a collection: move all icons to the target collection, then remove the collection record.
 */
export async function deleteCollectionAndReassign(
  collectionId: string,
  targetCollectionId: string,
): Promise<void> {
  if (collectionId === targetCollectionId) return
  const collections = await getAllCollections()
  if (collections.length <= 1) {
    throw new Error('At least one collection is required.')
  }
  const icons = await getAllIcons()
  const toMove = icons.filter((i) => i.collectionId === collectionId)
  await putIcons(
    toMove.map((i) => ({ ...i, collectionId: targetCollectionId })),
  )
  await deleteCollectionRecord(collectionId)
}
