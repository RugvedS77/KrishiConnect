import React, { useState, useMemo } from "react";
// MODIFIED: Using useParams to get cropId from the route /propose/:cropId
import { useParams, Link } from "react-router-dom";
import { cropListings, buyerDetails } from "../assets/data"; // Ensure this data file exists
import {
  ArrowLeft,
  Send,
  Edit,
  Eye,
  ShieldCheck,
  PlusCircle,
  XCircle,
  Info,
  CheckSquare,
  FileText,
  Loader2, // For loading spinner
  AlertCircle, // For error icon
  CheckCircle, // NEW: For success icon
} from "lucide-react";

// --- Mock API handler ---
// This is where you'd put your actual fetch/axios call
const api = {
  proposeContract: async (payload) => {
    // This function should call your *new* backend endpoint for creating contracts
    // e.g., POST /api/contracts/propose
    console.log("Submitting to backend:", payload);

    // Get auth token from local storage (as seen in your App.jsx)
    // const token = localStorage.getItem('buyerToken'); // Or whatever your key is
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // --- This is what your REAL fetch call would look like ---
    // const response = await fetch("/api/contracts/propose", { // Your real API path
    //   method: "POST",
    //   headers: { 
    //     "Content-Type": "application/json", 
    //     // "Authorization": `Bearer ${token}` // Include your auth token
    //   },
    //   body: JSON.stringify(payload),
    // });
    // if (!response.ok) {
    //   const err = await response.json();
    //   throw new Error(err.detail || "Failed to submit proposal.");
    // }
    // return response.json();
    // ---------------------------------------------------------

    // Return a mock ID for the new contract
    return { id: 123, status: "proposed" };
  },
};

