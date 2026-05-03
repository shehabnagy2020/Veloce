import { Badge, Tooltip, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface VerificationBadgeProps {
  badgeType: 'one_owner' | 'service_book_verified';
  status: 'pending' | 'approved' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
}

const badgeConfig = {
  one_owner: { icon: '🔑', color: 'blue' },
  service_book_verified: { icon: '📋', color: 'green' },
} as const;

export function VerificationBadge({ badgeType, status, size = 'md' }: VerificationBadgeProps) {
  const { t } = useTranslation();
  const config = badgeConfig[badgeType];

  if (status === 'rejected') return null;

  if (status === 'pending') {
    return (
      <Badge variant="outline" color="gray" size={size}>
        {config.icon} {t(`badges.${badgeType}`)} ({t('badges.pending')})
      </Badge>
    );
  }

  return (
    <Tooltip label={t(`badges.${badgeType}Desc`)} withArrow>
      <Box style={{ display: 'inline-block' }}>
        <Badge variant="filled" color={config.color} size={size}>
          {config.icon} {t(`badges.${badgeType}`)}
        </Badge>
      </Box>
    </Tooltip>
  );
}