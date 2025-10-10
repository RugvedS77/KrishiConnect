// import React, { useState, useEffect, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useAuthStore } from "../authStore";
// import { ArrowLeft, Edit, Loader2, AlertCircle } from "lucide-react";

// // Data and Components
// import { templates } from "../data/contractTemplates";
// import TemplateSelection from "../buyer_components/Contract/TemplateSelection";
// import TemplateForm from "../buyer_components/Contract/TemplateForm";
// import ContractPreview from "../buyer_components/Contract/ContractPreview";
// import { AddFundsModal, TemplateViewerModal } from "../buyer_components/Contract/Modals";
// import { API_BASE_URL } from "../api/apiConfig";

// // Helpers & API
// const postMilestone = async (contractId, milestoneData, token) => {
//   const response = await fetch(
//     `${API_BASE_URL}/api/milestones/contract/${contractId}`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(milestoneData),
//     }
//   );
//   if (!response.ok) {
//     const err = await response.json();
//     throw new Error(`Failed to create milestone: ${err.detail}`);
//   }
//   return response.json();
// };

// const convertToTons = (quantity, unit) => {
//   if (!quantity || !unit) return 0;
//   const qty = parseFloat(quantity);
//   if (isNaN(qty)) return 0;
//   switch (unit.toLowerCase()) {
//     case "kg":
//     case "kgs":
//       return (qty / 1000).toFixed(2);
//     case "quintal":
//     case "quintals":
//       return (qty / 10).toFixed(2);
//     case "ton":
//     case "tons":
//     case "tonne":
//     case "tonnes":
//       return qty.toFixed(2);
//     default:
//       return 0;
//   }
// };


// const ContractTemplatePage = () => {
//     const [crop, setCrop] = useState(null);
//     const [pageLoading, setPageLoading] = useState(true);
//     const [pageError, setPageError] = useState(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [submitError, setSubmitError] = useState(null);
//     const [submitSuccess, setSubmitSuccess] = useState(false);
//     const { cropId } = useParams();
//     const token = useAuthStore((state) => state.token);
//     const authUser = useAuthStore((state) => state.user);
//     const navigate = useNavigate();

//     const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
//     const [walletBalance, setWalletBalance] = useState(0);
//     const [requiredEscrow, setRequiredEscrow] = useState(0);
//     const [termsAgreed, setTermsAgreed] = useState(false);

//     const [selectedTemplate, setSelectedTemplate] = useState(null);
//     const [mode, setMode] = useState("info"); // 'info', 'edit', 'preview'
//     const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//     const [viewedTemplateId, setViewedTemplateId] = useState(null);

//     const buyerDetails = {
//         name: authUser?.full_name || "Buyer",
//         address: "Pune, Maharashtra",
//     };

//     const [formData, setFormData] = useState({
//         "spot-buy": {
//             quantity: "", price: "", qualitySpecs: "Standard Grade", quantityInTons: "", milestones: [], signature: null,
//         },
//         "forward-agreement": {
//             farmingArea: "5", fixedPrice: "", estimatedYield: "10", milestones: [], signature: null,
//         },
//         "input-financing": {
//             inputsValue: "50000", buybackPrice: "", qualityStandards: "Grade A", inputsProvided: "Seeds, Fertilizer", milestones: [], signature: null,
//         },
//         "quality-tiered": {
//             basePrice: "", estimatedQuantity: "", estimatedQuantityInTons: "",
//             tiers: [
//                 { grade: "Grade A", adjustment: "10" }, { grade: "Grade B (Base)", adjustment: "0" }, { grade: "Grade C", adjustment: "-10" },
//             ],
//             milestones: [], signature: null,
//         },
//         "staggered-delivery": {
//             totalQuantity: "", pricePerUnit: "", totalQuantityInTons: "", deliveries: "4", milestones: [], signature: null,
//         },
//         "custom-project": {
//             totalValue: "500000", projectDescription: "Specialty organic crop cultivation",
//             milestones: [
//                 { desc: "Initial Setup", val: "20", type: "progress" }, { desc: "Final Product Delivery", val: "80", type: "deliverable" },
//             ],
//             signature: null,
//         },
//     });

//     const fetchWalletBalance = useCallback(async () => {
//         if (!token) return;
//         try {
//             const response = await fetch(`${API_BASE_URL}/api/wallet/me`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             if (!response.ok) throw new Error("Could not fetch wallet balance.");
//             const data = await response.json();
//             setWalletBalance(parseFloat(data.balance));
//         } catch (err) {
//             console.error("Wallet Fetch Error:", err);
//         }
//     }, [token]);

