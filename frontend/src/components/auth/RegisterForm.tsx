import { TextInput, PasswordInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth';

export function RegisterForm() {
  const { t } = useTranslation();
  const register = useAuthStore((s) => s.register);

  const form = useForm({
    initialValues: { email: '', password: '', confirmPassword: '', display_name: '' },
    validate: {
      email: (v) => (!v ? 'Email is required' : null),
      password: (v) => (v.length < 8 ? 'Password must be at least 8 characters' : null),
      confirmPassword: (v, vals) => (v !== vals.password ? 'Passwords do not match' : null),
      display_name: (v) => (!v ? 'Name is required' : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(async (vals) => { await register(vals.email, vals.password, vals.display_name); })}>
      <Stack gap="md">
        <TextInput label={t('auth.displayName')} {...form.getInputProps('display_name')} />
        <TextInput label={t('auth.email')} {...form.getInputProps('email')} />
        <PasswordInput label={t('auth.password')} {...form.getInputProps('password')} />
        <PasswordInput label={t('auth.confirmPassword')} {...form.getInputProps('confirmPassword')} />
        <Button type="submit" fullWidth>{t('auth.register')}</Button>
      </Stack>
    </form>
  );
}