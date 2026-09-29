export type Role = 'ADMIN' | 'EMPLOYEE';

export interface Employee {
  id: number;
  nik: string;
  fullName: string;
  email: string;
  phone: string | null;
  position: string;
  department: string;
  joinDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  email: string;
  role: Role;
  employeeId: number | null;
  name: string;
  employee: Employee | null;
}

export interface Attendance {
  id: number;
  employeeId: number;
  employee?: Employee;
  attendanceDate: string;
  checkInAt: string;
  photoPath: string;
  notes: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeInput {
  nik: string;
  fullName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  joinDate: string;
  password?: string;
  isActive?: boolean;
}

export interface ListQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceQuery extends ListQuery {
  startDate?: string;
  endDate?: string;
  employeeId?: number;
}
