import Link from 'next/link';

export const metadata = { title: 'Payment', robots: { index: false } };

// Where the API sends the payer back after SSLCommerz. The status here is
// only for display: a bill counts as paid once the API has verified it
// with the gateway, never because of this URL.
const RESULTS: Record<string, { title: string; text: string }> = {
  paid: { title: 'Payment received', text: 'Thank you. The bill is marked paid and a receipt is in your notifications.' },
  cancelled: { title: 'Payment cancelled', text: 'Nothing was charged. You can pay again whenever you are ready.' },
  failed: { title: 'Payment did not go through', text: 'Nothing was charged. Please try again, or use a different method.' },
  unverified: {
    title: 'We are confirming your payment',
    text: 'The gateway has not confirmed it yet. If money left your account, the bill updates within a few minutes. If it does not, contact the hall office with your transaction details.',
  },
};

export default async function PaymentResultPage({ searchParams }: PageProps<'/payments/result'>) {
  const { status } = await searchParams;
  const result = RESULTS[typeof status === 'string' ? status : ''] ?? RESULTS.unverified;
  return (
    <section className="section status-page">
      <div className="container">
        <article className="status-card rise">
          <span className={`status-seal ${status === 'paid' ? 'seal-ok' : ''}`} aria-hidden="true" />
          <span className="kicker">Payment</span>
          <h1>{result.title}</h1>
          <p className="lead">{result.text}</p>
          <Link href="/dashboard/bills" className="btn">
            Back to my bills
          </Link>
        </article>
      </div>
    </section>
  );
}
