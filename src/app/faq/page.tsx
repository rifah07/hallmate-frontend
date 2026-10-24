import Link from 'next/link';
import { Empty } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { SampleBadge } from '@/components/SampleBadge';
import { Unavailable } from '@/components/Unavailable';
import { getPublic } from '@/lib/public-api';
import type { Faq } from '@/lib/types';

export const metadata = { title: 'FAQ' };

export default async function FaqPage() {
  const faqs = await getPublic<Faq[]>('faq');
  // The API sorts by category, so grouping keeps that order
  const groups = Object.groupBy(faqs ?? [], (f) => f.category);

  return (
    <>
      <PageHeader kicker="Help" title="Questions people ask" lead="About admission, life in the hall, fees and safety." />
      <section className="section">
        <div className="container" style={{ maxWidth: '48rem' }}>
          {faqs === null && <Unavailable what="questions" />}
          {faqs?.length === 0 && <Empty title="No questions yet" />}
          {Object.entries(groups).map(([category, items]) => (
            <div key={category} className="faq-group">
              <h2>{category}</h2>
              {items?.map((f) => (
                <details key={f.id} className="faq">
                  <summary>
                    {f.question} <SampleBadge show={f.isSample} />
                  </summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          ))}
          <p className="muted" style={{ marginTop: '2rem' }}>
            Didn&apos;t find it? <Link href="/contact">Write to the hall office</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
