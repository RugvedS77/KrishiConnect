// // src/farmer_components/NegotiationChatModal.jsx (New File)

// import React, { useState, useEffect, useRef } from 'react';
// import { useAuthStore } from '../authStore';
// import { X, Send, Loader2, ArrowDown, Handshake } from 'lucide-react';

// // --- API Helper for fetching chat history ---
// const fetchNegotiationHistory = async (contractId, token) => {
//     const response = await fetch(`http://localhost:8000/api/contracts/${contractId}/negotiation-history`, {
//         headers: { Authorization: `Bearer ${token}` },
//     });
//     if (!response.ok) {
//         throw new Error("Failed to fetch chat history.");
//     }
//     return await response.json();
// };

// export const updateOfferApi = async (contractId, offerData, token) => {
//     // offerData should be an object like: { price_per_unit_agreed: 150, quantity_proposed: 500 }
    
//     console.log(`Sending updated offer for contract ${contractId}:`, offerData);

//     const response = await fetch(`http://localhost:8000/api/contracts/${contractId}/update-offer`, {
//         method: "PUT", // PUT is standard for updating a resource's state
//         headers: { 
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}` 
//         },
//         body: JSON.stringify(offerData),
//     });

//     if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err.detail || "Failed to update the offer.");
//     }

//     return await response.json();
// };

// export default function NegotiationChatModal({ proposal, onClose, onOfferUpdated }) {
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [loadingHistory, setLoadingHistory] = useState(true);
//     const [error, setError] = useState(null);
    
//     // State for the offer form
//     const [showOfferForm, setShowOfferForm] = useState(false);
//     const [offerPrice, setOfferPrice] = useState(proposal.rawPrice); // Assumes you pass raw numbers in proposal object
//     const [offerQuantity, setOfferQuantity] = useState(proposal.rawQuantity);
//     const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

//     const token = useAuthStore((state) => state.token);
//     const user = useAuthStore((state) => state.user);

//         // --- KEY CHANGE: Use useRef for the WebSocket connection ---
//     // useRef will hold the socket object, and it won't trigger re-renders when it changes.
//     const socketRef = useRef(null);
//     const chatEndRef = useRef(null);

//     // -----------------------------

//     // Effect to scroll to the bottom of the chat
//     useEffect(() => {
//         chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     // --- KEY CHANGE: Restructured useEffect for correct async flow ---
//     useEffect(() => {
//         // Guard clause: Don't run if we don't have the necessary IDs
//         if (!user?.id || !proposal?.id) {
//             return;
//         }

//         // This function will establish the connection.
//         const connect = async () => {
//             try {
//                 // 1. FIRST, await the history fetch.
//                 const history = await fetchNegotiationHistory(proposal.id, token);
//                 setMessages(history);
//                 setLoadingHistory(false);

//                 // 2. ONLY AFTER history is loaded, create the WebSocket.
//                 const socket = new WebSocket(`ws://localhost:8000/ws/negotiate/${proposal.id}/${user.id}`);
//                 socketRef.current = socket; // Store it in the ref

//                 socket.onopen = () => console.log("WebSocket connected!");
//                 socket.onclose = () => console.log("WebSocket disconnected.");
//                 socket.onerror = () => setError("WebSocket error. Please refresh.");

//                 socket.onmessage = (event) => {
//                     const messageData = JSON.parse(event.data);
//                     setMessages(prevMessages => [...prevMessages, messageData]);
//                 };

//             } catch (err) {
//                 setError(err.message);
//                 setLoadingHistory(false);
//             }
//         };

//         connect(); // Call the async function to start the process.

//         // 3. The cleanup function remains the same. It runs when the component unmounts.
//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.close();
//                 socketRef.current = null;
//             }
//         };

//     }, [user, proposal.id, token]);


//     const handleSendMessage = (e) => {
//         e.preventDefault();
//         if (newMessage.trim() === '' || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
//             return;
//         }
        
//         const messagePayload = { message: newMessage };
//         socketRef.current.send(JSON.stringify(messagePayload));
//         setNewMessage('');
//     };


//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col">
//                 {/* Header */}
//                 <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
//                     <div>
//                         <h2 className="text-xl font-semibold text-gray-800">Negotiating with {proposal.buyerName}</h2>
//                         <p className="text-sm text-gray-500">For listing: {proposal.cropType}</p>
//                     </div>
//                     <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
//                         <X size={24} />
//                     </button>
//                 </header>

//                 {/* Chat Body */}
//                 <div className="p-4 flex-grow overflow-y-auto bg-gray-50 space-y-4">
//                     {loadingHistory && <div className="text-center"><Loader2 className="animate-spin inline-block" /></div>}
//                     {error && <div className="text-center text-red-600 p-4 bg-red-50 rounded-md">{error}</div>}
//                     {!loadingHistory && messages.map((msg, index) => (
//                         <div key={index} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
//                             <div className={`max-w-md p-3 rounded-lg ${msg.sender_id === user.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
//                                 <p className="text-sm">{msg.message}</p>
//                                 <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString()}</p>
//                             </div>
//                         </div>
//                     ))}
//                     <div ref={chatEndRef} />
//                 </div>

