import { initialOf, langOf } from '@/lib/format';
import { SampleBadge } from './SampleBadge';

// One card for provosts, house tutors and staff. The portrait area is the
// same size with or without a photo, so a grid of mixed cards stays even.
export function PersonCard({
  name,
  photoUrl,
  role,
  tag,
  sample,
  children,
}: {
  name: string;
  photoUrl: string | null;
  role: string;
  tag?: string;
  sample?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <article className="person-card">
      <div className="person-portrait">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote photos from Cloudinary
          <img src={photoUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <span aria-hidden="true">{initialOf(name)}</span>
        )}
        {tag && <span className="person-tag">{tag}</span>}
      </div>
      <div className="person-body">
        <h3 lang={langOf(name)}>{name}</h3>
        <p className="person-role">
          {role} <SampleBadge show={sample} />
        </p>
        {children}
      </div>
    </article>
  );
}
