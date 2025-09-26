import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../authStore";
import {
  ArrowLeft, Send, Edit, Eye, ShieldCheck, PlusCircle, XCircle, Info, CheckSquare, FileText, Signature, Loader2, AlertCircle, Package, Image as ImageIcon, X, Wallet
} from "lucide-react";
import SignatureUploader from "../buyer_components/SignatureUploader";

// --- API & Helper Functions ---
const postMilestone = async (contractId, milestoneData, token) => {
  const response = await fetch(`http://localhost:8000/api/milestones/contract/${contractId}`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(milestoneData) });
  if (!response.ok) { const err = await response.json(); throw new Error(`Failed to create milestone: ${err.detail}`); }
  return response.json();
};
const convertToTons = (quantity, unit) => {
    if (!quantity || !unit) return 0;
    const qty = parseFloat(quantity);
    if (isNaN(qty)) return 0;
    switch (unit.toLowerCase()) {
        case 'kg': case 'kgs': return (qty / 1000).toFixed(2);
        case 'quintal': case 'quintals': return (qty / 10).toFixed(2);
        case 'ton': case 'tons': case 'tonne': case 'tonnes': return qty.toFixed(2);
        default: return 0;
    }
};

// --- Add Funds Modal Component ---
const AddFundsModal = ({ onClose, onAddFunds, requiredAmount }) => {
  const [amount, setAmount] = useState(requiredAmount || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onAddFunds(numericAmount);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-gray-800">Add Funds for Escrow</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button></div>
        <form onSubmit={handleSubmit}><div className="space-y-4"><div><label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount to Add (INR)</label><div className="mt-1 relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">₹</span></div><input type="number" name="amount" id="amount" value={amount} readOnly className="w-full pl-7 pr-12 p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-gray-100 cursor-not-allowed"/></div><p className="text-xs text-gray-500 mt-1">This amount is determined by the contract value and cannot be changed.</p></div>{error && <p className="text-sm text-red-600 text-center">{error}</p>}<button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 disabled:bg-gray-400">{isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />}<span>{isSubmitting ? 'Processing...' : 'Confirm & Add Funds'}</span></button></div></form>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const ContractTemplatesPage = () => {
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
  
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [requiredEscrow, setRequiredEscrow] = useState(0);
  const [termsAgreed, setTermsAgreed] = useState(false);
  
  const [selectedTemplate, setSelectedTemplate] = useState("spot-buy");
  const [mode, setMode] = useState("info");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedTemplateId, setViewedTemplateId] = useState(null);
  
  const buyerDetails = { name: authUser?.full_name || "Buyer", address: "Pune, Maharashtra" };

  const fetchWalletBalance = useCallback(async () => {
    if (!token) return;
    try {
        const response = await fetch("http://localhost:8000/api/wallet/me", { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Could not fetch wallet balance.');
        const data = await response.json();
        setWalletBalance(parseFloat(data.balance));
    } catch (err) {
        console.error("Wallet Fetch Error:", err);
    }
  }, [token]);
  
  const handleAddFunds = async (amount) => {
    if (!token) throw new Error("Authentication expired.");
    const response = await fetch("http://localhost:8000/api/wallet/me/add-funds", {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: amount })
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to add funds.");
    }
    await fetchWalletBalance();
  };
  
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) { setPageError("You must be logged in."); setPageLoading(false); return; }
      setPageLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/croplists/${cropId}`, { headers: { 'Authorization': `Bearer ${token}` }});
        if (!response.ok) throw new Error("Crop listing not found.");
        const data = await response.json();
        setCrop({ id: data.id, name: data.crop_type, farmer: data.farmer.full_name, farmer_id: data.farmer_id, location: data.location, price: parseFloat(data.expected_price_per_unit), unit: data.unit, quantity: data.quantity });
        await fetchWalletBalance();
      } catch (err) {
        setPageError(err.message);
      } finally {
        setPageLoading(false);
      }
    };
    fetchInitialData();
  }, [cropId, token, fetchWalletBalance]);

  const [formData, setFormData] = useState({
    'spot-buy': { quantity: '', price: '', qualitySpecs: 'Standard Grade', quantityInTons: '', milestones: [], signature: null },
    'forward-agreement': { farmingArea: '5', fixedPrice: '', estimatedYield: '10', milestones: [], signature: null },
    'input-financing': { inputsValue: '50000', buybackPrice: '', qualityStandards: 'Grade A', inputsProvided: 'Seeds, Fertilizer', milestones: [], signature: null },
    'quality-tiered': { basePrice: '', estimatedQuantity: '', estimatedQuantityInTons: '', tiers: [{ grade: 'Grade A', adjustment: '10' }, { grade: 'Grade B (Base)', adjustment: '0' }, { grade: 'Grade C', adjustment: '-10' }], milestones: [], signature: null },
    'staggered-delivery': { totalQuantity: '', pricePerUnit: '', totalQuantityInTons: '', deliveries: '4', milestones: [], signature: null },
    'custom-project': { totalValue: '500000', projectDescription: 'Specialty organic crop cultivation', milestones: [{ desc: 'Initial Setup', val: '20', type: 'progress' }, { desc: 'Final Product Delivery', val: '80', type: 'deliverable' }], signature: null },
  });

  useEffect(() => {
    if (crop) {
      const priceStr = crop.price.toString();
      const quantityStr = crop.quantity.toString();
      const tonsStr = convertToTons(crop.quantity, crop.unit) || '';
      setFormData(prev => ({
        'spot-buy': { ...prev['spot-buy'], quantity: quantityStr, price: priceStr, quantityInTons: tonsStr, milestones: [ { desc: 'Pre-delivery Inspection Photos', val: '10', type: 'progress' }, { desc: 'Final Delivery & Acceptance', val: '90', type: 'deliverable' } ] },
        'forward-agreement': { ...prev['forward-agreement'], fixedPrice: priceStr, milestones: [ { desc: 'Proof of Sowing Completion', val: '20', type: 'progress' }, { desc: 'Mid-Growth Progress Report', val: '30', type: 'progress' }, { desc: 'Final Harvest Delivery', val: '50', type: 'deliverable' } ] },
        'input-financing': { ...prev['input-financing'], buybackPrice: (crop.price * 0.9).toFixed(2), milestones: [ { desc: 'Farmer Acknowledges Receipt of Inputs', val: '0', type: 'progress' }, { desc: 'Mid-Growth Inspection Passed', val: '40', type: 'progress' }, { desc: 'Final Produce Buyback & Delivery', val: '60', type: 'deliverable' } ] },
        'quality-tiered': { ...prev['quality-tiered'], basePrice: priceStr, estimatedQuantity: quantityStr, estimatedQuantityInTons: tonsStr, milestones: [ { desc: 'Pre-Harvest Sample Approved', val: '20', type: 'progress' }, { desc: 'Final Delivery & Quality Assessment', val: '80', type: 'deliverable' } ] },
        'staggered-delivery': { ...prev['staggered-delivery'], totalQuantity: quantityStr, pricePerUnit: priceStr, totalQuantityInTons: tonsStr, deliveries: '4', milestones: [ { desc: 'Delivery 1 of 4', val: '25.00', type: 'deliverable' }, { desc: 'Delivery 2 of 4', val: '25.00', type: 'deliverable' }, { desc: 'Delivery 3 of 4', val: '25.00', type: 'deliverable' }, { desc: 'Delivery 4 of 4', val: '25.00', type: 'deliverable' } ] },
        'custom-project': { ...prev['custom-project'] }
      }));
    }
  }, [crop]);
  
  const handleFormChange = (templateId, updatedData) => setFormData(prev => ({ ...prev, [templateId]: updatedData }));

  const templates = [
    { id: 'spot-buy', title: 'Secured Spot Buy', description: 'Simple one-time purchase of ready-to-harvest produce.', bestFor: 'Quick, low-risk transactions.', milestones: '1 Progress, 1 Deliverable' },
    { id: 'forward-agreement', title: 'Forward Agreement', description: 'Lock-in a fixed price for a future harvest.', bestFor: 'Price stability for both parties.', milestones: '2 Progress, 1 Deliverable' },
    { id: 'input-financing', title: 'Input Financing & Buyback', description: 'Provide inputs and guarantee to buy back the harvest.', bestFor: 'Ensuring quality & securing supply.', milestones: '2 Progress, 1 Deliverable' },
    { id: 'quality-tiered', title: 'Quality-Tiered Pricing', description: 'Price varies based on the final grade of the produce.', bestFor: 'High-value crops with variable quality.', milestones: '1 Progress, 1 Deliverable' },
    { id: 'staggered-delivery', title: 'Staggered Delivery', description: 'Receive the total quantity in multiple scheduled deliveries.', bestFor: 'Managing inventory and cash flow.', milestones: 'Multiple Deliverables' },
    { id: 'custom-project', title: 'Custom Project Contract', description: 'Fully flexible terms and milestones for unique projects.', bestFor: 'Specialty crops or R&D.', milestones: 'Fully Customizable' },
  ];
  
  const handleViewTemplateClick = (id) => { setViewedTemplateId(id); setIsViewModalOpen(true); };
  
  const handleSendProposal = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    const currentData = formData[selectedTemplate];
    let contractPayload = {};
    let totalValue = 0;
    try {
        if (selectedTemplate === 'spot-buy') {
            totalValue = parseFloat(currentData.quantity) * parseFloat(currentData.price);
            contractPayload = { listing_id: crop.id, quantity_proposed: parseFloat(currentData.quantity), price_per_unit_agreed: parseFloat(currentData.price), payment_terms: `Secured Spot Buy: ${currentData.qualitySpecs}` };
        } else if (selectedTemplate === 'forward-agreement') {
            const qty = parseFloat(currentData.farmingArea) * parseFloat(currentData.estimatedYield);
            totalValue = qty * parseFloat(currentData.fixedPrice);
            contractPayload = { listing_id: crop.id, quantity_proposed: qty, price_per_unit_agreed: parseFloat(currentData.fixedPrice), payment_terms: "Forward Agreement (Fixed Price)" };
        } else if (selectedTemplate === 'input-financing') {
            const buybackPercent = (currentData.milestones || []).find(m => m.desc.includes('Buyback'))?.val || 60;
            totalValue = parseFloat(currentData.inputsValue) / (1 - (buybackPercent/100));
            const qty = totalValue / parseFloat(currentData.buybackPrice);
            contractPayload = { listing_id: crop.id, quantity_proposed: isNaN(qty) ? 0 : qty, price_per_unit_agreed: parseFloat(currentData.buybackPrice), payment_terms: `Input Financing: ${currentData.inputsProvided}` };
        } else if (selectedTemplate === 'quality-tiered') {
            totalValue = parseFloat(currentData.estimatedQuantity) * parseFloat(currentData.basePrice);
            contractPayload = { listing_id: crop.id, quantity_proposed: parseFloat(currentData.estimatedQuantity), price_per_unit_agreed: parseFloat(currentData.basePrice), payment_terms: "Quality-Tiered Pricing Contract" };
        } else if (selectedTemplate === 'staggered-delivery') {
            totalValue = parseFloat(currentData.totalQuantity) * parseFloat(currentData.pricePerUnit);
            contractPayload = { listing_id: crop.id, quantity_proposed: parseFloat(currentData.totalQuantity), price_per_unit_agreed: parseFloat(currentData.pricePerUnit), payment_terms: `Staggered Delivery (${currentData.deliveries} parts)` };
        } else if (selectedTemplate === 'custom-project') {
            totalValue = parseFloat(currentData.totalValue);
            contractPayload = { listing_id: crop.id, quantity_proposed: 1, price_per_unit_agreed: totalValue, payment_terms: `Custom Project: ${currentData.projectDescription}` };
        }
        const contractResponse = await fetch("http://localhost:8000/api/contracts/", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(contractPayload) });
        if (!contractResponse.ok) { const err = await contractResponse.json(); throw new Error(`Contract Error: ${err.detail}`); }
        const newContract = await contractResponse.json();
        for (const milestone of (currentData.milestones || [])) {
            const milestonePayload = {
                name: milestone.desc,
                amount: totalValue * (parseFloat(milestone.val) / 100),
                milestone_type: milestone.type === 'deliverable' ? 'deliverable' : 'progress',
            };
            await postMilestone(newContract.id, milestonePayload, token);
        }
        setSubmitSuccess(true);
        setTimeout(() => navigate('/buyer/contracts'), 2000);
    } catch (err) {
        setSubmitError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
      if (mode === 'edit') setMode('info');
      else if (mode === 'preview') setMode('edit');
      else navigate('/buyer/browse');
  };

  const renderContent = () => {
    if (mode === 'info') return <TemplateSelectionGrid templates={templates} onSelect={(id) => { setSelectedTemplate(id); setMode('edit'); }} onView={handleViewTemplateClick} />;
    
    const currentData = formData[selectedTemplate];
    if (!currentData) return null;

    const currentSetData = (updatedData) => handleFormChange(selectedTemplate, updatedData);
    const escrowProps = { requiredEscrow, walletBalance, termsAgreed, onTermsChange: (e) => setTermsAgreed(e.target.checked), onAddFundsClick: () => setIsFundsModalOpen(true) };
    const props = { crop, buyer: buyerDetails, formData: currentData, setFormData: currentSetData, setMode, onEscrowChange: setRequiredEscrow, escrowProps };
    const previewProps = { data: currentData, crop, buyer: buyerDetails, isSubmitting, submitError, submitSuccess, onSendProposal: handleSendProposal };

    switch (mode) {
      case 'edit':
         switch (selectedTemplate) {
            case 'spot-buy': return <SecuredSpotBuyForm {...props} />;
            case 'forward-agreement': return <ForwardAgreementForm {...props} />;
            case 'input-financing': return <InputFinancingForm {...props} />;
            case 'quality-tiered': return <QualityTieredForm {...props} />;
            case 'staggered-delivery': return <StaggeredDeliveryForm {...props} />;
            case 'custom-project': return <CustomProjectForm {...props} />;
            default: return null;
          }
      case 'preview':
        switch (selectedTemplate) {
            case 'spot-buy': return <SecuredSpotBuyPreview {...previewProps} />;
            case 'forward-agreement': return <ForwardAgreementPreview {...previewProps} />;
            case 'input-financing': return <InputFinancingPreview {...previewProps} />;
            case 'quality-tiered': return <QualityTieredPreview {...previewProps} />;
            case 'staggered-delivery': return <StaggeredDeliveryPreview {...previewProps} />;
            case 'custom-project': return <CustomProjectPreview {...previewProps} />;
            default: return null;
        }
      default: return null;
    }
  };
  
  if (pageLoading) return <div className="p-8 flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-green-600" /></div>;
  if (pageError) return <div className="p-8 flex justify-center items-center h-screen bg-red-50 text-red-700"><AlertCircle size={24} className="mr-2" /> {pageError}</div>;

  return (
    <>
      {isFundsModalOpen && <AddFundsModal onClose={() => setIsFundsModalOpen(false)} onAddFunds={handleAddFunds} requiredAmount={requiredEscrow - walletBalance > 0 ? (requiredEscrow - walletBalance).toFixed(2) : 0} />}
      {isViewModalOpen && <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}><TemplateViewer templateId={viewedTemplateId} templates={templates} /></Modal>}
      <div className="bg-gray-50 p-4 md:p-8 min-h-screen">
        <header className="flex items-center space-x-4 mb-8">
            <button onClick={handleBackClick} className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={24} /></button>
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Create a New Contract</h1>
                <p className="text-gray-600 mt-1">Proposing a contract for <strong>{crop?.name || '...'}</strong> with farmer <strong>{crop?.farmer || '...'}</strong>.</p>
            </div>
        </header>
        
        {mode !== 'info' ? (
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70 rounded-t-lg">
                        <div>
                            <h2 className="font-semibold text-lg text-gray-800">{templates.find(t => t.id === selectedTemplate)?.title}</h2>
                            <p className="text-sm text-gray-500">{templates.find(t => t.id === selectedTemplate)?.description}</p>
                        </div>
                        {mode === 'edit' && <button onClick={() => setMode('info')} className="px-3 py-1.5 text-sm font-semibold rounded-md flex items-center space-x-2 bg-gray-200 text-gray-700 hover:bg-gray-300"><ArrowLeft size={16} /><span>Change Template</span></button>}
                        {mode === 'preview' && <button onClick={() => setMode('edit')} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center space-x-2 bg-gray-600 text-white hover:bg-gray-700"><Edit size={16} /><span>Back to Edit</span></button>}
                    </div>
                    <div className="p-6 md:p-8">{renderContent()}</div>
                </div>
            </div>
        ) : ( renderContent() )}
      </div>
    </>
  );
};

// --- HELPER & REUSABLE UI COMPONENTS ---
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return ( <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}> <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}> <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white"> <h3 className="text-lg font-semibold">Contract Template Details</h3> <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button> </div> <div className="p-6 overflow-y-auto">{children}</div> <div className="p-4 border-t bg-gray-50 sticky bottom-0"> <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 w-full sm:w-auto">Close</button> </div> </div> </div> );
};
const TemplateViewer = ({ templateId, templates }) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return <div>Template not found.</div>;
    const renderContent = () => {
        switch (templateId) {
            case 'spot-buy':
                return (
                    <>
                        <p>This agreement outlines a straightforward, one-time purchase of agricultural produce. It is designed for transactions where the goods are ready for sale.</p>
                        <h4 className="font-bold mt-4">Article 1: Sale of Goods</h4>
                        <p>The Farmer agrees to sell, and the Buyer agrees to purchase, a specified quantity of produce at a pre-agreed price and quality standard.</p>
                        <h4 className="font-bold mt-4">Article 2: Inspection and Acceptance</h4>
                        <p>The Buyer has the right to inspect the produce upon delivery. Acceptance of the goods confirms they meet the quality specifications. A preliminary inspection via uploaded images may be required as a milestone.</p>
                        <h4 className="font-bold mt-4">Article 3: Payment</h4>
                        <p>Payment is secured in an escrow account and released to the Farmer in stages, with the final and largest portion released upon successful delivery and acceptance of the goods.</p>
                        <h4 className="font-bold mt-4">Conditions</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>The Farmer is responsible for the harvest and transportation to the agreed delivery point.</li>
                            <li>The Buyer must accept or reject the delivery within 48 hours of receipt. No response will be deemed as acceptance.</li>
                            <li>Failure to meet quality standards may result in a price reduction or rejection of the entire batch, subject to the platform's dispute resolution process.</li>
                        </ul>
                    </>
                );
            case 'forward-agreement':
                 return (
                    <>
                        <p>This agreement enables a Buyer to secure a future harvest from a Farmer at a price that is fixed at the time of signing, mitigating future market price volatility for both parties.</p>
                        <h4 className="font-bold mt-4">Article 1: Commitment</h4>
                        <p>The Farmer commits to cultivating a specific crop over a designated land area and selling the entire yield from that area exclusively to the Buyer. The Buyer commits to purchasing this entire yield at the fixed price.</p>
                        <h4 className="font-bold mt-4">Article 2: Pricing and Yield</h4>
                        <p>A fixed price per unit (e.g., per Kg or Ton) is agreed upon. The total contract value is estimated based on projected yield, but the final payment will be based on the actual weight of the delivered harvest.</p>
                        <h4 className="font-bold mt-4">Article 3: Progress Monitoring</h4>
                        <p>The Farmer must provide periodic updates with evidence (e.g., images) at key growth stages, such as sowing and mid-growth, to release pre-delivery milestone payments from escrow.</p>
                        <h4 className="font-bold mt-4">Conditions</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>The Farmer must adhere to good agricultural practices to ensure a healthy crop.</li>
                            <li>Risk of yield shortfall due to natural causes or pests is borne by the Farmer. The Buyer is only obligated to pay for the quantity actually delivered.</li>
                            <li>The final payment is adjusted based on the actual delivered quantity multiplied by the fixed price per unit.</li>
                        </ul>
                    </>
                );
            case 'input-financing':
                 return (
                    <>
                        <p>This agreement is for a partnership where the Buyer provides essential inputs (such as seeds, fertilizer, or funds) to the Farmer, and in return, gains the exclusive right to purchase the resulting harvest.</p>
                        <h4 className="font-bold mt-4">Article 1: Provision of Inputs</h4>
                        <p>The Buyer agrees to provide the Farmer with specified agricultural inputs or a financial equivalent. The Farmer agrees to use these inputs for the cultivation of the contracted crop on the designated land.</p>
                        <h4 className="font-bold mt-4">Article 2: Exclusive Buyback</h4>
                        <p>The Farmer is obligated to sell the entire harvest produced using the provided inputs exclusively to the Buyer at the pre-agreed buyback price.</p>
                        <h4 className="font-bold mt-4">Article 3: Payment and Cost Recovery</h4>
                        <p>The total value of the provided inputs is treated as an advance to the Farmer. This value will be deducted from the final payment after the harvest is delivered, weighed, and accepted. Milestone payments for progress may be disbursed during the cultivation period.</p>
                        <h4 className="font-bold mt-4">Conditions</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>The Farmer must follow any technical guidance provided by the Buyer to ensure crop quality and yield.</li>
                            <li>The buyback is conditional upon the final produce meeting the agreed-upon quality standards.</li>
                            <li>In the event of a total crop failure due to a verified natural disaster, terms for the recovery of input costs may be renegotiated or deferred.</li>
                        </ul>
                    </>
                );
            case 'quality-tiered':
                 return (
                    <>
                        <p>This agreement is structured for produce where quality significantly impacts market value. It establishes a multi-level pricing system based on the final grade of the delivered goods.</p>
                        <h4 className="font-bold mt-4">Article 1: Base Price and Quality Tiers</h4>
                        <p>A "Base Price" is set for a standard, acceptable grade of produce. The contract explicitly defines superior and inferior grades, each with a corresponding price adjustment (e.g., Grade A: +15% to Base, Grade C: -20% from Base).</p>
                        <h4 className="font-bold mt-4">Article 2: Quality Assessment</h4>
                        <p>Upon delivery, the Buyer will perform a quality assessment based on objective, pre-defined criteria (e.g., size, brix level, color, percentage of defects). The Farmer has the right to be present during this assessment.</p>
                        <h4 className="font-bold mt-4">Article 3: Final Payment Calculation</h4>
                        <p>The final payment is calculated by segregating the delivery by grade, and multiplying the weight of each grade by its corresponding tiered price. The sum of these amounts constitutes the total payment.</p>
                        <h4 className="font-bold mt-4">Conditions</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>The criteria for each quality tier must be clearly defined and measurable to be enforceable.</li>
                            <li>Any produce falling below the lowest specified grade may be rejected by the Buyer.</li>
                            <li>In case of a dispute over the quality assessment, an independent third-party surveyor may be appointed through the platform.</li>
                        </ul>
                    </>
                );
            case 'staggered-delivery':
                 return (
                    <>
                        <p>This agreement is designed for a long-term supply arrangement where a large total quantity of produce is delivered in multiple, smaller scheduled batches over a period of time.</p>
                        <h4 className="font-bold mt-4">Article 1: Total Quantity and Schedule</h4>
                        <p>The contract specifies the total quantity to be purchased and a definitive schedule of deliveries, including the date and required quantity for each batch.</p>
                        <h4 className="font-bold mt-4">Article 2: Acceptance of Batches</h4>
                        <p>Each delivery is treated as a distinct transaction. The Buyer will inspect, and subsequently accept or reject, each batch based on the agreed quality standards. Acceptance of one batch does not guarantee acceptance of future batches.</p>
                        <h4 className="font-bold mt-4">Article 3: Milestone Payments</h4>
                        <p>The total contract value is held in escrow. A proportional payment is released to the Farmer upon the successful delivery and acceptance of each scheduled batch, as per the milestone schedule.</p>
                        <h4 className="font-bold mt-4">Conditions</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>The price per unit is fixed for the entire duration of the contract, regardless of market fluctuations.</li>
                            <li>A single failure to deliver a scheduled batch may, at the Buyer's discretion, constitute a breach of the entire contract.</li>
                            <li>The Farmer must ensure consistent quality across all deliveries as per the contract's standards.</li>
                        </ul>
                    </>
                );
            case 'custom-project':
                 return (
                    <>
                        <p>This is a flexible agreement for non-standard agricultural projects, such as cultivating specialty organic crops, research and development trials, or unique value-added processing. Its terms are defined by the parties involved.</p>
                        <h4 className="font-bold mt-4">Article 1: Scope of Work</h4>
                        <p>The overall goal, activities, and expected outcomes of the project are defined in the "Project Description" provided by the Buyer and agreed to by the Farmer.</p>
                        <h4 className="font-bold mt-4">Article 2: Custom Milestones</h4>
                        <p>The project's progression and payment schedule are governed entirely by a custom set of milestones. Each milestone includes a detailed description of the required task, a payment percentage, and a type (Progress-based via images, or Deliverable-based).</p>
                        <h4 className="font-bold mt-4">Article 3: Evidence and Approval</h4>
                        <p>For each milestone, the Farmer must provide verifiable evidence of completion. The Buyer is responsible for reviewing this evidence in a timely manner to approve the milestone and release the corresponding payment from escrow.</p>
                        <h4 className="font-bold mt-4">Conditions</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>The specific obligations of each party are defined primarily by the custom milestone descriptions.</li>
                            <li>Any changes to the project scope, timeline, or budget must be mutually agreed upon in writing as a formal contract amendment.</li>
                            <li>A clear and accessible dispute resolution mechanism is essential due to the unique nature of the project.</li>
                        </ul>
                    </>
                );
            default:
                return <p>Detailed terms and conditions for this template are being finalized.</p>;
        }
    };
    return ( <div className="prose prose-sm max-w-none"> <h3 className="text-xl font-bold">{template.title}</h3> {renderContent()} </div> );
};
const FormField = ({ label, name, value, onChange, type = 'text', as: Component = 'input', ...props }) => ( <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><Component name={name} value={value} onChange={onChange} type={type} className="w-full p-2 border rounded-md bg-gray-50 focus:ring-green-500 focus:border-green-500" {...props} /></div> );
const PartiesSection = ({ crop, buyer }) => ( <section><h3 className="text-xl font-semibold border-b pb-2 mb-4">Parties Involved</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"><div><p className="font-medium text-gray-500">Farmer</p><p>{crop?.farmer || '...'}</p></div><div><p className="font-medium text-gray-500">Buyer</p><p>{buyer?.name || '...'}</p></div></div></section> );
const SignatureEditSection = ({ onSave }) => ( <section><h3 className="text-xl font-semibold border-b pb-2 mb-4">Your Digital Signature</h3><p className="text-sm text-gray-600 mb-4">Upload an image of your signature. This will be considered a binding digital signature upon acceptance by the farmer.</p><div onClick={e => e.stopPropagation()}><SignatureUploader onSave={onSave} /></div></section>);
const FormActions = ({ onPreview, isDisabled }) => ( <div className="mt-8 pt-6 border-t"><button type="button" onClick={onPreview} disabled={isDisabled} title={isDisabled ? "Complete all steps: Signature, Funding, and Agreement" : "Proceed to Preview"} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 text-base disabled:bg-gray-400 disabled:cursor-not-allowed"><Eye size={20} /><span>Preview Contract</span></button></div> );
const MilestoneBadge = ({ type }) => { const isDeliverable = type === 'deliverable'; return ( <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isDeliverable ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{isDeliverable ? <Package size={12} className="mr-1" /> : <ImageIcon size={12} className="mr-1" />}{isDeliverable ? 'Deliverable' : 'Progress'}</span>);};
const DynamicMilestoneSection = ({ formData, setFormData, isEditable = true }) => {
    const { milestones } = formData;
    const handleMilestoneChange = (index, event) => { const { name, value } = event.target; setFormData(prev => { const newMilestones = [...(prev.milestones || [])]; newMilestones[index] = { ...newMilestones[index], [name]: value }; return { ...prev, milestones: newMilestones }; }); };
    const handleAddMilestone = () => setFormData(prev => ({ ...prev, milestones: [...(prev.milestones || []), { desc: '', val: '0', type: 'progress' }] }));
    const handleRemoveMilestone = (index) => setFormData(prev => ({ ...prev, milestones: (prev.milestones || []).filter((_, i) => i !== index) }));
    const totalPercentage = useMemo(() => (milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [milestones]);
    return ( <section><div className="flex justify-between items-center border-b pb-2 mb-4"><h3 className="text-xl font-semibold">Payment Milestones</h3><div className={`text-sm font-bold ${Math.round(totalPercentage) === 100 ? 'text-green-600' : 'text-red-500'}`}>Total: {Math.round(totalPercentage)}% {Math.round(totalPercentage) !== 100 && "(Must be 100%)"}</div></div><div className="p-4 bg-gray-50 rounded-md space-y-4">{(milestones || []).map((milestone, index) => (<div key={index} className="flex items-start gap-x-3"><div className="flex-grow grid grid-cols-12 gap-x-3 items-end"><div className="col-span-8"><FormField as="textarea" rows="2" label={`Milestone ${index + 1} Description`} name="desc" value={milestone.desc} onChange={(e) => handleMilestoneChange(index, e)} disabled={!isEditable} /></div><div className="col-span-4 sm:col-span-2"><FormField label="Payment %" name="val" value={milestone.val} onChange={(e) => handleMilestoneChange(index, e)} type="number" disabled={!isEditable} /></div><div className="col-span-12 sm:col-span-2 self-center pt-5">{isEditable ? ( <select name="type" value={milestone.type} onChange={(e) => handleMilestoneChange(index, e)} className="w-full p-2 border rounded-md bg-white focus:ring-green-500 focus:border-green-500 text-sm"><option value="progress">Progress</option><option value="deliverable">Deliverable</option></select>) : <MilestoneBadge type={milestone.type} />}</div></div>{isEditable && (milestones || []).length > 1 && <button type="button" onClick={() => handleRemoveMilestone(index)} className="mt-7 p-2 text-red-500 hover:bg-red-100 rounded-full"><XCircle size={20} /></button>}</div>))}
    {isEditable && <button type="button" onClick={handleAddMilestone} className="w-full mt-2 text-sm font-semibold text-green-600 hover:bg-green-100 rounded-md p-2 flex items-center justify-center space-x-2"><PlusCircle size={16} /><span>Add Milestone</span></button>}
    </div>{Math.round(totalPercentage) !== 100 && <p className="text-red-600 text-sm mt-2">Milestone payments must add up to exactly 100%.</p>}</section> );
};
const TemplateSelectionGrid = ({ templates, onSelect, onView }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Contract Template</h2>
        <p className="text-gray-600 mb-6">Choose the template that best fits your agreement needs. You can customize the details in the next step.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
                <div key={template.id} className="border bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="p-5 flex-grow"><h3 className="font-bold text-lg text-gray-900">{template.title}</h3><p className="text-sm text-gray-600 mt-1">{template.description}</p><div className="mt-4 pt-4 border-t border-gray-100"><p className="text-xs font-semibold text-gray-400 mb-2">DETAILS</p><p className="text-sm"><strong className="font-medium text-gray-700">Best for:</strong> <span className="text-gray-600">{template.bestFor}</span></p><p className="text-sm mt-1"><strong className="font-medium text-gray-700">Milestones:</strong> <span className="text-gray-600">{template.milestones}</span></p></div></div>
                    <div className="bg-gray-50 p-4 rounded-b-lg grid grid-cols-2 gap-3"><button onClick={() => onView(template.id)} className="w-full bg-blue-500 border border-gray-300 text-white font-semibold py-2 rounded-md hover:bg-blue-700 text-sm">View Template</button><button onClick={() => onSelect(template.id)} className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 text-sm">Use Template</button></div>
                </div>
            ))}
        </div>
    </div>
);
const EscrowAndApprovalSection = ({ requiredEscrow, walletBalance, onAddFundsClick, termsAgreed, onTermsChange }) => {
    const hasSufficientFunds = walletBalance >= requiredEscrow;
    const amountNeeded = requiredEscrow - walletBalance;
    return (
        <section className="space-y-6 mt-8 pt-6 border-t">
            <h3 className="text-xl font-semibold">Escrow & Final Approval</h3>
            <div className="p-4 border rounded-lg bg-gray-50/70 space-y-4"><div className="flex justify-between items-center text-sm"><span className="text-gray-600">Required Escrow Amount:</span><span className="font-bold text-gray-800">₹{requiredEscrow.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div><div className="flex justify-between items-center text-sm"><span className="text-gray-600">Your Current Wallet Balance:</span><span className="font-bold text-gray-800">₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                {!hasSufficientFunds ? (<div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-center space-y-2"><p className="font-semibold text-sm">Action Required: Insufficient Funds</p><button type="button" onClick={onAddFundsClick} className="w-full bg-yellow-400 text-yellow-900 font-bold py-2 rounded-lg hover:bg-yellow-500 flex items-center justify-center space-x-2 text-base"><Wallet size={18} /><span>Add ₹{amountNeeded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to Wallet</span></button></div>) : (<div className="p-3 bg-green-50 text-green-800 rounded-md text-center"><p className="font-semibold text-sm flex items-center justify-center space-x-2"><CheckSquare size={18} /><span>Sufficient funds available for escrow.</span></p></div>)}
            </div>
            <div className="flex items-start"><input type="checkbox" id="terms" checked={termsAgreed} onChange={onTermsChange} className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" /><label htmlFor="terms" className="ml-3 text-sm text-gray-600">I agree with the terms and conditions of the agreement and wish to send this proposal for the farmer's approval.</label></div>
        </section>
    );
};
const A4PreviewWrapper = ({ children, title, description, signatureFile, onSendProposal, isSubmitting, submitError, submitSuccess }) => {
  const [signatureUrl, setSignatureUrl] = useState(null);
  useEffect(() => { if (signatureFile instanceof File) { const url = URL.createObjectURL(signatureFile); setSignatureUrl(url); return () => URL.revokeObjectURL(url); } }, [signatureFile]);
  const KrishiConnectLetterhead = () => ( <div className="mb-10 pb-5 border-b-2 border-gray-300 text-center"><span className="text-4xl font-extrabold text-green-700 font-sans">KrishiConnect</span><p className="text-lg text-gray-700 font-medium italic">Empowering Farmers. Assuring Buyers.</p></div> );
  return ( <div className="bg-white p-12 shadow-lg max-w-3xl mx-auto font-serif text-gray-800"><KrishiConnectLetterhead /><h2 className="text-2xl font-bold text-center mb-4">{title}</h2><p className="text-center text-gray-600 mb-8 italic">{description}</p><div className="space-y-6 text-sm">{children}</div><div className="mt-16 border-t pt-8"><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div><h4 className="font-semibold text-center mb-2">Farmer's Signature</h4><div className="h-48 flex items-center justify-center bg-gray-50 rounded-md border-2 border-dashed"><p className="text-gray-400 text-sm">Awaiting Farmer's Signature</p></div></div><div><h4 className="font-semibold text-center mb-2">Buyer's Signature</h4><div className="h-48 flex items-center justify-center border-2 border-dashed rounded-md p-4">{signatureUrl ? (<img src={signatureUrl} alt="Buyer Signature" className="max-h-full" />) : (<p className="text-gray-400 text-sm">No Signature Attached</p>)}</div></div></div><div className="mt-8 pt-6 border-t">{submitSuccess ? (<div className="text-center p-4 bg-green-50 text-green-700 rounded-md"><CheckSquare size={24} className="mx-auto mb-2" /><p className="font-semibold">Proposal Sent Successfully!</p><p className="text-sm">Redirecting...</p></div>) : (<>{submitError && (<div className="text-left p-3 mb-4 bg-red-50 text-red-700 rounded-md flex items-start space-x-2"><AlertCircle size={20} className="flex-shrink-0 mt-0.5" /><div><p className="font-semibold">Submission Failed</p><p className="text-sm">{submitError}</p></div></div>)}<button onClick={onSendProposal} disabled={isSubmitting} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 text-base disabled:bg-gray-400">{isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}<span>{isSubmitting ? "Submitting..." : "Confirm & Send Proposal"}</span></button></>)}</div></div></div> );
};
const GenericMilestonePreviewSection = ({totalValue, milestones}) => ( <><h3 className="font-bold mt-6 mb-2 text-base">Article 2: Payment and Escrow</h3><p>The Total Contract Value shall be held in the KrishiConnect Escrow Account and released according to the following milestones:</p><table className="w-full text-left border-collapse my-2 text-xs sm:text-sm"><thead className="bg-gray-100"><tr><th className="p-2 border">Milestone Description</th><th className="p-2 border">Type</th><th className="p-2 border">Payment</th></tr></thead><tbody>{(milestones || []).map((m, i) => (<tr key={i}><td className="p-2 border">{m.desc}</td><td className="p-2 border capitalize">{m.type}</td><td className="p-2 border">{m.val}% (₹{ (totalValue * (parseFloat(m.val) || 0) / 100).toLocaleString('en-IN') })</td></tr>))}</tbody></table></> );

const SecuredSpotBuyForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSignatureSave = (file) => setFormData(prev => ({ ...prev, signature: file }));
    const totalValue = useMemo(() => (parseFloat(formData.quantity) || 0) * (parseFloat(formData.price) || 0), [formData.quantity, formData.price]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature && hasSufficientFunds && escrowProps.termsAgreed;
    return (
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <PartiesSection crop={crop} buyer={buyer} />
        <section>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField label={`Quantity to Buy (${crop?.unit || 'units'})`} name="quantity" value={formData.quantity} onChange={handleInputChange} type="number" />
            <FormField label="Quantity in Tons" name="quantityInTons" value={formData.quantityInTons} onChange={handleInputChange} type="number" placeholder="e.g., 1.5" />
            <FormField label={`Price per ${crop?.unit || 'unit'} (₹)`} name="price" value={formData.price} onChange={handleInputChange} type="number" />
          </div>
          <div className="mt-6"><FormField label="Quality Specifications" name="qualitySpecs" value={formData.qualitySpecs} onChange={handleInputChange} placeholder="e.g., Grade A" /></div>
        </section>
        <DynamicMilestoneSection formData={formData} setFormData={setFormData} isEditable={false} />
        <SignatureEditSection onSave={handleSignatureSave} />
        <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
        <FormActions onPreview={() => setMode('preview')} isDisabled={!isValid} />
      </form> 
    );
};
const ForwardAgreementForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSignatureSave = (file) => setFormData(prev => ({ ...prev, signature: file }));
    const { totalValue, calculatedYield } = useMemo(() => {
        const yieldVal = (parseFloat(formData.farmingArea) || 0) * (parseFloat(formData.estimatedYield) || 0);
        const tons = convertToTons(yieldVal, crop?.unit);
        const value = yieldVal * (parseFloat(formData.fixedPrice) || 0);
        return { totalValue: value, calculatedYield: { totalYield: yieldVal, tons } };
    }, [formData.farmingArea, formData.estimatedYield, formData.fixedPrice, crop?.unit]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature && hasSufficientFunds && escrowProps.termsAgreed;
    return (
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <PartiesSection crop={crop} buyer={buyer} />
        <section>
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Farming Area (Acres)" name="farmingArea" value={formData.farmingArea} onChange={handleInputChange} type="number" />
                <FormField label={`Estimated Yield (${crop?.unit || 'units'}/Acre)`} name="estimatedYield" value={formData.estimatedYield} onChange={handleInputChange} type="number" />
                <FormField label={`Fixed Price per ${crop?.unit || 'unit'} (₹)`} name="fixedPrice" value={formData.fixedPrice} onChange={handleInputChange} type="number" />
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm"><p><strong>Calculated Total Yield:</strong> {calculatedYield.totalYield.toLocaleString()} {crop?.unit || 'units'} (~{calculatedYield.tons} Tons)</p></div>
        </section>
        <DynamicMilestoneSection formData={formData} setFormData={setFormData} isEditable={false} />
        <SignatureEditSection onSave={handleSignatureSave} />
        <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
        <FormActions onPreview={() => setMode('preview')} isDisabled={!isValid} />
      </form>
    );
};
const InputFinancingForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSignatureSave = (file) => setFormData(prev => ({ ...prev, signature: file }));
    const { totalValue, calculatedQuantity } = useMemo(() => {
        const buybackPercent = (formData.milestones || []).find(m => m.desc.includes('Buyback'))?.val || 60;
        const value = (parseFloat(formData.inputsValue) || 0) / (1 - (buybackPercent / 100));
        const quantity = value / (parseFloat(formData.buybackPrice) || 1);
        const tons = convertToTons(quantity, crop?.unit);
        return { totalValue: value, calculatedQuantity: { quantity: isNaN(quantity) ? 0 : quantity.toFixed(2), tons } };
    }, [formData.inputsValue, formData.buybackPrice, formData.milestones, crop?.unit]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature && hasSufficientFunds && escrowProps.termsAgreed;
    return (
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <PartiesSection crop={crop} buyer={buyer} />
        <section>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
          <FormField label="Inputs Provided by Buyer (Description)" as="textarea" rows="3" name="inputsProvided" value={formData.inputsProvided} onChange={handleInputChange} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <FormField label="Total Value of Inputs (₹)" name="inputsValue" value={formData.inputsValue} onChange={handleInputChange} type="number"/>
            <FormField label={`Buyback Price per ${crop?.unit || 'unit'} (₹)`} name="buybackPrice" value={formData.buybackPrice} onChange={handleInputChange} type="number" />
            <FormField label="Quality Standards" name="qualityStandards" value={formData.qualityStandards} onChange={handleInputChange} />
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm"><p><strong>Estimated Buyback Quantity:</strong> {calculatedQuantity.quantity} {crop?.unit || 'units'} (~{calculatedQuantity.tons} Tons)</p></div>
        </section>
        <DynamicMilestoneSection formData={formData} setFormData={setFormData} isEditable={false} />
        <SignatureEditSection onSave={handleSignatureSave} />
        <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
        <FormActions onPreview={() => setMode('preview')} isDisabled={!isValid} />
      </form>
    );
};
const QualityTieredForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSignatureSave = (file) => setFormData(prev => ({ ...prev, signature: file }));
    const totalValue = useMemo(() => (parseFloat(formData.estimatedQuantity) || 0) * (parseFloat(formData.basePrice) || 0), [formData.estimatedQuantity, formData.basePrice]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature && hasSufficientFunds && escrowProps.termsAgreed;
    const handleTierChange = (index, event) => { const { name, value } = event.target; setFormData(prev => { const newTiers = [...(prev.tiers || [])]; newTiers[index] = { ...newTiers[index], [name]: value }; return { ...prev, tiers: newTiers }; }); };
    const addTier = () => setFormData(prev => ({ ...prev, tiers: [...(prev.tiers || []), { grade: '', adjustment: '0' }] }));
    const removeTier = (index) => setFormData(prev => ({ ...prev, tiers: (prev.tiers || []).filter((_, i) => i !== index) }));
    return (
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <PartiesSection crop={crop} buyer={buyer} />
            <section>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label={`Estimated Quantity (${crop?.unit || 'units'})`} name="estimatedQuantity" value={formData.estimatedQuantity} onChange={handleInputChange} type="number" />
                    <FormField label="Est. Quantity in Tons" name="estimatedQuantityInTons" value={formData.estimatedQuantityInTons} onChange={handleInputChange} type="number" placeholder="e.g., 9.5" />
                    <FormField label={`Base Price per ${crop?.unit || 'unit'} (₹)`} name="basePrice" value={formData.basePrice} onChange={handleInputChange} type="number" />
                </div>
            </section>
            <section>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Quality Tiers & Price Adjustments</h3>
                <div className="p-4 bg-gray-50 rounded-md space-y-3">
                    {(formData.tiers || []).map((tier, index) => (
                        <div key={index} className="flex items-end gap-x-3">
                            <div className="flex-grow grid grid-cols-2 gap-x-3">
                                <FormField label={`Grade ${index + 1} Name`} name="grade" value={tier.grade} onChange={(e) => handleTierChange(index, e)} placeholder="e.g., Premium Grade A" />
                                <FormField label="Price Adjustment (%)" name="adjustment" value={tier.adjustment} onChange={(e) => handleTierChange(index, e)} type="number" placeholder="e.g., 15 or -10" />
                            </div>
                            {(formData.tiers || []).length > 1 && <button type="button" onClick={() => removeTier(index)} className="mb-1 p-2 text-red-500 hover:bg-red-100 rounded-full"><XCircle size={20} /></button>}
                        </div>
                    ))}
                    <button type="button" onClick={addTier} className="w-full mt-2 text-sm font-semibold text-green-600 hover:bg-green-100 rounded-md p-2 flex items-center justify-center space-x-2"><PlusCircle size={16} /><span>Add Tier</span></button>
                </div>
            </section>
            <DynamicMilestoneSection formData={formData} setFormData={setFormData} isEditable={false} />
            <SignatureEditSection onSave={handleSignatureSave} />
            <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
            <FormActions onPreview={() => setMode('preview')} isDisabled={!isValid} />
        </form>
    );
};
const StaggeredDeliveryForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const setParentFormData = setFormData;
    const handleInputChange = (e) => { const { name, value } = e.target; setParentFormData(prev => ({ ...prev, [name]: value })); };
    const handleSignatureSave = (file) => setParentFormData(prev => ({ ...prev, signature: file }));
    useEffect(() => {
        const numDeliveries = parseInt(formData.deliveries, 10);
        if (numDeliveries > 0 && !isNaN(numDeliveries)) {
            const newMilestones = []; const basePercentage = 100 / numDeliveries;
            for (let i = 0; i < numDeliveries; i++) { newMilestones.push({ desc: `Delivery ${i + 1} of ${numDeliveries}`, val: basePercentage.toFixed(2), type: 'deliverable' }); }
            const totalVal = newMilestones.reduce((sum, m) => sum + parseFloat(m.val), 0);
            const remainder = 100 - totalVal;
            if (newMilestones.length > 0) { newMilestones[newMilestones.length - 1].val = (parseFloat(newMilestones[newMilestones.length - 1].val) + remainder).toFixed(2); }
            if (JSON.stringify(formData.milestones) !== JSON.stringify(newMilestones)) { setParentFormData(prev => ({ ...prev, milestones: newMilestones })); }
        }
    }, [formData.deliveries, formData.milestones, setParentFormData]);
    const totalValue = useMemo(() => (parseFloat(formData.totalQuantity) || 0) * (parseFloat(formData.pricePerUnit) || 0), [formData.totalQuantity, formData.pricePerUnit]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature && hasSufficientFunds && escrowProps.termsAgreed;
    return (
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <PartiesSection crop={crop} buyer={buyer} />
            <section>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormField label={`Total Quantity (${crop?.unit || 'units'})`} name="totalQuantity" value={formData.totalQuantity} onChange={handleInputChange} type="number" />
                    <FormField label="Total Qty in Tons" name="totalQuantityInTons" value={formData.totalQuantityInTons} onChange={handleInputChange} type="number" placeholder="e.g., 50" />
                    <FormField label={`Price per ${crop?.unit || 'unit'} (₹)`} name="pricePerUnit" value={formData.pricePerUnit} onChange={handleInputChange} type="number" />
                    <FormField label="No. of Deliveries" name="deliveries" value={formData.deliveries} onChange={handleInputChange} type="number" min="1" />
                </div>
            </section>
            <DynamicMilestoneSection formData={formData} setFormData={setParentFormData} isEditable={false} />
            <SignatureEditSection onSave={handleSignatureSave} />
            <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
            <FormActions onPreview={() => setMode('preview')} isDisabled={!isValid} />
        </form>
    );
};
const CustomProjectForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSignatureSave = (file) => setFormData(prev => ({ ...prev, signature: file }));
    const totalValue = useMemo(() => parseFloat(formData.totalValue) || 0, [formData.totalValue]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature && hasSufficientFunds && escrowProps.termsAgreed;
    return ( 
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <PartiesSection crop={crop} buyer={buyer} />
        <section>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Project Details</h3>
          <FormField label="Total Contract Value (₹)" name="totalValue" value={formData.totalValue} onChange={handleInputChange} type="number" />
          <div className="mt-6"><FormField as="textarea" rows="3" label="Project Description" name="projectDescription" value={formData.projectDescription} onChange={handleInputChange} /></div>
        </section>
        <DynamicMilestoneSection formData={formData} setFormData={setFormData} isEditable={true} />
        <SignatureEditSection onSave={handleSignatureSave} />
        <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
        <FormActions onPreview={() => setMode('preview')} isDisabled={!isValid} />
      </form> 
    );
};
const SecuredSpotBuyPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => (parseFloat(data.quantity) || 0) * (parseFloat(data.price) || 0), [data.quantity, data.price]);
    return (<A4PreviewWrapper signatureFile={data.signature} title="Secured Crop Supply Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}><p>This Agreement is between <strong>{crop.farmer}</strong> ("Farmer") and <strong>{buyer.name}</strong> ("Buyer").</p><h3 className="font-bold mt-6 mb-2 text-base">Article 1: Core Terms</h3><ul className="list-disc list-inside space-y-1"><li><strong>Produce:</strong> {crop.name}</li><li><strong>Quantity:</strong> {data.quantity} {crop.unit} {data.quantityInTons && `(~${data.quantityInTons} Tons)`}</li><li><strong>Price:</strong> ₹{parseFloat(data.price).toLocaleString('en-IN')} per {crop.unit}</li><li><strong>Quality:</strong> {data.qualitySpecs}</li><li><strong>Total Contract Value:</strong> ₹{totalValue.toLocaleString('en-IN')}</li></ul><GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} /></A4PreviewWrapper>);
};
const ForwardAgreementPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => (parseFloat(data.farmingArea) || 0) * (parseFloat(data.estimatedYield) || 0) * (parseFloat(data.fixedPrice) || 0), [data]);
    return (<A4PreviewWrapper signatureFile={data.signature} title="Forward Price Assurance Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}><p>This Agreement is between <strong>{crop.farmer}</strong> ("Farmer") and <strong>{buyer.name}</strong> ("Buyer").</p><h3 className="font-bold mt-6 mb-2 text-base">Article 1: Core Terms</h3><ul className="list-disc list-inside space-y-1"><li><strong>Produce:</strong> {crop.name}</li><li><strong>Farming Area:</strong> {data.farmingArea} Acres</li><li><strong>Fixed Price:</strong> ₹{parseFloat(data.fixedPrice).toLocaleString('en-IN')} per {crop.unit}.</li><li><strong>Estimated Total Value:</strong> ₹{totalValue.toLocaleString('en-IN')}</li></ul><GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} /></A4PreviewWrapper>);
};
const InputFinancingPreview = ({ data, crop, buyer, ...props }) => {
    const buybackPercent = (data.milestones || []).find(m => m.desc.includes('Buyback'))?.val || 60;
    const totalValue = (parseFloat(data.inputsValue) || 0) / (1 - (buybackPercent/100));
    return (<A4PreviewWrapper signatureFile={data.signature} title="Input Financing & Buyback Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}><p>This Agreement is between <strong>{crop.farmer}</strong> ("Farmer") and <strong>{buyer.name}</strong> ("Buyer").</p><h3 className="font-bold mt-6 mb-2 text-base">Article 1: Core Terms</h3><ul className="list-disc list-inside space-y-1"><li><strong>Inputs Provided:</strong> {data.inputsProvided} (Value: ₹{parseFloat(data.inputsValue).toLocaleString('en-IN')})</li><li><strong>Buyback Price:</strong> ₹{parseFloat(data.buybackPrice).toLocaleString('en-IN')} per {crop.unit}</li><li><strong>Quality Standards:</strong> {data.qualityStandards}</li><li><strong>Estimated Total Contract Value:</strong> ₹{totalValue.toLocaleString('en-IN')}</li></ul><GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} /></A4PreviewWrapper>);
};
const QualityTieredPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => (parseFloat(data.estimatedQuantity) || 0) * (parseFloat(data.basePrice) || 0), [data]);
    return (<A4PreviewWrapper signatureFile={data.signature} title="Quality-Tiered Pricing Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}><p>This Agreement is between <strong>{crop.farmer}</strong> ("Farmer") and <strong>{buyer.name}</strong> ("Buyer").</p><h3 className="font-bold mt-6 mb-2 text-base">Article 1: Core Terms</h3><ul className="list-disc list-inside space-y-1"><li><strong>Produce:</strong> {crop.name}</li><li><strong>Estimated Quantity:</strong> {data.estimatedQuantity} {crop.unit} {data.estimatedQuantityInTons && `(~${data.estimatedQuantityInTons} Tons)`}</li><li><strong>Base Price:</strong> ₹{parseFloat(data.basePrice).toLocaleString('en-IN')} per {crop.unit}</li><li><strong>Estimated Total Value:</strong> ₹{totalValue.toLocaleString('en-IN')}</li></ul><h3 className="font-bold mt-6 mb-2 text-base">Article 2: Quality Tiers</h3><table className="w-full text-left border-collapse my-2 text-xs sm:text-sm"><thead className="bg-gray-100"><tr><th className="p-2 border">Grade Name</th><th className="p-2 border">Price Adjustment</th></tr></thead><tbody>{(data.tiers || []).map((t, i) => (<tr key={i}><td className="p-2 border">{t.grade}</td><td className="p-2 border">{t.adjustment}%</td></tr>))}</tbody></table><GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} /></A4PreviewWrapper>);
};
const StaggeredDeliveryPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => (parseFloat(data.totalQuantity) || 0) * (parseFloat(data.pricePerUnit) || 0), [data]);
    return (<A4PreviewWrapper signatureFile={data.signature} title="Staggered Delivery Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}><p>This Agreement is between <strong>{crop.farmer}</strong> ("Farmer") and <strong>{buyer.name}</strong> ("Buyer").</p><h3 className="font-bold mt-6 mb-2 text-base">Article 1: Core Terms</h3><ul className="list-disc list-inside space-y-1"><li><strong>Produce:</strong> {crop.name}</li><li><strong>Total Quantity:</strong> {data.totalQuantity} {crop.unit} {data.totalQuantityInTons && `(~${data.totalQuantityInTons} Tons)`}</li><li><strong>Price:</strong> ₹{parseFloat(data.pricePerUnit).toLocaleString('en-IN')} per {crop.unit}</li><li><strong>Number of Deliveries:</strong> {data.deliveries}</li><li><strong>Total Contract Value:</strong> ₹{totalValue.toLocaleString('en-IN')}</li></ul><GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} /></A4PreviewWrapper>);
};
const CustomProjectPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => parseFloat(data.totalValue) || 0, [data.totalValue]);
    return (<A4PreviewWrapper signatureFile={data.signature} title="Custom Project Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}><p>This Agreement is between <strong>{crop.farmer}</strong> ("Farmer") and <strong>{buyer.name}</strong> ("Buyer").</p><h3 className="font-bold mt-6 mb-2 text-base">Article 1: Core Terms</h3><ul className="list-disc list-inside space-y-1"><li><strong>Project Description:</strong> {data.projectDescription}</li><li><strong>Total Contract Value:</strong> ₹{totalValue.toLocaleString('en-IN')}</li></ul><GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} /></A4PreviewWrapper>);
};

export default ContractTemplatesPage;