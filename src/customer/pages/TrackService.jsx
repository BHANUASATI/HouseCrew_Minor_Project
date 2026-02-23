import CustomerLayout from "../CustomerLayout";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaUserCog,
  FaCar,
  FaTools,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";

/* TRACK STEPS */
const steps = [
  {
    title: "Service Requested",
    icon: <FaCheckCircle />,
    active: true,
  },
  {
    title: "Technician Assigned",
    icon: <FaUserCog />,
    active: true,
  },
  {
    title: "On the Way",
    icon: <FaCar />,
    active: true,
  },
  {
    title: "Service In Progress",
    icon: <FaTools />,
    active: false,
  },
];

export default function TrackService() {
  return (
    <CustomerLayout>
      {/* HEADER */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6
        bg-gradient-to-r from-indigo-600 to-sky-500
        bg-clip-text text-transparent"
      >
        Track Your Service
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* LEFT – TIMELINE */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-lg">
          <h3 className="font-bold text-slate-700 mb-4 sm:mb-6 text-base sm:text-lg">
            Service Progress
          </h3>

          <div className="relative">
            {/* VERTICAL LINE */}
            <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-0.5 sm:w-1 bg-slate-200 rounded-full" />

            <div className="space-y-6 sm:space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="flex items-start gap-3 sm:gap-4"
                >
                  {/* ICON */}
                  <div
                    className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white
                    ${
                      step.active
                        ? "bg-gradient-to-r from-indigo-600 to-sky-500 shadow-lg"
                        : "bg-slate-300"
                    }`}
                  >
                    <div className="text-sm sm:text-base">{step.icon}</div>
                  </div>

                  {/* TEXT */}
                  <div className="flex-1">
                    <p
                      className={`font-semibold text-sm sm:text-base
                      ${
                        step.active
                          ? "text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {step.active
                        ? "Completed"
                        : "Pending"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT – TECHNICIAN CARD */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-lg">
          <h3 className="font-bold text-slate-700 mb-3 sm:mb-4 text-base sm:text-lg">
            Technician Details
          </h3>

          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl sm:text-2xl">
              <FaUserCog />
            </div>

            <div>
              <p className="font-semibold text-slate-700 text-sm sm:text-base">
                Rahul Sharma
              </p>
              <p className="text-xs sm:text-sm text-slate-500">
                Plumbing Expert
              </p>
            </div>
          </div>

          {/* ETA */}
          <div className="space-y-3">
            <InfoRow
              icon={<FaClock />}
              label="Estimated Arrival"
              value="15 mins"
            />
            <InfoRow
              icon={<FaMapMarkerAlt />}
              label="Distance Away"
              value="3.2 km"
            />
          </div>

          {/* MAP PLACEHOLDER */}
          <div className="mt-4 h-32 sm:h-40 rounded-xl border border-dashed border-indigo-300
            flex items-center justify-center text-indigo-400 bg-indigo-50 text-xs sm:text-sm">
            🗺️ Live map tracking will appear here
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

/* 🔹 INFO ROW */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-xs sm:text-sm">
      <span className="flex items-center gap-2 text-slate-600">
        <span className="text-indigo-500 text-sm sm:text-base">{icon}</span>
        <span className="text-xs sm:text-sm">{label}</span>
      </span>
      <span className="font-semibold text-slate-700 text-xs sm:text-sm">
        {value}
      </span>
    </div>
  );
}
