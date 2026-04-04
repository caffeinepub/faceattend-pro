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
import { AnimatePresence, motion } from "motion/react";
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-5 py-5 border-b border-sidebar-border"
      >
        <div className="flex items-center gap-2 mb-1">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"
          >
            <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          <span className="font-display font-bold text-lg">AttendPro</span>
        </div>
        <p className="text-xs text-[oklch(0.55_0.04_240)] ml-10">
          Manager Portal
        </p>
      </motion.div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 + index * 0.055 }}
            className="relative"
          >
            {active === item.id && (
              <motion.div
                layoutId="activeNavPill"
                className="absolute inset-0 bg-primary rounded-lg"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <button
              key={item.id}
              type="button"
              data-ocid={`manager.nav.${item.id}`}
              onClick={() => onSelect(item.id)}
              className={`relative z-10 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active === item.id
                  ? "text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          </motion.div>
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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              {activeTab === "dashboard" && (
                <Dashboard onNavigate={setActiveTab} />
              )}
              {activeTab === "employees" && <EmployeeList />}
              {activeTab === "attendance" && <MarkAttendance />}
              {activeTab === "monthly" && <MonthlyReport />}
              {activeTab === "attendancereport" && <AttendanceReport />}
              {activeTab === "salary" && <SalaryReport />}
              {activeTab === "holidays" && <HolidayManager />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
