

import React, { useState } from "react";
import FormInput from "../farmer_components/CreateListing/FormInput";
import FormSelect from "../farmer_components/CreateListing/FormSelect";
import { supabase } from "../supabaseClient"; // Make sure this path is correct

const API_URL = "http://localhost:8000/api/croplists/";

export default function CreateListingPage() {
  const [formData, setFormData] = useState({
    cropType: "",
    quantityValue: "",
    quantityUnit: "kg",
    harvestDate: "",
    location: "",
    price: "",
    farmingPractice: "Conventional",
    soilType: "",
    irrigationSource: "",
    // ADDED: State to hold the image file object
    imageFile: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imageUploadStatus, setImageUploadStatus] = useState("");

  const token = localStorage.getItem("authToken");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ADDED: A specific handler for the file input
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, imageFile: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setImageUploadStatus("");

    let imageUrl = null;

    try {
      if (!token) {
        throw new Error("Authentication token is missing. Please log in.");
      }

      // Step 1: Upload image to Supabase if it exists
      if (formData.imageFile) {
        setImageUploadStatus("Uploading image...");
        const fileName = `${Date.now()}-${formData.imageFile.name}`;
        
        // IMPORTANT: Make sure "crop-images" is your actual Supabase bucket name
        const { error: uploadError } = await supabase.storage
          .from("crop-images")
          .upload(`FarmerListing/${fileName}`, formData.imageFile);

        if (uploadError) throw new Error(`Image Upload Failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from("crop-images")
          .getPublicUrl(`FarmerListing/${fileName}`);
          
        imageUrl = urlData.publicUrl;
        setImageUploadStatus("Image uploaded successfully!");
      }
      
      // Step 2: Prepare data for your backend, including the img_url
      const backendData = {
        crop_type: formData.cropType,
        quantity: parseFloat(formData.quantityValue),
        unit: formData.quantityUnit,
        expected_price_per_unit: formData.price,
        harvest_date: formData.harvestDate,
        location: formData.location,
        farming_practice: formData.farmingPractice,
        soil_type: formData.soilType, // Using lowercase to match the final backend model
        irrigation_source: formData.irrigationSource,
        img_url: imageUrl, // Pass the URL to the backend
      };

      // Step 3: Send data to your FastAPI backend
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create listing");
      }

      alert("Crop listing created successfully!");
      // Reset form logic... (you might want to clear the file input as well)
            // --- 6. Handle Success ---
      const createdListing = await response.json();
      console.log("Listing created successfully:", createdListing);
      alert("Crop listing created successfully!");

      // Reset form
      setFormData({
        cropType: "",
        quantityValue: "",
        quantityUnit: "kg",
        harvestDate: "",
        location: "",
        price: "",
        farmingPractice: "Conventional",
        soilType: "",
        irrigationSource: "",
        imageFile: null,
      });
    } catch (err) {
      console.error("Submission Error:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- 9. Render ---
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Create New Crop Listing
      </h1>

      {/* --- ADDED: Display error message --- */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative max-w-4xl mx-auto mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto"
      >
        {/* ... (The rest of your form JSX is unchanged) ... */}
        
        {/* Core Details */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-6">
            Core Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Crop Type */}
            <FormSelect
              name="cropType"
              label="Crop Type"
              value={formData.cropType}
              onChange={handleChange}
              required // --- ADDED: Mark required fields ---
            >
              <option value="">Select a crop</option>
              <option value="Cotton">Cotton</option>
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Banana">Banana</option>
            </FormSelect>

            {/* Quantity + Unit */}
            <div>
              <div className="flex items-start gap-3">
                <div className="flex-grow">
                  <FormInput
                    label="Expected Quantity"
                    name="quantityValue"
                    type="number"
                    value={formData.quantityValue}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                    required // --- ADDED ---
                  />
                </div>
                <div className="w-1/3">
                  <FormSelect
                    name="quantityUnit"
                    label="Unit"
                    value={formData.quantityUnit}
                    onChange={handleChange}
                    required // --- ADDED ---
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="ton">ton</option>
                  </FormSelect>
                </div>
              </div>
            </div>

            {/* Harvest Date */}
            <FormInput
              label="Expected Harvest/Maturity Date"
              name="harvestDate"
              type="date"
              value={formData.harvestDate}
              onChange={handleChange}
              required // --- ADDED ---
            />

            {/* Location */}
            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Nagpur, Maharashtra"
              required // --- ADDED ---
            />

            {/* Price */}
            <FormInput
              label="Selling Price per unit"
              name="price"
              type="number" // --- MODIFIED: Use number for better input ---
              step="0.01" // Allows decimals
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 200"
              required // --- ADDED ---
            />

            {/* Farming Practice */}
            <FormSelect
              name="farmingPractice"
              label="Farming Practice (Optional)"
              value={formData.farmingPractice}
              onChange={handleChange}
            >
              <option value="Conventional">Conventional</option>
              <option value="Organic">Organic</option>
              <option value="Natural">Natural</option>
            </FormSelect>
          </div>
        </section>

        {/* Extra Add-ons */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-6">
            Extra Add-ons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              name="soilType"
              label="Soil Type"
              value={formData.soilType}
              onChange={handleChange}
              required // --- ADDED ---
            >
              <option value="">Select soil type</option>
              <option value="Alluvial">Alluvial</option>
              <option value="Black">Black</option>
              <option value="Red">Red</option>
              <option value="Laterite">Laterite</option>
            </FormSelect>

            <FormSelect
              name="irrigationSource"
              label="Irrigation Source"
              value={formData.irrigationSource}
              onChange={handleChange}
            >
              <option value="">Select irrigation source (Optional)</option>
              <option value="Rain-fed">Rain-fed</option>
              <option value="Canal">Canal</option>
              <option value="Drip">Drip</option>
              <option value="Borewell">Borewell</option>
            </FormSelect>

            {/* ADDED: The Image Upload Input Field */}
            <div className="md:col-span-2">
              <FormInput 
                label="Upload Crop Image (Optional)" 
                name="image" 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*" 
              />
              {imageUploadStatus && <p className="mt-2 text-sm text-gray-500">{imageUploadStatus}</p>}
            </div>

          </div>
        </section>

        {/* Submit */}
        <div className="mt-8 text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-base font-medium
                       rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                       disabled:bg-gray-400"
          >
            {isSubmitting ? "Creating Listing..." : "Create Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}