import { langOf } from '@/lib/format';
import type { PublicNotice } from '@/lib/types';
import { SampleBadge } from './SampleBadge';

const parts = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => d.toLocaleString('en-GB', { ...o, timeZone: 'Asia/Dhaka' });
  return { day: f({ day: '2-digit' }), month: f({ month: 'short' }), year: f({ year: 'numeric' }) };
};

export function NoticeList({ notices }: { notices: PublicNotice[] }) {
  if (notices.length === 0) return <p className="muted">No notices at the moment.</p>;
  return (
    <ul className="notice-list">
      {notices.map((n) => {
        const d = parts(n.publishedAt);
        return (
          <li key={n.id}>
            <time className="notice-date" dateTime={n.publishedAt ?? undefined}>
              <b>{d?.day}</b>
              <span>
                {d?.month} {d?.year}
              </span>
            </time>
            <div>
              <p lang={langOf(n.title)} style={{ margin: 0, fontWeight: 500 }}>
                {n.title}
              </p>
              {n.priority === 'URGENT' && <span className="chip chip-blush">Urgent</span>}
              <SampleBadge show={n.isSample} />
            </div>
            {n.pdfUrl ? (
              <a className="btn btn-quiet btn-small" href={n.pdfUrl} target="_blank" rel="noopener noreferrer">
                Open PDF
              </a>
            ) : (
              <span />
            )}
          </li>
        );
      })}
    </ul>
  );
}
