import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../authStore';
import ProfileData from '../farmer_business_components/Profile/ProfileData';
import StarRating from '../farmer_business_components/Profile/StarRating';
import ProfileField from '../farmer_business_components/Profile/ProfileField';
import {
  Loader2,
  AlertCircle,
  Save,
  User,
  Pencil,
  Mail,
  Phone,
  BookOpen,
  ChevronDown,
  LifeBuoy,
  LogOut,
} from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  // --- Load Profile Data ---
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

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cropsGrown" || name === "certifications") {
      setProfile((prev) => ({
        ...prev,
        [name]: value.split(",").map((item) => item.trim()).filter(Boolean),
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

    const updatePayload = { full_name: profile.name };

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
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
      console.log("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  // --- Dummy FAQ Data ---
  const faqs = [
    {
      q: "How do I create a new crop listing?",
      a: 'Navigate to "Create Listing" from your dashboard. Fill in the fields like crop type, quantity, and harvest date, then click "Create Listing".',
    },
    {
      q: "What happens when I accept a buyer's proposal?",
      a: "Once you accept a buyer's proposal, a new contract is created automatically. You can find it in 'Ongoing Contracts'.",
    },
    {
      q: "How do I update a milestone for an ongoing contract?",
      a: 'Go to "Ongoing Contracts", find the relevant contract, and use the "Upload Update" section to add text or images.',
    },
    {
      q: "How and when do I get paid?",
      a: "Payments are made through escrow. Milestones trigger partial payments, and final payment is released on delivery confirmation.",
    },
    {
      q: "What should I do if a buyer disputes a milestone?",
      a: 'Try to communicate first. If unresolved, click "Submit a Ticket" in Support to get help from our mediation team.',
    },
  ];

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
          <p className="text-sm">
            {error || "Profile data could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Profile & Support</h1>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="profileForm"
                disabled={isSaving}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg shadow-sm hover:bg-slate-700 text-sm"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin mx-auto" />
                ) : (
                  <>
                    <Save size={16} className="mr-2 inline" /> Save
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm"
              >
                <Pencil size={16} className="mr-2 inline" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center"
              >
                <LogOut size={16} className="mr-2" /> Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile and Support Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Section */}
        <form
          id="profileForm"
          onSubmit={handleSubmit}
          className="xl:col-span-2 bg-white rounded-lg shadow-md p-6 border border-slate-200 space-y-6"
        >
          {/* Profile Summary */}
          <div className="flex flex-col items-center mb-6">
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

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField
              label="Email"
              name="email"
              value={profile.email}
              isEditing={false}
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
              options={["Alluvial", "Black", "Red", "Laterite", "Other"]}
            />
            <ProfileField
              label="Irrigation Method"
              name="irrigationMethod"
              value={profile.irrigationMethod}
              isEditing={isEditing}
              onChange={handleChange}
              type="select"
              options={[
                "Drip Irrigation",
                "Canal",
                "Rain-fed",
                "Borewell",
                "Other",
              ]}
            />
            <ProfileField
              label="Type of Farming"
              name="farmingType"
              value={profile.farmingType}
              isEditing={isEditing}
              onChange={handleChange}
              type="select"
              options={["Conventional", "Organic", "Natural"]}
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
          </div>
        </form>

        {/* Support Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <LifeBuoy className="h-7 w-7 text-slate-700" />
            <h3 className="text-xl font-semibold text-slate-800">
              Support & Help Center
            </h3>
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <p className="text-sm text-slate-600 mb-3">
              Need help? Reach out to us:
            </p>
            <div className="space-y-3">
              <a
                href="mailto:support@agriconnect.com"
                className="flex items-center text-slate-700 hover:text-blue-600"
              >
                <Mail className="w-5 h-5 text-slate-400 mr-3" />
                support@agriconnect.com
              </a>
              <a
                href="tel:+912212345678"
                className="flex items-center text-slate-700 hover:text-blue-600"
              >
                <Phone className="w-5 h-5 text-slate-400 mr-3" />
                +91-22-12345678
              </a>
            </div>
          </div>

          <button className="w-full mb-6 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700">
            Submit a Ticket
          </button>

          {/* FAQs */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-3">
              FAQs
            </h4>
            <div className="divide-y divide-slate-200">
              {faqs.map((item, index) => (
                <div key={index}>
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between items-center w-full py-2 text-left"
                  >
                    <span className="text-sm font-medium text-slate-900">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 transition-transform ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? "max-h-screen" : "max-h-0"
                    }`}
                  >
                    <p className="pb-3 text-sm text-slate-600">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
