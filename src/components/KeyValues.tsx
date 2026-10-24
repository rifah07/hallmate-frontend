// Label/value pairs in the .kv layout; pairs without a value are left out.
export function KeyValues({ items }: { items: [label: string, value: React.ReactNode][] }) {
  const shown = items.filter(([, value]) => value !== null && value !== undefined && value !== '');
  if (shown.length === 0) return null;
  return (
    <dl className="kv">
      {shown.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
