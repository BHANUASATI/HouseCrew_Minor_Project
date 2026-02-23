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
  color = "bg-indigo-600"
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

  // SPARKLINE PATH
  const sparkPath = sparkData
    .map((v, i) => `${(i / (sparkData.length - 1)) * 100},${40 - v}`)
    .join(" ");

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer group overflow-hidden
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-xl shadow-lg hover:shadow-xl
        transition-all duration-300
        hover:-translate-y-1
        w-full h-full"
    >
      {/* CARD CONTENT */}
      <div className="p-3 sm:p-4 lg:p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            {title}
          </p>

          {/* TREND BADGE */}
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              trend === "up"
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                : "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700"
            }`}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
        </div>

        {/* VALUE + ICON */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <motion.h3
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white leading-tight"
            >
              {String(value).includes("₹") ? `₹${count}` : count}
            </motion.h3>
          </div>

          {icon && (
            <motion.div
              whileHover={{ rotate: 12, scale: 1.2 }}
              className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-xl
              ${color} text-white text-lg sm:text-xl lg:text-2xl shadow-lg`}
            >
              {icon}
            </motion.div>
          )}
        </div>

        {/* 📉 SPARKLINE */}
        <div className="h-8 sm:h-10 lg:h-12">
          <svg
            viewBox="0 0 100 40"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <polyline
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              points={sparkPath}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
