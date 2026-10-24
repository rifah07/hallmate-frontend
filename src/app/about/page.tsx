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
  // The hall's own photo once the office uploads one; a drawing of the tower until then
  const cover = hall?.coverUrl ?? '/illustrations/gallery-hall.svg';

  return (
    <>
      <PageHeader kicker="About" title="A home on campus" lead={hall?.location} />
      <section className="section">
        <div className="container about-intro">
          <figure className="about-figure">
            {/* eslint-disable-next-line @next/next/no-img-element -- hall photo or local illustration */}
            <img src={cover} alt="The sixteen-storey hall" width={800} height={600} referrerPolicy="no-referrer" />
            {!hall?.coverUrl && <figcaption>The hall tower at dusk, drawn for HallMate.</figcaption>}
          </figure>
          <div className="stack">
            {hall ? <p className="lead">{hall.description}</p> : <Unavailable what="hall details" />}
            {hall && (
              <div className="facts" style={{ marginTop: 0 }}>
                <div className="fact">
                  <b>{hall.established}</b>
                  <span>first opened</span>
                </div>
                <div className="fact">
                  <b>16</b>
                  <span>storeys</span>
                </div>
                <div className="fact">
                  <b>{hall.totalRooms}</b>
                  <span>rooms</span>
                </div>
                <div className="fact">
                  <b>{hall.capacity}</b>
                  <span>residents</span>
                </div>
              </div>
            )}
            {hall?.email && (
              <p>
                Hall office: <a href={`mailto:${hall.email}`}>{hall.email}</a>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container two-col">
          <div>
            <span className="kicker">History</span>
            <h2>Five years of the hall</h2>
            <ol className="timeline" style={{ marginTop: '1.5rem' }}>
              {HISTORY.map((h) => (
                <li key={h.date}>
                  <time>{h.date}</time>
                  <p style={{ margin: 0 }}>{h.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <span className="kicker">The name</span>
            <h2>Nawab Faizunnesa Choudhurani</h2>
            <p>
              A zamindar of Comilla and one of the earliest champions of women&apos;s education in Bengal. She founded a
              girls&apos; high school in Comilla in 1873 and was granted the title of Nawab in 1889.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
