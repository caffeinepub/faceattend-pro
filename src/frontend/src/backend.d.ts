export interface Employee {
  id: string;
  name: string;
  department: string;
  phone: string;
  monthlySalary: bigint;
  joinDate: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: string; // 'present' | 'absent' | 'halfday'
  markedAt: bigint;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  createdAt: bigint;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  amount: bigint;
  note: string;
  paidAt: bigint;
}

export enum UserRole {
  admin = "admin",
  user = "user",
  guest = "guest"
}

export interface backendInterface {
  // Employee
  registerEmployee(id: string, name: string, department: string, phone: string, monthlySalary: bigint, joinDate: string, isActive: boolean): Promise<Employee>;
  updateEmployee(id: string, name: string, department: string, phone: string, monthlySalary: bigint): Promise<boolean>;
  deleteEmployee(id: string): Promise<boolean>;
  getEmployees(): Promise<Array<Employee>>;
  getEmployee(id: string): Promise<Employee | null>;
  // Attendance
  markAttendance(id: string, employeeId: string, date: string, status: string, markedAt: bigint): Promise<AttendanceRecord>;
  getAttendanceByEmployee(employeeId: string): Promise<Array<AttendanceRecord>>;
  getAttendanceByMonth(year: string, month: string): Promise<Array<AttendanceRecord>>;
  // Holidays
  addHoliday(id: string, date: string, reason: string, createdAt: bigint): Promise<Holiday>;
  getHolidays(): Promise<Array<Holiday>>;
  removeHoliday(id: string): Promise<boolean>;
  // Payments
  recordPayment(id: string, employeeId: string, amount: bigint, note: string, paidAt: bigint): Promise<SalaryPayment>;
  getPaymentsByEmployee(employeeId: string): Promise<Array<SalaryPayment>>;
  getAllPayments(): Promise<Array<SalaryPayment>>;
  // Auth
  assignCallerUserRole(user: import('@icp-sdk/core/principal').Principal, role: UserRole): Promise<void>;
  getCallerUserRole(): Promise<UserRole>;
  isCallerAdmin(): Promise<boolean>;
  _initializeAccessControlWithSecret(secret: string): Promise<void>;
}
