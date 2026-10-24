import { PageHeader } from '@/components/PageHeader';
import { TrackForm } from '@/components/TrackForm';
import { getPublic } from '@/lib/public-api';
import type { TrackedApplication } from '@/lib/types';

export const metadata = { title: 'Track an application' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function TrackPage({ searchParams }: PageProps<'/track'>) {
  const { id } = await searchParams;
  const initialId = typeof id === 'string' ? id : '';
  // Arriving from "Track it now": look it up here, fresh (revalidate 0), so the page opens with the answer
  const initial = UUID.test(initialId) ? await getPublic<TrackedApplication>(`applications/track/${initialId}`, 0) : null;

  return (
    <>
      <PageHeader kicker="Admission" title="Track an application" lead="Enter the tracking ID you received after applying." />
      <section className="section">
        <div className="container" style={{ maxWidth: '44rem' }}>
          <TrackForm initialId={initialId} initial={initial} />
        </div>
      </section>
    </>
  );
}
