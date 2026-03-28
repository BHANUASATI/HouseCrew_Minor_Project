// Shared services definitions for HouseCrew
// This ensures consistency between customer dashboard and provider profiles

export const SERVICES = [
  { name: "Tap Leakage", category: "Plumbing", urgency: "medium" },
  { name: "Pipe Installation", category: "Plumbing", urgency: "low" },
  { name: "Blocked Drain", category: "Plumbing", urgency: "high" },
  { name: "Water Heater Repair", category: "Plumbing", urgency: "high" },
  { name: "Switch Repair", category: "Electrical", urgency: "medium" },
  { name: "Wiring Fix", category: "Electrical", urgency: "high" },
  { name: "Power Outage", category: "Electrical", urgency: "high" },
  { name: "Circuit Breaker", category: "Electrical", urgency: "medium" },
  { name: "Home Cleaning", category: "Cleaning", urgency: "low" },
  { name: "Bathroom Cleaning", category: "Cleaning", urgency: "low" },
  { name: "Deep Cleaning", category: "Cleaning", urgency: "medium" },
  { name: "Carpet Cleaning", category: "Cleaning", urgency: "low" },
  { name: "Ceiling Fan Repair", category: "Appliance", urgency: "medium" },
  { name: "AC Repair", category: "Appliance", urgency: "high" },
  { name: "Washing Machine", category: "Appliance", urgency: "medium" },
  { name: "Refrigerator", category: "Appliance", urgency: "high" },
  { name: "Painting Work", category: "Painting", urgency: "low" },
  { name: "Wall Painting", category: "Painting", urgency: "low" },
  { name: "Wood Polishing", category: "Painting", urgency: "medium" },
];

export const CATEGORIES = ["All", "Plumbing", "Electrical", "Cleaning", "Appliance", "Painting"];
export const URGENCY_LEVELS = ["low", "medium", "high"];
export const PROPERTY_TYPES = ["apartment", "house", "office", "other"];

// Get service names for provider skill selection (for signup and profile)
export const SERVICE_NAMES = SERVICES.map(service => service.name);

// Simplified skill list for signup (just names, no categories/urgency)
export const SIGNUP_SKILLS = [
  "Tap Leakage",
  "Pipe Installation", 
  "Blocked Drain",
  "Water Heater Repair",
  "Switch Repair",
  "Wiring Fix",
  "Power Outage",
  "Circuit Breaker",
  "Home Cleaning",
  "Bathroom Cleaning",
  "Deep Cleaning",
  "Carpet Cleaning",
  "Ceiling Fan Repair",
  "AC Repair",
  "Washing Machine",
  "Refrigerator",
  "Painting Work",
  "Wall Painting",
  "Wood Polishing"
];

// Provider categories for signup (broader categories like Electrician, Plumber, etc.)
export const PROVIDER_CATEGORIES = [
  "Electrician",
  "Plumber", 
  "Carpenter",
  "Painter",
  "Home Cleaning",
  "Gardening",
  "AC Repair",
  "Refrigerator Repair",
  "Washing Machine Repair",
  "TV Repair",
  "Computer Repair",
  "Mobile Phone Repair",
  "Pest Control",
  "Waterproofing",
  "Interior Design",
  "Architecture",
  "Construction",
  "Roofing",
  "Flooring",
  "Security Services"
];

// Customer categories for service requests (simplified like signup)
export const CUSTOMER_CATEGORIES = [
  "Plumbing",
  "Electrical", 
  "Cleaning",
  "Appliance",
  "Painting",
  "Carpentry",
  "Gardening",
  "Construction",
  "Security",
  "Design"
];

// Get unique categories
export const UNIQUE_CATEGORIES = [...new Set(SERVICES.map(service => service.category))];

// Helper function to get service by name
export const getServiceByName = (name) => {
  return SERVICES.find(service => service.name === name);
};

// Helper function to get services by category
export const getServicesByCategory = (category) => {
  if (category === "All") return SERVICES;
  return SERVICES.filter(service => service.category === category);
};

// Helper function to search services
export const searchServices = (query, category = "All") => {
  const filtered = getServicesByCategory(category);
  if (!query) return filtered;
  
  const searchTerm = query.toLowerCase();
  return filtered.filter(service => 
    service.name.toLowerCase().includes(searchTerm)
  );
};
