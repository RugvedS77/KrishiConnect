import React, { useState } from "react";
import RecommendationForm from "../farmer_daily_operation_components/CropRecommendation/RecommendationForm";
import RecommendationResult from "../farmer_daily_operation_components/CropRecommendation/RecommendationResult";
import { useAuthStore } from "../authStore";

export default function CropRecommendationPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setResult(null); // Clear previous results
    try {
        const numericPayload = Object.fromEntries(
            Object.entries(payload).map(([key, value]) => [key, Number(value)])
        );

      const res = await fetch("http://localhost:8000/api/services/recommend-crops", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(numericPayload),
      });

      if (!res.ok) {
        // Handle HTTP errors like 404 or 500
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setResult(data);

    } catch (err) {
      console.error(err);
      // Set a more informative error state
      setResult({ 
        error: "Failed to fetch recommendations. Please try again later.",
        recommendations: [], 
        source: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      {/* Banner */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
          🌾 Smart Crop Recommendation
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Our AI analyzes your farm's soil and climate data to suggest the most profitable and suitable crops.
        </p>
      </div>

      {/* Main Layout - Single Column */}
      <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto">
        
        {/* Form Card - Always visible */}
        <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg p-6 border border-blue-100">
          <RecommendationForm onSubmit={handleSubmit} loading={loading} token={token} />
        </div>

        {/* Result Card - Conditionally rendered */}
        { (loading || result) && (
          <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg p-6 border border-blue-100">
            <RecommendationResult data={result} loading={loading} />
          </div>
        )}
        
      </div>
    </div>
  );
}

