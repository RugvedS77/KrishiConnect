// src/farmer_components/NegotiationChatModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../authStore';
import { X, Send, Loader2, Handshake } from 'lucide-react';
import { API_BASE_URL } from '../api/apiConfig';

const fetchNegotiationHistory = async (contractId, token) => {
    const response = await fetch(`${API_BASE_URL}/api/contracts/${contractId}/negotiation-history`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch chat history.");
    return await response.json();
};

export const updateOfferApi = async (contractId, offerData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/contracts/${contractId}/update-offer`, {
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

        let wsUrl;
                if (API_BASE_URL != 'http://localhost:8000') {
                    // We are in production (on Vercel)
                    // Replace 'https://' with 'wss://'
                    wsUrl = API_BASE_URL.replace(/^https:/i, 'wss:');
                } else {
                    // We are in local development
                    wsUrl = 'ws://localhost:8000';
                }
            
                // 2. Build the full URL
                const socketURL = `${wsUrl}/ws/negotiate/${proposal.id}/${user.id}`;
                console.log("Connecting to WebSocket at:", socketURL);

                

        const connect = async () => {
            try {
                const history = await fetchNegotiationHistory(proposal.id, token);
                setMessages(history);
                setLoadingHistory(false);

                const socket = new WebSocket(socketURL);
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
