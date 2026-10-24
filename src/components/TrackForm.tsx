'use client';

import { useState } from 'react';
import { api } from '@/lib/client-api';
import { formatDate, humanize } from '@/lib/format';
import type { TrackedApplication } from '@/lib/types';
import { Form } from './Form';
import { Status } from './Status';

const UUID = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

export function TrackForm({ initialId, initial }: { initialId: string; initial: TrackedApplication | null }) {
  const [found, setFound] = useState(initial);

  return (
    <div className="stack">
      <div className="card">
        <Form
          submitLabel="Check status"
          fields={[{ name: 'id', label: 'Tracking ID', defaultValue: initialId, pattern: UUID, hint: 'It looks like 61ac1b15-a225-49f9-8de2-056cc8fdc275.' }]}
          onSubmit={async ({ id }) => {
            setFound(null);
            // A wrong ID throws "Application not found", which the form shows
            setFound(await api<TrackedApplication>(`/public/applications/track/${encodeURIComponent(id.trim())}`));
          }}
        />
      </div>
      {found && (
        <article className="card" role="status">
          <p className="row" style={{ margin: 0 }}>
            <Status value={found.status} />
            <span className="muted small">{humanize(found.type)}</span>
          </p>
          <h2 style={{ marginTop: '0.75rem' }}>{found.subject}</h2>
          <p className="muted">
            Sent {formatDate(found.createdAt)}
            {found.updatedAt !== found.createdAt && ` · updated ${formatDate(found.updatedAt)}`}
          </p>
          {found.responseNote && <p className="callout">{found.responseNote}</p>}
        </article>
      )}
    </div>
  );
}
