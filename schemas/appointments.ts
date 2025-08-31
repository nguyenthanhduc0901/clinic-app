import { z } from 'zod';

export const CreateAppointmentSchema = z.object({
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày dạng YYYY-MM-DD'),
  notes: z.string().max(500, 'Tối đa 500 ký tự').optional(),
});

export const ListAppointmentsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z
    .enum(['waiting', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled'])
    .optional(),
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
});


