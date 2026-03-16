import { Building2, UserCheck } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onEmployee: () => void;
  onManager: () => void;
}

export default function LandingPage({ onEmployee, onManager }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-sidebar text-sidebar-foreground px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">
              AttendTrack Pro
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Smart Attendance Management
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
            Welcome to <span className="text-primary">AttendTrack</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Select your portal to continue. Employees can view attendance and
            salary. Managers can manage the full system.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              type="button"
              data-ocid="landing.employee_portal_button"
              onClick={onEmployee}
              className="w-full group bg-card border-2 border-border hover:border-primary rounded-2xl p-8 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <UserCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Employee Portal
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Login with your Employee ID to view your attendance records,
                salary details, and payment history.
              </p>
              <div className="mt-5 flex items-center gap-2 text-primary font-semibold text-sm">
                <span>View My Attendance</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button
              type="button"
              data-ocid="landing.manager_panel_button"
              onClick={onManager}
              className="w-full group bg-sidebar border-2 border-sidebar-border hover:border-primary rounded-2xl p-8 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl text-sidebar-foreground mb-2">
                Manager Panel
              </h3>
              <p className="text-sm text-sidebar-foreground/60 leading-relaxed">
                Register employees, mark attendance with face scan, manage
                holidays, and view salary reports.
              </p>
              <div className="mt-5 flex items-center gap-2 text-primary font-semibold text-sm">
                <span>Open Manager Panel</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </button>
          </motion.div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
