'use client';

import { useState } from 'react';
import type { Application } from '@/lib/applications';
import { api } from '@/lib/client-api';
import { formatDate, humanize } from '@/lib/format';
import { describe } from '@/lib/request-body';
import { useData } from '@/lib/use-data';
import { Status } from './Status';

type VacantRoom = { id: string; roomNumber: string; floor: number; vacantBeds: number[] };

// One request, as residents and reviewers both see it. `children` holds
// the actions the viewer may take.
export function RequestCard({ app, children }: { app: Application; children?: React.ReactNode }) {
  return (
    <li className="card request">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <span className="kicker" style={{ marginBottom: 0 }}>
            {humanize(app.type)}
          </span>
          <h3 style={{ margin: 0 }}>{String(app.data.title ?? app.data.category ?? app.data.leaveType ?? humanize(app.type))}</h3>
        </div>
        <Status value={app.status} />
      </div>
      <p className="muted small">
        {app.student && `${[app.student.name, app.student.universityId].filter(Boolean).join(' · ')} · `}
        Filed {formatDate(app.createdAt)}
      </p>
      <dl className="kv">
        {describe(app.data).map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {app.responseNote && (
        <p className="reply">
          <b>Reply{app.respondedAt && ` · ${formatDate(app.respondedAt)}`}:</b> {app.responseNote}
        </p>
      )}
      {children}
    </li>
  );
}

// Approve or reject with a note the student will read. Approving a seat
// application or a room change also needs a bed, chosen from what's free now.
export function RespondForm({
  app,
  onDone,
  labels = ['Approve', 'Reject'],
}: {
  app: Application;
  onDone: () => void;
  labels?: [string, string];
}) {
  const needsBed = app.type === 'SEAT_APPLICATION' || app.type === 'SEAT_TRANSFER';
  const rooms = useData<{ rooms: VacantRoom[] }>(needsBed ? '/rooms/vacant' : null).data?.rooms;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function respond(form: HTMLFormElement, status: 'APPROVED' | 'REJECTED') {
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (status === 'APPROVED' && needsBed && !values.bed) {
      setError('Choose a room and bed to approve.');
      return;
    }
    const [roomId, bedNumber] = (values.bed ?? '').split(':');
    setBusy(true);
    setError('');
    try {
      await api(`/applications/${app.id}/respond`, {
        method: 'POST',
        json: {
          status,
          responseNote: values.note,
          ...(status === 'APPROVED' && needsBed ? { allocation: { roomId, bedNumber: Number(bedNumber) } } : {}),
        },
      });
      onDone();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className="respond" onSubmit={(e) => e.preventDefault()}>
      {needsBed && (
        <label>
          Room and bed
          <select name="bed" defaultValue="">
            <option value="">{rooms ? 'Choose a free bed' : 'Loading free beds…'}</option>
            {rooms?.flatMap((r) =>
              r.vacantBeds.map((bed) => (
                <option key={`${r.id}:${bed}`} value={`${r.id}:${bed}`}>
                  Room {r.roomNumber} (floor {r.floor}), bed {bed}
                </option>
              )),
            )}
          </select>
        </label>
      )}
      <label>
        Note to the student
        <textarea name="note" required minLength={10} maxLength={1000} rows={2} placeholder="At least 10 characters" />
      </label>
      <p className="error" role="alert">
        {error}
      </p>
      <div className="row">
        <button type="button" className="btn btn-small" disabled={busy} onClick={(e) => respond(e.currentTarget.form!, 'APPROVED')}>
          {labels[0]}
        </button>
        <button type="button" className="btn btn-quiet btn-small" disabled={busy} onClick={(e) => respond(e.currentTarget.form!, 'REJECTED')}>
          {labels[1]}
        </button>
      </div>
    </form>
  );
}
