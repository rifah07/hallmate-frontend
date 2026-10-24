'use client';

import { useState } from 'react';
import { CardScanner } from '@/components/CardScanner';
import { Empty, Loading } from '@/components/Loading';
import { Status } from '@/components/Status';
import { api } from '@/lib/client-api';
import { formatDateTime } from '@/lib/format';
import { useData } from '@/lib/use-data';

type Visit = {
  id: string;
  name: string;
  relation: string;
  purpose: string;
  status: 'APPROVED' | 'CHECKED_IN' | 'CHECKED_OUT';
  checkedInAt: string | null;
  checkedOutAt: string | null;
  student: { name: string; currentRoom: { roomNumber: string; floor: number } | null };
};

// The guard's day: scan resident cards, and let approved visitors in and out.
// Visitor phone numbers never reach this page.
export default function GatePage() {
  const { data, error, reload } = useData<Visit[]>('/visitors/today');
  const [busy, setBusy] = useState('');

  async function move(id: string, action: 'check-in' | 'check-out') {
    setBusy(id);
    await api(`/visitors/${id}/${action}`, { method: 'POST' }).catch((e: Error) => alert(e.message));
    setBusy('');
    reload();
  }

  return (
    <>
      <header className="dash-head">
        <span className="kicker">Main gate</span>
        <h1>Today at the gate</h1>
      </header>
      <CardScanner />
      <section className="dash-section">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>Expected visitors</h2>
          <button type="button" className="btn btn-quiet btn-small" onClick={reload}>
            Refresh
          </button>
        </div>
        {!data ? (
          <Loading error={error} />
        ) : data.length === 0 ? (
          <Empty title="No visitors expected today" />
        ) : (
          <ul className="stack-list">
            {data.map((v) => (
              <li key={v.id} className="card visit">
                <div>
                  <h3 style={{ margin: 0 }}>
                    {v.name} <span className="muted small">({v.relation})</span>
                  </h3>
                  <p className="muted small" style={{ margin: 0 }}>
                    For {v.student.name}
                    {v.student.currentRoom && `, room ${v.student.currentRoom.roomNumber}`} · {v.purpose}
                    {v.checkedInAt && ` · in ${formatDateTime(v.checkedInAt)}`}
                    {v.checkedOutAt && ` · out ${formatDateTime(v.checkedOutAt)}`}
                  </p>
                </div>
                <div className="row">
                  <Status value={v.status} />
                  {v.status === 'APPROVED' && (
                    <button type="button" className="btn btn-small" disabled={busy === v.id} onClick={() => move(v.id, 'check-in')}>
                      Check in
                    </button>
                  )}
                  {v.status === 'CHECKED_IN' && (
                    <button type="button" className="btn btn-quiet btn-small" disabled={busy === v.id} onClick={() => move(v.id, 'check-out')}>
                      Check out
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
