import { ContactForm } from '@/components/ContactForm';
import { PageHeader } from '@/components/PageHeader';
import { PhoneLink } from '@/components/PhoneLink';
import { getPublic } from '@/lib/public-api';
import { site } from '@/lib/site';
import type { HallInfo } from '@/lib/types';

export const metadata = { title: 'Contact' };

export default async function ContactPage() {
  const hall = await getPublic<HallInfo>('hall-info');
  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Write to the hall office"
        lead="Questions about admission, seats or visiting. Residents with a complaint can raise it from their dashboard."
      />
      <section className="section">
        <div className="container split">
          <aside className="stack">
            <div className="card">
              <h3>Hall office</h3>
              <p className="muted">
                {site.name}
                <br />
                {hall?.location ?? site.university}
              </p>
              {hall?.email && (
                <p style={{ margin: 0 }}>
                  <a href={`mailto:${hall.email}`}>{hall.email}</a>
                </p>
              )}
              {hall?.phone && (
                <p style={{ margin: 0 }}>
                  <PhoneLink phone={hall.phone} />
                </p>
              )}
            </div>
            <p className="hint">
              Please don&apos;t send ID numbers, passwords or payment details in this form.
            </p>
          </aside>
          <div className="card">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
