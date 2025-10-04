import React, { useState } from 'react';
import CropRecommendationPage from './CropRecommendationPage';
import IdentifyDisease from './IdentifyDisease';

// ## NEW: Thematic Icon for Disease Detection ##
const DiseaseIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5 mr-2" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M17 12c0-2.76-2.24-5-5-5S7 9.24 7 12s2.24 5 5 5 5-2.24 5-5z"></path>
    <path d="M14.6 14.6L19 19"></path>
    <path d="M12 18a7.2 7.2 0 005.1-2.1 7.2 7.2 0 000-10.2A7.2 7.2 0 006.9 15.9"></path>
    <path d="M12 2v2"></path><path d="M6.4 4.5l1.4 1.4"></path>
    <path d="M2 12h2"></path><path d="M4.5 17.6l1.4-1.4"></path>
  </svg>
);

// ## NEW: Thematic Icon for Crop Recommendation ##
const CropIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5 mr-2" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 18a6.1 6.1 0 006-5.8c0-3.6-2.5-6.2-5-6.2s-5 2.7-5 6.2c0 3.1 2.3 5.8 5 5.8z"></path>
    <path d="M12 6V2l-4 4"></path>
    <path d="M14.2 12a2.2 2.2 0 00-2.2-2.2 2.2 2.2 0 00-2.2 2.2c0 .7.3 1.4.8 1.8"></path>
    <path d="M12 18.6V22"></path><path d="M10 22h4"></path>
  </svg>
);

function FarmAdvisoryPage() {
  const [activeView, setActiveView] = useState('disease'); // 'disease' or 'crop'

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Professional Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex justify-center space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveView('disease')}
              className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base transition-colors duration-200
                ${activeView === 'disease'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <DiseaseIcon />
              Disease Detection
            </button>
            <button
              onClick={() => setActiveView('crop')}
              className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base transition-colors duration-200
                ${activeView === 'crop'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <CropIcon />
              Crop Recommendation
            </button>
          </nav>
        </div>

        {/* Content Area: Renders the active component */}
        <div className="mt-8">
          {activeView === 'disease' 
            ? <IdentifyDisease /> 
            : <CropRecommendationPage />
          }
        </div>
        
      </div>
    </div>
  );
}

export default FarmAdvisoryPage;