// What a dashboard section shows before its data arrives, or if it fails.
export function Loading({ error }: { error?: string }) {
  if (error)
    return (
      <p className="error" role="alert">
        {error}
      </p>
    );
  return (
    <div className="skeleton" role="status" aria-label="Loading">
      <span />
      <span />
      <span />
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <span className="status-seal" aria-hidden="true" />
      <p>
        <b>{title}</b>
      </p>
      {children && <p className="muted">{children}</p>}
    </div>
  );
}
