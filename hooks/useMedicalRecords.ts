import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  listMyMedicalRecords, 
  getMyMedicalRecordDetail, 
  getMyMedicalRecordAttachments,
  downloadMedicalRecordAttachment,
  exportMyMedicalRecordPDF 
} from '../lib/medicalRecords.client';
import { 
  ListMedicalRecordsParams, 
  ListMedicalRecordsResult, 
  MedicalRecordDetail, 
  ListAttachmentsResult 
} from '../types/medicalRecords';
import { QK } from '../constants/queryKeys';

export function useListMyMedicalRecords(params: ListMedicalRecordsParams = {}) {
  const query = useQuery<ListMedicalRecordsResult, any>({
    queryKey: QK.medicalRecords.list(params),
    queryFn: () => listMyMedicalRecords(params),
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

export function useMyMedicalRecordDetail(id: number) {
  return useQuery<MedicalRecordDetail, any>({
    queryKey: QK.medicalRecords.detail(id),
    queryFn: () => getMyMedicalRecordDetail(id),
    enabled: !!id,
    staleTime: 5_000,
  });
}

export function useMyMedicalRecordAttachments(recordId: number) {
  return useQuery<ListAttachmentsResult, any>({
    queryKey: QK.medicalRecords.attachments(recordId),
    queryFn: () => getMyMedicalRecordAttachments(recordId),
    enabled: !!recordId,
    staleTime: 5_000,
  });
}

export function useDownloadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, attachmentId }: { recordId: number; attachmentId: number }) =>
      downloadMedicalRecordAttachment(recordId, attachmentId),
    onSuccess: () => {
      // Could invalidate attachment queries if needed
    },
    onError: (error) => {
      console.error('Download attachment error:', error);
    },
  });
}

export function useExportMedicalRecordPDF() {
  return useMutation({
    mutationFn: (id: number) => exportMyMedicalRecordPDF(id),
    onError: (error) => {
      console.error('Export PDF error:', error);
    },
  });
}



