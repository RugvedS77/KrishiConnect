// src/SchemeDetail.js
import React, { useState } from 'react';

// A small, reusable component for our tab buttons to keep the main component clean.
const TabButton = ({ id, title, activeTab, setActiveTab }) => {
  const isActive = activeTab === id;
  
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`py-3 px-5 text-sm md:text-base font-semibold whitespace-nowrap border-b-2
                  transition-colors duration-200
                  ${isActive
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-blue-500 hover:border-blue-300'
                  }`}
    >
      {title}
    </button>
  );
};

function SchemeDetail({ scheme }) {
  const [activeTab, setActiveTab] = useState('what_is_it');

  // This function is safe ONLY because we trust the content source.
  const createMarkup = (htmlString) => {
    return { __html: htmlString };
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'what_is_it':
        // The 'prose-blue' class themes the raw HTML with our blue palette
        return <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={createMarkup(scheme.tab_what_is_it)} />;
      case 'eligibility':
        return <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={createMarkup(scheme.tab_eligibility)} />;
      case 'documents':
        return (
          <ul className="space-y-4">
            {scheme.tab_documents.map((doc, index) => (
              <li key={index} className="flex items-start bg-blue-50/50 p-3 rounded-lg">
                <svg className="flex-shrink-0 w-5 h-5 text-blue-500 mr-3 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{doc}</span>
              </li>
            ))}
          </ul>
        );
      case 'how_to_apply':
        return <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={createMarkup(scheme.tab_how_to_apply)} />;
      default:
        return null;
    }
  };
  
  // Data for our tabs to be mapped over
  const tabs = [
    { id: 'what_is_it', title: 'What is it?' },
    { id: 'eligibility', title: 'Am I Eligible?' },
    { id: 'documents', title: 'Documents Needed' },
    { id: 'how_to_apply', title: 'How to Apply' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      {/* --- Header: Title --- */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{scheme.title}</h1>

      {/* --- Summary Box --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
        <div className="flex flex-col">
          <strong className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-1">Benefit</strong>
          <span className="text-base font-semibold text-blue-900">{scheme.detail_summary_benefit}</span>
        </div>
        <div className="flex flex-col">
          <strong className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-1">Type</strong>
          <span className="text-base font-semibold text-blue-900">{scheme.detail_summary_type}</span>
        </div>
        <div className="flex flex-col">
          <strong className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-1">Govt</strong>
          <span className="text-base font-semibold text-blue-900">{scheme.government}</span>
        </div>
      </div>

      {/* --- Action: Apply Now Button --- */}
      <a
        href={scheme.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-600 text-white text-base font-semibold no-underline py-3 px-8 rounded-lg mb-8
                   transition-all duration-300 hover:bg-blue-700 shadow-md hover:shadow-lg
                   hover:-translate-y-0.5 transform"
      >
        Apply on Official Website &rarr;
      </a>

      {/* --- Tabs Navigation --- */}
      <div className="border-b-2 border-gray-200">
        <nav className="-mb-0.5 flex space-x-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <TabButton 
              key={tab.id}
              id={tab.id}
              title={tab.title}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ))}
        </nav>
      </div>

      {/* --- Tab Content --- */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default SchemeDetail;