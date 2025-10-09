import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../authStore'; // Import auth store
import ProfileData from '../farmer_business_components/Profile/ProfileData'; // Keep mock data as a base
import StarRating from '../farmer_business_components/Profile/StarRating';
import ProfileField from '../farmer_business_components/Profile/ProfileField';
import { Loader2, AlertCircle, Save } from 'lucide-react'; // Import icons
import { API_BASE_URL } from './apiConfig';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null); // Start as null
  const [originalProfile, setOriginalProfile] = useState(null); // For the cancel button
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const token = useAuthStore((state) => state.token);

  // --- 1. Fetch ALL profile data on load ---
  const loadProfile = useCallback(async () => {
    if (!token) {
      setError("Not authenticated.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // We need to fetch from two different endpoints to build this page
      const [userRes, completedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/contracts/completed`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!userRes.ok || !completedRes.ok) {
        throw new Error("Failed to fetch all profile data.");
      }

      const userData = await userRes.json(); // This is UserResponse
      const completedData = await completedRes.json(); // This is List[ContractDashboardResponse]

      // --- 2. Merge Mock Data with REAL fetched data ---
      // We use the mock data as a base for all the fields your DB doesn't have yet
      const finalProfile = {
        ...ProfileData,
        name: userData.full_name,            // <-- Real Data
        email: userData.email,              // <-- Real Data
        totalContracts: completedData.length, // <-- Real Data
        // Note: Reputation, contact, address, etc., are still from the mock file
        // because your backend doesn't store this information yet.
      };

      setProfile(finalProfile);
      setOriginalProfile(finalProfile); // Store a copy for the "Cancel" button
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  
  // --- 3. Handle Form Changes (Unchanged) ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cropsGrown' || name === 'certifications') {
      setProfile((prev) => ({
        ...prev,
        [name]: value.split(',').map((item) => item.trim()).filter(Boolean),
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- 4. Handle Cancel Button (Now resets to original loaded data) ---
  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  // --- 5. Handle Save Button (Wired to the correct API endpoint) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Your backend PUT /api/users/me only accepts full_name and business_type.
    // We only send the fields the API can actually save.
    const updatePayload = {
      full_name: profile.name,
      // business_type: profile.business_type // (Add this if you add it to your form)
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to save profile.");
      }

      const savedData = await response.json();
      
      // Update state with the confirmed saved data
      const updatedProfile = { ...profile, name: savedData.full_name };
      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile); // Set new "original" state
      setIsEditing(false);
      alert("Profile updated successfully!");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- 6. Loading State ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  // --- 7. Error State ---
  if (error || !profile) {
     return (
        <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
          <AlertCircle size={24} className="mr-3 flex-shrink-0" /> 
          <div>
            <p className="font-semibold">Error Loading Profile</p>
            <p className="text-sm">{error || "Profile could not be loaded."}</p>
          </div>
        </div>
     );
  }

  // --- 8. Main Render ---
  return (
    <div className="p-6 md:p-8 space-y-6">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <div>
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center w-[130px] px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-700 disabled:bg-green-300"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-700"
              >
                <i className="fas fa-pencil-alt mr-2"></i>
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        {/* --- Info Box --- */}
        {isEditing && (
           <div className="flex items-start bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200 mb-6">
            <AlertCircle size={24} className="mr-3 flex-shrink-0 text-blue-500" /> 
            <div>
              <p className="font-semibold">Note: Your backend currently only supports saving "Full Name".</p>
              <p className="text-sm">All other fields are for display only until the database is updated to store them.</p>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Card */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-user text-4xl text-green-600"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <div className="flex items-center mt-2">
                <span className="text-2xl font-bold text-gray-800">
                  {profile.reputation}
                </span>
                <span className="text-gray-500 ml-1.5">/ 5.0</span>
              </div>
              <StarRating rating={profile.reputation} />
              <p className="text-sm text-gray-500 mt-1">
                ({profile.totalContracts} completed contracts)
              </p>
            </div>

            <hr className="my-6 border-gray-200" />

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Contact Information
              </h3>
              <dl className="space-y-4">
                {/* --- ADDED EMAIL FIELD (from real data) --- */}
                <ProfileField
                  label="Email"
                  name="email"
                  value={profile.email}
                  isEditing={false} // Email should not be editable
                  onChange={() => {}}
                />
                 <ProfileField
                  label="Contact"
                  name="contact"
                  value={profile.contact}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
                <ProfileField
                  label="Address"
                  name="address"
                  value={profile.address}
                  isEditing={isEditing}
                  onChange={handleChange}
                  type="textarea"
                />
              </dl>
            </div>
          </div>

          {/* Right Card */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-2">
              Farm Details
            </h3>
            <dl className="divide-y divide-gray-200">
              <ProfileField
                label="Farm Size"
                name="farmSize"
                value={profile.farmSize}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <ProfileField
                label="Soil Type"
                name="soilType"
                value={profile.soilType}
                isEditing={isEditing}
                onChange={handleChange}
                type="select"
                options={['Alluvial', 'Black', 'Red', 'Laterite', 'Other']}
              />
              <ProfileField
                label="Irrigation Method"
                name="irrigationMethod"
                value={profile.irrigationMethod}
                isEditing={isEditing}
                onChange={handleChange}
                type="select"
                options={['Drip Irrigation', 'Canal', 'Rain-fed', 'Borewell', 'Other']}
              />
              <ProfileField
                label="Type of Farming"
                name="farmingType"
                value={profile.farmingType}
                isEditing={isEditing}
                onChange={handleChange}
                type="select"
                options={['Conventional', 'Organic', 'Natural']}
              />
              <ProfileField
                label="Certifications"
                name="certifications"
                value={profile.certifications}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <ProfileField
                label="Crops Grown Historically"
                name="cropsGrown"
                value={profile.cropsGrown}
                isEditing={isEditing}
                onChange={handleChange}
              />
            </dl>
          </div>
        </div>
      </form>
    </div>
  );
}