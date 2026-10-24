import type { PublicEvent } from '@/lib/types';
import { SampleBadge } from './SampleBadge';

const part = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso).toLocaleString('en-GB', { ...o, timeZone: 'Asia/Dhaka' });

export function EventCard({ event }: { event: PublicEvent }) {
  return (
    <article className="event-card">
      <div className="event-art">
        {event.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- illustration or remote image
          <img src={event.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
        )}
        <time className="event-date" dateTime={event.startDate}>
          <b>{part(event.startDate, { day: 'numeric' })}</b>
          <span>{part(event.startDate, { month: 'short' })}</span>
        </time>
      </div>
      <div className="event-body">
        <h3>{event.title}</h3>
        {event.summary && <p className="muted">{event.summary}</p>}
        <p className="event-meta">
          {event.venue && <span>{event.venue}</span>}
          <SampleBadge show={event.isSample} />
        </p>
      </div>
    </article>
  );
}
