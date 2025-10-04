import React from "react";

export default function RecommendationCard({ item }) {
  return (
    <div className="p-5 bg-green-50 border border-green-200 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-lg text-green-800">{item.name}</span>
        <span className="text-green-700 font-semibold bg-green-100 px-3 py-1 rounded-full">
          {(item.suitability_score * 100).toFixed(1)}%
        </span>
      </div>
      <div className="text-gray-700 text-sm leading-relaxed">{item.reason}</div>
    </div>
  );
}
