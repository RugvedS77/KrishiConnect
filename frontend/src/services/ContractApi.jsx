// src/services/contractApi.js
const API_BASE_URL = 'http://localhost:8000/api';

// Generic API error handler
const handleApiError = async (response) => {
    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
        } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
    return response;
};

// Contract-related API functions
export const contractApi = {
    // Fetch contracts by status
    fetchContractsByStatus: async (status, token) => {
        const response = await fetch(`${API_BASE_URL}/contracts/my-contracts?status=${status}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await handleApiError(response);
        return response.json();
    },

    // Create new contract
    createContract: async (contractData, token) => {
        const response = await fetch(`${API_BASE_URL}/contracts/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(contractData)
        });
        await handleApiError(response);
        return response.json();
    },

    // Get contract details
    getContract: async (contractId, token) => {
        const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await handleApiError(response);
        return response.json();
    },

    // Update contract
    updateContract: async (contractId, updateData, token) => {
        const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        await handleApiError(response);
        return response.json();
    }
};

// Negotiation/Offer-related API functions
export const offerApi = {
    // Fetch negotiation history
    fetchNegotiationHistory: async (contractId, token) => {
        const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/negotiation-history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        await handleApiError(response);
        return response.json();
    },

    // Submit new offer
    updateOffer: async (contractId, offerData, token) => {
        const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/update-offer`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(offerData)
        });
        await handleApiError(response);
        return response.json();
    },

    // Accept offer
    acceptOffer: async (contractId, messageId, token) => {
        const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/accept-offer`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message_id: messageId })
        });
        await handleApiError(response);
        return response.json();
    },

    // Reject offer
    rejectOffer: async (contractId, messageId, token) => {
        const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/reject-offer`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message_id: messageId })
        });
        await handleApiError(response);
        return response.json();
    }
};

// Milestone-related API functions
export const milestoneApi = {
    // Create milestone
    createMilestone: async (contractId, milestoneData, token) => {
        const response = await fetch(`${API_BASE_URL}/milestones/contract/${contractId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(milestoneData)
        });
        await handleApiError(response);
        return response.json();
    },

    // Get milestones for contract
    getContractMilestones: async (contractId, token) => {
        const response = await fetch(`${API_BASE_URL}/milestones/contract/${contractId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await handleApiError(response);
        return response.json();
    },

    // Update milestone status
    updateMilestone: async (milestoneId, updateData, token) => {
        const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        await handleApiError(response);
        return response.json();
    }
};

// Wallet-related API functions
export const walletApi = {
    // Get wallet balance
    getBalance: async (token) => {
        const response = await fetch(`${API_BASE_URL}/wallet/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await handleApiError(response);
        return response.json();
    },

    // Add funds to wallet
    addFunds: async (amount, token) => {
        const response = await fetch(`${API_BASE_URL}/wallet/me/add-funds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount })
        });
        await handleApiError(response);
        return response.json();
    }
};

// Crop listing API functions
export const cropApi = {
    // Get crop listing details
    getCropListing: async (cropId, token) => {
        const response = await fetch(`${API_BASE_URL}/croplists/${cropId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await handleApiError(response);
        return response.json();
    },

    // Browse crop listings
    browseCropListings: async (filters = {}, token) => {
        const queryParams = new URLSearchParams(filters).toString();
        const url = queryParams 
            ? `${API_BASE_URL}/croplists?${queryParams}` 
            : `${API_BASE_URL}/croplists`;
        
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await handleApiError(response);
        return response.json();
    }
};