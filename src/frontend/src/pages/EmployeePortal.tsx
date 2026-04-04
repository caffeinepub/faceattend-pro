import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  DollarSign,
  LogOut,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  useAttendanceByMonth,
  useEmployee,
  usePaymentsByEmployee,
} from "../hooks/useQueries";

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

function fmtCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

const STATUS_COLORS: Record<string, string> = {
  present: "bg-success/10 text-success border-success/30",
  absent: "bg-destructive/10 text-destructive border-destructive/30",
  halfday: "bg-warning/10 text-warning-foreground border-warning/30",
};

const STATUS_LABEL: Record<string, string> = {
  present: "P",
  absent: "A",
  halfday: "H",
};

export default function EmployeePortal({ onBack }: { onBack: () => void }) {
  const [empId, setEmpId] = useState("");
  const [loggedInId, setLoggedInId] = useState("");
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0"),
  );

  const { data: employee, isLoading: empLoading } = useEmployee(loggedInId);
  const { data: attendance = [], isLoading: attLoading } = useAttendanceByMonth(
    selectedYear,
    selectedMonth,
  );
  const { data: payments = [], isLoading: payLoading } =
    usePaymentsByEmployee(loggedInId);

  const myAttendance = attendance.filter((a) => a.employeeId === loggedInId);
  const presentDays = myAttendance.filter((a) => a.status === "present").length;
  const absentDays = myAttendance.filter((a) => a.status === "absent").length;
  const halfDays = myAttendance.filter((a) => a.status === "halfday").length;

  const monthlySalary = employee ? Number(employee.monthlySalary) : 0;
  const dailyRate = monthlySalary / 26;
  const earned = (presentDays + halfDays * 0.5) * dailyRate;
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const balance = earned - totalPaid;

  const attMap: Record<string, string> = {};
  for (const rec of myAttendance) attMap[rec.date] = rec.status;

  const daysInMonth = new Date(
    Number(selectedYear),
    Number(selectedMonth),
    0,
  ).getDate();
  const firstDayOfWeek = new Date(
    Number(selectedYear),
    Number(selectedMonth) - 1,
    1,
  ).getDay();
  const years = Array.from({ length: 3 }, (_, i) =>
    String(now.getFullYear() - i),
  );

  if (!loggedInId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.025_240)] via-[oklch(0.18_0.04_250)] to-[oklch(0.12_0.02_230)] flex flex-col items-center justify-center px-4">
        <button
          type="button"
          data-ocid="employee.back_button"
          onClick={onBack}
          className="absolute top-5 left-5 flex items-center gap-1.5 text-[oklch(0.65_0.04_240)] hover:text-white text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[oklch(0.6_0.18_210/0.2)] border border-[oklch(0.6_0.18_210/0.3)] flex items-center justify-center mb-4">
              <User className="w-7 h-7 text-[oklch(0.65_0.18_210)]" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white">
              Employee Portal
            </h1>
            <p className="text-[oklch(0.6_0.04_240)] text-sm mt-1">
              Sign in with your Employee ID
            </p>
          </div>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-[oklch(0.75_0.04_240)] text-sm">
                  Employee ID
                </Label>
                <Input
                  data-ocid="employee.login.input"
                  placeholder="Employee ID"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    empId.trim() &&
                    setLoggedInId(empId.trim())
                  }
                  className="bg-white/5 border-white/15 text-white placeholder:text-[oklch(0.45_0.03_240)] focus:border-primary"
                />
              </div>
              <Button
                data-ocid="employee.login.submit_button"
                className="w-full"
                onClick={() => empId.trim() && setLoggedInId(empId.trim())}
                disabled={!empId.trim()}
              >
                View My Attendance
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (empLoading) {
    return (
      <div
        className="min-h-screen bg-background p-6 space-y-4"
        data-ocid="employee.loading_state"
      >
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col items-center justify-center gap-4"
        data-ocid="employee.error_state"
      >
        <div className="text-destructive font-semibold text-lg">
          Employee not found
        </div>
        <p className="text-muted-foreground text-sm">
          No employee with ID &quot;{loggedInId}&quot; exists.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setLoggedInId("");
            setEmpId("");
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sidebar text-sidebar-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
            {employee.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-sm">{employee.name}</div>
            <div className="text-xs text-[oklch(0.55_0.04_240)]">
              {employee.department} &middot; {employee.id}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-sm">AttendPro</span>
          </div>
          <Button
            data-ocid="employee.logout_button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setLoggedInId("");
              setEmpId("");
            }}
            className="text-[oklch(0.55_0.04_240)] hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-1.5" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-36" data-ocid="employee.month.select">
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
            <SelectTrigger className="w-28" data-ocid="employee.year.select">
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

        <Tabs defaultValue="attendance">
          <TabsList className="mb-6">
            <TabsTrigger value="attendance" data-ocid="employee.attendance.tab">
              <Calendar className="w-4 h-4 mr-1.5" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="salary" data-ocid="employee.salary.tab">
              <DollarSign className="w-4 h-4 mr-1.5" /> Salary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            {attLoading ? (
              <Skeleton
                className="h-64 w-full rounded-xl"
                data-ocid="employee.attendance.loading_state"
              />
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="rounded-xl">
                    <CardContent className="pt-4 pb-4 text-center">
                      <div className="text-2xl font-bold text-success">
                        {presentDays}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Present
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl">
                    <CardContent className="pt-4 pb-4 text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {absentDays}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Absent
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl">
                    <CardContent className="pt-4 pb-4 text-center">
                      <div className="text-2xl font-bold text-warning-foreground">
                        {halfDays}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Half Day
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {MONTHS[Number(selectedMonth) - 1]} {selectedYear}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (d) => (
                          <div key={d} className="font-medium py-1">
                            {d}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {firstDayOfWeek > 0 && <div />}
                      {firstDayOfWeek > 1 && <div />}
                      {firstDayOfWeek > 2 && <div />}
                      {firstDayOfWeek > 3 && <div />}
                      {firstDayOfWeek > 4 && <div />}
                      {firstDayOfWeek > 5 && <div />}
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = String(i + 1).padStart(2, "0");
                        const dateStr = `${selectedYear}-${selectedMonth}-${day}`;
                        const status = attMap[dateStr];
                        return (
                          <div
                            key={day}
                            className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium border ${
                              status
                                ? STATUS_COLORS[status]
                                : "border-transparent text-muted-foreground"
                            }`}
                          >
                            <span>{i + 1}</span>
                            {status && (
                              <span className="text-[10px] leading-none mt-0.5">
                                {STATUS_LABEL[status]}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="salary">
            {payLoading ? (
              <Skeleton
                className="h-64 w-full rounded-xl"
                data-ocid="employee.salary.loading_state"
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-xl">
                    <CardContent className="pt-4 pb-4">
                      <div className="text-xs text-muted-foreground mb-1">
                        Monthly Salary
                      </div>
                      <div className="font-bold text-lg">
                        {fmtCurrency(monthlySalary)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl">
                    <CardContent className="pt-4 pb-4">
                      <div className="text-xs text-muted-foreground mb-1">
                        Daily Rate
                      </div>
                      <div className="font-bold text-lg">
                        {fmtCurrency(Math.round(dailyRate))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl">
                    <CardContent className="pt-4 pb-4">
                      <div className="text-xs text-muted-foreground mb-1">
                        Days Present
                      </div>
                      <div className="font-bold text-lg">
                        {presentDays}
                        <span className="text-xs text-muted-foreground font-normal ml-1">
                          ({halfDays} half)
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl">
                    <CardContent className="pt-4 pb-4">
                      <div className="text-xs text-muted-foreground mb-1">
                        Total Earned
                      </div>
                      <div className="font-bold text-lg text-success">
                        {fmtCurrency(Math.round(earned))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Earned
                      </span>
                      <span className="font-medium">
                        {fmtCurrency(Math.round(earned))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Paid</span>
                      <span className="font-medium text-success">
                        {fmtCurrency(totalPaid)}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-sm font-semibold">
                      <span>Balance Due</span>
                      <span
                        className={
                          balance > 0 ? "text-destructive" : "text-success"
                        }
                      >
                        {fmtCurrency(Math.round(balance))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                {payments.length > 0 && (
                  <Card className="rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Payment History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {payments.map((p, idx) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                            data-ocid={`employee.payment.item.${idx + 1}`}
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {fmtCurrency(Number(p.amount))}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {p.note || "Payment"}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(Number(p.paidAt)).toLocaleDateString(
                                "en-IN",
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
