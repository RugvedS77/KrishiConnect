// src/components/EligibilityQuiz.jsx
import React, { useState } from 'react';

// These are the questions for the quiz
const quizQuestions = {
  states: ['Maharashtra', 'Other'],
  categories: ['General', 'SC', 'Navabuddha', 'FPO', 'SHG'],
  needs: [
    { label: 'Direct income support', value: 'income_support' },
    { label: 'A bank loan', value: 'loan' },
    { label: 'Crop insurance', value: 'crop_insurance' },
    { label: 'Buy a tractor/equipment', value: 'equipment' },
    { label: 'A new well or pump', value: 'irrigation' },
    { label: 'Build a warehouse', value: 'infrastructure' },
    { label: 'Plant a new orchard', value: 'horticulture' },
  ],
};

function EligibilityQuiz({ onClose, onFindSchemes }) {
  const [answers, setAnswers] = useState({
    state: 'Maharashtra',
    ownsLand: true,
    isTenant: false,
    category: 'General',
    need: 'loan',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAnswers(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFindSchemes(answers); // Send the answers up to App.jsx
  };

  return (
    // This is the modal backdrop
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // Close modal if clicking on the backdrop
    >
      {/* This is the modal content */}
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 m-4"
        onClick={e => e.stopPropagation()} // Stop click from bubbling up to the backdrop
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Find Your Schemes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">Answer a few questions to get a personalized list.</p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* --- Question 1: State --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What is your state?</label>
              <select 
                name="state" 
                value={answers.state} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {quizQuestions.states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* --- Question 2: Land --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What do you own?</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input type="checkbox" name="ownsLand" checked={answers.ownsLand} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <span className="ml-2 text-gray-700">I own farmland (7/12)</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" name="isTenant" checked={answers.isTenant} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <span className="ml-2 text-gray-700">I am a tenant</span>
                </label>
              </div>
            </div>

            {/* --- Question 3: Category --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What is your category?</label>
              <select 
                name="category" 
                value={answers.category} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {quizQuestions.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* --- Question 4: Need --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What do you need help with?</label>
              <select 
                name="need" 
                value={answers.need} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {quizQuestions.needs.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg mt-6 hover:bg-blue-700 transition-all"
          >
            Find My Schemes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EligibilityQuiz;