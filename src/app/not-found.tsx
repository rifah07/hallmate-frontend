import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section status-page">
      <div className="container">
        <article className="status-card rise">
          <span className="status-seal" aria-hidden="true" />
          <span className="kicker">Page not found</span>
          <h1>This door doesn&apos;t lead anywhere</h1>
          <p className="lead">The page may have moved, or the link has a typo.</p>
          <div className="row">
            <Link href="/" className="btn">
              Home
            </Link>
            <Link href="/notices" className="btn btn-quiet">
              Notice board
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
