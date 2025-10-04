import React from 'react';
import { useInterfaceStore } from '../interfaceStore.js';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Sun, Thermometer, Droplets, Wind } from 'lucide-react';

/**
 * A reusable, visually distinct card that allows the user to switch
 * from the Farm OS mode to the Marketplace (business) mode.
 */
const ModeToggleCard = () => {
    const setMode = useInterfaceStore((state) => state.setMode);
    const navigate = useNavigate();

    const handleSwitch = () => {
        // Set the global state to 'marketplace'
        setMode('marketplace');
        // Navigate the user to the marketplace dashboard
        navigate('/farmer/marketplace/dashboard');
    };

    return (
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white h-full flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Marketplace Mode</h2>
                        <p className="text-sm opacity-90 mt-1">Access your listings, contracts, and wallet.</p>
                    </div>
                    <Briefcase size={32} className="opacity-50" />
                </div>
            </div>
            <button 
                onClick={handleSwitch}
                className="mt-4 w-full flex items-center justify-center bg-white text-green-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <span>Switch to Business View</span>
                <ArrowRight size={16} className="ml-2" />
            </button>
        </div>
    );
};

/**
 * A widget to display current weather conditions and agricultural alerts.
 * In a real application, this would fetch live data from a weather API.
 */
const ClimateInsights = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border h-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🌦️ Climate Insights for Pune</h2>
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
                <p className="font-bold text-blue-800 text-lg">High Humidity Warning</p>
                <p className="text-sm text-gray-700">Monitor tomato and potato crops for signs of blight over the next 48 hours.</p>
            </div>
            <Sun size={32} className="text-yellow-500"/>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 text-center pt-4 border-t border-gray-100">
            <div>
                <p className="font-semibold text-gray-700 text-sm">Temperature</p>
                <p className="flex items-center justify-center font-bold text-lg"><Thermometer size={16} className="mr-1 text-red-500"/>28°C</p>
            </div>
            <div>
                <p className="font-semibold text-gray-700 text-sm">Humidity</p>
                <p className="flex items-center justify-center font-bold text-lg"><Droplets size={16} className="mr-1 text-sky-500"/>85%</p>
            </div>
            <div>
                <p className="font-semibold text-gray-700 text-sm">Wind</p>
                <p className="flex items-center justify-center font-bold text-lg"><Wind size={16} className="mr-1 text-gray-500"/>12 km/h</p>
            </div>
        </div>
    </div>
);


/**
 * The main dashboard component for the Farm OS interface.
 * It serves as the landing page for farmers in operational mode.
 */
export default function FarmOSDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Farm OS Dashboard</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content area */}
                <div className="lg:col-span-2">
                    <ClimateInsights />
                </div>
                
                {/* Sidebar-like column for primary actions */}
                <div className="lg:col-span-1">
                    <ModeToggleCard />
                </div>
            </div>
            
            {/* You can add more widgets like Live Market Prices below */}
            {/* For example: <LiveCropPrices /> */}
        </div>
    );
}
