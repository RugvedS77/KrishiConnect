import React from 'react';

export default function FormSelect({ label, name, value, onChange, children }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                   focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {children}
      </select>
    </div>
  );
}
