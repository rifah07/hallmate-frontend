import { Empty } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { Unavailable } from '@/components/Unavailable';
import { getPublic } from '@/lib/public-api';
import type { GalleryItem } from '@/lib/types';

export const metadata = { title: 'Gallery' };

export default async function GalleryPage() {
  const items = await getPublic<GalleryItem[]>('gallery?limit=50');
  return (
    <>
      <PageHeader kicker="Gallery" title="Moments from the hall" lead="Drills, campaigns, celebrations and everyday life." />
      <section className="section">
        <div className="container">
          {items === null && <Unavailable what="gallery" />}
          {items?.length === 0 && <Empty title="No photos yet">The hall office will add photos of the hall here.</Empty>}
          <div className="gallery">
            {items?.map((g) => (
              <figure key={g.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- remote gallery images */}
                <img src={g.imageUrl} alt={g.title} loading="lazy" referrerPolicy="no-referrer" />
                <figcaption lang="bn">{g.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
