import React from 'react';

export default function ProfileField({ 
  label, 
  name, 
  value, 
  isEditing, 
  onChange, 
  type = 'text', 
  options = [] 
}) {
  const commonInputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm " +
    "focus:outline-none focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 md:col-span-2">
        {!isEditing ? (
          <div className="pt-1">
            {Array.isArray(value) ? (
              value.length > 0 ? (
                value.map((item, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded-full"
                  >
                    {item}
                  </span>
                ))
              ) : (
                'None'
              )
            ) : (
              value
            )}
          </div>
        ) : (
          <>
            {type === 'select' ? (
              <select
                name={name}
                value={value}
                onChange={onChange}
                className={commonInputClass}
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : type === 'textarea' ? (
              <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows="3"
                className={commonInputClass}
              />
            ) : (
              <input
                type={type}
                name={name}
                value={Array.isArray(value) ? value.join(', ') : value}
                onChange={onChange}
                className={commonInputClass}
              />
            )}
            {Array.isArray(value) && (
              <p className="text-xs text-gray-500 mt-1">
                Enter values separated by a comma.
              </p>
            )}
          </>
        )}
      </dd>
    </div>
  );
}
