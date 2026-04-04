import { ArrowRight, Building2, Eye, EyeOff, Lock, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { AppView } from "../App";

interface Props {
  onNavigate: (view: AppView) => void;
}

const MANAGER_PASSWORD = "pavithra@123";

const ORBS = [
  {
    top: "8%",
    left: "12%",
    size: 320,
    color: "oklch(0.52 0.18 160 / 0.07)",
    delay: 0,
    duration: 8,
  },
  {
    top: "60%",
    left: "75%",
    size: 400,
    color: "oklch(0.6 0.18 210 / 0.06)",
    delay: 1.5,
    duration: 10,
  },
  {
    top: "40%",
    left: "5%",
    size: 260,
    color: "oklch(0.55 0.15 280 / 0.05)",
    delay: 0.8,
    duration: 9,
  },
  {
    top: "75%",
    left: "30%",
    size: 350,
    color: "oklch(0.52 0.18 160 / 0.05)",
    delay: 2,
    duration: 11,
  },
  {
    top: "15%",
    left: "65%",
    size: 280,
    color: "oklch(0.6 0.12 200 / 0.06)",
    delay: 0.3,
    duration: 7,
  },
  {
    top: "50%",
    left: "50%",
    size: 500,
    color: "oklch(0.52 0.18 160 / 0.04)",
    delay: 1,
    duration: 12,
  },
];

export default function LandingPage({ onNavigate }: Props) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleManagerClick() {
    setShowPasswordModal(true);
    setPassword("");
    setError("");
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === MANAGER_PASSWORD) {
      setShowPasswordModal(false);
      onNavigate("manager");
    } else {
      setError("Incorrect password. Please try again.");
    }
  }

  const titleWords = ["PE", "Office", "Management"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.025_240)] via-[oklch(0.18_0.04_250)] to-[oklch(0.12_0.02_230)] flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Floating Orbs */}
      {ORBS.map((orb) => (
        <motion.div
          key={`${orb.top}-${orb.left}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: orb.color,
            filter: "blur(60px)",
            transform: "translate(-50%, -50%)",
          }}
          animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }}
          transition={{
            duration: orb.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 relative z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center"
          >
            <Building2 className="w-6 h-6 text-primary" />
          </motion.div>
        </div>
        <div className="flex items-center justify-center flex-wrap gap-2">
          {titleWords.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.15 + i * 0.12,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="text-3xl md:text-4xl font-display font-bold text-white"
            >
              {word}
            </motion.span>
          ))}
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-4 mx-auto w-48"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl relative z-10"
      >
        <motion.button
          type="button"
          data-ocid="landing.manager_button"
          onClick={handleManagerClick}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.35,
            type: "spring",
            stiffness: 260,
            damping: 22,
          }}
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.97 }}
          className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-2xl p-8 text-left transition-colors duration-200 cursor-pointer relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, oklch(0.52 0.18 160 / 0.08), transparent 70%)",
            }}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="relative z-10">
            <motion.div
              className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-5"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Building2 className="w-6 h-6 text-primary" />
            </motion.div>
            <h2 className="text-white font-display font-bold text-xl mb-0">
              Manager Portal
            </h2>
            <div className="flex items-center gap-1.5 mt-4 text-primary text-sm font-medium">
              Enter Portal
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </div>
          </div>
        </motion.button>

        <motion.button
          type="button"
          data-ocid="landing.employee_button"
          onClick={() => onNavigate("employee")}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.48,
            type: "spring",
            stiffness: 260,
            damping: 22,
          }}
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.97 }}
          className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[oklch(0.6_0.18_210/0.5)] rounded-2xl p-8 text-left transition-colors duration-200 cursor-pointer relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, oklch(0.6 0.18 210 / 0.08), transparent 70%)",
            }}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="relative z-10">
            <motion.div
              className="w-12 h-12 rounded-xl bg-[oklch(0.6_0.18_210/0.2)] border border-[oklch(0.6_0.18_210/0.3)] flex items-center justify-center mb-5"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <User className="w-6 h-6 text-[oklch(0.65_0.18_210)]" />
            </motion.div>
            <h2 className="text-white font-display font-bold text-xl mb-0">
              Employee Portal
            </h2>
            <div className="flex items-center gap-1.5 mt-4 text-[oklch(0.65_0.18_210)] text-sm font-medium">
              Enter Portal
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowPasswordModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="bg-[oklch(0.18_0.03_240)] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-white font-display font-bold text-lg">
                  Manager Access
                </h2>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[oklch(0.45_0.03_240)] focus:outline-none focus:border-primary/50 transition-all pr-12"
                    // biome-ignore lint: autofocus is desired here
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.5_0.03_240)] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-[oklch(0.65_0.04_240)] hover:bg-white/5 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.96 }}
                    className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-colors"
                  >
                    Enter
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
