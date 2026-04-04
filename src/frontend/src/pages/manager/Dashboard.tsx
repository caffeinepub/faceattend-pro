import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarX2,
  Loader2,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useActor } from "../../hooks/useActor";
import {
  useAttendanceByMonth,
  useEmployees,
  useHolidays,
} from "../../hooks/useQueries";
import type { ManagerTab } from "../ManagerPanel";

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  present: {
    label: "Present",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5",
  },
  absent: {
    label: "Absent",
    cls: "bg-red-50 text-red-600 border border-red-200 rounded-full px-2.5 py-0.5",
  },
  halfday: {
    label: "Half Day",
    cls: "bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5",
  },
};

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    startRef.current = null;
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return count;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  onClick: () => void;
  ocid: string;
  delay: number;
}

function StatCard({
  label,
  value,
  icon,
  gradient,
  onClick,
  ocid,
  delay,
}: StatCardProps) {
  const count = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay,
        type: "spring",
        stiffness: 280,
        damping: 22,
      }}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      <Card
        className="rounded-2xl cursor-pointer overflow-hidden border-0 shadow-md"
        onClick={onClick}
        data-ocid={ocid}
      >
        <CardContent className="p-0">
          <div className={`${gradient} p-5`}>
            <motion.div
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 text-white"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {icon}
            </motion.div>
            <motion.div
              key={count}
              className="text-3xl font-bold text-white mb-1"
            >
              {count}
            </motion.div>
            <div className="text-sm text-white/80 font-medium">{label}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [showConfirm, setShowConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

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

  const handleClearAll = async () => {
    if (!actor) return;
    setClearing(true);
    try {
      await actor.clearAllData();
      await queryClient.invalidateQueries();
      await queryClient.refetchQueries();
    } finally {
      setClearing(false);
      setShowConfirm(false);
    }
  };

  const dateLabel = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="font-display font-bold text-2xl">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">{dateLabel}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive/60"
          onClick={() => setShowConfirm(true)}
        >
          Clear All Data
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {empLoading || attLoading ? (
          [1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Employees"
              value={employees.length}
              icon={<Users className="w-5 h-5" />}
              gradient="bg-gradient-to-br from-[oklch(0.55_0.18_240)] to-[oklch(0.42_0.2_260)]"
              onClick={() => onNavigate("employees")}
              ocid="dashboard.employees.card"
              delay={0}
            />
            <StatCard
              label="Present Today"
              value={presentToday}
              icon={<UserCheck className="w-5 h-5" />}
              gradient="bg-gradient-to-br from-[oklch(0.55_0.18_145)] to-[oklch(0.44_0.2_155)]"
              onClick={() => onNavigate("attendance")}
              ocid="dashboard.attendance.card"
              delay={0.1}
            />
            <StatCard
              label="Absent Today"
              value={absentToday}
              icon={<UserX className="w-5 h-5" />}
              gradient="bg-gradient-to-br from-[oklch(0.56_0.22_25)] to-[oklch(0.46_0.2_15)]"
              onClick={() => onNavigate("attendance")}
              ocid="dashboard.absent.card"
              delay={0.2}
            />
            <StatCard
              label="Holidays"
              value={holidaysThisMonth}
              icon={<CalendarX2 className="w-5 h-5" />}
              gradient="bg-gradient-to-br from-[oklch(0.66_0.18_65)] to-[oklch(0.55_0.2_55)]"
              onClick={() => onNavigate("holidays")}
              ocid="dashboard.holidays.card"
              delay={0.3}
            />
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
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
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : recentRecords.length === 0 ? (
              <div
                className="text-center py-10 text-muted-foreground"
                data-ocid="dashboard.attendance.empty_state"
              >
                <CalendarX2 className="w-10 h-10 mx-auto mb-2 opacity-25" />
                <p className="text-sm">No attendance records yet this month</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentRecords.map((rec, idx) => {
                  const badge = STATUS_BADGE[rec.status] ?? {
                    label: rec.status,
                    cls: "",
                  };
                  return (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      className="flex items-center justify-between py-3"
                      data-ocid={`dashboard.attendance.item.${idx + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {(empMap[rec.employeeId] ?? "?")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">
                            {empMap[rec.employeeId] ?? rec.employeeId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {rec.date}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent data-ocid="dashboard.clear.dialog">
          <DialogHeader>
            <DialogTitle>Clear All Data?</DialogTitle>
            <DialogDescription>
              This will permanently delete all employees, attendance records,
              holidays, and salary payments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={clearing}
              data-ocid="dashboard.clear.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={clearing}
              data-ocid="dashboard.clear.confirm_button"
            >
              {clearing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Clearing…
                </>
              ) : (
                "Yes, Clear All"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
