import { Container, Title, Text, Stack, Card, Group, Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { PriceIndicator } from '../components/search/PriceIndicator';

export function GaragePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const isOffline = !navigator.onLine;

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" align="center" mb="lg">
        <Title order={2}>{t('garage.title')}</Title>
        {isOffline && <Badge color="yellow" variant="outline">{t('garage.offline')}</Badge>}
      </Group>

      {favorites.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">{t('garage.noFavorites')}</Text>
      ) : (
        <Stack gap="md">
          {favorites.map((listing) => (
            <Card
              key={listing.id}
              bg="#12151C"
              p="md"
              radius="md"
              style={{ border: '1px solid #1A1F2B', cursor: 'pointer' }}
              onClick={() => navigate(`/listings/${listing.id}`)}
            >
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={700} c="white">{listing.make} {listing.model} {listing.year}</Text>
                  <Text size="sm" c="dimmed">{listing.transmission} · {listing.district}</Text>
                </div>
                <Group gap="xs">
                  <PriceIndicator indicator={listing.price_indicator as any} />
                  <Text fw={800} c="#4DABF7">
                    {new Intl.NumberFormat('en-EG', { maximumFractionDigits: 0 }).format(listing.price)} EGP
                  </Text>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}