//                 {/* Footer / Input */}
//                 <footer className="p-4 border-t bg-white flex-shrink-0 space-y-3">
//                     {showOfferForm && (
//                         <form onSubmit={handleUpdateOffer} className="p-4 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600">New Price (per unit)</label>
//                                 <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
//                             </div>
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600">New Quantity</label>
//                                 <input type="number" value={offerQuantity} onChange={e => setOfferQuantity(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
//                             </div>
//                             <button type="submit" disabled={isSubmittingOffer} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center">
//                                 {isSubmittingOffer ? <Loader2 className="animate-spin" /> : "Send New Offer"}
//                             </button>
//                         </form>
//                     )}
//                     <div className="flex items-center space-x-3">
//                         <button onClick={() => setShowOfferForm(!showOfferForm)} className="p-2 border rounded-md hover:bg-gray-100" title="Update Offer">
//                             <Handshake size={20} className="text-gray-600" />
//                         </button>
//                         <form onSubmit={handleSendMessage} className="flex-grow flex items-center">
//                             <input
//                                 type="text"
//                                 value={newMessage}
//                                 onChange={(e) => setNewMessage(e.target.value)}
//                                 placeholder="Type your message..."
//                                 className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-green-500 focus:border-green-500"
//                             />
//                             <button type="submit" className="p-3 bg-green-600 text-white rounded-r-md hover:bg-green-700">
//                                 <Send size={20} />
//                             </button>
//                         </form>
//                     </div>
//                 </footer>
//             </div>
//         </div>
//     );
// }


// src/farmer_components/NegotiationChatModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../authStore';
import { X, Send, Loader2, Handshake } from 'lucide-react';

const fetchNegotiationHistory = async (contractId, token) => {
    const response = await fetch(`http://localhost:8000/api/contracts/${contractId}/negotiation-history`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch chat history.");
    return await response.json();
};

export const updateOfferApi = async (contractId, offerData, token) => {
    const response = await fetch(`http://localhost:8000/api/contracts/${contractId}/update-offer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(offerData),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to update the offer.");
    }
    return await response.json();
};

export default function NegotiationChatModal({ proposal, onClose, onOfferUpdated }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [error, setError] = useState(null);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [offerPrice, setOfferPrice] = useState(proposal.rawPrice || '');
    const [offerQuantity, setOfferQuantity] = useState(proposal.rawQuantity || '');
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);

    const socketRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!user?.id || !proposal?.id) return;

        const connect = async () => {
            try {
                const history = await fetchNegotiationHistory(proposal.id, token);
                setMessages(history);
                setLoadingHistory(false);

                const socket = new WebSocket(`ws://localhost:8000/ws/negotiate/${proposal.id}/${user.id}`);
                socketRef.current = socket;

                socket.onopen = () => console.log("WebSocket connected!");
                socket.onclose = () => console.log("WebSocket disconnected.");
                socket.onerror = () => setError("WebSocket error. Please refresh.");
                socket.onmessage = (event) => {
                    // const messageData = JSON.parse(event.data);
                    // setMessages(prev => [...prev, messageData]);

                    const messageData = JSON.parse(event.data);
                    setMessages(prev => {
                        // Prevent duplicates (e.g., same id & timestamp)
                        if (prev.some(m => m.id === messageData.id)) {
                        return prev;
                        }
                        return [...prev, messageData];
                    });
                };
            } catch (err) {
                setError(err.message);
                setLoadingHistory(false);
            }
        };
        connect();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [user, proposal.id, token]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        if (newMessage.trim() === '') return;

        socketRef.current.send(JSON.stringify({ message: newMessage }));
        setNewMessage('');
    };

    const handleUpdateOffer = async (e) => {
        e.preventDefault();
        setIsSubmittingOffer(true);
        try {
            await updateOfferApi(proposal.id, {
                price_per_unit_agreed: parseFloat(offerPrice),
                quantity_proposed: parseInt(offerQuantity),
            }, token);
            setShowOfferForm(false);
            onOfferUpdated();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmittingOffer(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">Negotiating with {proposal.buyerName}</h2>
                        <p className="text-sm text-gray-500">For listing: {proposal.cropType}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
                </header>

                <div className="p-4 flex-grow overflow-y-auto bg-gray-50 space-y-4">
                    {loadingHistory && <div className="text-center"><Loader2 className="animate-spin inline-block" /></div>}
                    {error && <div className="text-center text-red-600 p-4 bg-red-50 rounded-md">{error}</div>}
                    {!loadingHistory && messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-lg ${msg.sender_id === user?.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm">{msg.message}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <footer className="p-4 border-t space-y-3">
                    {showOfferForm && (
                        <form onSubmit={handleUpdateOffer} className="p-4 bg-blue-50 border border-blue-200 rounded-lg grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium">New Price</label>
                                <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium">New Quantity</label>
                                <input type="number" value={offerQuantity} onChange={e => setOfferQuantity(e.target.value)} className="w-full mt-1 p-2 border rounded-md" required />
                            </div>
                            <button type="submit" disabled={isSubmittingOffer} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                                {isSubmittingOffer ? <Loader2 className="animate-spin" /> : "Send New Offer"}
                            </button>
                        </form>
                    )}
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setShowOfferForm(!showOfferForm)} className="p-2 border rounded-md hover:bg-gray-100"><Handshake size={20} /></button>
                        <form onSubmit={handleSendMessage} className="flex-grow flex">
                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="w-full p-2 border rounded-l-md" />
                            <button type="submit" className="p-3 bg-green-600 text-white rounded-r-md"><Send size={20} /></button>
                        </form>
                    </div>
                </footer>
            </div>
        </div>
    );
}
