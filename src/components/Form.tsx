'use client';

import { useId, useState } from 'react';

export type Field = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  hint?: string;
  multiline?: boolean;
  options?: [value: string, label: string][];
};

// One form for every auth page and the contact page: each page supplies its
// fields and what to do on submit. Browser validation runs first (required,
// pattern...), the server's message second; aria-live announces it.
export function Form({
  fields,
  submitLabel,
  onSubmit,
}: {
  fields: Field[];
  submitLabel: string;
  // Return a message to replace the form with it; return nothing to clear the form for another entry
  onSubmit: (values: Record<string, string>, data: FormData) => Promise<string | void>;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [reveal, setReveal] = useState(false);
  const hasPassword = fields.some((f) => f.type === 'password');

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError('');
    try {
      const data = new FormData(form);
      const message = await onSubmit(Object.fromEntries(data) as Record<string, string>, data);
      if (message) setDone(message);
      else form.reset();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <p className="notice-ok" role="status">{done}</p>;

  return (
    <form className="form" onSubmit={handle}>
      {fields.map(({ label, hint, multiline, options, type, ...input }) => (
        <label key={input.name}>
          {label}
          {options ? (
            <select name={input.name} defaultValue={input.defaultValue as string | undefined} required={input.required ?? true}>
              {options.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          ) : multiline ? (
            <textarea
              name={input.name}
              defaultValue={input.defaultValue as string | undefined}
              required={input.required ?? true}
              minLength={input.minLength}
              maxLength={input.maxLength}
              rows={6}
              aria-describedby={hint ? `${id}-${input.name}` : undefined}
            />
          ) : (
            <input
              required
              {...input}
              type={type === 'password' && reveal ? 'text' : (type ?? 'text')}
              aria-describedby={hint ? `${id}-${input.name}` : undefined}
            />
          )}
          {hint && (
            <span className="hint" id={`${id}-${input.name}`}>
              {hint}
            </span>
          )}
        </label>
      ))}
      {hasPassword && (
        <label className="check">
          <input type="checkbox" checked={reveal} onChange={(e) => setReveal(e.target.checked)} />
          Show password
        </label>
      )}
      <p className="error" role="alert" aria-live="polite">
        {error}
      </p>
      <button type="submit" className="btn" disabled={busy}>
        {busy ? 'Please wait…' : submitLabel}
      </button>
    </form>
  );
}
