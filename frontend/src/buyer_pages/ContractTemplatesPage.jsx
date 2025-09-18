// src/pages/ContractTemplatesPage.jsx

import React, { useState } from 'react';
// ✅ CHANGED: Import useParams instead of useSearchParams
import { useParams, Link } from 'react-router-dom';
import { cropListings, buyerDetails } from '../assets/data'; // Import mock data
import { ArrowLeft, Send } from 'lucide-react';

const ContractTemplatesPage = () => {
  // ✅ CHANGED: Use useParams to get the cropId from the URL
  const { cropId: cropIdFromParams } = useParams();
  const [selectedTemplate, setSelectedTemplate] = useState('simple-supply'); // Default to first template
  
  // ✅ CHANGED: Parse the ID from the params
  const cropId = parseInt(cropIdFromParams);
  const crop = cropListings.find(c => c.id === cropId);

  const templates = [
    { id: 'simple-supply', title: 'Simple Supply Contract' },
    { id: 'price-assurance', title: 'Price Assurance Contract' },
    { id: 'buyback-support', title: 'Buyback / Input-Support' },
    { id: 'milestone-payment', title: 'Milestone-Based Payment' },
  ];

  if (!crop) {
    // I've made the error slightly more helpful for debugging
    return <div>Error: Crop not found. (Attempted to find ID: {cropIdFromParams})</div>;
  }
  
  const renderForm = () => {
    switch (selectedTemplate) {
      case 'simple-supply': return <SimpleSupplyForm crop={crop} buyer={buyerDetails} />;
      case 'price-assurance': return <PriceAssuranceForm crop={crop} buyer={buyerDetails} />;
      case 'buyback-support': return <BuybackSupportForm crop={crop} buyer={buyerDetails} />;
      case 'milestone-payment': return <MilestonePaymentForm crop={crop} buyer={buyerDetails} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center space-x-3">
        {/* ✅ CHANGED: Link is now relative, so it goes back to /buyer/browse */}
        <Link to="../browse" className="p-2 rounded-full hover:bg-gray-200">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Propose a Contract</h1>
          <p className="text-gray-600 mt-1">Select a template and fill in the details for <strong>{crop.name}</strong>.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* --- LEFT COLUMN: Template Selector --- */}
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm border h-fit sticky top-6">
          <h2 className="font-semibold mb-3">Contract Types</h2>
          <div className="space-y-2">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                  selectedTemplate === template.id
                    ? 'bg-green-600 text-white font-semibold'
                    : 'hover:bg-gray-100'
                }`}
              >
                {template.title}
              </button>            ))}
          </div>
        </div>

        {/* --- RIGHT COLUMN: Dynamic Form --- */}
        <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-sm border">
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

// --- Reusable Form Components ---

const FormField = ({ label, type = 'text', defaultValue, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full p-2 border rounded-md bg-gray-50 focus:ring-green-500 focus:border-green-500"
    />
  </div>
);

const PartiesSection = ({ crop, buyer }) => (
  <section>
    <h2 className="text-xl font-semibold border-b pb-2 mb-4">Parties Involved</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div><p className="font-medium text-gray-500">Farmer</p><p>{crop.farmer} ({crop.location})</p></div>
      <div><p className="font-medium text-gray-500">Buyer</p><p>{buyer.name} ({buyer.address})</p></div>
    </div>
  </section>
);

const AgreementSection = () => (
    <section className="mt-8 pt-6 border-t">
      <h2 className="text-xl font-semibold mb-3">Digital Agreement & Submission</h2>
      <div className="flex items-start bg-gray-50 p-3 rounded-md">
        <input type="checkbox" id="agree" className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
        <label htmlFor="agree" className="ml-3 text-sm text-gray-600">
          By checking this box, I confirm the details are accurate and agree to propose this contract to the farmer.
        </label>
      </div>
      <button className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 text-base">
        <Send size={20} />
        <span>Send Proposal to Farmer</span>
      </button>
    </section>
);


// --- Specific Form Implementations ---

const SimpleSupplyForm = ({ crop, buyer }) => (
  <form className="space-y-8">
    <PartiesSection crop={crop} buyer={buyer} />
    <section>
      <h2 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Crop Type" defaultValue={crop.name} />
        <FormField label="Quantity to Buy (Tons)" placeholder="e.g., 100" />
        <FormField label="Price per Unit" defaultValue={crop.price} />
        <FormField label="Delivery Date" type="date" />
        <FormField label="Delivery Location" placeholder="e.g., Buyer's Warehouse, Mumbai" />
      </div>
    </section>
    <AgreementSection />
  </form>
);

const PriceAssuranceForm = ({ crop, buyer }) => (
    <form className="space-y-8">
      <PartiesSection crop={crop} buyer={buyer} />
      <section>
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Crop Type" defaultValue={crop.name} />
            <FormField label="Farming Area (Acres)" placeholder="e.g., 5" />
            <FormField label="Fixed Price per Unit" placeholder="e.g., $260/Ton" />
            <FormField label="Contract Duration" defaultValue="Current Harvest Season" />
            <FormField label="Delivery Schedule" placeholder="e.g., Weekly after harvest" />
        </div>
      </section>
      <AgreementSection />
    </form>
);

const BuybackSupportForm = ({ crop, buyer }) => (
    <form className="space-y-8">
      <PartiesSection crop={crop} buyer={buyer} />
      <section>
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Crop Type" defaultValue={crop.name} />
            <FormField label="Buyback Price per Unit" placeholder="e.g., $240/Ton" />
            <FormField label="Quality Standards" defaultValue="Grade A, less than 5% moisture" />
        </div>
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Inputs Provided by Buyer</label>
            <textarea className="w-full p-2 border rounded-md bg-gray-50" rows="3" placeholder="e.g., 50kg Certified Seeds, 20L Fertilizer..."></textarea>
        </div>
      </section>
      <AgreementSection />
    </form>
);

const MilestonePaymentForm = ({ crop, buyer }) => (
    <form className="space-y-8">
      <PartiesSection crop={crop} buyer={buyer} />
      <section>
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Payment Milestones</h2>
        <p className="text-sm text-gray-600 mb-4">Payments will be released from escrow upon farmer's submission of proof for each milestone.</p>
        <div className="space-y-4">
            <FormField label="Milestone 1: Sowing (20% Payment)" placeholder="e.g., $10,000" />
            <FormField label="Milestone 2: Mid-Growth (30% Payment)" placeholder="e.g., $15,000" />
            <FormField label="Milestone 3: Harvest & Delivery (50% Payment)" placeholder="e.g., $25,000" />
        </div>
      </section>
      <AgreementSection />
    </form>
);


export default ContractTemplatesPage;