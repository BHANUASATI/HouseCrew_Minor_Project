import CustomerLayout from "../CustomerLayout";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaTools,
  FaBolt,
  FaBroom,
  FaFan,
  FaPaintRoller,
  FaCamera,
  FaCalendarAlt,
  FaPaperPlane,
  FaMapMarkerAlt,
  FaCrosshairs,
} from "react-icons/fa";
import { useState } from "react";

/* SERVICES */
const services = [
  { name: "Tap Leakage", category: "Plumbing", icon: <FaTools /> },
  { name: "Pipe Installation", category: "Plumbing", icon: <FaTools /> },
  { name: "Switch Repair", category: "Electrical", icon: <FaBolt /> },
  { name: "Wiring Fix", category: "Electrical", icon: <FaBolt /> },
  { name: "Home Cleaning", category: "Cleaning", icon: <FaBroom /> },
  { name: "Bathroom Cleaning", category: "Cleaning", icon: <FaBroom /> },
  { name: "Ceiling Fan Repair", category: "Appliance", icon: <FaFan /> },
  { name: "Painting Work", category: "Painting", icon: <FaPaintRoller /> },
];

const categories = ["All", "Plumbing", "Electrical", "Cleaning", "Appliance", "Painting"];

export default function RequestService() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [selected, setSelected] = useState(null);

  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [error, setError] = useState("");

  const filtered = services.filter(
    (s) =>
      (activeCat === "All" || s.category === activeCat) &&
      s.name.toLowerCase().includes(query.toLowerCase())
  );

  /* 📍 REAL LOCATION FETCH */
  const getCurrentLocation = () => {
    setError("");
    setLoadingLoc(true);

    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      setLoadingLoc(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        setAddress("Location detected automatically");
        setLoadingLoc(false);
      },
      (err) => {
        setError("Location permission denied");
        setLoadingLoc(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <CustomerLayout>
      {/* HEADER */}
      <h2 className="text-3xl font-extrabold mb-6
        bg-gradient-to-r from-indigo-600 to-sky-500
        bg-clip-text text-transparent">
        Request a Service
      </h2>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">

        {/* SEARCH */}
        <div className="relative mb-5">
          <FaSearch className="absolute left-4 top-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search service (tap repair, fan, cleaning...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 p-4 rounded-xl
            bg-slate-100 border border-slate-200
            focus:bg-white focus:ring-2 focus:ring-indigo-400
            outline-none text-slate-700"
          />
        </div>

        {/* CATEGORY */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold
              ${
                activeCat === cat
                  ? "bg-gradient-to-r from-indigo-600 to-sky-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SERVICES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[260px] overflow-y-auto pr-2">
          {filtered.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04 }}
              onClick={() => setSelected(s.name)}
              className={`cursor-pointer p-4 rounded-xl border
              ${
                selected === s.name
                  ? "border-indigo-500 bg-indigo-50"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="text-xl mb-2 text-indigo-500">{s.icon}</div>
              <p className="font-semibold text-slate-700">{s.name}</p>
              <p className="text-xs text-slate-500">{s.category}</p>
            </motion.div>
          ))}
        </div>

        {/* 📍 LOCATION */}
        <div className="mt-8">
          <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <FaMapMarkerAlt className="text-indigo-500" />
            Service Location
          </h3>

          <button
            onClick={getCurrentLocation}
            className="flex items-center gap-2 mb-3 px-4 py-2 rounded-lg
            bg-indigo-100 text-indigo-700 font-semibold"
          >
            <FaCrosshairs />
            {loadingLoc ? "Detecting location..." : "Use My Current Location"}
          </button>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <textarea
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Or enter address manually (house, street, city)"
            className="w-full rounded-xl p-4
            bg-slate-100 border border-slate-200
            focus:bg-white focus:ring-2 focus:ring-indigo-400
            resize-none text-slate-700"
          />

          {/* 🗺️ REAL MAP */}
          {coords && (
            <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
              <iframe
                title="map"
                width="100%"
                height="250"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.01}%2C${coords.latitude - 0.01}%2C${coords.longitude + 0.01}%2C${coords.latitude + 0.01}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`}
              />
            </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="relative mt-6">
          <textarea
            rows="4"
            placeholder="Describe the problem (optional)"
            className="w-full rounded-xl p-4 pr-12
            bg-slate-100 border border-slate-200
            focus:bg-white focus:ring-2 focus:ring-indigo-400"
          />
          <FaCamera className="absolute right-4 top-4 text-slate-400" />
        </div>

        {/* DATE */}
        <div className="relative mt-4">
          <input
            type="date"
            className="w-full rounded-xl p-4
            bg-slate-100 border border-slate-200
            focus:bg-white focus:ring-2 focus:ring-indigo-400"
          />
          <FaCalendarAlt className="absolute right-4 top-4 text-slate-400" />
        </div>

        {/* SUBMIT */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-6 py-4 rounded-xl text-white font-bold
          bg-gradient-to-r from-indigo-600 to-sky-500 shadow-lg"
        >
          <FaPaperPlane className="inline mr-2" />
          Submit Request
        </motion.button>
      </div>
    </CustomerLayout>
  );
}
