import React, { useState } from 'react';
import FormInput from '../components/CreateListing/FormInput';
import FormSelect  from '../components/CreateListing/FormSelect';
import ImageUpload from '../components/CreateListing/ImageUpload';

export default function CreateListingPage() {
  const [formData, setFormData] = useState({
    cropType: '',
    quantity: '',
    harvestDate: '',
    location: '',
    price: '',
    farmingPractice: 'Conventional',
    soilType: '',
    irrigationSource: '',
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const filesToUpload = imagePreviews.map(p => p.fileObject);

    console.log('Form Data Submitted:', formData);
    console.log('Files to Upload:', filesToUpload);

    alert('Crop listing created! (Check console for data)');
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Crop Listing</h1>

      <form onSubmit={handleSubmit}
            className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto">

        {/* --- Core Fields --- */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-6">
            Core Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect name="cropType" label="Crop Type" value={formData.cropType} onChange={handleChange}>
              <option value="">Select a crop</option>
              <option value="Cotton">Cotton</option>
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Sugarcane">Sugarcane</option>
            </FormSelect>

            <FormInput label="Expected Quantity" name="quantity" value={formData.quantity}
                       onChange={handleChange} placeholder="e.g., 10 tons, 50 quintals" />

            <FormInput label="Expected Harvest/Maturity Date" name="harvestDate" type="date"
                       value={formData.harvestDate} onChange={handleChange} />

            <FormInput label="Location" name="location" value={formData.location}
                       onChange={handleChange} placeholder="GI Tag or GPS Coordinates" />

            <FormInput label="Selling Price per unit" name="price" value={formData.price}
                       onChange={handleChange} placeholder="e.g., $200 per quintal" />

            <FormSelect name="farmingPractice" label="Farming Practice (Optional)"
                        value={formData.farmingPractice} onChange={handleChange}>
              <option value="Conventional">Conventional</option>
              <option value="Organic">Organic</option>
              <option value="Natural">Natural</option>
            </FormSelect>
          </div>
        </section>

        {/* --- Extra Add-ons --- */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-6">
            Extra Add-ons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect name="soilType" label="Soil Type" value={formData.soilType} onChange={handleChange}>
              <option value="">Select soil type</option>
              <option value="Alluvial">Alluvial</option>
              <option value="Black">Black</option>
              <option value="Red">Red</option>
              <option value="Laterite">Laterite</option>
            </FormSelect>

            <FormSelect name="irrigationSource" label="Irrigation Source"
                        value={formData.irrigationSource} onChange={handleChange}>
              <option value="">Select irrigation source</option>
              <option value="Rain-fed">Rain-fed</option>
              <option value="Canal">Canal</option>
              <option value="Drip">Drip</option>
              <option value="Borewell">Borewell</option>
            </FormSelect>
          </div>
        </section>

        {/* --- Photos (ImageUpload component) --- */}
        <ImageUpload imagePreviews={imagePreviews} setImagePreviews={setImagePreviews} />

        {/* --- Submit --- */}
        <div className="mt-8 text-right">
          <button type="submit"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-base font-medium
                             rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Create Listing
          </button>
        </div>
      </form>
    </div>
  );
}