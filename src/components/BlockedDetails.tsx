'use client';

import { useSyncExternalStore } from 'react';
import { formatDate } from '@/lib/format';
import { getLastBlocked } from '@/lib/session';

const noop = () => () => {};

// The reason and date only exist in this tab's memory (they came with the
// API's 403). After a reload the page still explains, just without them.
export function BlockedDetails() {
  const blocked = useSyncExternalStore(noop, getLastBlocked, () => null);
  const reason = blocked?.details?.reason;
  const date = blocked?.details?.cancelledAt;
  if (!reason && !date) return null;
  return (
    <dl className="facts-list">
      {date && (
        <div>
          <dt>Date</dt>
          <dd>{formatDate(date)}</dd>
        </div>
      )}
      {reason && (
        <div>
          <dt>Reason given</dt>
          <dd>{reason}</dd>
        </div>
      )}
    </dl>
  );
}
