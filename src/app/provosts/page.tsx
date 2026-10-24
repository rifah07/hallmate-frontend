import { PageHeader } from '@/components/PageHeader';
import { PersonCard } from '@/components/PersonCard';
import { Unavailable } from '@/components/Unavailable';
import { langOf, yearOf } from '@/lib/format';
import { getPublic } from '@/lib/public-api';
import type { Provost } from '@/lib/types';

export const metadata = { title: 'All provosts' };

export default async function ProvostsPage() {
  const provosts = await getPublic<Provost[]>('provosts');
  return (
    <>
      <PageHeader kicker="People" title="Every provost of the hall" lead="One provost at a time, newest first." />
      <section className="section">
        <div className="container">
          {provosts === null && <Unavailable what="provosts" />}
          <div className="people-grid">
            {provosts?.map((p) => (
              <PersonCard
                key={p.id}
                name={p.name}
                photoUrl={p.photoUrl}
                role={p.isCurrent ? 'Provost' : 'Former provost'}
                tag={p.isCurrent ? 'Current' : undefined}
              >
                {p.department && <p lang={langOf(p.department)}>{p.department}</p>}
                <p className="muted small">
                  {yearOf(p.tenureStart)} to {p.tenureEnd ? yearOf(p.tenureEnd) : 'today'}
                </p>
              </PersonCard>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
