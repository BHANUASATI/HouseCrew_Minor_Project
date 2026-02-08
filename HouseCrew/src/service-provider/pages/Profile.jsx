import ServiceProviderLayout from "../ServiceProviderLayout";
import { motion } from "framer-motion";
import { FaUser, FaPhone, FaEnvelope, FaCamera, FaSave, FaEdit, FaMapMarkerAlt, FaShieldAlt } from "react-icons/fa";
import { useState } from "react";

export default function Profile() {
  const [profileData, setProfileData] = useState({
    firstName: "Service",
    lastName: "Provider",
    email: "provider@housecrew.com",
    phone: "+91 9876543210",
    address: "123 Business Avenue, Delhi, India",
    bio: "Professional service provider with 5+ years of experience in home services.",
    services: ["Home Cleaning", "Plumbing", "Electrical Work", "Gardening"],
    availability: "Full Time",
    languages: ["English", "Hindi", "Punjabi"],
    experience: "5+ years",
    certifications: ["Licensed Professional", "Safety Certified", "Insured"],
    avatar: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);

  const handleEdit = () => {
    setFormData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(formData);
    setIsEditing(false);
    // Here you would typically save to backend
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, avatar: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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
        Profile
      </motion.h2>

      {/* MAIN CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-3xl mx-auto bg-white rounded-2xl p-4 sm:p-6 lg:p-8
        border border-slate-200 shadow-lg"
      >
        {/* AVATAR SECTION */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-purple-200 bg-gray-100">
              {profileData.avatar || formData.avatar ? (
                <img 
                  src={profileData.avatar || formData.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-3xl sm:text-4xl">
                  <FaUser />
                </div>
              )}
            </div>
            
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 cursor-pointer
                bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors">
                <FaCamera className="text-sm" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatar}
                />
              </label>
            )}
          </div>

          <div className="text-center sm:text-left flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              {profileData.firstName} {profileData.lastName}
            </h3>
            <p className="text-gray-500 text-sm">Service Provider</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                profileData.availability === "Full Time"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {profileData.availability}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                {profileData.experience}
              </span>
            </div>
          </div>

          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <FaEdit className="text-sm" />
              Edit Profile
            </motion.button>
          )}
        </div>

        {/* PROFILE FORM */}
        <div className="space-y-6">
          {isEditing ? (
            <>
              {/* EDIT FORM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <FaSave />
                  Save Changes
                </motion.button>
              </div>
            </>
          ) : (
            <>
              {/* VIEW MODE */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        <span className="text-gray-600">{profileData.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400" />
                        <span className="text-gray-600">{profileData.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="text-gray-600">{profileData.address}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Professional Information</h4>
                    <div className="space-y-2">
                      <p className="text-gray-600">{profileData.bio}</p>
                      <div className="flex flex-wrap gap-2">
                        {profileData.services.map((service, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {service}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profileData.languages.map((lang, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Experience & Certifications</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaShieldAlt className="text-gray-400" />
                      <span className="text-gray-600">{profileData.experience} experience</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.certifications.map((cert, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </ServiceProviderLayout>
  );
}
