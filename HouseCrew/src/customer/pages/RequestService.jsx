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

  /* 🔍 COMPREHENSIVE VALIDATION */
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
        // If user manually types address, set location type to manual
        if (value !== "Location detected automatically" && !value.includes("📍")) {
          setLocationType("manual");
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2">
          {filtered.map((category, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04 }}
              onClick={() => setSelected(category.name)}
              className={`cursor-pointer p-3 sm:p-4 rounded-xl border relative
              ${
                selected === category.name
                  ? "border-indigo-500 bg-indigo-50"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="text-lg sm:text-xl mb-2 text-indigo-500">{category.icon}</div>
              <p className="font-semibold text-slate-700 text-sm sm:text-base">{category.name}</p>
              <p className="text-xs text-slate-500">Service Category</p>
            </motion.div>
          ))}
        </div>

        {/* 📍 LOCATION */}
        <div className="mt-6 sm:mt-8">
          <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <FaMapMarkerAlt className="text-indigo-500" />
            Service Location
          </h3>

          {/* Location Type Display */}
          {(address || coords) && (
            <div className={`mb-3 p-3 border rounded-lg ${
              locationType === "auto" 
                ? "bg-green-50 border-green-200" 
                : "bg-blue-50 border-blue-200"
            }`}>
              <p className={`text-sm font-medium ${
                locationType === "auto" ? "text-green-700" : "text-blue-700"
              }`}>
                📍 Your location is: <span className="font-bold">
                  {locationType === "auto" ? "📍 Location detected automatically" : "Manually entered"}
                </span>
              </p>
              {coords && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs font-medium ${
                    locationType === "auto" ? "text-green-600" : "text-blue-600"
                  }`}>
                    Coordinates:
                  </span>
                  <span className={`font-mono text-xs px-2 py-1 rounded border ${
                    locationType === "auto" 
                      ? "bg-green-100 border-green-300 text-green-800" 
                      : "bg-blue-100 border-blue-300 text-blue-800"
                  }`}>
                    📍 {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                  </span>
                  {locationType === "auto" && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      GPS
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 mb-3">
            <button
              onClick={getCurrentLocation}
              disabled={loadingLoc}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
              bg-indigo-100 text-indigo-700 font-semibold text-sm sm:text-base
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCrosshairs />
              {loadingLoc ? "Detecting location..." : "📍 Auto Detect Location"}
            </button>

            <button
              onClick={() => {
                setLocationType("manual");
                setAddress("");
                setCoords(null);
                setLocationError("");
              }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
              bg-slate-100 text-slate-700 font-semibold text-sm sm:text-base
              hover:bg-slate-200"
            >
              ✍️ Manual Entry
            </button>
          </div>

          {locationError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{locationError}</p>
            </div>
          )}

          <div className="relative">
            <textarea
              rows="3"
              value={address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
              onBlur={() => handleFieldBlur('address')}
              placeholder="Enter complete address (house number, street, area, city)"
              className={`w-full rounded-xl p-3 sm:p-4
              bg-slate-100 border border-slate-200
              focus:bg-white focus:ring-2 focus:ring-indigo-400
              resize-none text-sm sm:text-base
              ${validationErrors.address && touched.address ? 'border-red-500 ring-red-200' : ''}`}
            />
            {validationErrors.address && touched.address && (
              <p className="absolute -bottom-5 left-0 text-red-500 text-xs">{validationErrors.address}</p>
            )}
          </div>

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
