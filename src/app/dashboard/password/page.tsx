import { ChangePasswordForm } from '@/components/AuthForms';

export const metadata = { title: 'Change password' };

export default function ChangePasswordPage() {
  return (
    <>
      <header className="dash-head">
        <span className="kicker">Security</span>
        <h1>Change password</h1>
        <p className="muted">You&apos;ll be logged out on every device, including this one.</p>
      </header>
      <div className="card" style={{ maxWidth: '30rem' }}>
        <ChangePasswordForm />
      </div>
    </>
  );
}
