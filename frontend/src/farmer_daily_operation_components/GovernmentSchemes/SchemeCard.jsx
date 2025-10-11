// src/SchemeCard.js
import React from 'react';

function SchemeCard({ scheme, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col h-full bg-white border border-gray-200 rounded-xl 
                 shadow-sm p-6 cursor-pointer transition-all duration-300 
                 hover:shadow-lg hover:-translate-y-1.5 hover:border-blue-300"
    >
      {/* --- Header with Tags --- */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Using a consistent blue theme for tags */}
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
          {scheme.government}
        </span>
        <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
          {scheme.category}
        </span>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
          {scheme.title}
        </h3>
        {/* Added some icons (as placeholders) and improved text styling for clarity */}
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong className="font-semibold text-gray-800">🌱 What you get:</strong> {scheme.cardSummary}
          </p>
          <p>
            <strong className="font-semibold text-gray-800">👥 Who is it for:</strong> {scheme.cardFor}
          </p>
        </div>
      </div>

      {/* --- Footer with Call to Action --- */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div 
          className="group text-blue-600 font-bold text-sm inline-flex items-center"
        >
          See Details & Apply
          {/* Arrow icon moves slightly on hover for a dynamic feel */}
          <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">
            &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}

export default SchemeCard;