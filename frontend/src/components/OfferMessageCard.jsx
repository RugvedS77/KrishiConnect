// src/components/OfferMessageCard.jsx
import React from 'react';
import { useAuthStore } from '../authStore';
import { offerUtils, currencyUtils, dateUtils } from '../utils/contractUtils';

const OfferMessageCard = ({ message, contract, onAccept, onReject }) => {
    const user = useAuthStore((state) => state.user);
    
    // Determine who sent the offer
    const isMyOffer = user.id === message.sender_id;
    
    // Get the offer status from the message or contract
    const offerStatus = message.offer_status || message.status || 'pending';
    
    // Get status display using utility function
    const statusDisplay = offerUtils.getOfferStatusDisplay(offerStatus, isMyOffer);
    
    // Format offer details using utility
    const offerDetails = offerUtils.formatOfferDetails(message);

    return (
        <div className={`p-4 ${statusDisplay.bgColor} border-l-4 rounded-r-lg my-3 shadow-sm`}>
            {/* Offer Header */}
            <div className="flex justify-between items-start mb-2">
                <p className={`font-semibold ${statusDisplay.textColor}`}>
                    {isMyOffer ? 'You made an offer' : `${message.sender_name || 'Farmer'} made an offer`}
                </p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusDisplay.bgColor} ${statusDisplay.textColor} border`}>
                    {statusDisplay.text}
                </span>
            </div>

            {/* Offer Details */}
            <div className={`mb-3 text-sm ${statusDisplay.textColor} space-y-1`}>
                <p>
                    <span className="font-medium">Price:</span> 
                    <span className="font-bold text-lg ml-2">
                        ₹{offerDetails.price}
                    </span>
                    <span className="text-xs ml-1">per unit</span>
                </p>
                <p>
                    <span className="font-medium">Quantity:</span> 
                    <span className="font-bold text-lg ml-2">{offerDetails.quantity}</span>
                    <span className="text-xs ml-1">units</span>
                </p>
                <p>
                    <span className="font-medium">Total Value:</span> 
                    <span className="font-bold text-lg ml-2">
                        ₹{offerDetails.totalValue}
                    </span>
                </p>
            </div>

            {/* Message if any */}
            {message.message && message.message !== 'New offer submitted' && (
                <div className={`mb-3 p-2 bg-white/50 rounded text-sm ${statusDisplay.textColor}`}>
                    <span className="font-medium">Message:</span> {message.message}
                </div>
            )}

            {/* Action Buttons - Only show if it's pending and not my offer */}
            {statusDisplay.showButtons && (
                <div className="flex space-x-3 mt-4">
                    <button 
                        onClick={() => onAccept(contract.id, message.id)}
                        className="flex-1 bg-green-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Accept Offer
                    </button>
                    <button 
                        onClick={() => onReject(contract.id, message.id)}
                        className="flex-1 bg-red-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Reject Offer
                    </button>
                </div>
            )}

            {/* Timestamp */}
            {message.timestamp && (
                <div className={`mt-2 text-xs ${statusDisplay.textColor} opacity-75`}>
                    {dateUtils.getRelativeTime(message.timestamp)}
                </div>
            )}
        </div>
    );
};

export default OfferMessageCard;