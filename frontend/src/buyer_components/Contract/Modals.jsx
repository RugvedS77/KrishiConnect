import React, { useState } from 'react';
import { X, Loader2, PlusCircle } from 'lucide-react';

export const AddFundsModal = ({ onClose, onAddFunds, requiredAmount }) => {
    const [amount, setAmount] = useState(requiredAmount || "");
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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Add Funds for Escrow</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount to Add (INR)</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">₹</span></div>
                                <input type="number" name="amount" id="amount" value={amount} readOnly className="w-full pl-7 pr-12 p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-gray-100 cursor-not-allowed" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">This amount is determined by the contract value and cannot be changed.</p>
                        </div>
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 disabled:bg-gray-400">
                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />}
                            <span>{isSubmitting ? "Processing..." : "Confirm & Add Funds"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TemplateViewer = ({ templateId, templates }) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return <div>Template not found.</div>;

    const renderContent = () => {
        switch (templateId) {
            case "spot-buy":
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
            case "forward-agreement":
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
            case "input-financing":
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
            case "quality-tiered":
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
            case "staggered-delivery":
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
            case "custom-project":
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

    return (
        <div className="prose prose-sm max-w-none text-gray-700">
            <h3 className="text-xl font-bold text-gray-900">{template.title}</h3>
            {renderContent()}
        </div>
    );
};

export const TemplateViewerModal = ({ isOpen, onClose, templateId, templates }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-semibold text-gray-800">Contract Template Details</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <TemplateViewer templateId={templateId} templates={templates} />
                </div>
                <div className="p-4 border-t bg-gray-50 sticky bottom-0 text-right">
                    <button onClick={onClose} className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 w-full sm:w-auto transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

