import { 
  ListMedicalRecordsParams, 
  ListMedicalRecordsResult, 
  MedicalRecordDetail, 
  ListAttachmentsResult 
} from '../types/medicalRecords';
import api from './api';

/**
 * Medical Records API client for patient's own records
 * All endpoints use /me/medical-records for patient-specific access
 */

export async function listMyMedicalRecords(params: ListMedicalRecordsParams = {}): Promise<ListMedicalRecordsResult> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.status) searchParams.append('status', params.status);
  if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) searchParams.append('dateTo', params.dateTo);

  const queryString = searchParams.toString();
  const url = `/me/medical-records${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get<ListMedicalRecordsResult>(url);
  return response.data;
}

export async function getMyMedicalRecordDetail(id: number): Promise<MedicalRecordDetail> {
  const response = await api.get<MedicalRecordDetail>(`/me/medical-records/${id}`);
  return response.data;
}

export async function getMyMedicalRecordAttachments(id: number): Promise<ListAttachmentsResult> {
  const response = await api.get<ListAttachmentsResult>(`/me/medical-records/${id}/attachments`);
  return response.data;
}

export async function downloadMedicalRecordAttachment(recordId: number, attachmentId: number): Promise<ArrayBuffer> {
  // Use the original endpoint with proper JWT authorization
  const response = await api.get(`/medical-records/${recordId}/attachments/${attachmentId}/download`, {
    responseType: 'arraybuffer',
  });
  return response.data;
}

export function getMedicalRecordPDFUrl(id: number): string {
  // Return the full URL for PDF export that can be opened in browser
  const baseUrl = api.defaults.baseURL;
  return `${baseUrl}/me/medical-records/${id}/export.pdf`;
}

export async function exportMyMedicalRecordPDF(id: number): Promise<ArrayBuffer> {
  console.log('API: exportMyMedicalRecordPDF called with id:', id);
  console.log('API: Making request to:', `/me/medical-records/${id}/export.pdf`);
  
  try {
    const response = await api.get(`/me/medical-records/${id}/export.pdf`, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/pdf',
      },
      timeout: 30000, // 30 seconds for PDF generation
    });
    
    console.log('API: Response status:', response.status);
    console.log('API: Response headers Content-Type:', response.headers['content-type']);
    console.log('API: Response headers Content-Disposition:', response.headers['content-disposition']);
    console.log('API: Response data type:', typeof response.data);
    console.log('API: Response data constructor:', response.data?.constructor?.name);
    console.log('API: Response data size:', response.data?.byteLength || 'unknown');
    
    // Validate that we received a PDF
    if (response.headers['content-type'] && !response.headers['content-type'].includes('application/pdf')) {
      console.warn('API: Warning - Response Content-Type is not PDF:', response.headers['content-type']);
    }
    
    // Ensure we have valid ArrayBuffer
    if (!response.data || response.data.byteLength === 0) {
      throw new Error('Received empty or invalid PDF data');
    }
    
    return response.data;
  } catch (error) {
    console.error('API: exportMyMedicalRecordPDF error:', error);
    
    // Log more details about the error
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('API: Error response status:', axiosError.response?.status);
      console.error('API: Error response headers:', axiosError.response?.headers);
      console.error('API: Error response data:', axiosError.response?.data);
    }
    
    throw error;
  }
}
