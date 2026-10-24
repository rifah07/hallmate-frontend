import { PageHeader } from '@/components/PageHeader';
import { PersonCard } from '@/components/PersonCard';
import { PhoneLink } from '@/components/PhoneLink';
import { Unavailable } from '@/components/Unavailable';
import { getPublic } from '@/lib/public-api';
import type { Staff } from '@/lib/types';

export const metadata = { title: 'Hall office' };

export default async function StaffPage() {
  const staff = await getPublic<Staff[]>('staff?limit=50');
  return (
    <>
      <PageHeader kicker="People" title="The hall office" lead="The people who keep the hall running day to day." />
      <section className="section">
        <div className="container">
          {staff === null && <Unavailable what="hall office" />}
          <div className="people-grid">
            {staff?.map((s) => (
              <PersonCard key={s.id} name={s.name} photoUrl={s.photoUrl} role={s.designation}>
                {s.phone && <PhoneLink phone={s.phone} />}
                {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
              </PersonCard>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
