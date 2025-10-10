import React, { useMemo } from 'react';
import { Send, Loader2, AlertCircle, CheckSquare } from 'lucide-react';

// --- SHARED & REUSABLE PREVIEW COMPONENTS ---

// --- REPLACED to use signatureUrl prop ---
const A4PreviewWrapper = ({ children, title, description, signatureUrl, onSendProposal, isSubmitting, submitError, submitSuccess }) => {
    // NOTE: The useEffect for creating an object URL has been removed.

    const KrishiConnectLetterhead = () => (
        <div className="mb-10 pb-5 border-b-2 border-gray-300 text-center">
            <span className="text-4xl font-extrabold text-green-700 font-sans">KrishiConnect</span>
            <p className="text-lg text-gray-700 font-medium italic">Empowering Farmers. Assuring Buyers.</p>
        </div>
    );

    return (
        <div className="bg-white p-8 sm:p-12 shadow-lg max-w-3xl mx-auto font-serif text-gray-800">
            <KrishiConnectLetterhead />
            <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
            <p className="text-center text-gray-600 mb-8 italic">{description}</p>
            <div className="space-y-6 text-sm">{children}</div>
            <div className="mt-16 border-t pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold text-center mb-2">Farmer's Signature</h4>
                        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md border-2 border-dashed"><p className="text-gray-400 text-sm">Awaiting Farmer's Signature</p></div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-center mb-2">Buyer's Signature</h4>
                        <div className="h-48 flex items-center justify-center border-2 border-dashed rounded-md p-4">
                            {/* --- CHANGED to render from signatureUrl --- */}
                            {signatureUrl ? <img src={signatureUrl} alt="Buyer Signature" className="max-h-full object-contain" /> : <p className="text-gray-400 text-sm">No Signature Attached</p>}
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t">
                    {submitSuccess ? (
                        <div className="text-center p-4 bg-green-50 text-green-700 rounded-md">
                            <CheckSquare size={24} className="mx-auto mb-2" /><p className="font-semibold">Proposal Sent Successfully!</p><p className="text-sm">Redirecting...</p>
                        </div>
                    ) : (
                        <>
                            {submitError && (
                                <div className="text-left p-3 mb-4 bg-red-50 text-red-700 rounded-md flex items-start space-x-2">
                                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                    <div><p className="font-semibold">Submission Failed</p><p className="text-sm">{submitError}</p></div>
                                </div>
                            )}
                            <button onClick={onSendProposal} disabled={isSubmitting} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 text-base disabled:bg-gray-400">
                                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                <span>{isSubmitting ? "Submitting..." : "Confirm & Send Proposal"}</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const GenericMilestonePreviewSection = ({ totalValue, milestones }) => (
    <>
        <h3 className="font-bold mt-6 mb-2 text-base">Article 2: Payment and Escrow</h3>
        <p>The Total Contract Value shall be held in the KrishiConnect Escrow Account and released according to the following milestones:</p>
        <table className="w-full text-left border-collapse my-2 text-xs sm:text-sm">
            <thead className="bg-gray-100">
                <tr>
                    <th className="p-2 border">Milestone Description</th><th className="p-2 border">Type</th><th className="p-2 border">Payment</th>
                </tr>
            </thead>
            <tbody>
                {(milestones || []).map((m, i) => (
                    <tr key={i}>
                        <td className="p-2 border">{m.desc}</td><td className="p-2 border capitalize">{m.type}</td><td className="p-2 border">{m.val}% (₹{((totalValue * (parseFloat(m.val) || 0)) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
);

const ContractDetails = ({ crop, buyer, terms }) => (
    <>
        <p>This Agreement is between <strong>{crop.farmer}</strong> ("Farmer") and <strong>{buyer.name}</strong> ("Buyer").</p>
        <h3 className="font-bold mt-6 mb-2 text-base">Article 1: Core Terms</h3>
        <ul className="list-disc list-inside space-y-1">
            {terms.map((term, index) => (
                <li key={index}>
                    <strong>{term.label}:</strong> {term.value}
                </li>
            ))}
        </ul>
    </>
);


// --- REFACTORED INDIVIDUAL PREVIEW COMPONENTS (ALL UPDATED) ---

const SecuredSpotBuyPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => (parseFloat(data.quantity) || 0) * (parseFloat(data.price) || 0), [data.quantity, data.price]);
    
    const coreTerms = [
        { label: "Produce", value: crop.name },
        { label: "Quantity", value: `${data.quantity} ${crop.unit} ${data.quantityInTons ? `(~${data.quantityInTons} Tons)` : ''}` },
        { label: "Price", value: `₹${parseFloat(data.price).toLocaleString("en-IN")} per ${crop.unit}` },
        { label: "Quality", value: data.qualitySpecs },
        { label: "Total Contract Value", value: `₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    ];

    return (
        <A4PreviewWrapper signatureUrl={data.signature_url} title="Secured Crop Supply Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}>
            <ContractDetails crop={crop} buyer={buyer} terms={coreTerms} />
            <GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} />
        </A4PreviewWrapper>
    );
};

const ForwardAgreementPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => (parseFloat(data.farmingArea) || 0) * (parseFloat(data.estimatedYield) || 0) * (parseFloat(data.fixedPrice) || 0), [data]);
    
    const coreTerms = [
        { label: "Produce", value: crop.name },
        { label: "Farming Area", value: `${data.farmingArea} Acres` },
        { label: "Fixed Price", value: `₹${parseFloat(data.fixedPrice).toLocaleString("en-IN")} per ${crop.unit}` },
        { label: "Estimated Total Value", value: `₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    ];

    return (
        <A4PreviewWrapper signatureUrl={data.signature_url} title="Forward Price Assurance Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}>
            <ContractDetails crop={crop} buyer={buyer} terms={coreTerms} />
            <GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} />
        </A4PreviewWrapper>
    );
};

const InputFinancingPreview = ({ data, crop, buyer, ...props }) => {
    const buybackPercent = (data.milestones || []).find((m) => m.desc.includes("Buyback"))?.val || 60;
    const totalValue = (parseFloat(data.inputsValue) || 0) / (1 - buybackPercent / 100);

    const coreTerms = [
        { label: "Inputs Provided", value: `${data.inputsProvided} (Value: ₹${parseFloat(data.inputsValue).toLocaleString("en-IN")})` },
        { label: "Buyback Price", value: `₹${parseFloat(data.buybackPrice).toLocaleString("en-IN")} per ${crop.unit}` },
        { label: "Quality Standards", value: data.qualityStandards },
        { label: "Estimated Total Contract Value", value: `₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    ];

    return (
        <A4PreviewWrapper signatureUrl={data.signature_url} title="Input Financing & Buyback Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}>
            <ContractDetails crop={crop} buyer={buyer} terms={coreTerms} />
            <GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} />
        </A4PreviewWrapper>
    );
};

const QualityTieredPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => (parseFloat(data.estimatedQuantity) || 0) * (parseFloat(data.basePrice) || 0), [data]);
    
    const coreTerms = [
        { label: "Produce", value: crop.name },
        { label: "Estimated Quantity", value: `${data.estimatedQuantity} ${crop.unit} ${data.estimatedQuantityInTons ? `(~${data.estimatedQuantityInTons} Tons)` : ''}` },
        { label: "Base Price", value: `₹${parseFloat(data.basePrice).toLocaleString("en-IN")} per ${crop.unit}` },
        { label: "Estimated Total Value", value: `₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    ];

    return (
        <A4PreviewWrapper signatureUrl={data.signature_url} title="Quality-Tiered Pricing Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}>
            <ContractDetails crop={crop} buyer={buyer} terms={coreTerms} />
            <h3 className="font-bold mt-6 mb-2 text-base">Article 2: Quality Tiers</h3>
            <table className="w-full text-left border-collapse my-2 text-xs sm:text-sm">
                <thead className="bg-gray-100"><tr><th className="p-2 border">Grade Name</th><th className="p-2 border">Price Adjustment</th></tr></thead>
                <tbody>
                    {(data.tiers || []).map((t, i) => (<tr key={i}><td className="p-2 border">{t.grade}</td><td className="p-2 border">{t.adjustment}%</td></tr>))}
                </tbody>
            </table>
            <GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} />
        </A4PreviewWrapper>
    );
};

const StaggeredDeliveryPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => (parseFloat(data.totalQuantity) || 0) * (parseFloat(data.pricePerUnit) || 0), [data]);
    
    const coreTerms = [
        { label: "Produce", value: crop.name },
        { label: "Total Quantity", value: `${data.totalQuantity} ${crop.unit} ${data.totalQuantityInTons ? `(~${data.totalQuantityInTons} Tons)` : ''}` },
        { label: "Price", value: `₹${parseFloat(data.pricePerUnit).toLocaleString("en-IN")} per ${crop.unit}` },
        { label: "Number of Deliveries", value: data.deliveries },
        { label: "Total Contract Value", value: `₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    ];

    return (
        <A4PreviewWrapper signatureUrl={data.signature_url} title="Staggered Delivery Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}>
            <ContractDetails crop={crop} buyer={buyer} terms={coreTerms} />
            <GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} />
        </A4PreviewWrapper>
    );
};

const CustomProjectPreview = ({ data, crop, buyer, ...props }) => {
    const totalValue = useMemo(() => parseFloat(data.totalValue) || 0, [data.totalValue]);
    
    const coreTerms = [
        { label: "Project Description", value: data.projectDescription },
        { label: "Total Contract Value", value: `₹${totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    ];

    return (
        <A4PreviewWrapper signatureUrl={data.signature_url} title="Custom Project Agreement" description={`Effective Date: ${new Date().toLocaleDateString()}`} {...props}>
            <ContractDetails crop={crop} buyer={buyer} terms={coreTerms} />
            <GenericMilestonePreviewSection totalValue={totalValue} milestones={data.milestones} />
        </A4PreviewWrapper>
    );
};


// --- MAIN PREVIEW ROUTER ---

const ContractPreview = ({ selectedTemplate, ...props }) => {
    switch (selectedTemplate) {
        case "spot-buy":
            return <SecuredSpotBuyPreview {...props} />;
        case "forward-agreement":
            return <ForwardAgreementPreview {...props} />;
        case "input-financing":
            return <InputFinancingPreview {...props} />;
        case "quality-tiered":
            return <QualityTieredPreview {...props} />;
        case "staggered-delivery":
            return <StaggeredDeliveryPreview {...props} />;
        case "custom-project":
            return <CustomProjectPreview {...props} />;
        default:
            return <div className="text-red-500 text-center font-semibold p-4">Error: No preview found for this template.</div>;
    }
};

export default ContractPreview;