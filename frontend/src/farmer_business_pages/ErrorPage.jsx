import React from 'react';
import { Link } from 'react-router-dom';

/**
 * A simple 404 Error Page component using only Tailwind CSS.
 * No custom CSS or animation is included.
 */
export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-8 text-center">
      <div className="max-w-2xl">
        
        {/* Static 404 Numbers */}
        <div className="mb-6 text-[12rem] font-black leading-none text-gray-700">
          <span>4</span>
          {/* The '0' is styled with a different color but is not animated */}
          <span className="text-blue-500">0</span>
          <span>4</span>
        </div>

        {/* The error message */}
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Page Not Found
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Oops! The page you're looking for doesn't exist. 
          It might have been moved or deleted.
        </p>

        {/* The link back to the dashboard */}
        <Link
          to="/"
          className="inline-block rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white shadow-md transition-colors duration-300 hover:bg-blue-600"
        >
          Go Back to Dashboard
        </Link>
      </div>
    </div>
  );
}