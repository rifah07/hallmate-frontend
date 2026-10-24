import Link from 'next/link';
import { AuthShell } from '@/components/AuthShell';
import { FirstLoginForm } from '@/components/AuthForms';

export const metadata = { title: 'Activate your account' };

export default function FirstLoginPage() {
  return (
    <AuthShell
      kicker="New residents"
      title="Activate your account"
      lead="Use the one-time password from the hall office once, then choose your own password."
    >
      <FirstLoginForm />
      <ul className="auth-links">
        <li>
          Already activated? <Link href="/login">Log in</Link>
        </li>
        <li>
          Code expired or lost? Ask the hall office for a new one.
        </li>
      </ul>
    </AuthShell>
  );
}
