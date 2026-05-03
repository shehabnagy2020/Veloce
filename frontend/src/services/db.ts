import Dexie, { type Table } from 'dexie';

export interface FavoriteListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  transmission: string;
  district: string;
  thumbnail_url: string | null;
  price_indicator: string | null;
  badges: { badge_type: string; status: string }[];
  created_at: string;
  saved_at: number; // timestamp when saved locally
}

export interface SyncQueueItem {
  id?: number;
  url: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
  created_at: number;
}

class VeloceDB extends Dexie {
  favorites!: Table<FavoriteListing, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('veloce');
    this.version(1).stores({
      favorites: 'id, make, model, district, saved_at',
      syncQueue: '++id, url, method, created_at',
    });
  }
}

export const db = new VeloceDB();