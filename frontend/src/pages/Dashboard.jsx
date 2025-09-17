import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  // Dummy data
  const walletBalance = '3,450.00';
  const ongoingContracts = 3;
  const pendingProposals = 5;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* --- Quick Summary Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* 1. Wallet Balance Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Wallet Balance
            </p>
            <p className="text-3xl font-bold text-gray-900">
              ${walletBalance}
            </p>
          </div>
          {/* (Theme changed to blue) */}
          <div className="bg-blue-100 p-3 rounded-full">
            <i className="fas fa-wallet text-3xl text-blue-600"></i>
          </div>
        </div>

        {/* 2. Ongoing Contracts Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Ongoing Contracts
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {ongoingContracts}
            </p>
          </div>
          {/* (Theme changed to blue) */}
          <div className="bg-blue-100 p-3 rounded-full">
            <i className="fas fa-file-signature text-3xl text-blue-600"></i>
          </div>
        </div>

        {/* 3. Pending Proposals Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Pending Proposals
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {pendingProposals}
            </p>
          </div>
          {/* (Theme changed to blue) */}
          <div className="bg-blue-100 p-3 rounded-full">
            <i className="fas fa-inbox text-3xl text-blue-600"></i>
          </div>
        </div>
      </div>

      {/* --- Quick Link Button --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready to sell your crops?</h2>
        <p className="text-gray-600 mb-6">
          Create a new crop listing to attract proposals from interested buyers.
        </p> {/* <-- This line is now correctly closed */}
        <Link
          to="/create-listing" // This path matches your sidebar link
          // (Theme changed to blue)
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <i className="fas fa-plus-circle mr-2"></i>
          Create Crop Listing
        </Link>
      </div>
    </div>
  );
}