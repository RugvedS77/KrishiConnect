import React, { useCallback, useRef, useState, useEffect } from 'react';

const FileUpload = ({ onFileChange }) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      onFileChange(file); // Pass the file up to the parent component

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileChange]);

  useEffect(() => {
    return () => {
      if (previewImage) {
        // No explicit revoking needed for Data URLs (reader.result),
        // but good practice if using URL.createObjectURL
      }
    };
  }, [previewImage]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="p-5 md:p-6 bg-white rounded-xl shadow-lg font-roboto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">Heal your crop</h2>

      {/* Workflow Steps */}
      <div className="flex items-start justify-around text-center mb-8 gap-2">
        {/* Step 1: Take a picture */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
            {/* Camera with leaf icon */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
              <path fillRule="evenodd" clipRule="evenodd" d="M14 4H10C9.44772 4 9 4.44772 9 5V6H7C5.89543 6 5 6.89543 5 8V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8C19 6.89543 18.1046 6 17 6H15V5C15 4.44772 14.5523 4 14 4ZM12 18C14.7614 18 17 15.7614 17 13C17 10.2386 14.7614 8 12 8C9.23858 8 7 10.2386 7 13C7 15.7614 9.23858 18 12 18ZM13.5 13C13.5 13.8284 12.8284 14.5 12 14.5C11.1716 14.5 10.5 13.8284 10.5 13C10.5 12.1716 11.1716 11.5 12 11.5C12.8284 11.5 13.5 12.1716 13.5 13Z" fill="currentColor"/>
              <path d="M19.5 7.5C19.5 7.77614 19.2761 8 19 8C18.7239 8 18.5 7.77614 18.5 7.5C18.5 7.22386 18.7239 7 19 7C19.2761 7 19.5 7.22386 19.5 7.5Z" fill="currentColor"/>
            </svg>
          </div>
          <p className="text-sm text-gray-700 font-medium whitespace-nowrap">Take a picture</p>
        </div>

        {/* Arrow 1 */}
        <div className="text-gray-400 self-center mx-1 md:mx-2 mt-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Step 2: See diagnosis */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-2">
            {/* Clipboard/Document Icon */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
              <path fillRule="evenodd" clipRule="evenodd" d="M8 4H16V6H8V4ZM6 8V20C6 20.5523 6.44772 21 7 21H17C17.5523 21 18 20.5523 18 20V8C18 7.44772 17.5523 7 17 7H7C6.44772 7 6 7.44772 6 8ZM10 11H14V12H10V11ZM10 14H14V15H10V14ZM10 17H14V18H10V17Z" fill="currentColor"/>
            </svg>
          </div>
          <p className="mt-2 text-sm text-gray-700 font-medium whitespace-nowrap">See diagnosis</p>
        </div>

        {/* Arrow 2 */}
        <div className="text-gray-400 self-center mx-1 md:mx-2 mt-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Step 3: Get medicine */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-2">
            {/* Medicine bottle icon */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C9.23858 2 7 4.23858 7 7V17C7 19.7614 9.23858 22 12 22C14.7614 22 17 19.7614 17 17V7C17 4.23858 14.7614 2 12 2ZM10 11H14V12H10V11ZM10 14H14V15H10V14ZM10 17H14V18H10V17ZM12 4C10.3431 4 9 5.34315 9 7V9H15V7C15 5.34315 13.6569 4 12 4Z" fill="currentColor"/>
            </svg>
          </div>
          <p className="mt-2 text-sm text-gray-700 font-medium whitespace-nowrap">Get medicine</p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* "Take a picture" Button - Now in Green */}
      <button
        onClick={handleButtonClick}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        Take a picture
      </button>

      {/* Image Preview Area */}
      {previewImage && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center flex flex-col items-center">
          <h3 className="text-md font-semibold text-gray-700 mb-3">Your Uploaded Image:</h3>
          <img
            src={previewImage}
            alt="Uploaded Crop"
            className="max-w-full h-auto max-h-72 rounded-md object-contain shadow-sm border border-gray-200"
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;