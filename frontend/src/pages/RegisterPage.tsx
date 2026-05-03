import { Paper, Title, Container, Divider } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { RegisterForm } from '../components/auth/RegisterForm';
import { SocialButtons } from '../components/auth/SocialButtons';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  const { t } = useTranslation();

  return (
    <Container size={420} my={40}>
      <Title ta="center" c="white">{t('auth.createAccount')}</Title>
      <Paper withBorder p="xl" mt="xl" radius="md" bg="#12151C">
        <SocialButtons />
        <Divider label={t('auth.orEmail')} mt="lg" mb="lg" color="#2E3441" />
        <RegisterForm />
      </Paper>
      <p style={{ textAlign: 'center', marginTop: 16, color: '#868E96' }}>
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" style={{ color: '#4DABF7' }}>{t('auth.login')}</Link>
      </p>
    </Container>
  );
}