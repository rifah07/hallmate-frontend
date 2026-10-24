import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import { NoticeList } from '@/components/NoticeList';
import { getPublic } from '@/lib/public-api';
import { site } from '@/lib/site';
import type { Facility, GalleryItem, HallInfo, Provost, PublicNotice } from '@/lib/types';

export default async function HomePage() {
  // In parallel: the page waits for the slowest call, not the sum of all
  const [hall, provosts, notices, facilities, gallery] = await Promise.all([
    getPublic<HallInfo>('hall-info'),
    getPublic<Provost[]>('provosts'),
    getPublic<PublicNotice[]>('notices?limit=3'),
    getPublic<Facility[]>('facilities'),
    getPublic<GalleryItem[]>('gallery?limit=6'),
  ]);
  const provost = provosts?.find((p) => p.isCurrent);

  return (
    <>
      <section className="hero">
        <div className="container rise">
          <span className="hero-bn" lang="bn">
            {site.nameBn}
          </span>
          <h1>{site.name}</h1>
          <p className="lead">
            A home for the women students of {site.university}. Notices, people and services of the hall, and a
            portal for residents.
          </p>
          <div className="row" style={{ marginTop: '1.75rem' }}>
            <Link href="/login" className="btn">
              Resident login
            </Link>
            <Link href="/about" className="btn btn-quiet">
              About the hall
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
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'grid', gap: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))' }}>
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
                <Link href="/people">The hall&apos;s people →</Link>
              </p>
            </aside>
          )}
        </div>
      </section>

      {facilities && facilities.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <span className="kicker">Life in the hall</span>
            <h2>Facilities</h2>
            <div className="grid" style={{ marginTop: '1.5rem' }}>
              {facilities.slice(0, 4).map((f) => (
                <article key={f.id} className="card">
                  <h3 lang={/[ঀ-৿]/.test(f.name) ? 'bn' : undefined}>{f.name}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    {f.description}
                  </p>
                </article>
              ))}
            </div>
            <p style={{ marginTop: '1.5rem' }}>
              <Link href="/facilities">All facilities →</Link>
            </p>
          </div>
        </section>
      )}

      {gallery && gallery.length > 0 && (
        <section className="section">
          <div className="container">
            <span className="kicker">Moments</span>
            <h2>From the gallery</h2>
            <div className="gallery" style={{ marginTop: '1.5rem' }}>
              {gallery.map((g) => (
                <figure key={g.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote gallery images */}
                  <img src={g.imageUrl} alt={g.title} loading="lazy" referrerPolicy="no-referrer" />
                  <figcaption lang="bn">{g.title}</figcaption>
                </figure>
              ))}
            </div>
            <p style={{ marginTop: '1rem' }}>
              <Link href="/gallery">See the gallery →</Link>
            </p>
          </div>
        </section>
      )}
    </>
  );
}
