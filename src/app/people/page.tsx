import { Avatar } from '@/components/Avatar';
import { PageHeader } from '@/components/PageHeader';
import { Unavailable } from '@/components/Unavailable';
import { yearOf } from '@/lib/format';
import { getPublic } from '@/lib/public-api';
import type { HouseTutor, Provost, Staff } from '@/lib/types';

export const metadata = { title: 'People' };

const isBangla = (s: string) => /[ঀ-৿]/.test(s);

export default async function PeoplePage() {
  const [provosts, tutors, staff] = await Promise.all([
    getPublic<Provost[]>('provosts'),
    getPublic<HouseTutor[]>('house-tutors'),
    getPublic<Staff[]>('staff?limit=50'),
  ]);
  const current = provosts?.find((p) => p.isCurrent);
  const former = provosts?.filter((p) => !p.isCurrent) ?? [];

  return (
    <>
      <PageHeader kicker="People" title="Who looks after the hall" />

      <section className="section">
        <div className="container">
          <h2>Provost</h2>
          {current ? (
            <article className="card row" style={{ gap: '1.5rem', alignItems: 'flex-start', maxWidth: '44rem' }}>
              <Avatar src={current.photoUrl} name={current.name} size={112} />
              <div>
                <h3>{current.name}</h3>
                <p className="muted">{current.department}</p>
                <p style={{ margin: 0 }}>Provost since {yearOf(current.tenureStart)}</p>
              </div>
            </article>
          ) : (
            provosts === null && <Unavailable what="provost details" />
          )}

          {former.length > 0 && (
            <>
              <h3 style={{ marginTop: '2.5rem' }}>Former provosts</h3>
              <div className="grid">
                {former.map((p) => (
                  <article key={p.id} className="card row" style={{ gap: '1rem' }}>
                    <Avatar src={p.photoUrl} name={p.name} size={56} />
                    <div>
                      <strong>{p.name}</strong>
                      <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                        {yearOf(p.tenureStart)} to {yearOf(p.tenureEnd)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <h2>House tutors</h2>
          {tutors === null && <Unavailable what="house tutors" />}
          <div className="grid">
            {tutors?.map((t) => (
              <article key={t.id} className="card">
                <div className="row" style={{ gap: '1rem' }}>
                  <Avatar src={t.photoUrl} name={t.name} size={56} />
                  <div>
                    <h3 lang={isBangla(t.name) ? 'bn' : undefined} style={{ fontSize: '1.15rem' }}>
                      {t.name}
                    </h3>
                    <span className="chip">{t.designation}</span>
                  </div>
                </div>
                <p lang="bn" className="bn muted" style={{ margin: '0.9rem 0 0' }}>
                  {t.bio && `${t.bio}, `}
                  {t.department}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {staff && staff.length > 0 && (
        <section className="section">
          <div className="container">
            <h2>Hall office</h2>
            <div className="grid">
              {staff.map((s) => (
                <article key={s.id} className="card row" style={{ gap: '1rem' }}>
                  <Avatar src={s.photoUrl} name={s.name} size={56} />
                  <div>
                    <strong>{s.name}</strong>
                    <p className="muted" style={{ margin: 0 }}>
                      {s.designation}
                    </p>
                    {s.phone && <a href={`tel:${s.phone}`}>{s.phone}</a>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
