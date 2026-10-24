import { initialOf } from '@/lib/format';

// A photo when there is one, otherwise her initial on blush: never a broken image.
export function Avatar({ src, name, size = 72 }: { src: string | null; name: string; size?: number }) {
  const style = { width: size, height: size };
  if (!src) {
    return (
      <span className="avatar avatar-initial" style={style} aria-hidden="true">
        {initialOf(name)}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- remote images from Cloudinary
  return <img src={src} alt="" className="avatar" style={style} loading="lazy" referrerPolicy="no-referrer" />;
}
