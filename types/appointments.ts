export type AppointmentStatus =
  | 'waiting'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  id: number;
  patientId: number;
  staffId: number | null;
  appointmentDate: string; // YYYY-MM-DD
  orderNumber: number;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Enriched branches from /me endpoints
  patient?: { id: number; fullName: string; phone?: string } | null;
  staff?: { id: number; fullName: string } | null;
}


