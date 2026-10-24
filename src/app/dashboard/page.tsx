'use client';

import Link from 'next/link';
import { Loading } from '@/components/Loading';
import { PhoneLink } from '@/components/PhoneLink';
import { formatDate, formatTaka, humanize } from '@/lib/format';
import { useSession } from '@/lib/session';
import { useData } from '@/lib/use-data';

// GET /dashboard: one response, shaped by the API for the caller's role.
type Overview = {
  unreadNotifications: number;
  latestNotices: { id: string; title: string; priority: string; createdAt: string }[];
  room?: { roomNumber: string; floor: number; wing: string | null; bedNumber: number; roommates: { name: string; bedNumber: number }[] } | null;
  houseTutor?: { name: string; email: string; phone: string } | null;
  unpaidBills?: { count: number; total: number };
  pendingApplications?: number | Record<string, number>;
  upcomingVisitors?: number;
  scope?: 'hall' | { floor: number };
  occupancy?: { beds: number; occupied: number; vacant: number; rate: number };
  openComplaints?: number;
  pendingVisitors?: number;
  renewal?: { paid: number; unpaid: number; collected: number; outstanding: number };
  visitorsToday?: { expected: number; inside: number; left: number };
};

const greeting = () => {
  const hour = Number(new Date().toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Dhaka' }));
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};

function Tile({ label, value, note, href }: { label: string; value: React.ReactNode; note?: React.ReactNode; href?: string }) {
  const body = (
    <>
      <span className="kicker">{label}</span>
      <p className="stat">{value}</p>
      {note && <p className="muted tile-note">{note}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="card tile tile-link">
      {body}
    </Link>
  ) : (
    <article className="card tile">{body}</article>
  );
}

export default function DashboardPage() {
  const { user } = useSession();
  const { data, error } = useData<Overview>('/dashboard');
  if (!user) return null;

  const pendingByType = typeof data?.pendingApplications === 'object' ? data.pendingApplications : null;

  return (
    <>
      <header className="dash-head">
        <span className="kicker">{greeting()}</span>
        <h1>{user.name.split(' ')[0]}</h1>
        {data?.scope && typeof data.scope === 'object' && <p className="muted">Floor {data.scope.floor} at a glance.</p>}
      </header>

      {!data ? (
        <Loading error={error} />
      ) : (
        <>
          <div className="grid">
            {data.room !== undefined && (
              <Tile
                label="Your room"
                value={data.room ? data.room.roomNumber : 'Not allotted'}
                note={
                  data.room
                    ? `Floor ${data.room.floor}, bed ${data.room.bedNumber}${
                        data.room.roommates.length ? ` · with ${data.room.roommates.map((r) => r.name).join(', ')}` : ''
                      }`
                    : 'The hall office will let you know.'
                }
              />
            )}
            {data.room && (
              <Tile
                label={`House tutor, floor ${data.room.floor}`}
                value={data.houseTutor?.name ?? 'Not assigned yet'}
                note={
                  data.houseTutor ? (
                    <>
                      <PhoneLink phone={data.houseTutor.phone} /> · <a href={`mailto:${data.houseTutor.email}`}>{data.houseTutor.email}</a>
                    </>
                  ) : (
                    'The hall office will let you know.'
                  )
                }
              />
            )}
            {data.unpaidBills && (
              <Tile
                label="Unpaid bills"
                value={data.unpaidBills.count ? formatTaka(data.unpaidBills.total) : 'All paid'}
                note={data.unpaidBills.count ? `${data.unpaidBills.count} bill(s) to pay` : 'Nothing due.'}
                href="/dashboard/bills"
              />
            )}
            {typeof data.pendingApplications === 'number' && (
              <Tile label="Open requests" value={data.pendingApplications} href="/dashboard/requests" />
            )}
            {data.upcomingVisitors !== undefined && (
              <Tile label="Upcoming visitors" value={data.upcomingVisitors} href="/dashboard/visitors" />
            )}
            {data.occupancy && (
              <Tile
                label="Occupancy"
                value={`${data.occupancy.rate}%`}
                note={`${data.occupancy.occupied} of ${data.occupancy.beds} beds · ${data.occupancy.vacant} free`}
              />
            )}
            {data.openComplaints !== undefined && (
              <Tile label="Open complaints" value={data.openComplaints} href="/dashboard/requests?type=COMPLAINT" />
            )}
            {data.pendingVisitors !== undefined && (
              <Tile label="Visitors to approve" value={data.pendingVisitors} href="/dashboard/visitors" />
            )}
            {data.renewal && (
              <Tile
                label={`Seat renewal ${new Date().getFullYear()}`}
                value={formatTaka(data.renewal.collected)}
                note={`${data.renewal.paid} paid · ${data.renewal.unpaid} unpaid (${formatTaka(data.renewal.outstanding)})`}
                href="/dashboard/billing"
              />
            )}
            {data.visitorsToday && (
              <Tile
                label="Visitors today"
                value={data.visitorsToday.expected}
                note={`expected · ${data.visitorsToday.inside} inside · ${data.visitorsToday.left} left`}
                href="/dashboard/gate"
              />
            )}
            <Tile label="Unread notifications" value={data.unreadNotifications} href="/dashboard/notifications" />
          </div>

          {pendingByType && Object.keys(pendingByType).length > 0 && (
            <section className="dash-section">
              <h2>Waiting for a decision</h2>
              <ul className="pill-list">
                {Object.entries(pendingByType).map(([type, count]) => (
                  <li key={type}>
                    <Link href={`/dashboard/requests?type=${type}`}>
                      {humanize(type)} <b>{count}</b>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="dash-section">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2>Latest notices</h2>
              <Link href="/dashboard/notices">All notices →</Link>
            </div>
            {data.latestNotices.length === 0 ? (
              <p className="muted">No notices right now.</p>
            ) : (
              <ul className="list">
                {data.latestNotices.map((n) => (
                  <li key={n.id}>
                    <span lang="bn">{n.title}</span>
                    <span className="muted">{formatDate(n.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
