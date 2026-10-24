import { PageHeader } from '@/components/PageHeader';
import { Unavailable } from '@/components/Unavailable';
import { getPublic } from '@/lib/public-api';
import type { HallInfo } from '@/lib/types';

export const metadata = { title: 'About the hall' };

// Dates from the university administration, as reported by Prothom Alo
const HISTORY = [
  { date: '20 October 2020', text: 'The hall first opens as the women students’ residence of Jagannath University.' },
  { date: '16 March 2022', text: 'The hall is inaugurated again and residents move in.' },
  { date: '24 June 2025', text: 'Renamed Nawab Faizunnesa Chowdhurani Hall.' },
];

export default async function AboutPage() {
  const hall = await getPublic<HallInfo>('hall-info');
  return (
    <>
      <PageHeader kicker="About" title="A home on campus" lead={hall?.location} />
      <section className="section">
        <div className="container" style={{ display: 'grid', gap: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))' }}>
          <div>
            {hall ? <p style={{ fontSize: '1.1rem' }}>{hall.description}</p> : <Unavailable what="hall details" />}
            {hall?.email && (
              <p>
                Hall office: <a href={`mailto:${hall.email}`}>{hall.email}</a>
              </p>
            )}
          </div>
          <div>
            <h2>History</h2>
            <ol className="timeline">
              {HISTORY.map((h) => (
                <li key={h.date}>
                  <time>{h.date}</time>
                  <p style={{ margin: 0 }}>{h.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section className="section section-tint">
        <div className="container" style={{ maxWidth: '46rem' }}>
          <span className="kicker">The name</span>
          <h2>Nawab Faizunnesa Choudhurani</h2>
          <p>
            A zamindar of Comilla and one of the earliest champions of women&apos;s education in Bengal. She founded a
            girls&apos; high school in Comilla in 1873 and was granted the title of Nawab in 1889.
          </p>
        </div>
      </section>
    </>
  );
}
