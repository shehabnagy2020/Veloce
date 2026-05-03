import { TextInput, Group, Text, Stack, Alert, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { apiFetch } from '../../services/api';

interface VINCardProps {
  onVINDecoded: (data: VINDecodeResult) => void;
  onManualEntry: () => void;
}

export interface VINDecodeResult {
  make: string;
  model: string;
  year: number | null;
  engine_size: string;
  transmission: string;
  body_type: string;
  fuel_type: string;
}

export function VINCard({ onVINDecoded, onManualEntry }: VINCardProps) {
  const { t } = useTranslation();
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<VINDecodeResult | null>(null);

  const handleDecode = async () => {
    if (vin.length !== 17) {
      setError('VIN must be 17 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<VINDecodeResult>('/vin/decode', {
        method: 'POST',
        body: JSON.stringify({ vin }),
      });
      setDecoded(result);
      onVINDecoded(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Text size="lg" fw={700} c="white">{t('listing.vinStep')}</Text>
      <TextInput
        placeholder={t('listing.vinPlaceholder')}
        value={vin}
        onChange={(e) => setVin(e.currentTarget.value.toUpperCase())}
        maxLength={17}
        error={error}
      />
      <Group>
        <Button onClick={handleDecode} loading={loading}>
          {t('listing.vinDecode')}
        </Button>
        <Button variant="subtle" color="gray" onClick={onManualEntry}>
          {t('listing.vinManualEntry')}
        </Button>
      </Group>
      {decoded && (
        <Alert color="green" title={t('listing.vinAutoFilled')}>
          <Stack gap={4}>
            <Text size="sm" c="dimmed">Make: {decoded.make}</Text>
            <Text size="sm" c="dimmed">Model: {decoded.model}</Text>
            <Text size="sm" c="dimmed">Year: {decoded.year}</Text>
            <Text size="sm" c="dimmed">Engine: {decoded.engine_size}</Text>
            <Text size="sm" c="dimmed">Transmission: {decoded.transmission}</Text>
          </Stack>
        </Alert>
      )}
    </Stack>
  );
}