// --- MAIN PAGE COMPONENT ---
const ContractTemplatesPage = () => {
  // MODIFIED: Get cropId from path params, matching your App.jsx route
  const { cropId: cropIdFromPath } = useParams();
  const cropId = parseInt(cropIdFromPath) || 1;

  const [selectedTemplate, setSelectedTemplate] = useState("simple-supply");
  const [mode, setMode] = useState("info"); // 'info', 'edit', 'preview'

  // --- MODIFIED: State for submission (removed navigation) ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false); // NEW: For success message

  const crop = cropListings.find((c) => c.id === cropId);

  // --- Centralized State for all Form Data ---
  const [formData, setFormData] = useState({
    "simple-supply": {
      quantity: "100",
      price: crop ? crop.price.replace("/Ton", "") : "250",
      milestones: [
        { desc: "Contract Finalization & Escrow Deposit", val: "10" },
        { desc: "Final Delivery & Acceptance", val: "90" },
      ],
    },
    "price-assurance": {
      farmingArea: "5",
      fixedPrice: "260",
      estimatedYield: "10",
      milestones: [
        { desc: "Contract Start & Escrow Deposit", val: "10" },
        { desc: "Mid-Season Progress Report", val: "20" },
        { desc: "Final Harvest Delivery", val: "70" },
      ],
    },
    "buyback-support": {
      buybackPrice: "240",
      qualityStandards: "Grade A, <5% moisture",
      inputsProvided: "50kg Certified Seeds, 20L Fertilizer",
      estimatedTotalValue: "24000",
      milestones: [
        { desc: "Inputs Delivered & Acknowledged", val: "10" },
        { desc: "Mid-Growth Inspection Passed", val: "20" },
        { desc: "Final Produce Buyback", val: "70" },
      ],
    },
    "milestone-payment": {
      totalValue: "50000",
      milestones: [
        { desc: "Sowing Completion & Verification", val: "20" },
        { desc: "Mid-Growth Stage Verified", val: "30" },
        { desc: "Harvest & Final Delivery", val: "50" },
      ],
    },
  });

  const handleFormChange = (templateId, updatedData) => {
    setFormData((prev) => ({ ...prev, [templateId]: updatedData }));
  };

  const templates = [
    {
      id: "simple-supply",
      title: "Simple Supply Contract",
      description: "A one-time purchase of a specific quantity.",
    },
    {
      id: "price-assurance",
      title: "Price Assurance Contract",
      description: "Locks in a fixed price for an entire harvest.",
    },
    {
      id: "buyback-support",
      title: "Buyback / Input-Support",
      description: "Buyer provides inputs and buys back the produce.",
    },
    {
      id: "milestone-payment",
      title: "Milestone-Based Payment",
      description: "Payments are released in stages.",
    },
  ];

  if (!crop) {
    return <div>Error: Crop not found.</div>;
  }

  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    setMode("info");
  };
  
  // --- MODIFIED: Handle Proposal Submission ---
  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false); // Reset success state on new submit

    const currentData = formData[selectedTemplate];

    // Construct the payload for your *new* contract proposal endpoint
    const payload = {
      template_id: selectedTemplate, //error
      crop_id: cropId,
      farmer_id: crop.farmerId, // Assuming crop object has farmerId
      buyer_id: buyerDetails.id, // Assuming buyerDetails has an id
      terms: currentData, // The specific data for this template
    };

    try {
      const result = await api.proposeContract(payload);
      
      // MODIFIED: Set success state instead of navigating
      setSubmitSuccess(true);
      
      // console.log("Proposal successful, new ID:", result.id);
    } catch (error) {
      setSubmitError(error.message || "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderContent = () => {
    const currentData = formData[selectedTemplate];
    const currentSetData = (newData) =>
      handleFormChange(selectedTemplate, newData);
    
    // MODIFIED: Pass down submission handler and states
    const props = {
      crop,
      buyer: buyerDetails,
      formData: currentData,
      setFormData: currentSetData,
      onSubmit: handleProposalSubmit,
      isSubmitting: isSubmitting,
      submitError: submitError,
      submitSuccess: submitSuccess, // NEW: Pass success state
    };

    switch (mode) {
      case "info":
        // ... (All info cases remain unchanged)
        switch (selectedTemplate) {
          case "simple-supply":
            return (
              <InfoPanel
                title="Simple Supply Contract"
                features={{
                  description:
                    "A straightforward agreement for a direct sale, secured by a milestone-based escrow system.",
                  points: [
                    "One-Time Deal: Designed for a single transaction with no long-term commitment.",
                    "Fixed Quantity & Price: Both parties agree on the exact amount of crop to be sold and the exact price per unit (e.g., per Ton or Kg).",
                    "No Long-Term Lock-in: After the transaction is complete, both the buyer and farmer are free to work with others.",
                    "Price is Final: The agreed-upon price is locked in, regardless of whether future market prices go up or down.",
                  ],
                }}
                procedures="Payment is released in stages based on contract finalization and final delivery acceptance. All funds are secured upfront."
              />
            );
          case "price-assurance":
            return (
              <InfoPanel
                title="Price Assurance Contract"
                features={{
                  description:
                    "Lock-in a fixed price for an entire season's harvest, providing stability against market volatility.",
                  points: [
                    "Price Stability: Its main purpose is to set a fixed price per unit that will not change, protecting both parties from market volatility.",
                    "Covers a Whole Harvest: The agreement typically applies to the entire yield from a specific piece of land for a season.",
                    "Guaranteed Income & Cost: The farmer gets a predictable income, and the buyer gets a predictable raw material cost.",
                    "Shared Risk & Reward: Both parties give up the chance for a windfall (if market prices move in their favor) in exchange for security against a loss.",
                  ],
                }}
                procedures="The total estimated value is held in escrow. Funds are released based on milestones like progress reports and final delivery."
              />
            );
          case "buyback-support":
            return (
              <InfoPanel
                title="Buyback / Input-Support Contract"
                features={{
                  description:
                    "The Buyer provides essential inputs to the Farmer and guarantees to buy back the resulting harvest at a pre-agreed price.",
                  points: [
                    "Buyer Provides Support: The buyer supplies essential resources to the farmer, such as high-quality seeds, fertilizers, or technical guidance.",
                    "Exclusive Purchase Agreement: The farmer is obligated to sell the entire harvest produced with these inputs back to the supporting buyer.",
                    "Pre-Agreed Price & Quality: The buyback price and the required quality standards (e.g., organic, size, grade) are defined clearly from the start.",
                    "Quality Control: The buyer has significant influence over the growing process to ensure the final product meets their specific needs.",
                  ],
                }}
                procedures="The value of the contract is secured in escrow. The cost of inputs may be deducted from milestone payments. Funds are released as the Farmer meets production milestones."
              />
            );
          case "milestone-payment":
            return (
              <InfoPanel
                title="Milestone-Based Payment Contract"
                features={{
                  description:
                    "A flexible contract where the total value and payment stages are fully customized by the buyer.",
                  points: [
                    "Payments in Stages: The total contract value is divided into several smaller payments instead of a single lump sum.",
                    "Tied to Verifiable Progress: Each payment is only released after the farmer proves they have completed a specific, pre-defined stage (e.g., sowing, mid-growth, harvesting).",
                    "Improved Farmer Cash Flow: The farmer receives money throughout the growing season, helping them manage operational costs.",
                    "Reduced Buyer Risk: The buyers financial risk is minimized because they are paying for tangible progress, not just a future promise of a harvest.",
                  ],
                }}
                procedures="The custom total value is held in escrow. Funds are released progressively as the farmer completes each custom milestone defined by the buyer."
              />
            );
          default:
            return null;
        }
      case "edit":
        // MODIFIED: Pass props to form components
        switch (selectedTemplate) {
          case "simple-supply":
            return <SimpleSupplyForm {...props} />;
          case "price-assurance":
            return <PriceAssuranceForm {...props} />;
          case "buyback-support":
            return <BuybackSupportForm {...props} />;
          case "milestone-payment":
            return <MilestonePaymentForm {...props} />;
          default:
            return null;
        }
      case "preview":
        // ... (All preview cases remain unchanged)
        switch (selectedTemplate) {
          case "simple-supply":
            return (
              <SimpleSupplyPreview
                data={currentData}
                crop={crop}
                buyer={buyerDetails}
              />
            );
          case "price-assurance":
            return (
              <PriceAssurancePreview
                data={currentData}
                crop={crop}
                buyer={buyerDetails}
              />
            );
          case "buyback-support":
            return (
              <BuybackSupportPreview
                data={currentData}
                crop={crop}
                buyer={buyerDetails}
              />
            );
          case "milestone-payment":
            return (
              <MilestonePaymentPreview
                data={currentData}
                crop={crop}
                buyer={buyerDetails}
              />
            );
          default:
            return null;
        }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center space-x-3">
        {/* MODIFIED: Link back to /buyer/browse */}
        <Link to="/buyer/browse" className="p-2 rounded-full hover:bg-gray-200">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Propose a KrishiConnect Contract
          </h1>
          <p className="text-gray-600 mt-1">
            Select a template for <strong>{crop.name}</strong> to review and
            edit.
          </p>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md h-fit sticky top-6">
          <h2 className="font-semibold mb-3">Contract Types</h2>
          {/* ... (Sidebar navigation remains unchanged) ... */}
          <div className="space-y-1">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  selectedTemplate === template.id
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <p
                  className={`font-semibold text-sm ${
                    selectedTemplate === template.id
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  {template.title}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    selectedTemplate === template.id
                      ? "text-green-100"
                      : "text-gray-500"
                  }`}
                >
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h2 className="font-semibold text-lg text-gray-800">
                {templates.find((t) => t.id === selectedTemplate)?.title}
              </h2>
              {/* ... (Mode toggle buttons remain unchanged) ... */}
              {mode === "info" && (
                <button
                  onClick={() => setMode("edit")}
                  className="px-4 py-2 text-sm font-semibold rounded-md flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700"
                >
                  <Edit size={16} />
                  <span>Fill Out Form</span>
                </button>
              )}
              {mode === "edit" && (
                <button
                  onClick={() => setMode("preview")}
                  className="px-4 py-2 text-sm font-semibold rounded-md flex items-center space-x-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Eye size={16} />
                  <span>Preview Contract</span>
                </button>
              )}
              {mode === "preview" && (
                <button
                  onClick={() => setMode("edit")}
                  className="px-4 py-2 text-sm font-semibold rounded-md flex items-center space-x-2 bg-gray-600 text-white hover:bg-gray-700"
                >
                  <Edit size={16} />
                  <span>Back to Edit</span>
                </button>
              )}
            </div>
            <div className="p-8">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HELPER & REUSABLE COMPONENTS ---
const FormField = ({
  // ... (FormField remains unchanged)
  label,
  name,
  value,
  onChange,
  type = "text",
  as: Component = "input",
  ...props
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <Component
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      className="w-full p-2 border rounded-md bg-gray-50 focus:ring-green-500 focus:border-green-500"
      {...props}
    />
  </div>
);
const PartiesSection = ({ crop, buyer }) => (
  // ... (PartiesSection remains unchanged)
  <section>
    <h3 className="text-xl font-semibold border-b pb-2 mb-4">
      Parties Involved
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div>
        <p className="font-medium text-gray-500">Farmer</p>
        <p>
          {crop.farmer} ({crop.location})
        </p>
      </div>
      <div>
        <p className="font-medium text-gray-500">Buyer</p>
        <p>
          {buyer.name} ({buyer.address})
        </p>
      </div>
    </div>
  </section>
);

// --- MODIFIED: EscrowAgreementSection ---
const EscrowAgreementSection = ({ totalValue, isSubmitting, submitError, submitSuccess }) => (
  <section className="mt-8 pt-6 border-t">
    <h3 className="text-xl font-semibold mb-3">Agreement & Escrow Deposit</h3>
    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md text-green-800">
      <p className="font-semibold flex items-center">
        <ShieldCheck size={20} className="mr-2" />
        Action Required
      </p>
      <p className="text-sm mt-1">
        Upon agreement, the Buyer will deposit{" "}
        <strong>${totalValue ? totalValue.toLocaleString() : "0"}</strong> into
        the secure KrishiConnect escrow to activate this contract.
      </p>
    </div>
    <div className="flex items-start bg-gray-50 p-3 rounded-md mt-4">
      <input
        type="checkbox"
        id="agree"
        className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        required // Make checkbox required
      />
      <label htmlFor="agree" className="ml-3 text-sm text-gray-600">
        I confirm the details are accurate and agree to these terms.
      </label>
    </div>

    {/* --- NEW: Success Message "Pop-up" --- */}
    {submitSuccess && (
      <div className="mt-4 flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-md">
        <CheckCircle size={20} />
        <span className="text-sm">Proposal submitted successfully!</span>
      </div>
    )}

    {/* --- NEW: Error Display --- */}
    {submitError && (
      <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
        <AlertCircle size={20} />
        <span className="text-sm">{submitError}</span>
      </div>
    )}

    {/* --- MODIFIED: Submit Button (with all states) --- */}
    <button
      type="submit"
      // Disable if submitting OR if it was just successful
      disabled={isSubmitting || submitSuccess}
      className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 text-base 
                 disabled:bg-gray-400"
    >
      {isSubmitting ? (
        <Loader2 size={20} className="animate-spin" />
      ) : submitSuccess ? (
        <CheckCircle size={20} />
      ) : (
        <Send size={20} />
      )}
      <span>
        {isSubmitting
          ? "Sending Proposal..."
          : submitSuccess
          ? "Proposal Sent!"
          : "Send Proposal"}
      </span>
    </button>
  </section>
);
const KrishiConnectLetterhead = () => (
  // ... (KrishiConnectLetterhead remains unchanged)
  <div className="mb-10 pb-5 border-b-2 border-green-600 text-center">
    <span className="text-4xl font-extrabold text-green-700 font-sans">
      KrishiConnect
    </span>
    <p className="text-lg text-gray-700 font-medium italic">
      Empowering Farmers. Assuring Buyers.
    </p>
  </div>
);
const A4PreviewWrapper = ({ children, title, description }) => (
  // ... (A4PreviewWrapper remains unchanged)
  <div className="bg-white p-12 shadow-lg max-w-3xl mx-auto font-serif text-gray-800 border">
    <KrishiConnectLetterhead />
    <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
    <p className="text-center text-gray-600 mb-8 italic">{description}</p>
    {children}
    <div className="mt-16 flex justify-between">
      <div>
        <p className="pt-2 border-t w-56 text-center text-sm">
          Signature of Farmer
        </p>
      </div>
      <div>
        <p className="pt-2 border-t w-56 text-center text-sm">
          Signature of Buyer
        </p>
      </div>
    </div>
  </div>
);
const UniversalPaymentTerms = ({ totalValue }) => (
  // ... (UniversalPaymentTerms remains unchanged)
  <>
    {" "}
    <h3 className="text-xl font-semibold border-b pb-2 mb-4 mt-8">
      Universal Terms of Payment & Execution
    </h3>{" "}
    <div className="space-y-4 text-sm text-justify bg-gray-50 p-4 rounded-md">
      <p>
        <strong>Escrow Deposit:</strong> The Buyer will deposit the full Total
        Contract Value of <strong>${totalValue.toLocaleString()}</strong> into
        the secure KrishiConnect escrow system to activate the contract.
      </p>
      <p>
        <strong>Milestone Verification & Fund Release:</strong> Payment is
        disbursed from escrow per the Payment Schedule. The Farmer must submit
        proof for each milestone. The Buyer has 48 hours to approve. Upon
        approval, payment is released.
      </p>
    </div>{" "}
  </>
);
const DynamicMilestoneSection = ({ formData, setFormData }) => {
  // ... (DynamicMilestoneSection remains unchanged)
  const { milestones } = formData;
  const handleMilestoneChange = (index, event) => {
    const { name, value } = event.target;
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [name]: value };
    setFormData({ ...formData, milestones: newMilestones });
  };
  const handleAddMilestone = () =>
    setFormData({
      ...formData,
      milestones: [...milestones, { desc: "", val: "" }],
    });
  const handleRemoveMilestone = (index) =>
    setFormData({
      ...formData,
      milestones: milestones.filter((_, i) => i !== index),
    });
  const totalPercentage = useMemo(
    () => milestones.reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0),
    [milestones]
  );
  return (
    <section>
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-xl font-semibold">Payment Milestones</h3>
        <div
          className={`text-sm font-bold ${
            totalPercentage === 100 ? "text-green-600" : "text-red-500"
          }`}
        >
          Total: {totalPercentage}%{" "}
          {totalPercentage !== 100 && "(Must be 100%)"}
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-md space-y-4">
        {milestones.map((milestone, index) => (
          <div key={index} className="flex items-end gap-x-3">
            <div className="flex-grow grid grid-cols-12 gap-x-3 items-end">
              <div className="col-span-9">
                <FormField
                  as="textarea"
                  rows="2"
                  label={`Milestone ${index + 1} Description`}
                  name="desc"
                  value={milestone.desc}
                  onChange={(e) => handleMilestoneChange(index, e)}
                />
              </div>
              <div className="col-span-3">
                <FormField
                  label="Payment %"
                  name="val"
                  value={milestone.val}
                  onChange={(e) => handleMilestoneChange(index, e)}
                  type="number"
                />
              </div>
            </div>
            {milestones.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveMilestone(index)}
                className="mb-1 p-2 text-red-500 hover:bg-red-100 rounded-full"
              >
                <XCircle size={20} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddMilestone}
          className="w-full mt-2 text-sm font-semibold text-green-600 hover:bg-green-100 rounded-md p-2 flex items-center justify-center space-x-2"
        >
          <PlusCircle size={16} />
          <span>Add Milestone</span>
        </button>
      </div>
    </section>
  );
};
const InfoPanel = ({ title, features, procedures }) => (
  // ... (InfoPanel remains unchanged)
  <div className="space-y-6">
    <div className="p-6 bg-gray-50 rounded-lg border">
      <h3 className="text-xl font-bold text-gray-800 flex items-center">
        <Info size={20} className="mr-3 text-green-600" />
        About the {title}
      </h3>
      <p className="mt-2 text-gray-600">{features.description}</p>
    </div>
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold flex items-center">
          <CheckSquare size={18} className="mr-2 text-green-600" />
          Key Features
        </h4>
        <ul className="list-disc list-inside text-gray-600 mt-2 pl-2 space-y-1">
          {features.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold flex items-center">
          <FileText size={18} className="mr-2 text-green-600" />
          Standard Procedures
        </h4>
        <p className="text-gray-600 mt-2">{procedures}</p>
      </div>
    </div>
  </div>
);

// --- FORM & PREVIEW COMPONENTS ---

// --- MODIFIED: All Form Components ---
// (Added onSubmit, isSubmitting, submitError, and submitSuccess props to each)

const SimpleSupplyForm = ({
  formData,
  setFormData,
  crop,
  buyer,
  onSubmit, 
  isSubmitting, 
  submitError, 
  submitSuccess, // NEW
}) => {
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const totalValue = useMemo(
    () =>
      (parseFloat(formData.quantity) || 0) * (parseFloat(formData.price) || 0),
    [formData.quantity, formData.price]
  );
  return (
    // MODIFIED: Added onSubmit
    <form className="space-y-8" onSubmit={onSubmit}>
      <PartiesSection crop={crop} buyer={buyer} />
      <section>
        <h3 className="text-xl font-semibold border-b pb-2 mb-4">
          Contract Terms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Quantity to Buy (Tons)"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
          />
          <FormField
            label="Price per Unit ($)"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
          />
        </div>
      </section>
      <DynamicMilestoneSection formData={formData} setFormData={setFormData} />
      {/* MODIFIED: Pass submission states down */}
      <EscrowAgreementSection
        totalValue={totalValue}
        isSubmitting={isSubmitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
      />
    </form>
  );
};

const SimpleSupplyPreview = ({ data, crop, buyer }) => {
  // ... (Preview components remain unchanged)
  const totalValue = useMemo(
    () => (parseFloat(data.quantity) || 0) * (parseFloat(data.price) || 0),
    [data.quantity, data.price]
  );
  return (
    <A4PreviewWrapper
      title="Secured Crop Supply Agreement"
      description="A straightforward agreement for a direct sale, secured by a milestone-based escrow system."
    >
      <h3 className="text-xl font-semibold border-b pb-2 mb-4">1. Key Terms</h3>
      <table className="w-full text-left mb-6">
        <tbody>
          <tr className="border-b">
            <td className="py-2 pr-4 font-semibold w-1/3">Crop:</td>
            <td>{crop.name}</td>
          </tr>
          <tr className="border-b">
            <td className="py-2 pr-4 font-semibold">Quantity:</td>
            <td>{data.quantity} Tons</td>
          </tr>
          <tr className="border-b">
            <td className="py-2 pr-4 font-semibold">Price:</td>
            <td>${data.price} / Ton</td>
          </tr>
          <tr className="bg-gray-100">
            <td className="py-2 pr-4 font-semibold">Total Contract Value:</td>
            <td>${totalValue.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <h3 className="text-xl font-semibold border-b pb-2 mb-4">
        2. Payment Schedule
      </h3>
      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Milestone</th>
            <th className="p-2 border">Payment</th>
          </tr>
        </thead>
        <tbody>
          {data.milestones.map((m, i) => (
            <tr key={i}>
              <td className="p-2 border">{m.desc}</td>
              <td className="p-2 border">
                {m.val}% ($
                {(
                  (totalValue * (parseFloat(m.val) || 0)) /
                  100
                ).toLocaleString()}
                )
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <UniversalPaymentTerms totalValue={totalValue} />
    </A4PreviewWrapper>
  );
};

const PriceAssuranceForm = ({
  formData,
  setFormData,
  crop,
  buyer,
  onSubmit,
  isSubmitting,
  submitError,
  submitSuccess, // NEW
}) => {
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const totalValue = useMemo(
    () =>
      (parseFloat(formData.farmingArea) || 0) *
      (parseFloat(formData.estimatedYield) || 0) *
      (parseFloat(formData.fixedPrice) || 0),
    [formData.farmingArea, formData.estimatedYield, formData.fixedPrice]
  );
  return (
    // MODIFIED: Added onSubmit
    <form className="space-y-8" onSubmit={onSubmit}>
      <PartiesSection crop={crop} buyer={buyer} />
      <section>
        <h3 className="text-xl font-semibold border-b pb-2 mb-4">
          Contract Terms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            label="Farming Area (Acres)"
            name="farmingArea"
            value={formData.farmingArea}
            onChange={handleInputChange}
          />
          <FormField
            label="Estimated Yield (Tons/Acre)"
            name="estimatedYield"
            value={formData.estimatedYield}
            onChange={handleInputChange}
          />
          <FormField
            label="Fixed Price per Ton ($)"
            name="fixedPrice"
            value={formData.fixedPrice}
            onChange={handleInputChange}
          />
        </div>
      </section>
      <DynamicMilestoneSection formData={formData} setFormData={setFormData} />
      {/* MODIFIED: Pass submission states down */}
      <EscrowAgreementSection
        totalValue={totalValue}
        isSubmitting={isSubmitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
      />
    </form>
  );
};

const PriceAssurancePreview = ({ data, crop, buyer }) => {
  // ... (Preview components remain unchanged)
  const totalValue = useMemo(
    () =>
      (parseFloat(data.farmingArea) || 0) *
      (parseFloat(data.estimatedYield) || 0) *
      (parseFloat(data.fixedPrice) || 0),
    [data.farmingArea, data.estimatedYield, data.fixedPrice]
  );
  return (
    <A4PreviewWrapper
      title="Secured Price Assurance Agreement"
      description="An agreement to lock in a fixed price for a season's harvest, secured via escrow."
    >
      <h3 className="text-xl font-semibold border-b pb-2 mb-4">1. Key Terms</h3>
      <table className="w-full text-left mb-6">
        <tbody>
          <tr className="border-b">
            <td className="py-2 pr-4 font-semibold w-1/3">Crop:</td>
            <td>{crop.name}</td>
          </tr>
          <tr className="border-b">
            <td className="py-2 pr-4 font-semibold">Farming Area:</td>
            <td>{data.farmingArea} Acres</td>
          </tr>
          <tr className="border-b">
            <td className="py-2 pr-4 font-semibold">Fixed Price:</td>
            <td>${data.fixedPrice} / Ton</td>
          </tr>
          <tr className="bg-gray-100">
            <td className="py-2 pr-4 font-semibold">Estimated Total Value:</td>
            <td>${totalValue.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <h3 className="text-xl font-semibold border-b pb-2 mb-4">
        2. Payment Schedule
      </h3>
      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Milestone</th>
            <th className="p-2 border">Payment</th>
          </tr>
        </thead>
        <tbody>
          {data.milestones.map((m, i) => (
            <tr key={i}>
              <td className="p-2 border">{m.desc}</td>
              <td className="p-2 border">{m.val}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <UniversalPaymentTerms totalValue={totalValue} />
    </A4PreviewWrapper>
  );
};

const BuybackSupportForm = ({
  formData,
  setFormData,
  crop,
  buyer,
  onSubmit,
  isSubmitting,
  submitError,
  submitSuccess, // NEW
}) => {
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const totalValue = useMemo(
    () => parseFloat(formData.estimatedTotalValue) || 0,
    [formData.estimatedTotalValue]
  );
  return (
    // MODIFIED: Added onSubmit
    <form className="space-y-8" onSubmit={onSubmit}>
      <PartiesSection crop={crop} buyer={buyer} />
      <section>
        <h3 className="text-xl font-semibold border-b pb-2 mb-4">
          Contract Terms
        </h3>
        <FormField
          label="Inputs Provided by Buyer"
          as="textarea"
          rows="3"
          name="inputsProvided"
          value={formData.inputsProvided}
          onChange={handleInputChange}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FormField
            label="Buyback Price per Ton ($)"
            name="buybackPrice"
            value={formData.buybackPrice}
            onChange={handleInputChange}
          />
          <FormField
            label="Quality Standards"
            name="qualityStandards"
            value={formData.qualityStandards}
            onChange={handleInputChange}
          />
        </div>
        <div className="mt-6">
          <FormField
            label="Estimated Total Contract Value ($)"
            name="estimatedTotalValue"
            value={formData.estimatedTotalValue}
            onChange={handleInputChange}
            type="number"
          />
        </div>
      </section>
      <DynamicMilestoneSection formData={formData} setFormData={setFormData} />
      {/* MODIFIED: Pass submission states down */}
      <EscrowAgreementSection
        totalValue={totalValue}
        isSubmitting={isSubmitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
      />
    </form>
  );
};

const BuybackSupportPreview = ({ data, crop, buyer }) => {
  // ... (Preview components remain unchanged)
  const totalValue = useMemo(
    () => parseFloat(data.estimatedTotalValue) || 0,
    [data.estimatedTotalValue]
  );
  return (
    <A4PreviewWrapper
      title="Input-Support & Buyback Agreement"
      description="Buyer provides inputs and commits to purchasing the harvest. Secured by a full escrow deposit."
    >
      <h3 className="text-xl font-semibold border-b pb-2 mb-4">1. Key Terms</h3>
      <p className="font-semibold">Inputs Provided by Buyer:</p>
      <p className="p-2 bg-gray-100 rounded text-sm mb-4">
        {data.inputsProvided}
      </p>
      <table className="w-full text-left mb-6">
        <tbody>
          <tr className="border-b">
            <td className="py-2 pr-4 font-semibold w-1/3">Buyback Price:</td>
            <td>${data.buybackPrice} / Ton</td>
          </tr>
          <tr className="border-b">
            <td className="py-2 pr-4 font-semibold">Quality Standards:</td>
            <td>{data.qualityStandards}</td>
          </tr>
          <tr className="bg-gray-100">
            <td className="py-2 pr-4 font-semibold">Estimated Total Value:</td>
            <td>${totalValue.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs text-gray-600 italic -mt-4 mb-4">
        Note: The value of provided inputs may be deducted from the final
        payout, as per platform policy.
      </p>
      <h3 className="text-xl font-semibold border-b pb-2 mb-4">
        2. Payment Schedule
      </h3>
      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Milestone</th>
            <th className="p-2 border">Payment</th>
          </tr>
        </thead>
        <tbody>
          {data.milestones.map((m, i) => (
            <tr key={i}>
              <td className="p-2 border">{m.desc}</td>
              <td className="p-2 border">{m.val}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <UniversalPaymentTerms totalValue={totalValue} />
    </A4PreviewWrapper>
  );
};

const MilestonePaymentForm = ({
  formData,
  setFormData,
  crop,
  buyer,
  onSubmit,
  isSubmitting,
  submitError,
  submitSuccess, // NEW
}) => {
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const totalValue = useMemo(
    () => parseFloat(formData.totalValue) || 0,
    [formData.totalValue]
  );
  return (
    // MODIFIED: Added onSubmit
    <form className="space-y-8" onSubmit={onSubmit}>
      <PartiesSection crop={crop} buyer={buyer} />
      <section>
        <h3 className="text-xl font-semibold border-b pb-2 mb-4">
          Total Contract Value
        </h3>
        <FormField
          label="Enter Total Value ($)"
          name="totalValue"
          value={formData.totalValue}
          onChange={handleInputChange}
          type="number"
        />
      </section>
      <DynamicMilestoneSection formData={formData} setFormData={setFormData} />
      {/* MODIFIED: Pass submission states down */}
      <EscrowAgreementSection
        totalValue={totalValue}
        isSubmitting={isSubmitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
      />
    </form>
  );
};

const MilestonePaymentPreview = ({ data, crop, buyer }) => {
  // ... (Preview components remain unchanged)
  const totalValue = useMemo(
    () => parseFloat(data.totalValue) || 0,
    [data.totalValue]
  );
  return (
    <A4PreviewWrapper
      title="Milestone-Based Payment Agreement"
      description="A payment schedule tied to agricultural milestones, secured by a full upfront escrow deposit."
    >
      <h3 className="text-xl font-semibold border-b pb-2 mb-4">
        1. Total Contract Value
      </h3>
      <p className="p-3 bg-gray-100 font-bold text-xl text-center tracking-wider">
        ${totalValue.toLocaleString()}
      </p>
      <h3 className="text-xl font-semibold border-b pb-2 mb-4 mt-8">
        2. Payment Schedule
      </h3>
      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Milestone</th>
            <th className="p-2 border">Payment</th>
          </tr>
        </thead>
        <tbody>
          {data.milestones.map((m, i) => (
            <tr key={i}>
              <td className="p-2 border">{m.desc}</td>
              <td className="p-2 border">
                {m.val}% ($
                {(
                  (totalValue * (parseFloat(m.val) || 0)) /
                  100
                ).toLocaleString()}
                )
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <UniversalPaymentTerms totalValue={totalValue} />
    </A4PreviewWrapper>
  );
};

export default ContractTemplatesPage;

