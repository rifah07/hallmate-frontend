import { PageHeader } from '@/components/PageHeader';
import { Unavailable } from '@/components/Unavailable';
import { getPublic } from '@/lib/public-api';
import type { Facility } from '@/lib/types';

export const metadata = { title: 'Facilities' };

const LABELS: Record<string, string> = {
  ACCOMMODATION: 'Living',
  DINING: 'Food',
  ACADEMIC: 'Study',
  RECREATION: 'Together',
  HEALTH: 'Health',
  SPORTS: 'Sport',
  UTILITIES: 'Services',
};

export default async function FacilitiesPage() {
  const facilities = await getPublic<Facility[]>('facilities');
  return (
    <>
      <PageHeader kicker="Facilities" title="What the hall offers" lead="Places to study, eat, meet and rest." />
      <section className="section">
        <div className="container">
          {facilities === null && <Unavailable what="facilities" />}
          <div className="grid">
            {facilities?.map((f) => (
              <article key={f.id} className="card">
                <span className="chip chip-sage">{LABELS[f.category] ?? f.category}</span>
                <h3 lang={/[ঀ-৿]/.test(f.name) ? 'bn' : undefined} style={{ marginTop: '0.75rem' }}>
                  {f.name}
                </h3>
                <p className="muted" style={{ margin: 0 }}>
                  {f.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
