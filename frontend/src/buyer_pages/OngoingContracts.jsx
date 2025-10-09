// src/buyer_pages/BuyerContractsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../authStore';
import { 
    AlertCircle, FileText, MessageCircle, ThumbsDown, Inbox, Loader2 
} from "lucide-react";
import NegotiationChatModal from '../farmer_business_components/NegotiationChatModal';
import { API_BASE_URL } from "../api/apiConfig";

const BuyerContractsPage = () => {
    const [activeTab, setActiveTab] = useState("negotiating");
    const [contracts, setContracts] = useState({ ongoing: [], negotiating: [], rejected: [] });
    const [loading, setLoading] = useState({ ongoing: true, negotiating: true, rejected: true });
    const [error, setError] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [selectedNegotiation, setSelectedNegotiation] = useState(null);
    const token = useAuthStore((state) => state.token);

    // Add these to your API helper section
    const acceptOfferApi = async (contractId, token) => {
        const response = await fetch(`${API_BASE_URL}/api/contracts/${contractId}/accept-offer`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to accept offer.");
        return response.json();
    };

    const rejectOfferApi = async (contractId, token) => {
        const response = await fetch(`${API_BASE_URL}/api/contracts/${contractId}/reject-offer`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to reject offer.");
        return response.json();
    };

    const fetchAllData = useCallback(async () => {
        if (!token) {
            setError("Authentication error. Please log in again.");
            setLoading({ ongoing: false, negotiating: false, rejected: false });
            return;
        }

        const statusesToFetch = ['negotiating', 'ongoing', 'rejected'];
        try {
            const results = await Promise.all(statusesToFetch.map(async (status) => {
                const url = `${API_BASE_URL}/api/contracts/my-contracts?status=${status}`;
                const headers = { 'Authorization': `Bearer ${token}` };
                const response = await fetch(url, { headers });
                if (!response.ok) throw new Error(`Failed to fetch ${status} contracts. Status: ${response.status}`);
                return await response.json();
            }));

            const [negotiatingData, ongoingData, rejectedData] = results;
            setContracts({
                negotiating: negotiatingData,
                ongoing: ongoingData,
                rejected: rejectedData,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading({ ongoing: false, negotiating: false, rejected: false });
        }
    }, [token]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const tabs = [
        { key: 'negotiating', title: 'In Negotiation', icon: <MessageCircle size={18} />, data: contracts.negotiating, color: 'blue' },
        { key: 'ongoing', title: 'Ongoing Contracts', icon: <FileText size={18} />, data: contracts.ongoing, color: 'green' },
        { key: 'rejected', title: 'Rejected Proposals', icon: <ThumbsDown size={18} />, data: contracts.rejected, color: 'red' }
    ];

    const currentTabData = contracts[activeTab];
    const currentLoading = loading[activeTab];

    // A new, smarter card for the negotiation tab
const NegotiationCard = ({ contract, onChatClick }) => {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    
    // Determine the state from the buyer's perspective
    const isMyTurn = contract.last_offer_by === 'farmer';

    const handleAccept = async () => {
        if (!confirm("Are you sure you want to accept these new terms and lock the funds?")) return;
        try {
            await acceptOfferApi(contract.id, token);
            alert("Offer accepted! The contract is now ongoing.");
            // Add a callback to refresh the page data
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleReject = async () => {
        if (!confirm("Are you sure you want to reject this offer and end the negotiation?")) return;
        try {
            await rejectOfferApi(contract.id, token);
            alert("Offer rejected.");
            // Add a callback to refresh the page data
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };
    return (
        <div className={`p-4 bg-white rounded-lg shadow-sm border-l-4 ${isMyTurn ? 'border-green-500' : 'border-yellow-500'}`}>
            <div>
                <h3 className="font-bold text-lg text-blue-700">{contract.listing?.crop_type}</h3>
                <p className="text-sm text-gray-500">with {contract.farmer?.full_name}</p>
            </div>
            <div className="mt-4 border-t pt-4">
                {isMyTurn ? (
                    <div>
                        <p className="text-sm font-semibold text-green-700 mb-3">New offer received from farmer. Please review.</p>
                        <div className="flex space-x-2">
                            <button onClick={handleAccept} className="flex-1 bg-green-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-green-700">Accept</button>
                            <button onClick={handleReject} className="flex-1 bg-red-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-red-700">Reject</button>
                            <button onClick={() => onChatClick(contract)} className="flex-1 bg-gray-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-gray-700">Re-Negotiate</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm font-semibold text-yellow-700 mb-3">Waiting for farmer to respond to your offer...</p>
                        <button onClick={() => onChatClick(contract)} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Open Chat</button>
                    </div>
                )}
            </div>
        </div>
    );
};

    return (
        <div className="space-y-6 bg-gray-50 p-4 md:p-8 min-h-screen">
            {selectedNegotiation && 
                <NegotiationChatModal 
                    proposal={selectedNegotiation} 
                    onClose={() => setSelectedNegotiation(null)} 
                    onOfferUpdated={fetchAllData} 
                />
            }

            <header>
                <h1 className="text-3xl font-bold text-gray-900">Your Contracts</h1>
                <p className="text-gray-600 mt-1">Manage all your agricultural agreements in one place.</p>
            </header>

            {error && (
               <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-lg">
                 <AlertCircle size={24} className="mr-3 flex-shrink-0" />
                 <div><p className="font-semibold">An Error Occurred</p><p className="text-sm">{error}</p></div>
               </div>
            )}
            
            {/* Tabs */}
            <div className="bg-white p-2 rounded-lg shadow-sm flex flex-col sm:flex-row">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key); setSelectedContract(null); }}
                        className={`flex-1 flex items-center justify-center p-3 rounded-md text-sm font-semibold border-2 ${
                            activeTab === tab.key
                                ? `bg-${tab.color}-600 text-white border-${tab.color}-600`
                                : `text-gray-600 hover:bg-gray-100 border-transparent`
                        }`}
                    >
                        {tab.icon}
                        <span className="ml-2">{tab.title}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                            {loading[tab.key] ? '...' : tab.data.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="mt-6">
                {currentLoading ? (
                    <div className="flex justify-center items-center p-16"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
                ) : (
                    // <div className="space-y-3">
                    //     {currentTabData.length === 0 && <div className="text-center py-10 text-gray-500"><Inbox size={32} className="mx-auto mb-2" /><p>No contracts in this category.</p></div>}
                    //     {currentTabData.map((contract) => (
                    //         <div key={contract.id} className="p-4 bg-white rounded-lg shadow-sm border flex justify-between items-center">
                    //             <div>
                    //                 <h3 className={`font-bold text-lg text-${tabs.find(t=>t.key===activeTab).color}-700`}>{contract.listing?.crop_type || 'N/A'}</h3>
                    //                 <p className="text-sm text-gray-500">with {contract.farmer?.full_name || 'N/A'}</p>
                    //             </div>
                    //             {activeTab === 'negotiating' && (
                    //                 <button onClick={() => setSelectedNegotiation(contract)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Open Chat</button>
                    //             )}
                    //         </div>
                    //     ))}
                    // </div>

                    <div className="space-y-3">
                    {contracts[activeTab].length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <Inbox size={32} className="mx-auto mb-2" />
                            <p>No contracts in this category.</p>
                        </div>
                    ) : (
                        // --- THIS IS THE LOGIC YOU ASKED FOR ---
                        // It maps over the array corresponding to the active tab.
                        contracts[activeTab].map((contract) => {
                            
                            // If the tab is 'negotiating', use the NegotiationCard.
                            if (activeTab === 'negotiating') {
                                return (
                                    <NegotiationCard 
                                        key={contract.id} 
                                        contract={contract} 
                                        onChatClick={setSelectedNegotiation} 
                                    />
                                );
                            }

                            // If the tab is 'ongoing', use a different card (example).
                            if (activeTab === 'ongoing') {
                                return (
                                    <div key={contract.id} className="p-4 bg-white rounded-lg shadow-sm border">
                                        <h3 className="font-bold">{contract.crop}</h3>
                                        <p className="text-sm text-gray-500">with {contract.farmer}</p>
                                    </div>
                                );
                            }

                            // Add other cases for 'rejected', etc.
                            return null;
                        })
                        // --- END OF THE RELEVANT LOGIC ---
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

export default BuyerContractsPage;


// // src/buyer_pages/BuyerContractsPage.jsx (Complete with Full UI and Debugging)

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { useAuthStore } from '../authStore';
// import { 
//     ArrowLeft, CheckCircle, ShieldCheck, MessageSquare, X, ImageIcon, HardDriveUpload, CalendarDays, 
//     Loader2, AlertCircle, FileText, MessageCircle, ThumbsDown, Send, Handshake, Inbox 
// } from "lucide-react";
// import {updateOfferApi, NegotiationChatModal } from '../farmer_components/NegotiationChatModal'; // Assume you have these helpers in a central file

// // --- CHAT MODAL COMPONENT (with debugging in handleSendMessage) ---
// function NegotiationChatModal({ proposal, onClose, onOfferUpdated }) {
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [loadingHistory, setLoadingHistory] = useState(true);
//     const [error, setError] = useState(null);
//     const [showOfferForm, setShowOfferForm] = useState(false);
//     const [offerPrice, setOfferPrice] = useState(proposal.rawPrice || '');
//     const [offerQuantity, setOfferQuantity] = useState(proposal.rawQuantity || '');
//     const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

//     const token = useAuthStore((state) => state.token);
//     const user = useAuthStore((state) => state.user);
    
//     const socketRef = useRef(null);
//     const chatEndRef = useRef(null);

//     useEffect(() => {
//         chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     useEffect(() => {
//         if (!user?.id || !proposal?.id) return;

//         const connect = async () => {
//             try {
//                 const history = await fetchNegotiationHistory(proposal.id, token);
//                 setMessages(history);
//                 setLoadingHistory(false);

//                 const socket = new WebSocket(`ws://localhost:8000/ws/negotiate/${proposal.id}/${user.id}`);
//                 socketRef.current = socket;

//                 socket.onopen = () => console.log("WebSocket connected!");
//                 socket.onclose = () => console.log("WebSocket disconnected.");
//                 socket.onerror = () => setError("WebSocket connection error.");
//                 socket.onmessage = (event) => {
//                     const messageData = JSON.parse(event.data);
//                     setMessages(prev => [...prev, messageData]);
//                 };
//             } catch (err) {
//                 setError(err.message);
//                 setLoadingHistory(false);
//             }
//         };
//         connect();

//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.close();
//                 socketRef.current = null;
//             }
//         };
//     }, [user, proposal, token]);

//     const handleSendMessage = (e) => {
//         e.preventDefault();
//         console.log("Attempting to send message...");

//         if (!socketRef.current) {
//             console.error("Send failed: WebSocket reference is null. The connection was likely never established.");
//             alert("Error: Connection not initialized.");
//             return;
//         }

//         console.log("WebSocket Ready State:", socketRef.current.readyState, "(0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)");

//         if (newMessage.trim() === '') {
//             console.warn("Send stopped: Message is empty.");
//             return;
//         }

//         if (socketRef.current.readyState !== WebSocket.OPEN) {
//             console.error("Send failed: WebSocket is not in OPEN state.");
//             alert("Cannot send message: The connection is not active. Please wait or refresh the page.");
//             return;
//         }
        
//         console.log("Connection is OPEN. Sending message:", newMessage);
//         const messagePayload = { message: newMessage };
//         socketRef.current.send(JSON.stringify(messagePayload));
//         setNewMessage('');
//     };
    
//     const handleUpdateOffer = async (e) => {
//         e.preventDefault();
//         setIsSubmittingOffer(true);
//         try {
//             await updateOfferApi(proposal.id, {
//                 price_per_unit_agreed: parseFloat(offerPrice),
//                 quantity_proposed: parseInt(offerQuantity),
//             }, token);
//             setShowOfferForm(false);
//             onOfferUpdated();
//         } catch (err) {
//             alert(`Error: ${err.message}`);
//         } finally {
//             setIsSubmittingOffer(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] md:h-[70vh] flex flex-col">
//                 <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
//                     <div>
//                         <h2 className="text-xl font-semibold text-gray-800">Negotiating with {proposal.buyerName}</h2>
//                         <p className="text-sm text-gray-500">For listing: {proposal.cropType}</p>
//                     </div>
//                     <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
//                 </header>
//                 <div className="p-4 flex-grow overflow-y-auto bg-gray-50 space-y-4">
//                     {loadingHistory && <div className="text-center"><Loader2 className="animate-spin inline-block" /></div>}
//                     {error && <div className="text-center text-red-600 p-4 bg-red-50 rounded-md">{error}</div>}
//                     {!loadingHistory && messages.map((msg, index) => (
//                         <div key={index} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
//                             <div className={`max-w-md p-3 rounded-lg ${msg.sender_id === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
//                                 <p className="text-sm">{msg.message}</p>
//                                 <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
//                             </div>
//                         </div>
//                     ))}
//                     <div ref={chatEndRef} />
//                 </div>
//                 <footer className="p-4 border-t bg-white flex-shrink-0 space-y-3">
//                     {showOfferForm && (
//                         <form onSubmit={handleUpdateOffer} className="p-4 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600">New Price (per unit)</label>
//                                 <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600">New Quantity</label>
//                                 <input type="number" value={offerQuantity} onChange={e => setOfferQuantity(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required />
//                             </div>
//                             <button type="submit" disabled={isSubmittingOffer} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center">
//                                 {isSubmittingOffer ? <Loader2 className="animate-spin" /> : "Send New Offer"}
//                             </button>
//                         </form>
//                     )}
//                     <div className="flex items-center space-x-3">
//                         <button onClick={() => setShowOfferForm(!showOfferForm)} className="p-2 border rounded-md hover:bg-gray-100" title="Update Offer"><Handshake size={20} className="text-gray-600" /></button>
//                         <form onSubmit={handleSendMessage} className="flex-grow flex items-center">
//                             <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500" />
//                             <button type="submit" className="p-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"><Send size={20} /></button>
//                         </form>
//                     </div>
//                 </footer>
//             </div>
//         </div>
//     );
// }

// // --- Other Helper Components ---
// const ProgressBar = ({ value, max, colorClass, label }) => { /* ... */ };
// const ImageModal = ({ src, onClose }) => { /* ... */ };
// const EscrowSummary = ({ contract }) => { /* ... */ };
// const VerticalMilestoneTracker = ({ milestones, onReleasePayment, submittingMilestoneId }) => { /* ... */ };

// // --- Main Page Component ---
// const BuyerContractsPage = () => {
//     const [activeTab, setActiveTab] = useState("negotiating");
//     const [contracts, setContracts] = useState({ ongoing: [], negotiating: [], rejected: [] });
//     const [loading, setLoading] = useState({ ongoing: true, negotiating: true, rejected: true });
//     const [error, setError] = useState(null);
//     const [selectedContract, setSelectedContract] = useState(null);
//     const [modalImage, setModalImage] = useState(null);
//     const [submittingMilestoneId, setSubmittingMilestoneId] = useState(null);
//     const [selectedNegotiation, setSelectedNegotiation] = useState(null);
//     const token = useAuthStore((state) => state.token);

//     const fetchAllData = useCallback(async () => {
//         if (!token) {
//             setError("Authentication error. Please log in again.");
//             setLoading({ ongoing: false, negotiating: false, rejected: false });
//             return;
//         }

//         const statusesToFetch = ['negotiating', 'ongoing', 'rejected'];
//         try {
//             const results = await Promise.all(statusesToFetch.map(async (status) => {
//                 const url = `${API_BASE_URL}/api/contracts/my-contracts?status=${status}`;
//                 const headers = { 'Authorization': `Bearer ${token}` };
//                 const response = await fetch(url, { headers });
//                 if (!response.ok) throw new Error(`Failed to fetch ${status} contracts. Status: ${response.status}`);
//                 return await response.json();
//             }));

//             const [negotiatingData, ongoingData, rejectedData] = results;
//             setContracts({
//                 negotiating: negotiatingData,
//                 ongoing: ongoingData,
//                 rejected: rejectedData,
//             });
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading({ ongoing: false, negotiating: false, rejected: false });
//         }
//     }, [token]);

//     useEffect(() => {
//         fetchAllData();
//     }, [fetchAllData]);
    
//     // ... (handleReleasePayment logic if needed for ongoing contracts)

//     const tabs = [
//         { key: 'negotiating', title: 'In Negotiation', icon: <MessageCircle size={18} />, data: contracts.negotiating, color: 'blue' },
//         { key: 'ongoing', title: 'Ongoing Contracts', icon: <FileText size={18} />, data: contracts.ongoing, color: 'green' },
//         { key: 'rejected', title: 'Rejected Proposals', icon: <ThumbsDown size={18} />, data: contracts.rejected, color: 'red' }
//     ];

//     const currentTabData = contracts[activeTab];
//     const currentLoading = loading[activeTab];
//     const currentContract = (activeTab === 'ongoing' && selectedContract) ? contracts.ongoing.find(c => c.id === selectedContract.id) : null;

//     return (
//         <div className="space-y-6 bg-gray-50 p-4 md:p-8 min-h-screen">
//             {modalImage && <ImageModal src={modalImage} onClose={() => setModalImage(null)} />}
//             {selectedNegotiation && 
//                 <NegotiationChatModal 
//                     proposal={selectedNegotiation} 
//                     onClose={() => setSelectedNegotiation(null)} 
//                     onOfferUpdated={fetchAllData} 
//                 />
//             }
            
//             <header>
//                 <h1 className="text-3xl font-bold text-gray-900">Your Contracts</h1>
//                 <p className="text-gray-600 mt-1">Manage all your agricultural agreements in one place.</p>
//             </header>

//             {error && (
//                <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-lg">
//                  <AlertCircle size={24} className="mr-3 flex-shrink-0" />
//                  <div><p className="font-semibold">An Error Occurred</p><p className="text-sm">{error}</p></div>
//                </div>
//             )}
            
//             {/* Tab Navigation */}
//             <div className="bg-white p-2 rounded-lg shadow-sm flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
//                 {tabs.map(tab => (
//                     <button
//                         key={tab.key}
//                         onClick={() => { setActiveTab(tab.key); setSelectedContract(null); }}
//                         className={`flex-1 flex items-center justify-center p-3 rounded-md text-sm font-semibold transition-all duration-200 border-2 ${
//                             activeTab === tab.key
//                                 ? `bg-${tab.color}-600 text-white border-${tab.color}-600 shadow-lg`
//                                 : `text-gray-600 hover:bg-gray-100 border-transparent`
//                         }`}
//                     >
//                         {tab.icon}
//                         <span className="ml-2">{tab.title}</span>
//                         <span className={`ml-2 px-2 py-0.5 rounded-full text-xs transition-colors ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
//                             {loading[tab.key] ? '...' : tab.data.length}
//                         </span>
//                     </button>
//                 ))}
//             </div>

//             {/* Content Area */}
//             <div className="mt-6">
//                 {currentLoading ? (
//                     <div className="flex justify-center items-center p-16"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
//                 ) : (
//                     activeTab === 'ongoing' && !currentContract ? (
//                         // Ongoing List View
//                         <div className="space-y-3">
//                            {/* ... JSX for ongoing list ... */}
//                         </div>
//                     ) : activeTab === 'ongoing' && currentContract ? (
//                         // Ongoing Detail View
//                         <div>
//                            {/* ... JSX for ongoing detail ... */}
//                         </div>
//                     ) : (
//                         // Negotiating and Rejected List View
//                         <div className="space-y-3">
//                             {currentTabData.length === 0 && <div className="text-center py-10 text-gray-500"><Inbox size={32} className="mx-auto mb-2" /><p>No contracts in this category.</p></div>}
//                             {currentTabData.map((contract) => (
//                                 <div key={contract.id} className="p-4 bg-white rounded-lg shadow-sm border flex justify-between items-center">
//                                     <div>
//                                         <h3 className={`font-bold text-lg text-${tabs.find(t=>t.key===activeTab).color}-700`}>{contract.listing?.crop_type || 'N/A'}</h3>
//                                         <p className="text-sm text-gray-500">with {contract.farmer?.full_name || 'N/A'}</p>
//                                     </div>
//                                     {activeTab === 'negotiating' && (
//                                         <button onClick={() => setSelectedNegotiation(contract)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Open Chat</button>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     )
//                 )}
//             </div>
//         </div>
//     );
// };

// export default BuyerContractsPage;