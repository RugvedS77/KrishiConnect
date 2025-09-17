import React from 'react';
import MilestoneStep from './MilestoneStep';

export default function ContractCard({ contract, onSubmitUpdate }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Card Header: Contract Summary */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-semibold text-blue-600">
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

      {/* Card Body */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Milestone Tracker */}
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
            <h4 className="font-semibold text-blue-800 flex items-center">
              <i className="fas fa-clipboard-list mr-2"></i>
              Buyer-specific Requirements
            </h4>
            <p className="text-sm text-blue-700 mt-2">
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
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a text update (optional)..."
              ></textarea>

              <input
                type="file"
                className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
              />

              <button
                onClick={() => onSubmitUpdate(contract.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
