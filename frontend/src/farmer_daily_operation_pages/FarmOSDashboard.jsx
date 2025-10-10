import React from 'react';
import { useInterfaceStore } from '../interfaceStore.js';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase } from 'lucide-react';
import FarmAdvisoryWidget from '../farmer_daily_operation_components/GovernmentSchemes/FarmAdvisoryWidget.jsx';

const ModeToggleCard = () => {
    const setMode = useInterfaceStore((state) => state.setMode);
    const navigate = useNavigate();

    const handleSwitch = () => {
        setMode('marketplace');
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

export default function FarmOSDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Farm OS Dashboard</h1>
            
            <div className="flex flex-col lg:flex-row gap-6">
                
                <div className="w-full lg:w-2/3">
                    <FarmAdvisoryWidget />
                </div>
                
                <div className="w-full lg:w-1/3">
                    <ModeToggleCard />
                </div>
            </div>
        </div>
    );
}