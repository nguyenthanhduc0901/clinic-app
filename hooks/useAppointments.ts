import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listMyAppointments,
  createMyAppointment,
  ListAppointmentsParams,
  ListAppointmentsResult,
} from '../lib/appointments.client';
import { QK } from '../constants/queryKeys';

export function useListMyAppointments(filters: ListAppointmentsParams) {
  const query = useQuery<ListAppointmentsResult, any>({
    queryKey: QK.appointments.list(filters),
    queryFn: () => listMyAppointments(filters),
    keepPreviousData: true,
  });

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateMyAppointment(currentFilters: ListAppointmentsParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMyAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.appointments.list(currentFilters) });
    },
  });
}


