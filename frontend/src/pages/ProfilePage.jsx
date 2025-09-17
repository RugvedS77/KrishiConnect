import React, { useState } from 'react';
import ProfileData from '../components/Profile/ProfileData';
import StarRating from '../components/Profile/StarRating';
import ProfileField from '../components/Profile/ProfileField';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(ProfileData);

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
    setProfile(ProfileData);
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile Saved:', profile);
    // TODO: API call to save profile
    setIsEditing(false);
  };

  return (
    <div className="p-6 md:p-8">
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
                  className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700"
              >
                <i className="fas fa-pencil-alt mr-2"></i>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Card */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-user text-4xl text-blue-500"></i>
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
