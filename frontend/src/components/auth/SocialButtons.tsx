import { Button, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export function SocialButtons() {
  const { t } = useTranslation();

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/login/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/login/facebook`;
  };

  return (
    <Group grow>
      <Button variant="default" color="gray" onClick={handleGoogleLogin}>
        {t('auth.loginWithGoogle')}
      </Button>
      <Button variant="default" color="blue" onClick={handleFacebookLogin}>
        {t('auth.loginWithFacebook')}
      </Button>
    </Group>
  );
}