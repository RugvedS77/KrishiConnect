import React, { useState, useEffect, useCallback } from 'react';
import { Download, Star, User, Loader2, AlertCircle, X, Edit2, Save } from 'lucide-react';
import { useAuthStore } from '../authStore'; // Import auth store
import { API_BASE_URL } from '../api/apiConfig';
// --- Edit Profile Modal ---
// A new component to handle editing the profile
const EditProfileModal = ({ user, onClose, onSave }) => {
    const [name, setName] = useState(user.full_name);
    const [businessType, setBusinessType] = useState(user.business_type || 'Wholesaler');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            // Call the onSave function passed from the parent
            await onSave({
                full_name: name,
                business_type: businessType
            });
            onClose(); // Close modal on success
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md bg-gray-50 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Business Type</label>
                        <select
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md bg-gray-50 focus:ring-green-500 focus:border-green-500"
                        >
                            <option>Wholesaler</option>
                            <option>Retailer</option>
                            <option>Processor</option>
                            <option>Exporter</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={18} />}
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};


// --- Main Profile Page Component ---
const Profile = () => {
  // State for API data
  const [profileInfo, setProfileInfo] = useState(null);
  const [completedContracts, setCompletedContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State to control modal
  
  const token = useAuthStore((state) => state.token);

  // --- API: Fetch all data on load ---
  const fetchData = useCallback(async () => {
    if (!token) {
      setError("Please log in.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Run both API calls in parallel
      const [profileRes, contractsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/contracts/completed`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      if (!contractsRes.ok) throw new Error("Failed to fetch contracts");

      const profileData = await profileRes.json();
      const contractsData = await contractsRes.json();

      setProfileInfo(profileData);
      setCompletedContracts(contractsData);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- API: Save Profile Changes ---
  const handleSaveProfile = async (updateData) => {
    // This function will be passed to the modal. It must throw an error on failure.
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData) // Sends { full_name, business_type }
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to save changes.");
    }

    const savedProfile = await response.json();
    // Update the state with the new data from the server
    setProfileInfo(savedProfile); 
  };


  // --- Render States ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 p-8">
        <Loader2 size={48} className="animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !profileInfo) {
     return (
        <div className="p-8">
            <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-lg shadow-sm border border-red-200">
                <AlertCircle size={24} className="mr-3 flex-shrink-0" /> 
                <div>
                <p className="font-semibold">Error Loading Profile</p>
                <p className="text-sm">{error || "Profile data could not be found."}</p>
                </div>
            </div>
        </div>
     );
  }

  // --- Main Component JSX ---
  return (
    <>
        {isEditing && (
            <EditProfileModal 
                user={profileInfo}
                onClose={() => setIsEditing(false)}
                onSave={handleSaveProfile}
            />
        )}

        <div className="space-y-6 bg-gray-50 p-6 md:p-8 min-h-screen">
        {/* Header (Theme updated) */}
        <header className="bg-white p-6 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600 mt-1">
                Manage your details and keep track of your farming contracts 🌾
            </p>
            </div>
            <div className="mt-4 sm:mt-0">
            <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition flex items-center space-x-2"
            >
                <Edit2 size={16} />
                <span>Edit Profile</span>
            </button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Buyer Information (Now uses live data) */}
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm h-fit">
            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <User className="text-green-700" size={40} />
                </div>
                <h3 className="text-xl font-semibold mt-3 text-gray-800">{profileInfo.full_name}</h3>
                <p className="text-sm text-gray-500">{profileInfo.business_type || 'N/A'}</p>
            </div>

            <div className="mt-6 space-y-4 text-sm">
                <div>
                <p className="text-gray-500">Contact Email</p>
                <p className="font-medium text-gray-800">{profileInfo.email}</p>
                </div>
                <div>
                <p className="text-gray-500">Phone Number</p>
                <p className="font-medium text-gray-400 italic">Not set</p>
                </div>
                <div>
                <p className="text-gray-500">Role</p>
                <p className="font-medium text-gray-800 capitalize">{profileInfo.role}</p>
                </div>
            </div>
            </div>

            {/* Contract History (Now uses live data) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 mb-4 border-b pb-3">
                🌱 Completed Contracts
            </h3>
            
            {completedContracts.length === 0 ? (
                <p className="text-sm text-gray-500">You have no completed contracts in your history.</p>
            ) : (
                <div className="space-y-3">
                    {completedContracts.map((contract) => (
                        <div
                            key={contract.id}
                            className="p-4 border border-gray-100 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center"
                        >
                        <div>
                            <p className="font-semibold text-gray-800">
                            {contract.listing.crop_type} with {contract.farmer.full_name}
                            </p>
                            <p className="text-sm text-gray-600">
                            ✅ Completed on: {new Date(contract.listing.harvest_date).toLocaleDateString('en-IN')}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                            <button className="px-3 py-1.5 text-green-700 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 flex items-center gap-1.5 text-sm">
                            <Download size={16} />
                            PDF
                            </button>
                            <button className="px-3 py-1.5 text-yellow-700 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 flex items-center gap-1.5 text-sm">
                            <Star size={16} />
                            Rate
                            </button>
                        </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
        </div>
    </>
  );
};

export default Profile;