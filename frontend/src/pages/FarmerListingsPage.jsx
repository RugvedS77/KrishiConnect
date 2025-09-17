import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

// Dummy farmer listings
const dummyFarmerListings = [
  {
    id: 101,
    cropName: 'Cotton (Long Staple)',
    expectedQuantity: '25 tons',
    maturityTime: '2025-11-10',
    giTag: 'Gujarat GI Certified',
    priceExpectation: '$200 per quintal',
  },
  {
    id: 102,
    cropName: 'Wheat (Durum)',
    expectedQuantity: '15 tons',
    maturityTime: '2025-10-28',
    giTag: 'Punjab GI Certified',
    priceExpectation: '$185 per quintal',
  },
  {
    id: 103,
    cropName: 'Rice (Basmati)',
    expectedQuantity: '30 tons',
    maturityTime: '2025-11-20',
    giTag: 'Haryana GI Certified',
    priceExpectation: '$280 per quintal',
  },
];

export default function FarmerListingsPage() {
  const navigate = useNavigate();

  const handleListingClick = (id) => {
    navigate(`/buyer-proposals/all-proposals`);
    // Later you can do: navigate(`/buyer-proposals/${id}`);
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Farmer Listings</h1>

      {/* Listings */}
      <div className="space-y-6">
        {dummyFarmerListings.map((listing) => (
          <div
            key={listing.id}
            onClick={() => handleListingClick(listing.id)}
            className="bg-white rounded-lg shadow-md p-5 cursor-pointer hover:shadow-lg transition-all"
          >
            <h2 className="text-2xl font-semibold text-green-700">
              {listing.cropName}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 mt-3">
              <div>
                <p className="text-sm text-gray-500">Expected Quantity</p>
                <p className="text-lg font-medium text-gray-900">
                  {listing.expectedQuantity}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Maturity Time</p>
                <p className="text-lg font-medium text-gray-900">
                  {listing.maturityTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">GI Tag</p>
                <p className="text-lg font-medium text-gray-900">{listing.giTag}</p>
              </div>
              <div className="col-span-2 md:col-span-3">
                <p className="text-sm text-gray-500">Price Expectation</p>
                <p className="text-lg font-medium text-gray-900">
                  {listing.priceExpectation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔑 Nested route content appears here */}
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
