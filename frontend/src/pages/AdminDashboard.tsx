import { useState, useEffect } from 'react';
import { Container, Title, Tabs, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../services/api';
import { BadgeReviewTable } from '../components/badges/BadgeReviewTable';

interface BadgeItem {
  id: string;
  listing_id: string;
  badge_type: string;
  status: string;
  document_url: string | null;
  seller_name: string | null;
  created_at: string;
}

export function AdminDashboard() {
  const { t } = useTranslation();
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [total, setTotal] = useState(0);

  const fetchBadges = async (status?: string) => {
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      const data = await apiFetch<{ items: BadgeItem[]; total: number }>('/admin/badges', { params });
      setBadges(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch badges:', err);
    }
  };

  useEffect(() => {
    fetchBadges(activeTab === 'all' ? undefined : activeTab);
  }, [activeTab]);

  const handleReview = (badgeId: string, status: 'approved' | 'rejected') => {
    setBadges((prev) =>
      prev.map((b) => (b.id === badgeId ? { ...b, status } : b))
    );
  };

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">{t('admin.dashboard', 'Admin Dashboard')}</Title>

      <Tabs value={activeTab} onChange={(v) => setActiveTab(v || 'pending')}>
        <Tabs.List>
          <Tabs.Tab value="pending">
            {t('badges.pending')} ({activeTab === 'pending' ? total : ''})
          </Tabs.Tab>
          <Tabs.Tab value="approved">{t('badges.approved')}</Tabs.Tab>
          <Tabs.Tab value="rejected">{t('badges.rejected')}</Tabs.Tab>
          <Tabs.Tab value="all">{t('admin.all', 'All')}</Tabs.Tab>
        </Tabs.List>

        <Stack mt="md">
          <BadgeReviewTable badges={badges} onReview={handleReview} />
        </Stack>
      </Tabs>
    </Container>
  );
}