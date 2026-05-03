import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useListingSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    make: searchParams.get('make') || undefined,
    model: searchParams.get('model') || undefined,
    priceMin: searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined,
    priceMax: searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined,
    yearMin: searchParams.get('yearMin') ? parseInt(searchParams.get('yearMin')!) : undefined,
    yearMax: searchParams.get('yearMax') ? parseInt(searchParams.get('yearMax')!) : undefined,
    transmission: searchParams.get('transmission') || undefined,
    district: searchParams.get('district') || undefined,
  };

  const updateFilters = useCallback((newFilters: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  return { filters, updateFilters };
}