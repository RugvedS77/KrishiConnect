// import React, { useState } from 'react';
// import FormInput from '../components/CreateListing/FormInput';
// import FormSelect  from '../components/CreateListing/FormSelect';
// import ImageUpload from '../components/CreateListing/ImageUpload';

// export default function CreateListingPage() {
//   const [formData, setFormData] = useState({
//     cropType: '',
//     quantity: '',
//     harvestDate: '',
//     location: '',
//     price: '',
//     farmingPractice: 'Conventional',
//     soilType: '',
//     irrigationSource: '',
//   });

//   const [imagePreviews, setImagePreviews] = useState([]);

//   // Handle input change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   // Submit
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const filesToUpload = imagePreviews.map(p => p.fileObject);

//     console.log('Form Data Submitted:', formData);
//     console.log('Files to Upload:', filesToUpload);

//     alert('Crop listing created! (Check console for data)');
//   };

//   return (
//     <div className="p-6 md:p-8">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Crop Listing</h1>

//       <form onSubmit={handleSubmit}
//             className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto">

//         {/* --- Core Fields --- */}
//         <section>
//           <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-6">
//             Core Details
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <FormSelect name="cropType" label="Crop Type" value={formData.cropType} onChange={handleChange}>
//               <option value="">Select a crop</option>
//               <option value="Cotton">Cotton</option>
//               <option value="Rice">Rice</option>
//               <option value="Wheat">Wheat</option>
//               <option value="Sugarcane">Sugarcane</option>
//             </FormSelect>

//             <FormInput label="Expected Quantity" name="quantity" value={formData.quantity}
//                        onChange={handleChange} placeholder="e.g., 10 tons, 50 quintals" />

//             <FormInput label="Expected Harvest/Maturity Date" name="harvestDate" type="date"
//                        value={formData.harvestDate} onChange={handleChange} />

//             <FormInput label="Location" name="location" value={formData.location}
//                        onChange={handleChange} placeholder="GI Tag or GPS Coordinates" />

//             <FormInput label="Selling Price per unit" name="price" value={formData.price}
//                        onChange={handleChange} placeholder="e.g., $200 per quintal" />

//             <FormSelect name="farmingPractice" label="Farming Practice (Optional)"
//                         value={formData.farmingPractice} onChange={handleChange}>
//               <option value="Conventional">Conventional</option>
//               <option value="Organic">Organic</option>
//               <option value="Natural">Natural</option>
//             </FormSelect>
//           </div>
//         </section>

//         {/* --- Extra Add-ons --- */}
//         <section className="mt-8">
//           <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-6">
//             Extra Add-ons
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <FormSelect name="soilType" label="Soil Type" value={formData.soilType} onChange={handleChange}>
//               <option value="">Select soil type</option>
//               <option value="Alluvial">Alluvial</option>
//               <option value="Black">Black</option>
//               <option value="Red">Red</option>
//               <option value="Laterite">Laterite</option>
//             </FormSelect>

//             <FormSelect name="irrigationSource" label="Irrigation Source"
//                         value={formData.irrigationSource} onChange={handleChange}>
//               <option value="">Select irrigation source</option>
//               <option value="Rain-fed">Rain-fed</option>
//               <option value="Canal">Canal</option>
//               <option value="Drip">Drip</option>
//               <option value="Borewell">Borewell</option>
//             </FormSelect>
//           </div>
//         </section>

//         {/* --- Photos (ImageUpload component) --- */}
//         <ImageUpload imagePreviews={imagePreviews} setImagePreviews={setImagePreviews} />

//         {/* --- Submit --- */}
//         <div className="mt-8 text-right">
//           <button type="submit"
//                   className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-base font-medium
//                              rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300
//                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
//             Create Listing
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }


import React, { useState } from 'react';
import FormInput from '../components/CreateListing/FormInput';
import FormSelect from '../components/CreateListing/FormSelect';
import ImageUpload from '../components/CreateListing/ImageUpload';
import { supabase } from '../supabaseClient'; // Make sure the path is correct

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
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const uploadImages = async () => {
    const imageUrls = [];
    for (const preview of imagePreviews) {
      const file = preview.fileObject;
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
      // The key change is here: prefix the filename with the folder name
      const filePath = `FarmerListing/${fileName}`; 

      const { data, error } = await supabase.storage
        .from('CropImages') // Your bucket name
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error);
        return null; // Stop and return null if any upload fails
      }
      
      const { publicURL, error: urlError } = supabase.storage
        .from('CropImages')
        .getPublicUrl(data.path);

      if (urlError) {
        console.error('Error getting public URL:', urlError);
        imageUrls.push(null); // Push a null if URL retrieval fails
      } else {
        imageUrls.push(publicURL);
      }
    }
    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    if (imagePreviews.length === 0) {
      alert("Please upload at least one image.");
      setIsUploading(false);
      return;
    }

    try {
      const uploadedUrls = await uploadImages();
      
      if (!uploadedUrls) {
        alert("Image upload failed. Please try again.");
        return;
      }
      
      // Combine the array of URLs into a single comma-separated string
      const imageUrlsAsString = uploadedUrls.filter(url => url !== null).join(',');

      // Prepare the data to be sent to your FastAPI backend
      const finalData = { ...formData, photo_url: imageUrlsAsString };

      const response = await fetch('http://localhost:8000/api/croplists/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming your backend requires a token for this endpoint
          // 'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}. Detail: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Listing created successfully:', result);
      alert('Crop listing created successfully!');
      
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Submission failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Crop Listing</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        {/* All your FormInput and FormSelect components here */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-6">Core Details</h2>
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
        <ImageUpload imagePreviews={imagePreviews} setImagePreviews={setImagePreviews} />
        <div className="mt-8 text-right">
          <button type="submit" disabled={isUploading}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-base font-medium
                             rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {isUploading ? 'Creating Listing...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}