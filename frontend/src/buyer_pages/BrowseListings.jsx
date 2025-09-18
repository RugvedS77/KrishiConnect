// src/pages/BrowseListings.jsx

import React, { useState } from 'react';
// ✅ Import useNavigate
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Wheat, Search, User, BarChart, Droplets, Camera, Info, X } from 'lucide-react';

// --- Dummy Data (no change) ---
const cropListings = [
    { 
        id: 1, name: 'Organic Wheat', quantity: '500 Tons', harvestDate: '2025-11-15', location: 'Punjab, IN', price: '$250/Ton', farmer: 'Raj Patel', farmer_id: 'FARM_PNJ_0012',
        farming_practices: 'Certified Organic, No-Till Farming, Crop Rotation', soil_type: 'Alluvial Loam', irrigation_sources: 'Canal Irrigation, Rainwater Harvesting',
        photos: ['https://images.unsplash.com/photo-1593322199273-c624c9455325?w=500', 'https://images.unsplash.com/photo-1542223616-740d5dff7f56?w=500', 'https://images.unsplash.com/photo-1627852359227-a57929109e8a?w=500']
    },
    { 
        id: 2, name: 'Basmati Rice', quantity: '1200 Tons', harvestDate: '2025-12-01', location: 'Haryana, IN', price: '$800/Ton', farmer: 'Anita Kaur', farmer_id: 'FARM_HR_0089',
        farming_practices: 'Integrated Pest Management (IPM), Drip Irrigation', soil_type: 'Clay Loam', irrigation_sources: 'Tube Well',
        photos: ['https://images.unsplash.com/photo-1586201375765-c128505293de?w=500', 'https://images.unsplash.com/photo-1536384459935-ace3552088f1?w=500']
    },
    { 
        id: 3, name: 'Fresh Tomatoes', quantity: '200 Tons', harvestDate: '2025-10-25', location: 'Maharashtra, IN', price: '$400/Ton', farmer: 'Suresh Rao', farmer_id: 'FARM_MH_0145',
        farming_practices: 'Greenhouse Farming, Organic Fertilizers', soil_type: 'Red Sandy Soil', irrigation_sources: 'Drip Irrigation',
        photos: ['https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=500', 'https://images.unsplash.com/photo-1561138299-323262a3a1ad?w=500', 'https://images.unsplash.com/photo-1589924846366-9884586295ab?w=500']
    },
];

// --- MODAL COMPONENT (no change) ---
const CropDetailsModal = ({ crop, onClose }) => {
    const [mainImage, setMainImage] = useState(crop.photos[0]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">{crop.name} <span className="font-medium text-gray-500">by {crop.farmer}</span></h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={24} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo Gallery */}
                    <div className="space-y-3">
                         <img src={mainImage} alt="Main crop" className="w-full h-80 object-cover rounded-lg border" />
                         <div className="flex space-x-2">
                            {crop.photos.map((photo, index) => (
                                <img 
                                    key={index} 
                                    src={photo} 
                                    alt={`Thumbnail ${index + 1}`} 
                                    onClick={() => setMainImage(photo)}
                                    className={`w-20 h-20 object-cover rounded-md border-2 cursor-pointer ${mainImage === photo ? 'border-green-500' : 'border-transparent'}`} 
                                />
                            ))}
                         </div>
                    </div>
                    {/* Details Section */}
                    <div className="space-y-5">
                         <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Farming Information</h3>
                         <div className="text-sm space-y-3">
                            <p><strong>Farming Practices:</strong> {crop.farming_practices}</p>
                            <p><strong>Soil Type:</strong> {crop.soil_type}</p>
                            <p><strong>Irrigation Sources:</strong> {crop.irrigation_sources}</p>
                         </div>
                         <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Listing Details</h3>
                         <div className="text-sm space-y-3">
                            <p><strong>Farmer ID:</strong> {crop.farmer_id}</p>
                            <p><strong>Available Quantity:</strong> {crop.quantity}</p>
                            <p><strong>Expected Harvest:</strong> {crop.harvestDate}</p>
                            <p><strong>Location:</strong> {crop.location}</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CARD COMPONENT (now with useNavigate) ---
const CropListingCard = ({ crop, onViewDetails }) => {
    // ✅ Get the navigate function from the hook
    const navigate = useNavigate();

    // ✅ Handle navigation
    const handleProposeClick = () => {
        // Use relative path: from '/buyer/browse' to '/buyer/propose/:id'
        // This is cleaner as it doesn't hardcode '/buyer'
        navigate(`../propose/${crop.id}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <img src={crop.photos[0]} alt={crop.name} className="w-full h-48 object-cover rounded-t-lg" />
            <div className="p-5 flex-grow">
                <h3 className="text-xl font-bold text-gray-800">{crop.name}</h3>
                <p className="text-sm text-gray-500 mb-3">by {crop.farmer}</p>
                <div className="space-y-2 text-sm">
                    <p className="flex items-center text-gray-600"><BarChart size={16} className="mr-2 text-gray-400" /> Quantity: <strong>{crop.quantity}</strong></p>
                    <p className="flex items-center text-gray-600"><Calendar size={16} className="mr-2 text-gray-400" /> Harvest: <strong>{crop.harvestDate}</strong></p>
                    <p className="flex items-center text-gray-600"><MapPin size={16} className="mr-2 text-gray-400" /> From: <strong>{crop.location}</strong></p>
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center mt-auto">
                <p className="text-lg font-bold text-green-700">{crop.price}</p>
                <div className="flex items-center space-x-2">
                    <button onClick={() => onViewDetails(crop)} className="text-sm font-semibold text-blue-600 hover:underline">
                        View Details
                    </button>
                    {/* ✅ Changed from <Link> to <button> with onClick */}
                    <button 
                        onClick={handleProposeClick}
                        className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 text-sm text-center"
                    >
                        Propose Contract
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main BrowseListings Component ---
const BrowseListings = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null);

    const handleViewDetails = (crop) => {
        setSelectedCrop(crop);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCrop(null);
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Browse Crop Listings</h1>
                <p className="text-gray-600 mt-1">Find the best crops that meet your requirements.</p>
            </header>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search by crop name, farmer, or location..." className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-green-500 focus:border-green-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cropListings.map((crop) => (
                    <CropListingCard key={crop.id} crop={crop} onViewDetails={handleViewDetails} />
                ))}
            </div>

            {isModalOpen && <CropDetailsModal crop={selectedCrop} onClose={handleCloseModal} />}
        </div>
    );
};

export default BrowseListings;