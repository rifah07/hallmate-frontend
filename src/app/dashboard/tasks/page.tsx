'use client';

import { Empty, Loading } from '@/components/Loading';
import { RequestCard, RespondForm } from '@/components/RequestCard';
import type { ApplicationList } from '@/lib/applications';
import { useData } from '@/lib/use-data';

// Complaints and repairs the provost handed to this person. Support staff
// see only these: no resident lists, rooms or contact details beyond the job.
export default function TasksPage() {
  const { data, error, reload } = useData<ApplicationList>('/applications/assigned?limit=50');
  const open = data?.applications.filter((a) => a.status === 'PENDING') ?? [];
  const closed = data?.applications.filter((a) => a.status !== 'PENDING') ?? [];

  return (
    <>
      <header className="dash-head">
        <span className="kicker">Work</span>
        <h1>My tasks</h1>
        {data && <p className="muted">{open.length ? `${open.length} open` : 'Nothing open right now.'}</p>}
      </header>
      {!data ? (
        <Loading error={error} />
      ) : data.applications.length === 0 ? (
        <Empty title="No tasks assigned">When the hall office assigns you a repair or complaint, it appears here.</Empty>
      ) : (
        <>
          <ul className="stack-list">
            {open.map((app) => (
              <RequestCard key={app.id} app={app}>
                <RespondForm app={app} onDone={reload} labels={['Mark as done', "Can't be done"]} />
              </RequestCard>
            ))}
          </ul>
          {closed.length > 0 && (
            <details className="panel" style={{ marginTop: '2rem' }}>
              <summary>Finished ({closed.length})</summary>
              <ul className="stack-list">
                {closed.map((app) => (
                  <RequestCard key={app.id} app={app} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </>
  );
}
