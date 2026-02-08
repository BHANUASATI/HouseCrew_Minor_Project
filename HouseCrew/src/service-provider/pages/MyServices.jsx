import ServiceProviderLayout from "../ServiceProviderLayout";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from "react-icons/fa";
import { useState } from "react";

export default function MyServices() {
  const [services, setServices] = useState([
    {
      id: 1,
      title: "Home Cleaning",
      description: "Professional home cleaning services",
      price: 1200,
      duration: "2-3 hours",
      category: "Cleaning",
      status: "active",
      image: "/api/placeholder/640/480/cleaning"
    },
    {
      id: 2,
      title: "Plumbing Repair",
      description: "Expert plumbing repair and installation",
      price: 800,
      duration: "1-2 hours",
      category: "Repair",
      status: "active",
      image: "/api/placeholder/640/480/plumbing"
    },
    {
      id: 3,
      title: "Electrical Work",
      description: "Complete electrical solutions",
      price: 1500,
      duration: "2-4 hours",
      category: "Electrical",
      status: "inactive",
      image: "/api/placeholder/640/480/electrical"
    },
    {
      id: 4,
      title: "Gardening",
      description: "Professional gardening and landscaping",
      price: 600,
      duration: "3-4 hours",
      category: "Outdoor",
      status: "active",
      image: "/api/placeholder/640/480/gardening"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === "all" || service.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  return (
    <ServiceProviderLayout>
      {/* HEADER */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6
        bg-gradient-to-r from-purple-600 to-pink-500
        bg-clip-text text-transparent"
      >
        My Services
      </motion.h2>

      {/* MAIN CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10
        border border-slate-200 shadow-lg"
      >
        {/* SEARCH AND FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Repair">Repair</option>
            <option value="Electrical">Electrical</option>
            <option value="Outdoor">Outdoor</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Add Service
          </motion.button>
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* SERVICE IMAGE */}
              <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <div className="text-4xl text-purple-600">
                  {service.category === "Cleaning" && "🧹"}
                  {service.category === "Repair" && "🔧"}
                  {service.category === "Electrical" && "⚡"}
                  {service.category === "Outdoor" && "🌿"}
                </div>
              </div>

              {/* SERVICE DETAILS */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{service.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    service.status === "active" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {service.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>💰 ₹{service.price}</span>
                  <span>⏱️ {service.duration}</span>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <FaEdit className="text-xs" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <FaTrash className="text-xs" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        )}
      </motion.div>
    </ServiceProviderLayout>
  );
}
