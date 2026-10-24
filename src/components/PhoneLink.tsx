// A real number is tappable; a placeholder like 017XXXXXXXX is just text.
export function PhoneLink({ phone }: { phone: string }) {
  const digits = phone.replace(/[\s-]/g, '');
  return /^\+?\d+$/.test(digits) ? <a href={`tel:${digits}`}>{phone}</a> : <span>{phone}</span>;
}
