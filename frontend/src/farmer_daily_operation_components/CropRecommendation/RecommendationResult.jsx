import React from "react";
import RecommendationCard from "./RecommendationCard";

export default function RecommendationResult({ data, loading }) {
  if (loading) return <div className="text-center py-10 text-green-700 font-medium">⏳ Analyzing your farm data...</div>;
  if (!data) return <div className="text-gray-500 text-center">Submit parameters to get recommendations.</div>;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-green-700 mb-3">
        🌾 Recommendations <span className="text-gray-500 text-base">({data.source})</span>
      </h2>
      <div className="space-y-3">
        {data.recommendations && data.recommendations.length > 0 ? (
          data.recommendations.map((r, i) => <RecommendationCard key={i} item={r} />)
        ) : (
          <div className="text-gray-500 text-center">No recommendations returned.</div>
        )}
      </div>
    </div>
  );
}
