import React, { useState } from "react";
import { MapPin, Thermometer, Droplets, Wind, Leaf, Sun, Globe } from "lucide-react";

// A reusable styled input component for manual entry
const StyledInput = ({ icon, label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        {icon}
      </div>
      <input
        {...props}
        className="block w-full rounded-lg border-slate-300 bg-slate-50/50 pl-10 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
        required
      />
    </div>
  </div>
);

// A reusable component to display fetched data
const InfoField = ({ label, value, icon }) => (
  <div>
    <label className="block text-xs font-medium text-slate-500">{label}</label>
    <div className="mt-1 flex h-10 items-center rounded-lg bg-blue-50 border border-blue-200 px-3">
      <div className="flex-shrink-0 text-blue-600">{icon}</div>
      <p className="ml-2 truncate text-sm font-semibold text-blue-900">{value || "..."}</p>
    </div>
  </div>
);


export default function RecommendationForm({ onSubmit, loading, token }) {
  const [formData, setFormData] = useState({
    N: "", P: "", K: "",
    temperature: "", humidity: "", ph: "", rainfall: "",
    latitude: "", longitude: ""
  });
  const [locationStatus, setLocationStatus] = useState("");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetLocationAndWeather = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingLocation(true);
    setLocationStatus("Fetching your location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationStatus("Location found! Fetching climate data...");
        try {
          const res = await fetch("http://localhost:8000/api/services/weather", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to fetch weather data.');
          const weatherData = await res.json();
          const { current_conditions } = weatherData;
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toFixed(4),
            longitude: longitude.toFixed(4),
            temperature: current_conditions.temperature.toFixed(1),
            humidity: current_conditions.humidity.toFixed(1),
            rainfall: current_conditions.rainfall ? current_conditions.rainfall.toFixed(1) : "",
          }));
          setLocationStatus("Climate data loaded successfully!");
        } catch (error) {
          console.error("Weather API error:", error);
          setLocationStatus("Could not fetch climate data. Please enter manually.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      () => {
        setLocationStatus("Unable to retrieve location. Please enable permissions and try again.");
        setIsFetchingLocation(false);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* --- Section 1: Location & Climate --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow">1</div>
          <h2 className="text-xl font-bold text-slate-800">Location & Climate</h2>
        </div>
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Automatically fill climate data by providing your current location.
          </p>
          <button
            type="button"
            onClick={handleGetLocationAndWeather}
            disabled={isFetchingLocation}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isFetchingLocation ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                <span>Fetching Data...</span>
              </>
            ) : (
              <>
                <MapPin size={16} />
                Use My Current Location
              </>
            )}
          </button>
          {locationStatus && <p className="text-xs text-center text-blue-800 font-medium pt-1">{locationStatus}</p>}
          
          <div className="grid grid-cols-2 gap-4 pt-2">
              <InfoField label="Latitude" value={formData.latitude} icon={<Globe size={16}/>} />
              <InfoField label="Longitude" value={formData.longitude} icon={<Globe size={16}/>} />
          </div>
        </div>
      </div>

      {/* --- Section 2: Soil & Environment --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow">2</div>
          <h2 className="text-xl font-bold text-slate-800">Soil & Environment</h2>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <StyledInput label="Nitrogen (N)" name="N" value={formData.N} onChange={handleChange} type="number" placeholder="e.g., 90" icon={<Leaf size={16} className="text-slate-400" />} />
            <StyledInput label="Phosphorus (P)" name="P" value={formData.P} onChange={handleChange} type="number" placeholder="e.g., 42" icon={<Leaf size={16} className="text-slate-400" />} />
            <StyledInput label="Potassium (K)" name="K" value={formData.K} onChange={handleChange} type="number" placeholder="e.g., 43" icon={<Leaf size={16} className="text-slate-400" />} />
            <StyledInput label="Soil pH" name="ph" value={formData.ph} onChange={handleChange} type="number" step="0.1" placeholder="e.g., 6.5" icon={<Wind size={16} className="text-slate-400" />} />
            <StyledInput label="Temperature (°C)" name="temperature" value={formData.temperature} onChange={handleChange} type="number" step="0.1" placeholder="Auto-filled" icon={<Thermometer size={16} className="text-slate-400" />} />
            <StyledInput label="Humidity (%)" name="humidity" value={formData.humidity} onChange={handleChange} type="number" step="0.1" placeholder="Auto-filled" icon={<Droplets size={16} className="text-slate-400" />} />
            <StyledInput label="Rainfall (mm)" name="rainfall" value={formData.rainfall} onChange={handleChange} type="number" step="0.1" placeholder="Auto-filled" icon={<Sun size={16} className="text-slate-400" />} />
          </div>
        </div>
      </div>
      
      {/* --- Submit Button --- */}
      <div className="pt-4">
        <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-blue-500/40"
        >
            {loading ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Analyzing...
                </>
                ) : (
                "Get Recommendations"
            )}
        </button>
      </div>
    </form>
  );
}