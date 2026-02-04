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
        className="text-3xl font-extrabold mb-6
        bg-gradient-to-r from-indigo-600 to-sky-500
        bg-clip-text text-transparent"
      >
        Track Your Service
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT – TIMELINE */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
          <h3 className="font-bold text-slate-700 mb-6">
            Service Progress
          </h3>

          <div className="relative">
            {/* VERTICAL LINE */}
            <div className="absolute left-5 top-0 bottom-0 w-1 bg-slate-200 rounded-full" />

            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="flex items-start gap-4"
                >
                  {/* ICON */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white
                    ${
                      step.active
                        ? "bg-gradient-to-r from-indigo-600 to-sky-500 shadow-lg"
                        : "bg-slate-300"
                    }`}
                  >
                    {step.icon}
                  </div>

                  {/* TEXT */}
                  <div>
                    <p
                      className={`font-semibold
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
          <h3 className="font-bold text-slate-700 mb-4">
            Technician Details
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl">
              <FaUserCog />
            </div>

            <div>
              <p className="font-semibold text-slate-700">
                Rahul Sharma
              </p>
              <p className="text-sm text-slate-500">
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
          <div className="mt-4 h-40 rounded-xl border border-dashed border-indigo-300
            flex items-center justify-center text-indigo-400 bg-indigo-50 text-sm">
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
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-slate-600">
        <span className="text-indigo-500">{icon}</span>
        {label}
      </span>
      <span className="font-semibold text-slate-700">
        {value}
      </span>
    </div>
  );
}
