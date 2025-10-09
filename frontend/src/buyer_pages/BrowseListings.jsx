import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// --- 1. ICONS ADDED to the import list for the new modal ---
import {
  MapPin,
  Calendar,
  Search,
  BarChart,
  X,
  Loader2,
  Sprout,
  Layers,
  Droplets,
  User,
} from "lucide-react";
import { useAuthStore } from "../authStore";
import { API_BASE_URL } from "../api/apiConfig";

// --- 2. NEW HELPER COMPONENT for the modal ---
// This reusable component creates the nice icon + text row
const InfoRow = ({ icon, label, value }) => {
  const IconComponent = icon; // Allows passing the icon component (e.g., MapPin) as a prop
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-green-50 text-green-700">
        <IconComponent size={20} aria-hidden="true" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-base font-semibold text-gray-800">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
};

// --- 3. UPDATED MODAL COMPONENT ---
const CropDetailsModal = ({ crop, onClose }) => {
  if (!crop) return null;

  const photos =
    Array.isArray(crop.photos) && crop.photos.length > 0
      ? crop.photos
      : ["https://placehold.co/600x400/E2E8F0/4A5568?text=No+Image"];
  const [mainImage, setMainImage] = useState(photos[0]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      {" "}
      {/* Added simple fade-in */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-green-800">
            {" "}
            {/* Themed title */}
            {crop.name}{" "}
            <span className="font-medium text-gray-500">by {crop.farmer}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {" "}
          {/* Increased gap */}
          {/* Photo Gallery (Unchanged logic) */}
          <div className="space-y-3">
            <img
              src={mainImage}
              alt="Main crop"
              className="w-full h-80 object-cover rounded-lg border shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/600x400/E2E8F0/4A5568?text=No+Image";
              }}
            />
            <div className="flex space-x-2">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setMainImage(photo)}
                  className={`w-20 h-20 object-cover rounded-md border-2 cursor-pointer transition-all ${
                    mainImage === photo
                      ? "border-green-500 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`} // Added hover effect
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/100x100/E2E8F0/4A5568?text=...";
                  }}
                />
              ))}
            </div>
          </div>
          {/* --- NEW Details Section (using InfoRow helper) --- */}
          <div className="space-y-8">
            {/* Listing Details Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                Listing Details
              </h3>
              <div className="space-y-5">
                <InfoRow
                  icon={BarChart}
                  label="Available Quantity"
                  value={crop.quantity}
                />
                <InfoRow
                  icon={Calendar}
                  label="Expected Harvest"
                  value={crop.harvestDate}
                />
                <InfoRow icon={MapPin} label="Location" value={crop.location} />
                <InfoRow icon={User} label="Farmer ID" value={crop.farmer_id} />
              </div>
            </section>

            {/* Farming Info Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                Farming Information
              </h3>
              <div className="space-y-5">
                <InfoRow
                  icon={Sprout}
                  label="Farming Practices"
                  value={crop.farming_practices}
                />
                <InfoRow
                  icon={Layers}
                  label="Soil Type"
                  value={crop.soil_type}
                />
                <InfoRow
                  icon={Droplets}
                  label="Irrigation Source"
                  value={crop.irrigation_sources}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CARD COMPONENT (Unchanged) ---
const CropListingCard = ({ crop, onViewDetails }) => {
  const navigate = useNavigate();

  const handleProposeClick = () => {
    navigate(`../propose/${crop.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col transition-all duration-300 hover:shadow-md">
      {" "}
      {/* Added hover shadow */}
      <img
        src={crop.photos[0]}
        alt={crop.name}
        className="w-full h-48 object-cover rounded-t-lg"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "https://placehold.co/600x400/E2E8F0/4A5568?text=No+Image";
        }}
      />
      <div className="p-5 flex-grow">
        <h3 className="text-xl font-bold text-gray-800">{crop.name}</h3>
        <p className="text-sm text-gray-500 mb-3">by {crop.farmer}</p>
        <div className="space-y-2 text-sm">
          <p className="flex items-center text-gray-600">
            <BarChart size={16} className="mr-2 text-gray-400" /> Quantity:{" "}
            <strong>{crop.quantity}</strong>
          </p>
          <p className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2 text-gray-400" /> Harvest:{" "}
            <strong>{crop.harvestDate}</strong>
          </p>
          <p className="flex items-center text-gray-600">
            <MapPin size={16} className="mr-2 text-gray-400" /> From:{" "}
            <strong>{crop.location}</strong>
          </p>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t flex justify-between items-center mt-auto">
        <p className="text-lg font-bold text-green-700">{crop.price}</p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(crop)}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            View Details
          </button>
          <button
            onClick={handleProposeClick}
            className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 text-sm text-center transition-colors"
          >
            Propose Contract
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main BrowseListings Component (Unchanged) ---
const BrowseListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cropTypeTerm, setCropTypeTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const token = useAuthStore((state) => state.token);

  const fetchListings = useCallback(
    async (cropType = "", location = "") => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Authentication token is missing. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const url = new URL(`${API_BASE_URL}/api/croplists/`);
        if (cropType) {
          url.searchParams.append("crop_type", cropType);
        }
        if (location) {
          url.searchParams.append("location", location);
        }

        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Failed to fetch data.");
        }

        const data = await response.json();

        const formattedData = data.map((item) => ({
          id: item.id,
          name: item.crop_type,
          quantity: `${item.quantity} ${item.unit}`,
          harvestDate: new Date(item.harvest_date).toLocaleDateString("en-IN"),
          location: item.location,
          price: `₹${parseFloat(item.expected_price_per_unit).toLocaleString(
            "en-IN"
          )}`,
          farmer: item.farmer.full_name,
          farmer_id: item.farmer_id,
          farming_practices: item.farming_practice,
          soil_type: item.Soil_type,
          irrigation_sources: item.irrigation_source,
          photos: item.img_url
            ? item.img_url.split(",").map((url) => url.trim())
            : ["https://placehold.co/600x400/E2E8F0/4A5568?text=No+Image"],
        }));

        setListings(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      fetchListings();
    }
  }, [token, fetchListings]);

  const handleViewDetails = (crop) => {
    setSelectedCrop(crop);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCrop(null);
  };

  const handleSearch = () => {
    fetchListings(cropTypeTerm, locationTerm);
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-green-600" size={48} />
          <p className="ml-4 text-gray-600">Loading listings...</p>
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
        <div className="text-center h-64 flex flex-col justify-center items-center">
          <h3 className="text-xl font-semibold text-gray-700">
            No Listings Found
          </h3>
          <p className="text-gray-500 mt-2">
            No active listings match your criteria. Try adjusting your search.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((crop) => (
          <CropListingCard
            key={crop.id}
            crop={crop}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">
          Browse Crop Listings
        </h1>
        <p className="text-gray-600 mt-1">
          Find the best crops that meet your requirements.
        </p>
      </header>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4 md:space-y-0 md:flex md:space-x-4">
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by crop name (e.g., Wheat)"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
            value={cropTypeTerm}
            onChange={(e) => setCropTypeTerm(e.target.value)}
            onKeyDown={handleEnterKey}
          />
        </div>
        <div className="relative flex-grow">
          <MapPin
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by location (e.g., Punjab)"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-green-500 focus:border-green-500"
            value={locationTerm}
            onChange={(e) => setLocationTerm(e.target.value)}
            onKeyDown={handleEnterKey}
          />
        </div>
        <button
          onClick={handleSearch}
          className="w-full md:w-auto bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 flex-shrink-0"
        >
          Search
        </button>
      </div>

      {renderContent()}

      {isModalOpen && (
        <CropDetailsModal crop={selectedCrop} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default BrowseListings;
