'use client';

import { useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { Form, type Field } from '@/components/Form';
import { Empty, Loading } from '@/components/Loading';
import { Status } from '@/components/Status';
import { api, download } from '@/lib/client-api';
import { humanize } from '@/lib/format';
import { ROLE_LABEL } from '@/lib/roles';
import { useSession } from '@/lib/session';
import type { Role } from '@/lib/types';
import { useData } from '@/lib/use-data';

type Person = {
  id: string;
  universityId: string;
  role: Role;
  name: string;
  email: string;
  phone: string | null;
  photo: string | null;
  accountStatus: string;
  department: string | null;
  session: string | null;
  designation: string | null;
  provostMessage?: string | null;
  assignedFloor: number | null;
  isFirstLogin: boolean;
  currentRoom?: { roomNumber: string; floor: number };
};
type Code = { name: string; universityId: string; oneTimePassword: string };

const PAGE = 20;
const ROLES = Object.keys(ROLE_LABEL) as Role[];
const STATUSES = ['ACTIVE', 'SUSPENDED', 'SEAT_CANCELLED', 'INACTIVE', 'GRADUATED'];
const FLOORS = Array.from({ length: 12 }, (_, i) => String(i + 5));
const STAFF_ROLES: Role[] = ['OFFICE_STAFF', 'DINING_STAFF', 'MAINTENANCE_STAFF', 'GUARD', 'ASSISTANT_WARDEN'];
const phoneField: Field = { name: 'phone', label: 'Mobile', type: 'tel', inputMode: 'numeric', pattern: '(\\+88)?01[3-9]\\d{8}' };

export default function PeoplePage() {
  const { user } = useSession();
  const [filters, setFilters] = useState({ search: '', role: '', accountStatus: '', floor: '' });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Person | null>(null);
  const [codes, setCodes] = useState<Code[]>([]);

  const query = new URLSearchParams({ page: String(page), limit: String(PAGE) });
  for (const [k, v] of Object.entries(filters)) if (v) query.set(k, v);
  const { data, error, reload } = useData<Person[]>(`/users?${query}`);
  if (!user) return null;

  const isAdmin = user.role === 'PROVOST' || user.role === 'SUPER_ADMIN';
  const filter = (key: keyof typeof filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <>
      <header className="dash-head">
        <span className="kicker">{isAdmin ? 'Hall directory' : `Floor ${user.assignedFloor}`}</span>
        <h1>{isAdmin ? 'People' : 'My students'}</h1>
      </header>

      {codes.length > 0 && <CodeSheet codes={codes} onClose={() => setCodes([])} />}

      {isAdmin && (
        <div className="grid">
          <AddPerson
            onCreated={(code) => {
              if (code) setCodes([code]);
              reload();
            }}
          />
          <BulkUpload
            onDone={(undelivered) => {
              setCodes(undelivered);
              reload();
            }}
          />
        </div>
      )}

      <form
        className="filters"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          filter('search', String(new FormData(e.currentTarget).get('search') ?? '').trim());
        }}
      >
        <label>
          Name, email or ID
          <input name="search" type="search" defaultValue={filters.search} />
        </label>
        {isAdmin && (
          <>
            <label>
              Role
              <select value={filters.role} onChange={(e) => filter('role', e.target.value)}>
                <option value="">Everyone</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={filters.accountStatus} onChange={(e) => filter('accountStatus', e.target.value)}>
                <option value="">Any</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {humanize(s)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Lives on
              <select value={filters.floor} onChange={(e) => filter('floor', e.target.value)}>
                <option value="">Any floor</option>
                {FLOORS.map((f) => (
                  <option key={f} value={f}>
                    Floor {f}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <button type="submit" className="btn btn-quiet">
          Search
        </button>
      </form>

      {open && (
        <PersonPanel
          key={open.id}
          person={open}
          viewer={user.role}
          onCodes={setCodes}
          onChanged={(p) => {
            setOpen(p);
            reload();
          }}
          onClose={() => setOpen(null)}
        />
      )}

      {!data ? (
        <Loading error={error} />
      ) : data.length === 0 ? (
        <Empty title="Nobody found">Try a different name or filter.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>University ID</th>
                <th>Role</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td>
                    <button type="button" className="link-button" onClick={() => setOpen(p)}>
                      {p.name}
                    </button>
                  </td>
                  <td className="num">{p.universityId}</td>
                  <td>{ROLE_LABEL[p.role]}</td>
                  <td>{p.currentRoom?.roomNumber ?? 'No room'}</td>
                  <td>
                    <Status value={p.isFirstLogin && p.accountStatus === 'ACTIVE' ? 'NOT_ACTIVATED' : p.accountStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="row pager">
        <button type="button" className="btn btn-quiet btn-small" disabled={page === 1} onClick={() => setPage((n) => n - 1)}>
          ← Previous
        </button>
        <span className="muted small">Page {page}</span>
        <button type="button" className="btn btn-quiet btn-small" disabled={(data?.length ?? 0) < PAGE} onClick={() => setPage((n) => n + 1)}>
          Next →
        </button>
      </div>
    </>
  );
}

// One-time passwords the email couldn't deliver. Shown once: the API keeps
// only a hash, so once this closes the office would have to re-issue.
function CodeSheet({ codes, onClose }: { codes: Code[]; onClose: () => void }) {
  return (
    <section className="panel code-sheet" aria-live="polite">
      <h2>Hand these over in person</h2>
      <p className="muted small">
        The email couldn&apos;t be sent, so here are the one-time passwords. They are shown only now. Print or note them,
        give each one privately, and close this.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>University ID</th>
              <th>One-time password</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.universityId}>
                <td>{c.name}</td>
                <td className="num">{c.universityId}</td>
                <td className="num code">{c.oneTimePassword}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ marginTop: '1rem' }}>
        <button type="button" className="btn btn-quiet btn-small" onClick={() => window.print()}>
          Print
        </button>
        <button type="button" className="btn btn-small" onClick={onClose}>
          Done, close
        </button>
      </div>
    </section>
  );
}

function AddPerson({ onCreated }: { onCreated: (code: Code | null) => void }) {
  const [role, setRole] = useState<Role>('STUDENT');
  const fields: Field[] = [
    { name: 'universityId', label: 'University ID', inputMode: 'numeric', pattern: '\\d{10}', maxLength: 10 },
    { name: 'name', label: 'Full name', minLength: 2, maxLength: 100 },
    { name: 'email', label: 'Email', type: 'email' },
    phoneField,
    ...(role === 'STUDENT'
      ? ([
          { name: 'department', label: 'Department' },
          { name: 'program', label: 'Programme', options: [['UNDERGRADUATE', 'Undergraduate'], ['MASTERS', 'Masters'], ['PHD', 'PhD']] },
          { name: 'year', label: 'Year', type: 'number', min: 1, max: 5 },
          { name: 'session', label: 'Session', placeholder: '2023-24' },
        ] as Field[])
      : []),
    ...(role === 'HOUSE_TUTOR' ? ([{ name: 'assignedFloor', label: 'Floor she looks after', options: FLOORS.map((f) => [f, `Floor ${f}`]) }] as Field[]) : []),
    ...(role !== 'STUDENT' ? ([{ name: 'designation', label: 'Designation', required: false, placeholder: 'Lecturer, Electrician…' }] as Field[]) : []),
  ];

  return (
    <details className="panel">
      <summary>Add a person</summary>
      <label>
        Role
        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {['STUDENT', 'HOUSE_TUTOR', ...STAFF_ROLES, 'PROVOST'].map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r as Role]}
            </option>
          ))}
        </select>
      </label>
      <Form
        key={role}
        submitLabel="Create account"
        fields={fields}
        onSubmit={async (values) => {
          const body = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ''));
          for (const k of ['year', 'assignedFloor']) if (body[k]) (body as Record<string, unknown>)[k] = Number(body[k]);
          const created = await api<Person & { emailSent: boolean; oneTimePassword?: string }>('/users', {
            method: 'POST',
            json: { ...body, role },
          });
          onCreated(created.oneTimePassword ? { name: created.name, universityId: created.universityId, oneTimePassword: created.oneTimePassword } : null);
          return created.emailSent ? `${created.name} was added. Her one-time password was emailed.` : `${created.name} was added.`;
        }}
      />
    </details>
  );
}

