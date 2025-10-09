// src/pages/SchemeExplorerPage.jsx
import React, { useState, useEffect } from 'react';
// Note the updated '../' paths
import SchemeCard from '../farmer_daily_operation_components/GovernmentSchemes/SchemeCard.jsx';
import SchemeDetail from '../farmer_daily_operation_components/GovernmentSchemes/SchemeDetail.jsx';
import EligibilityQuiz from '../farmer_daily_operation_components/GovernmentSchemes/EligibilityQuiz.jsx';
import { API_BASE_URL } from './apiConfig';
// The API URL is now part of this component
const API_URL = `http://127.0.0.1:8000/api/schemes`;

// We just renamed App() to SchemeExplorerPage()
function SchemeExplorerPage() {
  // All state now lives inside this component
  const [allSchemes, setAllSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [quizResults, setQuizResults] = useState(null); 
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [filters, setFilters] = useState({
    category: 'All',
    government: 'All',
  });
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- NEW: State for our dynamic filter lists ---
  const [categories, setCategories] = useState(['All']);
  const [governments, setGovernments] = useState(['All']);

  // Data fetching logic lives here
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        setAllSchemes(data); 
        setFilteredSchemes(data); 
        
        // --- UPDATED: Set the filter lists into STATE ---
        setCategories(['All', ...new Set(data.map(s => s.category))]);
        setGovernments(['All', ...new Set(data.map(s => s.government))]);

      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemes();
  }, []); // The empty array [] means "run this only once on mount"

  // Filter logic lives here
  useEffect(() => {
    let result = allSchemes; 

    if (filters.category !== 'All') {
      result = result.filter(scheme => scheme.category === filters.category);
    }
    if (filters.government !== 'All') {
      result = result.filter(scheme => scheme.government === filters.government);
    }
    setFilteredSchemes(result);
  }, [filters, allSchemes]);

  // --- All handlers now live here ---
  
  const handleFilterChange = (filterType, value) => {
    setQuizResults(null); 
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };

  const handleSchemeClick = (scheme) => {
    setSelectedScheme(scheme);
  };

  const handleBackToList = () => {
    setSelectedScheme(null);
  };

  const handleFindSchemes = (answers) => {
    console.log("Quiz Answers:", answers); 
    
    const matches = allSchemes.filter(scheme => {
      const rules = scheme.rules;
      if (!rules.states.includes('All') && !rules.states.includes(answers.state)) {
        return false;
      }
      const qualifies_by_owning = answers.ownsLand && rules.must_own_land;
      const qualifies_by_renting = answers.isTenant && rules.can_be_tenant;
      const land_not_required = !rules.must_own_land && !rules.can_be_tenant;
      if (!(qualifies_by_owning || qualifies_by_renting || land_not_required)) {
        return false;
      }
      if (!rules.categories.includes('All') && !rules.categories.includes(answers.category)) {
        return false;
      }
      if (!rules.needs.includes(answers.need)) {
        return false;
      }
      console.log("Found Match:", scheme.title);
      return true;
    });

    setQuizResults(matches);
    setIsQuizOpen(false);
  };

  const resetFilters = () => {
    setFilters({ category: 'All', government: 'All' });
    setQuizResults(null);
  }
  
  const schemesToDisplay = quizResults ? quizResults : filteredSchemes;

  // --- All Render Logic now lives here ---
  
  if (isLoading) {
    return <div className="text-center p-10 text-2xl font-bold text-gray-500">Loading Schemes...</div>
  }
  
  if (error) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-600">Error: Could not load data</h2>
        <p className="text-gray-700 mb-4">"{error}"</p>
        <p className="text-gray-500">Please make sure your backend server is running on `http://127.0.0.1:8000`.</p>
      </div>
    )
  }

  if (selectedScheme) {
    return (
      <div className="max-w-5xl mx-auto p-5 min-h-screen bg-gray-50">
        <button
          onClick={handleBackToList}
          className="bg-transparent text-blue-600 font-semibold py-2 px-1 mb-5 flex items-center gap-1 transition-all hover:text-blue-800"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to All Schemes
        </button>
        <SchemeDetail scheme={selectedScheme} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-5">
      <header className="text-center mb-8 pb-6 border-b-2 border-gray-200">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">Farmer Scheme Explorer</h1>
        <p className="text-lg text-gray-600">Find the right government scheme for your needs.</p>
      </header>

      {/* --- Quiz Banner --- */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8 text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Not sure where to start?</h2>
        <p className="text-gray-700 mb-4">Answer 5 simple questions to find the perfect schemes for you.</p>
        <button
          onClick={() => setIsQuizOpen(true)}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all shadow-md"
        >
          Start the 1-Minute Checker
        </button>
      </div>
      
      {quizResults && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Your Personalized Results</h2>
          <button
              onClick={resetFilters}
              className="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 text-sm"
            >
              Clear Results
            </button>
        </div>
      )}

      {!quizResults && (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">...Or, Browse All Schemes</h2>
          {/* --- Filter by Need --- */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-600 mb-3">Filter by Need:</h3>
            <div className="flex flex-wrap gap-2">
              {/* --- UPDATED: Use 'categories' state variable --- */}
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleFilterChange('category', category)}
                  className={`py-2 px-4 rounded-full text-sm font-medium transition-all
                    ${filters.category === category
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* --- Filter by Government --- */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-600 mb-3">Filter by Government:</h3>
            <div className="flex flex-wrap gap-2">
              {/* --- UPDATED: Use 'governments' state variable --- */}
              {governments.map(gov => (
                <button
                  key={gov}
                  onClick={() => handleFilterChange('government', gov)}
                  className={`py-2 px-4 rounded-full text-sm font-medium transition-all
                    ${filters.government === gov
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {gov}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* --- Scheme Card Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemesToDisplay.length > 0 ? (
          schemesToDisplay.map(scheme => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onClick={() => handleSchemeClick(scheme)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            {/* --- FIXED: Changed </D> to </p> --- */}
            <p className="text-gray-500 italic text-lg mb-4">
              {quizResults ? "No schemes match your quiz answers." : "No schemes match your selected filters."}
            </p>
            <button
              onClick={resetFilters}
              className="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* --- The Modal Component --- */}
      {isQuizOpen && (
        <EligibilityQuiz 
          onClose={() => setIsQuizOpen(false)}
          onFindSchemes={handleFindSchemes}
        />
      )}
    </div>
  );
}

export default SchemeExplorerPage;