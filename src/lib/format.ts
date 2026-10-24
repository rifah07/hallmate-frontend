// Dates for people in Dhaka, formatted the same on the server and in the
// browser (a fixed time zone avoids hydration mismatches).
const day = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Dhaka',
});

export const formatDate = (iso: string | null | undefined) => (iso ? day.format(new Date(iso)) : '');

export const yearOf = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('en-GB', { year: 'numeric', timeZone: 'Asia/Dhaka' }) : '';

const dayTime = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Dhaka',
});
export const formatDateTime = (iso: string | null | undefined) => (iso ? dayTime.format(new Date(iso)) : '');

// Whole taka, grouped the Bangladeshi way: ৳1,25,000
export const formatTaka = (amount: number) => `৳${amount.toLocaleString('en-IN')}`;

// lang="bn" for Bangla text, so it gets its font and line height
export const langOf = (text: string) => (/[ঀ-৿]/.test(text) ? 'bn' : undefined);

// "Professor Dr. Anjue Mane Ara" → "A": skips a title in English or Bangla
export const initialOf = (name: string) => name.replace(/^(Professor |Prof\. |Dr\. |ড\. )+/, '').trim()[0];

// "SEAT_CANCELLATION" → "Seat cancellation"
export const humanize = (value: string) => value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');

// Today in Dhaka as yyyy-mm-dd, for <input type="date" min=...>
export const dhakaToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
