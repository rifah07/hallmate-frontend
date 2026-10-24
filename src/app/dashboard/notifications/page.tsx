'use client';

import { useState } from 'react';
import { Empty, Loading } from '@/components/Loading';
import { api } from '@/lib/client-api';
import { formatDateTime } from '@/lib/format';
import { useSession } from '@/lib/session';
import { usePages } from '@/lib/use-pages';

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedEntityId: string | null;
  isRead: boolean;
  createdAt: string;
};

// A student only ever gets APPLICATION_SUBMITTED when a friend asks to swap
// beds with her; her agreement is given from here.
const isSwapAsk = (n: Notification, role?: string) => role === 'STUDENT' && n.type === 'APPLICATION_SUBMITTED' && !!n.relatedEntityId;

function SwapConsent({ applicationId }: { applicationId: string }) {
  const [state, setState] = useState('');
  if (state) return <p className="small reply">{state}</p>;
  return (
    <div className="row">
      <button
        type="button"
        className="btn btn-small"
        onClick={async () => {
          if (!confirm('Agree to swap beds? The provost still has to approve it.')) return;
          try {
            await api(`/applications/${applicationId}/consent`, { method: 'POST' });
            setState('You agreed. The hall office will review the swap.');
          } catch (e) {
            setState((e as Error).message);
          }
        }}
      >
        Agree to swap
      </button>
      <span className="muted small">Not interested? Just ignore it.</span>
    </div>
  );
}

export default function NotificationsPage() {
  const { user } = useSession();
  const { items, setItems, error, hasMore, more } = usePages<Notification>('/notifications');

  const markRead = (id: string) => {
    setItems((list) => list?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? null);
    void api(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => undefined);
  };
  const markAll = async () => {
    await api('/notifications/read-all', { method: 'PATCH' });
    setItems((list) => list?.map((n) => ({ ...n, isRead: true })) ?? null);
  };

  return (
    <>
      <header className="dash-head row" style={{ justifyContent: 'space-between' }}>
        <div>
          <span className="kicker">Inbox</span>
          <h1>Notifications</h1>
        </div>
        {items?.some((n) => !n.isRead) && (
          <button type="button" className="btn btn-quiet btn-small" onClick={markAll}>
            Mark all as read
          </button>
        )}
      </header>
      {!items ? (
        <Loading error={error} />
      ) : items.length === 0 ? (
        <Empty title="You're all caught up">Decisions, receipts and visitor arrivals will appear here.</Empty>
      ) : (
        <ul className="inbox">
          {items.map((n) => (
            <li key={n.id} className={n.isRead ? '' : 'unread'}>
              <button type="button" onClick={() => !n.isRead && markRead(n.id)} aria-label={n.isRead ? undefined : `Mark "${n.title}" as read`}>
                <b>{n.title}</b>
                <span>{n.message}</span>
                <time dateTime={n.createdAt}>{formatDateTime(n.createdAt)}</time>
              </button>
              {isSwapAsk(n, user?.role) && <SwapConsent applicationId={n.relatedEntityId!} />}
            </li>
          ))}
        </ul>
      )}
      {hasMore && (
        <button type="button" className="btn btn-quiet load-more" onClick={more}>
          Load more
        </button>
      )}
    </>
  );
}
