'use client';

import { Container, Title, Text, Button, Group, Stack, SimpleGrid, Card, ThemeIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { IconSearch, IconCar, IconClipboardList, IconCarGarage } from '@tabler/icons-react';

export function LandingPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const features = [
    {
      icon: IconSearch,
      title: t('common.browseCars'),
      description: t('search.title'),
      onClick: () => router.push('/search'),
    },
    {
      icon: IconCar,
      title: t('common.sellCar'),
      description: t('listing.create'),
      onClick: () => router.push('/sell'),
    },
    {
      icon: IconClipboardList,
      title: t('common.takeQuiz'),
      description: t('quiz.title'),
      onClick: () => router.push('/quiz'),
    },
    {
      icon: IconCarGarage,
      title: t('common.myGarage'),
      description: t('garage.title'),
      onClick: () => router.push('/garage'),
    },
  ];

  return (
    <Container size="lg">
      <Stack align="center" py={80} gap="md">
        <Title order={1} c="white" ta="center" fz={48} fw={900}>
          {t('common.appName')}
        </Title>
        <Text c="dimmed" size="xl" ta="center" maw={500}>
          {t('common.appTagline')}
        </Text>
        <Group mt="lg">
          <Button size="lg" onClick={() => router.push('/search')}>
            {t('common.browseCars')}
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/sell')}>
            {t('common.sellCar')}
          </Button>
        </Group>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" pb={80}>
        {features.map((f) => (
          <Card
            key={f.title}
            bg="#12151C"
            p="xl"
            radius="md"
            style={{ border: '1px solid #1A1F2B', cursor: 'pointer' }}
            onClick={f.onClick}
          >
            <Stack align="center" gap="md">
              <ThemeIcon size={56} radius="md" variant="light" color="blue">
                <f.icon size={28} />
              </ThemeIcon>
              <Text fw={700} size="lg" c="white" ta="center">{f.title}</Text>
              <Text size="sm" c="dimmed" ta="center">{f.description}</Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}

export default LandingPage;
