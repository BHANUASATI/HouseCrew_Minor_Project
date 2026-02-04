import { motion } from "framer-motion";

export default function QuickAction({ icon, label }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-cyan-600 text-white rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer shadow"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <p className="font-medium">{label}</p>
    </motion.div>
  );
}
