import Link from 'next/link';
import { KeyValues } from '@/components/KeyValues';
import { Empty } from '@/components/Loading';
import { PageHeader } from '@/components/PageHeader';
import { SampleBadge } from '@/components/SampleBadge';
import { formatDate, formatTaka } from '@/lib/format';
import { getPublic } from '@/lib/public-api';
import type { AdmissionInfo } from '@/lib/types';

export const metadata = { title: 'Admission' };

export default async function AdmissionPage() {
  const admission = (await getPublic<{ current: AdmissionInfo | null }>('admission'))?.current;
  return (
    <>
      <PageHeader kicker="Admission" title="Getting a seat in the hall" lead="Who can apply, what to bring and when it happens." />
      <section className="section">
        <div className="container">
          {!admission ? (
            <Empty title="Admission details are on their way">
              The hall office publishes them before each session. You can still <Link href="/apply">send an enquiry</Link>.
            </Empty>
          ) : (
            <div className="two-col">
              <div className="stack">
                <p className="row" style={{ margin: 0 }}>
                  <span className="chip">Session {admission.session}</span>
                  <SampleBadge show={admission.isSample} />
                </p>
                <h2>Who can apply</h2>
                <p>{admission.eligibility}</p>
                <h2>How it works</h2>
                <p>{admission.process}</p>
                <h2>What to bring</h2>
                <ul className="pill-list">
                  {admission.requiredDocs.map((doc) => (
                    <li key={doc} className="chip chip-sage">
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
              <aside className="stack">
                <div className="card">
                  <KeyValues
                    items={[
                      ['Seats this session', admission.seatCapacity],
                      ['Application fee', admission.applicationFee == null ? null : formatTaka(admission.applicationFee)],
                    ]}
                  />
                  {admission.importantDates && (
                    <ol className="timeline" style={{ marginTop: '1.25rem' }}>
                      {admission.importantDates.map((d) => (
                        <li key={d.label}>
                          <b>{d.label}</b>
                          <span className="muted"> · {formatDate(d.date)}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  <div className="row" style={{ marginTop: '1.25rem' }}>
                    <Link href="/apply" className="btn">
                      Apply online
                    </Link>
                    <Link href="/track" className="btn btn-quiet">
                      Track an application
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
