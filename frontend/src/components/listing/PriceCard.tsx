import { Slider, Stack, Text, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { PriceIndicator } from '../search/PriceIndicator';

interface PriceCardProps {
  price: number;
  priceIndicator: string | null;
  onPriceChange: (price: number) => void;
}

export function PriceCard({ price, priceIndicator, onPriceChange }: PriceCardProps) {
  const { t } = useTranslation();

  const formatEGP = (val: number) =>
    new Intl.NumberFormat('en-EG', { style: 'decimal', maximumFractionDigits: 0 }).format(val) + ' EGP';

  return (
    <Stack gap="md">
      <Text size="lg" fw={700} c="white">{t('listing.priceStep')}</Text>
      <Text size="sm" c="dimmed">{t('listing.priceSlider')}</Text>
      <Slider
        min={0}
        max={5000000}
        step={10000}
        value={price}
        onChange={onPriceChange}
        marks={[
          { value: 0, label: '0' },
          { value: 1000000, label: '1M' },
          { value: 2500000, label: '2.5M' },
          { value: 5000000, label: '5M' },
        ]}
        styles={{ markLabel: { color: '#868E96', fontSize: 11 } }}
      />
      <Group justify="space-between" mt="md">
        <Text fw={800} size="xl" c="#4DABF7">{formatEGP(price)}</Text>
        {priceIndicator && <PriceIndicator indicator={priceIndicator as any} />}
      </Group>
    </Stack>
  );
}