import ServiceProviderLayout from "../ServiceProviderLayout";
import { motion } from "framer-motion";
import { FaUser, FaPhone, FaEnvelope, FaCamera, FaSave, FaEdit, FaMapMarkerAlt, FaShieldAlt, FaTools } from "react-icons/fa";
import { useState, useEffect } from "react";
import ApiService from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { PROVIDER_CATEGORIES } from "../../shared/services";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    skill: "",
    city: "",
    profile_picture: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const data = await ApiService.getUserProfile(user.id);
          setProfileData(data);
          setFormData(data);
          setError(null);
        } catch (err) {
          setError(err.message);
          console.error('Failed to load profile:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [user?.id]);

  const handleEdit = () => {
    setFormData(profileData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Update profile data
      const updatedData = await ApiService.updateUserProfile(user.id, formData);
      setProfileData(updatedData);
      setIsEditing(false);
      
      // Update user in auth context
      updateUser(updatedData);
      
      // Update avatar if it was changed
      if (formData.avatarFile && formData.avatarFile !== profileData.avatar) {
        await ApiService.uploadProfilePicture(user.id, formData.avatarFile);
        // Reload profile to get the updated picture URL
        const data = await ApiService.getUserProfile(user.id);
        setProfileData(data);
        updateUser(data);
      }
      
      setError(null);
      alert("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
      console.error('Failed to update profile:', err);
      alert("Failed to update profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
    setError(null);
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ 
          ...formData, 
          avatar: e.target.result,
          avatarFile: file 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return (
      <ServiceProviderLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </ServiceProviderLayout>
    );
  }

  if (error) {
    return (
      <ServiceProviderLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </ServiceProviderLayout>
    );
  }

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
              {profileData.profile_picture ? (
                <img 
                  src={profileData.profile_picture.startsWith('data:') ? profileData.profile_picture : `data:image/jpeg;base64,${profileData.profile_picture}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : formData.avatar ? (
                <img 
                  src={formData.avatar} 
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
              {profileData.name}
            </h3>
            <p className="text-gray-500 text-sm">Service Provider</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                {profileData.skill || "No skill specified"}
              </span>
              {profileData.city && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {profileData.city}
                </span>
              )}
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
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Skill 
                    {profileData.skill && (
                      <span className="ml-2 text-xs text-amber-600 font-medium">
                        (Cannot be changed after sign-up)
                      </span>
                    )}
                  </label>
                  <div className={`flex items-center border rounded-lg px-3 py-2 ${
                    profileData.skill 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-gray-300'
                  }`}>
                    <FaTools className={`mr-3 ${
                      profileData.skill ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    {profileData.skill ? (
                      <div className="w-full text-gray-700 font-medium">
                        {profileData.skill}
                      </div>
                    ) : (
                      <select
                        name="skill"
                        value={formData.skill || ""}
                        onChange={handleInputChange}
                        className="w-full bg-transparent outline-none"
                      >
                        <option value="">Select your category</option>
                        {PROVIDER_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {profileData.skill && (
                    <p className="mt-1 text-xs text-gray-500">
                      Primary skill can only be set once during sign-up
                    </p>
                  )}
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
                        <span className="text-gray-600">{profileData.phone || "No phone number"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="text-gray-600">{profileData.city || "No city specified"}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Professional Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FaTools className="text-gray-400" />
                        <span className="text-gray-600">
                          {profileData.skill ? `Primary Skill: ${profileData.skill}` : "No skill specified"}
                        </span>
                      </div>
                      {profileData.skill && (
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {profileData.skill}
                          </span>
                        </div>
                      )}
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
