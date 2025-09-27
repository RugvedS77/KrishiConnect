// src/buyer_pages/BuyerContractsPage.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuthStore } from '../authStore';
import { 
    AlertCircle, FileText, MessageCircle, Inbox, Loader2, Search, Info, Send, X
} from "lucide-react";

// Import our organized API services and utilities
import { contractApi, offerApi } from '../services/ContractApi';
import { 
    contractStatus, 
    offerUtils, 
    dateUtils, 
    currencyUtils, 
    websocketUtils 
} from '../utils/contractUtils';

// Import components (you might want to move these to separate files too)
import OfferMessageCard from '../components/OfferMessageCard';
import ContractCard from '../components/ContractCard';

// --- Chat Panel Component ---
const ChatPanel = ({ contract, onOfferUpdated, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [error, setError] = useState(null);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [offerPrice, setOfferPrice] = useState(contract.price_per_unit_agreed || '');
    const [offerQuantity, setOfferQuantity] = useState(contract.quantity_proposed || '');
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const socketRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => { 
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }, [messages]);

    useEffect(() => {
        if (!user?.id || !contract?.id) return;
        
        const connect = async () => {
            try {
                // Use our organized API service
                const history = await offerApi.fetchNegotiationHistory(contract.id, token);
                setMessages(history || []); 
                setLoadingHistory(false);

                // Create WebSocket connection using utility
                if (contract.id && user.id) {
                    const wsUrl = websocketUtils.createWebSocketURL('negotiate', contract.id, user.id);
                    const socket = new WebSocket(wsUrl);
                    socketRef.current = socket;

                    socket.onopen = () => console.log("WebSocket connected!");
                    socket.onclose = () => console.log("WebSocket disconnected.");
                    socket.onerror = (error) => {
                        console.error("WebSocket error:", error);
                        setError("WebSocket connection error.");
                    };
                    socket.onmessage = (event) => {
                        const messageData = websocketUtils.parseMessage(event);
                        if (messageData) {
                            setMessages(prev => {
                                // Avoid duplicate messages
                                if (prev.some(m => m.id === messageData.id)) return prev;
                                return [...prev, messageData];
                            });
                        }
                    };
                }
            } catch (err) { 
                console.error("Error connecting to chat:", err);
                setError(err.message); 
                setLoadingHistory(false); 
            }
        };
        
        connect();
        return () => { 
            if (socketRef.current) {
                socketRef.current.close(); 
            }
        };
    }, [user, contract, token]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            alert("Cannot send message: WebSocket is not connected.");
            return;
        }
        if (newMessage.trim() === '') return;

        const messagePayload = { message: newMessage };
        socketRef.current.send(JSON.stringify(messagePayload));
        setNewMessage('');
    };

    const handleUpdateOffer = async (e) => {
        e.preventDefault();
        if (!offerPrice || !offerQuantity) {
            alert("Please enter both price and quantity.");
            return;
        }
        
        setIsSubmittingOffer(true);
        try {
            const offerData = {
                price_per_unit_agreed: parseFloat(offerPrice),
                quantity_proposed: parseInt(offerQuantity),
                message: `New offer: ${currencyUtils.formatINR(offerPrice)} per unit for ${offerQuantity} units`
            };
            
            // Use our organized API service
            await offerApi.updateOffer(contract.id, offerData, token);
            setShowOfferForm(false);
            setOfferPrice('');
            setOfferQuantity('');
            onOfferUpdated();
            
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsSubmittingOffer(false);
        }
    };

    const handleAcceptOffer = async (contractId, messageId) => {
        if (!confirm("Are you sure you want to accept this offer and lock the funds?")) return;
        
        try {
            // Use our organized API service
            await offerApi.acceptOffer(contractId, messageId, token);
            
            // Update the specific message status in local state
            setMessages(prev => prev.map(msg => 
                msg.id === messageId 
                    ? { ...msg, offer_status: 'accepted' }
                    : msg
            ));
            
            alert("Offer accepted! The contract is now ongoing.");
            onOfferUpdated();
            if (onClose) onClose();
            
        } catch (err) {
            alert(`Failed to accept offer: ${err.message}`);
        }
    };

    const handleRejectOffer = async (contractId, messageId) => {
        if (!confirm("Are you sure you want to reject this offer?")) return;
        
        try {
            // Use our organized API service
            await offerApi.rejectOffer(contractId, messageId, token);
            
            // Update the specific message status in local state
            setMessages(prev => prev.map(msg => 
                msg.id === messageId 
                    ? { ...msg, offer_status: 'rejected' }
                    : msg
            ));
            
            alert("Offer rejected.");
            onOfferUpdated();
            
        } catch (err) {
            alert(`Failed to reject offer: ${err.message}`);
        }
    };

    if (loadingHistory) {
        return (
            <div className="bg-white rounded-lg shadow-sm h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
                <span className="ml-2 text-gray-600">Loading chat...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm h-full flex items-center justify-center">
                <div className="text-center text-red-600">
                    <AlertCircle size={32} className="mx-auto mb-2" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="border-b px-4 py-3 flex justify-between items-center bg-gray-50 rounded-t-lg">
                <div>
                    <h2 className="font-bold text-lg text-gray-800">Negotiation Chat</h2>
                    <p className="text-sm text-gray-600">{contract.listing?.crop_type} with {contract.farmer?.full_name}</p>
                </div>
                <button 
                    onClick={() => setShowOfferForm(!showOfferForm)} 
                    className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showOfferForm ? "Cancel" : "Make Offer"}
                </button>
            </div>

            {/* Chat History */}
            <div className="flex-grow p-4 overflow-y-auto space-y-2">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <MessageCircle size={32} className="mx-auto mb-2" />
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        // Check if this is an offer message using utility
                        if (offerUtils.isOfferMessage(msg)) {
                            return (
                                <OfferMessageCard 
                                    key={msg.id || idx}
                                    message={msg}
                                    contract={contract}
                                    onAccept={handleAcceptOffer}
                                    onReject={handleRejectOffer}
                                />
                            );
                        }
                        
                        // Regular text message
                        return (
                            <div key={msg.id || idx} className={`mb-2 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                                    msg.sender_id === user?.id 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-800'
                                }`}>
                                    {msg.message}
                                </div>
                                {msg.timestamp && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {dateUtils.getRelativeTime(msg.timestamp)}
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef}></div>
            </div>

            {/* Offer Form */}
            {showOfferForm && (
                <div className="p-4 border-t bg-yellow-50">
                    <h3 className="font-semibold mb-3 text-gray-800">Make New Offer</h3>
                    <form onSubmit={handleUpdateOffer} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input 
                                type="number" 
                                step="0.01"
                                value={offerPrice} 
                                onChange={(e) => setOfferPrice(e.target.value)}
                                placeholder="Price per unit (₹)" 
                                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input 
                                type="number" 
                                value={offerQuantity} 
                                onChange={(e) => setOfferQuantity(e.target.value)}
                                placeholder="Quantity" 
                                className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button 
                                type="submit" 
                                disabled={isSubmittingOffer || !offerPrice || !offerQuantity}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmittingOffer ? "Submitting..." : "Submit Offer"}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setShowOfferForm(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t flex space-x-2">
                <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-grow border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

// --- Main Page ---
const BuyerContractsPage = () => {
    const [activeTab, setActiveTab] = useState("negotiating");
    const [contracts, setContracts] = useState({ ongoing: [], negotiating: [], rejected: [] });
    const [loading, setLoading] = useState({ ongoing: true, negotiating: true, rejected: true });
    const [error, setError] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const token = useAuthStore((state) => state.token);

    const fetchAllData = useCallback(async () => {
        if (!token) {
            setError("Authentication error. Please log in again.");
            setLoading({ ongoing: false, negotiating: false, rejected: false });
            return;
        }
        
        setError(null);
        try {
            // Use our organized API service with Promise.allSettled for better error handling
            const results = await Promise.allSettled([
                contractApi.fetchContractsByStatus('negotiating', token),
                contractApi.fetchContractsByStatus('ongoing', token),
                contractApi.fetchContractsByStatus('rejected', token)
            ]);

            const [negotiatingResult, ongoingResult, rejectedResult] = results;
            
            setContracts({
                negotiating: negotiatingResult.status === 'fulfilled' ? negotiatingResult.value : [],
                ongoing: ongoingResult.status === 'fulfilled' ? ongoingResult.value : [],
                rejected: rejectedResult.status === 'fulfilled' ? rejectedResult.value : []
            });

            // Log any failed requests
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Failed to fetch contracts for status ${['negotiating', 'ongoing', 'rejected'][index]}:`, result.reason);
                }
            });

        } catch (err) {
            console.error("Error fetching contracts:", err);
            setError(err.message);
        } finally {
            setLoading({ ongoing: false, negotiating: false, rejected: false });
        }
    }, [token]);

    useEffect(() => { 
        fetchAllData(); 
    }, [fetchAllData]);

    const filteredContracts = useMemo(() => {
        const contractsForTab = contracts[activeTab] || [];
        if (!searchTerm) return contractsForTab;

        return contractsForTab.filter(c => {
            const crop = c.listing?.crop_type?.toLowerCase() || "";
            const farmer = c.farmer?.full_name?.toLowerCase() || "";
            const search = searchTerm.toLowerCase();
            return crop.includes(search) || farmer.includes(search);
        });
    }, [contracts, activeTab, searchTerm]);

    const tabs = [
        { key: 'negotiating', title: 'In Negotiation', count: contracts.negotiating.length },
        { key: 'ongoing', title: 'Ongoing', count: contracts.ongoing.length },
        { key: 'rejected', title: 'Rejected', count: contracts.rejected.length }
    ];

    if (error) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="text-center text-red-600">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Error Loading Contracts</h2>
                    <p className="mb-4">{error}</p>
                    <button 
                        onClick={fetchAllData}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Left Column: Contracts List */}
            <aside className="w-full md:w-1/3 max-w-md bg-white border-r flex flex-col">
                <header className="p-4 border-b flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-800">My Contracts</h1>
                    
                    {/* Filter Tabs */}
                    <div className="mt-4 flex space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 text-sm font-semibold py-2 px-2 rounded-md transition-all relative ${
                                    activeTab === tab.key
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tab.title}
                                {tab.count > 0 && (
                                    <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                                        activeTab === tab.key 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-gray-300 text-gray-700'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search by crop or farmer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </header>

                {/* Contract List */}
                <div className="flex-grow overflow-y-auto">
                    {loading[activeTab] ? (
                        <div className="p-4 flex justify-center items-center mt-8">
                            <Loader2 className="animate-spin text-gray-400 mr-2" />
                            <span className="text-gray-600">Loading contracts...</span>
                        </div>
                    ) : filteredContracts.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 mt-8">
                            <Inbox size={32} className="mx-auto mb-2" />
                            <p className="font-medium">No contracts found</p>
                            <p className="text-sm">
                                {searchTerm 
                                    ? `No contracts match "${searchTerm}"` 
                                    : `No contracts in ${activeTab} status`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredContracts.map(contract => {
                                const statusColors = contractStatus.getStatusColor(contract.status);
                                const totalValue = currencyUtils.formatNumber(
                                    (parseFloat(contract.price_per_unit_agreed) || 0) * 
                                    (parseInt(contract.quantity_proposed) || 0)
                                );
                                
                                return (
                                    <div 
                                        key={contract.id}
                                        onClick={() => setSelectedContract(contract)}
                                        className={`p-4 cursor-pointer transition-colors ${
                                            selectedContract?.id === contract.id
                                                ? 'bg-blue-50 border-l-4 border-blue-500' 
                                                : 'bg-white hover:bg-gray-50 border-l-4 border-transparent'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-gray-800">{contract.listing?.crop_type || 'Unknown Crop'}</p>
                                            <span className={`px-2 py-1 text-xs rounded-full ${statusColors.bg} ${statusColors.text}`}>
                                                {contractStatus.getStatusLabel(contract.status)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">with {contract.farmer?.full_name || 'Unknown Farmer'}</p>
                                        <p className="text-sm font-medium text-gray-700">
                                            {currencyUtils.formatINR(contract.price_per_unit_agreed || 0)} × {contract.quantity_proposed || 0} units
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Total: ₹{totalValue}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </aside>

            {/* Right Column: Details or Chat */}
            <main className="flex-1 p-6">
                {!selectedContract ? (
                    <div className="h-full flex items-center justify-center text-center text-gray-500">
                        <div>
                            <FileText size={40} className="mx-auto mb-2" />
                            <p className="text-lg font-medium">Select a contract to view details</p>
                            <p className="text-sm">Choose from the list on the left to get started</p>
                        </div>
                    </div>
                ) : activeTab === 'negotiating' ? (
                    <ChatPanel 
                        contract={selectedContract} 
                        onOfferUpdated={fetchAllData} 
                    />
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
                        <div className="border-b pb-4 mb-6">
                            <h2 className="text-2xl font-bold text-blue-700">{selectedContract.listing?.crop_type}</h2>
                            <p className="text-gray-600 mt-1">Contract with {selectedContract.farmer?.full_name}</p>
                            <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full font-medium ${
                                contractStatus.getStatusColor(selectedContract.status).bg
                            } ${contractStatus.getStatusColor(selectedContract.status).text}`}>
                                {contractStatus.getStatusLabel(selectedContract.status)}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <Info className="mr-2" size={18} /> Contract Details
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Price per unit:</span>
                                        <span className="font-medium">{currencyUtils.formatINR(selectedContract.price_per_unit_agreed || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Quantity:</span>
                                        <span className="font-medium">{selectedContract.quantity_proposed || 0} units</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Value:</span>
                                        <span className="font-bold text-green-600">
                                            {currencyUtils.formatINR(
                                                (parseFloat(selectedContract.price_per_unit_agreed || 0) * 
                                                parseInt(selectedContract.quantity_proposed || 0))
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Terms:</span>
                                        <span className="font-medium">{selectedContract.payment_terms || 'Standard'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">Timeline</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span>{dateUtils.formatDate(selectedContract.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Updated:</span>
                                        <span>{dateUtils.formatDate(selectedContract.updated_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {activeTab === 'ongoing' && (
                            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-800 mb-2">Contract is Active</h4>
                                <p className="text-sm text-green-700">
                                    This contract is currently ongoing. Track milestones and deliverables in the contract management section.
                                </p>
                            </div>
                        )}
                        
                        {activeTab === 'rejected' && (
                            <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
                                <h4 className="font-medium text-red-800 mb-2">Contract Rejected</h4>
                                <p className="text-sm text-red-700">
                                    This contract negotiation was ended. You can review the details above for reference.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BuyerContractsPage;



// // src/buyer_pages/BuyerContractsPage.jsx
// import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// import { useAuthStore } from '../authStore';
// import { 
//     AlertCircle, FileText, MessageCircle, ThumbsDown, Inbox, Loader2, Search, Info, Send, X
// } from "lucide-react";

// // --- API HELPER FUNCTIONS ---

// const fetchContractsByStatus = async (status, token) => {
//     const response = await fetch(`http://localhost:8000/api/contracts/my-contracts?status=${status}`, {
//         headers: { Authorization: `Bearer ${token}` }
//     });
//     if (!response.ok) throw new Error(`Failed to fetch ${status} contracts.`);
//     return await response.json();
// };

// const fetchNegotiationHistory = async (contractId, token) => {
//     const response = await fetch(`http://localhost:8000/api/contracts/${contractId}/negotiation-history`, {
//         headers: { 'Authorization': `Bearer ${token}` },
//     });
//     if (!response.ok) throw new Error("Failed to fetch chat history.");
//     return await response.json();
// };

// const updateOfferApi = async (contractId, offerData, token) => {
//     const response = await fetch(`http://localhost:8000/api/contracts/${contractId}/update-offer`, {
//         method: "PUT",
//         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//         body: JSON.stringify(offerData),
//     });
//     if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err.detail || "Failed to update offer.");
//     }
//     return await response.json();
// };

// const acceptOfferApi = async (contractId, token) => {
//     console.log("Attempting to accept offer for contract:", contractId);
//     console.log("Using token:", token ? "Token present" : "No token");
    
//     const url = `http://localhost:8000/api/contracts/${contractId}/accept-offer`;
//     console.log("Request URL:", url);
    
//     try {
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: { 
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });
        
//         console.log("Response status:", response.status);
//         console.log("Response ok:", response.ok);
        
//         if (!response.ok) {
//             const errorText = await response.text();
//             console.log("Error response text:", errorText);
            
//             let errorMessage;
//             try {
//                 const errorJson = JSON.parse(errorText);
//                 errorMessage = errorJson.detail || errorJson.message || "Failed to accept offer";
//             } catch {
//                 errorMessage = `HTTP ${response.status}: ${errorText || response.statusText}`;
//             }
            
//             throw new Error(errorMessage);
//         }
        
//         const result = await response.json();
//         console.log("Success response:", result);
//         return result;
        
//     } catch (error) {
//         console.error("Accept offer error:", error);
        
//         if (error.name === 'TypeError' && error.message.includes('fetch')) {
//             throw new Error("Cannot connect to server. Please check if the backend is running on localhost:8000");
//         }
        
//         throw error;
//     }
// };

// const rejectOfferApi = async (contractId, token) => {
//     const response = await fetch(`http://localhost:8000/api/contracts/${contractId}/reject-offer`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` }
//     });
//     if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err.detail || "Failed to reject offer.");
//     }
//     return response.json();
// };

// // --- Component for Rendering an Offer in the Chat ---
// const OfferMessageCard = ({ message, contract, onAccept, onReject }) => {
//     const user = useAuthStore((state) => state.user);
//     const isMyTurnToAct = user.id !== message.sender_id;

//     return (
//         <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg my-2 shadow-sm">
//             <p className="font-semibold text-blue-800">{message.message}</p>
//             <div className="mt-3 text-sm text-blue-800 space-y-1">
//                 <p>New Price: <span className="font-bold text-lg">₹{parseFloat(message.proposed_price || 0).toLocaleString('en-IN')}</span></p>
//                 <p>New Quantity: <span className="font-bold text-lg">{message.proposed_quantity || 0} units</span></p>
//             </div>
            
//             {isMyTurnToAct && (
//                 <div className="flex space-x-3 mt-4">
//                     <button 
//                         onClick={() => onAccept(contract.id)}
//                         className="flex-1 bg-green-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-transform hover:scale-105"
//                     >
//                         Accept Offer
//                     </button>
//                     <button 
//                         onClick={() => onReject(contract.id)}
//                         className="flex-1 bg-red-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-transform hover:scale-105"
//                     >
//                         Reject
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// // --- Chat Panel Component ---
// const ChatPanel = ({ contract, onOfferUpdated, onClose }) => {
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [loadingHistory, setLoadingHistory] = useState(true);
//     const [error, setError] = useState(null);
//     const [showOfferForm, setShowOfferForm] = useState(false);
//     const [offerPrice, setOfferPrice] = useState(contract.price_per_unit_agreed || '');
//     const [offerQuantity, setOfferQuantity] = useState(contract.quantity_proposed || '');
//     const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

//     const token = useAuthStore((state) => state.token);
//     const user = useAuthStore((state) => state.user);
//     const socketRef = useRef(null);
//     const chatEndRef = useRef(null);

//     useEffect(() => { 
//         chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
//     }, [messages]);

//     useEffect(() => {
//         if (!user?.id || !contract?.id) return;
        
//         const connect = async () => {
//             try {
//                 const history = await fetchNegotiationHistory(contract.id, token);
//                 setMessages(history || []); 
//                 setLoadingHistory(false);

//                 // Only create WebSocket if we have valid data
//                 if (contract.id && user.id) {
//                     const socket = new WebSocket(`ws://localhost:8000/ws/negotiate/${contract.id}/${user.id}`);
//                     socketRef.current = socket;

//                     socket.onopen = () => console.log("WebSocket connected!");
//                     socket.onclose = () => console.log("WebSocket disconnected.");
//                     socket.onerror = (error) => {
//                         console.error("WebSocket error:", error);
//                         setError("WebSocket connection error.");
//                     };
//                     socket.onmessage = (event) => {
//                         try {
//                             const messageData = JSON.parse(event.data);
//                             setMessages(prev => {
//                                 // Avoid duplicate messages
//                                 if (prev.some(m => m.id === messageData.id)) return prev;
//                                 return [...prev, messageData];
//                             });
//                         } catch (err) {
//                             console.error("Error parsing WebSocket message:", err);
//                         }
//                     };
//                 }
//             } catch (err) { 
//                 console.error("Error connecting to chat:", err);
//                 setError(err.message); 
//                 setLoadingHistory(false); 
//             }
//         };
        
//         connect();
//         return () => { 
//             if (socketRef.current) {
//                 socketRef.current.close(); 
//             }
//         };
//     }, [user, contract, token]);

//     const handleSendMessage = (e) => {
//         e.preventDefault();
//         if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
//             alert("Cannot send message: WebSocket is not connected.");
//             return;
//         }
//         if (newMessage.trim() === '') return;

//         const messagePayload = { message: newMessage };
//         socketRef.current.send(JSON.stringify(messagePayload));
//         setNewMessage('');
//     };

//     const handleUpdateOffer = async (e) => {
//         e.preventDefault();
//         if (!offerPrice || !offerQuantity) {
//             alert("Please enter both price and quantity.");
//             return;
//         }
        
//         setIsSubmittingOffer(true);
//         try {
//             const offerData = {
//                 price_per_unit_agreed: parseFloat(offerPrice),
//                 quantity_proposed: parseInt(offerQuantity),
//             };
//             await updateOfferApi(contract.id, offerData, token);
//             setShowOfferForm(false);
//             setOfferPrice('');
//             setOfferQuantity('');
//             onOfferUpdated();
//         } catch (err) {
//             alert(`Error: ${err.message}`);
//         } finally {
//             setIsSubmittingOffer(false);
//         }
//     };

//     const handleAcceptOffer = async (contractId) => {
//         if (!confirm("Are you sure you want to accept this offer and lock the funds?")) return;
        
//         try {
//             console.log("Starting accept offer process...");
//             const result = await acceptOfferApi(contractId, token);
//             console.log("Accept offer successful:", result);
            
//             alert("Offer accepted! The contract is now ongoing.");
//             onOfferUpdated();
//             if (onClose) onClose();
            
//         } catch (err) {
//             console.error("Accept offer failed:", err);
//             alert(`Failed to accept offer: ${err.message}`);
//         }
//     };

//     const handleRejectOffer = async (contractId) => {
//         if (!confirm("Are you sure you want to reject this offer and end the negotiation?")) return;
//         try {
//             await rejectOfferApi(contractId, token);
//             alert("Offer rejected.");
//             onOfferUpdated();
//             if (onClose) onClose();
//         } catch (err) {
//             alert(`Error: ${err.message}`);
//         }
//     };

//     if (loadingHistory) {
//         return (
//             <div className="bg-white rounded-lg shadow-sm h-full flex items-center justify-center">
//                 <Loader2 className="animate-spin text-gray-400" size={32} />
//                 <span className="ml-2 text-gray-600">Loading chat...</span>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="bg-white rounded-lg shadow-sm h-full flex items-center justify-center">
//                 <div className="text-center text-red-600">
//                     <AlertCircle size={32} className="mx-auto mb-2" />
//                     <p>{error}</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
//             {/* Header */}
//             <div className="border-b px-4 py-3 flex justify-between items-center bg-gray-50 rounded-t-lg">
//                 <div>
//                     <h2 className="font-bold text-lg text-gray-800">Negotiation Chat</h2>
//                     <p className="text-sm text-gray-600">{contract.listing?.crop_type} with {contract.farmer?.full_name}</p>
//                 </div>
//                 <button 
//                     onClick={() => setShowOfferForm(!showOfferForm)} 
//                     className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                     {showOfferForm ? "Cancel" : "Make Offer"}
//                 </button>
//             </div>

//             {/* Chat History */}
//             <div className="flex-grow p-4 overflow-y-auto space-y-2">
//                 {messages.length === 0 ? (
//                     <div className="text-center text-gray-500 mt-8">
//                         <MessageCircle size={32} className="mx-auto mb-2" />
//                         <p>No messages yet. Start the conversation!</p>
//                     </div>
//                 ) : (
//                     messages.map((msg, idx) => {
//                         // Check if this is an offer message
//                         if (msg.message_type === 'offer' || (msg.proposed_price && msg.proposed_quantity)) {
//                             return (
//                                 <OfferMessageCard 
//                                     key={idx}
//                                     message={msg}
//                                     contract={contract}
//                                     onAccept={handleAcceptOffer}
//                                     onReject={handleRejectOffer}
//                                 />
//                             );
//                         }
                        
//                         // Regular text message
//                         return (
//                             <div key={idx} className={`mb-2 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
//                                 <div className={`inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
//                                     msg.sender_id === user?.id 
//                                         ? 'bg-blue-600 text-white' 
//                                         : 'bg-gray-200 text-gray-800'
//                                 }`}>
//                                     {msg.message}
//                                 </div>
//                                 {msg.timestamp && (
//                                     <p className="text-xs text-gray-500 mt-1">
//                                         {new Date(msg.timestamp).toLocaleTimeString()}
//                                     </p>
//                                 )}
//                             </div>
//                         );
//                     })
//                 )}
//                 <div ref={chatEndRef}></div>
//             </div>

//             {/* Offer Form */}
//             {showOfferForm && (
//                 <div className="p-4 border-t bg-yellow-50">
//                     <h3 className="font-semibold mb-3 text-gray-800">Make New Offer</h3>
//                     <form onSubmit={handleUpdateOffer} className="space-y-3">
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                             <input 
//                                 type="number" 
//                                 step="0.01"
//                                 value={offerPrice} 
//                                 onChange={(e) => setOfferPrice(e.target.value)}
//                                 placeholder="Price per unit (₹)" 
//                                 className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
//                                 required
//                             />
//                             <input 
//                                 type="number" 
//                                 value={offerQuantity} 
//                                 onChange={(e) => setOfferQuantity(e.target.value)}
//                                 placeholder="Quantity" 
//                                 className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
//                                 required
//                             />
//                         </div>
//                         <div className="flex space-x-2">
//                             <button 
//                                 type="submit" 
//                                 disabled={isSubmittingOffer || !offerPrice || !offerQuantity}
//                                 className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//                             >
//                                 {isSubmittingOffer ? "Submitting..." : "Submit Offer"}
//                             </button>
//                             <button 
//                                 type="button"
//                                 onClick={() => setShowOfferForm(false)}
//                                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             )}

//             {/* Message Input */}
//             <form onSubmit={handleSendMessage} className="p-4 border-t flex space-x-2">
//                 <input 
//                     type="text" 
//                     value={newMessage} 
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     placeholder="Type a message..." 
//                     className="flex-grow border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button 
//                     type="submit" 
//                     disabled={!newMessage.trim()}
//                     className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//                 >
//                     <Send size={18} />
//                 </button>
//             </form>
//         </div>
//     );
// };

// // --- Contract Card Component for Better Organization ---
// const ContractCard = ({ contract, isSelected, onClick }) => {
//     const totalValue = (parseFloat(contract.price_per_unit_agreed) || 0) * (parseInt(contract.quantity_proposed) || 0);
    
//     return (
//         <div 
//             onClick={onClick}
//             className={`p-4 cursor-pointer transition-colors ${
//                 isSelected
//                     ? 'bg-blue-50 border-l-4 border-blue-500' 
//                     : 'bg-white hover:bg-gray-50 border-l-4 border-transparent'
//             }`}
//         >
//             <div className="flex justify-between items-start mb-2">
//                 <p className="font-bold text-gray-800">{contract.listing?.crop_type || 'Unknown Crop'}</p>
//                 <span className={`px-2 py-1 text-xs rounded-full ${
//                     contract.status === 'ongoing' ? 'bg-green-100 text-green-800' :
//                     contract.status === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
//                     'bg-red-100 text-red-800'
//                 }`}>
//                     {contract.status}
//                 </span>
//             </div>
//             <p className="text-sm text-gray-600 mb-1">with {contract.farmer?.full_name || 'Unknown Farmer'}</p>
//             <p className="text-sm font-medium text-gray-700">
//                 ₹{parseFloat(contract.price_per_unit_agreed || 0).toLocaleString('en-IN')} × {contract.quantity_proposed || 0} units
//             </p>
//             <p className="text-xs text-gray-500 mt-1">
//                 Total: ₹{totalValue.toLocaleString('en-IN')}
//             </p>
//         </div>
//     );
// };

// // --- Main Page ---
// const BuyerContractsPage = () => {
//     const [activeTab, setActiveTab] = useState("negotiating");
//     const [contracts, setContracts] = useState({ ongoing: [], negotiating: [], rejected: [] });
//     const [loading, setLoading] = useState({ ongoing: true, negotiating: true, rejected: true });
//     const [error, setError] = useState(null);
//     const [selectedContract, setSelectedContract] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const token = useAuthStore((state) => state.token);

//     const fetchAllData = useCallback(async () => {
//         if (!token) {
//             setError("Authentication error. Please log in again.");
//             setLoading({ ongoing: false, negotiating: false, rejected: false });
//             return;
//         }
        
//         setError(null);
//         try {
//             const results = await Promise.allSettled([
//                 fetchContractsByStatus('negotiating', token),
//                 fetchContractsByStatus('ongoing', token),
//                 fetchContractsByStatus('rejected', token)
//             ]);

//             const [negotiatingResult, ongoingResult, rejectedResult] = results;
            
//             setContracts({
//                 negotiating: negotiatingResult.status === 'fulfilled' ? negotiatingResult.value : [],
//                 ongoing: ongoingResult.status === 'fulfilled' ? ongoingResult.value : [],
//                 rejected: rejectedResult.status === 'fulfilled' ? rejectedResult.value : []
//             });

//             // Log any failed requests
//             results.forEach((result, index) => {
//                 if (result.status === 'rejected') {
//                     console.error(`Failed to fetch contracts for status ${['negotiating', 'ongoing', 'rejected'][index]}:`, result.reason);
//                 }
//             });

//         } catch (err) {
//             console.error("Error fetching contracts:", err);
//             setError(err.message);
//         } finally {
//             setLoading({ ongoing: false, negotiating: false, rejected: false });
//         }
//     }, [token]);

//     useEffect(() => { 
//         fetchAllData(); 
//     }, [fetchAllData]);

//     const filteredContracts = useMemo(() => {
//         const contractsForTab = contracts[activeTab] || [];
//         if (!searchTerm) return contractsForTab;

//         return contractsForTab.filter(c => {
//             const crop = c.listing?.crop_type?.toLowerCase() || "";
//             const farmer = c.farmer?.full_name?.toLowerCase() || "";
//             const search = searchTerm.toLowerCase();
//             return crop.includes(search) || farmer.includes(search);
//         });
//     }, [contracts, activeTab, searchTerm]);

//     const tabs = [
//         { key: 'negotiating', title: 'In Negotiation', count: contracts.negotiating.length },
//         { key: 'ongoing', title: 'Ongoing', count: contracts.ongoing.length },
//         { key: 'rejected', title: 'Rejected', count: contracts.rejected.length }
//     ];

//     if (error) {
//         return (
//             <div className="flex h-screen bg-gray-50 items-center justify-center">
//                 <div className="text-center text-red-600">
//                     <AlertCircle size={48} className="mx-auto mb-4" />
//                     <h2 className="text-xl font-bold mb-2">Error Loading Contracts</h2>
//                     <p className="mb-4">{error}</p>
//                     <button 
//                         onClick={fetchAllData}
//                         className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//                     >
//                         Retry
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex h-screen bg-gray-50 font-sans">
//             {/* Left Column: Contracts List */}
//             <aside className="w-full md:w-1/3 max-w-md bg-white border-r flex flex-col">
//                 <header className="p-4 border-b flex-shrink-0">
//                     <h1 className="text-xl font-bold text-gray-800">My Contracts</h1>
                    
//                     {/* Filter Tabs */}
//                     <div className="mt-4 flex space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
//                         {tabs.map(tab => (
//                             <button
//                                 key={tab.key}
//                                 onClick={() => setActiveTab(tab.key)}
//                                 className={`flex-1 text-sm font-semibold py-2 px-2 rounded-md transition-all relative ${
//                                     activeTab === tab.key
//                                         ? 'bg-blue-600 text-white'
//                                         : 'text-gray-600 hover:bg-gray-200'
//                                 }`}
//                             >
//                                 {tab.title}
//                                 {tab.count > 0 && (
//                                     <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
//                                         activeTab === tab.key 
//                                             ? 'bg-blue-500 text-white' 
//                                             : 'bg-gray-300 text-gray-700'
//                                     }`}>
//                                         {tab.count}
//                                     </span>
//                                 )}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Search Bar */}
//                     <div className="relative mt-4">
//                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//                         <input 
//                             type="text"
//                             placeholder="Search by crop or farmer..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                         {searchTerm && (
//                             <button
//                                 onClick={() => setSearchTerm('')}
//                                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                             >
//                                 <X size={16} />
//                             </button>
//                         )}
//                     </div>
//                 </header>

//                 {/* Contract List */}
//                 <div className="flex-grow overflow-y-auto">
//                     {loading[activeTab] ? (
//                         <div className="p-4 flex justify-center items-center mt-8">
//                             <Loader2 className="animate-spin text-gray-400 mr-2" />
//                             <span className="text-gray-600">Loading contracts...</span>
//                         </div>
//                     ) : filteredContracts.length === 0 ? (
//                         <div className="p-6 text-center text-gray-500 mt-8">
//                             <Inbox size={32} className="mx-auto mb-2" />
//                             <p className="font-medium">No contracts found</p>
//                             <p className="text-sm">
//                                 {searchTerm 
//                                     ? `No contracts match "${searchTerm}"` 
//                                     : `No contracts in ${activeTab} status`
//                                 }
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="divide-y divide-gray-200">
//                             {filteredContracts.map(contract => (
//                                 <ContractCard
//                                     key={contract.id}
//                                     contract={contract}
//                                     isSelected={selectedContract?.id === contract.id}
//                                     onClick={() => setSelectedContract(contract)}
//                                 />
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </aside>

//             {/* Right Column: Details or Chat */}
//             <main className="flex-1 p-6">
//                 {!selectedContract ? (
//                     <div className="h-full flex items-center justify-center text-center text-gray-500">
//                         <div>
//                             <FileText size={40} className="mx-auto mb-2" />
//                             <p className="text-lg font-medium">Select a contract to view details</p>
//                             <p className="text-sm">Choose from the list on the left to get started</p>
//                         </div>
//                     </div>
//                 ) : activeTab === 'negotiating' ? (
//                     <ChatPanel 
//                         contract={selectedContract} 
//                         onOfferUpdated={fetchAllData} 
//                     />
//                 ) : (
//                     <div className="bg-white p-6 rounded-lg shadow-sm h-full">
//                         <div className="border-b pb-4 mb-6">
//                             <h2 className="text-2xl font-bold text-blue-700">{selectedContract.listing?.crop_type}</h2>
//                             <p className="text-gray-600 mt-1">Contract with {selectedContract.farmer?.full_name}</p>
//                             <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full font-medium ${
//                                 selectedContract.status === 'ongoing' ? 'bg-green-100 text-green-800' :
//                                 selectedContract.status === 'rejected' ? 'bg-red-100 text-red-800' :
//                                 'bg-yellow-100 text-yellow-800'
//                             }`}>
//                                 {selectedContract.status === 'ongoing' ? 'Contract Active' :
//                                  selectedContract.status === 'rejected' ? 'Contract Rejected' :
//                                  'In Negotiation'}
//                             </span>
//                         </div>
                        
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div>
//                                 <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
//                                     <Info className="mr-2" size={18} /> Contract Details
//                                 </h3>
//                                 <div className="space-y-2 text-sm">
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-600">Price per unit:</span>
//                                         <span className="font-medium">₹{parseFloat(selectedContract.price_per_unit_agreed || 0).toLocaleString('en-IN')}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-600">Quantity:</span>
//                                         <span className="font-medium">{selectedContract.quantity_proposed || 0} units</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-600">Total Value:</span>
//                                         <span className="font-bold text-green-600">
//                                             ₹{((parseFloat(selectedContract.price_per_unit_agreed || 0) * parseInt(selectedContract.quantity_proposed || 0))).toLocaleString('en-IN')}
//                                         </span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-600">Payment Terms:</span>
//                                         <span className="font-medium">{selectedContract.payment_terms || 'Standard'}</span>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <div>
//                                 <h3 className="font-semibold text-gray-800 mb-3">Timeline</h3>
//                                 <div className="space-y-2 text-sm">
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-600">Created:</span>
//                                         <span>{new Date(selectedContract.created_at).toLocaleDateString()}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-600">Last Updated:</span>
//                                         <span>{new Date(selectedContract.updated_at).toLocaleDateString()}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
                        
//                         {activeTab === 'ongoing' && (
//                             <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
//                                 <h4 className="font-medium text-green-800 mb-2">Contract is Active</h4>
//                                 <p className="text-sm text-green-700">
//                                     This contract is currently ongoing. Track milestones and deliverables in the contract management section.
//                                 </p>
//                             </div>
//                         )}
                        
//                         {activeTab === 'rejected' && (
//                             <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
//                                 <h4 className="font-medium text-red-800 mb-2">Contract Rejected</h4>
//                                 <p className="text-sm text-red-700">
//                                     This contract negotiation was ended. You can review the details above for reference.
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </main>
//         </div>
//     );
// };

// export default BuyerContractsPage;