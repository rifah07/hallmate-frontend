import { PageHeader } from '@/components/PageHeader';
import { PersonCard } from '@/components/PersonCard';
import { Unavailable } from '@/components/Unavailable';
import { langOf } from '@/lib/format';
import { getPublic } from '@/lib/public-api';
import type { HouseTutor } from '@/lib/types';

export const metadata = { title: 'House tutors' };

export default async function HouseTutorsPage() {
  const tutors = await getPublic<HouseTutor[]>('house-tutors');
  return (
    <>
      <PageHeader
        kicker="People"
        title="House tutors"
        lead="Each floor has its own house tutor: the first person to go to for leave, visitors and anything on the floor."
      />
      <section className="section">
        <div className="container">
          {tutors === null && <Unavailable what="house tutors" />}
          <div className="people-grid">
            {tutors?.map((t) => (
              <PersonCard
                key={t.id}
                name={t.name}
                photoUrl={t.photoUrl}
                role={t.designation}
                tag={t.floor ? `Floor ${t.floor}` : undefined}
                sample={t.isSample}
              >
                <p lang={langOf(t.department)} className="muted small">
                  {t.bio && `${t.bio}, `}
                  {t.department}
                </p>
                {t.email && <a href={`mailto:${t.email}`}>{t.email}</a>}
              </PersonCard>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
