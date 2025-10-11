import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../authStore';
import ProfileData from '../farmer_business_components/Profile/ProfileData';
import StarRating from '../farmer_business_components/Profile/StarRating';
import ProfileField from '../farmer_business_components/Profile/ProfileField';
import { Loader2, AlertCircle, Save, User, Edit, Pencil } from 'lucide-react'; // Added User and Edit icons
import { API_BASE_URL } from '../api/apiConfig';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const token = useAuthStore((state) => state.token);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setError("Not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
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

      const userData = await userRes.json();
      const completedData = await completedRes.json();

      const finalProfile = {
        ...ProfileData,
        name: userData.full_name,
        email: userData.email,
        totalContracts: completedData.length,
      };

      setProfile(finalProfile);
      setOriginalProfile(finalProfile);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  
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

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const updatePayload = {
      full_name: profile.name,
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
      
      const updatedProfile = { ...profile, name: savedData.full_name };
      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setIsEditing(false);
      // Using a console log instead of alert for a cleaner experience
      console.log("Profile updated successfully!");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-slate-500" size={48} />
      </div>
    );
  }

  if (error || !profile) {
     return (
        <div className="m-4 flex items-start bg-red-50 text-red-800 p-4 rounded-lg shadow-sm border border-red-200">
          <AlertCircle size={24} className="mr-3 flex-shrink-0 text-red-500" /> 
          <div>
            <p className="font-semibold">Error Loading Profile</p>
            <p className="text-sm">{error || "Profile data could not be loaded."}</p>
          </div>
        </div>
     );
  }

  return (
    <div className="bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
          <div>
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-300 text-sm font-medium rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center w-[130px] px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-slate-700 disabled:bg-slate-400 transition-colors"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <><Save size={16} className="mr-2"/> Save Changes</>}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-slate-700 transition-colors"
              >
                <Pencil size={16} className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        {isEditing && (
           <div className="flex items-start bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200 mb-6">
             <AlertCircle size={24} className="mr-3 flex-shrink-0 text-blue-500" /> 
             <div>
               <p className="font-semibold">Note: Your backend currently only supports saving "Full Name".</p>
               <p className="text-sm">All other fields are for display only until the database is updated to store them.</p>
             </div>
           </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Profile Summary) */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit border border-slate-200">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-white shadow-inner">
                <User size={40} className="text-slate-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
              <div className="flex items-center mt-2">
                <span className="text-2xl font-bold text-slate-800">
                  {profile.reputation}
                </span>
                <span className="text-slate-500 ml-1.5">/ 5.0</span>
              </div>
              <StarRating rating={profile.reputation} />
              <p className="text-sm text-slate-500 mt-1">
                ({profile.totalContracts} completed contracts)
              </p>
            </div>

            <hr className="my-6 border-slate-200" />

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Contact Information
              </h3>
              <dl className="space-y-4">
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

          {/* Right Column (Farm Details) */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-200 pb-3">
              Farm Details
            </h3>
            <dl className="divide-y divide-slate-200">
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
