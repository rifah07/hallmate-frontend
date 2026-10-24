import Link from 'next/link';
import { BlockedDetails } from '@/components/BlockedDetails';
import { PhoneLink } from '@/components/PhoneLink';
import { getPublic } from '@/lib/public-api';
import { site } from '@/lib/site';
import type { HallInfo } from '@/lib/types';

export const metadata = { title: 'Account status', robots: { index: false } };

const STATES: Record<string, { title: string; text: string }> = {
  SEAT_CANCELLED: {
    title: 'Your seat has been cancelled',
    text: 'Your hall seat is no longer active, so resident services are closed for this account. If you think this is a mistake, or need your documents or dues settled, the hall office can help.',
  },
  SUSPENDED: {
    title: 'Your account is suspended',
    text: 'Access to resident services is paused for now. Please contact the hall office to find out why and what happens next.',
  },
  LOCKED: {
    title: 'Your account is locked',
    text: 'The hall office has locked this account. Please contact them to unlock it.',
  },
  INACTIVE: {
    title: 'Your account is not active',
    text: 'This account has not been activated for resident services. Please contact the hall office.',
  },
  GRADUATED: {
    title: 'Your residency has ended',
    text: 'Congratulations on finishing your studies. Resident services are closed for alumni accounts. For certificates or clearance, contact the hall office.',
  },
  REMOVED: {
    title: 'This account has been removed',
    text: 'This account is no longer part of the hall. Please contact the hall office if you have questions.',
  },
};

export default async function AccountStatusPage({ searchParams }: PageProps<'/account-status'>) {
  const { state } = await searchParams;
  const info = STATES[typeof state === 'string' ? state : ''] ?? STATES.INACTIVE;
  const hall = await getPublic<HallInfo>('hall-info');
  return (
    <section className="section status-page">
      <div className="container">
        <article className="status-card rise">
          <span className="status-seal" aria-hidden="true" />
          <span className="kicker">Account status</span>
          <h1>{info.title}</h1>
          <p className="lead">{info.text}</p>
          <BlockedDetails />
          <div className="status-contact">
            <h2>Hall office</h2>
            <p>
              {site.name}
              <br />
              {site.university}
            </p>
            <ul>
              {hall?.email && (
                <li>
                  Email: <a href={`mailto:${hall.email}`}>{hall.email}</a>
                </li>
              )}
              {hall?.phone && (
                <li>
                  Phone: <PhoneLink phone={hall.phone} />
                </li>
              )}
            </ul>
          </div>
          <p className="muted" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
            You have been signed out on this device. <Link href="/">Return to the hall&apos;s home page</Link>
          </p>
        </article>
      </div>
    </section>
  );
}
