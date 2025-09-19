import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";
import { useAuthStore } from "../authStore";
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
  Signature,
  Loader2,
  AlertCircle,
} from "lucide-react";
import SignatureUploader from "../buyer_components/SignatureUploader"; // Using your actual uploader

// --- Helper: API Function to post a single milestone ---
const postMilestone = async (contractId, milestoneData, token) => {
  const response = await fetch(`http://localhost:8000/api/milestones/contract/${contractId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(milestoneData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Failed to create milestone "${milestoneData.name}": ${err.detail}`);
  }
  return await response.json();
};


// --- MAIN PAGE COMPONENT ---
const ContractTemplatesPage = () => {
  // --- 1. State for Data Fetching & Submission ---
  const [crop, setCrop] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { cropId } = useParams();
  const token = useAuthStore((state) => state.token);
  const authUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const buyerDetails = {
    name: authUser?.full_name || "Buyer", // Use full_name from auth store
    address: "Pune, Maharashtra",
  };
  
  const [selectedTemplate, setSelectedTemplate] = useState("simple-supply");
  const [mode, setMode] = useState("info"); // 'info', 'edit', 'preview'

  // --- 2. Data Fetching Logic ---
  useEffect(() => {
    const fetchCropData = async () => {
      if (!token) {
        setPageError("You must be logged in to view this page.");
        setPageLoading(false);
        return;
      }
      setPageLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/croplists/${cropId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Crop listing not found.");
        }
        const data = await response.json();
        setCrop({
          id: data.id,
          name: data.crop_type,
          farmer: data.farmer.full_name,
          farmer_id: data.farmer_id,
          location: data.location,
          price: parseFloat(data.expected_price_per_unit),
          unit: data.unit,
          quantity: data.quantity,
        });
      } catch (err) {
        setPageError(err.message);
      } finally {
        setPageLoading(false);
      }
    };
    fetchCropData();
  }, [cropId, token]);

  // --- 3. Form State Logic ---
  const [formData, setFormData] = useState({
    'simple-supply': { quantity: '10', price: '0', milestones: [], signature: null },
    'price-assurance': { farmingArea: '5', fixedPrice: '0', estimatedYield: '10', milestones: [], signature: null },
    'buyback-support': { buybackPrice: '0', qualityStandards: 'Grade A', inputsProvided: 'Seeds, Fertilizer', estimatedTotalValue: '0', milestones: [], signature: null },
    'milestone-payment': { totalValue: '500000', milestones: [{ desc: 'Sowing', val: '20' }, { desc: 'Mid-Growth', val: '30' }, { desc: 'Harvest', val: '50' }], signature: null },
  });

  useEffect(() => {
    if (crop) {
      setFormData(prevData => ({
        ...prevData,
        'simple-supply': {
          ...prevData['simple-supply'],
          quantity: crop.quantity.toString(),
          price: crop.price.toString(),
          milestones: [
            { desc: 'Contract Finalization & Escrow Deposit', val: '10' },
            { desc: 'Final Delivery & Acceptance', val: '90' }
          ],
        },
        'price-assurance': {
          ...prevData['price-assurance'],
          fixedPrice: crop.price.toString(),
          milestones: [
             { desc: 'Contract Start & Escrow Deposit', val: '10' },
             { desc: 'Mid-Season Progress Report', val: '20' },
             { desc: 'Final Harvest Delivery', val: '70' }
          ],
        },
         'buyback-support': {
           ...prevData['buyback-support'],
           buybackPrice: (crop.price * 0.9).toString(),
           estimatedTotalValue: (crop.price * crop.quantity).toString(),
             milestones: [
               { desc: 'Inputs Delivered & Acknowledged', val: '10' },
               { desc: 'Mid-Growth Inspection Passed', val: '20' },
               { desc: 'Final Produce Buyback', val: '70' }
            ],
         }
      }));
    }
  }, [crop]);

  const handleFormChange = (templateId, updatedData) => {
    setFormData(prev => ({ ...prev, [templateId]: updatedData }));
  };

  const templates = [
    { id: 'simple-supply', title: 'Simple Supply Contract', description: 'One-time purchase of a specific quantity.' },
    { id: 'price-assurance', title: 'Price Assurance Contract', description: "Locks in a fixed price for an entire harvest." },
    { id: 'buyback-support', title: 'Buyback / Input-Support', description: 'Buyer provides inputs and buys back produce.' },
    { id: 'milestone-payment', title: 'Milestone-Based Payment', description: 'Fully custom payments released in stages.' },
  ];
  
  // --- 4. Main Submission Logic (Unchanged) ---
  const handleSendProposal = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const currentData = formData[selectedTemplate];
    let contractPayload = {};
    let totalValue = 0;

    try {
      if (selectedTemplate === 'simple-supply') {
        totalValue = parseFloat(currentData.quantity) * parseFloat(currentData.price);
        contractPayload = {
          listing_id: crop.id,
          quantity_proposed: parseFloat(currentData.quantity),
          price_per_unit_agreed: parseFloat(currentData.price),
          payment_terms: 'milestone',
        };
      } else if (selectedTemplate === 'price-assurance') {
        const qty = parseFloat(currentData.farmingArea) * parseFloat(currentData.estimatedYield);
        totalValue = qty * parseFloat(currentData.fixedPrice);
        contractPayload = {
          listing_id: crop.id,
          quantity_proposed: qty,
          price_per_unit_agreed: parseFloat(currentData.fixedPrice),
          payment_terms: 'milestone',
        };
      } else if (selectedTemplate === 'buyback-support') {
        totalValue = parseFloat(currentData.estimatedTotalValue);
        const qty = totalValue / parseFloat(currentData.buybackPrice);
        contractPayload = {
          listing_id: crop.id,
          quantity_proposed: isNaN(qty) ? 0 : qty,
          price_per_unit_agreed: parseFloat(currentData.buybackPrice),
          payment_terms: 'milestone',
        };
      } else if (selectedTemplate === 'milestone-payment') {
        totalValue = parseFloat(currentData.totalValue);
        contractPayload = {
          listing_id: crop.id,
          quantity_proposed: 1,
          price_per_unit_agreed: totalValue,
          payment_terms: 'milestone',
        };
      }

      const contractResponse = await fetch("http://localhost:8000/api/contracts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(contractPayload),
      });

      if (!contractResponse.ok) {
        const err = await contractResponse.json();
        throw new Error(`Contract Error: ${err.detail}`);
      }

      const newContract = await contractResponse.json();
      const newContractId = newContract.id;

      for (const milestone of currentData.milestones) {
        const milestoneAmount = totalValue * (parseFloat(milestone.val) / 100);
        const milestonePayload = {
          name: milestone.desc,
          amount: milestoneAmount,
          update_text: null,
          image_url: null
        };
        await postMilestone(newContractId, milestonePayload, token);
      }

      setSubmitSuccess(true);
      setTimeout(() => navigate('/buyer/contracts'), 2000);

    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render logic ---
  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    setMode('info');
  };

  const renderContent = () => {
    const currentData = formData[selectedTemplate];
    const currentSetData = (newData) => handleFormChange(selectedTemplate, newData);
    
    const previewProps = {
      data: currentData,
      crop: crop,
      buyer: buyerDetails,
      isSubmitting,
      submitError,
      submitSuccess,
      onSendProposal: handleSendProposal
    };

    const props = { crop, buyer: buyerDetails, formData: currentData, setFormData: currentSetData, setMode };

    switch (mode) {
      case 'info':
         switch (selectedTemplate) {
            case 'simple-supply': return <InfoPanel title="Simple Supply Contract" features={{ description: 'A straightforward agreement for a direct sale, secured by a milestone-based escrow system.', points: ['One-Time Deal: Designed for a single transaction with no long-term commitment.', 'Fixed Quantity & Price: Both parties agree on the exact amount of crop to be sold and the exact price per unit (e.g., per Ton or Kg).', 'No Long-Term Lock-in: After the transaction is complete, both the buyer and farmer are free to work with others.' , 'Price is Final: The agreed-upon price is locked in, regardless of whether future market prices go up or down.'] }} procedures="Payment is released in stages based on contract finalization and final delivery acceptance. All funds are secured upfront." />;
            case 'price-assurance': return <InfoPanel title="Price Assurance Contract" features={{ description: "Lock-in a fixed price for an entire season's harvest, providing stability against market volatility.", points: ['Price Stability: Its main purpose is to set a fixed price per unit that will not change, protecting both parties from market volatility.', "Covers a Whole Harvest: The agreement typically applies to the entire yield from a specific piece of land for a season.", 'Guaranteed Income & Cost: The farmer gets a predictable income, and the buyer gets a predictable raw material cost.' , 'Shared Risk & Reward: Both parties give up the chance for a windfall (if market prices move in their favor) in exchange for security against a loss.'] }} procedures="The total estimated value is held in escrow. Funds are released based on milestones like progress reports and final delivery." />;
            case 'buyback-support': return <InfoPanel title="Buyback / Input-Support Contract" features={{ description: 'The Buyer provides essential inputs to the Farmer and guarantees to buy back the resulting harvest at a pre-agreed price.', points: ['Buyer Provides Support: The buyer supplies essential resources to the farmer, such as high-quality seeds, fertilizers, or technical guidance.', 'Exclusive Purchase Agreement: The farmer is obligated to sell the entire harvest produced with these inputs back to the supporting buyer.', 'Pre-Agreed Price & Quality: The buyback price and the required quality standards (e.g., organic, size, grade) are defined clearly from the start.' , 'Quality Control: The buyer has significant influence over the growing process to ensure the final product meets their specific needs.'] }} procedures="The value of the contract is secured in escrow. The cost of inputs may be deducted from milestone payments. Funds are released as the Farmer meets production milestones." />;
            case 'milestone-payment': return <InfoPanel title="Milestone-Based Payment Contract" features={{ description: 'A flexible contract where the total value and payment stages are fully customized by the buyer.', points: ['Payments in Stages: The total contract value is divided into several smaller payments instead of a single lump sum.', 'Tied to Verifiable Progress: Each payment is only released after the farmer proves they have completed a specific, pre-defined stage (e.g., sowing, mid-growth, harvesting).', 'Improved Farmer Cash Flow: The farmer receives money throughout the growing season, helping them manage operational costs.' , 'Reduced Buyer Risk: The buyers financial risk is minimized because they are paying for tangible progress, not just a future promise of a harvest.'] }} procedures="The custom total value is held in escrow. Funds are released progressively as the farmer completes each custom milestone defined by the buyer." />;
            default: return null;
          }
      case 'edit':
         switch (selectedTemplate) {
            case 'simple-supply': return <SimpleSupplyForm {...props} />;
            case 'price-assurance': return <PriceAssuranceForm {...props} />;
            case 'buyback-support': return <BuybackSupportForm {...props} />;
            case 'milestone-payment': return <MilestonePaymentForm {...props} />;
            default: return null;
          }
      case 'preview':
        switch (selectedTemplate) {
          case 'simple-supply': return <SimpleSupplyPreview {...previewProps} />;
          case 'price-assurance': return <PriceAssurancePreview {...previewProps} />;
          case 'buyback-support': return <BuybackSupportPreview {...previewProps} />;
          case 'milestone-payment': return <MilestonePaymentPreview {...previewProps} />;
          default: return null;
        }
      default: return null;
    }
  };
  
  if (pageLoading) {
    return <div className="p-8 flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-green-600" /></div>;
  }
  if (pageError) {
    return <div className="p-8 flex justify-center items-center h-screen bg-red-50 text-red-700"><AlertCircle size={24} className="mr-2" /> {pageError}</div>;
  }

  return (
    <div className="bg-gray-50 p-4 md:p-8 min-h-screen space-y-6">
      <header className="flex items-center space-x-3">
        <Link to="/buyer/browse" className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={24} /></Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Propose a KrishiConnect Contract</h1>
          <p className="text-gray-600 mt-1">Select a template for <strong>{crop.name}</strong> to review and edit.</p>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm h-fit sticky top-6">
          <h2 className="font-semibold mb-3">Contract Types</h2>
          <div className="space-y-1">{templates.map(template => (
            <button key={template.id} onClick={() => handleTemplateSelect(template.id)} className={`w-full text-left p-3 rounded-md transition-colors ${selectedTemplate === template.id ? 'bg-green-600 text-white' : 'hover:bg-gray-100'}`}>
              <p className={`font-semibold text-sm ${selectedTemplate === template.id ? 'text-white' : 'text-gray-800'}`}>{template.title}</p>
              <p className={`mt-1 text-xs ${selectedTemplate === template.id ? 'text-green-100' : 'text-gray-500'}`}>{template.description}</p>
            </button>
          ))}</div>
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h2 className="font-semibold text-lg text-gray-800">{templates.find(t => t.id === selectedTemplate)?.title}</h2>
              {mode === 'info' && <button onClick={() => setMode('edit')} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700"><Edit size={16} /><span>Fill Out Form</span></button>}
              {mode === 'preview' && <button onClick={() => setMode('edit')} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center space-x-2 bg-gray-600 text-white hover:bg-gray-700"><Edit size={16} /><span>Back to Edit</span></button>}
            </div>
            <div className="p-6 md:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- HELPER & REUSABLE COMPONENTS ---
const FormField = ({ label, name, value, onChange, type = 'text', as: Component = 'input', ...props }) => ( <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><Component name={name} value={value} onChange={onChange} type={type} className="w-full p-2 border rounded-md bg-gray-50 focus:ring-green-500 focus:border-green-500" {...props} /></div> );
const PartiesSection = ({ crop, buyer }) => ( <section><h3 className="text-xl font-semibold border-b pb-2 mb-4">Parties Involved</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"><div><p className="font-medium text-gray-500">Farmer</p><p>{crop.farmer} ({crop.location})</p></div><div><p className="font-medium text-gray-500">Buyer</p><p>{buyer.name} ({buyer.address})</p></div></div></section> );
const KrishiConnectLetterhead = () => ( <div className="mb-10 pb-5 border-b-2 border-green-600 text-center"><span className="text-4xl font-extrabold text-green-700 font-sans">KrishiConnect</span><p className="text-lg text-gray-700 font-medium italic">Empowering Farmers. Assuring Buyers.</p></div> );
const InfoPanel = ({ title, features, procedures }) => ( <div className="space-y-6"><div className="p-6 bg-gray-50 rounded-lg"><h3 className="text-xl font-bold text-gray-800 flex items-center"><Info size={20} className="mr-3 text-green-600"/>About the {title}</h3><p className="mt-2 text-gray-600">{features.description}</p></div><div className="space-y-4"><div><h4 className="font-semibold flex items-center"><CheckSquare size={18} className="mr-2 text-green-600"/>Key Features</h4><ul className="list-disc list-inside text-gray-600 mt-2 pl-2 space-y-1">{features.points.map(pt => <li key={pt}>{pt}</li>)}</ul></div><div><h4 className="font-semibold flex items-center"><FileText size={18} className="mr-2 text-green-600"/>Standard Procedures</h4><p className="text-gray-600 mt-2">{procedures}</p></div></div></div> );
const DynamicMilestoneSection = ({ formData, setFormData }) => {
    const { milestones } = formData;
    const handleMilestoneChange = (index, event) => { const { name, value } = event.target; const newMilestones = [...milestones]; newMilestones[index] = { ...newMilestones[index], [name]: value }; setFormData({ ...formData, milestones: newMilestones }); };
    const handleAddMilestone = () => setFormData({ ...formData, milestones: [...milestones, { desc: '', val: '0' }] });
    const handleRemoveMilestone = (index) => setFormData({ ...formData, milestones: milestones.filter((_, i) => i !== index) });
    const totalPercentage = useMemo(() => milestones.reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [milestones]);
    return ( <section><div className="flex justify-between items-center border-b pb-2 mb-4"><h3 className="text-xl font-semibold">Payment Milestones</h3><div className={`text-sm font-bold ${totalPercentage === 100 ? 'text-green-600' : 'text-red-500'}`}>Total: {totalPercentage}% {totalPercentage !== 100 && "(Must be 100%)"}</div></div><div className="p-4 bg-gray-50 rounded-md space-y-4">{milestones.map((milestone, index) => (<div key={index} className="flex items-end gap-x-3"><div className="flex-grow grid grid-cols-12 gap-x-3 items-end"><div className="col-span-9"><FormField as="textarea" rows="2" label={`Milestone ${index + 1} Description`} name="desc" value={milestone.desc} onChange={(e) => handleMilestoneChange(index, e)} /></div><div className="col-span-3"><FormField label="Payment %" name="val" value={milestone.val} onChange={(e) => handleMilestoneChange(index, e)} type="number" /></div></div>{milestones.length > 2 && <button type="button" onClick={() => handleRemoveMilestone(index)} className="mb-1 p-2 text-red-500 hover:bg-red-100 rounded-full"><XCircle size={20} /></button>}</div>))}<button type="button" onClick={handleAddMilestone} className="w-full mt-2 text-sm font-semibold text-green-600 hover:bg-green-100 rounded-md p-2 flex items-center justify-center space-x-2"><PlusCircle size={16} /><span>Add Milestone</span></button></div>{totalPercentage !== 100 && <p className="text-red-600 text-sm mt-2">Milestone payments must add up to exactly 100%.</p>}</section> );
};
// --- NEW: Replaced placeholder with a real component that uses the uploader ---
const SignatureEditSection = ({ onSave }) => (
  <section>
    <h3 className="text-xl font-semibold border-b pb-2 mb-4">Your Digital Signature</h3>
    <p className="text-sm text-gray-600 mb-4">
      Upload an image of your signature to attach it to this contract proposal. This will be considered a binding digital signature upon acceptance by the farmer.
    </p>
    <SignatureUploader onSave={onSave} />
  </section>
);
const EscrowAgreementSection = () => ( <section className="mt-8 pt-6 border-t"><h3 className="text-xl font-semibold mb-3">Agreement</h3><div className="flex items-start bg-gray-50 p-3 rounded-md mt-4"><input type="checkbox" id="agree" className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" required /><label htmlFor="agree" className="ml-3 text-sm text-gray-600">I confirm the details are accurate and agree to the terms laid out in this contract proposal.</label></div></section> );

const FormActions = ({ onPreview, isDisabled }) => (
  <div className="mt-8 pt-6 border-t">
    <button 
      type="button"
      onClick={onPreview} 
      disabled={isDisabled}
      title={isDisabled ? "Please ensure milestones total 100% and you have attached your signature." : "Proceed to Preview"}
      className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      <Eye size={20} />
      <span>Preview Contract</span>
    </button>
  </div>
);

const A4PreviewWrapper = ({ children, title, description, signatureFile, onSendProposal, isSubmitting, submitError, submitSuccess }) => {
  const [signatureUrl, setSignatureUrl] = useState(null);
  useEffect(() => {
    if (signatureFile instanceof File) {
      const url = URL.createObjectURL(signatureFile);
      setSignatureUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [signatureFile]);

  return (
    <div className="bg-white p-12 shadow-lg max-w-3xl mx-auto font-serif text-gray-800">
      <KrishiConnectLetterhead />
      <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
      <p className="text-center text-gray-600 mb-8 italic">{description}</p>
      <div className="space-y-6 text-sm">{children}</div>
      <div className="mt-16 border-t pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div><h4 className="font-semibold text-center mb-2">Farmer's Signature</h4><div className="h-48 flex items-center justify-center bg-gray-50 rounded-md border-2 border-dashed"><p className="text-gray-400 text-sm">Awaiting Farmer's Signature</p></div></div>
          <div><h4 className="font-semibold text-center mb-2">Buyer's Signature</h4><div className="h-48 flex items-center justify-center border-2 border-dashed rounded-md p-4">{signatureUrl ? (<img src={signatureUrl} alt="Buyer Signature" className="max-h-full" />) : (<p className="text-gray-400 text-sm">No Signature Attached</p>)}</div></div>
        </div>
        
        <div className="mt-8 pt-6 border-t">
          {submitSuccess ? (
            <div className="text-center p-4 bg-green-50 text-green-700 rounded-md">
              <CheckSquare size={24} className="mx-auto mb-2" />
              <p className="font-semibold">Proposal Sent Successfully!</p>
              <p className="text-sm">Redirecting to your contracts page...</p>
            </div>
          ) : (
            <>
              {submitError && (
                 <div className="text-left p-3 mb-4 bg-red-50 text-red-700 rounded-md flex items-start space-x-2">
                   <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                   <div>
                     <p className="font-semibold">Submission Failed</p>
                     <p className="text-sm">{submitError}</p>
                   </div>
                 </div>
              )}
              <button 
                onClick={onSendProposal} 
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 text-base disabled:bg-gray-400"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                <span>{isSubmitting ? "Submitting Proposal..." : "Confirm & Send Proposal"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


// --- FORM COMPONENTS (Updated with signature validation) ---
const SimpleSupplyForm = ({ formData, setFormData, crop, buyer, setMode }) => {
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSignatureSave = (file) => setFormData({ ...formData, signature: file });
    const totalPercentage = useMemo(() => formData.milestones.reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const isValid = totalPercentage === 100 && formData.signature;
    
    return ( 
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <PartiesSection crop={crop} buyer={buyer} />
        <section>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label={`Quantity to Buy (${crop.unit})`} name="quantity" value={formData.quantity} onChange={handleInputChange} type="number" />
            <FormField label={`Price per ${crop.unit} (₹)`} name="price" value={formData.price} onChange={handleInputChange} type="number" />
          </div>
        </section>
        <DynamicMilestoneSection formData={formData} setFormData={setFormData} />
        <SignatureEditSection onSave={handleSignatureSave} />
        <EscrowAgreementSection />
        <FormActions onPreview={() => setMode('preview')} isDisabled={!isValid} />
      </form> 
    );
};
const PriceAssuranceForm = ({ formData, setFormData, crop, buyer, setMode }) => {
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSignatureSave = (file) => setFormData({ ...formData, signature: file });
    const totalPercentage = useMemo(() => formData.milestones.reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const isValid = totalPercentage === 100 && formData.signature;

    return ( 
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <PartiesSection crop={crop} buyer={buyer} />
        <section>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label="Farming Area (Acres)" name="farmingArea" value={formData.farmingArea} onChange={handleInputChange} type="number" />
            <FormField label={`Estimated Yield (${crop.unit}/Acre)`} name="estimatedYield" value={formData.estimatedYield} onChange={handleInputChange} type="number" />
            <FormField label={`Fixed Price per ${crop.unit} (₹)`} name="fixedPrice" value={formData.fixedPrice} onChange={handleInputChange} type="number" />
          </div>
        </section>
        <DynamicMilestoneSection formData={formData} setFormData={setFormData} />
        <SignatureEditSection onSave={handleSignatureSave} />
        <EscrowAgreementSection />
        <FormActions onPreview={() => setMode('preview')} isDisabled={!isValid} />
      </form> 
    );
};
const BuybackSupportForm = ({ formData, setFormData, crop, buyer, setMode }) => {
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSignatureSave = (file) => setFormData({ ...formData, signature: file });
    const totalPercentage = useMemo(() => formData.milestones.reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const isValid = totalPercentage === 100 && formData.signature;

    return ( 
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <PartiesSection crop={crop} buyer={buyer} />
        <section>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
          <FormField label="Inputs Provided by Buyer" as="textarea" rows="3" name="inputsProvided" value={formData.inputsProvided} onChange={handleInputChange} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormField label={`Buyback Price per ${crop.unit} (₹)`} name="buybackPrice" value={formData.buybackPrice} onChange={handleInputChange} type="number" />
            <FormField label="Quality Standards" name="qualityStandards" value={formData.qualityStandards} onChange={handleInputChange} />
          </div>
          <div className="mt-6">
            <FormField label="Estimated Total Contract Value (₹)" name="estimatedTotalValue" value={formData.estimatedTotalValue} onChange={handleInputChange} type="number"/>
          </div>
        </section>
        <DynamicMilestoneSection formData={formData} setFormData={setFormData} />
        <SignatureEditSection onSave={handleSignatureSave} />
        <EscrowAgreementSection />
        <FormActions onPreview={() => setMode('preview')} isDisabled={!isValid} />
      </form> 
    );
};
const MilestonePaymentForm = ({ formData, setFormData, crop, buyer, setMode }) => {
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSignatureSave = (file) => setFormData({ ...formData, signature: file });
    const totalPercentage = useMemo(() => formData.milestones.reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const isValid = totalPercentage === 100 && formData.signature;

    return ( 
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <PartiesSection crop={crop} buyer={buyer} />
        <section>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Total Contract Value</h3>
          <FormField label="Enter Total Value (₹)" name="totalValue" value={formData.totalValue} onChange={handleInputChange} type="number" />
        </section>
        <DynamicMilestoneSection formData={formData} setFormData={setFormData} />
        <SignatureEditSection onSave={handleSignatureSave} />
        <EscrowAgreementSection />
        <FormActions onPreview={() => setMode('preview')} isDisabled={!isValid} />
      </form> 
    );
};


// --- PREVIEW COMPONENTS (Unchanged) ---
const SimpleSupplyPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => (parseFloat(data.quantity) || 0) * (parseFloat(data.price) || 0), [data.quantity, data.price]);
    return (
        <A4PreviewWrapper signatureFile={data.signature} title="Secured Crop Supply Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}>
            <p>This Agreement is by and between <strong>{crop.farmer}</strong> ("Farmer") and <strong>{buyer.name}</strong> ("Buyer"), facilitated by the KrishiConnect platform.</p>
            <p className="mt-2"><strong>WHEREAS</strong>, the Farmer agrees to sell, and the Buyer agrees to purchase, the produce under the terms set forth herein.</p>
            
            <h3 className="font-bold mt-6 mb-2 text-base">Article 1: Core Terms of Sale</h3>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>Produce:</strong> {crop.name}</li>
                <li><strong>Quantity:</strong> {data.quantity} {crop.unit}</li>
                <li><strong>Price:</strong> ₹{parseFloat(data.price).toLocaleString('en-IN')} per {crop.unit}</li>
                <li><strong>Total Contract Value:</strong> ₹{totalValue.toLocaleString('en-IN')}</li>
            </ul>

            <h3 className="font-bold mt-6 mb-2 text-base">Article 2: Payment and Escrow Mechanism</h3>
            <p><strong>2.1 Escrow Deposit:</strong> Upon execution, the Buyer shall deposit ₹{totalValue.toLocaleString('en-IN')} into the KrishiConnect Escrow Account.</p>
            <p><strong>2.2 Payment Schedule:</strong> Funds shall be released from escrow to the Farmer according to the following verified milestones:</p>
            <table className="w-full text-left border-collapse my-2 text-xs sm:text-sm">
              <thead className="bg-gray-100"><tr><th className="p-2 border">Milestone Description</th><th className="p-2 border">Payment</th></tr></thead>
              <tbody>
                {data.milestones.map((m, i) => (
                  <tr key={i}><td className="p-2 border">{m.desc}</td><td className="p-2 border">{m.val}% (₹{ (totalValue * (parseFloat(m.val) || 0) / 100).toLocaleString('en-IN') })</td></tr>
                ))}
              </tbody>
            </table>

            <h3 className="font-bold mt-6 mb-2 text-base">Article 3 - General Terms</h3>
            <p>The Farmer agrees to deliver produce meeting agreed quality standards. The Buyer agrees to inspect the delivery within 48 hours. A grace period of <strong>15 days</strong> applies for delivery delays. All disputes will be mediated via the KrishiConnect platform under the laws of India.</p>
        </A4PreviewWrapper>
    );
};
const PriceAssurancePreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => (parseFloat(data.farmingArea) || 0) * (parseFloat(data.estimatedYield) || 0) * (parseFloat(data.fixedPrice) || 0), [data.farmingArea, data.estimatedYield, data.fixedPrice]);
    return (
        <A4PreviewWrapper signatureFile={data.signature} title="Secured Price Assurance Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}>
            <p>This Agreement is by and between <strong>{crop.farmer}</strong> ("Farmer") and <strong>{buyer.name}</strong> ("Buyer").</p>
            <p className="mt-2"><strong>WHEREAS</strong>, the Buyer wishes to secure the entire harvest from a specific area at a fixed price.</p>

            <h3 className="font-bold mt-6 mb-2 text-base">Article 1: Core Terms of Assurance</h3>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>Produce:</strong> {crop.name}</li>
                <li><strong>Farming Area:</strong> {data.farmingArea} Acres</li>
                <li><strong>Fixed Price:</strong> ₹{parseFloat(data.fixedPrice).toLocaleString('en-IN')} per {crop.unit}.</li>
                <li><strong>Exclusivity:</strong> Farmer agrees to sell the entire harvest from the designated area exclusively to the Buyer.</li>
                <li><strong>Estimated Total Value:</strong> ₹{totalValue.toLocaleString('en-IN')}</li>
            </ul>

            <h3 className="font-bold mt-6 mb-2 text-base">Article 2: Payment and Escrow</h3>
            <p>The Buyer shall deposit the Estimated Total Value into escrow. Funds will be released based on the agreed milestones, with the final payment adjusted based on actual weight delivered.</p>
            <table className="w-full text-left border-collapse my-2 text-xs sm:text-sm">
              <thead className="bg-gray-100"><tr><th className="p-2 border">Milestone Description</th><th className="p-2 border">Payment</th></tr></thead>
              <tbody>
                {data.milestones.map((m, i) => (
                  <tr key={i}><td className="p-2 border">{m.desc}</td><td className="p-2 border">{m.val}% (₹{ (totalValue * (parseFloat(m.val) || 0) / 100).toLocaleString('en-IN') })</td></tr>
                ))}
              </tbody>
            </table>
            
            <h3 className="font-bold mt-6 mb-2 text-base">Article 3 - General Terms</h3>
            <p>The Farmer agrees to use best practices and provide milestone evidence. The Buyer agrees to review milestones within 72 hours. A grace period of <strong>15 days</strong> applies for missed milestones. All disputes will be mediated via the KrishiConnect platform under the laws of India.</p>
        </A4PreviewWrapper>
    );
};
const BuybackSupportPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => parseFloat(data.estimatedTotalValue) || 0, [data.estimatedTotalValue]);
    return (
        <A4PreviewWrapper signatureFile={data.signature} title="Input-Support & Buyback Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}>
            <p>This Agreement is by and between <strong>{crop.farmer}</strong> ("Farmer") and <strong>{buyer.name}</strong> ("Buyer").</p>
            <p className="mt-2"><strong>WHEREAS</strong>, the Buyer agrees to provide inputs in exchange for the exclusive right to purchase the harvest.</p>

            <h3 className="font-bold mt-6 mb-2 text-base">Article 1: Core Terms of Agreement</h3>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>Inputs Provided:</strong> {data.inputsProvided}</li>
                <li><strong>Buyback Price:</strong> ₹{parseFloat(data.buybackPrice).toLocaleString('en-IN')} per {crop.unit}</li>
                <li><strong>Quality Standards:</strong> {data.qualityStandards}</li>
                <li><strong>Estimated Total Value:</strong> ₹{totalValue.toLocaleString('en-IN')}</li>
            </ul>

            <h3 className="font-bold mt-6 mb-2 text-base">Article 2: Payment and Escrow</h3>
            <p>The Buyer will deposit the Estimated Total Value into escrow. The value of inputs may be deducted from the final payment. Funds are released based on the agreed milestones.</p>
            <table className="w-full text-left border-collapse my-2 text-xs sm:text-sm">
              <thead className="bg-gray-100"><tr><th className="p-2 border">Milestone Description</th><th className="p-2 border">Payment</th></tr></thead>
              <tbody>
                {data.milestones.map((m, i) => (
                  <tr key={i}><td className="p-2 border">{m.desc}</td><td className="p-2 border">{m.val}% (₹{ (totalValue * (parseFloat(m.val) || 0) / 100).toLocaleString('en-IN') })</td></tr>
                ))}
              </tbody>
            </table>
            
            <h3 className="font-bold mt-6 mb-2 text-base">Article 3 - General Terms</h3>
            <p>The Farmer agrees to use inputs as directed. The Buyer agrees to buy back all produce meeting the Quality Standards. A <strong>15-day</strong> grace period applies for missed milestones. All disputes will be mediated via the KrishiConnect platform under the laws of India.</p>
        </A4PreviewWrapper>
    );
};
const MilestonePaymentPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => parseFloat(data.totalValue) || 0, [data.totalValue]);
    return (
        <A4PreviewWrapper signatureFile={data.signature} title="Custom Milestone-Based Payment Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}>
            <p>This Agreement is by and between <strong>{crop.farmer}</strong> ("Farmer") and <strong>{buyer.name}</strong> ("Buyer").</p>

            <h3 className="font-bold mt-6 mb-2 text-base">Article 1: Core Terms</h3>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>Project Description:</strong> Cultivation and delivery of {crop.name}.</li>
                <li><strong>Total Contract Value:</strong> ₹{totalValue.toLocaleString('en-IN')}</li>
            </ul>

            <h3 className="font-bold mt-6 mb-2 text-base">Article 2: Custom Payment Schedule</h3>
            <p>The Buyer will deposit the Total Contract Value into escrow. Funds will be released upon Buyer's approval of each milestone.</p>
            <table className="w-full text-left border-collapse my-2 text-xs sm:text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Milestone Description</th>
                        <th className="p-2 border">Payment</th>
                    </tr>
                </thead>
                <tbody>
                    {data.milestones.map((m, i) => (
                        <tr key={i}><td className="p-2 border">{m.desc}</td><td className="p-2 border">{m.val}% (₹{ (totalValue * (parseFloat(m.val) || 0) / 100).toLocaleString('en-IN') })</td></tr>
                    ))}
                </tbody>
            </table>
            
            <h3 className="font-bold mt-6 mb-2 text-base">Article 3 - General Terms</h3>
            <p>The Farmer agrees to provide verifiable evidence for each milestone. The Buyer agrees to review evidence within 72 hours. A grace period of <strong>15 days</strong> applies for missed milestones. All disputes will be mediated via the KrishiConnect platform under the laws of India.</p>
        </A4PreviewWrapper>
    );
};

export default ContractTemplatesPage;
