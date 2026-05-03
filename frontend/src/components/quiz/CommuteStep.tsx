import { Slider, Text, Stack, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface CommuteStepProps {
  value: number;
  onChange: (value: number) => void;
}

export function CommuteStep({ value, onChange }: CommuteStepProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="md" align="center">
      <Text size="lg" fw={600}>{t('quiz.commute')}</Text>
      <Box style={{ width: '100%', maxWidth: 400 }}>
        <Slider
          value={value}
          onChange={onChange}
          min={5}
          max={100}
          step={5}
          marks={[
            { value: 5, label: '5' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
            { value: 75, label: '75' },
            { value: 100, label: '100' },
          ]}
          label={`${value} km`}
        />
      </Box>
      <Text size="xl" fw={800} c="blue">{value} km</Text>
    </Stack>
  );
}