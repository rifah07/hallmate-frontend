import Link from 'next/link';
import { KeyValues } from '@/components/KeyValues';
import { PageHeader } from '@/components/PageHeader';
import { PersonCard } from '@/components/PersonCard';
import { Unavailable } from '@/components/Unavailable';
import { formatDate } from '@/lib/format';
import { getPublic } from '@/lib/public-api';
import type { Provost } from '@/lib/types';

export const metadata = { title: 'Provost' };

export default async function ProvostPage() {
  const provosts = await getPublic<Provost[]>('provosts');
  const current = provosts?.find((p) => p.isCurrent);

  return (
    <>
      <PageHeader kicker="People" title="The provost" lead="The provost leads the hall: its residents, its staff and its decisions." />
      <section className="section">
        <div className="container">
          {provosts === null && <Unavailable what="provost details" />}
          {current && (
            <div className="feature-person">
              <PersonCard name={current.name} photoUrl={current.photoUrl} role={current.designation} />
              <div className="stack">
                <KeyValues
                  items={[
                    ['Department', current.department],
                    ['Provost since', formatDate(current.tenureStart)],
                  ]}
                />
                {current.bio && <p>{current.bio}</p>}
                <p>
                  <Link href="/provosts">Every provost of the hall →</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
