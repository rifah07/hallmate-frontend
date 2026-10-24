import type { Field } from '@/components/Form';
import { dhakaToday } from './format';

export type Application = {
  id: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  data: Record<string, unknown>;
  responseNote: string | null;
  respondedAt: string | null;
  createdAt: string;
  assignedTo: string | null;
  student?: { id?: string; name: string; universityId?: string; department?: string | null };
};

export type ApplicationList = { applications: Application[]; pagination: { page: number; totalPages: number; total: number } };

const PRIORITY: Field = {
  name: 'priority',
  label: 'How urgent is it?',
  defaultValue: 'NORMAL',
  options: [
    ['NORMAL', 'Normal'],
    ['URGENT', 'Urgent'],
    ['EMERGENCY', 'Emergency'],
    ['LOW', 'Low'],
  ],
};
const phone = { type: 'tel', pattern: '01\\d{9}', inputMode: 'numeric', hint: '11 digits, like 01712345678.' } as const;

// The requests a resident files herself.
export const REQUEST_TYPES: Record<string, { label: string; blurb: string; fields: Field[] }> = {
  COMPLAINT: {
    label: 'Complaint',
    blurb: 'Food, cleanliness, noise, safety. Harassment complaints go only to the provost and your house tutor.',
    fields: [
      {
        name: 'category',
        label: 'About',
        options: [
          ['CLEANLINESS', 'Cleanliness'],
          ['MESS_FOOD', 'Dining and food'],
          ['NOISE', 'Noise'],
          ['ELECTRICAL', 'Electrical'],
          ['PLUMBING', 'Plumbing'],
          ['FURNITURE', 'Furniture'],
          ['SECURITY', 'Security'],
          ['HARASSMENT', 'Harassment'],
          ['OTHER', 'Something else'],
        ],
      },
      PRIORITY,
      { name: 'title', label: 'In a few words', minLength: 5, maxLength: 120 },
      { name: 'description', label: 'What happened', multiline: true, minLength: 20, maxLength: 2000 },
      { name: 'location', label: 'Where (optional)', required: false, maxLength: 120 },
    ],
  },
  MAINTENANCE: {
    label: 'Repair',
    blurb: 'Something broken in your room or on your floor.',
    fields: [
      {
        name: 'category',
        label: 'What needs fixing',
        options: [
          ['Electrical', 'Lights, fans, sockets'],
          ['Plumbing', 'Taps, toilets, water'],
          ['Furniture', 'Bed, table, cupboard'],
          ['Doors and windows', 'Doors, locks, windows'],
          ['Other', 'Something else'],
        ],
      },
      PRIORITY,
      { name: 'location', label: 'Where', minLength: 3, maxLength: 120, placeholder: 'Room 1204, bathroom' },
      { name: 'description', label: 'Describe the problem', multiline: true, minLength: 20, maxLength: 2000 },
      { name: 'preferredDate', label: 'Best day for the visit (optional)', type: 'date', required: false, min: dhakaToday() },
    ],
  },
  LEAVE: {
    label: 'Leave',
    blurb: 'Going home or staying out overnight.',
    fields: [
      {
        name: 'leaveType',
        label: 'Kind of leave',
        options: [
          ['OVERNIGHT', 'Overnight'],
          ['SHORT_LEAVE', 'A few days'],
          ['LONG_LEAVE', 'Long leave'],
          ['MEDICAL', 'Medical'],
          ['EMERGENCY', 'Emergency'],
        ],
      },
      { name: 'startDate', label: 'From', type: 'date', min: dhakaToday() },
      { name: 'endDate', label: 'Until', type: 'date', min: dhakaToday() },
      { name: 'destination', label: 'Where you will stay', minLength: 3, maxLength: 200 },
      { name: 'reason', label: 'Reason', multiline: true, minLength: 10, maxLength: 1000 },
      { name: 'contactName', label: 'Emergency contact name', minLength: 2, maxLength: 100 },
      { name: 'contactRelation', label: 'Relation', minLength: 2, maxLength: 50, placeholder: 'Mother' },
      { name: 'contactPhone', label: 'Emergency contact phone', ...phone },
    ],
  },
  SEAT_TRANSFER: {
    label: 'Change room',
    blurb: 'Ask for a different room. The provost picks a free bed of the kind you ask for.',
    fields: [
      {
        name: 'targetRoomType',
        label: 'Kind of room',
        options: [
          ['SINGLE', 'Single'],
          ['DOUBLE', 'Double'],
          ['TRIPLE', 'Triple'],
          ['FOUR_SHARING', 'Four sharing'],
        ],
      },
      { name: 'reason', label: 'Reason', multiline: true, minLength: 10, maxLength: 1000 },
    ],
  },
  SEAT_SWAP: {
    label: 'Swap beds',
    blurb: 'Trade beds with a friend. She agrees from her own account first, then the provost decides.',
    fields: [
      {
        name: 'targetUniversityId',
        label: "Her university ID",
        inputMode: 'numeric',
        pattern: '\\d{10}',
        maxLength: 10,
      },
      { name: 'reason', label: 'Reason', multiline: true, minLength: 10, maxLength: 1000 },
    ],
  },
  SEAT_CANCELLATION: {
    label: 'Give up my seat',
    blurb: 'Leaving the hall for good. The provost reviews it first.',
    fields: [
      { name: 'effectiveDate', label: 'Leaving on', type: 'date', min: dhakaToday() },
      { name: 'reason', label: 'Reason', multiline: true, minLength: 10, maxLength: 1000 },
      { name: 'forwardingAddress', label: 'Forwarding address (optional)', required: false, maxLength: 300 },
    ],
  },
};
