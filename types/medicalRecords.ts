export enum RecordStatus {
  PENDING = 'pending',
  COMPLETED = 'completed', 
  CANCELLED = 'cancelled'
}

export interface MedicalRecord {
  id: number;
  examinationDate: string; // ISO date string
  diagnosis: string;
  symptoms?: string;
  status: RecordStatus;
  diseaseTypeId?: number;
}

export interface Prescription {
  id: number;
  medicineId: number;
  quantity: number;
  usageInstructionId: number;
  notes?: string;
  // Enriched fields
  medicineName?: string;
  usageInstruction?: string;
  medicinePrice?: string;
}

export interface MedicalRecordDetail {
  medicalRecord: MedicalRecord;
  prescriptions: Prescription[];
}

export interface Attachment {
  id: number;
  fileName: string;
  fileType?: string;
  createdAt: string;
  description?: string;
}

export interface ListMedicalRecordsParams {
  page?: number;
  limit?: number;
  status?: RecordStatus;
  dateFrom?: string; // ISO date string YYYY-MM-DD
  dateTo?: string; // ISO date string YYYY-MM-DD
}

export interface ListMedicalRecordsResult {
  data: MedicalRecord[];
  total: number;
}

export interface ListAttachmentsResult {
  data: Attachment[];
}



