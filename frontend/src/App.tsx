import { MantineProvider, AppShell } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './i18n/en.json';
import ar from './i18n/ar.json';
import { veloceTheme } from './theme';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SearchPage } from './pages/SearchPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { MessagesPage } from './pages/MessagesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { QuizPage } from './pages/QuizPage';
import { GaragePage } from './pages/GaragePage';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const queryClient = new QueryClient();

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function App() {
  const { i18n: i18nInstance } = useTranslation();
  const location = useLocation();

  // Switch document direction based on language
  const dir = i18nInstance.language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = i18nInstance.language;

  return (
    <MantineProvider theme={veloceTheme} defaultColorScheme="dark">
      <QueryClientProvider client={queryClient}>
        <Notifications position="top-right" />
        <BrowserRouter>
          <AppShell header={{ height: 60 }} padding="md">
            <AppShell.Header
              styles={{ header: { backgroundColor: '#0B0E14', borderBottom: '1px solid #1A1F2B' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 20px' }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#4DABF7' }}>Veloce</span>
              </div>
            </AppShell.Header>
            <AppShell.Main styles={{ main: { backgroundColor: '#0B0E14' } }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Routes location={location}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<SearchPage />} />
                <Route path="/listings/:id" element={<ListingDetailPage />} />
                <Route path="/sell" element={<CreateListingPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:id" element={<MessagesPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/garage" element={<GaragePage />} />
              </Routes>
                </motion.div>
              </AnimatePresence>
            </AppShell.Main>
          </AppShell>
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
}