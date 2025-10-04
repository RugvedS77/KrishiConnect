import React, { useState } from 'react';

// --- Placeholder Components for each feature ---
import { CommunityPage } from './CommunityPage';
import SchemeExplorerPage from './SchemeExplorerPage';
import AskExpertPage from './AskExpertPage';

// --- Thematic Icons for the Navigation Tabs ---

const CommunityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 00-3-3.87"></path>
    <path d="M16 3.13a4 4 0 010 7.75"></path>
  </svg>
);

const SchemeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
    <path d="M2 17l10 5 10-5"></path>
    <path d="M2 12l10 5 10-5"></path>
  </svg>
);

const ExpertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15c-3.3 0-6 2.7-6 6h12c0-3.3-2.7-6-6-6z"></path>
    <circle cx="12" cy="8" r="3"></circle>
    <path d="M18.7 12.3c.6.6.6 1.5 0 2.1l-1.4 1.4c-.6.6-1.5.6-2.1 0l-1.4-1.4c-.6-.6-.6-1.5 0-2.1l1.4-1.4c.6-.6 1.5-.6 2.1 0l1.4 1.4z"></path>
  </svg>
);


// --- Main Page Component ---

export default function CommunityHubPage() {
  const [activeTab, setActiveTab] = useState('community'); // 'community', 'schemes', or 'experts'

  // Helper to reduce repetition in button class names
  const getButtonClasses = (tabName) => {
    const isActive = activeTab === tabName;
    return `flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base transition-colors duration-200
      ${isActive
        ? 'border-green-600 text-green-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'community':
        return <CommunityPage />;
      case 'schemes':
        return <SchemeExplorerPage />;
      case 'experts':
        return <AskExpertPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Community Hub
          </h1>
          <p className="text-gray-600 mt-2">
            Connect with farmers, find government schemes, and get advice from experts.
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex justify-center space-x-4 sm:space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('community')}
              className={getButtonClasses('community')}
            >
              <CommunityIcon />
              Community
            </button>
            <button
              onClick={() => setActiveTab('schemes')}
              className={getButtonClasses('schemes')}
            >
              <SchemeIcon />
              Govt. Schemes
            </button>
            <button
              onClick={() => setActiveTab('experts')}
              className={getButtonClasses('experts')}
            >
              <ExpertIcon />
              Expert Advice
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="mt-8">
          {renderContent()}
        </div>
        
      </div>
    </div>
  );
}