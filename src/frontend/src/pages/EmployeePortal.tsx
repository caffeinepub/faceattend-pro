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
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  useAttendanceByMonth,
  useEmployee,
  useHolidays,
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
  const { data: holidays = [] } = useHolidays();

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

  // Build holiday lookup map: date string -> reason
  const holidayMap: Record<string, string> = {};
  for (const h of holidays) holidayMap[h.date] = h.reason;

  // Holidays that fall in the currently selected month
  const monthPrefix = `${selectedYear}-${selectedMonth}`;
  const holidaysThisMonth = holidays.filter((h) =>
    h.date.startsWith(monthPrefix),
  );

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
      <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.025_240)] via-[oklch(0.18_0.04_250)] to-[oklch(0.12_0.02_230)] flex flex-col items-center justify-center px-4 overflow-hidden">
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
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="relative mb-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-[oklch(0.6_0.18_210/0.2)] border border-[oklch(0.6_0.18_210/0.3)] flex items-center justify-center">
                <User className="w-7 h-7 text-[oklch(0.65_0.18_210)]" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ border: "1.5px solid oklch(0.6 0.18 210 / 0.5)" }}
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeOut",
                }}
              />
            </motion.div>
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
                  placeholder="Enter your employee ID"
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
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  data-ocid="employee.login.submit_button"
                  className="w-full"
                  onClick={() => empId.trim() && setLoggedInId(empId.trim())}
                  disabled={!empId.trim()}
                >
                  View My Attendance
                </Button>
              </motion.div>
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
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-sidebar text-sidebar-foreground px-6 py-4 flex items-center justify-between sticky top-0 z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm"
          >
            {employee.name.slice(0, 2).toUpperCase()}
          </motion.div>
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
      </motion.header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-6"
        >
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
        </motion.div>

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
                  {[
                    {
                      value: presentDays,
                      label: "Present",
                      cls: "text-success",
                    },
                    {
                      value: absentDays,
                      label: "Absent",
                      cls: "text-destructive",
                    },
                    {
                      value: halfDays,
                      label: "Half Day",
                      cls: "text-warning-foreground",
                    },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.85, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: i * 0.08,
                        type: "spring",
                        stiffness: 300,
                        damping: 22,
                      }}
                    >
                      <Card className="rounded-xl">
                        <CardContent className="pt-4 pb-4 text-center">
                          <motion.div
                            key={`${selectedYear}-${selectedMonth}-${stat.value}`}
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 18,
                            }}
                            className={`text-2xl font-bold ${stat.cls}`}
                          >
                            {stat.value}
                          </motion.div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {stat.label}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
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
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${selectedYear}-${selectedMonth}`}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-7 gap-1"
                      >
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
                          const holidayReason = holidayMap[dateStr];
                          const isHoliday = !!holidayReason;

                          // Determine cell style
                          let cellClass =
                            "border-transparent text-muted-foreground";
                          if (status) {
                            cellClass = STATUS_COLORS[status];
                          } else if (isHoliday) {
                            cellClass =
                              "bg-orange-500/10 text-orange-500 border-orange-500/30";
                          }

                          return (
                            <motion.div
                              key={day}
                              initial={{ opacity: 0, scale: 0.65 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                duration: 0.25,
                                delay: i * 0.008,
                                type: "spring",
                                stiffness: 350,
                                damping: 22,
                              }}
                              title={isHoliday ? holidayReason : undefined}
                              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium border ${cellClass}`}
                            >
                              <span>{i + 1}</span>
                              {status && (
                                <span className="text-[10px] leading-none mt-0.5">
                                  {STATUS_LABEL[status]}
                                </span>
                              )}
                              {/* Show holiday badge — if attendance also exists, show small H dot below */}
                              {isHoliday && !status && (
                                <span className="text-[9px] leading-none mt-0.5 font-semibold">
                                  HOL
                                </span>
                              )}
                              {isHoliday && status && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-0.5"
                                  title={holidayReason}
                                />
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-3 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-success/20 border border-success/40" />
                        <span>Present (P)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40" />
                        <span>Absent (A)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-warning/20 border border-warning/40" />
                        <span>Half Day (H)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-orange-500/20 border border-orange-500/40" />
                        <span>Holiday</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Holidays this month list */}
                {holidaysThisMonth.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="mt-4"
                  >
                    <Card className="rounded-xl border-orange-500/20">
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-sm flex items-center gap-2 text-orange-500">
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          Holidays This Month
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-2">
                          {holidaysThisMonth.map((h, idx) => {
                            const [, , dd] = h.date.split("-");
                            const dayNum = Number.parseInt(dd, 10);
                            const dateObj = new Date(
                              Number(selectedYear),
                              Number(selectedMonth) - 1,
                              dayNum,
                            );
                            const dayName = dateObj.toLocaleDateString(
                              "en-IN",
                              {
                                weekday: "short",
                              },
                            );
                            return (
                              <motion.div
                                key={h.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.22,
                                  delay: idx * 0.05,
                                }}
                                className="flex items-center justify-between py-1.5 border-b last:border-0"
                                data-ocid={`employee.holiday.item.${idx + 1}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                  <span className="text-sm font-medium">
                                    {h.reason}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {dayName}, {dayNum}{" "}
                                  {MONTHS[Number(selectedMonth) - 1].slice(
                                    0,
                                    3,
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
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
                  {[
                    {
                      label: "Monthly Salary",
                      value: fmtCurrency(monthlySalary),
                      cls: "",
                    },
                    {
                      label: "Daily Rate",
                      value: fmtCurrency(Math.round(dailyRate)),
                      cls: "",
                    },
                    {
                      label: "Days Present",
                      value: `${presentDays}`,
                      cls: "",
                      sub: halfDays > 0 ? `(${halfDays} half)` : undefined,
                    },
                    {
                      label: "Total Earned",
                      value: fmtCurrency(Math.round(earned)),
                      cls: "text-success",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.07 }}
                    >
                      <Card className="rounded-xl">
                        <CardContent className="pt-4 pb-4">
                          <div className="text-xs text-muted-foreground mb-1">
                            {item.label}
                          </div>
                          <div className={`font-bold text-lg ${item.cls}`}>
                            {item.value}
                            {item.sub && (
                              <span className="text-xs text-muted-foreground font-normal ml-1">
                                {item.sub}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card className="rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Payment Summary
                      </CardTitle>
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
                        <span className="text-muted-foreground">
                          Total Paid
                        </span>
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
                </motion.div>
                {payments.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Card className="rounded-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Payment History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {payments.map((p, idx) => (
                            <motion.div
                              key={p.id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.25, delay: idx * 0.05 }}
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
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
