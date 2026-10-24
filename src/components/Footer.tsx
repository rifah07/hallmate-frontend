import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div>
          <h2>{site.name}</h2>
          <p className="bn" lang="bn">
            {site.nameBn}
          </p>
          <p>{site.university}</p>
        </div>
        <div>
          <h2>Visit</h2>
          <ul>
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Residents</h2>
          <ul>
            <li>
              <Link href="/login">Log in</Link>
            </li>
            <li>
              <Link href="/first-login">First time? Activate your account</Link>
            </li>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
          </ul>
        </div>
        <p className="footer-note">
          Hall information comes from the hall office. HallMate is a student-built resident portal.
        </p>
      </div>
    </footer>
  );
}
