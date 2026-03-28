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
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHome,
  FaBuilding,
  FaCity,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/apiService";
import { SERVICES, CATEGORIES, URGENCY_LEVELS, PROPERTY_TYPES, searchServices, CUSTOMER_CATEGORIES } from "../../shared/services";
import ModernMap from "../../components/ModernMap";
import LocationUtils from "../../utils/locationUtils";

// Icon mapping for categories
const CATEGORY_ICONS = {
  "Plumbing": <FaTools />,
  "Electrical": <FaBolt />,
  "Cleaning": <FaBroom />,
  "Appliance": <FaFan />,
  "Painting": <FaPaintRoller />,
  "Carpentry": <FaTools />,
  "Gardening": <FaTools />,
  "Construction": <FaTools />,
  "Security": <FaTools />,
  "Design": <FaPaintRoller />,
};

export default function RequestService() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [selected, setSelected] = useState(null);

  // Add icons to categories
  const categoriesWithIcons = CUSTOMER_CATEGORIES.map(category => ({
    name: category,
    icon: CATEGORY_ICONS[category] || <FaTools />
  }));

  // Filter categories based on search
  const filtered = categoriesWithIcons.filter(cat =>
    cat.name.toLowerCase().includes(query.toLowerCase())
  );

  // Location states
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationType, setLocationType] = useState("manual"); // "manual" or "auto"
  const [geocodeConfidence, setGeocodeConfidence] = useState(null);
  const [manualCoords, setManualCoords] = useState({ latitude: '', longitude: '' });
  
  // Form states
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Set user's city and phone as defaults
  useEffect(() => {
    if (user?.city) {
      setAddress(user.city);
    }
    if (user?.phone) {
      setContactPhone(user.phone);
    }
  }, [user]);

  /* 📍 REAL LOCATION FETCH */
  const getCurrentLocation = async () => {
    setLocationError("");
    setLoadingLoc(true);

    try {
      const location = await LocationUtils.getCurrentLocation();
      setCoords({ latitude: location.latitude, longitude: location.longitude });
      setAddress(location.address);
      setLocationType("auto");
      setLoadingLoc(false);
      setLocationError("");
      
      // Store location in user profile
      if (user?.id) {
        try {
          await ApiService.updateUserLocation(user.id, {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
            detection_method: location.detection_method
          });
        } catch (error) {
          console.error('Failed to store location:', error);
        }
      }
    } catch (error) {
      let errorMessage = "Unable to get location";
      if (error.message.includes('denied')) {
        errorMessage = "Location permission denied. Please enable location access.";
      } else if (error.message.includes('unavailable')) {
        errorMessage = "Location information unavailable.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Location request timed out.";
      } else {
        errorMessage = error.message;
      }
      setLocationError(errorMessage);
      setLoadingLoc(false);
    }
  };

  /* 🎯 MANUAL COORDINATE INPUT */
  const handleManualCoordinateInput = (type, value) => {
    setManualCoords(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const applyManualCoordinates = () => {
    const lat = parseFloat(manualCoords.latitude);
    const lon = parseFloat(manualCoords.longitude);
    
    if (isNaN(lat) || isNaN(lon)) {
      setLocationError("Please enter valid latitude and longitude values");
      return;
    }
    
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setLocationError("Invalid coordinate range. Latitude: -90 to 90, Longitude: -180 to 180");
      return;
    }
    
    setCoords({ latitude: lat, longitude: lon });
    setGeocodeConfidence(1.0); // Manual coordinates have 100% confidence
    setLocationError("");
    setLocationType("manual");
    
    // Update address to reflect manual coordinates
    const updatedAddress = address ? `${address} (Manual: ${lat.toFixed(6)}, ${lon.toFixed(6)})` : `Manual coordinates: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    setAddress(updatedAddress);
    
    // Store in user profile
    if (user?.id) {
      try {
        ApiService.updateUserLocation(user.id, {
          latitude: lat,
          longitude: lon,
          address: updatedAddress,
          detection_method: 'manual_coordinates',
          confidence: 1.0
        });
      } catch (error) {
        console.error('Failed to store manual coordinates:', error);
      }
    }
    
    console.log('✅ Manual coordinates applied:', { lat, lon });
  };

  /* 🗺️ GEOCODE MANUAL ADDRESS */
  const geocodeManualAddress = async (addressText) => {
    if (!addressText || addressText.trim().length < 10) {
      return null;
    }

    try {
      setLoadingLoc(true);
      setLocationError("");
      
      console.log('Geocoding manual address:', addressText);
      const geocodedLocation = await LocationUtils.forwardGeocode(addressText);
      
      setCoords({
        latitude: geocodedLocation.latitude,
        longitude: geocodedLocation.longitude
      });
      
      setGeocodeConfidence(geocodedLocation.confidence);
      
      console.log('Successfully geocoded to:', geocodedLocation);
      
      // Store geocoded location in user profile
      if (user?.id) {
        try {
          await ApiService.updateUserLocation(user.id, {
            latitude: geocodedLocation.latitude,
            longitude: geocodedLocation.longitude,
            address: geocodedLocation.address,
            detection_method: 'geocoded',
            confidence: geocodedLocation.confidence
          });
        } catch (error) {
          console.error('Failed to store geocoded location:', error);
        }
      }
      
      return geocodedLocation;
    } catch (error) {
      console.error('Geocoding failed:', error);
      setLocationError(`Could not find coordinates for this address: ${error.message}`);
      return null;
    } finally {
      setLoadingLoc(false);
    }
  };

  /* � COMPREHENSIVE VALIDATION */
  const validateForm = (showAllErrors = false) => {
    const errors = {};

    // Service validation
    if (!selected) {
      errors.service = "Please select a service";
    }

    // Address validation - only show if touched or showing all errors
    if (touched.address || showAllErrors) {
      if (!address.trim()) {
        errors.address = "Service location is required";
      } else if (address.trim().length < 10) {
        errors.address = "Please enter a complete address (minimum 10 characters)";
      }
    }

    // Property type validation - only show if touched or showing all errors
    if (touched.propertyType || showAllErrors) {
      if (!propertyType) {
        errors.propertyType = "Please select property type";
      }
    }

    // Phone validation - only show if touched or showing all errors
    if (touched.phone || showAllErrors) {
      if (!contactPhone.trim()) {
        errors.phone = "Contact phone number is required";
      } else if (!/^[6-9]\d{9}$/.test(contactPhone.replace(/\s/g, ''))) {
        errors.phone = "Please enter a valid 10-digit phone number";
      }
    }

    // Date validation - only show if touched or showing all errors
    if (touched.date || showAllErrors) {
      if (preferredDate) {
        const selectedDate = new Date(preferredDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          errors.date = "Preferred date cannot be in the past";
        }
      }
    }

    // Description validation - only show if touched or showing all errors
    if (touched.description || showAllErrors) {
      if (description && description.length > 1000) {
        errors.description = "Description must be less than 1000 characters";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateForm(false); // Only validate this field, don't show all errors
  };

  const handleFieldChange = (fieldName, value) => {
    // Clear error for this field when user starts typing
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
    
    // Update the field value
    switch (fieldName) {
      case 'address':
        setAddress(value);
        // If user manually types address, set location type to manual and trigger geocoding
        if (value !== "Location detected automatically" && !value.includes("📍")) {
          setLocationType("manual");
          // Trigger geocoding after user stops typing (debounced)
          if (value.trim().length >= 10) {
            // Debounce geocoding to avoid too many API calls
            setTimeout(() => {
              if (value === address) { // Only geocode if address hasn't changed
                geocodeManualAddress(value);
              }
            }, 1000);
          }
        }
        break;
      case 'description':
        setDescription(value);
        break;
      case 'preferredDate':
        setPreferredDate(value);
        break;
      case 'preferredTime':
        setPreferredTime(value);
        break;
      case 'propertyType':
        setPropertyType(value);
        break;
      case 'urgency':
        setUrgency(value);
        break;
      case 'contactPhone':
        // Format phone number
        const formattedPhone = value.replace(/\s/g, '').slice(0, 10);
        setContactPhone(formattedPhone);
        break;
      default:
        break;
    }
  };

  /* 📝 SUBMIT SERVICE REQUEST */
  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess(false);

    console.log('=== Submit Started ===');
    console.log('Selected service:', selected);
    console.log('User:', user);
    console.log('Address:', address);
    console.log('Coords:', coords);
    console.log('Description:', description);
    console.log('Preferred date:', preferredDate);
    console.log('Preferred time:', preferredTime);
    console.log('Property type:', propertyType);
    console.log('Urgency:', urgency);
    console.log('Contact phone:', contactPhone);

    // Mark all fields as touched and validate with showAllErrors = true
    setTouched({
      address: true,
      propertyType: true,
      phone: true,
      date: true,
      description: true
    });

    // Validate form with all errors shown
    if (!validateForm(true)) {
      setSubmitError("Please fix the validation errors before submitting");
      return;
    }

    if (!user?.id) {
      setSubmitError("User not authenticated");
      return;
    }

    try {
      setIsSubmitting(true);

      // Use selected category as both service_name and service_category
      const requestData = {
        customer_id: user.id,
        service_name: selected,
        service_category: selected,
        description: description.trim() || null,
        address: address.trim(),
        latitude: coords ? coords.latitude : null,
        longitude: coords ? coords.longitude : null,
        preferred_date: preferredDate || null,
        // Additional fields for enhanced functionality
        preferred_time: preferredTime || null,
        property_type: propertyType,
        urgency: urgency,
        contact_phone: contactPhone.trim(),
        location_type: locationType, // Add location type field
      };

      console.log('Final request data to send:', requestData);

      const response = await ApiService.createServiceRequest(requestData);
      console.log('Service request created:', response);

      setSubmitSuccess(true);
      
      // Reset form
      setSelected(null);
      setDescription("");
      setPreferredDate("");
      setPreferredTime("");
      setPropertyType("");
      setUrgency("medium");
      setCoords(null);
      setLocationType("manual"); // Reset location type
      setValidationErrors({});
      setTouched({});
      
      if (user?.city) {
        setAddress(user.city);
      } else {
        setAddress("");
      }

    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err.message || "Failed to submit service request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      {/* HEADER */}
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6
        bg-gradient-to-r from-indigo-600 to-sky-500
        bg-clip-text text-transparent">
        Request a Service
      </h2>

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-lg">

        {/* SEARCH */}
        <div className="relative mb-4 sm:mb-5">
          <FaSearch className="absolute left-3 sm:left-4 top-3 sm:top-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search service (tap repair, fan, cleaning...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 sm:pl-11 p-3 sm:p-4 rounded-xl
            bg-slate-100 border border-slate-200
            focus:bg-white focus:ring-2 focus:ring-indigo-400
            outline-none text-slate-700 text-sm sm:text-base"
          />
        </div>

        {/* CATEGORY */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-2">
          {["All", ...CUSTOMER_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0
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

        {/* CATEGORIES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 max-h-[200px] sm:max-h-[250px] overflow-y-auto pr-2">
          {filtered.map((category, i) => (
            <motion.div
              key={i}
              whileHover={{ 
                scale: 1.03,
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.1)",
                borderColor: "#6366f1"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(category.name)}
              className={`cursor-pointer p-2 sm:p-3 rounded-lg border relative transition-all duration-200 overflow-hidden
              ${
                selected === category.name
                  ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg ring-2 ring-indigo-300 ring-opacity-50"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
              style={{ transformOrigin: "center" }}
            >
              {selected === category.name && (
                <div className="absolute top-1 right-1">
                  <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                </div>
              )}
              <div className={`text-lg sm:text-xl mb-1 ${selected === category.name ? "text-indigo-600" : "text-indigo-500"}`}>
                {category.icon}
              </div>
              <p className={`font-semibold text-xs sm:text-sm truncate ${selected === category.name ? "text-indigo-700" : "text-slate-700"}`}>
                {category.name}
              </p>
              <p className="text-xs text-slate-500 hidden sm:block">Service Category</p>
            </motion.div>
          ))}
        </div>

        {/* 📍 LOCATION SELECTION - Rapido Style */}
        <div className="mt-6 sm:mt-8">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm sm:text-base">
            <FaMapMarkerAlt className="text-indigo-500" />
            Choose Your Location
          </h3>

          {/* Location Type Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Auto Detect Location Card */}
            <div 
              onClick={getCurrentLocation}
              className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden
              ${
                locationType === "auto" 
                  ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg" 
                  : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
              } ${loadingLoc ? "cursor-not-allowed opacity-60" : ""}`}
              style={{ transformOrigin: "center" }}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                  borderColor: "#6366f1"
                }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center text-center space-y-2"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  locationType === "auto" 
                    ? "bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg" 
                    : "bg-gray-100 text-indigo-600"
                }`}>
                  <FaCrosshairs className="text-xl" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm mb-1">Auto Detect Location</h4>
                  <p className="text-xs text-gray-600 leading-tight">Use GPS to detect your current location automatically</p>
                </div>
                {locationType === "auto" && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-white text-xs" />
                    </div>
                  </div>
                )}
                {loadingLoc && (
                  <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Manual Entry Card */}
            <div 
              onClick={() => {
                setLocationType("manual");
                setAddress("");
                setCoords(null);
                setLocationError("");
              }}
              className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden
              ${
                locationType === "manual" 
                  ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg" 
                  : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
              }`}
              style={{ transformOrigin: "center" }}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                  borderColor: "#6366f1"
                }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center text-center space-y-2"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  locationType === "manual" 
                    ? "bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg" 
                    : "bg-gray-100 text-indigo-600"
                }`}>
                  <FaMapMarkerAlt className="text-xl" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm mb-1">Enter Location Manually</h4>
                  <p className="text-xs text-gray-600 leading-tight">Type your complete address manually</p>
                </div>
                {locationType === "manual" && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <FaCheckCircle className="text-white text-xs" />
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Location Status Display */}
          {(address || coords) && (
            <div className={`mb-4 p-4 rounded-xl border-2 ${
              locationType === "auto" 
                ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300" 
                : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  locationType === "auto" 
                    ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white" 
                    : "bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
                }`}>
                  {locationType === "auto" ? <FaCrosshairs /> : <FaMapMarkerAlt />}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm mb-1 ${
                    locationType === "auto" ? "text-green-700" : "text-blue-700"
                  }`}>
                    {locationType === "auto" ? "📍 Location Detected Automatically" : "📍 Location Entered Manually"}
                  </p>
                  <p className="text-gray-700 text-sm font-medium">{address}</p>
                  {coords && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        locationType === "auto" ? "text-green-600" : "text-blue-600"
                      }`}>
                        GPS Coordinates:
                      </span>
                      <span className={`font-mono text-xs px-2 py-1 rounded-full border ${
                        locationType === "auto" 
                          ? "bg-green-100 border-green-300 text-green-800" 
                          : "bg-blue-100 border-blue-300 text-blue-800"
                      }`}>
                        {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                      </span>
                      {locationType === "auto" && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          High Accuracy
                        </span>
                      )}
                      {locationType === "manual" && coords && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          {geocodeConfidence === 1.0 ? '📍 Manual Coordinates' : `🗺️ Geocoded ${geocodeConfidence && `(${Math.round(geocodeConfidence * 100)}% confidence)`}`}
                        </span>
                      )}
                    </div>
                  )}
                  {loadingLoc && locationType === "manual" && (
                    <div className="mt-2 flex items-center gap-2 text-blue-600">
                      <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium">Converting address to coordinates...</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setAddress("");
                    setCoords(null);
                    setLocationType("");
                    setLocationError("");
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {locationError && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                <p className="text-red-600 text-sm font-medium">{locationError}</p>
              </div>
            </div>
          )}

          {/* Address Input - Only show for manual entry */}
          {locationType === "manual" && (
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter Complete Address
              </label>
              <textarea
                rows="3"
                value={address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                onBlur={() => handleFieldBlur('address')}
                placeholder="Enter your complete address (house number, street, area, city, pincode)"
                className={`w-full rounded-xl p-4
                bg-white border-2 ${
                  validationErrors.address && touched.address
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                } transition-all duration-200 resize-none`}
              />
              {validationErrors.address && touched.address && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                  <FaExclamationTriangle className="text-xs" />
                  {validationErrors.address}
                </div>
              )}

              {/* Manual Coordinate Input Option */}
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <FaMapMarkerAlt className="text-blue-600" />
                  <span className="text-blue-700 font-semibold text-sm">Know the exact coordinates?</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      placeholder="28.3086"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => handleManualCoordinateInput('latitude', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      placeholder="77.0436"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => handleManualCoordinateInput('longitude', e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applyManualCoordinates}
                  className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply Coordinates
                </button>
              </div>
            </div>
          )}

          {/* Instructions for auto-detect */}
          {locationType === "auto" && !loadingLoc && (address || coords) && (
            <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-indigo-600 text-lg" />
                <div>
                  <p className="text-indigo-700 font-semibold text-sm">Location Successfully Detected!</p>
                  <p className="text-indigo-600 text-xs mt-1">Your service provider will be able to locate you easily using GPS coordinates.</p>
                </div>
              </div>
            </div>
          )}

          {/* 📍 MODERN MAP (ZOMATO/SWIGGY STYLE) */}
          {coords && (
            <div className="mt-4">
              <ModernMap
                latitude={coords.latitude}
                longitude={coords.longitude}
                title="Service Location"
                height={250}
                showControls={true}
                className="rounded-2xl overflow-hidden"
                zoom={16}
                address={address}
              />
            </div>
          )}
        </div>

        {/* 🏠 PROPERTY DETAILS */}
        <div className="mt-6 sm:mt-8">
          <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <FaHome className="text-indigo-500" />
            Property Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => handleFieldChange('propertyType', e.target.value)}
                onBlur={() => handleFieldBlur('propertyType')}
                className={`w-full rounded-xl p-3 sm:p-4
                bg-slate-100 border border-slate-200
                focus:bg-white focus:ring-2 focus:ring-indigo-400 text-sm sm:text-base
                ${validationErrors.propertyType && touched.propertyType ? 'border-red-500 ring-red-200' : ''}`}
              >
                <option value="">Select property type</option>
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              {validationErrors.propertyType && touched.propertyType && (
                <p className="mt-1 text-red-500 text-xs">{validationErrors.propertyType}</p>
              )}
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => handleFieldChange('urgency', e.target.value)}
                className="w-full rounded-xl p-3 sm:p-4
                bg-slate-100 border border-slate-200
                focus:bg-white focus:ring-2 focus:ring-indigo-400 text-sm sm:text-base"
              >
                <option value="low">Flexible (3-5 days)</option>
                <option value="medium">Standard (1-2 days)</option>
                <option value="high">Urgent (Same day)</option>
              </select>
            </div>
          </div>

          {/* Contact Phone */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Contact Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                onBlur={() => handleFieldBlur('phone')}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                className={`w-full rounded-xl p-3 sm:p-4
                bg-slate-100 border border-slate-200
                focus:bg-white focus:ring-2 focus:ring-indigo-400 text-sm sm:text-base
                ${validationErrors.phone && touched.phone ? 'border-red-500 ring-red-200' : ''}`}
              />
              {validationErrors.phone && touched.phone && (
                <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{validationErrors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="relative mt-4 sm:mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Problem Description (Optional)</label>
          <div className="relative">
            <textarea
              rows="4"
              value={description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              onBlur={() => handleFieldBlur('description')}
              placeholder="Describe the issue in detail (helps service providers prepare better)"
              maxLength={1000}
              className={`w-full rounded-xl p-3 sm:p-4 pr-10 sm:pr-12
              bg-slate-100 border border-slate-200
              focus:bg-white focus:ring-2 focus:ring-indigo-400 resize-none text-sm sm:text-base
              ${validationErrors.description && touched.description ? 'border-red-500 ring-red-200' : ''}`}
            />
            <FaCamera className="absolute right-3 sm:right-4 top-3 sm:top-4 text-slate-400" />
            {validationErrors.description && touched.description && (
              <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{validationErrors.description}</p>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">{description.length}/1000 characters</p>
        </div>

        {/* 📅 PREFERRED DATE & TIME */}
        <div className="mt-4 sm:mt-6">
          <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <FaCalendarAlt className="text-indigo-500" />
            Preferred Service Time
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => handleFieldChange('preferredDate', e.target.value)}
                  onBlur={() => handleFieldBlur('preferredDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full rounded-xl p-3 sm:p-4
                  bg-slate-100 border border-slate-200
                  focus:bg-white focus:ring-2 focus:ring-indigo-400 text-sm sm:text-base
                  ${validationErrors.date && touched.date ? 'border-red-500 ring-red-200' : ''}`}
                />
                <FaCalendarAlt className="absolute right-3 sm:right-4 top-3 sm:top-4 text-slate-400" />
                {validationErrors.date && touched.date && (
                  <p className="mt-1 text-red-500 text-xs">{validationErrors.date}</p>
                )}
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time</label>
              <div className="relative">
                <select
                  value={preferredTime}
                  onChange={(e) => handleFieldChange('preferredTime', e.target.value)}
                  className="w-full rounded-xl p-3 sm:p-4
                  bg-slate-100 border border-slate-200
                  focus:bg-white focus:ring-2 focus:ring-indigo-400 text-sm sm:text-base"
                >
                  <option value="">Select time</option>
                  <option value="morning">Morning (9AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 5PM)</option>
                  <option value="evening">Evening (5PM - 8PM)</option>
                  <option value="flexible">Flexible</option>
                </select>
                <FaClock className="absolute right-3 sm:right-4 top-3 sm:top-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* SUCCESS/ERROR MESSAGES */}
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span>Service request submitted successfully! We'll connect you with a service provider soon.</span>
              <button onClick={() => setSubmitSuccess(false)} className="text-green-500 hover:text-green-700">
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span>{submitError}</span>
              <button onClick={() => setSubmitError(false)} className="text-red-500 hover:text-red-700">
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* SUBMIT */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full mt-4 sm:mt-6 py-3 sm:py-4 rounded-xl text-white font-bold text-sm sm:text-base
          bg-gradient-to-r from-indigo-600 to-sky-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <FaPaperPlane className="inline mr-2" />
              Submit Request
            </>
          )}
        </motion.button>
      </div>
    </CustomerLayout>
  );
}
