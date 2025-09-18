// src/components/SignatureUploader.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Check } from 'lucide-react';

const SignatureUploader = ({ onSave }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Clean up the object URL to prevent memory leaks
    useEffect(() => {
        // This is the cleanup function that runs when the component unmounts
        // or before the effect runs again.
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            // Create a temporary URL for the selected image to show a preview
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setPreviewUrl(null);
            alert("Please select a valid image file (PNG, JPG, etc.).");
        }
    };

    // This function triggers the hidden file input
    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        // Reset the file input value so the user can select the same file again if they want
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const handleSign = () => {
        if (!selectedFile) {
            alert("Please upload a signature image first.");
            return;
        }
        // Pass the actual file object to the parent component
        onSave(selectedFile);
    };

    return (
        <div className="border rounded-lg p-4 text-center">
            {previewUrl ? (
                // --- View when an image is selected ---
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Signature Preview:</p>
                    <div className="relative inline-block">
                        <img src={previewUrl} alt="Signature Preview" className="max-h-28 border bg-white p-1 rounded-md" />
                        <button 
                            onClick={handleRemoveImage} 
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            ) : (
                // --- View when no image is selected ---
                <div className="flex flex-col items-center justify-center h-full p-4 border-2 border-dashed rounded-md">
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden" // The actual file input is hidden
                    />
                    <button 
                        onClick={handleUploadClick}
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200">
                        <Upload size={16} />
                        <span>Upload Signature</span>
                    </button>
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG, or SVG file.</p>
                </div>
            )}
            
            {/* --- The final sign button --- */}
            <div className="mt-4 pt-4 border-t">
                 <button 
                    onClick={handleSign} 
                    disabled={!selectedFile}
                    className="w-full flex items-center justify-center space-x-2 text-sm font-semibold bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <Check size={16} />
                    <span>Accept & Sign with Uploaded File</span>
                </button>
            </div>
        </div>
    );
};

export default SignatureUploader;