//     const handleAddFunds = async (amount) => {
//         if (!token) throw new Error("Authentication expired.");
//         const response = await fetch(
//             `${API_BASE_URL}/api/wallet/me/add-funds`,
//             {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//                 body: JSON.stringify({ amount: amount }),
//             }
//         );
//         if (!response.ok) {
//             const errData = await response.json();
//             throw new Error(errData.detail || "Failed to add funds.");
//         }
//         await fetchWalletBalance();
//     };

//     useEffect(() => {
//         const fetchInitialData = async () => {
//             if (!token) {
//                 setPageError("You must be logged in.");
//                 setPageLoading(false);
//                 return;
//             }
//             setPageLoading(true);
//             try {
//                 const response = await fetch(`${API_BASE_URL}/api/croplists/${cropId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 if (!response.ok) throw new Error("Crop listing not found.");
//                 const data = await response.json();
//                 setCrop({
//                     id: data.id,
//                     name: data.crop_type,
//                     farmer: data.farmer.full_name,
//                     farmer_id: data.farmer_id,
//                     location: data.location,
//                     price: parseFloat(data.expected_price_per_unit),
//                     unit: data.unit,
//                     quantity: data.quantity,
//                 });
//                 await fetchWalletBalance();
//             } catch (err) {
//                 setPageError(err.message);
//             } finally {
//                 setPageLoading(false);
//             }
//         };
//         fetchInitialData();
//     }, [cropId, token, fetchWalletBalance]);

//     useEffect(() => {
//         if (crop) {
//             const priceStr = crop.price.toString();
//             const quantityStr = crop.quantity.toString();
//             const tonsStr = convertToTons(crop.quantity, crop.unit) || "";
//             setFormData((prev) => ({
//                 "spot-buy": { ...prev["spot-buy"], quantity: quantityStr, price: priceStr, quantityInTons: tonsStr, milestones: [ { desc: "Pre-delivery Inspection Photos", val: "10", type: "progress", }, { desc: "Final Delivery & Acceptance", val: "90", type: "deliverable", }, ], },
//                 "forward-agreement": { ...prev["forward-agreement"], fixedPrice: priceStr, milestones: [ { desc: "Proof of Sowing Completion", val: "20", type: "progress" }, { desc: "Mid-Growth Progress Report", val: "30", type: "progress" }, { desc: "Final Harvest Delivery", val: "50", type: "deliverable" }, ], },
//                 "input-financing": { ...prev["input-financing"], buybackPrice: (crop.price * 0.9).toFixed(2), milestones: [ { desc: "Farmer Acknowledges Receipt of Inputs", val: "0", type: "progress", }, { desc: "Mid-Growth Inspection Passed", val: "40", type: "progress", }, { desc: "Final Produce Buyback & Delivery", val: "60", type: "deliverable", }, ], },
//                 "quality-tiered": { ...prev["quality-tiered"], basePrice: priceStr, estimatedQuantity: quantityStr, estimatedQuantityInTons: tonsStr, milestones: [ { desc: "Pre-Harvest Sample Approved", val: "20", type: "progress", }, { desc: "Final Delivery & Quality Assessment", val: "80", type: "deliverable", }, ], },
//                 "staggered-delivery": { ...prev["staggered-delivery"], totalQuantity: quantityStr, pricePerUnit: priceStr, totalQuantityInTons: tonsStr, deliveries: "4", milestones: [ { desc: "Delivery 1 of 4", val: "25.00", type: "deliverable" }, { desc: "Delivery 2 of 4", val: "25.00", type: "deliverable" }, { desc: "Delivery 3 of 4", val: "25.00", type: "deliverable" }, { desc: "Delivery 4 of 4", val: "25.00", type: "deliverable" }, ], },
//                 "custom-project": { ...prev["custom-project"] },
//             }));
//         }
//     }, [crop]);
    
