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
  id: string;
  name: string;
  designation: string;
  department: string;
  floor: number | null;
  email: string | null;
  photoUrl: string | null;
  bio: string | null;
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
  id: string;
  title: string;
  imageUrl: string;
  category: string;
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
