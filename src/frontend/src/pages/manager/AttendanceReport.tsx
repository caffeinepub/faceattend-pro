import { Badge } from "@/components/ui/badge";
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
import { Download, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { useAttendanceByEmployee, useEmployees } from "../../hooks/useQueries";

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

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function padMonth(m: string) {
  return m.padStart(2, "0");
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status)
    return <span className="text-muted-foreground text-xs">— Not Marked</span>;
  if (status === "present")
    return (
      <Badge className="bg-success/15 text-success border-success/30 text-xs">
        Present
      </Badge>
    );
  if (status === "absent")
    return (
      <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs">
        Absent
      </Badge>
    );
  if (status === "halfday")
    return (
      <Badge className="bg-warning/15 text-warning-foreground border-warning/30 text-xs">
        Half Day
      </Badge>
    );
  return <Badge variant="outline">{status}</Badge>;
}

export default function AttendanceReport() {
  const now = new Date();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const years = Array.from({ length: 3 }, (_, i) =>
    String(now.getFullYear() - i),
  );

  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const { data: allAttendance = [], isLoading: attLoading } =
    useAttendanceByEmployee(selectedEmployeeId);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const days = useMemo(
    () => getDaysInMonth(Number(selectedYear), Number(selectedMonth)),
    [selectedYear, selectedMonth],
  );

  const attendanceMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const rec of allAttendance) {
      const recYear = rec.date.slice(0, 4);
      const recMonth = rec.date.slice(5, 7);
      if (recYear === selectedYear && recMonth === padMonth(selectedMonth)) {
        map[rec.date] = rec.status;
      }
    }
    return map;
  }, [allAttendance, selectedYear, selectedMonth]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfday = 0;
    for (const d of days) {
      const status = attendanceMap[formatDate(d)];
      if (status === "present") present++;
      else if (status === "absent") absent++;
      else if (status === "halfday") halfday++;
    }
    return { present, absent, halfday };
  }, [days, attendanceMap]);

  const handleDownloadReport = () => {
    if (!selectedEmployee) return;

    const monthName = MONTHS[Number(selectedMonth) - 1];
    const tableRows = days
      .map((d, idx) => {
        const dateStr = formatDate(d);
        const dayName = DAY_NAMES[d.getDay()];
        const status = attendanceMap[dateStr] ?? null;
        const statusLabel = status
          ? status === "present"
            ? "Present"
            : status === "absent"
              ? "Absent"
              : "Half Day"
          : "Not Marked";
        const statusColor =
          status === "present"
            ? "#16a34a"
            : status === "absent"
              ? "#dc2626"
              : status === "halfday"
                ? "#d97706"
                : "#6b7280";
        const rowBg = idx % 2 === 0 ? "#ffffff" : "#f9fafb";
        return `
          <tr style="background:${rowBg}">
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${String(d.getDate()).padStart(2, "0")} ${monthName.slice(0, 3)} ${selectedYear}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${dayName}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">
              <span style="color:${statusColor};font-weight:600;">${statusLabel}</span>
            </td>
          </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Attendance Report - ${selectedEmployee.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #1f2937; background: #fff; padding: 32px; }
    .header { text-align: center; margin-bottom: 28px; border-bottom: 2px solid #1e40af; padding-bottom: 16px; }
    .header h1 { font-size: 22px; font-weight: 700; color: #1e40af; letter-spacing: 0.5px; }
    .header p { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .meta { display: flex; gap: 32px; margin-bottom: 24px; flex-wrap: wrap; }
    .meta-item { display: flex; flex-direction: column; }
    .meta-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta-value { font-size: 15px; font-weight: 600; color: #111827; margin-top: 2px; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; }
    .summary-card { flex: 1; padding: 12px 16px; border-radius: 8px; text-align: center; }
    .summary-card .count { font-size: 28px; font-weight: 700; }
    .summary-card .label { font-size: 12px; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    thead tr { background: #1e40af; color: white; }
    thead th { padding: 12px 14px; text-align: left; font-weight: 600; letter-spacing: 0.03em; }
    tfoot tr { background: #f3f4f6; font-weight: 700; }
    tfoot td { padding: 12px 14px; }
    .print-btn { margin: 24px 0 0; display: flex; justify-content: center; }
    .print-btn button { padding: 10px 28px; background: #1e40af; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .print-btn button:hover { background: #1d4ed8; }
    @media print { .print-btn { display: none; } body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>PE Office Management</h1>
    <p>Employee Attendance Report</p>
  </div>
  <div class="meta">
    <div class="meta-item"><span class="meta-label">Employee Name</span><span class="meta-value">${selectedEmployee.name}</span></div>
    <div class="meta-item"><span class="meta-label">Employee ID</span><span class="meta-value">${selectedEmployee.id}</span></div>
    <div class="meta-item"><span class="meta-label">Department</span><span class="meta-value">${selectedEmployee.department}</span></div>
    <div class="meta-item"><span class="meta-label">Period</span><span class="meta-value">${monthName} ${selectedYear}</span></div>
    <div class="meta-item"><span class="meta-label">Generated On</span><span class="meta-value">${new Date().toLocaleDateString("en-IN")}</span></div>
  </div>
  <div class="summary">
    <div class="summary-card" style="background:#dcfce7;">
      <div class="count" style="color:#16a34a">${summary.present}</div>
      <div class="label" style="color:#15803d">Present</div>
    </div>
    <div class="summary-card" style="background:#fee2e2;">
      <div class="count" style="color:#dc2626">${summary.absent}</div>
      <div class="label" style="color:#b91c1c">Absent</div>
    </div>
    <div class="summary-card" style="background:#fef9c3;">
      <div class="count" style="color:#d97706">${summary.halfday}</div>
      <div class="label" style="color:#b45309">Half Day</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Day</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="2">Total Days Marked: ${summary.present + summary.absent + summary.halfday} / ${days.length}</td>
        <td>Present: ${summary.present} &nbsp;|&nbsp; Absent: ${summary.absent} &nbsp;|&nbsp; Half Day: ${summary.halfday}</td>
      </tr>
    </tfoot>
  </table>
  <div class="print-btn"><button onclick="window.print()">Print Report</button></div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const isLoading = empLoading || (!!selectedEmployeeId && attLoading);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl">Attendance Report</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Per-employee attendance details by month
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleDownloadReport}
          disabled={!selectedEmployeeId}
          data-ocid="attendancereport.download_button"
          className="gap-1.5"
        >
          <Download className="w-4 h-4" /> Download Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={selectedEmployeeId}
          onValueChange={setSelectedEmployeeId}
        >
          <SelectTrigger
            className="w-52"
            data-ocid="attendancereport.employee.select"
          >
            <SelectValue placeholder="Select Employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name} ({emp.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger
            className="w-36"
            data-ocid="attendancereport.month.select"
          >
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
          <SelectTrigger
            className="w-28"
            data-ocid="attendancereport.year.select"
          >
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
      </div>

      {/* Summary Cards */}
      {selectedEmployeeId && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-xl border-success/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-success">
                {summary.present}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Present</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-destructive/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-destructive">
                {summary.absent}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Absent</div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-warning/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-warning-foreground">
                {summary.halfday}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Half Day</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3 flex flex-row items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">
            {selectedEmployee
              ? `${selectedEmployee.name} — ${MONTHS[Number(selectedMonth) - 1]} ${selectedYear}`
              : "Select an employee to view report"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedEmployeeId ? (
            <div
              className="text-center py-14 text-muted-foreground"
              data-ocid="attendancereport.empty_state"
            >
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select an employee to view attendance</p>
            </div>
          ) : isLoading ? (
            <div
              className="p-6 space-y-2"
              data-ocid="attendancereport.loading_state"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-5 py-3 font-semibold text-muted-foreground w-12">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      Day
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((d, idx) => {
                    const dateStr = formatDate(d);
                    const status = attendanceMap[dateStr] ?? null;
                    return (
                      <tr
                        key={dateStr}
                        className="border-b last:border-0 hover:bg-muted/20"
                        data-ocid={`attendancereport.item.${idx + 1}`}
                      >
                        <td className="px-5 py-2.5 text-muted-foreground text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {String(d.getDate()).padStart(2, "0")}{" "}
                          {MONTHS[d.getMonth()].slice(0, 3)} {selectedYear}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {DAY_NAMES[d.getDay()]}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30 font-semibold border-t">
                    <td className="px-5 py-3" colSpan={3}>
                      Total Days Marked:{" "}
                      {summary.present + summary.absent + summary.halfday} /{" "}
                      {days.length}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="text-success mr-2">
                        P:{summary.present}
                      </span>
                      <span className="text-destructive mr-2">
                        A:{summary.absent}
                      </span>
                      <span className="text-warning-foreground">
                        H:{summary.halfday}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
