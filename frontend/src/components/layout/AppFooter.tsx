import { Container, Group, Text, Anchor, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export function AppFooter() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Container size="lg" py="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4}>
          <Text fw={800} size="lg" c="#4DABF7">{t('common.appName')}</Text>
          <Text size="xs" c="dimmed">{t('common.appTagline')}</Text>
        </Stack>
        <Group gap="lg">
          <Anchor size="sm" c="dimmed" onClick={() => router.push('/search')}>{t('common.browseCars')}</Anchor>
          <Anchor size="sm" c="dimmed" onClick={() => router.push('/sell')}>{t('common.sellCar')}</Anchor>
          <Anchor size="sm" c="dimmed" onClick={() => router.push('/quiz')}>{t('common.takeQuiz')}</Anchor>
        </Group>
      </Group>
      <Text ta="center" size="xs" c="dimmed" mt="md">
        &copy; {new Date().getFullYear()} Veloce. All rights reserved.
      </Text>
    </Container>
  );
}