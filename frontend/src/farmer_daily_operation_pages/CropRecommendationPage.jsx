// CropRecommendationPage.jsx
import React, { useState } from "react";
import RecommendationForm from "../farmer_daily_operation_components/CropRecommendation/RecommendationForm"
import RecommendationResult from "../farmer_daily_operation_components/CropRecommendation/RecommendationResult";

export default function CropRecommendationPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setResult(null); // Clear previous results
    try {
      const res = await fetch("http://localhost:8000/api/recommend/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        // Handle HTTP errors like 404 or 500
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const j = await res.json();
      setResult(j);
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-6">
      {/* Banner */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-green-800">
          🌾 Smart Crop Recommendation
        </h1>
        <p className="text-gray-600 mt-2">
          Enter your farm details to get personalized crop suggestions.
        </p>
      </div>

      {/* Main Layout - Changed to a single column */}
      <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto">
        
        {/* Form Card - Always visible */}
        <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg p-6 border border-green-100">
          <RecommendationForm onSubmit={handleSubmit} />
        </div>

        {/* Result Card - Conditionally rendered */}
        { (loading || result) && (
          <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg p-6 border border-green-100">
            <RecommendationResult data={result} loading={loading} />
          </div>
        )}
        
      </div>
    </div>
  );
}