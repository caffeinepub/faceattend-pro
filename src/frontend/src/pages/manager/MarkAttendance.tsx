import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Check, Loader2, Trash2, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAttendanceByMonth,
  useEmployees,
  useMarkAttendance,
  useRemoveAttendance,
} from "../../hooks/useQueries";

const STATUS_CONFIG = {
  present: {
    label: "Present",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  absent: {
    label: "Absent",
    className: "bg-red-50 text-red-600 border border-red-200",
  },
  halfday: {
    label: "Half Day",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
};

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MarkAttendance() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [yearStr, monthStr] = selectedDate.split("-");
  const year = yearStr;
  const month = monthStr.padStart(2, "0");
  const dateStr = selectedDate;

  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const { data: attendance = [], isLoading: attLoading } = useAttendanceByMonth(
    year,
    month,
  );
  const markMut = useMarkAttendance();
  const removeMut = useRemoveAttendance();
  const [marking, setMarking] = useState<Record<string, boolean>>({});
  const [editingIds, setEditingIds] = useState<Record<string, boolean>>({});

  const todayMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const rec of attendance) {
      if (rec.date === dateStr) m[rec.employeeId] = rec.status;
    }
    return m;
  }, [attendance, dateStr]);

  const handleMark = async (employeeId: string, status: string) => {
    setMarking((prev) => ({ ...prev, [employeeId]: true }));
    try {
      await markMut.mutateAsync({ employeeId, date: dateStr, status });
      toast.success(`Marked as ${status}`);
      setEditingIds((prev) => ({ ...prev, [employeeId]: false }));
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to mark attendance");
    } finally {
      setMarking((prev) => ({ ...prev, [employeeId]: false }));
    }
  };

  const handleRemove = async (employeeId: string) => {
    setMarking((prev) => ({ ...prev, [employeeId]: true }));
    try {
      await removeMut.mutateAsync({ employeeId, date: dateStr });
      toast.success("Attendance removed");
      setEditingIds((prev) => ({ ...prev, [employeeId]: false }));
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to remove attendance");
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
  const dateLabel = formatDateLabel(selectedDate);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight">
            Mark Attendance
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{dateLabel}</p>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
            <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <label
              htmlFor="attendance-date"
              className="text-xs font-medium text-muted-foreground whitespace-nowrap"
            >
              Select Date:
            </label>
            <input
              id="attendance-date"
              type="date"
              value={selectedDate}
              max={todayStr}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  setEditingIds({});
                }
              }}
              className="border-0 bg-transparent text-sm text-foreground focus:outline-none focus:ring-0 cursor-pointer"
              data-ocid="attendance.date_input"
            />
          </div>
          {selectedDate !== todayStr && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setSelectedDate(todayStr);
                setEditingIds({});
              }}
              className="text-xs text-primary font-medium hover:underline underline-offset-2 transition-colors"
            >
              Back to Today
            </motion.button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{markedCount}</span>
            <span>/{employees.length} marked</span>
          </p>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              data-ocid="attendance.mark_all_button"
              variant="outline"
              size="sm"
              className="rounded-full h-8 px-4 text-xs font-medium"
              onClick={handleMarkAllPresent}
              disabled={isLoading}
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Mark All Present
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Employee List Card */}
      <Card className="rounded-2xl shadow-sm border-border/60 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y" data-ocid="attendance.loading_state">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-9 w-36 rounded-full" />
                </div>
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="attendance.empty_state"
            >
              <Users className="w-10 h-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm font-medium">No employees registered yet</p>
              <p className="text-xs mt-1 opacity-70">
                Add employees from the Employees section
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {employees.map((emp, idx) => {
                const status = todayMap[emp.id];
                const isMarking = marking[emp.id];
                const isEditing = editingIds[emp.id];
                const statusConf = status
                  ? STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
                  : null;

                return (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4"
                    data-ocid={`attendance.item.${idx + 1}`}
                  >
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0 select-none"
                    >
                      {getInitials(emp.name)}
                    </motion.div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight truncate">
                        {emp.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {emp.department} &middot; {emp.id}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isMarking ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      ) : statusConf && !isEditing ? (
                        <div className="flex items-center gap-2">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={status}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.18 }}
                              className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${statusConf.className}`}
                            >
                              {statusConf.label}
                            </motion.span>
                          </AnimatePresence>
                          <button
                            type="button"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium underline-offset-2 hover:underline"
                            onClick={() =>
                              setEditingIds((prev) => ({
                                ...prev,
                                [emp.id]: true,
                              }))
                            }
                            data-ocid={`attendance.edit_button.${idx + 1}`}
                          >
                            Edit
                          </button>
                        </div>
                      ) : isEditing ? (
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-emerald-400 text-emerald-700 text-xs font-medium hover:bg-emerald-50 transition-colors"
                            onClick={() => handleMark(emp.id, "present")}
                            data-ocid={`attendance.present_button.${idx + 1}`}
                          >
                            <Check className="w-3.5 h-3.5" /> Present
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-red-400 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                            onClick={() => handleMark(emp.id, "absent")}
                            data-ocid={`attendance.absent_button.${idx + 1}`}
                          >
                            <X className="w-3.5 h-3.5" /> Absent
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-rose-400 text-rose-600 text-xs font-medium hover:bg-rose-50 transition-colors"
                            onClick={() => handleRemove(emp.id)}
                            data-ocid={`attendance.remove_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </motion.button>
                          <button
                            type="button"
                            className="h-8 px-2.5 rounded-full text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                            onClick={() =>
                              setEditingIds((prev) => ({
                                ...prev,
                                [emp.id]: false,
                              }))
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.04 }}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-emerald-400 text-emerald-700 text-xs font-semibold hover:bg-emerald-50 transition-colors"
                            onClick={() => handleMark(emp.id, "present")}
                            data-ocid={`attendance.present_button.${idx + 1}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            Present
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            whileHover={{ scale: 1.04 }}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-red-400 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                            onClick={() => handleMark(emp.id, "absent")}
                            data-ocid={`attendance.absent_button.${idx + 1}`}
                          >
                            <X className="w-3.5 h-3.5" />
                            Absent
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
