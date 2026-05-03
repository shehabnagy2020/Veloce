import { Container, Grid, Card, Text, Group, Badge, SimpleGrid, Pagination, Stack, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useListingStore, ListingItem } from '../store/listing';
import { SearchFilters } from '../components/search/SearchFilters';
import { PriceIndicator } from '../components/search/PriceIndicator';
import { useListingSearchParams } from '../hooks/useSearchParams';
import { useNavigate } from 'react-router-dom';
import { IconMapPin, IconEngine, IconCalendar } from '@tabler/icons-react';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-EG', { style: 'decimal', maximumFractionDigits: 0 }).format(price) + ' EGP';
}

function ListingCard({ listing }: { listing: ListingItem }) {
  const navigate = useNavigate();
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      bg="#12151C"
      style={{ cursor: 'pointer', border: '1px solid #1A1F2B' }}
      onClick={() => navigate(`/listings/${listing.id}`)}
    >
      {listing.thumbnail_url && (
        <Card.Section>
          <img src={listing.thumbnail_url} alt={`${listing.make} ${listing.model}`} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
        </Card.Section>
      )}
      <Group justify="space-between" mt="md">
        <div>
          <Text fw={700} size="lg" c="white">{listing.make} {listing.model}</Text>
          <Group gap={4}>
            <IconCalendar size={14} color="#868E96" />
            <Text size="sm" c="dimmed">{listing.year}</Text>
            <IconEngine size={14} color="#868E96" />
            <Text size="sm" c="dimmed">{listing.transmission}</Text>
          </Group>
        </div>
        <PriceIndicator indicator={listing.price_indicator as any} />
      </Group>
      <Group justify="space-between" mt="sm">
        <Text fw={700} size="xl" c="#4DABF7">{formatPrice(listing.price)}</Text>
        <Group gap={4}>
          <IconMapPin size={14} color="#868E96" />
          <Text size="sm" c="dimmed">{listing.district}</Text>
        </Group>
      </Group>
    </Card>
  );
}

export function SearchPage() {
  const { t } = useTranslation();
  const { filters, updateFilters } = useListingSearchParams();
  const { listings, total, page, limit, isLoading, search, setPage } = useListingStore();

  useEffect(() => {
    const apiFilters: Record<string, string | number | undefined> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') apiFilters[key] = value;
    });
    search(apiFilters);
  }, []);

  const totalPages = Math.ceil(total / limit);

  return (
    <Container size="xl" py="xl">
      <Grid>
        <Grid.Col span={3}>
          <Card bg="#12151C" p="md" radius="md" style={{ border: '1px solid #1A1F2B' }}>
            <Text fw={700} size="lg" c="white" mb="md">{t('search.filters')}</Text>
            <SearchFilters filters={filters} onChange={updateFilters} />
          </Card>
        </Grid.Col>
        <Grid.Col span={9}>
          <Text size="sm" c="dimmed" mb="md">
            {t('search.results', { count: total })}
          </Text>
          {isLoading ? (
            <Text c="dimmed" ta="center" py={40}>{t('common.loading')}</Text>
          ) : listings.length === 0 ? (
            <Text c="dimmed" ta="center" py={40}>{t('search.noResults')}</Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </SimpleGrid>
          )}
          {totalPages > 1 && (
            <Group justify="center" mt="xl">
              <Pagination total={totalPages} value={page} onChange={setPage} color="blue" />
            </Group>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}