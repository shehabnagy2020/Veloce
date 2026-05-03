import { TextInput, PasswordInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth';

export function LoginForm() {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (!v ? t('auth.email') + ' is required' : null),
      password: (v) => (!v ? t('auth.password') + ' is required' : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(async (vals) => { await login(vals.email, vals.password); })}>
      <Stack gap="md">
        <TextInput label={t('auth.email')} {...form.getInputProps('email')} />
        <PasswordInput label={t('auth.password')} {...form.getInputProps('password')} />
        <Button type="submit" fullWidth>{t('auth.login')}</Button>
      </Stack>
    </form>
  );
}