import React, { useState, useEffect } from 'react';
import { useInterfaceStore } from '../interfaceStore.js';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Sun, Thermometer, Droplets, NotepadText, Loader2, CloudRain } from 'lucide-react';

import {useAuthStore} from '../authStore.js'
import { API_BASE_URL } from "../api/apiConfig";

// --- API Helper function for fetching weather ---
const fetchWeatherData = async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/services/weather`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch weather insights.");
    }
    return response.json();
};
// --- A helper to generate a relevant agricultural alert ---
const generateAgriAlert = (weather) => {
    if (weather.humidity > 80 && weather.temperature > 25) {
        return {
            title: "High Humidity Warning",
            message: "Monitor tomato and potato crops for signs of blight over the next 48 hours."
        };
    }
    if (weather.temperature > 35) {
        return {
            title: "Heat Stress Alert",
            message: "Ensure adequate irrigation for sensitive crops. Consider applying mulch to retain soil moisture."
        };
    }
    return null; // No specific alert
};
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
// --- UPDATED ClimateInsights Component ---
const ClimateInsights = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        if (!token) return;

        const loadWeather = async () => {
            try {
                const data = await fetchWeatherData(token);
                console.log("data got:", data)
                setWeatherData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadWeather();
    }, [token]);

    const alert = weatherData ? generateAgriAlert(weatherData) : null;

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" />
                <p className="ml-3 text-gray-500">Loading Climate Insights...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200 h-full">
                <h2 className="text-xl font-bold text-red-800 mb-4">Error</h2>
                <p className="text-red-700">{error}</p>
            </div>
        );
    }
    
    if (!weatherData) return null;

    // --- NEW: Destructure the data for easier access ---
    const { insights, current_conditions } = weatherData;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
                🌦️ Climate Insights for {"Pune"}
            </h2>
            
            {alert && (
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                        <p className="font-bold text-yellow-800 text-lg">{insights.insights}</p>
                        <p className="text-sm text-gray-700">{insights.action}</p>
                    </div>
                    {/* You can display an icon based on the alert type */}
                </div>
            )}

             <div className="space-y-3">
                {insights.map((insights, index) => (
                    <div key={index} className="flex items-start justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div>
                            <p className="font-bold text-yellow-800 text-lg">{insights.insight}</p>
                            <p className="text-sm text-gray-700 mt-1">{insights.action}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 text-center pt-4 border-t border-gray-100">
                <div>
                    <p className="font-semibold text-gray-700 text-sm">Condition</p>
                    <p className="flex items-center justify-center font-bold text-xl">
                        <NotepadText size={16} className="mr-1 text-red-500"/>
                        {current_conditions.description}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 text-center pt-4 border-t border-gray-100">
                <div>
                    <p className="font-semibold text-gray-700 text-sm">Temperature</p>
                    <p className="flex items-center justify-center font-bold text-xl">
                        <Thermometer size={16} className="mr-1 text-red-500"/>
                        {Math.round(current_conditions.temperature)}°C
                    </p>
                </div>
                <div>
                    <p className="font-semibold text-gray-700 text-sm">Humidity</p>
                    <p className="flex items-center justify-center font-bold text-xl">
                        <Droplets size={16} className="mr-1 text-sky-500"/>
                        {current_conditions.humidity}%
                    </p>
                </div>
                <div>
                    <p className="font-semibold text-gray-700 text-sm">Rainfall Chance</p>
                    <p className="flex items-center justify-center font-bold text-xl">
                        <CloudRain size={16} className="mr-1 text-gray-500"/>
                        {Math.round(current_conditions.rainfall_chance)}%
                    </p>
                </div>
            </div>
             <p className="text-xs text-gray-400 text-center mt-4">Weather data from OpenWeatherMap</p>
        </div>
    );
};

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
