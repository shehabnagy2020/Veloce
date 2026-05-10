'use client';

import { useState, useEffect } from 'react';
import { Container, Grid, Card, Text, Group, Stack, Image, Button, Divider, Modal, ActionIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useListingStore } from '../store/listing';
import { useFavorites } from '../hooks/useFavorites';
import { PriceIndicator } from '../components/search/PriceIndicator';
import { VerificationBadge } from '../components/badges/VerificationBadge';
import { DrivewayFit } from '../components/driveway/DrivewayFit';
import { IconMapPin, IconEngine, IconCalendar, IconPhone, IconEye, IconHeart, IconHeartFilled } from '@tabler/icons-react';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-EG', { style: 'decimal', maximumFractionDigits: 0 }).format(price) + ' EGP';
}

export function ListingDetailPage({ listingId }: { listingId?: string }) {
  const { t } = useTranslation();
  const { currentListing, isLoading, error, fetchListing } = useListingStore();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [drivewayOpen, setDrivewayOpen] = useState(false);

  useEffect(() => {
    if (listingId) fetchListing(listingId);
  }, [listingId]);

  if (isLoading) return <Container py={40}><Text c="dimmed" ta="center">{t('common.loading')}</Text></Container>;
  if (error) return <Container py={40}><Text c="red" ta="center">{t('common.error')}</Text></Container>;
  if (!currentListing) return <Container py={40}><Text c="dimmed" ta="center">{t('common.noResults')}</Text></Container>;

  const listing = currentListing;

  return (
    <Container size="lg" py="xl">
      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            {listing.photos && listing.photos.length > 0 ? (
              listing.photos.sort((a, b) => a.position - b.position).map((photo) => (
                <Image key={photo.id} src={photo.url} radius="md" alt={`${listing.make} ${listing.model}`} />
              ))
            ) : (
              <Card bg="#12151C" p={80} radius="md" style={{ border: '1px solid #1A1F2B' }}>
                <Text c="dimmed" ta="center">No photos available</Text>
              </Card>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card bg="#12151C" p="lg" radius="md" style={{ border: '1px solid #1A1F2B' }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={800} size="xl" c="white">{listing.make} {listing.model}</Text>
                <Group gap={4} mt={4}>
                  <IconCalendar size={14} color="#868E96" />
                  <Text size="sm" c="dimmed">{listing.year}</Text>
                  <IconEngine size={14} color="#868E96" />
                  <Text size="sm" c="dimmed">{listing.transmission}</Text>
                </Group>
              </div>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  color={isFavorited(listing.id) ? 'red' : 'gray'}
                  size="lg"
                  onClick={() => toggleFavorite(listing)}
                >
                  {isFavorited(listing.id) ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
                </ActionIcon>
                <PriceIndicator indicator={listing.price_indicator as any} />
              </Group>
            </Group>

            <Text fw={800} size="2xl" c="#4DABF7" mt="md">{formatPrice(listing.price)}</Text>

            <Divider my="md" color="#1A1F2B" />

            <Stack gap={8}>
              {listing.mileage && <Text size="sm" c="dimmed">Mileage: {listing.mileage.toLocaleString()} km</Text>}
              {listing.condition && <Text size="sm" c="dimmed">Condition: {listing.condition}</Text>}
              {listing.body_type && <Text size="sm" c="dimmed">Body: {listing.body_type}</Text>}
              {listing.engine_size && <Text size="sm" c="dimmed">Engine: {listing.engine_size}</Text>}
              {listing.fuel_type && <Text size="sm" c="dimmed">Fuel: {listing.fuel_type}</Text>}
              {listing.color && <Text size="sm" c="dimmed">Color: {listing.color}</Text>}
            </Stack>

            <Group gap={4} mt="md">
              <IconMapPin size={14} color="#868E96" />
              <Text size="sm" c="dimmed">{listing.district}</Text>
            </Group>

            <Group gap={4} mt={4}>
              <IconEye size={14} color="#868E96" />
              <Text size="sm" c="dimmed">{t('listing.views', { count: listing.views_count })}</Text>
            </Group>

            {listing.badges && listing.badges.length > 0 && (
              <Group mt="md">
                {listing.badges.map((badge, i) => (
                  <VerificationBadge
                    key={i}
                    badgeType={badge.badge_type as 'one_owner' | 'service_book_verified'}
                    status={badge.status as 'pending' | 'approved' | 'rejected'}
                  />
                ))}
              </Group>
            )}

            {listing.description && (
              <>
                <Divider my="md" color="#1A1F2B" />
                <Text size="sm" c="dimmed">{listing.description}</Text>
              </>
            )}

            <Group mt="xl">
              <Button fullWidth size="lg" color="blue">{t('messaging.messageSeller')}</Button>
              <Button fullWidth size="lg" variant="outline" color="blue" onClick={() => setDrivewayOpen(true)}>
                {t('driveway.fitButton', 'Driveway Fit')}
              </Button>
              {listing.show_phone && listing.seller_phone && (
                <Button fullWidth size="lg" variant="default" color="gray" leftSection={<IconPhone size={16} />}>
                  {listing.seller_phone}
                </Button>
              )}
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Modal
        opened={drivewayOpen}
        onClose={() => setDrivewayOpen(false)}
        title={t('driveway.fitTitle', 'Driveway Fit')}
        size="lg"
        styles={{ body: { backgroundColor: '#0B0E14' }, header: { backgroundColor: '#0B0E14' } }}
      >
        <DrivewayFit bodyType={listing.body_type} onClose={() => setDrivewayOpen(false)} />
      </Modal>
    </Container>
  );
}

export default ListingDetailPage;
