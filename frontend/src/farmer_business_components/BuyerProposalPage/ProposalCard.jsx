import React from 'react';

export default function ProposalCard({ proposal, onAccept, onReject }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      {/* Card Header: Buyer Info */}
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-blue-600">
          {proposal.buyerName}
        </h2>
        <p className="text-sm text-gray-500">{proposal.buyerInfo}</p>
      </div>

      {/* Card Body: Proposal Details */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Crop</p>
          <p className="text-lg font-medium text-gray-900">{proposal.cropType}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Price Offered</p>
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
          <p className="text-sm font-medium text-gray-500">Delivery By</p>
          <p className="text-lg font-medium text-gray-900">
            {proposal.deliveryDate}
          </p>
        </div>

        <div className="col-span-2 md:col-span-3">
          <p className="text-sm font-medium text-gray-500">Payment Terms</p>
          <p className="text-lg font-medium text-gray-900">
            {proposal.paymentTerms}
          </p>
        </div>
      </div>

      {/* Card Footer: Actions */}
      <div className="bg-gray-50 p-4 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => onReject(proposal.id)}
          className="px-5 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => onAccept(proposal.id)}
          className="px-5 py-2 rounded-md border border-transparent bg-blue-600 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
