import { motion } from "framer-motion";

export default function QuickAction({ icon, label, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative cursor-pointer group overflow-hidden
        bg-gradient-to-br from-blue-500 to-blue-600
        border border-gray-200 dark:border-gray-700
        rounded-xl shadow-lg hover:shadow-xl
        transition-all duration-300
        hover:-translate-y-1
        w-full h-full"
    >
      {/* CARD CONTENT */}
      <div className="p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center min-h-[100px] sm:min-h-[120px] lg:min-h-[140px]">
        <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 lg:mb-4 drop-shadow-lg">{icon}</div>
        <p className="font-bold text-sm sm:text-base lg:text-lg text-center tracking-wide text-white">{label}</p>
      </div>
    </motion.div>
  );
}
