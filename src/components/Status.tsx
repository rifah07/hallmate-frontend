import { humanize } from '@/lib/format';

const TONE: Record<string, string> = {
  PENDING: 'chip-lavender',
  NOT_ACTIVATED: 'chip-lavender',
  SUSPENDED: 'chip-rose',
  SEAT_CANCELLED: 'chip-rose',
  ACTIVE: 'chip-sage',
  UNPAID: 'chip-blush',
  OVERDUE: 'chip-rose',
  URGENT: 'chip-rose',
  EMERGENCY: 'chip-rose',
  REJECTED: 'chip-rose',
  APPROVED: 'chip-sage',
  PAID: 'chip-sage',
  CHECKED_IN: 'chip-teal',
  CHECKED_OUT: 'chip-muted',
  CANCELLED: 'chip-muted',
};

export function Status({ value }: { value: string }) {
  return <span className={`chip ${TONE[value] ?? ''}`}>{humanize(value)}</span>;
}
