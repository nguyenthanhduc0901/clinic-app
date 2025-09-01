import { 
  ListInvoicesParams, 
  ListInvoicesResult, 
  Invoice,
  InvoiceDetail 
} from '../types/invoices';
import api from './api';

/**
 * Invoices API client for patient's own invoices
 * All endpoints use /me/invoices for patient-specific access
 */

export async function listMyInvoices(params: ListInvoicesParams = {}): Promise<ListInvoicesResult> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.status) searchParams.append('status', params.status);
  if (params.date) searchParams.append('date', params.date);

  const queryString = searchParams.toString();  
  const url = `/me/invoices${queryString ? `?${queryString}` : ''}`;
  
  console.log('API: listMyInvoices - URL:', url);
  const response = await api.get<ListInvoicesResult>(url);
  return response.data;
}

export async function getMyInvoiceDetail(id: number): Promise<InvoiceDetail> {
  console.log('API: getMyInvoiceDetail - ID:', id);
  const response = await api.get<InvoiceDetail>(`/me/invoices/${id}`);
  return response.data;
}

export async function getMyInvoiceByMedicalRecord(recordId: number): Promise<Invoice> {
  console.log('API: getMyInvoiceByMedicalRecord - recordId:', recordId);
  const response = await api.get<Invoice>(`/me/invoices/by-medical-record/${recordId}`);
  return response.data;
}

export function getInvoicePDFUrl(id: number): string {
  // Return the full URL for PDF export that can be opened in browser
  const baseUrl = api.defaults.baseURL;
  return `${baseUrl}/me/invoices/${id}/export.pdf`;
}

export async function exportMyInvoicePDF(id: number): Promise<ArrayBuffer> {
  console.log('API: exportMyInvoicePDF called with id:', id);
  console.log('API: Making request to:', `/me/invoices/${id}/export.pdf`);
  
  try {
    const response = await api.get(`/me/invoices/${id}/export.pdf`, {
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
    console.error('API: exportMyInvoicePDF error:', error);
    
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



