'use client';

import { MantineProvider, AppShell } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import i18n from '../i18n/config';
import { veloceTheme } from '../theme';
import { AppHeader } from '../components/layout/AppHeader';
import { AppFooter } from '../components/layout/AppFooter';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      setLang(lng);
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lng;
    };

    i18n.on('languageChanged', handleLangChange);
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    setLang(i18n.language);

    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  return (
    <html lang={lang}>
      <body>
        <MantineProvider theme={veloceTheme} defaultColorScheme="dark">
          <QueryClientProvider client={queryClient}>
            <Notifications position="top-right" />
            <AppShell
              header={{ height: 60 }}
              footer={{ height: 70 }}
              padding="md"
            >
              <AppShell.Header
                styles={{ header: { backgroundColor: '#0B0E14', borderBottom: '1px solid #1A1F2B' } }}
              >
                <AppHeader />
              </AppShell.Header>

              <AppShell.Main styles={{ main: { backgroundColor: '#0B0E14' } }}>
                {children}
              </AppShell.Main>

              <AppShell.Footer
                styles={{ footer: { backgroundColor: '#0B0E14', borderTop: '1px solid #1A1F2B' } }}
              >
                <AppFooter />
              </AppShell.Footer>
            </AppShell>
          </QueryClientProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
