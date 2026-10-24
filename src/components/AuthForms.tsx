'use client';

import { useRouter } from 'next/navigation';
import { assertPasswordsMatch, newPasswordFields, universityIdField } from '@/lib/auth-fields';
import { api } from '@/lib/client-api';
import { safeNext } from '@/lib/safe-next';
import { useSession } from '@/lib/session';
import { Form } from './Form';

type Tokens = { accessToken: string };

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { signIn } = useSession();
  return (
    <Form
      submitLabel="Log in"
      fields={[
        universityIdField,
        { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' },
      ]}
      onSubmit={async (values) => {
        const { accessToken } = await api<Tokens>('/auth/login', { method: 'POST', json: values });
        await signIn(accessToken);
        router.replace(safeNext(next));
      }}
    />
  );
}

export function FirstLoginForm() {
  const router = useRouter();
  const { signIn } = useSession();
  return (
    <Form
      submitLabel="Set password and continue"
      fields={[
        universityIdField,
        {
          name: 'oneTimePassword',
          label: 'One-time password',
          autoComplete: 'one-time-code',
          hint: 'From the hall office, or the email sent when your seat was allotted.',
        },
        ...newPasswordFields(),
      ]}
      onSubmit={async (values) => {
        assertPasswordsMatch(values);
        const { accessToken } = await api<Tokens>('/auth/first-time-login', { method: 'POST', json: values });
        await signIn(accessToken);
        router.replace('/dashboard');
      }}
    />
  );
}

export function ForgotPasswordForm() {
  const router = useRouter();
  return (
    <Form
      submitLabel="Email me a code"
      fields={[universityIdField]}
      onSubmit={async ({ universityId }) => {
        await api('/auth/forgot-password', { method: 'POST', json: { universityId } });
        // The API answers the same whether or not the ID exists, so we do too
        router.push(`/reset-password?id=${universityId}`);
      }}
    />
  );
}

export function ResetPasswordForm({ universityId }: { universityId?: string }) {
  const router = useRouter();
  return (
    <Form
      submitLabel="Reset password"
      fields={[
        { ...universityIdField, defaultValue: universityId },
        {
          name: 'otp',
          label: '6-digit code',
          inputMode: 'numeric',
          pattern: '\\d{6}',
          maxLength: 6,
          autoComplete: 'one-time-code',
          hint: 'Check your email. The code expires in a few minutes.',
        },
        ...newPasswordFields(),
      ]}
      onSubmit={async ({ confirmPassword, ...values }) => {
        assertPasswordsMatch({ ...values, confirmPassword });
        await api('/auth/reset-password', { method: 'POST', json: values });
        router.replace('/login?reset=1');
      }}
    />
  );
}

export function ChangePasswordForm() {
  const router = useRouter();
  const { signOut } = useSession();
  return (
    <Form
      submitLabel="Change password"
      fields={[
        { name: 'oldPassword', label: 'Current password', type: 'password', autoComplete: 'current-password' },
        ...newPasswordFields(),
      ]}
      onSubmit={async (values) => {
        assertPasswordsMatch(values);
        await api('/auth/change-password', { method: 'POST', json: values });
        // The API signs out every device, this one included
        await signOut();
        router.replace('/login?changed=1');
      }}
    />
  );
}
