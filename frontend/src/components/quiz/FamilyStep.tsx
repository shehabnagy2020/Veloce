import { Slider, Text, Stack, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface FamilyStepProps {
  value: number;
  onChange: (value: number) => void;
}

export function FamilyStep({ value, onChange }: FamilyStepProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="md" align="center">
      <Text size="lg" fw={600}>{t('quiz.family')}</Text>
      <Box style={{ width: '100%', maxWidth: 400 }}>
        <Slider
          value={value}
          onChange={onChange}
          min={1}
          max={8}
          step={1}
          marks={[
            { value: 1, label: '1' },
            { value: 3, label: '3' },
            { value: 5, label: '5' },
            { value: 8, label: '8' },
          ]}
          label={`${value}`}
        />
      </Box>
      <Text size="xl" fw={800} c="blue">{value}</Text>
    </Stack>
  );
}