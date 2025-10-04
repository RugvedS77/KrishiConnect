import React, { useEffect } from 'react';

export default function ImageUpload({ imagePreviews, setImagePreviews }) {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      url: URL.createObjectURL(file),
      fileObject: file,
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (idToRemove, urlToRevoke) => {
    URL.revokeObjectURL(urlToRevoke);
    setImagePreviews(prev => prev.filter(preview => preview.id !== idToRemove));
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-6">
        Photos
      </h2>
      
      {imagePreviews.length > 0 && (
        <div className="mb-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {imagePreviews.map(preview => (
            <div key={preview.id} className="relative aspect-square">
              <img src={preview.url} alt="Crop preview"
                   className="w-full h-full object-cover rounded-lg shadow-md" />
              <button type="button"
                onClick={() => handleRemoveImage(preview.id, preview.url)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full 
                           flex items-center justify-center text-sm font-bold shadow-lg 
                           hover:bg-red-600 transition-all"
                aria-label="Remove image">
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <label htmlFor="file-upload" className="relative cursor-pointer font-medium text-blue-600 hover:text-blue-500">
          <span>Add more photos</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            multiple
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
          />
        </label>
        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
      </div>
    </section>
  );
}