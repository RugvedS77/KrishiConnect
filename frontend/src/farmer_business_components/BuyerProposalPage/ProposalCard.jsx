import React, { useState } from 'react';
import { Check, X, Loader2, MessagesSquare } from 'lucide-react';
import AcceptContractModal from './AcceptContractModal';

export default function ProposalCard({ proposal, analysis, submittingId, onReject, onNegotiate, onActionSuccess }) {
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);

    const isRecommended = analysis && proposal.id === analysis.best_proposal_id;

    return (
        <>
            <div
                className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 relative ${
                    isRecommended ? 'ring-2 ring-offset-2 ring-green-500' : 'hover:shadow-lg'
                }`}
            >
                {isRecommended && (
                    <div className="absolute top-0 right-4 bg-green-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-b-md">
                        AI Recommended
                    </div>
                )}
                
                <div className="p-5 border-b border-gray-100">
                    <h2 className="text-2xl font-semibold text-green-700">{proposal.buyerName}</h2>
                    <p className="text-sm text-gray-500">{proposal.buyerInfo}</p>
                </div>

                <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Crop</p>
                        <p className="text-lg font-medium text-gray-900">{proposal.cropType}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Offered</p>
                        <p className="text-lg font-medium text-gray-900">{proposal.priceOffered}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantity</p>
                        <p className="text-lg font-medium text-gray-900">{proposal.quantityRequested}</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 flex justify-end space-x-2 md:space-x-4">
                    <button
                        onClick={() => onNegotiate(proposal)}
                        disabled={submittingId === proposal.id}
                        className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 flex items-center disabled:opacity-50"
                    >
                        <MessagesSquare size={16} className="mr-2" />
                        Negotiate
                    </button>
                    <button
                        onClick={() => onReject(proposal.id)}
                        disabled={submittingId === proposal.id}
                        className="px-5 py-2 rounded-md bg-red-600 text-white text-sm font-medium shadow-sm hover:bg-red-700 flex items-center justify-center w-[100px] disabled:opacity-50"
                    >
                        {submittingId === proposal.id ? <Loader2 className="animate-spin" size={20} /> : 'Reject'}
                    </button>
                    <button
                        onClick={() => setIsAcceptModalOpen(true)}
                        disabled={submittingId === proposal.id}
                        className="px-5 py-2 rounded-md bg-green-600 text-white text-sm font-medium shadow-sm hover:bg-green-700 flex items-center justify-center w-[100px] disabled:opacity-50"
                    >
                        <Check size={20} className="mr-1" />
                        Accept
                    </button>
                </div>
            </div>

            {isAcceptModalOpen && (
                <AcceptContractModal
                    proposal={proposal}
                    onClose={() => setIsAcceptModalOpen(false)}
                    onSuccess={() => {
                        setIsAcceptModalOpen(false);
                        onActionSuccess();
                    }}
                />
            )}
        </>
    );
}