function BulkUpload({ onDone }: { onDone: (undelivered: Code[]) => void }) {
  type Result = { created: number; skipped: number; failed: number; errors: string[]; undelivered: Code[] };
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <details className="panel">
      <summary>Upload a spreadsheet</summary>
      <p className="muted small">
        Add many residents at once. Use the template so the columns match; people already in the system are skipped.
      </p>
      <button type="button" className="btn btn-quiet btn-small" onClick={() => download('/users/template/download', 'hallmate-users-template.xlsx').catch((e: Error) => setError(e.message))}>
        Download template
      </button>
      <form
        className="form"
        style={{ marginTop: '1rem' }}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          setResult(null);
          try {
            const r = await api<Result>('/users/bulk-upload', { method: 'POST', body: new FormData(e.currentTarget) });
            setResult(r);
            onDone(r.undelivered ?? []);
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Excel or CSV file
          <input name="file" type="file" required accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" />
        </label>
        <p className="error" role="alert">
          {error}
        </p>
        <button type="submit" className="btn" disabled={busy}>
          {busy ? 'Uploading…' : 'Upload'}
        </button>
      </form>
      {result && (
        <div className="notice-ok" role="status">
          {result.created} added{result.skipped ? `, ${result.skipped} already existed` : ''}
          {result.failed ? `, ${result.failed} row(s) had problems` : ''}.
          {result.errors.length > 0 && (
            <ul className="small">
              {result.errors.slice(0, 10).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </details>
  );
}

function PersonPanel({
  person,
  viewer,
  onChanged,
  onCodes,
  onClose,
}: {
  person: Person;
  viewer: Role;
  onChanged: (p: Person) => void;
  onCodes: (codes: Code[]) => void;
  onClose: () => void;
}) {
  const isAdmin = viewer === 'PROVOST' || viewer === 'SUPER_ADMIN';
  const [message, setMessage] = useState('');
  const run = async (fn: () => Promise<Person | void>, done: string) => {
    setMessage('');
    try {
      const updated = await fn();
      if (updated) onChanged({ ...person, ...updated });
      setMessage(done);
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  return (
    <section className="panel person" aria-label={`${person.name}'s record`}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="row">
          <Avatar src={person.photo} name={person.name} size={64} />
          <div>
            <h2 style={{ margin: 0 }}>{person.name}</h2>
            <p className="muted small" style={{ margin: 0 }}>
              {ROLE_LABEL[person.role]} · {person.universityId}
              {person.currentRoom && ` · room ${person.currentRoom.roomNumber}`}
              {person.assignedFloor && ` · looks after floor ${person.assignedFloor}`}
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-quiet btn-small" onClick={onClose}>
          Close
        </button>
      </div>

      <dl className="kv">
        <div>
          <dt>Email</dt>
          <dd>{person.email}</dd>
        </div>
        <div>
          <dt>Mobile</dt>
          <dd>{person.phone || 'Not given'}</dd>
        </div>
        {person.department && (
          <div>
            <dt>Department</dt>
            <dd>
              {person.department}
              {person.session && `, ${person.session}`}
            </dd>
          </div>
        )}
        <div>
          <dt>Account</dt>
          <dd>{person.isFirstLogin ? 'Not activated yet' : humanize(person.accountStatus)}</dd>
        </div>
      </dl>

      {message && (
        <p className="callout small" role="status">
          {message}
        </p>
      )}

      <div className="grid">
        <details className="panel">
          <summary>Edit details</summary>
          <Form
            submitLabel="Save"
            fields={[
              { ...phoneField, required: false, defaultValue: person.phone ?? '' },
              ...(isAdmin ? ([{ name: 'email', label: 'Email', type: 'email', required: false, defaultValue: person.email }] as Field[]) : []),
              ...(person.role === 'STUDENT' ? ([{ name: 'department', label: 'Department', required: false, defaultValue: person.department ?? '' }] as Field[]) : []),
              ...(isAdmin && person.role !== 'STUDENT' ? ([{ name: 'designation', label: 'Designation', required: false, defaultValue: person.designation ?? '' }] as Field[]) : []),
              ...(isAdmin && person.role === 'PROVOST'
                ? ([
                    {
                      name: 'provostMessage',
                      label: 'প্রভোস্টের বাণী (message from the provost)',
                      hint: 'Shown on the public Provost page, in Bangla, English or both. Line breaks are kept.',
                      multiline: true,
                      required: false,
                      maxLength: 3000,
                      defaultValue: person.provostMessage ?? '',
                    },
                  ] as Field[])
                : []),
            ]}
            onSubmit={async (values) => {
              // Only what changed: the API refuses fields this viewer may not edit
              const changed = Object.fromEntries(Object.entries(values).filter(([k, v]) => v !== '' && v !== (person as Record<string, unknown>)[k]));
              if (Object.keys(changed).length === 0) return 'Nothing changed.';
              onChanged({ ...person, ...(await api<Person>(`/users/${person.id}`, { method: 'PATCH', json: changed })) });
              return 'Saved.';
            }}
          />
        </details>

        {isAdmin && (
          <details className="panel">
            <summary>Account status</summary>
            <Form
              submitLabel="Change status"
              fields={[
                { name: 'accountStatus', label: 'Status', defaultValue: person.accountStatus, options: STATUSES.map((s) => [s, humanize(s)]) },
                { name: 'reason', label: 'Reason (required to cancel a seat)', required: false, multiline: true, minLength: 5, maxLength: 500 },
              ]}
              onSubmit={async ({ accountStatus, reason }) => {
                if (accountStatus === 'SEAT_CANCELLED' && !confirm(`Cancel ${person.name}'s seat? She will be signed out and told the reason.`)) return;
                onChanged({
                  ...person,
                  ...(await api<Person>(`/users/${person.id}/status`, { method: 'PATCH', json: { accountStatus, ...(reason && { reason }) } })),
                });
                return 'Status updated.';
              }}
            />
          </details>
        )}
      </div>

      <div className="row" style={{ marginTop: '1rem' }}>
        {isAdmin && person.isFirstLogin && (
          <button
            type="button"
            className="btn btn-quiet btn-small"
            onClick={() =>
              run(async () => {
                const r = await api<Person & { oneTimePassword?: string }>(`/users/${person.id}/reissue-otp`, { method: 'POST' });
                if (r.oneTimePassword) onCodes([{ name: person.name, universityId: person.universityId, oneTimePassword: r.oneTimePassword }]);
              }, 'A new one-time password was issued.')
            }
          >
            Re-issue one-time password
          </button>
        )}
        {viewer === 'SUPER_ADMIN' && (
          <label className="row small">
            Role
            <select
              value={person.role}
              onChange={(e) => {
                const role = e.target.value;
                if (confirm(`Make ${person.name} ${ROLE_LABEL[role as Role]}?`))
                  void run(() => api<Person>(`/users/${person.id}/role`, { method: 'PATCH', json: { role } }), 'Role changed.');
              }}
              style={{ width: 'auto' }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </section>
  );
}
