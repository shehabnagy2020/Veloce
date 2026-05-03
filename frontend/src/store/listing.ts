import { create } from 'zustand';
import { apiFetch } from '../services/api';

export interface ListingItem {
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
}

export interface ListingDetail extends ListingItem {
  seller_id: string;
  seller_name: string | null;
  seller_phone: string | null;
  mileage: number | null;
  condition: string;
  body_type: string | null;
  engine_size: string | null;
  fuel_type: string | null;
  color: string | null;
  vin: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  show_phone: boolean;
  status: string;
  photos: { id: string; url: string; thumbnail_url: string | null; photo_type: string; position: number }[];
  views_count: number;
}

interface ListingState {
  listings: ListingItem[];
  total: number;
  page: number;
  limit: number;
  filters: Record<string, string | number | undefined>;
  currentListing: ListingDetail | null;
  isLoading: boolean;
  error: string | null;
  search: (filters?: Record<string, string | number | undefined>) => Promise<void>;
  fetchListing: (id: string) => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: Record<string, string | number | undefined>) => void;
}

export const useListingStore = create<ListingState>((set, get) => ({
  listings: [],
  total: 0,
  page: 1,
  limit: 20,
  filters: {},
  currentListing: null,
  isLoading: false,
  error: null,

  search: async (filters) => {
    const f = filters || get().filters;
    set({ isLoading: true, error: null });
    try {
      const params: Record<string, string | number> = {};
      Object.entries(f).forEach(([key, value]) => {
        if (value !== undefined && value !== '') params[key] = value;
      });
      params.page = get().page;
      params.limit = get().limit;
      const data = await apiFetch<{ items: ListingItem[]; total: number }>('/listings', { params });
      set({ listings: data.items, total: data.total, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  fetchListing: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch<ListingDetail>(`/listings/${id}`);
      set({ currentListing: data, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  setPage: (page) => {
    set({ page });
    get().search();
  },

  setFilters: (filters) => {
    set({ filters, page: 1 });
    get().search(filters);
  },
}));