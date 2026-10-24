import { getPublic } from '@/lib/public-api';
import type { HallInfo } from '@/lib/types';

// The hall's own logo from the API; the jali mark if the API is unreachable.
// Header, footer and home page all call this: Next.js makes it one request.
export async function HallLogo({ size = 36 }: { size?: number }) {
  const hall = await getPublic<HallInfo>('hall-info');
  if (!hall?.logoUrl) return <span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote logo from Cloudinary
    <img src={hall.logoUrl} alt="" width={size} height={size} className="brand-logo" referrerPolicy="no-referrer" />
  );
}
