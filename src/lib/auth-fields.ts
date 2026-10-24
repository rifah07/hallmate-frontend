import type { Field } from '@/components/Form';

// The same rules the API enforces, so most mistakes are caught before a request.
export const universityIdField: Field = {
  name: 'universityId',
  label: 'University ID',
  inputMode: 'numeric',
  pattern: '\\d{10}',
  maxLength: 10,
  autoComplete: 'username',
  hint: 'The 10 digits on your university ID card.',
};

export const newPasswordFields = (name = 'newPassword'): Field[] => [
  {
    name,
    label: 'New password',
    type: 'password',
    autoComplete: 'new-password',
    minLength: 8,
    maxLength: 100,
    pattern: '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}',
    hint: 'At least 8 characters, with upper- and lowercase letters, a number and one of @ $ ! % * ? &',
  },
  { name: 'confirmPassword', label: 'Confirm new password', type: 'password', autoComplete: 'new-password' },
];

export function assertPasswordsMatch(values: Record<string, string>, name = 'newPassword') {
  if (values[name] !== values.confirmPassword) throw new Error('The two passwords do not match.');
}
