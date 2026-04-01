import type { StoreApi } from 'zustand'
import type { IconLibraryStore } from '../storeTypes'

export type IconLibrarySet = StoreApi<IconLibraryStore>['setState']
export type IconLibraryGet = StoreApi<IconLibraryStore>['getState']
