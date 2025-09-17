import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Dummy proposals
const dummyProposals = [
  {
    id: 1,
    buyerName: "Global Agro Traders",
    buyerInfo: "Verified Buyer, 25+ Contracts",
    cropType: "Cotton (Long Staple)",
    priceOffered: "$210 per quintal",
    quantityRequested: "20 tons",
    deliveryDate: "2025-11-15",
    paymentTerms: "50% on acceptance, 50% on delivery (via Escrow)",
  },
  {
    id: 2,
    buyerName: "Local Mill Co.",
    buyerInfo: "New Buyer, 2 Contracts",
    cropType: "Wheat (Durum)",
    priceOffered: "$190 per quintal",
    quantityRequested: "5 tons",
    deliveryDate: "2025-10-30",
    paymentTerms: "100% on delivery (via Escrow)",
  },
  {
    id: 3,
    buyerName: "GreenLeaf Organics",
    buyerInfo: "Verified Organic Buyer",
    cropType: "Rice (Basmati)",
    priceOffered: "$300 per quintal",
    quantityRequested: "10 tons",
    deliveryDate: "2025-11-05",
    paymentTerms: "30% on sowing, 70% on harvest",
  },
];

export default function BuyerProposalsPage() {
  const [proposals, setProposals] = useState(dummyProposals);
  const navigate = useNavigate();

  const handleAccept = (id) => {
    console.log(`Accepted proposal ${id}`);
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  const handleReject = (id) => {
    console.log(`Rejected proposal ${id}`);
    setProposals((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 md:p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        <i className="fas fa-arrow-left mr-2"></i> Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Buyer Proposals</h1>

      {proposals.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <i className="fas fa-inbox text-4xl text-gray-400 mb-3"></i>
          <h3 className="text-xl font-semibold text-gray-800">All Caught Up</h3>
          <p className="text-gray-500">You have no new proposals.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-blue-600">
                  {proposal.buyerName}
                </h2>
                <p className="text-sm text-gray-500">{proposal.buyerInfo}</p>
              </div>

              <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Crop</p>
                  <p className="text-lg font-medium text-gray-900">
                    {proposal.cropType}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Price Offered
                  </p>
                  <p className="text-lg font-medium text-gray-900">
                    {proposal.priceOffered}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Quantity</p>
                  <p className="text-lg font-medium text-gray-900">
                    {proposal.quantityRequested}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Delivery By
                  </p>
                  <p className="text-lg font-medium text-gray-900">
                    {proposal.deliveryDate}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <p className="text-sm font-medium text-gray-500">
                    Payment Terms
                  </p>
                  <p className="text-lg font-medium text-gray-900">
                    {proposal.paymentTerms}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => handleReject(proposal.id)}
                  className="px-5 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleAccept(proposal.id)}
                  className="px-5 py-2 rounded-md border border-transparent bg-blue-600 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
