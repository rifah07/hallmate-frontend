import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import { EventCard } from '@/components/EventCard';
import { Gallery } from '@/components/Gallery';
import { HallLogo } from '@/components/HallLogo';
import { NoticeList } from '@/components/NoticeList';
import { SampleBadge } from '@/components/SampleBadge';
import { langOf } from '@/lib/format';
import { getPublic } from '@/lib/public-api';
import { site } from '@/lib/site';
import type { Achievement, Facility, GalleryItem, HallInfo, Provost, PublicEvent, PublicNotice } from '@/lib/types';

export default async function HomePage() {
  // In parallel: the page waits for the slowest call, not the sum of all
  const [hall, provosts, notices, events, facilities, achievements, gallery] = await Promise.all([
    getPublic<HallInfo>('hall-info'),
    getPublic<Provost[]>('provosts'),
    getPublic<PublicNotice[]>('notices?limit=4'),
    getPublic<PublicEvent[]>('events?upcoming=true&limit=3'),
    getPublic<Facility[]>('facilities'),
    getPublic<Achievement[]>('achievements?limit=3'),
    getPublic<GalleryItem[]>('gallery?limit=6'),
  ]);
  const provost = provosts?.find((p) => p.isCurrent);

  return (
    <>
      <section className="hero hero-home">
        <div className="container hero-grid">
          <div className="rise">
            <span className="hero-bn" lang="bn">
              {site.nameBn}
            </span>
            <h1>{site.name}</h1>
            <p className="lead">
              A home for the women students of {site.university}. Notices, people and services of the hall, and a
              portal for every resident.
            </p>
            <div className="row" style={{ marginTop: '1.75rem' }}>
              <Link href="/admission" className="btn">
                Apply for a seat
              </Link>
              <Link href="/login" className="btn btn-quiet">
                Resident login
              </Link>
            </div>
            {hall && (
              <div className="facts">
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
          </div>
          <figure className="hero-art">
            {/* eslint-disable-next-line @next/next/no-img-element -- local SVG illustration */}
            <img src="/illustrations/hall-hero.svg" alt="An illustration of the sixteen-storey hall" width={800} height={720} />
            <span className="hero-seal">
              <HallLogo size={64} />
            </span>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div>
            <span className="kicker">Latest notices</span>
            <h2>From the hall office</h2>
            {notices ? <NoticeList notices={notices} /> : <p className="muted">Notices can&apos;t be loaded right now.</p>}
            <p style={{ marginTop: '1rem' }}>
              <Link href="/notices">All notices →</Link>
            </p>
          </div>
          {provost && (
            <aside className="card" style={{ alignSelf: 'start' }}>
              <span className="kicker">Provost</span>
              <div className="row" style={{ alignItems: 'flex-start', gap: '1.1rem' }}>
                <Avatar src={provost.photoUrl} name={provost.name} size={84} />
                <div>
                  <h3>{provost.name}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    {provost.department}
                  </p>
                </div>
              </div>
              <p style={{ marginTop: '1rem', marginBottom: 0 }}>
                <Link href="/provost">Meet the provost →</Link> · <Link href="/house-tutors">House tutors</Link>
              </p>
            </aside>
          )}
        </div>
      </section>

      {events && events.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <span className="kicker">Coming up</span>
            <h2>Events in the hall</h2>
            <div className="event-grid" style={{ marginTop: '1.5rem' }}>
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
            <p style={{ marginTop: '1.5rem' }}>
              <Link href="/events">All events →</Link>
            </p>
          </div>
        </section>
      )}

      {facilities && facilities.length > 0 && (
        <section className="section">
          <div className="container">
            <span className="kicker">Life in the hall</span>
            <h2>Facilities</h2>
            <div className="grid" style={{ marginTop: '1.5rem' }}>
              {facilities.slice(0, 4).map((f) => (
                <article key={f.id} className="card">
                  <h3 lang={langOf(f.name)}>{f.name}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    {f.description}
                  </p>
                </article>
              ))}
            </div>
            <p style={{ marginTop: '1.5rem' }}>
              <Link href="/facilities">All facilities →</Link> · <Link href="/dining">Dining</Link>
            </p>
          </div>
        </section>
      )}

      {achievements && achievements.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <span className="kicker">Proud of</span>
            <h2>Achievements</h2>
            <div className="grid" style={{ marginTop: '1.5rem' }}>
              {achievements.map((a) => (
                <article key={a.id} className="card">
                  <p className="row" style={{ margin: 0 }}>
                    <span className="chip chip-sage">{a.year}</span>
                    <SampleBadge show={a.isSample} />
                  </p>
                  <h3 style={{ marginTop: '0.75rem' }}>{a.title}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    {a.description}
                  </p>
                </article>
              ))}
            </div>
            <p style={{ marginTop: '1.5rem' }}>
              <Link href="/achievements">All achievements →</Link>
            </p>
          </div>
        </section>
      )}

      {gallery && gallery.length > 0 && (
        <section className="section">
          <div className="container">
            <span className="kicker">Moments</span>
            <h2>From the gallery</h2>
            <div style={{ marginTop: '1.5rem' }}>
              <Gallery items={gallery} />
            </div>
            <p style={{ marginTop: '1rem' }}>
              <Link href="/gallery">See the gallery →</Link>
            </p>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Looking for a seat?</h2>
              <p>Read who can apply and what to bring, then apply online and follow your application with its tracking ID.</p>
            </div>
            <div className="row">
              <Link href="/admission" className="btn btn-light">
                Admission
              </Link>
              <Link href="/track" className="btn btn-ghost-light">
                Track an application
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
