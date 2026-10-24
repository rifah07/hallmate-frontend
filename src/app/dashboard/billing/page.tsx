'use client';

import { useState } from 'react';
import { Form } from '@/components/Form';
import { Empty, Loading } from '@/components/Loading';
import { Status } from '@/components/Status';
import type { Bill } from '@/lib/billing';
import { api } from '@/lib/client-api';
import { dhakaToday, formatDate, formatTaka } from '@/lib/format';
import type { Profile } from '@/lib/types';
import { usePages } from '@/lib/use-pages';

const year = new Date().getFullYear();

export default function BillingPage() {
  const [status, setStatus] = useState('UNPAID');
  const [paying, setPaying] = useState<Bill | null>(null);
  const { items, error, hasMore, more, reload } = usePages<Bill>(`/billing/bills?status=${status}`);

  return (
    <>
      <header className="dash-head">
        <span className="kicker">Hall accounts</span>
        <h1>Billing</h1>
      </header>

      <div className="grid">
        <details className="panel">
          <summary>Issue seat renewals</summary>
          <p className="muted small">One bill for every resident who holds a bed. Running it twice for the same year does nothing the second time.</p>
          <Form
            submitLabel="Issue renewal bills"
            fields={[
              { name: 'year', label: 'Year', type: 'number', min: 2024, max: 2100, defaultValue: year },
              { name: 'amount', label: 'Amount (taka)', type: 'number', min: 1, step: 1 },
              { name: 'dueDate', label: 'Due date', type: 'date', min: dhakaToday() },
            ]}
            onSubmit={async ({ year, amount, dueDate }) => {
              if (!confirm(`Bill every resident ${formatTaka(Number(amount))} for ${year}?`)) return;
              const r = await api<{ created: number; skipped: number }>('/billing/renewals', {
                method: 'POST',
                json: { year: Number(year), amount: Number(amount), dueDate },
              });
              reload();
              return `${r.created} bill(s) issued${r.skipped ? `, ${r.skipped} already had one` : ''}.`;
            }}
          />
        </details>

        <details className="panel">
          <summary>Add a fine or other bill</summary>
          <Form
            submitLabel="Issue bill"
            fields={[
              { name: 'universityId', label: "Resident's university ID", inputMode: 'numeric', pattern: '\\d{10}', maxLength: 10 },
              { name: 'type', label: 'Kind', options: [['FINE', 'Fine'], ['OTHER', 'Other']] },
              { name: 'title', label: 'Title', minLength: 3, maxLength: 120, placeholder: 'Lost room key' },
              { name: 'period', label: 'Reference', minLength: 4, maxLength: 20, placeholder: `${year}-key-1`, hint: 'Short and unique for this resident, so the same bill is never issued twice.' },
              { name: 'amount', label: 'Amount (taka)', type: 'number', min: 1, step: 1 },
              { name: 'dueDate', label: 'Due date', type: 'date', min: dhakaToday() },
            ]}
            onSubmit={async ({ universityId, amount, ...rest }) => {
              const student = await api<Profile>(`/users/university/${universityId}`);
              await api('/billing/bills', { method: 'POST', json: { ...rest, studentId: student.id, amount: Number(amount) } });
              reload();
            }}
          />
        </details>
      </div>

      <section className="dash-section">
        <div className="filters">
          <label>
            Show
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="UNPAID">Unpaid</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
        </div>

        {paying && (
          <div className="panel" role="dialog" aria-label="Record a payment">
            <h3>
              Record payment: {paying.title} · {formatTaka(paying.amount)}
            </h3>
            <p className="muted small">{paying.student?.name} paid at the office or by bank. The resident gets a receipt.</p>
            <Form
              submitLabel="Mark as paid"
              fields={[
                { name: 'gateway', label: 'Paid by', options: [['CASH', 'Cash'], ['BANK_TRANSFER', 'Bank transfer']] },
                { name: 'reference', label: 'Receipt or bank slip number', minLength: 3, maxLength: 100 },
              ]}
              onSubmit={async (values) => {
                await api(`/billing/bills/${paying.id}/record-payment`, { method: 'POST', json: values });
                setPaying(null);
                reload();
              }}
            />
            <button type="button" className="btn btn-quiet btn-small" onClick={() => setPaying(null)}>
              Close
            </button>
          </div>
        )}

        {!items ? (
          <Loading error={error} />
        ) : items.length === 0 ? (
          <Empty title="No bills here" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Bill</th>
                  <th>Amount</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id}>
                    <td>
                      {b.student?.name}
                      <span className="muted small"> {b.student?.universityId}</span>
                    </td>
                    <td>{b.title}</td>
                    <td className="num">{formatTaka(b.amount)}</td>
                    <td>{formatDate(b.dueDate)}</td>
                    <td>
                      <Status value={b.isOverdue ? 'OVERDUE' : b.status} />
                    </td>
                    <td>
                      {b.status === 'UNPAID' && (
                        <div className="row" style={{ flexWrap: 'nowrap' }}>
                          <button type="button" className="btn btn-small" onClick={() => setPaying(b)}>
                            Record payment
                          </button>
                          <button
                            type="button"
                            className="btn btn-quiet btn-small"
                            onClick={async () => {
                              if (!confirm(`Cancel "${b.title}" for ${b.student?.name}?`)) return;
                              await api(`/billing/bills/${b.id}/cancel`, { method: 'POST' }).catch((e: Error) => alert(e.message));
                              reload();
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasMore && (
          <button type="button" className="btn btn-quiet load-more" onClick={more}>
            Load more
          </button>
        )}
      </section>
    </>
  );
}
