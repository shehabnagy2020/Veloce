import { useState } from 'react';
import { Table, Group, ActionIcon, Badge, Text, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../services/api';

interface BadgeItem {
  id: string;
  listing_id: string;
  badge_type: string;
  status: string;
  document_url: string | null;
  seller_name: string | null;
  created_at: string;
}

interface BadgeReviewTableProps {
  badges: BadgeItem[];
  onReview: (badgeId: string, status: 'approved' | 'rejected') => void;
}

export function BadgeReviewTable({ badges, onReview }: BadgeReviewTableProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);

  const handleReview = async (badgeId: string, status: 'approved' | 'rejected') => {
    setLoading(badgeId);
    try {
      await apiFetch(`/admin/badges/${badgeId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      onReview(badgeId, status);
    } catch (err) {
      console.error('Failed to review badge:', err);
    } finally {
      setLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge color="yellow" variant="outline">{t('badges.pending')}</Badge>;
      case 'approved': return <Badge color="green">{t('badges.approved')}</Badge>;
      case 'rejected': return <Badge color="red">{t('badges.rejected')}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (badges.length === 0) {
    return <Text c="dimmed" ta="center" py="lg">{t('badges.noPending')}</Text>;
  }

  return (
    <Stack gap="md">
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('badges.type')}</Table.Th>
            <Table.Th>{t('badges.seller')}</Table.Th>
            <Table.Th>{t('badges.status')}</Table.Th>
            <Table.Th>{t('badges.date')}</Table.Th>
            <Table.Th>{t('common.actions', 'Actions')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {badges.map((badge) => (
            <Table.Tr key={badge.id}>
              <Table.Td>{t(`badges.${badge.badge_type}`)}</Table.Td>
              <Table.Td>{badge.seller_name || '—'}</Table.Td>
              <Table.Td>{statusBadge(badge.status)}</Table.Td>
              <Table.Td>{new Date(badge.created_at).toLocaleDateString()}</Table.Td>
              <Table.Td>
                {badge.status === 'pending' && (
                  <Group gap="xs">
                    <ActionIcon
                      color="green"
                      variant="filled"
                      size="sm"
                      loading={loading === badge.id}
                      onClick={() => handleReview(badge.id, 'approved')}
                      aria-label={t('badges.approve', 'Approve')}
                    >
                      ✓
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="filled"
                      size="sm"
                      loading={loading === badge.id}
                      onClick={() => handleReview(badge.id, 'rejected')}
                      aria-label={t('badges.reject', 'Reject')}
                    >
                      ✕
                    </ActionIcon>
                  </Group>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}