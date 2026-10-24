'use client';

import { api } from '@/lib/client-api';
import { Form } from './Form';

export function ContactForm() {
  return (
    <Form
      submitLabel="Send message"
      fields={[
        { name: 'name', label: 'Your name', autoComplete: 'name', minLength: 2, maxLength: 100 },
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', maxLength: 255 },
        {
          name: 'phone',
          label: 'Phone (optional)',
          type: 'tel',
          autoComplete: 'tel',
          required: false,
          pattern: '(\\+880|0)[1-9]\\d{8,9}',
          hint: 'A Bangladeshi number, like 01712345678.',
        },
        { name: 'subject', label: 'Subject', minLength: 5, maxLength: 200 },
        { name: 'message', label: 'Message', multiline: true, minLength: 20, maxLength: 2000 },
      ]}
      onSubmit={async ({ phone, ...values }) => {
        await api('/public/contact', { method: 'POST', json: phone ? { ...values, phone } : values });
        return 'Thank you. Your message has reached the hall office, and they will reply by email.';
      }}
    />
  );
}