//     const handleSendProposal = async () => {
//         setIsSubmitting(true);
//         setSubmitError(null);
//         setSubmitSuccess(false);
//         const currentData = formData[selectedTemplate];
//         let contractPayload = {};
//         let totalValue = 0;
//         try {
//             if (selectedTemplate === "spot-buy") {
//                 totalValue = parseFloat(currentData.quantity) * parseFloat(currentData.price);
//                 contractPayload = { listing_id: crop.id, quantity_proposed: parseFloat(currentData.quantity), price_per_unit_agreed: parseFloat(currentData.price), payment_terms: `Secured Spot Buy: ${currentData.qualitySpecs}`, };
//             } else if (selectedTemplate === "forward-agreement") {
//                 const qty = parseFloat(currentData.farmingArea) * parseFloat(currentData.estimatedYield);
//                 totalValue = qty * parseFloat(currentData.fixedPrice);
//                 contractPayload = { listing_id: crop.id, quantity_proposed: qty, price_per_unit_agreed: parseFloat(currentData.fixedPrice), payment_terms: "Forward Agreement (Fixed Price)", };
//             } else if (selectedTemplate === "input-financing") {
//                 const buybackPercent = (currentData.milestones || []).find((m) => m.desc.includes("Buyback")) ?.val || 60;
//                 totalValue = parseFloat(currentData.inputsValue) / (1 - buybackPercent / 100);
//                 const qty = totalValue / parseFloat(currentData.buybackPrice);
//                 contractPayload = { listing_id: crop.id, quantity_proposed: isNaN(qty) ? 0 : qty, price_per_unit_agreed: parseFloat(currentData.buybackPrice), payment_terms: `Input Financing: ${currentData.inputsProvided}`, };
//             } else if (selectedTemplate === "quality-tiered") {
//                 totalValue = parseFloat(currentData.estimatedQuantity) * parseFloat(currentData.basePrice);
//                 contractPayload = { listing_id: crop.id, quantity_proposed: parseFloat(currentData.estimatedQuantity), price_per_unit_agreed: parseFloat(currentData.basePrice), payment_terms: "Quality-Tiered Pricing Contract", };
//             } else if (selectedTemplate === "staggered-delivery") {
//                 totalValue = parseFloat(currentData.totalQuantity) * parseFloat(currentData.pricePerUnit);
//                 contractPayload = { listing_id: crop.id, quantity_proposed: parseFloat(currentData.totalQuantity), price_per_unit_agreed: parseFloat(currentData.pricePerUnit), payment_terms: `Staggered Delivery (${currentData.deliveries} parts)`, };
//             } else if (selectedTemplate === "custom-project") {
//                 totalValue = parseFloat(currentData.totalValue);
//                 contractPayload = { listing_id: crop.id, quantity_proposed: 1, price_per_unit_agreed: totalValue, payment_terms: `Custom Project: ${currentData.projectDescription}`, };
//             }
//             const contractResponse = await fetch(`${API_BASE_URL}/api/contracts/`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//                 body: JSON.stringify(contractPayload),
//             });
//             if (!contractResponse.ok) {
//                 const err = await contractResponse.json();
//                 throw new Error(`Contract Error: ${err.detail}`);
//             }
//             const newContract = await contractResponse.json();
//             for (const milestone of currentData.milestones || []) {
//                 const milestonePayload = {
//                     name: milestone.desc,
//                     amount: totalValue * (parseFloat(milestone.val) / 100),
//                     milestone_type: milestone.type === "deliverable" ? "deliverable" : "progress",
//                 };
//                 await postMilestone(newContract.id, milestonePayload, token);
//             }
//             setSubmitSuccess(true);
//             setTimeout(() => navigate("/buyer/contracts"), 2000);
//         } catch (err) {
//             setSubmitError(err.message);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const handleBackClick = () => {
//         if (mode === "edit") {
//             setMode("info");
//             setSelectedTemplate(null);
//         }
//         else if (mode === "preview") setMode("edit");
//         else navigate("/buyer/browse");
//     };

//     const handleSelectTemplate = (id) => {
//         setSelectedTemplate(id);
//         setMode("edit");
//     };

//     const handleViewTemplate = (id) => {
//         setViewedTemplateId(id);
//         setIsViewModalOpen(true);
//     };

//     if (pageLoading) return <div className="p-8 flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-green-600" /></div>;
//     if (pageError) return <div className="p-8 flex justify-center items-center h-screen bg-red-50 text-red-700"><AlertCircle size={24} className="mr-2" /> {pageError}</div>;

