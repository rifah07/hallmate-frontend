'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/client-api';
import { Form } from './Form';

const phone = { type: 'tel', pattern: '(\\+880|0)[1-9]\\d{8,9}', hint: 'A Bangladeshi number, like 01712345678.' } as const;

export function ApplyForm() {
  const [trackingId, setTrackingId] = useState('');

  if (trackingId)
    return (
      <div className="stack" role="status">
        <h2>Application received</h2>
        <p>Keep this tracking ID. You will need it to check your application.</p>
        <p className="code">{trackingId}</p>
        <Link href={`/track?id=${trackingId}`} className="btn">
          Track it now
        </Link>
      </div>
    );

  return (
    <Form
      submitLabel="Send application"
      fields={[
        {
          name: 'type',
          label: 'What is it about?',
          options: [
            ['SEAT_REQUEST', 'A seat in the hall'],
            ['ADMISSION_QUERY', 'A question about admission'],
            ['INFORMATION_REQUEST', 'Information about the hall'],
            ['GENERAL_INQUIRY', 'Something else'],
          ],
        },
        { name: 'applicantName', label: 'Your name', autoComplete: 'name', minLength: 2, maxLength: 100 },
        { name: 'applicantEmail', label: 'Email', type: 'email', autoComplete: 'email', maxLength: 255 },
        { name: 'applicantPhone', label: 'Phone', autoComplete: 'tel', ...phone },
        { name: 'studentId', label: 'University ID (if you have one)', required: false, maxLength: 20, inputMode: 'numeric' },
        { name: 'department', label: 'Department (optional)', required: false, maxLength: 100 },
        { name: 'subject', label: 'Subject', minLength: 5, maxLength: 200 },
        { name: 'message', label: 'Your message', multiline: true, minLength: 20, maxLength: 3000 },
      ]}
      onSubmit={async (values) => {
        // Optional fields the applicant left empty are not sent at all
        const body = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ''));
        const { id } = await api<{ id: string }>('/public/applications', { method: 'POST', json: body });
        setTrackingId(id);
      }}
    />
  );
}
