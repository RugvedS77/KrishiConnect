import React, { useState } from "react";

// A reusable component for displaying auto-filled data
const InfoField = ({ label, value, icon }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500">{label}</label>
    <p className="flex items-center w-full mt-1 text-base font-semibold text-gray-800 bg-gray-100 p-3 rounded-md">
      <span className="mr-2">{icon}</span>
      {value || "..."}
    </p>
  </div>
);

// A reusable component for user inputs
const FormInput = ({ placeholder, value, onChange }) => (
  <input
    type="number"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required
    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg 
               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
               transition duration-200"
  />
);

export default function RecommendationForm({ onSubmit }) {
  // --- State for all form data ---
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [pH, setPH] = useState("");
  
  // --- State for UI control ---
  const [isFetching, setIsFetching] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [error, setError] = useState("");

  const getLocationAndWeather = () => {
    setIsFetching(true);
    setError("");
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsFetching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat.toFixed(4));
        setLongitude(lon.toFixed(4));

        // --- MOCK WEATHER API CALL ---
        // In a real app, you would use lat/lon to call a weather API.
        setTimeout(() => {
          setTemperature("28.5"); // °C
          setHumidity("65");   // %
          setRainfall("95.3"); // mm
          
          setIsFetching(false);
          setIsDataLoaded(true);
        }, 1000); // Simulate network delay
      },
      () => {
        setError("Unable to retrieve your location. Please enable location services.");
        setIsFetching(false);
      }
    );
  };

  const submitForm = (e) => {
    e.preventDefault();
    const payload = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      temperature: Number(temperature),
      humidity: Number(humidity),
      rainfall: Number(rainfall),
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      pH: Number(pH),
    };
    onSubmit(payload);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
      <form onSubmit={submitForm} className="space-y-8">
        <h2 className="text-3xl font-bold text-green-800 text-center">
          Enter Farm Details
        </h2>

        {/* --- Section 1: Location & Weather --- */}
        <div className="space-y-4 p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">Location & Weather Data</h3>
            <button
              type="button"
              onClick={getLocationAndWeather}
              disabled={isFetching}
              className="inline-flex items-center bg-green-100 text-green-800 py-2 px-3 rounded-lg text-sm font-bold 
                         hover:bg-green-200 transition duration-300 disabled:opacity-50"
            >
              {isFetching ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-green-600 rounded-full animate-spin" />
              ) : (
                "📍 Auto-fill"
              )}
            </button>
          </div>
          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <InfoField label="Latitude" value={latitude} icon="🌐" />
            <InfoField label="Longitude" value={longitude} icon="🌐" />
            <InfoField label="Avg. Temp" value={temperature ? `${temperature} °C` : ''} icon="🌡️" />
            <InfoField label="Avg. Humidity" value={humidity ? `${humidity} %` : ''} icon="💧" />
            <InfoField label="Avg. Rainfall" value={rainfall ? `${rainfall} mm` : ''} icon="🌧️" />
          </div>
        </div>
        
        {/* --- Section 2: Soil Nutrients & Condition --- */}
        <div className="space-y-4 p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800">Enter Soil Test Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormInput placeholder="🌿 N (kg/ha)" value={nitrogen} onChange={(e) => setNitrogen(e.target.value)} />
                <FormInput placeholder="🌿 P (kg/ha)" value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)} />
                <FormInput placeholder="🌿 K (kg/ha)" value={potassium} onChange={(e) => setPotassium(e.target.value)} />
                <FormInput placeholder="⚗️ Soil pH" value={pH} onChange={(e) => setPH(e.target.value)} />
            </div>
        </div>

        {/* --- Submit Button --- */}
        <button
          type="submit"
          disabled={!isDataLoaded}
          className="w-full inline-flex items-center justify-center bg-green-600 text-white py-4 px-4 rounded-lg text-lg font-bold 
                     hover:bg-green-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Get Crop Recommendations
        </button>
      </form>
    </div>
  );
}