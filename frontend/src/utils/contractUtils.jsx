// src/utils/contractUtils.js

// Unit conversion utilities
export const convertToTons = (quantity, unit) => {
    if (!quantity || !unit) return 0;
    const qty = parseFloat(quantity);
    if (isNaN(qty)) return 0;
    
    switch (unit.toLowerCase()) {
        case 'kg': 
        case 'kgs': 
            return (qty / 1000).toFixed(2);
        case 'quintal': 
        case 'quintals': 
            return (qty / 10).toFixed(2);
        case 'ton': 
        case 'tons': 
        case 'tonne': 
        case 'tonnes': 
            return qty.toFixed(2);
        default: 
            return 0;
    }
};

// Contract value calculations
export const contractCalculations = {
    // Calculate total contract value
    calculateTotalValue: (quantity, pricePerUnit) => {
        const qty = parseFloat(quantity) || 0;
        const price = parseFloat(pricePerUnit) || 0;
        return qty * price;
    },

    // Calculate milestone amounts
    calculateMilestoneAmounts: (milestones, totalValue) => {
        return milestones.map(milestone => ({
            ...milestone,
            amount: totalValue * (parseFloat(milestone.val) || 0) / 100
        }));
    },

    // Validate milestone percentages
    validateMilestones: (milestones) => {
        const totalPercentage = milestones.reduce((sum, m) => sum + (parseFloat(m.val) || 0), 0);
        return {
            isValid: Math.round(totalPercentage) === 100,
            totalPercentage: totalPercentage,
            difference: 100 - totalPercentage
        };
    },

    // Calculate escrow requirements
    calculateEscrowRequirement: (contractValue, escrowPercentage = 100) => {
        return (contractValue * escrowPercentage) / 100;
    }
};

// Contract status utilities
export const contractStatus = {
    getStatusColor: (status) => {
        switch (status?.toLowerCase()) {
            case 'ongoing':
            case 'active':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    border: 'border-green-200'
                };
            case 'negotiating':
            case 'pending':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    border: 'border-yellow-200'
                };
            case 'rejected':
            case 'cancelled':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    border: 'border-red-200'
                };
            case 'completed':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    border: 'border-blue-200'
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    border: 'border-gray-200'
                };
        }
    },

    getStatusLabel: (status) => {
        switch (status?.toLowerCase()) {
            case 'ongoing': return 'Active';
            case 'negotiating': return 'In Negotiation';
            case 'rejected': return 'Rejected';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status || 'Unknown';
        }
    }
};

// Offer message utilities
export const offerUtils = {
    // Determine offer status display
    getOfferStatusDisplay: (offerStatus, isMyOffer) => {
        switch (offerStatus?.toLowerCase()) {
            case 'accepted':
                return {
                    text: 'Offer Accepted',
                    bgColor: 'bg-green-50 border-green-500',
                    textColor: 'text-green-800',
                    showButtons: false
                };
            case 'rejected':
                return {
                    text: 'Offer Rejected',
                    bgColor: 'bg-red-50 border-red-500',
                    textColor: 'text-red-800',
                    showButtons: false
                };
            case 'pending':
            default:
                if (isMyOffer) {
                    return {
                        text: 'Approval Pending',
                        bgColor: 'bg-yellow-50 border-yellow-500',
                        textColor: 'text-yellow-800',
                        showButtons: false
                    };
                } else {
                    return {
                        text: 'New Offer Received',
                        bgColor: 'bg-blue-50 border-blue-500',
                        textColor: 'text-blue-800',
                        showButtons: true
                    };
                }
        }
    },

    // Check if message is an offer
    isOfferMessage: (message) => {
        return message.message_type === 'offer' || 
               (message.proposed_price && message.proposed_quantity);
    },

    // Format offer details
    formatOfferDetails: (message) => {
        const price = parseFloat(message.proposed_price || 0);
        const quantity = parseInt(message.proposed_quantity || 0);
        const totalValue = price * quantity;

        return {
            price: price.toLocaleString('en-IN'),
            quantity: quantity.toLocaleString('en-IN'),
            totalValue: totalValue.toLocaleString('en-IN')
        };
    }
};

// Form validation utilities
export const formValidation = {
    // Validate contract form data
    validateContractForm: (formData, templateType) => {
        const errors = {};

        // Common validations
        if (!formData.signature) {
            errors.signature = 'Digital signature is required';
        }

        // Template-specific validations
        switch (templateType) {
            case 'spot-buy':
                if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
                    errors.quantity = 'Valid quantity is required';
                }
                if (!formData.price || parseFloat(formData.price) <= 0) {
                    errors.price = 'Valid price is required';
                }
                break;

            case 'forward-agreement':
                if (!formData.farmingArea || parseFloat(formData.farmingArea) <= 0) {
                    errors.farmingArea = 'Valid farming area is required';
                }
                if (!formData.estimatedYield || parseFloat(formData.estimatedYield) <= 0) {
                    errors.estimatedYield = 'Valid estimated yield is required';
                }
                if (!formData.fixedPrice || parseFloat(formData.fixedPrice) <= 0) {
                    errors.fixedPrice = 'Valid fixed price is required';
                }
                break;

            // Add more template validations as needed
        }

        // Milestone validation
        if (formData.milestones) {
            const milestoneValidation = contractCalculations.validateMilestones(formData.milestones);
            if (!milestoneValidation.isValid) {
                errors.milestones = `Milestones must total 100% (currently ${milestoneValidation.totalPercentage.toFixed(1)}%)`;
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Validate offer form
    validateOffer: (price, quantity) => {
        const errors = {};

        if (!price || parseFloat(price) <= 0) {
            errors.price = 'Valid price is required';
        }

        if (!quantity || parseInt(quantity) <= 0) {
            errors.quantity = 'Valid quantity is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

// Date and time utilities
export const dateUtils = {
    // Format date for display
    formatDate: (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN');
    },

    // Format datetime for display
    formatDateTime: (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN');
    },

    // Get relative time (e.g., "2 hours ago")
    getRelativeTime: (dateString) => {
        if (!dateString) return 'N/A';
        
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
};

// Currency formatting utilities
export const currencyUtils = {
    // Format amount in Indian Rupees
    formatINR: (amount) => {
        const num = parseFloat(amount) || 0;
        return `₹${num.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },

    // Format amount without currency symbol
    formatNumber: (amount) => {
        const num = parseFloat(amount) || 0;
        return num.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
};

// WebSocket utilities
export const websocketUtils = {
    // Create WebSocket URL
    createWebSocketURL: (endpoint, contractId, userId) => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
        return `${wsProtocol}//${wsHost}/ws/${endpoint}/${contractId}/${userId}`;
    },

    // Handle WebSocket message parsing
    parseMessage: (event) => {
        try {
            return JSON.parse(event.data);
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
            return null;
        }
    }
};