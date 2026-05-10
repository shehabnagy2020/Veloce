'use client';

import { useCallback } from 'react';
import { useSearchParams as useNextSearchParams, useRouter, usePathname } from 'next/navigation';

export function useListingSearchParams() {
  const searchParams = useNextSearchParams();

  const filters = {
    make: searchParams?.get('make') || undefined,
    model: searchParams?.get('model') || undefined,
    priceMin: searchParams?.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined,
    priceMax: searchParams?.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined,
    yearMin: searchParams?.get('yearMin') ? parseInt(searchParams.get('yearMin')!) : undefined,
    yearMax: searchParams?.get('yearMax') ? parseInt(searchParams.get('yearMax')!) : undefined,
    transmission: searchParams?.get('transmission') || undefined,
    district: searchParams?.get('district') || undefined,
  };

  const router = useRouter();
  const pathname = usePathname();

  const updateFilters = useCallback((newFilters: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  return { filters, updateFilters };
}
