export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface Invoice {
  id: number;
  medicalRecordId: number;
  examinationFee: string; // Decimal as string
  medicineFee: string; // Decimal as string
  totalFee: string; // Decimal as string
  paymentMethod?: string; // null if not paid yet
  status: InvoiceStatus;
  paymentDate?: string; // ISO date string, null if not paid
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: number;
  fullName: string;
  gender: string;
  birthYear: number;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: number;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: number;
  medicalRecordId: number;
  medicineId: number;
  quantity: number;
  usageInstructionId: number;
  notes?: string;
}

export interface InvoiceDetail {
  invoice: Invoice;
  patient: Patient;
  doctor: Doctor;
  prescriptions: Prescription[];
}

export interface ListInvoicesParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  date?: string; // YYYY-MM-DD format
}

export interface ListInvoicesResult {
  data: Invoice[];
  total: number;
}



