import { Group, Button, ActionIcon, Menu, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../store/auth';
import { IconSearch, IconCar, IconClipboardList, IconCarGarage, IconMessages, IconUser, IconLogout, IconLogin } from '@tabler/icons-react';

const NAV_ITEMS = [
  { path: '/search', icon: IconSearch, labelKey: 'common.browseCars' },
  { path: '/sell', icon: IconCar, labelKey: 'common.sellCar' },
  { path: '/quiz', icon: IconClipboardList, labelKey: 'common.takeQuiz' },
  { path: '/garage', icon: IconCarGarage, labelKey: 'common.myGarage' },
  { path: '/messages', icon: IconMessages, labelKey: 'common.messages' },
];

export function AppHeader() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
        <span style={{ fontSize: 22, fontWeight: 900, color: '#4DABF7', letterSpacing: -0.5 }}>Veloce</span>
      </Group>

      <Group gap={4} visibleFrom="sm">
        {NAV_ITEMS.map((item) => {
          const active = pathname ? pathname.startsWith(item.path) : false;
          return (
            <Button
              key={item.path}
              variant={active ? 'light' : 'subtle'}
              color={active ? 'blue' : 'gray'}
              size="xs"
              leftSection={<item.icon size={16} />}
              onClick={() => router.push(item.path)}
            >
              {t(item.labelKey)}
            </Button>
          );
        })}
      </Group>

      <Group gap="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={toggleLang}
          title={i18n.language === 'en' ? 'العربية' : 'English'}
        >
          <Text size="xs" fw={700}>{i18n.language === 'en' ? 'AR' : 'EN'}</Text>
        </ActionIcon>

        {isAuthenticated ? (
          <Menu shadow="md" width={160}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="lg">
                <IconUser size={20} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={() => { logout(); router.push('/'); }}
              >
                {t('common.logout')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Button
            size="xs"
            variant="light"
            leftSection={<IconLogin size={14} />}
            onClick={() => router.push('/login')}
          >
            {t('common.login')}
          </Button>
        )}
      </Group>
    </Group>
  );
}