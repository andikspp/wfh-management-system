import { request } from './client';
import type { Attendance, AttendanceQuery, Employee, EmployeeInput, ListQuery, Paginated, Profile, WorkSchedule, WorkScheduleInput } from './types';

export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: Profile }>('POST', '/auth/login', { body: { email, password } }),
  me: () => request<Profile>('GET', '/auth/me'),
  changePassword: (oldPassword: string, newPassword: string) =>
    request<{ success: boolean }>('PUT', '/auth/password', { body: { oldPassword, newPassword } }),
};

export const employeeApi = {
  list: (query: ListQuery) => request<Paginated<Employee>>('GET', '/employees', { query: { ...query } }),
  get: (id: number) => request<Employee>('GET', `/employees/${id}`),
  create: (input: EmployeeInput) => request<Employee>('POST', '/employees', { body: input }),
  update: (id: number, input: Partial<EmployeeInput>) => request<Employee>('PUT', `/employees/${id}`, { body: input }),
  remove: (id: number) => request<{ success: boolean }>('DELETE', `/employees/${id}`),
};

export const attendanceApi = {
  checkIn: (photo: File, notes?: string) => {
    const form = new FormData();
    form.append('photo', photo);
    if (notes) form.append('notes', notes);
    return request<Attendance>('POST', '/attendances/check-in', { body: form });
  },
  checkOut: () => request<Attendance>('POST', '/attendances/check-out'),
  schedule: () => request<WorkSchedule>('GET', '/attendances/schedule'),
  updateSchedule: (body: WorkScheduleInput) => request<WorkSchedule>('PUT', '/attendances/schedule', { body }),
  today: () => request<{ checkedIn: boolean; attendance: Attendance | null }>('GET', '/attendances/today'),
  mine: (query: AttendanceQuery) => request<Paginated<Attendance>>('GET', '/attendances/me', { query: { ...query } }),
  list: (query: AttendanceQuery) => request<Paginated<Attendance>>('GET', '/attendances', { query: { ...query } }),
};
