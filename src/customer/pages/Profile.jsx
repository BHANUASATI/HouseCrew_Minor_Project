import CustomerLayout from "../CustomerLayout";
import { motion } from "framer-motion";
import {
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaCamera,
  FaSave,
  FaEdit,
  FaCity,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/apiService";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    profile_picture: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch user profile on component mount
  useEffect(() => {
    if (user?.id) {
      console.log('Profile mount - User object:', user);
      console.log('Profile mount - User profile_picture:', user?.profile_picture);
      
      // Initialize with current user data first
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        profile_picture: user.profile_picture || "",
      });
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        city: user.city || "",
      });
      
      // Then fetch fresh data from server
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getUserProfile(user.id);
      console.log('Fetched profile data:', response);
      console.log('Fetched profile_picture:', response.profile_picture);
      setProfileData(response);
      setFormData({
        name: response.name || "",
        phone: response.phone || "",
        city: response.city || "",
      });
    } catch (err) {
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFormData({
      name: profileData.name || "",
      phone: profileData.phone || "",
      city: profileData.city || "",
    });
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedData = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        city: formData.city.trim() || null,
      };

      const response = await ApiService.updateUserProfile(user.id, updatedData);
      setProfileData(response);
      
      // Update user in context and localStorage using updateUser function
      const updatedUser = { ...user, ...response };
      updateUser(updatedUser);
      
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profileData.name || "",
      phone: profileData.phone || "",
      city: profileData.city || "",
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    console.log('handleAvatar called - File selected:', file);
    console.log('Current profile data:', profileData);
    
    if (file) {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Selected file:', file);
        console.log('User ID:', user?.id);
        console.log('User object:', user);
        
        if (!user?.id) {
          throw new Error('User not found or not logged in');
        }
        
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file');
        }
        
        // Compress image if too large
        let processedFile = file;
        if (file.size > 2 * 1024 * 1024) { // If larger than 2MB
          console.log('Compressing large image...');
          processedFile = await compressImage(file);
          console.log('Compressed file size:', processedFile.size);
        }
        
        if (processedFile.size > 5 * 1024 * 1024) { // 5MB limit after compression
          throw new Error('File size must be less than 5MB');
        }
        
        // Upload to backend
        console.log('Starting upload...');
        const response = await ApiService.uploadProfilePicture(user.id, processedFile);
        
        console.log('Upload response:', response);
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          profile_picture: response.profile_picture
        }));
        
        // Update user in context and localStorage using updateUser function
        const updatedUser = { ...user, profile_picture: response.profile_picture };
        updateUser(updatedUser);
        
        console.log('Profile picture updated successfully');
        
        setSuccess("Profile picture updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
        
      } catch (err) {
        console.error('Profile upload error:', err);
        setError(err.message || "Failed to upload profile picture");
      } finally {
        setLoading(false);
      }
    } else {
      console.log('No file selected');
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 400x400)
        let width = img.width;
        let height = img.height;
        const maxWidth = 400;
        const maxHeight = 400;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          }));
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  if (loading && !profileData.name) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </CustomerLayout>
    );
  }

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
        My Profile
      </motion.h2>

      {/* ERROR AND SUCCESS MESSAGES */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-3xl bg-white rounded-2xl p-4 sm:p-6 lg:p-8
        border border-slate-200 shadow-lg"
      >
        {/* AVATAR SECTION */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-indigo-200">
              {profileData.profile_picture || user?.profile_picture ? (
                <img 
                  src={profileData.profile_picture || user?.profile_picture} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-3xl sm:text-4xl">
                  <FaUser />
                </div>
              )}
            </div>

            {/* Upload Button - More Visible */}
            <label className="absolute -bottom-2 -right-2 cursor-pointer
              bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-10">
              <FaCamera className="text-sm sm:text-base" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
              />
            </label>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-700">
              {profileData.name || "Customer"}
            </h3>
            <p className="text-slate-500 text-sm">
              Customer Account
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
          </div>

          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FaEdit className="text-sm" />
              Edit Profile
            </motion.button>
          )}
        </div>

        {/* FORM SECTION */}
        <div className="space-y-6">
          {isEditing ? (
            /* EDIT MODE */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 block">
                  Full Name
                </label>
                <div className="flex items-center gap-3 bg-slate-100 border border-slate-200
                  rounded-xl p-3 focus-within:ring-2 focus-within:ring-indigo-400">
                  <span className="text-indigo-500 text-sm sm:text-base"><FaUser /></span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full bg-transparent outline-none text-slate-700 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 block">
                  Phone Number
                </label>
                <div className="flex items-center gap-3 bg-slate-100 border border-slate-200
                  rounded-xl p-3 focus-within:ring-2 focus-within:ring-indigo-400">
                  <span className="text-indigo-500 text-sm sm:text-base"><FaPhoneAlt /></span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full bg-transparent outline-none text-slate-700 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 block">
                  Email Address
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200
                  rounded-xl p-3">
                  <span className="text-indigo-500 text-sm sm:text-base"><FaEnvelope /></span>
                  <input
                    type="email"
                    value={profileData.email || ""}
                    disabled
                    className="w-full bg-transparent outline-none text-slate-500 text-sm sm:text-base"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 block">
                  City
                </label>
                <div className="flex items-center gap-3 bg-slate-100 border border-slate-200
                  rounded-xl p-3 focus-within:ring-2 focus-within:ring-indigo-400">
                  <span className="text-indigo-500 text-sm sm:text-base"><FaCity /></span>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    className="w-full bg-transparent outline-none text-slate-700 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* VIEW MODE */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1">Full Name</h4>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-indigo-500 text-sm sm:text-base"><FaUser /></span>
                    <span className="text-slate-700 text-sm sm:text-base">
                      {profileData.name || "Not provided"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1">Phone Number</h4>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-indigo-500 text-sm sm:text-base"><FaPhoneAlt /></span>
                    <span className="text-slate-700 text-sm sm:text-base">
                      {profileData.phone || "Not provided"}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1">Email Address</h4>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-indigo-500 text-sm sm:text-base"><FaEnvelope /></span>
                    <span className="text-slate-700 text-sm sm:text-base">
                      {profileData.email || "Not provided"}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1">City</h4>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-indigo-500 text-sm sm:text-base"><FaCity /></span>
                    <span className="text-slate-700 text-sm sm:text-base">
                      {profileData.city || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 justify-end pt-4">
            {isEditing && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl text-white font-bold text-sm sm:text-base
                  bg-gradient-to-r from-indigo-600 to-sky-500 shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </CustomerLayout>
  );
}
