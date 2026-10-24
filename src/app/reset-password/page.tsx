import Link from 'next/link';
import { AuthShell } from '@/components/AuthShell';
import { ResetPasswordForm } from '@/components/AuthForms';

export const metadata = { title: 'Reset password' };

export default async function ResetPasswordPage({ searchParams }: PageProps<'/reset-password'>) {
  const { id } = await searchParams;
  return (
    <AuthShell
      kicker="Password help"
      title="Choose a new password"
      lead="If that ID is registered, a code is on its way to your email."
    >
      <ResetPasswordForm universityId={typeof id === 'string' && /^\d{10}$/.test(id) ? id : undefined} />
      <ul className="auth-links">
        <li>
          No email? <Link href="/forgot-password">Send another code</Link>
        </li>
      </ul>
    </AuthShell>
  );
}
