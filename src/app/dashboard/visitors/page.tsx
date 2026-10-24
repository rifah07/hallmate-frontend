'use client';

import { useState } from 'react';
import { Form } from '@/components/Form';
import { Empty, Loading } from '@/components/Loading';
import { Status } from '@/components/Status';
import { api } from '@/lib/client-api';
import { dhakaToday, formatDate } from '@/lib/format';
import { useSession } from '@/lib/session';
import { useData } from '@/lib/use-data';
import { usePages } from '@/lib/use-pages';

type Visit = {
  id: string;
  name: string;
  relation: string;
  purpose: string;
  visitDate: string;
  status: string;
  decisionNote?: string | null;
  student?: { name: string; universityId: string; currentRoom: { roomNumber: string; floor: number } | null };
};

// The API accepts visits from today up to 14 days ahead (Dhaka time)
const twoWeeksOut = () => {
  const d = new Date(`${dhakaToday()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 14);
  return d.toISOString().slice(0, 10);
};

export default function VisitorsPage() {
  const { user } = useSession();
  if (!user) return null;
  return user.role === 'STUDENT' ? <MyVisitors /> : <ApproveVisitors />;
}

function MyVisitors() {
  const { items, error, hasMore, more, reload } = usePages<Visit>('/visitors/mine');
  return (
    <>
      <header className="dash-head">
        <span className="kicker">Visitors</span>
        <h1>Expecting someone?</h1>
        <p className="muted">Register a visitor ahead of time. Your house tutor approves it, and the guard will be expecting them.</p>
      </header>
      <details className="panel" open={items?.length === 0 || undefined}>
        <summary>Register a visitor</summary>
        <Form
          submitLabel="Send for approval"
          fields={[
            { name: 'name', label: "Visitor's name", minLength: 2, maxLength: 100 },
            { name: 'relation', label: 'Relation to you', minLength: 2, maxLength: 50, placeholder: 'Father' },
            { name: 'phone', label: "Visitor's mobile", type: 'tel', inputMode: 'numeric', pattern: '01[3-9]\\d{8}', hint: 'So the hall can reach them if needed. The guard never sees it.' },
            { name: 'visitDate', label: 'Date of visit', type: 'date', min: dhakaToday(), max: twoWeeksOut() },
            { name: 'purpose', label: 'Purpose', minLength: 3, maxLength: 300 },
          ]}
          onSubmit={async (values) => {
            await api('/visitors', { method: 'POST', json: values });
            reload();
          }}
        />
      </details>
      {!items ? (
        <Loading error={error} />
      ) : items.length === 0 ? (
        <Empty title="No visitors registered" />
      ) : (
        <ul className="stack-list">
          {items.map((v) => (
            <li key={v.id} className="card visit">
              <div>
                <h3 style={{ margin: 0 }}>{v.name}</h3>
                <p className="muted small" style={{ margin: 0 }}>
                  {v.relation} · {formatDate(v.visitDate)} · {v.purpose}
                </p>
                {v.decisionNote && <p className="reply">{v.decisionNote}</p>}
              </div>
              <div className="row">
                <Status value={v.status} />
                {['PENDING', 'APPROVED'].includes(v.status) && (
                  <button
                    type="button"
                    className="btn btn-quiet btn-small"
                    onClick={async () => {
                      await api(`/visitors/${v.id}/cancel`, { method: 'POST' }).catch((e: Error) => alert(e.message));
                      reload();
                    }}
                  >
                    Cancel
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

function ApproveVisitors() {
  const { data, error, reload } = useData<Visit[]>('/visitors/pending');
  const [busy, setBusy] = useState('');

  async function decide(id: string, approve: boolean) {
    const note = approve ? undefined : (prompt('Reason, for the student (optional):') ?? undefined);
    setBusy(id);
    await api(`/visitors/${id}/decision`, { method: 'POST', json: { approve, ...(note && { note }) } }).catch((e: Error) => alert(e.message));
    setBusy('');
    reload();
  }

  return (
    <>
      <header className="dash-head">
        <span className="kicker">Visitors</span>
        <h1>Waiting for approval</h1>
      </header>
      {!data ? (
        <Loading error={error} />
      ) : data.length === 0 ? (
        <Empty title="No visitors waiting" />
      ) : (
        <ul className="stack-list">
          {data.map((v) => (
            <li key={v.id} className="card visit">
              <div>
                <h3 style={{ margin: 0 }}>
                  {v.name} <span className="muted small">({v.relation})</span>
                </h3>
                <p className="muted small" style={{ margin: 0 }}>
                  {formatDate(v.visitDate)} · visiting {v.student?.name}
                  {v.student?.currentRoom && `, room ${v.student.currentRoom.roomNumber}`} · {v.purpose}
                </p>
              </div>
              <div className="row">
                <button type="button" className="btn btn-small" disabled={busy === v.id} onClick={() => decide(v.id, true)}>
                  Approve
                </button>
                <button type="button" className="btn btn-quiet btn-small" disabled={busy === v.id} onClick={() => decide(v.id, false)}>
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
