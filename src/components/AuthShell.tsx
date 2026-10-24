import { site } from '@/lib/site';

// The frame every sign-in page shares: a quiet jali panel beside the form.
export function AuthShell({
  kicker,
  title,
  lead,
  children,
}: {
  kicker: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="auth">
      <div className="auth-card rise">
        <aside className="auth-art" aria-hidden="true">
          <span className="brand-mark" />
          <p lang="bn">{site.nameBn}</p>
          <small>{site.university}</small>
        </aside>
        <div className="auth-body">
          <span className="kicker">{kicker}</span>
          <h1>{title}</h1>
          {lead && <p className="muted">{lead}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
