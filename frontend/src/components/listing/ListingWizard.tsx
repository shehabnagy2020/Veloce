import { useState, useCallback } from 'react';
import { Stepper, Button, Group, Container, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { VINCard, VINDecodeResult } from './VINCard';
import { PriceCard } from './PriceCard';
import { PhotoCard, CapturedPhoto } from './PhotoCard';
import { DetailsCard } from './DetailsCard';
import { apiFetch, apiUpload } from '../../services/api';
import { notifications } from '@mantine/notifications';

export function ListingWizard() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);

  // Step 1: VIN data
  const [vinData, setVinData] = useState<VINDecodeResult | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | null>(null);

  // Step 2: Price
  const [price, setPrice] = useState(0);
  const [priceIndicator, setPriceIndicator] = useState<string | null>(null);

  // Step 3: Photos
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);

  // Step 4: Details
  const [condition, setCondition] = useState('used');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [showPhone, setShowPhone] = useState(false);

  // Draft management
  const [listingId, setListingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleVINDecoded = useCallback((data: VINDecodeResult) => {
    setVinData(data);
    setMake(data.make);
    setModel(data.model);
    setYear(data.year);
  }, []);

  const handleManualEntry = useCallback(() => {
    setManualMode(true);
  }, []);

  const saveDraft = async () => {
    setSaving(true);
    try {
      if (listingId) {
        await apiFetch(`/listings/${listingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ make, model, year, price, condition, district, description, showPhone }),
        });
      } else {
        const result = await apiFetch<{ id: string }>('/listings', {
          method: 'POST',
          body: JSON.stringify({ make, model, year, price, transmission: vinData?.transmission || 'automatic', condition, district, description, showPhone }),
        });
        setListingId(result.id);
      }
      notifications.show({ title: t('listing.draftSaved'), message: '', color: 'green' });
    } catch (e) {
      notifications.show({ title: t('common.error'), message: (e as Error).message, color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);
    try {
      if (!listingId) {
        const result = await apiFetch<{ id: string }>('/listings', {
          method: 'POST',
          body: JSON.stringify({ make, model, year, price, transmission: vinData?.transmission || 'automatic', condition, district, description, showPhone, status: 'published' }),
        });
        setListingId(result.id);
      } else {
        await apiFetch(`/listings/${listingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'published' }),
        });
      }

      // Upload photos
      for (const photo of photos) {
        await apiUpload(`/listings/${listingId}/photos`, photo.file, {
          photo_type: photo.type,
          position: String(photos.indexOf(photo)),
        });
      }

      notifications.show({ title: t('listing.published'), message: '', color: 'green' });
    } catch (e) {
      notifications.show({ title: t('common.error'), message: (e as Error).message, color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (active) {
      case 0: return manualMode || !!vinData;
      case 1: return price > 0;
      case 2: return photos.length > 0;
      case 3: return condition !== '' && district !== '';
      default: return true;
    }
  };

  return (
    <Container size="md" py="xl">
      <Stepper active={active} onStepClick={setActive} color="blue" styles={{ stepLabel: { color: '#868E96' } }}>
        <Stepper.Step label={t('listing.vinStep')} />
        <Stepper.Step label={t('listing.priceStep')} />
        <Stepper.Step label={t('listing.photoStep')} />
        <Stepper.Step label={t('listing.detailsStep')} />
      </Stepper>

      <Stack gap="xl" mt="xl">
        {active === 0 && (
          <VINCard onVINDecoded={handleVINDecoded} onManualEntry={handleManualEntry} />
        )}
        {active === 1 && (
          <PriceCard price={price} priceIndicator={priceIndicator} onPriceChange={setPrice} />
        )}
        {active === 2 && (
          <PhotoCard photos={photos} onPhotosChange={setPhotos} />
        )}
        {active === 3 && (
          <DetailsCard
            condition={condition} district={district}
            description={description} showPhone={showPhone}
            onChange={(data) => {
              if (data.condition !== undefined) setCondition(data.condition);
              if (data.district !== undefined) setDistrict(data.district);
              if (data.description !== undefined) setDescription(data.description);
              if (data.showPhone !== undefined) setShowPhone(data.showPhone);
            }}
          />
        )}
      </Stack>

      <Group justify="space-between" mt="xl">
        <Button variant="outline" color="gray" onClick={saveDraft} loading={saving}>
          {t('listing.saveDraft')}
        </Button>
        <Group>
          {active > 0 && (
            <Button variant="subtle" color="gray" onClick={() => setActive(active - 1)}>
              {t('common.back')}
            </Button>
          )}
          {active < 3 && (
            <Button onClick={() => setActive(active + 1)} disabled={!canProceed()}>
              {t('common.next')}
            </Button>
          )}
          {active === 3 && (
            <Button onClick={publish} loading={saving} disabled={!canProceed()}>
              {t('listing.publish')}
            </Button>
          )}
        </Group>
      </Group>
    </Container>
  );
}