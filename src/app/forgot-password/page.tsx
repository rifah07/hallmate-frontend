import Link from 'next/link';
import { AuthShell } from '@/components/AuthShell';
import { ForgotPasswordForm } from '@/components/AuthForms';

export const metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      kicker="Password help"
      title="Forgot your password?"
      lead="We'll email a 6-digit code to the address the hall office has on file."
    >
      <ForgotPasswordForm />
      <ul className="auth-links">
        <li>
          <Link href="/login">Back to login</Link>
        </li>
      </ul>
    </AuthShell>
  );
}
