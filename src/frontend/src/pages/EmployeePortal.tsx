import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarX,
  IndianRupee,
  UserCheck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { ExternalBlob } from "../backend";
import {
  useAttendanceByEmployee,
  useEmployee,
  usePaymentsByEmployee,
} from "../hooks/useQueries";

interface Props {
  onBack: () => void;
}

export default function EmployeePortal({ onBack }: Props) {
  const [inputId, setInputId] = useState("");
  const [loggedInId, setLoggedInId] = useState("");

  const { data: employee, isLoading: empLoading } = useEmployee(loggedInId);
  const { data: attendance = [] } = useAttendanceByEmployee(loggedInId);
  const { data: payments = [] } = usePaymentsByEmployee(loggedInId);

  const handleLogin = () => {
    if (inputId.trim()) setLoggedInId(inputId.trim());
  };

  const handleLogout = () => {
    setLoggedInId("");
    setInputId("");
  };

  const daysPresent = attendance.filter((a) => a.status === "present").length;
  const daysAbsent = attendance.filter((a) => a.status === "absent").length;
  const dailyRate = employee ? Number(employee.dailyRate) : 0;
  const monthlySalary = dailyRate * 26;
  const grossSalary = daysPresent * dailyRate;
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const balance = grossSalary - totalPaid;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={loggedInId ? handleLogout : onBack}
          data-ocid="employee.logout_button"
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-base">Employee Portal</h1>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {!loggedInId ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display font-bold text-2xl mb-1">
                Employee Login
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter your Employee ID to view your details
              </p>
            </div>
            <div className="w-full space-y-3">
              <Input
                data-ocid="employee.login_input"
                placeholder="Enter your Employee ID"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="text-center text-lg h-12"
              />
              <Button
                data-ocid="employee.login_button"
                onClick={handleLogin}
                disabled={!inputId.trim()}
                className="w-full h-12 text-base font-semibold"
              >
                View My Records
              </Button>
            </div>
          </div>
        ) : empLoading ? (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-28 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : !employee ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-destructive" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-bold text-lg">
                Employee Not Found
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                No employee found with ID: <strong>{loggedInId}</strong>
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="shrink-0">
                  {employee.faceImageKey ? (
                    <img
                      src={ExternalBlob.fromURL(
                        employee.faceImageKey,
                      ).getDirectURL()}
                      alt={employee.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg">
                    {employee.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {employee.department}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ID: {employee.id}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {employee.phone}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarCheck className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">
                      Days Present
                    </span>
                  </div>
                  <p className="font-display font-bold text-3xl text-green-700">
                    {daysPresent}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarX className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-medium text-red-700">
                      Days Absent
                    </span>
                  </div>
                  <p className="font-display font-bold text-3xl text-red-700">
                    {daysAbsent}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <IndianRupee className="w-4 h-4 text-primary" /> Salary
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    Monthly Salary
                  </span>
                  <span className="font-semibold">
                    ₹{monthlySalary.toLocaleString()}/month
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    Daily Rate
                  </span>
                  <span className="font-semibold">
                    ₹{dailyRate.toLocaleString()}/day
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    Days Present
                  </span>
                  <span className="font-semibold">{daysPresent} days</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    Total Salary Earned
                  </span>
                  <span className="font-semibold text-green-600">
                    ₹{grossSalary.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">
                    Total Paid
                  </span>
                  <span className="font-semibold text-blue-600">
                    ₹{totalPaid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 bg-primary/5 rounded-lg px-3">
                  <span className="text-sm font-semibold">Balance Due</span>
                  <span
                    className={`font-bold text-lg ${
                      balance > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    ₹{balance.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="w-4 h-4 text-primary" /> Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No payments recorded yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((p, i) => (
                      <div
                        key={p.id}
                        data-ocid={`employee.payment.item.${i + 1}`}
                        className="flex justify-between items-center p-3 bg-muted/40 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            ₹{Number(p.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {p.note}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(Number(p.paidAt)).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
