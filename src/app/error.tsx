'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Only the message and digest: never page content or user data
    void fetch('/api/client-error', {
      method: 'POST',
      body: `${location.pathname} ${error.digest ?? ''} ${error.message}`,
    }).catch(() => undefined);
  }, [error]);

  return (
    <section className="section status-page">
      <div className="container">
        <article className="status-card">
          <span className="status-seal" aria-hidden="true" />
          <span className="kicker">Something went wrong</span>
          <h1>This page couldn&apos;t load</h1>
          <p className="lead">It&apos;s been reported. Please try again in a moment.</p>
          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>
        </article>
      </div>
    </section>
  );
}
