import React, { useMemo, useEffect, useState } from 'react';
import { Eye, PlusCircle, XCircle, Wallet, CheckSquare, Package, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import SignatureUploader from "../../buyer_components/SignatureUploader";

// --- ADDED IMPORTS ---
import { API_BASE_URL } from '../../api/apiConfig';
import { useAuthStore } from '../../authStore';

const convertToTons = (quantity, unit) => {
    if (!quantity || !unit) return 0;
    const qty = parseFloat(quantity);
    if (isNaN(qty)) return 0;
    switch (unit.toLowerCase()) {
        case "kg": case "kgs": return (qty / 1000).toFixed(2);
        case "quintal": case "quintals": return (qty / 10).toFixed(2);
        case "ton": case "tons": case "tonne": case "tonnes": return qty.toFixed(2);
        default: return 0;
    }
};

// --- SHARED FORM COMPONENTS ---

const FormField = ({ label, name, value, onChange, type = "text", as: Component = "input", ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <Component name={name} value={value} onChange={onChange} type={type} className="w-full p-2 border rounded-md bg-gray-50 focus:ring-green-500 focus:border-green-500" {...props} />
    </div>
);

const PartiesSection = ({ crop, buyer }) => (
    <section>
        <h3 className="text-xl font-semibold border-b pb-2 mb-4">Parties Involved</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><p className="font-medium text-gray-500">Farmer</p><p>{crop?.farmer || "..."}</p></div>
            <div><p className="font-medium text-gray-500">Buyer</p><p>{buyer?.name || "..."}</p></div>
        </div>
    </section>
);

// --- REPLACED SignatureEditSection to pass down more props ---
const SignatureEditSection = ({ onSave, signatureUrl, isUploading, uploadError }) => (
    <section>
        <h3 className="text-xl font-semibold border-b pb-2 mb-4">Your Digital Signature</h3>
        <p className="text-sm text-gray-600 mb-4">Upload an image of your signature. This will be considered a binding digital signature upon acceptance by the farmer.</p>
        <div onClick={(e) => e.stopPropagation()}>
            <SignatureUploader
                onSave={onSave}
                currentSignatureUrl={signatureUrl}
                isUploading={isUploading}
                uploadError={uploadError}
            />
            {isUploading && <div className="mt-2 flex items-center text-sm text-gray-600"><Loader2 className="animate-spin mr-2" size={16} /> Uploading...</div>}
            {uploadError && <div className="mt-2 flex items-center text-sm text-red-600"><AlertCircle className="mr-2" size={16} /> Error: {uploadError}</div>}
        </div>
    </section>
);


const FormActions = ({ onPreview, isDisabled }) => (
    <div className="mt-8 pt-6 border-t">
        <button type="button" onClick={onPreview} disabled={isDisabled} title={isDisabled ? "Complete all required fields and upload signature" : "Proceed to Preview"} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 text-base disabled:bg-gray-400 disabled:cursor-not-allowed">
            <Eye size={20} /><span>Preview Contract</span>
        </button>
    </div>
);

const MilestoneBadge = ({ type }) => {
    const isDeliverable = type === "deliverable";
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isDeliverable ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
            {isDeliverable ? <Package size={12} className="mr-1" /> : <ImageIcon size={12} className="mr-1" />}
            {isDeliverable ? "Deliverable" : "Progress"}
        </span>
    );
};

const DynamicMilestoneSection = ({ formData, setFormData, isEditable = true }) => {
    const { milestones } = formData;
    const handleMilestoneChange = (index, event) => {
        const { name, value } = event.target;
        const newMilestones = [...(milestones || [])];
        newMilestones[index] = { ...newMilestones[index], [name]: value };
        setFormData({ milestones: newMilestones });
    };
    const handleAddMilestone = () => setFormData({ milestones: [...(milestones || []), { desc: "", val: "0", type: "progress" }] });
    const handleRemoveMilestone = (index) => setFormData({ milestones: (milestones || []).filter((_, i) => i !== index) });
    const totalPercentage = useMemo(() => (milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [milestones]);
    
    return (
        <section>
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-xl font-semibold">Payment Milestones</h3>
                <div className={`text-sm font-bold ${Math.round(totalPercentage) === 100 ? "text-green-600" : "text-red-500"}`}>Total: {totalPercentage.toFixed(2)}% {Math.round(totalPercentage) !== 100 && "(Must be 100%)"}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md space-y-4">
                {(milestones || []).map((milestone, index) => (
                    <div key={index} className="flex items-start gap-x-3">
                        <div className="flex-grow grid grid-cols-12 gap-x-3 items-end">
                            <div className="col-span-12 md:col-span-7"><FormField as="textarea" rows="2" label={`Milestone ${index + 1}`} name="desc" value={milestone.desc} onChange={(e) => handleMilestoneChange(index, e)} disabled={!isEditable} /></div>
                            <div className="col-span-6 md:col-span-2"><FormField label="Payment %" name="val" value={milestone.val} onChange={(e) => handleMilestoneChange(index, e)} type="number" disabled={!isEditable} /></div>
                            <div className="col-span-6 md:col-span-3 self-center pt-5">
                                {isEditable ? (
                                    <select name="type" value={milestone.type} onChange={(e) => handleMilestoneChange(index, e)} className="w-full p-2 border rounded-md bg-white focus:ring-green-500 focus:border-green-500 text-sm">
                                        <option value="progress">Progress</option><option value="deliverable">Deliverable</option>
                                    </select>
                                ) : (<MilestoneBadge type={milestone.type} />)}
                            </div>
                        </div>
                        {isEditable && (milestones || []).length > 1 && (<button type="button" onClick={() => handleRemoveMilestone(index)} className="mt-7 p-2 text-red-500 hover:bg-red-100 rounded-full"><XCircle size={20} /></button>)}
                    </div>
                ))}
                {isEditable && (<button type="button" onClick={handleAddMilestone} className="w-full mt-2 text-sm font-semibold text-green-600 hover:bg-green-100 rounded-md p-2 flex items-center justify-center space-x-2"><PlusCircle size={16} /><span>Add Milestone</span></button>)}
            </div>
            {Math.round(totalPercentage) !== 100 && (<p className="text-red-600 text-sm mt-2">Milestone payments must add up to exactly 100%.</p>)}
        </section>
    );
};

const EscrowAndApprovalSection = ({ requiredEscrow, walletBalance, onAddFundsClick, termsAgreed, onTermsChange }) => {
    const hasSufficientFunds = walletBalance >= requiredEscrow;
    const amountNeeded = requiredEscrow - walletBalance;
    return (
        <section className="space-y-6 mt-8 pt-6 border-t">
            <h3 className="text-xl font-semibold">Escrow & Final Approval</h3>
            <div className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                <div className="flex justify-between items-center text-sm"><span className="text-gray-600">Required Escrow Amount:</span><span className="font-bold text-gray-800">₹{requiredEscrow.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between items-center text-sm"><span className="text-gray-600">Your Current Wallet Balance:</span><span className="font-bold text-gray-800">₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                {!hasSufficientFunds ? (
                    <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-center space-y-2">
                        <p className="font-semibold text-sm">Action Required: Insufficient Funds</p>
                        <button type="button" onClick={onAddFundsClick} className="w-full bg-yellow-400 text-yellow-900 font-bold py-2 rounded-lg hover:bg-yellow-500 flex items-center justify-center space-x-2 text-base"><Wallet size={18} /><span>Add ₹{amountNeeded.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to Wallet</span></button>
                    </div>
                ) : (
                    <div className="p-3 bg-green-50 text-green-800 rounded-md text-center"><p className="font-semibold text-sm flex items-center justify-center space-x-2"><CheckSquare size={18} /><span>Sufficient funds available for escrow.</span></p></div>
                )}
            </div>
            <div className="flex items-start">
                <input type="checkbox" id="terms" checked={termsAgreed} onChange={onTermsChange} className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-600">I agree with the terms and conditions of the agreement and wish to send this proposal for the farmer's approval.</label>
            </div>
        </section>
    );
};

// --- GENERIC UPLOAD HANDLER (can be moved to a custom hook later) ---
const useSignatureUpload = (setFormData) => {
    const token = useAuthStore((state) => state.token);
    const [signatureUploading, setSignatureUploading] = useState(false);
    const [signatureUploadError, setSignatureUploadError] = useState(null);

    const handleSignatureSave = async (file) => {
        if (!file) return;
        setSignatureUploading(true);
        setSignatureUploadError(null);

        const apiFormData = new FormData();
        apiFormData.append("file", file);

        try {
            // --- THIS IS THE LINE THAT WAS FIXED ---
            const response = await fetch(`${API_BASE_URL}/api/signatures/upload?role=buyer`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: apiFormData,
            });

            // --- THIS PART IS ALSO IMPROVED FOR BETTER ERROR MESSAGES ---
            if (!response.ok) {
                const err = await response.json(); // Read the JSON body of the error
                throw new Error(err.detail || "Signature upload failed. The server returned an error.");
            }
            const data = await response.json();
            console.log("Signature Upload Success:", data);
            setFormData({ signature_url: data.url });
        } catch (error) {
            console.error("Signature Upload Error:", error);
            setSignatureUploadError(error.message);
        } finally {
            setSignatureUploading(false);
        }
    };

    return { signatureUploading, signatureUploadError, handleSignatureSave };
};


// --- INDIVIDUAL FORM COMPONENTS (ALL UPDATED) ---

const SecuredSpotBuyForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const { signatureUploading, signatureUploadError, handleSignatureSave } = useSignatureUpload(setFormData);
    const handleInputChange = (e) => setFormData({ [e.target.name]: e.target.value });
    const totalValue = useMemo(() => (parseFloat(formData.quantity) || 0) * (parseFloat(formData.price) || 0), [formData.quantity, formData.price]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature_url && hasSufficientFunds && escrowProps.termsAgreed;

    return (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <PartiesSection crop={crop} buyer={buyer} />
            <section>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label={`Quantity to Buy (${crop?.unit || "units"})`} name="quantity" value={formData.quantity} onChange={handleInputChange} type="number" />
                    <FormField label="Quantity in Tons" name="quantityInTons" value={formData.quantityInTons} onChange={handleInputChange} type="number" placeholder="e.g., 1.5" />
                    <FormField label={`Price per ${crop?.unit || "unit"} (₹)`} name="price" value={formData.price} onChange={handleInputChange} type="number" />
                </div>
                <div className="mt-6"><FormField label="Quality Specifications" name="qualitySpecs" value={formData.qualitySpecs} onChange={handleInputChange} placeholder="e.g., Grade A" /></div>
                <div className="mt-4 p-3 bg-gray-50 rounded-md"><p className="text-sm"><strong>Total Contract Value:</strong> ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
            </section>
            <DynamicMilestoneSection formData={formData} setFormData={setFormData} isEditable={false} />
            <SignatureEditSection onSave={handleSignatureSave} signatureUrl={formData.signature_url} isUploading={signatureUploading} uploadError={signatureUploadError} />
            <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
            <FormActions onPreview={() => setMode("preview")} isDisabled={!isValid} />
        </form>
    );
};

const ForwardAgreementForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const { signatureUploading, signatureUploadError, handleSignatureSave } = useSignatureUpload(setFormData);
    const handleInputChange = (e) => setFormData({ [e.target.name]: e.target.value });
    const { totalValue, calculatedYield } = useMemo(() => {
        const yieldVal = (parseFloat(formData.farmingArea) || 0) * (parseFloat(formData.estimatedYield) || 0);
        const tons = convertToTons(yieldVal, crop?.unit);
        const value = yieldVal * (parseFloat(formData.fixedPrice) || 0);
        return { totalValue: value, calculatedYield: { totalYield: yieldVal, tons } };
    }, [formData.farmingArea, formData.estimatedYield, formData.fixedPrice, crop?.unit]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature_url && hasSufficientFunds && escrowProps.termsAgreed;

    return (
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <PartiesSection crop={crop} buyer={buyer} />
            <section>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Farming Area (Acres)" name="farmingArea" value={formData.farmingArea} onChange={handleInputChange} type="number" />
                    <FormField label={`Estimated Yield (${crop?.unit || "units"}/Acre)`} name="estimatedYield" value={formData.estimatedYield} onChange={handleInputChange} type="number" />
                    <FormField label={`Fixed Price per ${crop?.unit || "unit"} (₹)`} name="fixedPrice" value={formData.fixedPrice} onChange={handleInputChange} type="number" />
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm"><p><strong>Calculated Total Yield:</strong> {calculatedYield.totalYield.toLocaleString()} {crop?.unit || "units"} (~{calculatedYield.tons} Tons)</p></div>
                <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm"><p><strong>Estimated Total Value:</strong> ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
            </section>
            <DynamicMilestoneSection formData={formData} setFormData={setFormData} isEditable={false} />
            <SignatureEditSection onSave={handleSignatureSave} signatureUrl={formData.signature_url} isUploading={signatureUploading} uploadError={signatureUploadError} />
            <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
            <FormActions onPreview={() => setMode("preview")} isDisabled={!isValid} />
        </form>
    );
};

const InputFinancingForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const { signatureUploading, signatureUploadError, handleSignatureSave } = useSignatureUpload(setFormData);
    const handleInputChange = (e) => setFormData({ [e.target.name]: e.target.value });
    const { totalValue, calculatedQuantity } = useMemo(() => {
        const buybackPercent = (formData.milestones || []).find((m) => m.desc.includes("Buyback"))?.val || 60;
        const value = (parseFloat(formData.inputsValue) || 0) / (1 - buybackPercent / 100);
        const quantity = value / (parseFloat(formData.buybackPrice) || 1);
        const tons = convertToTons(quantity, crop?.unit);
        return { totalValue: value, calculatedQuantity: { quantity: isNaN(quantity) ? 0 : quantity.toFixed(2), tons } };
    }, [formData.inputsValue, formData.buybackPrice, formData.milestones, crop?.unit]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature_url && hasSufficientFunds && escrowProps.termsAgreed;
    
    return (
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <PartiesSection crop={crop} buyer={buyer} />
            <section>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
                <FormField label="Inputs Provided by Buyer (Description)" as="textarea" rows="3" name="inputsProvided" value={formData.inputsProvided} onChange={handleInputChange} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <FormField label="Total Value of Inputs (₹)" name="inputsValue" value={formData.inputsValue} onChange={handleInputChange} type="number" />
                    <FormField label={`Buyback Price per ${crop?.unit || "unit"} (₹)`} name="buybackPrice" value={formData.buybackPrice} onChange={handleInputChange} type="number" />
                    <FormField label="Quality Standards" name="qualityStandards" value={formData.qualityStandards} onChange={handleInputChange} />
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm"><p><strong>Estimated Buyback Quantity:</strong> {calculatedQuantity.quantity} {crop?.unit || "units"} (~{calculatedQuantity.tons} Tons)</p></div>
                <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm"><p><strong>Estimated Total Value:</strong> ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
            </section>
            <DynamicMilestoneSection formData={formData} setFormData={setFormData} isEditable={false} />
            <SignatureEditSection onSave={handleSignatureSave} signatureUrl={formData.signature_url} isUploading={signatureUploading} uploadError={signatureUploadError} />
            <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
            <FormActions onPreview={() => setMode("preview")} isDisabled={!isValid} />
        </form>
    );
};

const QualityTieredForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const { signatureUploading, signatureUploadError, handleSignatureSave } = useSignatureUpload(setFormData);
    const handleInputChange = (e) => setFormData({ [e.target.name]: e.target.value });
    const totalValue = useMemo(() => (parseFloat(formData.estimatedQuantity) || 0) * (parseFloat(formData.basePrice) || 0), [formData.estimatedQuantity, formData.basePrice]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature_url && hasSufficientFunds && escrowProps.termsAgreed;
    
    const handleTierChange = (index, event) => {
        const { name, value } = event.target;
        const newTiers = [...(formData.tiers || [])];
        newTiers[index] = { ...newTiers[index], [name]: value };
        setFormData({ tiers: newTiers });
    };
    const addTier = () => setFormData({ tiers: [...(formData.tiers || []), { grade: "", adjustment: "0" }] });
    const removeTier = (index) => setFormData({ tiers: (formData.tiers || []).filter((_, i) => i !== index) });

    return (
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <PartiesSection crop={crop} buyer={buyer} />
            <section>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label={`Estimated Quantity (${crop?.unit || "units"})`} name="estimatedQuantity" value={formData.estimatedQuantity} onChange={handleInputChange} type="number" />
                    <FormField label="Est. Quantity in Tons" name="estimatedQuantityInTons" value={formData.estimatedQuantityInTons} onChange={handleInputChange} type="number" placeholder="e.g., 9.5" />
                    <FormField label={`Base Price per ${crop?.unit || "unit"} (₹)`} name="basePrice" value={formData.basePrice} onChange={handleInputChange} type="number" />
                </div>
                 <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm"><p><strong>Estimated Total Value:</strong> ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
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
                            {(formData.tiers || []).length > 1 && (<button type="button" onClick={() => removeTier(index)} className="mb-1 p-2 text-red-500 hover:bg-red-100 rounded-full"><XCircle size={20} /></button>)}
                        </div>
                    ))}
                    <button type="button" onClick={addTier} className="w-full mt-2 text-sm font-semibold text-green-600 hover:bg-green-100 rounded-md p-2 flex items-center justify-center space-x-2"><PlusCircle size={16} /><span>Add Tier</span></button>
                </div>
            </section>
            <DynamicMilestoneSection formData={formData} setFormData={setFormData} isEditable={false} />
            <SignatureEditSection onSave={handleSignatureSave} signatureUrl={formData.signature_url} isUploading={signatureUploading} uploadError={signatureUploadError} />
            <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
            <FormActions onPreview={() => setMode("preview")} isDisabled={!isValid} />
        </form>
    );
};

const StaggeredDeliveryForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const { signatureUploading, signatureUploadError, handleSignatureSave } = useSignatureUpload(setFormData);
    const handleInputChange = (e) => setFormData({ [e.target.name]: e.target.value });
    
    useEffect(() => {
        const numDeliveries = parseInt(formData.deliveries, 10);
        if (numDeliveries > 0 && !isNaN(numDeliveries)) {
            const newMilestones = Array.from({ length: numDeliveries }, (_, i) => {
                const percentage = 100 / numDeliveries;
                return { desc: `Delivery ${i + 1} of ${numDeliveries}`, val: percentage.toFixed(2), type: "deliverable" };
            });
            const totalVal = newMilestones.reduce((sum, m) => sum + parseFloat(m.val), 0);
            const remainder = 100 - totalVal;
            if (newMilestones.length > 0) {
                newMilestones[newMilestones.length - 1].val = (parseFloat(newMilestones[newMilestones.length - 1].val) + remainder).toFixed(2);
            }
            if (JSON.stringify(formData.milestones) !== JSON.stringify(newMilestones)) {
                setFormData({ milestones: newMilestones });
            }
        }
    }, [formData.deliveries, setFormData]);

    const totalValue = useMemo(() => (parseFloat(formData.totalQuantity) || 0) * (parseFloat(formData.pricePerUnit) || 0), [formData.totalQuantity, formData.pricePerUnit]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature_url && hasSufficientFunds && escrowProps.termsAgreed;

    return (
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <PartiesSection crop={crop} buyer={buyer} />
            <section>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Contract Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormField label={`Total Quantity (${crop?.unit || "units"})`} name="totalQuantity" value={formData.totalQuantity} onChange={handleInputChange} type="number" />
                    <FormField label="Total Qty in Tons" name="totalQuantityInTons" value={formData.totalQuantityInTons} onChange={handleInputChange} type="number" placeholder="e.g., 50" />
                    <FormField label={`Price per ${crop?.unit || "unit"} (₹)`} name="pricePerUnit" value={formData.pricePerUnit} onChange={handleInputChange} type="number" />
                    <FormField label="No. of Deliveries" name="deliveries" value={formData.deliveries} onChange={handleInputChange} type="number" min="1" />
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm"><p><strong>Total Contract Value:</strong> ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
            </section>
            <DynamicMilestoneSection formData={formData} setFormData={setFormData} isEditable={false} />
            <SignatureEditSection onSave={handleSignatureSave} signatureUrl={formData.signature_url} isUploading={signatureUploading} uploadError={signatureUploadError} />
            <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
            <FormActions onPreview={() => setMode("preview")} isDisabled={!isValid} />
        </form>
    );
};

