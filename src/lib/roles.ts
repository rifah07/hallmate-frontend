import type { Role } from './types';

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Administrator',
  PROVOST: 'Provost',
  HOUSE_TUTOR: 'House tutor',
  ASSISTANT_WARDEN: 'Assistant warden',
  OFFICE_STAFF: 'Hall staff',
  DINING_STAFF: 'Dining staff',
  MAINTENANCE_STAFF: 'Maintenance staff',
  GUARD: 'Security',
  STUDENT: 'Resident',
  PARENT: 'Guardian',
};
