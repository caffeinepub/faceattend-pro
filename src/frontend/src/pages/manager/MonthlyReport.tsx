import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Download } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useAttendanceByMonth, useEmployees } from "../../hooks/useQueries";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MonthlyReport() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const years = Array.from({ length: 3 }, (_, i) =>
    String(now.getFullYear() - i),
  );

  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const { data: attendance = [], isLoading: attLoading } = useAttendanceByMonth(
    selectedYear,
    selectedMonth,
  );

  const report = useMemo(
    () =>
      employees.map((emp) => {
        const recs = attendance.filter((a) => a.employeeId === emp.id);
        return {
          emp,
          present: recs.filter((a) => a.status === "present").length,
          absent: recs.filter((a) => a.status === "absent").length,
          halfday: recs.filter((a) => a.status === "halfday").length,
        };
      }),
    [employees, attendance],
  );

  const totals = useMemo(
    () =>
      report.reduce(
        (acc, r) => ({
          present: acc.present + r.present,
          absent: acc.absent + r.absent,
          halfday: acc.halfday + r.halfday,
        }),
        { present: 0, absent: 0, halfday: 0 },
      ),
    [report],
  );

  const handleExport = () => {
    const rows = [
      ["Employee ID", "Name", "Department", "Present", "Absent", "Half Day"],
      ...report.map((r) => [
        r.emp.id,
        r.emp.name,
        r.emp.department,
        r.present,
        r.absent,
        r.halfday,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${selectedYear}-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="font-display font-bold text-2xl">Monthly Report</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Attendance summary by employee
          </p>
        </div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            data-ocid="monthly.export_button"
            className="gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex gap-3"
      >
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-36" data-ocid="monthly.month.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={String(i + 1).padStart(2, "0")}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-28" data-ocid="monthly.year.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="rounded-xl">
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">
              {MONTHS[Number(selectedMonth) - 1]} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {empLoading || attLoading ? (
              <div className="p-6 space-y-3" data-ocid="monthly.loading_state">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            ) : employees.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="monthly.empty_state"
              >
                <p className="text-sm">No employees registered yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-5 py-3 font-semibold text-muted-foreground">
                        Employee
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                        Department
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-success">
                        Present
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-destructive">
                        Absent
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-warning-foreground">
                        Half Day
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((row, idx) => (
                      <motion.tr
                        key={row.emp.id}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                        className="border-b last:border-0 hover:bg-muted/20"
                        data-ocid={`monthly.item.${idx + 1}`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs"
                            >
                              {row.emp.name.slice(0, 2).toUpperCase()}
                            </motion.div>
                            <div>
                              <div className="font-medium">{row.emp.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {row.emp.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {row.emp.department}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-success">
                          {row.present}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-destructive">
                          {row.absent}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-warning-foreground">
                          {row.halfday}
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground hidden sm:table-cell">
                          {row.present + row.absent + row.halfday}
                        </td>
                      </motion.tr>
                    ))}
                    <tr className="bg-muted/30 font-semibold">
                      <td className="px-5 py-3" colSpan={2}>
                        Totals
                      </td>
                      <td className="px-4 py-3 text-center text-success">
                        {totals.present}
                      </td>
                      <td className="px-4 py-3 text-center text-destructive">
                        {totals.absent}
                      </td>
                      <td className="px-4 py-3 text-center text-warning-foreground">
                        {totals.halfday}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {totals.present + totals.absent + totals.halfday}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
