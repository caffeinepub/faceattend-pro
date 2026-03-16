import {
  ArrowLeft,
  BarChart3,
  CalendarOff,
  IndianRupee,
  Menu,
  ScanFace,
  UserPlus,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import HolidayManager from "./manager/HolidayManager";
import MarkAttendance from "./manager/MarkAttendance";
import MonthlyAttendance from "./manager/MonthlyAttendance";
import MonthlySalary from "./manager/MonthlySalary";
import RegisterEmployee from "./manager/RegisterEmployee";

type Tab = "register" | "attendance" | "holiday" | "monthly" | "salary";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  shortLabel: string;
}[] = [
  {
    id: "register",
    label: "Register Employee",
    shortLabel: "Register",
    icon: <UserPlus className="w-4 h-4" />,
  },
  {
    id: "attendance",
    label: "Mark Attendance",
    shortLabel: "Attendance",
    icon: <ScanFace className="w-4 h-4" />,
  },
  {
    id: "holiday",
    label: "Holiday",
    shortLabel: "Holiday",
    icon: <CalendarOff className="w-4 h-4" />,
  },
  {
    id: "monthly",
    label: "Monthly Attendance",
    shortLabel: "Monthly",
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    id: "salary",
    label: "Monthly Salary",
    shortLabel: "Salary",
    icon: <IndianRupee className="w-4 h-4" />,
  },
];

interface Props {
  onBack: () => void;
}

export default function ManagerPanel({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("register");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-base flex-1">
          Manager Panel
        </h1>
        <button
          type="button"
          className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </header>

      <div className="flex flex-1 relative">
        <aside className="hidden lg:flex flex-col w-56 bg-sidebar text-sidebar-foreground min-h-full pt-4 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid="manager.nav_tab"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all mx-2 rounded-lg mb-1 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black z-20"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="lg:hidden fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground z-30 pt-16 flex flex-col"
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    data-ocid="manager.nav_tab"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all mx-2 rounded-lg mb-1 ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-auto">
          <div className="p-4 max-w-4xl mx-auto">
            <div className="mb-4 flex items-center gap-2">
              {current.icon}
              <h2 className="font-display font-bold text-xl">
                {current.label}
              </h2>
            </div>
            <div className="lg:hidden flex gap-1 overflow-x-auto pb-2 mb-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  data-ocid="manager.nav_tab"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {tab.icon}
                  {tab.shortLabel}
                </button>
              ))}
            </div>

            {activeTab === "register" && <RegisterEmployee />}
            {activeTab === "attendance" && <MarkAttendance />}
            {activeTab === "holiday" && <HolidayManager />}
            {activeTab === "monthly" && <MonthlyAttendance />}
            {activeTab === "salary" && <MonthlySalary />}
          </div>
        </main>
      </div>
    </div>
  );
}
