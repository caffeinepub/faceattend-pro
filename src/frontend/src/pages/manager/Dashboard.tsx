import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarX2, TrendingUp, UserCheck, UserX, Users } from "lucide-react";
import { useMemo } from "react";
import {
  useAttendanceByMonth,
  useEmployees,
  useHolidays,
} from "../../hooks/useQueries";
import type { ManagerTab } from "../ManagerPanel";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  present: {
    label: "Present",
    className:
      "bg-success/10 text-success border-success/30 border rounded-full px-2 py-0.5",
  },
  absent: {
    label: "Absent",
    className:
      "bg-destructive/10 text-destructive border-destructive/30 border rounded-full px-2 py-0.5",
  },
  halfday: {
    label: "Half Day",
    className:
      "bg-warning/10 text-warning-foreground border-warning/30 border rounded-full px-2 py-0.5",
  },
};

export default function Dashboard({
  onNavigate,
}: { onNavigate: (tab: ManagerTab) => void }) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const today = now.toISOString().slice(0, 10);

  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const { data: attendance = [], isLoading: attLoading } = useAttendanceByMonth(
    year,
    month,
  );
  const { data: holidays = [] } = useHolidays();

  const todayAttendance = useMemo(
    () => attendance.filter((a) => a.date === today),
    [attendance, today],
  );
  const presentToday = todayAttendance.filter(
    (a) => a.status === "present",
  ).length;
  const absentToday = todayAttendance.filter(
    (a) => a.status === "absent",
  ).length;
  const holidaysThisMonth = holidays.filter((h) =>
    h.date.startsWith(`${year}-${month}`),
  ).length;

  const empMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const e of employees) m[e.id] = e.name;
    return m;
  }, [employees]);

  const recentRecords = useMemo(
    () =>
      [...attendance]
        .sort((a, b) => Number(b.markedAt) - Number(a.markedAt))
        .slice(0, 10),
    [attendance],
  );

  const statCards = [
    {
      label: "Total Employees",
      value: employees.length,
      icon: <Users className="w-5 h-5" />,
      color: "text-[oklch(0.6_0.18_210)]",
      bg: "bg-[oklch(0.6_0.18_210/0.1)]",
      tab: "employees" as ManagerTab,
    },
    {
      label: "Present Today",
      value: presentToday,
      icon: <UserCheck className="w-5 h-5" />,
      color: "text-success",
      bg: "bg-success/10",
      tab: "attendance" as ManagerTab,
    },
    {
      label: "Absent Today",
      value: absentToday,
      icon: <UserX className="w-5 h-5" />,
      color: "text-destructive",
      bg: "bg-destructive/10",
      tab: "attendance" as ManagerTab,
    },
    {
      label: "Holidays This Month",
      value: holidaysThisMonth,
      icon: <CalendarX2 className="w-5 h-5" />,
      color: "text-warning-foreground",
      bg: "bg-warning/10",
      tab: "holidays" as ManagerTab,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {now.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) =>
          empLoading || attLoading ? (
            <Skeleton key={card.label} className="h-28 rounded-xl" />
          ) : (
            <Card
              key={card.label}
              className="rounded-xl cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate(card.tab)}
              data-ocid={`dashboard.${card.tab}.card`}
            >
              <CardContent className="pt-5 pb-5">
                <div
                  className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3 ${card.color}`}
                >
                  {card.icon}
                </div>
                <div className="text-3xl font-bold mb-1">{card.value}</div>
                <div className="text-sm text-muted-foreground">
                  {card.label}
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <Card className="rounded-xl">
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">
            Recent Attendance Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attLoading ? (
            <div
              className="space-y-3"
              data-ocid="dashboard.attendance.loading_state"
            >
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          ) : recentRecords.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="dashboard.attendance.empty_state"
            >
              <CalendarX2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No attendance records yet this month</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentRecords.map((rec, idx) => {
                const badge = STATUS_BADGE[rec.status] ?? {
                  label: rec.status,
                  className: "",
                };
                return (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between py-2.5"
                    data-ocid={`dashboard.attendance.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                        {(empMap[rec.employeeId] ?? "?")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {empMap[rec.employeeId] ?? rec.employeeId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rec.date}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
