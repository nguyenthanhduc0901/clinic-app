import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listMyAppointments,
  createMyAppointment,
  getMyAppointment,
  rescheduleMyAppointment,
  cancelMyAppointment,
  ListAppointmentsParams,
  ListAppointmentsResult,
} from '../lib/appointments.client';
import { QK } from '../constants/queryKeys';
import { getMe } from '../lib/api';

export function useListMyAppointments(filters: ListAppointmentsParams) {
  const query = useQuery<ListAppointmentsResult, any>({
    queryKey: QK.appointments.list(filters),
    queryFn: () => listMyAppointments(filters),
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

export function useCreateMyAppointment(currentFilters: ListAppointmentsParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMyAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.appointments.list(currentFilters) });
      // Also refresh /me since patient-related aggregates may change
      qc.invalidateQueries({ queryKey: QK.me });
    },
  });
}

export function useMe() {
  return useQuery({ queryKey: QK.me, queryFn: getMe, staleTime: 30_000 });
}

export function useMyAppointmentDetail(id?: number | string) {
  return useQuery({
    queryKey: id ? QK.appointments.detail(id) : ['appointments','detail','nil'],
    queryFn: () => getMyAppointment(id as any),
    enabled: !!id,
  });
}

export function useRescheduleMyAppointment(id: number | string, listFilters: ListAppointmentsParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { appointmentDate: string }) => rescheduleMyAppointment(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.appointments.detail(id) });
      qc.invalidateQueries({ queryKey: QK.appointments.list(listFilters) });
    },
  });
}

export function useCancelMyAppointment(id: number | string, listFilters: ListAppointmentsParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cancelMyAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.appointments.detail(id) });
      qc.invalidateQueries({ queryKey: QK.appointments.list(listFilters) });
    },
  });
}


