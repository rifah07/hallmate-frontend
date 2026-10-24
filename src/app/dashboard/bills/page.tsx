'use client';

import { useState } from 'react';
import { Empty, Loading } from '@/components/Loading';
import { Status } from '@/components/Status';
import { isGatewayUrl, type Bill } from '@/lib/billing';
import { api } from '@/lib/client-api';
import { formatDate, formatTaka } from '@/lib/format';
import { usePages } from '@/lib/use-pages';

export default function BillsPage() {
  const { items, error, hasMore, more } = usePages<Bill>('/billing/my-bills');
  const [paying, setPaying] = useState('');
  const [payError, setPayError] = useState('');

  async function pay(id: string) {
    setPaying(id);
    setPayError('');
    try {
      const { redirectUrl } = await api<{ redirectUrl: string }>(`/billing/bills/${id}/pay`, { method: 'POST' });
      if (!isGatewayUrl(redirectUrl)) throw new Error('Payment could not be started. Please try again.');
      window.location.assign(redirectUrl);
    } catch (e) {
      setPayError((e as Error).message);
      setPaying('');
    }
  }

  const unpaid = items?.filter((b) => b.status === 'UNPAID') ?? [];

  return (
    <>
      <header className="dash-head">
        <span className="kicker">Payments</span>
        <h1>Bills</h1>
        <p className="muted">Pay online with bKash, Nagad, Rocket or a card through SSLCommerz. Cash and bank payments are recorded by the hall office.</p>
      </header>
      {unpaid.length > 0 && (
        <p className="callout">
          <b>{formatTaka(unpaid.reduce((sum, b) => sum + b.amount, 0))}</b> due across {unpaid.length} bill(s).
        </p>
      )}
      <p className="error" role="alert">
        {payError}
      </p>
      {!items ? (
        <Loading error={error} />
      ) : items.length === 0 ? (
        <Empty title="No bills yet">Your seat renewal and any other bills will appear here.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bill</th>
                <th>Amount</th>
                <th>Due</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id}>
                  <td>{b.title}</td>
                  <td className="num">{formatTaka(b.amount)}</td>
                  <td>{formatDate(b.dueDate)}</td>
                  <td>
                    <Status value={b.isOverdue ? 'OVERDUE' : b.status} />
                    {b.paidAt && <span className="muted small"> {formatDate(b.paidAt)}</span>}
                  </td>
                  <td>
                    {b.status === 'UNPAID' && (
                      <button type="button" className="btn btn-small" disabled={!!paying} onClick={() => pay(b.id)}>
                        {paying === b.id ? 'Opening…' : 'Pay now'}
                      </button>
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
    </>
  );
}
