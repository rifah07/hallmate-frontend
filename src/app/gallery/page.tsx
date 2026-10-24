import { Gallery } from '@/components/Gallery';
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
          {items && <Gallery items={items} />}
        </div>
      </section>
    </>
  );
}
