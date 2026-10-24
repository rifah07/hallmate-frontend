// Flat form values → the { type, data } body the API validates.
export function toRequestBody(type: string, values: Record<string, string>) {
  const data = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ''));
  if (type === 'LEAVE') {
    const { contactName, contactRelation, contactPhone, ...rest } = data;
    if (rest.endDate <= rest.startDate) throw new Error('The leave must end after the day it starts.');
    return { type, data: { ...rest, emergencyContact: { name: contactName, relation: contactRelation, phone: contactPhone } } };
  }
  return { type, data };
}

// The parts of `data` worth showing a reviewer, as label/value pairs.
export const describe = (data: Record<string, unknown>) =>
  Object.entries(data)
    .filter(([key, value]) => value !== null && value !== '' && !key.endsWith('Id'))
    .map(([key, value]) => [
      key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
      typeof value === 'object' ? Object.values(value as object).join(', ') : String(value),
    ]);
