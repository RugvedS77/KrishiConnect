import React, { useState } from "react";
// Corrected paths to match your structure
import FormInput from "../farmer_components/CreateListing/FormInput";
import FormSelect from "../farmer_components/CreateListing/FormSelect";
// import ImageUpload from "../farmer_components/CreateListing/ImageUpload"; // Removed
// import { supabase } from "../supabaseClient"; // Removed

export default function CreateListingPage() {
  // --- 1. State ---
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
  });

  // const [imagePreviews, setImagePreviews] = useState([]); // Removed
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from isUploading

  // --- 2. Handle form field changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- 3. Upload images to Supabase --- (REMOVED)

  // --- 4. Handle form submit (NOW MOCKED) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // --- Final data ---
    // This is the data that *would* be sent to your backend
    const finalData = {
      ...formData,
      quantity: `${formData.quantityValue} ${formData.quantityUnit}`,
    };

    // Clean up the object
    delete finalData.quantityValue;
    delete finalData.quantityUnit;

    // --- Mock API request ---
    console.log("Mock Submit - Final Data:", finalData);

    // Simulate network delay
    setTimeout(() => {
      console.log("Mock listing created successfully.");
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
      });
      
      // We no longer need to reset image previews
      // setImagePreviews([]); // Removed
      
      setIsSubmitting(false);
    }, 1500); // 1.5-second delay
  };

  // --- 5. Render ---
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Create New Crop Listing
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto"
      >
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
            >
              <option value="">Select a crop</option>
              <option value="Cotton">Cotton</option>
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Sugarcane">Sugarcane</option>
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
                  />
                </div>
                <div className="w-1/3">
                  <FormSelect
                    name="quantityUnit"
                    label="Unit"
                    value={formData.quantityUnit}
                    onChange={handleChange}
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
            />

            {/* Location */}
            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="GI Tag or GPS Coordinates"
            />

            {/* Price */}
            <FormInput
              label="Selling Price per unit"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., ₹200 per quintal"
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
              <option value="">Select irrigation source</option>
              <option value="Rain-fed">Rain-fed</option>
              <option value="Canal">Canal</option>
              <option value="Drip">Drip</option>
              <option value="Borewell">Borewell</option>
            </FormSelect>
          </div>
        </section>

        {/* Image Upload (REMOVED) */}
        {/*
        <ImageUpload
          imagePreviews={imagePreviews}
          setImagePreviews={setImagePreviews}
        />
        */}

        {/* Submit */}
        <div className="mt-8 text-right">
          <button
            type="submit"
            disabled={isSubmitting} // Changed from isUploading
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