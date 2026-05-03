import { Slider, Text, Stack, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface BudgetStepProps {
  value: number;
  onChange: (value: number) => void;
}

const EGP_STEP = 25000;

export function BudgetStep({ value, onChange }: BudgetStepProps) {
  const { t } = useTranslation();

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('en-EG', { maximumFractionDigits: 0 }).format(val) + ' EGP';

  return (
    <Stack gap="md" align="center">
      <Text size="lg" fw={600}>{t('quiz.budget')}</Text>
      <Box style={{ width: '100%', maxWidth: 400 }}>
        <Slider
          value={value}
          onChange={onChange}
          min={100000}
          max={5000000}
          step={EGP_STEP}
          marks={[
            { value: 100000, label: '100K' },
            { value: 1000000, label: '1M' },
            { value: 2500000, label: '2.5M' },
            { value: 5000000, label: '5M' },
          ]}
          label={formatPrice(value)}
        />
      </Box>
      <Text size="xl" fw={800} c="blue">{formatPrice(value)}</Text>
    </Stack>
  );
}