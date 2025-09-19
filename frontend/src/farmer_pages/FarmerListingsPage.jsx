import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../authStore'; // <-- 1. Import Auth Store
import { Loader2, Inbox, Sparkles, Calendar, MapPin, Package } from 'lucide-react'; // <-- 2. Import Icons

// --- Main Component ---
export default function FarmerListingsPage() {
  const navigate = useNavigate();

  // --- 3. Add State for Data, Loading, Errors ---
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 4. Get User & Token from Store ---
  const token = useAuthStore((state) => state.token);
  const authUser = useAuthStore((state) => state.user); // Get the logged-in user { email, role }

  // --- 5. Create API Fetcher Function ---
  const fetchMyListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token || !authUser) {
      setError("Please log in to see your listings.");
      setLoading(false);
      return;
    }

    try {
      // This route fetches ALL active listings
      const response = await fetch("http://localhost:8000/api/croplists/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to fetch listings");
      }

      const allListingsData = await response.json();

      // --- 6. FRONTEND FILTERING ---
      // We filter the full list to show ONLY listings where the farmer email matches our logged-in user's email
      const myEmail = authUser.email;
      const myListings = allListingsData.filter(
        (listing) => listing.farmer.email === myEmail
      );

      // --- 7. MAP DATA ---
      // Format the data for our component's props
      const formattedListings = myListings.map((item) => ({
        id: item.id,
        cropName: item.crop_type,
        expectedQuantity: `${item.quantity} ${item.unit}`,
        maturityTime: new Date(item.harvest_date).toLocaleDateString("en-IN"),
        giTag: item.location, // Use location field as the GI Tag/location
        priceExpectation: `₹${parseFloat(item.expected_price_per_unit).toLocaleString("en-IN")} / ${item.unit}`,
        // This is the new AI data! It will only exist on our own listings.
        recommendation: item.recommended_template_name
          ? {
              name: item.recommended_template_name,
              reason: item.recommendation_reason,
            }
          : null,
      }));

      setListings(formattedListings);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, authUser]); // Depend on token and user info

  // --- 8. Call Fetcher on Load ---
  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);


  const handleListingClick = (listingId) => {
    // This correctly navigates to the child route defined in App.jsx
    // You will need to pass the listingId to that component, e.g., via context or state
    // For now, it just renders the 'all-proposals' component in the outlet
    // navigate(`all-proposals`); 
    // TODO: When ready, change this to pass the ID:
    navigate(`proposals/${listingId}`); // (This would require an App.jsx route change)
  };

  // --- 9. Render Content (Loading/Error/Empty/Data) ---
  const renderListings = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-green-600" size={48} />
          <p className="ml-4 text-gray-600">Loading your listings...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64 bg-red-50 text-red-700 p-4 rounded-lg">
          <X size={24} className="mr-2" /> {error}
        </div>
      );
    }

    if (listings.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <Inbox size={48} className="text-gray-400 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-gray-800">No Listings Found</h3>
          <p className="text-gray-500">You have not created any active crop listings yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {listings.map((listing) => (
          <div
            key={listing.id}
            onClick={() => handleListingClick(listing.id)}
            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg"
          >
            <div className="p-5">
              <h2 className="text-2xl font-semibold text-green-700">
                {listing.cropName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center"><Package size={14} className="mr-1.5" /> Quantity</p>
                  <p className="text-lg font-medium text-gray-900">
                    {listing.expectedQuantity}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center"><Calendar size={14} className="mr-1.5" /> Maturity</p>
                  <p className="text-lg font-medium text-gray-900">
                    {listing.maturityTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center"><MapPin size={14} className="mr-1.5" /> Location</p>
                  <p className="text-lg font-medium text-gray-900">{listing.giTag}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price Expectation</p>
                  <p className="text-lg font-medium text-gray-900">
                    {listing.priceExpectation}
                  </p>
                </div>
              </div>
            </div>

            {/* --- 10. NEW: AI Recommendation Block --- */}
            {listing.recommendation && (
              <div className="bg-blue-50 border-t border-blue-100 p-4 flex items-start space-x-3">
                <div className="flex-shrink-0 text-blue-500 mt-0.5">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">
                    AI Recommendation: {listing.recommendation.name}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {listing.recommendation.reason}
                  </p>
                </div>
              </div>
            )}
            
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Crop Listings</h1>
      
      {renderListings()}

      {/* This Outlet will render the <BuyerProposalsPage /> when you navigate */}
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}