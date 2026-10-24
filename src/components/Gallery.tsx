import { langOf } from '@/lib/format';
import type { GalleryItem } from '@/lib/types';
import { SampleBadge } from './SampleBadge';

export function Gallery({ items }: { items: GalleryItem[] }) {
  return (
    <div className="gallery">
      {items.map((g) => (
        <figure key={g.id}>
          {/* eslint-disable-next-line @next/next/no-img-element -- illustrations or remote images */}
          <img src={g.imageUrl} alt={g.title} loading="lazy" referrerPolicy="no-referrer" />
          <figcaption lang={langOf(g.title)}>
            {g.title} <SampleBadge show={g.isSample} />
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
