import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { DollarSign, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../../backend.d";
import {
  useAllPayments,
  useAttendanceByMonth,
  useEmployees,
  useRecordPayment,
} from "../../hooks/useQueries";

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

export default function SalaryReport() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [payDialog, setPayDialog] = useState<Employee | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const years = Array.from({ length: 3 }, (_, i) =>
    String(now.getFullYear() - i),
  );

  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const { data: attendance = [], isLoading: attLoading } = useAttendanceByMonth(
    selectedYear,
    selectedMonth,
  );
  const { data: payments = [], isLoading: payLoading } = useAllPayments();
  const recordMut = useRecordPayment();

  const report = useMemo(
    () =>
      employees.map((emp) => {
        const recs = attendance.filter((a) => a.employeeId === emp.id);
        const presentDays = recs.filter((a) => a.status === "present").length;
        const halfDays = recs.filter((a) => a.status === "halfday").length;
        const monthlySalary = Number(emp.monthlySalary);
        const dailyRate = monthlySalary / 26;
        const earned = (presentDays + halfDays * 0.5) * dailyRate;
        const paid = payments
          .filter((p) => p.employeeId === emp.id)
          .reduce((sum, p) => sum + Number(p.amount), 0);
        return {
          emp,
          presentDays,
          halfDays,
          monthlySalary,
          dailyRate,
          earned,
          paid,
          balance: earned - paid,
        };
      }),
    [employees, attendance, payments],
  );

  const openPayDialog = (emp: Employee) => {
    const row = report.find((r) => r.emp.id === emp.id);
    setPayAmount(row ? String(Math.round(row.balance)) : "");
    setPayNote("");
    setPayDialog(emp);
  };

  const handlePay = async () => {
    if (!payDialog) return;
    const amount = Number.parseFloat(payAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await recordMut.mutateAsync({
        employeeId: payDialog.id,
        amount,
        note: payNote || "Salary payment",
      });
      toast.success(`Payment of ${fmtCurrency(Math.round(amount))} recorded`);
      setPayDialog(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to record payment");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Salary Report</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Calculate and record salary payments
        </p>
      </div>
      <div className="flex gap-3">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-36" data-ocid="salary.month.select">
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
          <SelectTrigger className="w-28" data-ocid="salary.year.select">
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
      <Card className="rounded-xl">
        <CardHeader className="pb-3 flex flex-row items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">
            {MONTHS[Number(selectedMonth) - 1]} {selectedYear} Salary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {empLoading || attLoading || payLoading ? (
            <div className="p-6 space-y-3" data-ocid="salary.loading_state">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          ) : employees.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="salary.empty_state"
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
                    <th className="text-center px-3 py-3 font-semibold text-muted-foreground">
                      Days
                    </th>
                    <th className="text-right px-3 py-3 font-semibold text-muted-foreground hidden sm:table-cell">
                      Daily Rate
                    </th>
                    <th className="text-right px-3 py-3 font-semibold text-muted-foreground">
                      Earned
                    </th>
                    <th className="text-right px-3 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                      Paid
                    </th>
                    <th className="text-right px-3 py-3 font-semibold text-muted-foreground">
                      Balance
                    </th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {report.map((row, idx) => (
                    <tr
                      key={row.emp.id}
                      className="border-b last:border-0 hover:bg-muted/20"
                      data-ocid={`salary.item.${idx + 1}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {row.emp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{row.emp.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {row.emp.department}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-medium">{row.presentDays}</span>
                        {row.halfDays > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (+{row.halfDays}h)
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right text-muted-foreground hidden sm:table-cell">
                        {fmtCurrency(Math.round(row.dailyRate))}
                      </td>
                      <td className="px-3 py-3 text-right font-medium">
                        {fmtCurrency(Math.round(row.earned))}
                      </td>
                      <td className="px-3 py-3 text-right text-success font-medium hidden md:table-cell">
                        {fmtCurrency(row.paid)}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold">
                        <span
                          className={
                            row.balance > 0
                              ? "text-destructive"
                              : "text-success"
                          }
                        >
                          {fmtCurrency(Math.round(row.balance))}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          data-ocid={`salary.pay_button.${idx + 1}`}
                          size="sm"
                          variant={row.balance > 0 ? "default" : "outline"}
                          className="h-7 text-xs"
                          onClick={() => openPayDialog(row.emp)}
                        >
                          Pay
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!payDialog} onOpenChange={(o) => !o && setPayDialog(null)}>
        <DialogContent className="sm:max-w-sm" data-ocid="salary.pay.dialog">
          <DialogHeader>
            <DialogTitle>Record Salary Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {payDialog && (
              <p className="text-sm text-muted-foreground">
                Paying <strong>{payDialog.name}</strong>
              </p>
            )}
            <div className="space-y-1.5">
              <Label>Amount (₹)</Label>
              <Input
                data-ocid="salary.pay.amount.input"
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Note (optional)</Label>
              <Input
                data-ocid="salary.pay.note.input"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="Salary for March 2026"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayDialog(null)}
              data-ocid="salary.pay.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={recordMut.isPending}
              data-ocid="salary.pay.submit_button"
            >
              {recordMut.isPending && (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              )}{" "}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
