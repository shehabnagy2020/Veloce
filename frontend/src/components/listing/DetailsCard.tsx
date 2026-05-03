import { Select, Textarea, Switch, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

const EGYPTIAN_DISTRICTS = [
  'New Cairo', 'Maadi', 'Dokki', 'Zamalek', 'Heliopolis', 'Nasr City',
  '6th October', 'Sheikh Zayed', 'Haram', 'Shubra', 'Ain Shams', 'Mokattam',
  'El Marg', 'El Rehab', 'Madinati', 'Tagamoa', 'Obour City', 'Badr City',
];

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used_like_new', label: 'Like New' },
  { value: 'used', label: 'Used' },
];

interface DetailsCardProps {
  condition: string;
  district: string;
  description: string;
  showPhone: boolean;
  onChange: (data: { condition?: string; district?: string; description?: string; showPhone?: boolean }) => void;
}

export function DetailsCard({ condition, district, description, showPhone, onChange }: DetailsCardProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <Text size="lg" fw={700} c="white">{t('listing.detailsStep')}</Text>
      <Select
        label={t('listing.condition')}
        data={CONDITIONS}
        value={condition}
        onChange={(v) => onChange({ condition: v || undefined })}
      />
      <Select
        label={t('search.district')}
        data={EGYPTIAN_DISTRICTS.map(d => ({ value: d, label: d }))}
        value={district}
        onChange={(v) => onChange({ district: v || undefined })}
        searchable
      />
      <Textarea
        label={t('common.edit') + ' description'}
        placeholder="Add any additional details about your car..."
        value={description}
        onChange={(e) => onChange({ description: e.currentTarget.value })}
        minRows={3}
      />
      <Switch
        label={t('listing.showPhone')}
        checked={showPhone}
        onChange={(e) => onChange({ showPhone: e.currentTarget.checked })}
      />
    </Stack>
  );
}