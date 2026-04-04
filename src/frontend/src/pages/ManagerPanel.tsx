import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BarChart3,
  CalendarCheck,
  CalendarX2,
  CheckCircle2,
  ChevronLeft,
  DollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  Users,
} from "lucide-react";
import { useState } from "react";
import AttendanceReport from "./manager/AttendanceReport";
import Dashboard from "./manager/Dashboard";
import EmployeeList from "./manager/EmployeeList";
import HolidayManager from "./manager/HolidayManager";
import MarkAttendance from "./manager/MarkAttendance";
import MonthlyReport from "./manager/MonthlyReport";
import SalaryReport from "./manager/SalaryReport";

export type ManagerTab =
  | "dashboard"
  | "employees"
  | "attendance"
  | "monthly"
  | "salary"
  | "holidays"
  | "attendancereport";

const NAV_ITEMS: { id: ManagerTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  { id: "employees", label: "Employees", icon: <Users className="w-5 h-5" /> },
  {
    id: "attendance",
    label: "Mark Attendance",
    icon: <CalendarCheck className="w-5 h-5" />,
  },
  {
    id: "monthly",
    label: "Monthly Report",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: "attendancereport",
    label: "Attendance Report",
    icon: <FileText className="w-5 h-5" />,
  },
  { id: "salary", label: "Salary", icon: <DollarSign className="w-5 h-5" /> },
  {
    id: "holidays",
    label: "Holidays",
    icon: <CalendarX2 className="w-5 h-5" />,
  },
];

function SidebarContent({
  active,
  onSelect,
  onBack,
}: {
  active: ManagerTab;
  onSelect: (t: ManagerTab) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">AttendPro</span>
        </div>
        <p className="text-xs text-[oklch(0.55_0.04_240)] ml-10">
          Manager Portal
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-ocid={`manager.nav.${item.id}`}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active === item.id
                ? "bg-primary text-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button
          type="button"
          data-ocid="manager.back_button"
          onClick={onBack}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[oklch(0.55_0.04_240)] hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    </div>
  );
}

export default function ManagerPanel({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<ManagerTab>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (tab: ManagerTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const activeLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? "";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col border-r border-border">
        <SidebarContent
          active={activeTab}
          onSelect={setActiveTab}
          onBack={onBack}
        />
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-ocid="manager.menu_button"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-60">
              <SidebarContent
                active={activeTab}
                onSelect={handleSelect}
                onBack={onBack}
              />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-base">AttendPro</span>
          </div>
          <span className="ml-auto text-sm text-muted-foreground">
            {activeLabel}
          </span>
        </header>

        <main className="flex-1 overflow-auto">
          {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === "employees" && <EmployeeList />}
          {activeTab === "attendance" && <MarkAttendance />}
          {activeTab === "monthly" && <MonthlyReport />}
          {activeTab === "attendancereport" && <AttendanceReport />}
          {activeTab === "salary" && <SalaryReport />}
          {activeTab === "holidays" && <HolidayManager />}
        </main>
      </div>
    </div>
  );
}