//     const renderContent = () => {
//         switch (mode) {
//             case "info":
//                 return <TemplateSelection templates={templates} onSelect={handleSelectTemplate} onView={handleViewTemplate} />;
//             case "edit":
//                 return (
//                     <TemplateForm
//                         selectedTemplate={selectedTemplate}
//                         crop={crop}
//                         buyer={buyerDetails}
//                         formData={formData[selectedTemplate]}
//                         setFormData={(updatedData) =>
//                             setFormData(prev => ({ ...prev, [selectedTemplate]: { ...prev[selectedTemplate], ...updatedData } }))
//                         }
//                         setMode={setMode}
//                         onEscrowChange={setRequiredEscrow}
//                         escrowProps={{
//                             requiredEscrow,
//                             walletBalance,
//                             termsAgreed,
//                             onTermsChange: (e) => setTermsAgreed(e.target.checked),
//                             onAddFundsClick: () => setIsFundsModalOpen(true),
//                         }}
//                     />
//                 );
//             case "preview":
//                 return (
//                     <ContractPreview
//                         selectedTemplate={selectedTemplate}
//                         data={formData[selectedTemplate]}
//                         crop={crop}
//                         buyer={buyerDetails}
//                         isSubmitting={isSubmitting}
//                         submitError={submitError}
//                         submitSuccess={submitSuccess}
//                         onSendProposal={handleSendProposal}
//                     />
//                 );
//             default: return null;
//         }
//     };

//     return (
//         <>
//             {isFundsModalOpen && <AddFundsModal onClose={() => setIsFundsModalOpen(false)} onAddFunds={handleAddFunds} requiredAmount={ requiredEscrow - walletBalance > 0 ? (requiredEscrow - walletBalance).toFixed(2) : 0 } />}
//             {isViewModalOpen && <TemplateViewerModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} templateId={viewedTemplateId} templates={templates} />}
//             <div className="bg-gray-50 p-4 md:p-8 min-h-screen">
//                 <header className="flex items-center space-x-4 mb-8">
//                     <button onClick={handleBackClick} className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={24} /></button>
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-800">Create a New Contract</h1>
//                         <p className="text-gray-600 mt-1">Proposing a contract for <strong>{crop?.name || "..."}</strong> with farmer <strong>{crop?.farmer || "..."}</strong>.</p>
//                     </div>
//                 </header>
//                 {mode !== "info" ? (
//                     <div className="max-w-5xl mx-auto">
//                         <div className="bg-white rounded-lg shadow-sm">
//                             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70 rounded-t-lg">
//                                 <div>
//                                     <h2 className="font-semibold text-lg text-gray-800">{templates.find((t) => t.id === selectedTemplate)?.title}</h2>
//                                     <p className="text-sm text-gray-500">{templates.find((t) => t.id === selectedTemplate)?.description}</p>
//                                 </div>
//                                 {mode === "edit" && <button onClick={() => setMode("info")} className="px-3 py-1.5 text-sm font-semibold rounded-md flex items-center space-x-2 bg-gray-200 text-gray-700 hover:bg-gray-300"><ArrowLeft size={16} /><span>Change Template</span></button>}
//                                 {mode === "preview" && <button onClick={() => setMode("edit")} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center space-x-2 bg-gray-600 text-white hover:bg-gray-700"><Edit size={16} /><span>Back to Edit</span></button>}
//                             </div>
//                             <div className="p-6 md:p-8">{renderContent()}</div>
//                         </div>
//                     </div>
//                 ) : ( renderContent() )}
//             </div>
//         </>
//     );
// };

// export default ContractTemplatePage;

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../authStore";
import { ArrowLeft, Edit, Loader2, AlertCircle } from "lucide-react";

// Data and Components
import { templates } from "../data/contractTemplates";
import TemplateSelection from "../buyer_components/Contract/TemplateSelection";
import TemplateForm from "../buyer_components/Contract/TemplateForm";
import ContractPreview from "../buyer_components/Contract/ContractPreview";
import { AddFundsModal, TemplateViewerModal } from "../buyer_components/Contract/Modals";
import { API_BASE_URL } from "../api/apiConfig";

// Helpers & API
const postMilestone = async (contractId, milestoneData, token) => {
  const response = await fetch(
    `${API_BASE_URL}/api/milestones/contract/${contractId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(milestoneData),
    }
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Failed to create milestone: ${err.detail}`);
  }
  return response.json();
};

