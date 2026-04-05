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
import { BarChart3, FileText } from "lucide-react";
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
        const present = recs.filter((a) => a.status === "present").length;
        const absent = recs.filter((a) => a.status === "absent").length;
        const halfday = recs.filter((a) => a.status === "halfday").length;
        const total = present + absent + halfday;
        const pct =
          total > 0 ? Math.round(((present + halfday * 0.5) / total) * 100) : 0;
        return { emp, present, absent, halfday, total, pct };
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
          total: acc.total + r.total,
        }),
        { present: 0, absent: 0, halfday: 0, total: 0 },
      ),
    [report],
  );

  const handleDownloadAttendanceReport = () => {
    const monthLabel = MONTHS[Number(selectedMonth) - 1];

    const tableRows = report
      .map((r, idx) => {
        const rowBg = idx % 2 === 0 ? "#ffffff" : "#f9fafb";
        const pctColor =
          r.pct >= 75 ? "#16a34a" : r.pct >= 50 ? "#d97706" : "#dc2626";
        return `
          <tr style="background:${rowBg}">
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${r.emp.id}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:500">${r.emp.name}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;color:#6b7280">${r.emp.department}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:#16a34a;font-weight:600">${r.present}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:#dc2626;font-weight:600">${r.absent}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:#d97706;font-weight:600">${r.halfday}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">${r.total}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:${pctColor}">${r.pct}%</td>
          </tr>`;
      })
      .join("");

    const overallPct =
      totals.total > 0
        ? Math.round(
            ((totals.present + totals.halfday * 0.5) / totals.total) * 100,
          )
        : 0;
    const overallPctColor =
      overallPct >= 75 ? "#16a34a" : overallPct >= 50 ? "#d97706" : "#dc2626";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Monthly Attendance Report - ${monthLabel} ${selectedYear}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #1f2937; background: #fff; padding: 32px; }
    .header { text-align: center; margin-bottom: 28px; border-bottom: 2px solid #1e40af; padding-bottom: 16px; }
    .header h1 { font-size: 22px; font-weight: 700; color: #1e40af; letter-spacing: 0.5px; }
    .header p { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .period { text-align: center; font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 20px; }
    .meta-row { display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    thead tr { background: #1e40af; color: white; }
    thead th { padding: 12px 14px; text-align: left; font-weight: 600; letter-spacing: 0.03em; }
    thead th.center { text-align: center; }
    tfoot tr { background: #f3f4f6; }
    tfoot td { padding: 12px 14px; font-weight: 700; border-top: 2px solid #e5e7eb; }
    .summary { display: flex; gap: 24px; margin-top: 28px; flex-wrap: wrap; }
    .summary-card { flex: 1; min-width: 140px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
    .summary-card .label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
    .summary-card .value { font-size: 20px; font-weight: 700; }
    .print-btn { margin: 24px 0 0; display: flex; justify-content: center; }
    .print-btn button { padding: 10px 28px; background: #1e40af; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .print-btn button:hover { background: #1d4ed8; }
    @media print { .print-btn { display: none; } body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>PE Office Management</h1>
    <p>Monthly Attendance Report</p>
  </div>
  <div class="period">${monthLabel} ${selectedYear}</div>
  <div class="meta-row">
    <span>Total Employees: ${report.length}</span>
    <span>Generated: ${new Date().toLocaleDateString("en-IN")}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Employee ID</th>
        <th>Name</th>
        <th>Department</th>
        <th class="center" style="color:#bbf7d0">Present</th>
        <th class="center" style="color:#fca5a5">Absent</th>
        <th class="center" style="color:#fde68a">Half Day</th>
        <th class="center">Total Days</th>
        <th class="center">Attendance %</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="3">TOTALS</td>
        <td style="text-align:center;color:#16a34a">${totals.present}</td>
        <td style="text-align:center;color:#dc2626">${totals.absent}</td>
        <td style="text-align:center;color:#d97706">${totals.halfday}</td>
        <td style="text-align:center">${totals.total}</td>
        <td style="text-align:center;color:${overallPctColor}">${overallPct}%</td>
      </tr>
    </tfoot>
  </table>
  <div class="summary">
    <div class="summary-card">
      <div class="label">Total Present</div>
      <div class="value" style="color:#16a34a">${totals.present}</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Absent</div>
      <div class="value" style="color:#dc2626">${totals.absent}</div>
    </div>
    <div class="summary-card">
      <div class="label">Half Days</div>
      <div class="value" style="color:#d97706">${totals.halfday}</div>
    </div>
    <div class="summary-card">
      <div class="label">Overall Attendance</div>
      <div class="value" style="color:${overallPctColor}">${overallPct}%</div>
    </div>
  </div>
  <div class="print-btn"><button onclick="window.print()">Print Report</button></div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
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
            size="sm"
            onClick={handleDownloadAttendanceReport}
            data-ocid="monthly.download_report_button"
            className="gap-1.5"
          >
            <FileText className="w-4 h-4" /> Download Attendance Report
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
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">
                        %
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
                          {row.total}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold hidden lg:table-cell">
                          <span
                            className={
                              row.pct >= 75
                                ? "text-success"
                                : row.pct >= 50
                                  ? "text-warning-foreground"
                                  : "text-destructive"
                            }
                          >
                            {row.pct}%
                          </span>
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
                        {totals.total}
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        —
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
