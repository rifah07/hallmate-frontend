import { ApplyForm } from '@/components/ApplyForm';
import { PageHeader } from '@/components/PageHeader';

export const metadata = { title: 'Apply online' };

export default function ApplyPage() {
  return (
    <>
      <PageHeader
        kicker="Admission"
        title="Apply online"
        lead="Ask for a seat or send the hall office a question. You get a tracking ID to follow it."
      />
      <section className="section">
        <div className="container" style={{ maxWidth: '44rem' }}>
          <div className="card">
            <ApplyForm />
          </div>
        </div>
      </section>
    </>
  );
}
