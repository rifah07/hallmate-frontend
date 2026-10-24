import Link from 'next/link';
import { KeyValues } from '@/components/KeyValues';
import { PageHeader } from '@/components/PageHeader';
import { PersonCard } from '@/components/PersonCard';
import { Unavailable } from '@/components/Unavailable';
import { formatDate, langOf } from '@/lib/format';
import { getPublic } from '@/lib/public-api';
import type { Provost } from '@/lib/types';

export const metadata = { title: 'Provost' };

export default async function ProvostPage() {
  const [provosts, account] = await Promise.all([
    getPublic<Provost[]>('provosts'),
    // The message lives on the provost's own account; none yet is fine
    getPublic<{ provostMessage: string | null }>('provost'),
  ]);
  const current = provosts?.find((p) => p.isCurrent);
  const message = account?.provostMessage?.trim();

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

                <article className="provost-message">
                  <h2 lang="bn">প্রভোস্টের বাণী</h2>
                  <p className="kicker">Message from the provost</p>
                  {message ? (
                    // Each paragraph keeps its own language, so Bangla gets its font and line height
                    message.split(/\n\s*\n/).map((para, i) => (
                      <p key={i} lang={langOf(para)}>
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="muted">The provost&apos;s message will appear here.</p>
                  )}
                </article>

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
