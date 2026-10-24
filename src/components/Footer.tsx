import Link from 'next/link';
import { getPublic } from '@/lib/public-api';
import { site } from '@/lib/site';
import type { HallInfo } from '@/lib/types';
import { HallLogo } from './HallLogo';
import { PhoneLink } from './PhoneLink';

export async function Footer() {
  const hall = await getPublic<HallInfo>('hall-info');
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-hall">
          <HallLogo size={52} />
          <h2>{site.name}</h2>
          <p className="bn" lang="bn">
            {site.nameBn}
          </p>
          <address>
            {site.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <p>
            <a href={site.mapUrl} target="_blank" rel="noopener noreferrer">
              Open in Google Maps ↗
            </a>
            {hall?.phone && (
              <>
                <br />
                <PhoneLink phone={hall.phone} />
              </>
            )}
            {hall?.email && (
              <>
                <br />
                <a href={`mailto:${hall.email}`}>{hall.email}</a>
              </>
            )}
          </p>
        </div>
        {site.nav.map((group) => (
          <div key={group.label}>
            <h2>{group.label}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h2>Residents</h2>
          <ul>
            <li>
              <Link href="/login">Log in</Link>
            </li>
            <li>
              <Link href="/first-login">First time? Activate your account</Link>
            </li>
          </ul>
        </div>
        <p className="footer-note">
          <span>HallMate, a resident portal for the hall. Hall information comes from the hall office.</span>
          <span>
            Designed and built by{' '}
            <a href={site.credit.url} target="_blank" rel="noopener noreferrer">
              {site.credit.name}
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}
