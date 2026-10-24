import { NoticeList } from '@/components/NoticeList';
import { PageHeader } from '@/components/PageHeader';
import { Unavailable } from '@/components/Unavailable';
import { getPublic } from '@/lib/public-api';
import type { PublicNotice } from '@/lib/types';

export const metadata = { title: 'Notices' };

export default async function NoticesPage() {
  const notices = await getPublic<PublicNotice[]>('notices?limit=50');
  return (
    <>
      <PageHeader kicker="Notices" title="Notice board" lead="Official notices from the hall office. Most are published as PDFs." />
      <section className="section">
        <div className="container" style={{ maxWidth: '52rem' }}>
          {notices ? <NoticeList notices={notices} /> : <Unavailable what="notices" />}
        </div>
      </section>
    </>
  );
}
