import React, { useState, useEffect } from 'react';
import { FaStore, FaMapMarkerAlt, FaPhone, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import shopsData from '../../assets/Nearby_retailers.json';

const AgriShops = ({ userLocation }) => {
  const [shops, setShops] = useState([]);
  const [displayedShops, setDisplayedShops] = useState([]);
  const [visibleCount] = useState(2); // 👈 Only show 2 shops
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setShops(shopsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (shops.length > 0) {
      const endIndex = Math.min(currentIndex + visibleCount, shops.length);
      setDisplayedShops(shops.slice(currentIndex, endIndex));
    }
  }, [shops, currentIndex, visibleCount]);

  const showNextShops = () => {
    const newIndex = currentIndex + visibleCount;
    if (newIndex < shops.length) setCurrentIndex(newIndex);
  };

  const showPreviousShops = () => {
    const newIndex = Math.max(currentIndex - visibleCount, 0);
    setCurrentIndex(newIndex);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p>Error loading shops: {error}</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 flex items-center gap-2">
        <FaStore className="text-sky-600" /> Nearby AgriShops
      </h2>

      <div className="relative">
        {/* Left Arrow */}
        {currentIndex > 0 && (
          <button
            onClick={showPreviousShops}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-slate-200 p-2 rounded-full shadow-md hover:bg-sky-50"
          >
            <FaChevronLeft className="text-sky-600" />
          </button>
        )}

        {/* Shop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
          {displayedShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl border border-slate-200 transition-all duration-300"
            >
              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
                {shop.store_front_image_urls?.length > 0 ? (
                  <img
                    src={shop.store_front_image_urls[0]}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-sky-400 flex flex-col items-center">
                    <FaStore className="text-5xl mb-2" />
                    <span>No Image Available</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-5">
                <h3 className="text-xl font-semibold text-sky-800 mb-2">{shop.name}</h3>
                <div className="space-y-2 text-slate-700">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="mt-1 mr-2 flex-shrink-0 text-sky-600" />
                    <p>{shop.address}, {shop.town}</p>
                  </div>

                  {shop.phone_number && (
                    <div className="flex items-center">
                      <FaPhone className="mr-2 text-sky-600" />
                      <span>{shop.phone_number}</span>
                    </div>
                  )}

                  {shop.distance_to_farmer && (
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-sky-600" />
                      <p>{shop.distance_to_farmer.toFixed(1)} km from you</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {currentIndex + visibleCount < shops.length && (
          <button
            onClick={showNextShops}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-slate-200 p-2 rounded-full shadow-md hover:bg-sky-50"
          >
            <FaChevronRight className="text-sky-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AgriShops;
