import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function StatCard({
  title,
  value,
  icon,
  trend = "up", // "up" | "down"
  trendValue = "12%",
  sparkData = [10, 20, 15, 30, 25, 40],
  onClick,
}) {
  const [count, setCount] = useState(0);

  // 🔢 COUNT UP ANIMATION
  useEffect(() => {
    let start = 0;
    const end = Number(String(value).replace(/[^\d]/g, ""));
    if (!end) return;

    const duration = 900;
    const stepTime = Math.max(Math.floor(duration / end), 20);

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  // 📈 SPARKLINE PATH
  const sparkPath = sparkData
    .map((v, i) => `${(i / (sparkData.length - 1)) * 100},${40 - v}`)
    .join(" ");

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="relative cursor-pointer group rounded-2xl overflow-hidden"
    >
      {/* 🌈 GLOW RING */}
      <div
        className={`absolute inset-0 rounded-2xl blur-xl opacity-30
        ${
          trend === "up"
            ? "bg-gradient-to-r from-indigo-400 to-cyan-400"
            : "bg-gradient-to-r from-rose-400 to-orange-400"
        }
        group-hover:opacity-60 transition`}
      />

      {/* CARD */}
      <div
        className="relative z-10 p-6 rounded-2xl
        bg-white/80 dark:bg-slate-900/80
        backdrop-blur-xl border border-white/30 dark:border-slate-700
        shadow-[0_20px_40px_rgba(0,0,0,0.08)]
        dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>

          {/* TREND BADGE */}
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full
            ${
              trend === "up"
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
            }`}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
        </div>

        {/* VALUE + ICON */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h3
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-3xl font-extrabold text-slate-800 dark:text-white"
            >
              {String(value).includes("₹") ? `₹${count}` : count}
            </motion.h3>
          </div>

          {icon && (
            <motion.div
              whileHover={{ rotate: 8, scale: 1.15 }}
              className={`w-12 h-12 flex items-center justify-center rounded-xl
              ${
                trend === "up"
                  ? "bg-gradient-to-br from-indigo-500 to-cyan-500"
                  : "bg-gradient-to-br from-rose-500 to-orange-500"
              }
              text-white text-xl shadow-lg`}
            >
              {icon}
            </motion.div>
          )}
        </div>

        {/* 📉 SPARKLINE */}
        <svg
          viewBox="0 0 100 40"
          className="mt-4 w-full h-10"
          preserveAspectRatio="none"
        >
          <polyline
            fill="none"
            stroke={trend === "up" ? "#22d3ee" : "#fb7185"}
            strokeWidth="3"
            points={sparkPath}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}
