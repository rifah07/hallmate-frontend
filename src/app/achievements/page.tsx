import { Empty } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { SampleBadge } from '@/components/SampleBadge';
import { Unavailable } from '@/components/Unavailable';
import { getPublic } from '@/lib/public-api';
import type { Achievement } from '@/lib/types';

export const metadata = { title: 'Achievements' };

export default async function AchievementsPage() {
  const achievements = await getPublic<Achievement[]>('achievements?limit=50');
  return (
    <>
      <PageHeader kicker="About" title="Achievements" lead="What residents of the hall have won, built and given." />
      <section className="section">
        <div className="container">
          {achievements === null && <Unavailable what="achievements" />}
          {achievements?.length === 0 && <Empty title="Nothing recorded yet" />}
          <ol className="timeline">
            {achievements?.map((a) => (
              <li key={a.id}>
                <span className="timeline-year">{a.year}</span>
                <article className="card">
                  <p className="row" style={{ margin: 0 }}>
                    <span className="chip chip-sage">{a.category}</span>
                    <SampleBadge show={a.isSample} />
                  </p>
                  <h3 style={{ marginTop: '0.75rem' }}>{a.title}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    {a.description}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
