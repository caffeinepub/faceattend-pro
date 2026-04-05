import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceRecord,
  Employee,
  Holiday,
  SalaryPayment,
} from "../backend.d";
import { useActor } from "./useActor";

type AnyActor = any;

// Safely unwrap a Motoko optional: [] | [T] or already T | null
function unwrapOpt<T>(result: unknown): T | null {
  if (result === null || result === undefined) return null;
  if (Array.isArray(result)) return result.length > 0 ? (result[0] as T) : null;
  return result as T;
}

export function useEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as AnyActor).getEmployees();
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Employee | null>({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      if (!actor || !employeeId) return null;
      const result = await (actor as AnyActor).getEmployee(employeeId);
      return unwrapOpt<Employee>(result);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAttendanceByEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", employeeId],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      const result = await (actor as AnyActor).getAttendanceByEmployee(
        employeeId,
      );
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAttendanceByMonth(year: string, month: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance-month", year, month],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as AnyActor).getAttendanceByMonth(
        year,
        month,
      );
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHolidays() {
  const { actor, isFetching } = useActor();
  return useQuery<Holiday[]>({
    queryKey: ["holidays"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as AnyActor).getHolidays();
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePaymentsByEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SalaryPayment[]>({
    queryKey: ["payments", employeeId],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      const result = await (actor as AnyActor).getPaymentsByEmployee(
        employeeId,
      );
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<SalaryPayment[]>({
    queryKey: ["payments-all"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as AnyActor).getAllPayments();
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emp: {
      id: string;
      name: string;
      department: string;
      phone: string;
      monthlySalary: number;
      joinDate: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as AnyActor).registerEmployee(
        emp.id,
        emp.name,
        emp.department,
        emp.phone,
        BigInt(Math.round(emp.monthlySalary)),
        emp.joinDate,
        true,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emp: {
      id: string;
      name: string;
      department: string;
      phone: string;
      monthlySalary: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as AnyActor).updateEmployee(
        emp.id,
        emp.name,
        emp.department,
        emp.phone,
        BigInt(Math.round(emp.monthlySalary)),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (employeeId: string) => {
      if (!actor) throw new Error("No actor");
      return (actor as AnyActor).deleteEmployee(employeeId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["attendance-month"] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["payments-all"] });
    },
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rec: {
      employeeId: string;
      date: string;
      status: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const id = crypto.randomUUID();
      return (actor as AnyActor).markAttendance(
        id,
        rec.employeeId,
        rec.date,
        rec.status,
        BigInt(Date.now()),
      );
    },
    onSuccess: (_data: any, vars: any) => {
      const [year, month] = vars.date.split("-");
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["attendance-month", year, month] });
    },
  });
}

export function useRemoveAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rec: { employeeId: string; date: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as AnyActor).removeAttendance(rec.employeeId, rec.date);
    },
    onSuccess: (_data: any, vars: any) => {
      const [year, month] = vars.date.split("-");
      qc.invalidateQueries({ queryKey: ["attendance"] });
      qc.invalidateQueries({ queryKey: ["attendance-month", year, month] });
    },
  });
}

export function useAddHoliday() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, reason }: { date: string; reason: string }) => {
      if (!actor) throw new Error("No actor");
      const id = crypto.randomUUID();
      return (actor as AnyActor).addHoliday(
        id,
        date,
        reason,
        BigInt(Date.now()),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["holidays"] }),
  });
}

export function useRemoveHoliday() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (holidayId: string) => {
      if (!actor) throw new Error("No actor");
      return (actor as AnyActor).removeHoliday(holidayId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["holidays"] }),
  });
}

export function useRecordPayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      amount,
      note,
    }: { employeeId: string; amount: number; note: string }) => {
      if (!actor) throw new Error("No actor");
      const id = crypto.randomUUID();
      return (actor as AnyActor).recordPayment(
        id,
        employeeId,
        BigInt(Math.round(amount)),
        note,
        BigInt(Date.now()),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["payments-all"] });
    },
  });
}
