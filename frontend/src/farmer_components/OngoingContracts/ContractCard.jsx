import React, { useState } from 'react'; // <-- 1. IMPORT useState
import MilestoneStep from './MilestoneStep';

// <-- 2. ACCEPT isSubmitting PROP
export default function ContractCard({ contract, onSubmitUpdate, isSubmitting }) {
  
  // --- 3. ADD LOCAL STATE for the textarea ---
  const [updateText, setUpdateText] = useState("");

  const handleSubmit = () => {
    // --- 4. PASS THE STATE (updateText) to the parent function ---
    onSubmitUpdate(contract.id, updateText);
    // Optionally clear the text after submit
    // setUpdateText(""); 
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Card Header (Unchanged) */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-semibold text-green-600">
            {contract.buyerName}
          </h2>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            ID: {contract.id}
          </span>
        </div>
        <p className="text-lg text-gray-800 mt-1">{contract.cropType}</p>
        <div className="flex justify-between text-sm mt-2">
          <span className="font-medium text-gray-900">{contract.price}</span>
          <span className="text-gray-600">{contract.timeline}</span>
        </div>
      </div>

      {/* Card Body (Unchanged Milestone Tracker) */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Milestone Progress
          </h3>
          <div className="space-y-0">
            {contract.milestones.map((milestone, index) => (
              <MilestoneStep
                key={milestone.id}
                name={milestone.name}
                status={milestone.status}
                isLast={index === contract.milestones.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Right: Requirements & Uploads */}
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-green-800 flex items-center">
              <i className="fas fa-clipboard-list mr-2"></i>
              Buyer-specific Requirements
            </h4>
            <p className="text-sm text-green-700 mt-2">
              {contract.buyerRequirements}
            </p>
          </div>

          {/* Upload Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Upload Update for "{contract.currentMilestoneToUpdate}"
            </h4>
            <div className="space-y-4">
              <textarea
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-green-500 disabled:bg-gray-100"
                placeholder="Add your text update for the buyer..."
                value={updateText} // <-- 5. MAKE TEXTAREA CONTROLLED
                onChange={(e) => setUpdateText(e.target.value)} // <-- 6. UPDATE STATE
                disabled={isSubmitting} // <-- 7. DISABLE WHEN LOADING
              ></textarea>

              {/* --- 8. IMAGE INPUT REMOVED as requested --- */}

              <button
                onClick={handleSubmit} // <-- 9. CALL LOCAL handleSubmit
                disabled={isSubmitting} // <-- 10. DISABLE WHEN LOADING
                className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
                {/* 11. SHOW LOADING TEXT */}
                {isSubmitting ? "Submitting..." : "Submit Update"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}