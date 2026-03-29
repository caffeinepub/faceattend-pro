import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Loader2,
  MinusCircle,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAttendanceByMonth,
  useEmployees,
  useMarkAttendance,
} from "../../hooks/useQueries";

const STATUS_CONFIG = {
  present: {
    label: "Present",
    className: "bg-success/10 text-success border-success/30 border",
  },
  absent: {
    label: "Absent",
    className:
      "bg-destructive/10 text-destructive border-destructive/30 border",
  },
  halfday: {
    label: "Half Day",
    className: "bg-warning/10 text-warning-foreground border-warning/30 border",
  },
};

export default function MarkAttendance() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const { data: attendance = [], isLoading: attLoading } = useAttendanceByMonth(
    year,
    month,
  );
  const markMut = useMarkAttendance();
  const [marking, setMarking] = useState<Record<string, boolean>>({});

  const todayMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const rec of attendance) {
      if (rec.date === today) m[rec.employeeId] = rec.status;
    }
    return m;
  }, [attendance, today]);

  const handleMark = async (employeeId: string, status: string) => {
    setMarking((prev) => ({ ...prev, [employeeId]: true }));
    try {
      await markMut.mutateAsync({ employeeId, date: today, status });
      toast.success(`Marked as ${status}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to mark attendance");
    } finally {
      setMarking((prev) => ({ ...prev, [employeeId]: false }));
    }
  };

  const handleMarkAllPresent = async () => {
    const unmarked = employees.filter((e) => !todayMap[e.id]);
    if (unmarked.length === 0) {
      toast.info("All employees already marked");
      return;
    }
    await Promise.all(unmarked.map((e) => handleMark(e.id, "present")));
  };

  const isLoading = empLoading || attLoading;
  const markedCount = Object.keys(todayMap).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl">Mark Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {now.toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{markedCount}</span>
            /{employees.length} marked
          </div>
          <Button
            data-ocid="attendance.mark_all_button"
            variant="outline"
            size="sm"
            onClick={handleMarkAllPresent}
            disabled={isLoading}
          >
            <Users className="w-4 h-4 mr-1.5" /> Mark All Present
          </Button>
        </div>
      </div>

      <Card className="rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="attendance.loading_state">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : employees.length === 0 ? (
            <div
              className="text-center py-14 text-muted-foreground"
              data-ocid="attendance.empty_state"
            >
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No employees registered yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {employees.map((emp, idx) => {
                const status = todayMap[emp.id];
                const isMarking = marking[emp.id];
                const statusConf = status
                  ? STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
                  : null;
                return (
                  <div
                    key={emp.id}
                    className="flex items-center gap-4 px-5 py-3"
                    data-ocid={`attendance.item.${idx + 1}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {emp.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {emp.department} &middot; {emp.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isMarking ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      ) : statusConf ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConf.className}`}
                          >
                            {statusConf.label}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2 text-muted-foreground"
                            onClick={() => handleMark(emp.id, "present")}
                            data-ocid={`attendance.change_button.${idx + 1}`}
                          >
                            Change
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            data-ocid={`attendance.present_button.${idx + 1}`}
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-success/40 text-success hover:bg-success/10"
                            onClick={() => handleMark(emp.id, "present")}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />{" "}
                            Present
                          </Button>
                          <Button
                            data-ocid={`attendance.absent_button.${idx + 1}`}
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                            onClick={() => handleMark(emp.id, "absent")}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Absent
                          </Button>
                          <Button
                            data-ocid={`attendance.halfday_button.${idx + 1}`}
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs hidden sm:flex"
                            onClick={() => handleMark(emp.id, "halfday")}
                          >
                            <MinusCircle className="w-3.5 h-3.5 mr-1" /> Half
                          </Button>
                        </div>
                      )}
                    </div>
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
