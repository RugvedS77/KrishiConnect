import React from 'react';

export default function EmptyState() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center border-2 border-dashed border-gray-300">
      <div className="mx-auto h-12 w-12 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.023.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
        </svg>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-gray-800">All Caught Up</h3>
      <p className="mt-1 text-gray-500">You have no new proposals to review.</p>
    </div>
  );
}
