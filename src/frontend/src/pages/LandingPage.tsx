import { ArrowRight, Building2, CheckCircle2, User } from "lucide-react";
import { motion } from "motion/react";
import type { AppView } from "../App";

interface Props {
  onNavigate: (view: AppView) => void;
}

export default function LandingPage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.025_240)] via-[oklch(0.18_0.04_250)] to-[oklch(0.12_0.02_230)] flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-white font-display font-bold text-xl">
            AttendPro
          </span>
        </div>
        <span className="text-[oklch(0.65_0.04_240)] text-sm hidden sm:block">
          Professional HR Management
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[oklch(0.52_0.18_160/0.15)] border border-[oklch(0.52_0.18_160/0.3)] text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Attendance &amp; Salary Management
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 leading-tight">
            Smart Attendance,
            <br />
            <span className="text-primary">Simplified Payroll</span>
          </h1>
          <p className="text-[oklch(0.65_0.04_240)] text-lg max-w-lg mx-auto">
            A complete HR solution to manage employee attendance, track
            holidays, and calculate salaries with ease.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl"
        >
          <button
            type="button"
            data-ocid="landing.manager_button"
            onClick={() => onNavigate("manager")}
            className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-2xl p-8 text-left transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-5 group-hover:bg-primary/30 transition-colors">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-white font-display font-bold text-xl mb-2">
              Manager Portal
            </h2>
            <p className="text-[oklch(0.65_0.04_240)] text-sm leading-relaxed">
              Manage employees, mark attendance, track holidays, and process
              salary payments.
            </p>
            <div className="flex items-center gap-1.5 mt-5 text-primary text-sm font-medium">
              Enter Portal{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            type="button"
            data-ocid="landing.employee_button"
            onClick={() => onNavigate("employee")}
            className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[oklch(0.6_0.18_210/0.5)] rounded-2xl p-8 text-left transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[oklch(0.6_0.18_210/0.2)] border border-[oklch(0.6_0.18_210/0.3)] flex items-center justify-center mb-5 group-hover:bg-[oklch(0.6_0.18_210/0.3)] transition-colors">
              <User className="w-6 h-6 text-[oklch(0.65_0.18_210)]" />
            </div>
            <h2 className="text-white font-display font-bold text-xl mb-2">
              Employee Portal
            </h2>
            <p className="text-[oklch(0.65_0.04_240)] text-sm leading-relaxed">
              View your attendance records, check salary slips, and track your
              monthly earnings.
            </p>
            <div className="flex items-center gap-1.5 mt-5 text-[oklch(0.65_0.18_210)] text-sm font-medium">
              Enter Portal{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap justify-center gap-3 mt-10"
        >
          {[
            "Real-time Attendance",
            "Salary Calculator",
            "Holiday Management",
            "Instant Reports",
          ].map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[oklch(0.7_0.04_240)] text-xs"
            >
              {f}
            </span>
          ))}
        </motion.div>
      </main>

      <footer className="text-center py-5 text-[oklch(0.45_0.03_240)] text-xs">
        &copy; {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="hover:text-[oklch(0.65_0.03_240)] transition-colors"
          target="_blank"
          rel="noreferrer"
        >
          Built with &hearts; using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
