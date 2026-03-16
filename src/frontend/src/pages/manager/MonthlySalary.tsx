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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianRupee, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAllPayments,
  useAttendanceByMonth,
  useEmployees,
  useRecordPayment,
} from "../../hooks/useQueries";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

interface PaymentDialogProps {
  employeeId: string;
  employeeName: string;
  balance: number;
  onClose: () => void;
}

function PaymentDialog({
  employeeId,
  employeeName,
  balance,
  onClose,
}: PaymentDialogProps) {
  const [amount, setAmount] = useState(String(balance > 0 ? balance : ""));
  const [note, setNote] = useState("");
  const recordMut = useRecordPayment();

  const handleRecord = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await recordMut.mutateAsync({ employeeId, amount: amt, note });
      toast.success(`₹${amt.toLocaleString()} paid to ${employeeName}`);
      onClose();
    } catch {
      toast.error("Failed to record payment");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent data-ocid="salary.payment.dialog" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Payment — {employeeName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Amount (₹) *</Label>
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-ocid="salary.payment.input"
            />
            {balance > 0 && (
              <p className="text-xs text-muted-foreground">
                Balance due: ₹{balance.toLocaleString()}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Note</Label>
            <Input
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              data-ocid="salary.payment.textarea"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="salary.payment.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRecord}
            disabled={recordMut.isPending}
            data-ocid="salary.payment.confirm_button"
          >
            {recordMut.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MonthlySalary() {
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  const [payingFor, setPayingFor] = useState<{
    id: string;
    name: string;
    balance: number;
  } | null>(null);

  const { data: employees = [] } = useEmployees();
  const { data: attendance = [], isLoading } = useAttendanceByMonth(
    year,
    month,
  );
  const { data: allPayments = [] } = useAllPayments();

  const years = Array.from({ length: 5 }, (_, i) =>
    String(now.getFullYear() - 2 + i),
  );

  const stats = employees.map((emp) => {
    const empAtt = attendance.filter(
      (a) => a.employeeId === emp.id && a.status === "present",
    );
    const present = empAtt.length;
    const dailyRate = Number(emp.dailyRate);
    const monthlySalary = dailyRate * 26;
    const grossSalary = present * dailyRate;
    const totalPaid = allPayments
      .filter((p) => p.employeeId === emp.id)
      .reduce((s, p) => s + Number(p.amount), 0);
    const balance = grossSalary - totalPaid;
    return {
      emp,
      present,
      dailyRate,
      monthlySalary,
      grossSalary,
      totalPaid,
      balance,
    };
  });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <IndianRupee className="w-4 h-4 text-primary" /> Monthly Salary
            Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-1">
              <Label>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
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
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Loading...
            </p>
          ) : employees.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-6"
              data-ocid="salary.empty_state"
            >
              No employees registered
            </p>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <Table data-ocid="salary.report.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Present</TableHead>
                    <TableHead className="text-right">Monthly Salary</TableHead>
                    <TableHead className="text-right">Daily Rate</TableHead>
                    <TableHead className="text-right">Total Salary</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map(
                    (
                      {
                        emp,
                        present,
                        dailyRate,
                        monthlySalary,
                        grossSalary,
                        totalPaid,
                        balance,
                      },
                      i,
                    ) => (
                      <TableRow
                        key={emp.id}
                        data-ocid={`salary.report.row.${i + 1}`}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {emp.id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {present}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          ₹{monthlySalary.toLocaleString()}/mo
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          ₹{dailyRate.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          <div>
                            <p>₹{grossSalary.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {present} × ₹{dailyRate.toLocaleString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-blue-600">
                          ₹{totalPaid.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`text-right text-sm font-semibold ${
                            balance > 0 ? "text-orange-600" : "text-green-600"
                          }`}
                        >
                          ₹{balance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2"
                            data-ocid="salary.record_payment_button"
                            onClick={() =>
                              setPayingFor({
                                id: emp.id,
                                name: emp.name,
                                balance,
                              })
                            }
                          >
                            <Plus className="w-3 h-3 mr-1" /> Pay
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {payingFor && (
        <PaymentDialog
          employeeId={payingFor.id}
          employeeName={payingFor.name}
          balance={payingFor.balance}
          onClose={() => setPayingFor(null)}
        />
      )}
    </div>
  );
}
