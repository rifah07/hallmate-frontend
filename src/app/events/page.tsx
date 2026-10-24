import { EventCard } from '@/components/EventCard';
import { Empty } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { Unavailable } from '@/components/Unavailable';
import { getPublic } from '@/lib/public-api';
import type { PublicEvent } from '@/lib/types';

export const metadata = { title: 'Events' };

export default async function EventsPage() {
  // The API decides what is upcoming (its clock, its time zone); the rest are past
  const [soonest, events] = await Promise.all([
    getPublic<PublicEvent[]>('events?upcoming=true&limit=50'), // soonest first
    getPublic<PublicEvent[]>('events?limit=50'), // newest first
  ]);
  const upcoming = soonest ?? [];
  const past = events?.filter((e) => !upcoming.some((u) => u.id === e.id)) ?? [];

  return (
    <>
      <PageHeader kicker="About" title="Events" lead="Celebrations, drills, campaigns and gatherings in the hall." />
      <section className="section">
        <div className="container">
          {events === null && <Unavailable what="events" />}
          <h2>Coming up</h2>
          {events && upcoming.length === 0 && <Empty title="No events planned yet" />}
          <div className="event-grid">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
          {past.length > 0 && (
            <>
              <h2 style={{ marginTop: '3rem' }}>Earlier</h2>
              <div className="event-grid">
                {past.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
