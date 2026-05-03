import { Select, RangeSlider } from '@mantine/core';
import { useTranslation } from 'react-i18next';

const EGYPTIAN_DISTRICTS = [
  'New Cairo', 'Maadi', 'Dokki', 'Zamalek', 'Heliopolis', 'Nasr City',
  '6th October', 'Sheikh Zayed', 'Haram', 'Shubra', 'Ain Shams', 'Mokattam',
  'El Marg', 'El Rehab', 'Madinati', 'Tagamoa', 'Obour City', 'Badr City',
];

const MAKES = [
  'Toyota', 'Hyundai', 'Nissan', 'Kia', 'Chevrolet', 'BMW', 'Mercedes-Benz',
  'Volkswagen', 'Honda', 'MG', 'Suzuki', 'Renault', 'Peugeot', 'Fiat',
];

const TRANSMISSIONS = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
];

interface SearchFiltersProps {
  filters: {
    make?: string;
    model?: string;
    priceMin?: number;
    priceMax?: number;
    yearMin?: number;
    yearMax?: number;
    transmission?: string;
    district?: string;
  };
  onChange: (filters: SearchFiltersProps['filters']) => void;
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const { t } = useTranslation();

  const handleChange = (key: string, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => String(currentYear - i));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Select
        label={t('search.make')}
        placeholder={t('search.any')}
        data={MAKES.map(m => ({ value: m, label: m }))}
        value={filters.make || ''}
        onChange={(v) => handleChange('make', v || undefined)}
        clearable
      />
      <Select
        label={t('search.model')}
        placeholder={t('search.any')}
        data={[]}
        value={filters.model || ''}
        onChange={(v) => handleChange('model', v || undefined)}
        clearable
        searchable
      />
      <RangeSlider
        label={t('search.priceRange')}
        min={0}
        max={5000000}
        step={50000}
        value={[filters.priceMin || 0, filters.priceMax || 5000000]}
        onChange={([min, max]) => onChange({ ...filters, priceMin: min, priceMax: max })}
        marks={[
          { value: 0, label: '0' },
          { value: 1000000, label: '1M' },
          { value: 2500000, label: '2.5M' },
          { value: 5000000, label: '5M' },
        ]}
      />
      <Select
        label={t('search.yearRange')}
        placeholder={t('search.any')}
        data={years.map(y => ({ value: y, label: y }))}
        value={String(filters.yearMin || '')}
        onChange={(v) => handleChange('yearMin', v ? parseInt(v) : undefined)}
        clearable
      />
      <Select
        label={t('search.transmission')}
        placeholder={t('search.any')}
        data={TRANSMISSIONS}
        value={filters.transmission || ''}
        onChange={(v) => handleChange('transmission', v || undefined)}
        clearable
      />
      <Select
        label={t('search.district')}
        placeholder={t('search.any')}
        data={EGYPTIAN_DISTRICTS.map(d => ({ value: d, label: d }))}
        value={filters.district || ''}
        onChange={(v) => handleChange('district', v || undefined)}
        clearable
        searchable
      />
    </div>
  );
}