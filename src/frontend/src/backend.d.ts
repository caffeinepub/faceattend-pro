export interface Employee2 {
  id: string;
  name: string;
  department: string;
  phone: string;
  dailyRate: bigint;
  faceImageKey: string;
  createdAt: bigint;
}

export interface AttendanceRecord2 {
  id: string;
  employeeId: string;
  date: string;
  status: string; // 'present' | 'absent' | 'holiday'
  markedAt: bigint;
}

export interface Holiday2 {
  id: string;
  date: string;
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
  registerEmployee(id: string, name: string, department: string, phone: string, dailyRate: bigint, faceImageKey: string, createdAt: bigint): Promise<Employee2>;
  updateEmployeeFace(employeeId: string, faceImageKey: string): Promise<boolean>;
  getEmployees(): Promise<Array<Employee2>>;
  getEmployee(employeeId: string): Promise<Employee2 | null>;
  deleteEmployee(employeeId: string): Promise<boolean>;

  // Attendance
  markAttendance2(id: string, employeeId: string, date: string, status: string, markedAt: bigint): Promise<AttendanceRecord2>;
  getAttendanceByEmployee(employeeId: string): Promise<Array<AttendanceRecord2>>;
  getAttendanceByMonth(year: string, month: string): Promise<Array<AttendanceRecord2>>;

  // Holidays
  addHoliday2(id: string, date: string, reason: string, createdAt: bigint): Promise<Holiday2>;
  getHolidays(): Promise<Array<Holiday2>>;
  removeHoliday(holidayId: string): Promise<boolean>;

  // Payments
  recordPayment(id: string, employeeId: string, amount: bigint, note: string, paidAt: bigint): Promise<SalaryPayment>;
  getPaymentsByEmployee(employeeId: string): Promise<Array<SalaryPayment>>;
  getAllPayments(): Promise<Array<SalaryPayment>>;

  // Auth
  assignCallerUserRole(user: import('@icp-sdk/core/principal').Principal, role: UserRole): Promise<void>;
  getCallerUserRole(): Promise<UserRole>;
  isCallerAdmin(): Promise<boolean>;

  // Blob storage
  uploadBlob(key: string, data: Uint8Array, contentType: string): Promise<string>;
  getBlobUrl(key: string): Promise<string | null>;
}