const convertToTons = (quantity, unit) => {
  if (!quantity || !unit) return 0;
  const qty = parseFloat(quantity);
  if (isNaN(qty)) return 0;
  switch (unit.toLowerCase()) {
    case "kg":
    case "kgs":
      return (qty / 1000).toFixed(2);
    case "quintal":
    case "quintals":
      return (qty / 10).toFixed(2);
    case "ton":
    case "tons":
    case "tonne":
    case "tonnes":
      return qty.toFixed(2);
    default:
      return 0;
  }
};


const ContractTemplatePage = () => {
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

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [mode, setMode] = useState("info"); // 'info', 'edit', 'preview'
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewedTemplateId, setViewedTemplateId] = useState(null);

    const buyerDetails = {
        name: authUser?.full_name || "Buyer",
        address: "Pune, Maharashtra",
    };

    // --- CHANGED HERE: `signature` is now `signature_url` ---
    const [formData, setFormData] = useState({
        "spot-buy": {
            quantity: "", price: "", qualitySpecs: "Standard Grade", quantityInTons: "", milestones: [], signature_url: null,
        },
        "forward-agreement": {
            farmingArea: "5", fixedPrice: "", estimatedYield: "10", milestones: [], signature_url: null,
        },
        "input-financing": {
            inputsValue: "50000", buybackPrice: "", qualityStandards: "Grade A", inputsProvided: "Seeds, Fertilizer", milestones: [], signature_url: null,
        },
        "quality-tiered": {
            basePrice: "", estimatedQuantity: "", estimatedQuantityInTons: "",
            tiers: [
                { grade: "Grade A", adjustment: "10" }, { grade: "Grade B (Base)", adjustment: "0" }, { grade: "Grade C", adjustment: "-10" },
            ],
            milestones: [], signature_url: null,
        },
        "staggered-delivery": {
            totalQuantity: "", pricePerUnit: "", totalQuantityInTons: "", deliveries: "4", milestones: [], signature_url: null,
        },
        "custom-project": {
            totalValue: "500000", projectDescription: "Specialty organic crop cultivation",
            milestones: [
                { desc: "Initial Setup", val: "20", type: "progress" }, { desc: "Final Product Delivery", val: "80", type: "deliverable" },
            ],
            signature_url: null,
        },
    });

    const fetchWalletBalance = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/wallet/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Could not fetch wallet balance.");
            const data = await response.json();
            setWalletBalance(parseFloat(data.balance));
        } catch (err) {
            console.error("Wallet Fetch Error:", err);
        }
    }, [token]);

    const handleAddFunds = async (amount) => {
        if (!token) throw new Error("Authentication expired.");
        const response = await fetch(
            `${API_BASE_URL}/api/wallet/me/add-funds`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount: amount }),
            }
        );
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Failed to add funds.");
        }
        await fetchWalletBalance();
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!token) {
                setPageError("You must be logged in.");
                setPageLoading(false);
                return;
            }
            setPageLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/croplists/${cropId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Crop listing not found.");
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
                await fetchWalletBalance();
            } catch (err) {
                setPageError(err.message);
            } finally {
                setPageLoading(false);
            }
        };
        fetchInitialData();
    }, [cropId, token, fetchWalletBalance]);

    useEffect(() => {
        if (crop) {
            const priceStr = crop.price.toString();
            const quantityStr = crop.quantity.toString();
            const tonsStr = convertToTons(crop.quantity, crop.unit) || "";
            setFormData((prev) => ({
                "spot-buy": { ...prev["spot-buy"], quantity: quantityStr, price: priceStr, quantityInTons: tonsStr, milestones: [ { desc: "Pre-delivery Inspection Photos", val: "10", type: "progress", }, { desc: "Final Delivery & Acceptance", val: "90", type: "deliverable", }, ], },
                "forward-agreement": { ...prev["forward-agreement"], fixedPrice: priceStr, milestones: [ { desc: "Proof of Sowing Completion", val: "20", type: "progress" }, { desc: "Mid-Growth Progress Report", val: "30", type: "progress" }, { desc: "Final Harvest Delivery", val: "50", type: "deliverable" }, ], },
                "input-financing": { ...prev["input-financing"], buybackPrice: (crop.price * 0.9).toFixed(2), milestones: [ { desc: "Farmer Acknowledges Receipt of Inputs", val: "0", type: "progress", }, { desc: "Mid-Growth Inspection Passed", val: "40", type: "progress", }, { desc: "Final Produce Buyback & Delivery", val: "60", type: "deliverable", }, ], },
                "quality-tiered": { ...prev["quality-tiered"], basePrice: priceStr, estimatedQuantity: quantityStr, estimatedQuantityInTons: tonsStr, milestones: [ { desc: "Pre-Harvest Sample Approved", val: "20", type: "progress", }, { desc: "Final Delivery & Quality Assessment", val: "80", type: "deliverable", }, ], },
                "staggered-delivery": { ...prev["staggered-delivery"], totalQuantity: quantityStr, pricePerUnit: priceStr, totalQuantityInTons: tonsStr, deliveries: "4", milestones: [ { desc: "Delivery 1 of 4", val: "25.00", type: "deliverable" }, { desc: "Delivery 2 of 4", val: "25.00", type: "deliverable" }, { desc: "Delivery 3 of 4", val: "25.00", type: "deliverable" }, { desc: "Delivery 4 of 4", val: "25.00", type: "deliverable" }, ], },
                "custom-project": { ...prev["custom-project"] },
            }));
        }
    }, [crop]);
    
    // --- CHANGED HERE: Added `buyer_signature_url` to all payloads ---
    const handleSendProposal = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);
        const currentData = formData[selectedTemplate];
        let contractPayload = {};
        let totalValue = 0;
        try {
            if (selectedTemplate === "spot-buy") {
                totalValue = parseFloat(currentData.quantity) * parseFloat(currentData.price);
                contractPayload = { listing_id: crop.id, quantity_proposed: parseFloat(currentData.quantity), price_per_unit_agreed: parseFloat(currentData.price), payment_terms: `Secured Spot Buy: ${currentData.qualitySpecs}`, buyer_signature_url: currentData.signature_url };
            } else if (selectedTemplate === "forward-agreement") {
                const qty = parseFloat(currentData.farmingArea) * parseFloat(currentData.estimatedYield);
                totalValue = qty * parseFloat(currentData.fixedPrice);
                contractPayload = { listing_id: crop.id, quantity_proposed: qty, price_per_unit_agreed: parseFloat(currentData.fixedPrice), payment_terms: "Forward Agreement (Fixed Price)", buyer_signature_url: currentData.signature_url };
            } else if (selectedTemplate === "input-financing") {
                const buybackPercent = (currentData.milestones || []).find((m) => m.desc.includes("Buyback")) ?.val || 60;
                totalValue = parseFloat(currentData.inputsValue) / (1 - buybackPercent / 100);
                const qty = totalValue / parseFloat(currentData.buybackPrice);
                contractPayload = { listing_id: crop.id, quantity_proposed: isNaN(qty) ? 0 : qty, price_per_unit_agreed: parseFloat(currentData.buybackPrice), payment_terms: `Input Financing: ${currentData.inputsProvided}`, buyer_signature_url: currentData.signature_url };
            } else if (selectedTemplate === "quality-tiered") {
                totalValue = parseFloat(currentData.estimatedQuantity) * parseFloat(currentData.basePrice);
                contractPayload = { listing_id: crop.id, quantity_proposed: parseFloat(currentData.estimatedQuantity), price_per_unit_agreed: parseFloat(currentData.basePrice), payment_terms: "Quality-Tiered Pricing Contract", buyer_signature_url: currentData.signature_url };
            } else if (selectedTemplate === "staggered-delivery") {
                totalValue = parseFloat(currentData.totalQuantity) * parseFloat(currentData.pricePerUnit);
                contractPayload = { listing_id: crop.id, quantity_proposed: parseFloat(currentData.totalQuantity), price_per_unit_agreed: parseFloat(currentData.pricePerUnit), payment_terms: `Staggered Delivery (${currentData.deliveries} parts)`, buyer_signature_url: currentData.signature_url };
            } else if (selectedTemplate === "custom-project") {
                totalValue = parseFloat(currentData.totalValue);
                contractPayload = { listing_id: crop.id, quantity_proposed: 1, price_per_unit_agreed: totalValue, payment_terms: `Custom Project: ${currentData.projectDescription}`, buyer_signature_url: currentData.signature_url };
            }
            const contractResponse = await fetch(`${API_BASE_URL}/api/contracts/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(contractPayload),
            });
            if (!contractResponse.ok) {
                const err = await contractResponse.json();
                throw new Error(`Contract Error: ${err.detail}`);
            }
            const newContract = await contractResponse.json();
            for (const milestone of currentData.milestones || []) {
                const milestonePayload = {
                    name: milestone.desc,
                    amount: totalValue * (parseFloat(milestone.val) / 100),
                    milestone_type: milestone.type === "deliverable" ? "deliverable" : "progress",
                };
                await postMilestone(newContract.id, milestonePayload, token);
            }
            setSubmitSuccess(true);
            setTimeout(() => navigate("/buyer/contracts"), 2000);
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackClick = () => {
        if (mode === "edit") {
            setMode("info");
            setSelectedTemplate(null);
        }
        else if (mode === "preview") setMode("edit");
        else navigate("/buyer/browse");
    };

    const handleSelectTemplate = (id) => {
        setSelectedTemplate(id);
        setMode("edit");
    };

    const handleViewTemplate = (id) => {
        setViewedTemplateId(id);
        setIsViewModalOpen(true);
    };

    if (pageLoading) return <div className="p-8 flex justify-center items-center h-screen"><Loader2 size={48} className="animate-spin text-green-600" /></div>;
    if (pageError) return <div className="p-8 flex justify-center items-center h-screen bg-red-50 text-red-700"><AlertCircle size={24} className="mr-2" /> {pageError}</div>;

    const renderContent = () => {
        switch (mode) {
            case "info":
                return <TemplateSelection templates={templates} onSelect={handleSelectTemplate} onView={handleViewTemplate} />;
            case "edit":
                return (
                    <TemplateForm
                        selectedTemplate={selectedTemplate}
                        crop={crop}
                        buyer={buyerDetails}
                        formData={formData[selectedTemplate]}
                        setFormData={(updatedData) =>
                            setFormData(prev => ({ ...prev, [selectedTemplate]: { ...prev[selectedTemplate], ...updatedData } }))
                        }
                        setMode={setMode}
                        onEscrowChange={setRequiredEscrow}
                        escrowProps={{
                            requiredEscrow,
                            walletBalance,
                            termsAgreed,
                            onTermsChange: (e) => setTermsAgreed(e.target.checked),
                            onAddFundsClick: () => setIsFundsModalOpen(true),
                        }}
                    />
                );
            case "preview":
                return (
                    <ContractPreview
                        selectedTemplate={selectedTemplate}
                        data={formData[selectedTemplate]}
                        crop={crop}
                        buyer={buyerDetails}
                        isSubmitting={isSubmitting}
                        submitError={submitError}
                        submitSuccess={submitSuccess}
                        onSendProposal={handleSendProposal}
                    />
                );
            default: return null;
        }
    };

    return (
        <>
            {isFundsModalOpen && <AddFundsModal onClose={() => setIsFundsModalOpen(false)} onAddFunds={handleAddFunds} requiredAmount={ requiredEscrow - walletBalance > 0 ? (requiredEscrow - walletBalance).toFixed(2) : 0 } />}
            {isViewModalOpen && <TemplateViewerModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} templateId={viewedTemplateId} templates={templates} />}
            <div className="bg-gray-50 p-4 md:p-8 min-h-screen">
                <header className="flex items-center space-x-4 mb-8">
                    <button onClick={handleBackClick} className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft size={24} /></button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Create a New Contract</h1>
                        <p className="text-gray-600 mt-1">Proposing a contract for <strong>{crop?.name || "..."}</strong> with farmer <strong>{crop?.farmer || "..."}</strong>.</p>
                    </div>
                </header>
                {mode !== "info" ? (
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70 rounded-t-lg">
                                <div>
                                    <h2 className="font-semibold text-lg text-gray-800">{templates.find((t) => t.id === selectedTemplate)?.title}</h2>
                                    <p className="text-sm text-gray-500">{templates.find((t) => t.id === selectedTemplate)?.description}</p>
                                </div>
                                {mode === "edit" && <button onClick={() => setMode("info")} className="px-3 py-1.5 text-sm font-semibold rounded-md flex items-center space-x-2 bg-gray-200 text-gray-700 hover:bg-gray-300"><ArrowLeft size={16} /><span>Change Template</span></button>}
                                {mode === "preview" && <button onClick={() => setMode("edit")} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center space-x-2 bg-gray-600 text-white hover:bg-gray-700"><Edit size={16} /><span>Back to Edit</span></button>}
                            </div>
                            <div className="p-6 md:p-8">{renderContent()}</div>
                        </div>
                    </div>
                ) : ( renderContent() )}
            </div>
        </>
    );
};

export default ContractTemplatePage;