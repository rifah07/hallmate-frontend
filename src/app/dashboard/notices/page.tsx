'use client';

import { Form, type Field } from '@/components/Form';
import { Empty, Loading } from '@/components/Loading';
import { Status } from '@/components/Status';
import { api } from '@/lib/client-api';
import { dhakaToday, formatDate } from '@/lib/format';
import { useSession } from '@/lib/session';
import { usePages } from '@/lib/use-pages';

type Notice = {
  id: string;
  title: string;
  content: string;
  pdfUrl: string | null;
  audience: 'ALL' | 'FLOOR';
  targetFloor: number | null;
  priority: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string | null;
};

const FLOORS = Array.from({ length: 12 }, (_, i) => String(i + 5)); // bedrooms are on floors 5 to 16

export default function NoticesPage() {
  const { user } = useSession();
  const { items, error, hasMore, more, reload } = usePages<Notice>('/notices');
  if (!user) return null;

  const isTutor = user.role === 'HOUSE_TUTOR';
  const canPost = isTutor || user.role === 'PROVOST' || user.role === 'SUPER_ADMIN';

  // A house tutor can only post to her own floor; the API checks this too
  const fields: Field[] = [
    { name: 'title', label: 'Title', minLength: 3, maxLength: 200 },
    { name: 'content', label: 'Notice', multiline: true, maxLength: 10000 },
    {
      name: 'priority',
      label: 'Priority',
      defaultValue: 'NORMAL',
      options: [
        ['NORMAL', 'Normal'],
        ['HIGH', 'High'],
        ['URGENT', 'Urgent'],
        ['LOW', 'Low'],
      ],
    },
    ...(isTutor
      ? []
      : ([
          { name: 'audience', label: 'Who should see it', options: [['ALL', 'Everyone in the hall'], ['FLOOR', 'One floor']] },
          { name: 'targetFloor', label: 'Floor (for a floor notice)', required: false, options: [['', '—'], ...FLOORS.map((f) => [f, `Floor ${f}`])] },
        ] as Field[])),
    { name: 'expiresAt', label: 'Show until (optional)', type: 'date', required: false, min: dhakaToday() },
    { name: 'pdf', label: 'PDF attachment (optional)', type: 'file', accept: 'application/pdf', required: false, hint: 'PDF only, up to 4 MB.' },
  ];

  return (
    <>
      <header className="dash-head">
        <span className="kicker">{isTutor ? `Floor ${user.assignedFloor}` : 'Hall'}</span>
        <h1>Notices</h1>
      </header>

      {canPost && (
        <details className="panel">
          <summary>Post a notice</summary>
          <Form
            submitLabel="Publish notice"
            fields={fields}
            onSubmit={async (_values, data) => {
              for (const [key, value] of [...data.entries()]) {
                if (value === '' || (value instanceof File && value.size === 0)) data.delete(key);
              }
              if (isTutor) {
                data.set('audience', 'FLOOR');
                data.set('targetFloor', String(user.assignedFloor));
              }
              await api('/notices', { method: 'POST', body: data });
              reload();
            }}
          />
        </details>
      )}

      {!items ? (
        <Loading error={error} />
      ) : items.length === 0 ? (
        <Empty title="No notices yet" />
      ) : (
        <ul className="stack-list">
          {items.map((n) => (
            <li key={n.id} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <h3 lang="bn" style={{ margin: 0 }}>
                  {n.title}
                </h3>
                <div className="row">
                  {n.priority !== 'NORMAL' && <Status value={n.priority} />}
                  <span className="chip">{n.audience === 'FLOOR' ? `Floor ${n.targetFloor}` : 'Whole hall'}</span>
                </div>
              </div>
              <p className="muted small">
                {formatDate(n.createdAt)}
                {n.expiresAt && ` · until ${formatDate(n.expiresAt)}`}
              </p>
              <p className="pre" lang="bn">
                {n.content}
              </p>
              <div className="row">
                {n.pdfUrl && (
                  <a className="btn btn-quiet btn-small" href={n.pdfUrl} target="_blank" rel="noopener noreferrer">
                    Open PDF
                  </a>
                )}
                {canPost && (n.createdBy === user.id || !isTutor) && (
                  <button
                    type="button"
                    className="btn btn-quiet btn-small"
                    onClick={async () => {
                      if (!confirm('Withdraw this notice? Residents will no longer see it.')) return;
                      await api(`/notices/${n.id}`, { method: 'DELETE' }).catch((e: Error) => alert(e.message));
                      reload();
                    }}
                  >
                    Withdraw
                  </button>
                )}
              </div>
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
