'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Form } from '@/components/Form';
import { Empty, Loading } from '@/components/Loading';
import { RequestCard, RespondForm } from '@/components/RequestCard';
import { REQUEST_TYPES, type ApplicationList } from '@/lib/applications';
import { api } from '@/lib/client-api';
import { humanize } from '@/lib/format';
import { toRequestBody } from '@/lib/request-body';
import { useSession } from '@/lib/session';
import type { Profile } from '@/lib/types';
import { useData } from '@/lib/use-data';

const TYPES = ['SEAT_APPLICATION', 'SEAT_CANCELLATION', 'SEAT_TRANSFER', 'SEAT_SWAP', 'LEAVE', 'COMPLAINT', 'MAINTENANCE'];
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

export default function RequestsPage() {
  const { user } = useSession();
  if (!user) return null;
  return user.role === 'STUDENT' ? (
    <StudentRequests />
  ) : (
    <Suspense fallback={<Loading />}>
      <ReviewRequests canAssign={user.role === 'PROVOST' || user.role === 'SUPER_ADMIN'} />
    </Suspense>
  );
}

function StudentRequests() {
  const { user } = useSession();
  const [type, setType] = useState('COMPLAINT');
  // shortcut: first 50 only, add paging if a resident ever files more
  const { data, error, reload } = useData<ApplicationList>('/applications/my-applications?limit=50');

  return (
    <>
      <header className="dash-head">
        <span className="kicker">Requests</span>
        <h1>Ask the hall office</h1>
      </header>

      <details className="panel" open={data?.applications.length === 0 || undefined}>
        <summary>New request</summary>
        <div className="segmented" role="radiogroup" aria-label="Kind of request">
          {Object.entries(REQUEST_TYPES).map(([key, t]) => (
            <button key={key} type="button" role="radio" aria-checked={type === key} onClick={() => setType(key)}>
              {t.label}
            </button>
          ))}
        </div>
        <p className="muted small">{REQUEST_TYPES[type].blurb}</p>
        <Form
          key={type}
          submitLabel={`Send ${REQUEST_TYPES[type].label.toLowerCase()}`}
          fields={REQUEST_TYPES[type].fields}
          onSubmit={async (values) => {
            // A transfer names the room she's in now; the API checks it's really hers
            const extra: Record<string, string> = type === 'SEAT_TRANSFER' ? { currentRoomId: user?.currentRoom?.id ?? '' } : {};
            await api('/applications', { method: 'POST', json: toRequestBody(type, { ...values, ...extra }) });
            reload();
          }}
        />
      </details>

      {!data ? (
        <Loading error={error} />
      ) : data.applications.length === 0 ? (
        <Empty title="No requests yet">Complaints, repairs and leave requests you send will be tracked here.</Empty>
      ) : (
        <ul className="stack-list">
          {data.applications.map((app) => (
            <RequestCard key={app.id} app={app}>
              {app.status === 'PENDING' && (
                <button
                  type="button"
                  className="btn btn-quiet btn-small"
                  onClick={async () => {
                    if (!confirm('Withdraw this request?')) return;
                    await api(`/applications/${app.id}/cancel`, { method: 'POST' }).catch((e: Error) => alert(e.message));
                    reload();
                  }}
                >
                  Withdraw
                </button>
              )}
            </RequestCard>
          ))}
        </ul>
      )}
    </>
  );
}

function ReviewRequests({ canAssign }: { canAssign: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const type = params.get('type') ?? '';
  const status = params.get('status') ?? 'PENDING';
  const query = new URLSearchParams({ status, limit: '50', ...(type && { type }) });
  const { data, error, reload } = useData<ApplicationList>(`/applications?${query}`);
  // Loaded once for every card's "Assigned to" picker
  const maintenance = useData<Profile[]>(canAssign ? '/users/role/MAINTENANCE_STAFF' : null).data ?? [];
  const office = useData<Profile[]>(canAssign ? '/users/role/OFFICE_STAFF' : null).data ?? [];
  const staff = [...maintenance, ...office];

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/dashboard/requests?${next}`);
  };

  return (
    <>
      <header className="dash-head">
        <span className="kicker">Requests</span>
        <h1>Residents&apos; requests</h1>
      </header>
      <div className="filters">
        <label>
          Status
          <select value={status} onChange={(e) => setFilter('status', e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kind
          <select value={type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All kinds</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {humanize(t)}
              </option>
            ))}
          </select>
        </label>
        {data && <span className="muted small">{data.pagination.total} found</span>}
      </div>

      {!data ? (
        <Loading error={error} />
      ) : data.applications.length === 0 ? (
        <Empty title="Nothing here">No {humanize(status).toLowerCase()} requests{type && ` of this kind`}.</Empty>
      ) : (
        <ul className="stack-list">
          {data.applications.map((app) => (
            <RequestCard key={app.id} app={app}>
              {app.status === 'PENDING' && (
                <>
                  {canAssign && ['COMPLAINT', 'MAINTENANCE'].includes(app.type) && <AssignForm id={app.id} assigned={app.assignedTo} staff={staff} onDone={reload} />}
                  <RespondForm app={app} onDone={reload} />
                </>
              )}
            </RequestCard>
          ))}
        </ul>
      )}
    </>
  );
}

// Hand a complaint or repair to the staff member who will do the work.
function AssignForm({ id, assigned, staff, onDone }: { id: string; assigned: string | null; staff: Profile[]; onDone: () => void }) {
  const [error, setError] = useState('');

  return (
    <label className="assign">
      Assigned to
      <select
        value={assigned ?? ''}
        onChange={async (e) => {
          const person = staff.find((s) => s.id === e.target.value);
          if (!person) return;
          setError('');
          try {
            await api(`/applications/${id}/assign`, { method: 'POST', json: { assignedTo: person.id, assignedToRole: person.role } });
            onDone();
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <option value="">Nobody yet</option>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.designation ?? humanize(s.role)})
          </option>
        ))}
      </select>
      {error && <span className="error">{error}</span>}
    </label>
  );
}
