import api, { ApiError } from './api';
import { Appointment, AppointmentStatus } from '../types/appointments';

export const USE_ME_ENDPOINTS = false;

export class OwnEndpointMissingError extends Error {
  code = 'OWN_ENDPOINT_MISSING' as const;
  constructor(message = 'Own endpoint is missing') {
    super(message);
    this.name = 'OwnEndpointMissingError';
  }
}

export interface ListAppointmentsParams {
  date?: string;
  status?: AppointmentStatus;
  page?: number;
  limit?: number;
}

export interface ListAppointmentsResult {
  data: Appointment[];
  total: number;
}

const normalizeListResponse = (respData: any): ListAppointmentsResult => {
  const data: Appointment[] = respData?.data ?? respData?.items ?? respData ?? [];
  const total: number = respData?.total ?? (Array.isArray(data) ? data.length : 0);
  return { data, total };
};

export async function listMyAppointments(
  params: ListAppointmentsParams
): Promise<ListAppointmentsResult> {
  const { date, status, page = 1, limit = 10 } = params ?? {};
  const query = { date, status, page, limit };

  if (USE_ME_ENDPOINTS) {
    const res = await api.get('/me/appointments', { params: query });
    return normalizeListResponse(res.data);
  }

  try {
    const res = await api.get('/appointments', { params: query });
    return normalizeListResponse(res.data);
  } catch (err) {
    const e = err as ApiError;
    if (e?.statusCode === 403) {
      throw new OwnEndpointMissingError('Endpoint own chưa sẵn, chờ BE');
    }
    throw e;
  }
}

export interface CreateAppointmentBody {
  appointmentDate: string; // YYYY-MM-DD
  notes?: string;
}

export async function createMyAppointment(body: CreateAppointmentBody): Promise<Appointment> {
  if (USE_ME_ENDPOINTS) {
    const res = await api.post('/me/appointments', body);
    return res.data as Appointment;
  }

  try {
    const res = await api.post('/appointments', body);
    return res.data as Appointment;
  } catch (err) {
    const e = err as ApiError;
    if (e?.statusCode === 403) {
      throw new OwnEndpointMissingError('Endpoint own chưa sẵn, chờ BE');
    }
    throw e;
  }
}


