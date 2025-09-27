// src/components/ContractCard.jsx
import React from 'react';
import { contractStatus, currencyUtils, dateUtils } from '../utils/contractUtils';

const ContractCard = ({ contract, isSelected, onClick }) => {
    // Calculate total value
    const totalValue = (parseFloat(contract.price_per_unit_agreed) || 0) * 
                       (parseInt(contract.quantity_proposed) || 0);
    
    // Get status colors using utility
    const statusColors = contractStatus.getStatusColor(contract.status);
    const statusLabel = contractStatus.getStatusLabel(contract.status);
    
    // Handle missing data gracefully
    const cropType = contract.listing?.crop_type || 'Unknown Crop';
    const farmerName = contract.farmer?.full_name || 'Unknown Farmer';
    const pricePerUnit = parseFloat(contract.price_per_unit_agreed) || 0;
    const quantity = parseInt(contract.quantity_proposed) || 0;
    
    return (
        <div 
            onClick={onClick}
            className={`p-4 cursor-pointer transition-all duration-200 border-l-4 ${
                isSelected
                    ? 'bg-blue-50 border-blue-500 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border-transparent hover:border-gray-300'
            }`}
        >
            {/* Header with crop name and status */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 text-sm line-clamp-1">
                    {cropType}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${
                    statusColors.bg
                } ${statusColors.text} ${statusColors.border} border`}>
                    {statusLabel}
                </span>
            </div>

            {/* Farmer name */}
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                with {farmerName}
            </p>

            {/* Contract details */}
            <div className="space-y-1 text-xs text-gray-700">
                <div className="flex justify-between items-center">
                    <span>Price per unit:</span>
                    <span className="font-medium">
                        {currencyUtils.formatINR(pricePerUnit)}
                    </span>
                </div>
                
                <div className="flex justify-between items-center">
                    <span>Quantity:</span>
                    <span className="font-medium">
                        {quantity.toLocaleString('en-IN')} units
                    </span>
                </div>
                
                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <span className="font-medium">Total Value:</span>
                    <span className="font-bold text-green-600">
                        {currencyUtils.formatINR(totalValue)}
                    </span>
                </div>
            </div>

            {/* Timeline info */}
            <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Created:</span>
                    <span>{dateUtils.formatDate(contract.created_at)}</span>
                </div>
                {contract.updated_at && contract.updated_at !== contract.created_at && (
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                        <span>Updated:</span>
                        <span>{dateUtils.getRelativeTime(contract.updated_at)}</span>
                    </div>
                )}
            </div>

            {/* Payment terms if available */}
            {contract.payment_terms && (
                <div className="mt-2 text-xs text-gray-600">
                    <span className="font-medium">Terms:</span> {contract.payment_terms}
                </div>
            )}

            {/* Visual indicator for selected state */}
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"></div>
            )}
        </div>
    );
};

export default ContractCard;