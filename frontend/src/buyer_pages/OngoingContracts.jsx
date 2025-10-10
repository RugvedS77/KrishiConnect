import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  MessageSquare,
  X,
  XCircle, // New icon for rejection details
  ImageIcon,
  HardDriveUpload,
  CalendarDays,
  FileText,
  Loader2,
  AlertCircle,
  ThumbsDown,
  Inbox,
} from "lucide-react";
import { useAuthStore } from "../authStore";
import NegotiationChatModal from "../farmer_business_components/NegotiationChatModal";
import { API_BASE_URL } from "../api/apiConfig";

// --- HELPER COMPONENTS (Unchanged) ---

const ProgressBar = ({ value, max, colorClass, label }) => {
  const widthPercentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <p className="text-xs text-gray-500">
          ₹{parseFloat(value).toLocaleString("en-IN")} / ₹
          {parseFloat(max).toLocaleString("en-IN")}
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
        <div
          className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${widthPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const ImageModal = ({ src, onClose }) => (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors z-10">
      <X size={24} />
    </button>
    <img
      src={src}
      alt="Enlarged update"
      className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const EscrowSummary = ({ contract }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold flex items-center mb-4 text-gray-800">
      <ShieldCheck size={20} className="mr-2 text-green-600" />
      Escrow Summary
    </h3>
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500">Total Contract Value</p>
        <p className="text-3xl font-bold text-gray-900">
          ₹{parseFloat(contract.totalValue).toLocaleString("en-IN")}
        </p>
      </div>
      <ProgressBar
        value={contract.escrowAmount}
        max={contract.totalValue}
        colorClass="bg-yellow-400"
        label="Funds Locked in Escrow"
      />
      <ProgressBar
        value={contract.amountPaid}
        max={contract.totalValue}
        colorClass="bg-green-500"
        label="Paid to Farmer"
      />
    </div>
  </div>
);

const VerticalMilestoneTracker = ({ milestones, onReleasePayment, submittingMilestoneId }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800">Milestone Progress</h3>
    <div className="mt-6">
      <ul className="relative space-y-8">
        <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>
        {milestones.map((m) => {
          const isDone = m.done;
          const isPaid = m.paid;
          const isReadyForPayment = isDone && !isPaid;
          const isLoading = submittingMilestoneId === m.id;
          let circleClass = "bg-gray-300";
          if (isDone) circleClass = "bg-green-500";
          return (
            <li key={m.id} className="flex items-start space-x-4">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${circleClass} ${
                  isReadyForPayment && !isLoading ? "animate-pulse" : ""
                }`}
              >
                {isDone && <CheckCircle size={16} className="text-white" />}
              </div>
              <div className="flex-1 -mt-1">
                <p className={`font-medium ${isDone ? "text-gray-800" : "text-gray-500"}`}>
                  {m.name}
                </p>
                <p className={`text-sm ${isPaid ? "text-green-600 font-semibold" : "text-gray-500"}`}>
                  ₹{parseFloat(m.amount).toLocaleString("en-IN")} {isPaid && "(Paid)"}
                </p>
                {isReadyForPayment && (
                  <button
                    onClick={() => onReleasePayment(m.id)}
                    disabled={isLoading}
                    className="mt-2 bg-blue-600 text-white text-xs font-bold py-1.5 px-4 rounded-full hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-300 flex items-center justify-center w-[140px]"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Release Payment'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);


// --- MAIN UNIFIED COMPONENT ---
const BuyerContractsPage = () => {
  const [activeTab, setActiveTab] = useState("negotiating");
  const [contracts, setContracts] = useState({ ongoing: [], negotiating: [], rejected: [] });
  const [loading, setLoading] = useState({ ongoing: true, negotiating: true, rejected: true });
  const [error, setError] = useState(null);
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedRejectedContract, setSelectedRejectedContract] = useState(null); // New state for rejected detail view
  const [modalImage, setModalImage] = useState(null);
  const [submittingMilestoneId, setSubmittingMilestoneId] = useState(null);

  const token = useAuthStore((state) => state.token);

  const fetchAllData = useCallback(async () => {
    // ... (fetchAllData remains the same as before)
    if (!token) {
      setError("Authentication error. Please log in again.");
      setLoading({ ongoing: false, negotiating: false, rejected: false });
      return;
    }
    setLoading({ ongoing: true, negotiating: true, rejected: true });
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const negotiatingPromise = fetch(`${API_BASE_URL}/api/contracts/my-contracts?status=negotiating`, { headers });
      const ongoingPromise = fetch(`${API_BASE_URL}/api/contracts/ongoing`, { headers });
      const rejectedPromise = fetch(`${API_BASE_URL}/api/contracts/my-contracts?status=rejected`, { headers });

      const responses = await Promise.all([negotiatingPromise, ongoingPromise, rejectedPromise]);

      for (const response of responses) {
        if (!response.ok) {
          throw new Error(`Failed to fetch contracts. Status: ${response.status}`);
        }
      }

      const [negotiatingData, ongoingRawData, rejectedData] = await Promise.all(responses.map(res => res.json()));

      const formattedOngoingContracts = ongoingRawData.map((item) => ({
        id: item.id,
        crop: item.listing.crop_type,
        farmer: item.farmer.full_name,
        totalValue: parseFloat(item.total_value),
        escrowAmount: parseFloat(item.escrow_amount),
        amountPaid: parseFloat(item.amount_paid),
        delivery: new Date(item.listing.harvest_date).toLocaleDateString("en-IN"),
        milestones: item.milestones
          .map((m) => ({
            id: m.id,
            name: m.name,
            amount: parseFloat(m.amount),
            done: m.is_complete,
            paid: m.payment_released,
            update_text: m.update_text,
            image_url: m.image_url,
            created_at: m.created_at,
          }))
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      }));

      setContracts({
        negotiating: negotiatingData,
        ongoing: formattedOngoingContracts,
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

  // --- Logic remains the same ---
  const handleAccept = async (contractId) => {
    if (!confirm("Are you sure you want to accept these terms?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/contracts/${contractId}/accept-offer`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      alert("Offer accepted! The contract is now ongoing.");
      fetchAllData();
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const handleReject = async (contractId) => {
    if (!confirm("Are you sure you want to reject this offer?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/contracts/${contractId}/reject-offer`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      alert("Offer rejected.");
      fetchAllData();
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const handleReleasePayment = async (milestoneId) => {
    setSubmittingMilestoneId(milestoneId);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/milestones/${milestoneId}/release-payment`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error((await response.json()).detail || "Payment release failed");
      
      alert("Payment released successfully!");
      await fetchAllData();
      setSelectedContract(null);
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingMilestoneId(null);
    }
  };

  const tabs = [
    { key: 'negotiating', title: 'In Negotiation', icon: <MessageSquare size={18} />, color: 'blue' },
    { key: 'ongoing', title: 'Ongoing Contracts', icon: <FileText size={18} />, color: 'green' },
    { key: 'rejected', title: 'Rejected Proposals', icon: <ThumbsDown size={18} />, color: 'red' }
  ];

  const currentTabData = contracts[activeTab];
  const currentLoading = loading[activeTab];
  const currentDetailedContract = selectedContract ? contracts.ongoing.find(c => c.id === selectedContract.id) : null;

  return (
    <div className="space-y-6 bg-gray-50 p-4 md:p-8 min-h-screen">
      {modalImage && <ImageModal src={modalImage} onClose={() => setModalImage(null)} />}
      {selectedNegotiation && (
        <NegotiationChatModal
          proposal={selectedNegotiation}
          onClose={() => setSelectedNegotiation(null)}
          onOfferUpdated={fetchAllData}
        />
      )}

      <header>
        <h1 className="text-3xl font-bold text-gray-900">Your Contracts</h1>
        <p className="text-gray-600 mt-1">Manage all your agricultural agreements in one place.</p>
      </header>

      {error && (
        <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-lg shadow-sm">
          <AlertCircle size={24} className="mr-3 flex-shrink-0" />
          <div><p className="font-semibold">An Error Occurred</p><p className="text-sm">{error}</p></div>
        </div>
      )}

      <div className="bg-white p-2 rounded-lg shadow-sm flex flex-col sm:flex-row">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => {
                setActiveTab(tab.key);
                setSelectedContract(null);
                setSelectedRejectedContract(null); // Reset rejected detail view on tab change
            }}
            className={`flex-1 flex items-center justify-center p-3 rounded-md text-sm font-semibold border-2 transition-colors duration-200 ${
              activeTab === tab.key
                ? `bg-${tab.color}-600 text-white border-${tab.color}-600`
                : `text-gray-600 hover:bg-gray-100 border-transparent`
            }`}
          >
            {tab.icon}
            <span className="ml-2">{tab.title}</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {loading[tab.key] ? '...' : contracts[tab.key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {currentLoading ? (
          <div className="flex justify-center items-center p-16">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : (
          <div>
            {/* Ongoing Tab Logic */}
            {activeTab === 'ongoing' && (
              currentDetailedContract ? (
                <div>
                  <button onClick={() => setSelectedContract(null)} className="flex items-center text-green-700 font-semibold hover:underline mb-4">
                    <ArrowLeft size={18} className="mr-1" /> Back to All Contracts
                  </button>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-3xl font-bold text-gray-900">{currentDetailedContract.crop}</h2>
                        <p className="text-lg text-gray-600">with {currentDetailedContract.farmer}</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold flex items-center text-gray-800">
                          <MessageSquare size={18} className="mr-2 text-green-600" /> Farmer Updates & Milestones
                        </h3>
                        <div className="mt-4 relative space-y-6">
                          <div className="absolute left-3 top-2 h-[calc(100%-1rem)] w-0.5 bg-gray-200 z-0"></div>
                          {currentDetailedContract.milestones.filter(m => m.update_text || m.image_url).map((milestone, idx) => (
                            <div key={idx} className="relative flex items-start space-x-4 z-10">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"><HardDriveUpload size={14} className="text-white"/></div>
                              <div className="p-4 bg-gray-50 rounded-md border flex-1">
                                <p className="text-xs font-semibold text-gray-500">{new Date(milestone.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="text-base font-semibold text-gray-700 mt-2">{milestone.name}</p>
                                <p className="text-gray-700 mt-1">{milestone.update_text}</p>
                                {milestone.image_url && <div onClick={() => setModalImage(milestone.image_url)} className="mt-3 rounded-lg w-full h-64 bg-cover bg-center cursor-pointer group relative" style={{ backgroundImage: `url(${milestone.image_url})` }}><div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ImageIcon size={32} className="text-white"/></div></div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <EscrowSummary contract={currentDetailedContract} />
                      <VerticalMilestoneTracker milestones={currentDetailedContract.milestones} onReleasePayment={handleReleasePayment} submittingMilestoneId={submittingMilestoneId} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentTabData.length === 0 ? <div className="text-center py-10 text-gray-500"><Inbox size={32} className="mx-auto mb-2" /><p>No ongoing contracts.</p></div>
                  : currentTabData.map((c) => <div key={c.id} onClick={() => setSelectedContract(c)} className="p-5 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-green-500 transition-all duration-200"><div className="flex justify-between items-start"><div><h3 className="font-bold text-lg text-green-700">{c.crop}</h3><p className="text-sm text-gray-500">with {c.farmer}</p></div><div className="text-right flex-shrink-0 ml-4"><p className="font-semibold text-lg text-gray-800">₹{c.totalValue.toLocaleString('en-IN')}</p><p className="text-sm text-gray-500 flex items-center justify-end"><CalendarDays size={14} className="mr-1.5" /> Due: {c.delivery}</p></div></div><div className="mt-4"><ProgressBar value={c.amountPaid} max={c.totalValue} colorClass="bg-green-500" label="Payment Progress" /></div></div>)}
                </div>
              )
            )}

            {/* Rejected Tab Logic */}
            {activeTab === 'rejected' && (
              selectedRejectedContract ? (
                // --- DETAIL VIEW for selected rejected contract ---
                <div>
                  <button onClick={() => setSelectedRejectedContract(null)} className="flex items-center text-red-700 font-semibold hover:underline mb-4">
                    <ArrowLeft size={18} className="mr-1" /> Back to All Rejected Proposals
                  </button>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="border-b pb-4 mb-4">
                        <h2 className="text-3xl font-bold text-gray-900">{selectedRejectedContract.listing?.crop_type || 'N/A'}</h2>
                        <p className="text-lg text-gray-600">with {selectedRejectedContract.farmer?.full_name || 'Unknown Farmer'}</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Last Proposed Value</p>
                            <p className="text-xl font-semibold text-gray-800">₹{(parseFloat(selectedRejectedContract.total_value) || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-md">
                           <h4 className="font-semibold text-red-800 flex items-center"><XCircle size={18} className="mr-2"/> Rejection Reason</h4>
                           <p className="text-red-700 mt-1">{selectedRejectedContract.rejection_reason || "No specific reason was provided."}</p>
                        </div>
                    </div>
                  </div>
                </div>
              ) : (
                // --- LIST VIEW for rejected contracts ---
                <div className="space-y-3">
                  {currentTabData.length === 0 ? <div className="text-center py-10 text-gray-500"><Inbox size={32} className="mx-auto mb-2" /><p>No contracts in this category.</p></div>
                  : currentTabData.map((contract) => (
                    <div key={contract.id} onClick={() => setSelectedRejectedContract(contract)} className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-red-500 cursor-pointer hover:shadow-md hover:border-red-600 transition-all">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{contract.listing?.crop_type || 'N/A'}</h3>
                        <p className="text-sm text-gray-500">with {contract.farmer?.full_name || 'Unknown Farmer'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            
            {/* Negotiating Tab Logic */}
            {activeTab === 'negotiating' && (
                <div className="space-y-3">
                    {currentTabData.length === 0 ? <div className="text-center py-10 text-gray-500"><Inbox size={32} className="mx-auto mb-2" /><p>No contracts in this category.</p></div>
                    : currentTabData.map((contract) => {
                        const isMyTurn = contract.last_offer_by === 'farmer';
                        return (
                            <div key={contract.id} className={`p-4 bg-white rounded-lg shadow-sm border-l-4 ${isMyTurn ? 'border-green-500' : 'border-yellow-500'}`}>
                                <div><h3 className="font-bold text-lg text-blue-700">{contract.listing?.crop_type}</h3><p className="text-sm text-gray-500">with {contract.farmer?.full_name}</p></div>
                                <div className="mt-4 border-t pt-4">
                                    {isMyTurn ? (
                                        <div>
                                            <p className="text-sm font-semibold text-green-700 mb-3">New offer received. Please review.</p>
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleAccept(contract.id)} className="flex-1 bg-green-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-green-700">Accept</button>
                                                <button onClick={() => handleReject(contract.id)} className="flex-1 bg-red-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-red-700">Reject</button>
                                                <button onClick={() => setSelectedNegotiation(contract)} className="flex-1 bg-gray-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-gray-700">Negotiate</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div><p className="text-sm font-semibold text-yellow-700 mb-3">Waiting for farmer to respond...</p><button onClick={() => setSelectedNegotiation(contract)} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Open Chat</button></div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
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
//                 const url = `http://localhost:8000/api/contracts/my-contracts?status=${status}`;
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
