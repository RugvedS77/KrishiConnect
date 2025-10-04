import React from 'react';

export default function EmptyState() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <i className="fas fa-file-signature text-4xl text-gray-400 mb-3"></i>
      <h3 className="text-xl font-semibold text-gray-800">No Active Contracts</h3>
      <p className="text-gray-500">Accepted proposals will appear here.</p>
    </div>
  );
}
