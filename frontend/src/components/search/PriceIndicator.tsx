import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface PriceIndicatorProps {
  indicator: 'below_average' | 'at_average' | 'above_average' | null;
}

export function PriceIndicator({ indicator }: PriceIndicatorProps) {
  const { t } = useTranslation();

  if (!indicator) return null;

  const config = {
    below_average: { color: 'green', label: t('listing.priceBelowAvg') },
    at_average: { color: 'blue', label: t('listing.priceAtAvg') },
    above_average: { color: 'red', label: t('listing.priceAboveAvg') },
  };

  const { color, label } = config[indicator];

  return (
    <Badge color={color} variant="light" size="sm">
      {label}
    </Badge>
  );
}