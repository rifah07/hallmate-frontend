// Shapes returned by hallmate-backend's public API (see its Swagger at /api-docs).

export interface HallInfo {
  name: string;
  established: number;
  location: string;
  description: string;
  capacity: number;
  totalRooms: number;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  vision: string | null;
  mission: string | null;
}

export interface Provost {
  id: string;
  name: string;
  photoUrl: string | null;
  designation: string;
  department: string | null;
  tenureStart: string;
  tenureEnd: string | null;
  isCurrent: boolean;
  bio: string | null;
}

export interface HouseTutor {
  isSample?: boolean;
  id: string;
  name: string;
  designation: string;
  department: string;
  floor: number | null;
  email: string | null;
  photoUrl: string | null;
  bio: string | null;
  officeHours?: string | null;
}

export interface Staff {
  id: string;
  name: string;
  designation: string;
  category: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
}

export interface Facility {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  imageUrl: string | null;
}

export interface PublicNotice {
  isSample?: boolean;
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  category: string;
  pdfUrl: string | null;
  publishedAt: string | null;
}

export interface GalleryItem {
  isSample?: boolean;
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  year: number;
  isFeatured: boolean;
  isSample?: boolean;
}

export interface PublicEvent {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  venue: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string | null;
  isAllDay: boolean;
  isSample?: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  isSample?: boolean;
}

export interface DiningInfo {
  mealPlan: { meal: string; time: string; price: number }[];
  weeklyMenu: { day: string; lunch: string; dinner: string }[] | null;
  specialDiets: string[];
  capacity: number | null;
  location: string | null;
  notice: string | null;
  isSample?: boolean;
}

export interface AdmissionInfo {
  session: string;
  eligibility: string;
  process: string;
  requiredDocs: string[];
  importantDates: { label: string; date: string }[] | null;
  seatCapacity: number | null;
  applicationFee: number | null;
  contactEmail: string | null;
  isSample?: boolean;
}

export interface TrackedApplication {
  id: string;
  type: string;
  status: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  responseNote?: string | null;
}

// ── Signed-in user (GET /api/auth/profile) ──

export type Role =
  | 'SUPER_ADMIN'
  | 'PROVOST'
  | 'HOUSE_TUTOR'
  | 'ASSISTANT_WARDEN'
  | 'OFFICE_STAFF'
  | 'DINING_STAFF'
  | 'MAINTENANCE_STAFF'
  | 'GUARD'
  | 'STUDENT'
  | 'PARENT';

export interface Profile {
  id: string;
  universityId: string;
  role: Role;
  name: string;
  email: string;
  phone: string | null;
  photo: string | null;
  accountStatus: string;
  department: string | null;
  session: string | null;
  designation: string | null;
  assignedFloor: number | null;
  currentRoom: { id: string; roomNumber: string; floor: number; wing: string | null; roomType: string } | null;
}
