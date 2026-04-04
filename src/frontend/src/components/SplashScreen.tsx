import { Building2 } from "lucide-react";
import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";

interface Props {
  onComplete: () => void;
}

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: `particle-${i}`,
  width: 3 + (i % 6) * 2.5,
  height: 3 + (i % 6) * 2.5,
  left: `${(i * 4.17 + 2) % 100}%`,
  top: `${(i * 7.5 + 5) % 100}%`,
  color:
    i % 4 === 0
      ? "oklch(0.52 0.18 160 / 0.35)"
      : i % 4 === 1
        ? "oklch(0.6 0.18 210 / 0.25)"
        : i % 4 === 2
          ? "oklch(0.55 0.1 200 / 0.2)"
          : "oklch(0.65 0.15 240 / 0.2)",
  yDist: -(18 + (i % 8) * 6),
  duration: 3.5 + (i % 5),
  delay: (i * 0.21) % 2.5,
}));

const ORBIT_DOTS = Array.from({ length: 8 }, (_, i) => ({
  id: `dot-${i}`,
  angle: (i / 8) * 360,
}));

export default function SplashScreen({ onComplete }: Props) {
  const [scope] = useAnimate();

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      ref={scope}
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "oklch(0.13 0.025 240)" }}
    >
      {/* Animated background grid */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.52 0.18 160 / 0.04) 1px, transparent 1px), linear-gradient(90deg, oklch(0.52 0.18 160 / 0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.width,
              height: p.height,
              left: p.left,
              top: p.top,
              background: p.color,
            }}
            animate={{
              y: [0, p.yDist, 0],
              opacity: [0.15, 0.7, 0.15],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Radial glow */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.52 0.18 160 / 0.1), transparent 70%)",
          }}
          animate={{ opacity: [0, 1, 0.8] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8">
        {/* Icon with orbit */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-8 relative"
        >
          {/* Orbit ring */}
          <motion.div
            className="absolute inset-0 m-[-28px]"
            animate={{ rotate: 360 }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {ORBIT_DOTS.map((dot) => (
              <motion.div
                key={dot.id}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: "oklch(0.52 0.18 160 / 0.7)",
                  top: `calc(50% + ${Math.sin((dot.angle * Math.PI) / 180) * 64}px - 4px)`,
                  left: `calc(50% + ${Math.cos((dot.angle * Math.PI) / 180) * 64}px - 4px)`,
                  boxShadow: "0 0 6px oklch(0.52 0.18 160 / 0.8)",
                }}
                animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: (dot.angle / 360) * 1.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>

          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.52 0.18 160 / 0.25), oklch(0.52 0.18 160 / 0.1))",
              border: "1.5px solid oklch(0.52 0.18 160 / 0.4)",
              boxShadow:
                "0 0 40px oklch(0.52 0.18 160 / 0.25), 0 0 80px oklch(0.52 0.18 160 / 0.1)",
            }}
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Building2
                style={{ color: "oklch(0.7 0.18 160)", width: 44, height: 44 }}
              />
            </motion.div>

            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{ border: "1.5px solid oklch(0.52 0.18 160 / 0.5)" }}
              animate={{ scale: [1, 1.22, 1], opacity: [0.6, 0, 0.6] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            />
          </div>
        </motion.div>

        {/* Welcome to */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ color: "oklch(0.6 0.08 200)", letterSpacing: "0.15em" }}
          className="text-sm font-medium uppercase mb-2"
        >
          Welcome to
        </motion.p>

        {/* PE Office Management */}
        <div className="overflow-hidden mb-3">
          {["PE Office", "Management"].map((line, lineIdx) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.65 + lineIdx * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{
                color: lineIdx === 0 ? "white" : "oklch(0.65 0.18 160)",
              }}
            >
              {line}
            </motion.div>
          ))}
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.05 }}
          style={{ color: "oklch(0.55 0.05 230)" }}
          className="text-sm tracking-wide mb-12"
        >
          Attendance &amp; Salary Management System
        </motion.p>

        {/* Progress bar with shimmer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.3 }}
          className="w-56 md:w-72"
        >
          <div
            className="h-1.5 rounded-full overflow-hidden relative"
            style={{ background: "oklch(0.25 0.03 240)" }}
          >
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.52 0.18 160), oklch(0.65 0.18 160))",
              }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.6, delay: 1.3, ease: "easeInOut" }}
            >
              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.4) 50%, transparent 100%)",
                  width: "40%",
                }}
                animate={{ x: ["-100%", "400%"] }}
                transition={{
                  duration: 1.2,
                  delay: 1.6,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 0.8,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.5 }}
            className="text-center text-xs mt-2"
            style={{ color: "oklch(0.4 0.03 240)" }}
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
