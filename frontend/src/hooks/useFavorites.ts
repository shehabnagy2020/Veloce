import { useLiveQuery } from 'dexie-react-hooks';
import { db, type FavoriteListing } from '../services/db';
import { apiFetch } from '../services/api';

export function useFavorites() {
  const favorites = useLiveQuery(() => db.favorites.orderBy('saved_at').reverse().toArray()) || [];

  const isFavorited = (listingId: string): boolean => {
    return favorites.some((f) => f.id === listingId);
  };

  const toggleFavorite = async (listing: {
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
  }) => {
    const existing = await db.favorites.get(listing.id);
    if (existing) {
      // Remove locally
      await db.favorites.delete(listing.id);
      // Remove from server
      try {
        await apiFetch(`/listings/${listing.id}/favorite`, { method: 'POST' });
      } catch {
        // Re-add if API fails
        await db.favorites.add({ ...listing, saved_at: Date.now() });
      }
    } else {
      // Save locally immediately for offline access
      await db.favorites.add({ ...listing, saved_at: Date.now() });
      // Sync to server
      try {
        await apiFetch(`/listings/${listing.id}/favorite`, { method: 'POST' });
      } catch {
        // Will be synced when online
      }
    }
  };

  return { favorites, isFavorited, toggleFavorite };
}