const CustomProjectForm = ({ formData, setFormData, crop, buyer, setMode, onEscrowChange, escrowProps }) => {
    const { signatureUploading, signatureUploadError, handleSignatureSave } = useSignatureUpload(setFormData);
    const handleInputChange = (e) => setFormData({ [e.target.name]: e.target.value });
    const totalValue = useMemo(() => parseFloat(formData.totalValue) || 0, [formData.totalValue]);
    useEffect(() => { onEscrowChange(totalValue); }, [totalValue, onEscrowChange]);
    const totalPercentage = useMemo(() => (formData.milestones || []).reduce((acc, m) => acc + (parseFloat(m.val) || 0), 0), [formData.milestones]);
    const hasSufficientFunds = escrowProps.walletBalance >= totalValue;
    const isValid = Math.round(totalPercentage) === 100 && formData.signature_url && hasSufficientFunds && escrowProps.termsAgreed;
    
    return (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <PartiesSection crop={crop} buyer={buyer} />
            <section>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Project Details</h3>
                <FormField label="Total Contract Value (₹)" name="totalValue" value={formData.totalValue} onChange={handleInputChange} type="number" />
                <div className="mt-6">
                    <FormField as="textarea" rows="3" label="Project Description" name="projectDescription" value={formData.projectDescription} onChange={handleInputChange} />
                </div>
            </section>
            <DynamicMilestoneSection formData={formData} setFormData={setFormData} isEditable={true} />
            <SignatureEditSection onSave={handleSignatureSave} signatureUrl={formData.signature_url} isUploading={signatureUploading} uploadError={signatureUploadError} />
            <EscrowAndApprovalSection {...escrowProps} requiredEscrow={totalValue} />
            <FormActions onPreview={() => setMode("preview")} isDisabled={!isValid} />
        </form>
    );
};

// --- MAIN FORM ROUTER ---

const TemplateForm = ({ selectedTemplate, ...props }) => {
    switch (selectedTemplate) {
        case "spot-buy":
            return <SecuredSpotBuyForm {...props} />;
        case "forward-agreement":
            return <ForwardAgreementForm {...props} />;
        case "input-financing":
            return <InputFinancingForm {...props} />;
        case "quality-tiered":
            return <QualityTieredForm {...props} />;
        case "staggered-delivery":
            return <StaggeredDeliveryForm {...props} />;
        case "custom-project":
            return <CustomProjectForm {...props} />;
        default:
            return <div className="text-red-500 font-semibold p-4 text-center">Error: No form found for this template. Please go back and select another.</div>;
    }
};

export default TemplateForm;