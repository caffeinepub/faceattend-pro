import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceRecord2,
  Employee2,
  Holiday2,
  SalaryPayment,
} from "../backend.d";
import { useActor } from "./useActor";

type AnyActor = any;

export function useEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee2[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as AnyActor).getEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Employee2 | null>({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      if (!actor || !employeeId) return null;
      const result = await (actor as AnyActor).getEmployee(employeeId);
      return result ?? null;
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAttendanceByEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord2[]>({
    queryKey: ["attendance", "employee", employeeId],
    queryFn: async () => {
      if (!actor || !employeeId) return [];
      return (actor as AnyActor).getAttendanceByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAttendanceByMonth(year: string, month: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord2[]>({
    queryKey: ["attendance", "month", year, month],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as AnyActor).getAttendanceByMonth(year, month);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHolidays() {
  const { actor, isFetching } = useActor();
  return useQuery<Holiday2[]>({
    queryKey: ["holidays"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as AnyActor).getHolidays();
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
      return (actor as AnyActor).getPaymentsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<SalaryPayment[]>({
    queryKey: ["payments", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as AnyActor).getAllPayments();
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
      dailyRate: number;
      faceImageKey: string;
      faceDescriptor?: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as AnyActor).registerEmployee(
        emp.id,
        emp.name,
        emp.department,
        emp.phone,
        BigInt(emp.dailyRate),
        emp.faceImageKey,
        emp.faceDescriptor ?? "",
        BigInt(Date.now()),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
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
      return (actor as AnyActor).markAttendance2(
        id,
        rec.employeeId,
        rec.date,
        rec.status,
        BigInt(Date.now()),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
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
      return (actor as AnyActor).addHoliday2(
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
        BigInt(amount),
        note,
        BigInt(Date.now()),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
