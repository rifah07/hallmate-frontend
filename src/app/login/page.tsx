import Link from 'next/link';
import { AuthShell } from '@/components/AuthShell';
import { LoginForm } from '@/components/AuthForms';

export const metadata = { title: 'Resident login' };

const NOTES: Record<string, string> = {
  reset: 'Your password has been reset. Log in with the new one.',
  changed: 'Password changed. Please log in again on each of your devices.',
};

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams;
  const note = Object.keys(NOTES).find((k) => params[k]);
  return (
    <AuthShell kicker="Residents" title="Welcome back" lead="Log in with your university ID.">
      {note && (
        <p className="notice-ok" role="status">
          {NOTES[note]}
        </p>
      )}
      <LoginForm next={typeof params.next === 'string' ? params.next : undefined} />
      <ul className="auth-links">
        <li>
          <Link href="/forgot-password">Forgot your password?</Link>
        </li>
        <li>
          New resident? <Link href="/first-login">Activate your account</Link>
        </li>
      </ul>
    </AuthShell>
  );
}
