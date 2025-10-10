import React, { useState, useEffect } from 'react';
import { FaStore, FaMapMarkerAlt, FaPhone, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import shopsData from '../../assets/Nearby_retailers.json';

const AgriShops = ({ userLocation }) => {
  const [shops, setShops] = useState([]);
  const [displayedShops, setDisplayedShops] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchShops = async () => {
  //     try {
  //       // Option 1: If JSON is in public folder
  //       const response = await fetch('src/assets/Nearby_retailers.json');
        
  //       // Option 2: If using Vite and JSON is in src/assets
  //       // import shopsData from '../assets/Nearby_retailers.json';
  //       // setShops(shopsData);
  //       // setLoading(false);
  //       // return;

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       setShops(data);
  //     } catch (err) {
  //       setError(`Failed to load shops: ${err.message}`);
  //       console.error('Fetch error:', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchShops();
  // }, []);

  useEffect(() => {
        // 2. Remove the entire fetchShops useEffect
        setShops(shopsData);
        setLoading(false);
    }, []);

  useEffect(() => {
    if (shops.length > 0) {
      updateDisplayedShops();
    }
  }, [shops, currentIndex, visibleCount]);

  const updateDisplayedShops = () => {
    const endIndex = Math.min(currentIndex + visibleCount, shops.length);
    setDisplayedShops(shops.slice(currentIndex, endIndex));
  };

  const showMoreShops = () => {
    const newIndex = currentIndex + visibleCount;
    if (newIndex < shops.length) {
      setCurrentIndex(newIndex);
    }
  };

  const showPreviousShops = () => {
    const newIndex = Math.max(currentIndex - visibleCount, 0);
    setCurrentIndex(newIndex);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
      <p>Error loading shops: {error}</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nearby AgriShops</h2>
      
      <div className="relative">
        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button 
            onClick={showPreviousShops}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          >
            <FaChevronLeft className="text-green-600" />
          </button>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          {displayedShops.map((shop) => (
            <div key={shop.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Shop Image */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {shop.store_front_image_urls?.length > 0 ? (
                  <img 
                    src={shop.store_front_image_urls[0]} 
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <FaStore className="text-5xl mb-2" />
                    <span>No Image Available</span>
                  </div>
                )}
              </div>

              {/* Shop Details */}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{shop.name}</h3>
                
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="mt-1 mr-2 flex-shrink-0 text-green-600" />
                    <p>{shop.address}, {shop.town}</p>
                  </div>
                  
                  {shop.phone_number && (
                    <div className="flex items-center">
                      <FaPhone className="mr-2 text-green-600" />
                      <span>{shop.phone_number}</span>
                    </div>
                  )}
                  
                  {shop.distance_to_farmer && (
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-green-600" />
                      <p>{shop.distance_to_farmer.toFixed(1)} km from you</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show next button if there are more shops */}
        {currentIndex + visibleCount < shops.length && (
          <button 
            onClick={showMoreShops}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          >
            <FaChevronRight className="text-green-600" />
          </button>
        )}
      </div>

      {/* Show more button (alternative to arrows) */}
      {currentIndex + visibleCount < shops.length && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={showMoreShops}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-full transition-colors duration-300"
          >
            See More Shops
          </button>
        </div>
      )}
    </div>
  );
};

export default AgriShops;