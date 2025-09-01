import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listMyInvoices, 
  getMyInvoiceDetail, 
  getMyInvoiceByMedicalRecord,
  exportMyInvoicePDF 
} from '../lib/invoices.client';
import { 
  ListInvoicesParams, 
  ListInvoicesResult, 
  Invoice,
  InvoiceDetail 
} from '../types/invoices';
import { QK } from '../constants/queryKeys';

export function useListMyInvoices(params: ListInvoicesParams = {}) {
  const query = useQuery<ListInvoicesResult, any>({
    queryKey: QK.invoices.list(params),
    queryFn: () => listMyInvoices(params),
    staleTime: 5_000,
  });

  return {
    data: (query.data as any)?.data ?? [],
    total: (query.data as any)?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMyInvoiceDetail(id: number) {
  return useQuery<InvoiceDetail, any>({
    queryKey: QK.invoices.detail(id),
    queryFn: () => getMyInvoiceDetail(id),
    enabled: !!id,
    staleTime: 5_000,
  });
}

export function useMyInvoiceByMedicalRecord(recordId: number) {
  return useQuery<Invoice, any>({
    queryKey: QK.invoices.byMedicalRecord(recordId),
    queryFn: () => getMyInvoiceByMedicalRecord(recordId),
    enabled: !!recordId,
    staleTime: 5_000,
  });
}

export function useExportInvoicePDF() {
  return useMutation({
    mutationFn: (id: number) => exportMyInvoicePDF(id),
    onError: (error) => {
      console.error('Export Invoice PDF error:', error);
    },
  });
}



